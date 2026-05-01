const User = require("../models/User");
const SearchHistory = require("../models/SearchHistory");
const Activity = require("../models/Activity");
const AuditLog = require("../models/AuditLog");
const mongoose = require("mongoose");

const logAdminAction = async ({ adminId, action, targetType = "system", targetId = null, details = {} }) => {
  try {
    await AuditLog.create({ adminId, action, targetType, targetId, details });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
};

// ──────────────────────────────────────────────
// 1. Dashboard Stats
// GET /api/admin/stats
// ──────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      totalSearches,
      todaySearches,
      newUsersThisWeek,
      activeUsersWeek,
      totalFavoritesAgg,
      searchesByDay,
    ] = await Promise.all([
      User.countDocuments(),
      SearchHistory.countDocuments(),
      SearchHistory.countDocuments({ createdAt: { $gte: todayStart } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Activity.distinct("userId", { createdAt: { $gte: sevenDaysAgo } }).then((ids) => ids.length),
      User.aggregate([
        { $project: { favCount: { $size: { $ifNull: ["$favorites", []] } } } },
        { $group: { _id: null, total: { $sum: "$favCount" } } },
      ]),
      // 30-day daily search counts for chart
      SearchHistory.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalFavorites = totalFavoritesAgg.length > 0 ? totalFavoritesAgg[0].total : 0;

    // Fill 30-day chart data
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyChart = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const found = searchesByDay.find((d) => d._id === dateStr);
      dailyChart.push({
        date: dateStr,
        day: days[date.getDay()],
        count: found ? found.count : 0,
      });
    }

    res.json({
      totalUsers,
      totalSearches,
      totalFavorites,
      todaySearches,
      newUsersThisWeek,
      activeUsersWeek,
      dailyChart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 2. Get All Users (paginated + searchable)
// GET /api/admin/users?page=1&limit=20&search=&sort=createdAt
// ──────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const sortField = req.query.sort || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    const query = search
      ? {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { mobileNo: { $regex: search, $options: "i" } },
            { name: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -favorites")
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    // Attach favorites count for each user
    const userIds = users.map((u) => u._id);
    const favCounts = await User.aggregate([
      { $match: { _id: { $in: userIds } } },
      { $project: { favCount: { $size: { $ifNull: ["$favorites", []] } } } },
    ]);
    const favMap = {};
    favCounts.forEach((f) => (favMap[f._id.toString()] = f.favCount));

    const enrichedUsers = users.map((u) => ({
      ...u,
      favoritesCount: favMap[u._id.toString()] || 0,
    }));

    res.json({
      users: enrichedUsers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 3. Get Single User Detail
// GET /api/admin/users/:id
// ──────────────────────────────────────────────
const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const [searchHistory, activityCount, recentActivity] = await Promise.all([
      SearchHistory.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20).lean(),
      Activity.countDocuments({ userId: user._id }),
      Activity.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    res.json({
      user,
      searchHistory,
      activityCount,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 4. Delete User (+ associated data)
// DELETE /api/admin/users/:id
// ──────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    // Remove all associated data
    await Promise.all([
      SearchHistory.deleteMany({ userId: user._id }),
      Activity.deleteMany({ userId: user._id }),
      User.findByIdAndDelete(user._id),
    ]);

    await logAdminAction({
      adminId: req.user._id,
      action: "user_deleted",
      targetType: "user",
      targetId: user._id,
      details: { username: user.username, mobileNo: user.mobileNo },
    });

    res.json({ message: "User and associated data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 5. Toggle Admin Role
// PUT /api/admin/users/:id/role
// ──────────────────────────────────────────────
const toggleAdminRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent self-demotion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot change your own admin role" });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    await logAdminAction({
      adminId: req.user._id,
      action: user.isAdmin ? "user_promoted_to_admin" : "admin_demoted_to_user",
      targetType: "user",
      targetId: user._id,
      details: { username: user.username, isAdmin: user.isAdmin },
    });

    res.json({
      _id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
      message: user.isAdmin ? "User promoted to admin" : "Admin demoted to regular user",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 6. Get All Searches (platform-wide, paginated)
// GET /api/admin/searches?page=1&limit=20
// ──────────────────────────────────────────────
const getAllSearches = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [searches, total] = await Promise.all([
      SearchHistory.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "username mobileNo name")
        .lean(),
      SearchHistory.countDocuments(),
    ]);

    res.json({
      searches,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 7. Delete a Search Entry
// DELETE /api/admin/searches/:id
// ──────────────────────────────────────────────
const deleteSearch = async (req, res) => {
  try {
    const search = await SearchHistory.findByIdAndDelete(req.params.id);
    if (!search) return res.status(404).json({ message: "Search entry not found" });

    await logAdminAction({
      adminId: req.user._id,
      action: "search_deleted",
      targetType: "search",
      targetId: search._id,
      details: { ownerId: search.userId, matchesCount: search.matchesCount || 0 },
    });

    res.json({ message: "Search entry deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 8. Platform Activity Overview (30-day chart)
// GET /api/admin/activity
// ──────────────────────────────────────────────
const getPlatformActivity = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activities = await Activity.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          searches: { $sum: { $cond: [{ $eq: ["$type", "search"] }, 1, 0] } },
          tryons: { $sum: { $cond: [{ $eq: ["$type", "tryon"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyChart = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const found = activities.find((a) => a._id === dateStr);
      dailyChart.push({
        date: dateStr,
        day: days[date.getDay()],
        count: found ? found.count : 0,
        searches: found ? found.searches : 0,
        tryons: found ? found.tryons : 0,
      });
    }

    const totalActivity = await Activity.countDocuments();

    res.json({ dailyChart, totalActivity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 9. Recent Activity Feed (all users)
// GET /api/admin/activity/recent?limit=20
// ──────────────────────────────────────────────
const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "username name")
      .lean();

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 10. Alerts for Notification Center
// GET /api/admin/alerts
// ──────────────────────────────────────────────
const getAdminAlerts = async (req, res) => {
  try {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [newUsers24h, searches24h, activeUsers7d] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: yesterday } }),
      SearchHistory.countDocuments({ createdAt: { $gte: yesterday } }),
      Activity.distinct("userId", { createdAt: { $gte: sevenDaysAgo } }).then((ids) => ids.length),
    ]);

    const alerts = [];
    if (searches24h === 0) {
      alerts.push({ level: "warning", code: "no_searches_24h", message: "No searches recorded in the last 24 hours." });
    }
    if (newUsers24h === 0) {
      alerts.push({ level: "info", code: "no_new_users_24h", message: "No new users signed up in the last 24 hours." });
    }
    if (activeUsers7d < 5) {
      alerts.push({ level: "warning", code: "low_active_users", message: "Low active users in last 7 days." });
    }

    res.json({ alerts, metrics: { newUsers24h, searches24h, activeUsers7d } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 11. Global Admin Search
// GET /api/admin/search?q=...
// ──────────────────────────────────────────────
const globalAdminSearch = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ users: [], searches: [], activity: [] });

    const regex = new RegExp(q, "i");

    const [users, searches, activity] = await Promise.all([
      User.find({
        $or: [{ username: regex }, { name: regex }, { mobileNo: regex }],
      })
        .select("username name mobileNo isAdmin createdAt uploadsCount")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      SearchHistory.find({ $or: [{ imageUrl: regex }, { "matches.name": regex }, { "matches.source": regex }] })
        .select("userId imageUrl matchesCount createdAt")
        .populate("userId", "username name")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Activity.find({ $or: [{ type: regex }] })
        .select("userId type metadata createdAt")
        .populate("userId", "username name")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    res.json({ users, searches, activity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 12. Audit Logs
// GET /api/admin/audit?limit=30
// ──────────────────────────────────────────────
const getAuditLogs = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const query = {};
    if (req.query.action) query.action = { $regex: req.query.action, $options: "i" };
    if (req.query.adminId) query.adminId = req.query.adminId;
    if (req.query.from || req.query.to) {
      query.createdAt = {};
      if (req.query.from) query.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) {
        const end = new Date(req.query.to);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("adminId", "username name")
      .lean();

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkUserAction = async (req, res) => {
  try {
    const { action, userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "userIds are required" });
    }

    const safeIds = userIds.filter((id) => id && id !== req.user._id.toString());
    if (safeIds.length === 0) {
      return res.status(400).json({ message: "No valid users to process" });
    }

    if (action === "delete") {
      await Promise.all([
        SearchHistory.deleteMany({ userId: { $in: safeIds } }),
        Activity.deleteMany({ userId: { $in: safeIds } }),
        User.deleteMany({ _id: { $in: safeIds } }),
      ]);
    } else if (action === "promote" || action === "demote") {
      await User.updateMany({ _id: { $in: safeIds } }, { $set: { isAdmin: action === "promote" } });
    } else {
      return res.status(400).json({ message: "Unsupported action" });
    }

    await logAdminAction({
      adminId: req.user._id,
      action: `bulk_${action}`,
      targetType: "user",
      details: { count: safeIds.length },
    });

    res.json({ message: `Bulk ${action} completed`, affected: safeIds.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkSearchDelete = async (req, res) => {
  try {
    const { searchIds } = req.body;
    if (!Array.isArray(searchIds) || searchIds.length === 0) {
      return res.status(400).json({ message: "searchIds are required" });
    }

    const result = await SearchHistory.deleteMany({ _id: { $in: searchIds } });
    await logAdminAction({
      adminId: req.user._id,
      action: "bulk_search_delete",
      targetType: "search",
      details: { count: result.deletedCount || 0 },
    });

    res.json({ message: "Bulk search delete completed", affected: result.deletedCount || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSystemHealth = async (req, res) => {
  try {
    const now = new Date();
    const dayAgo = new Date(now);
    dayAgo.setDate(dayAgo.getDate() - 1);

    const [searches24h, activity24h, users24h, latestSearch, latestActivity] = await Promise.all([
      SearchHistory.countDocuments({ createdAt: { $gte: dayAgo } }),
      Activity.countDocuments({ createdAt: { $gte: dayAgo } }),
      User.countDocuments({ createdAt: { $gte: dayAgo } }),
      SearchHistory.findOne().sort({ createdAt: -1 }).select("createdAt").lean(),
      Activity.findOne().sort({ createdAt: -1 }).select("createdAt").lean(),
    ]);

    const dbStateMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    res.json({
      database: dbStateMap[mongoose.connection.readyState] || "unknown",
      metrics: {
        searches24h,
        activity24h,
        users24h,
        latestSearchAt: latestSearch?.createdAt || null,
        latestActivityAt: latestActivity?.createdAt || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserDetail,
  deleteUser,
  toggleAdminRole,
  getAllSearches,
  deleteSearch,
  getPlatformActivity,
  getRecentActivity,
  getAdminAlerts,
  globalAdminSearch,
  getAuditLogs,
  bulkUserAction,
  bulkSearchDelete,
  getSystemHealth,
};

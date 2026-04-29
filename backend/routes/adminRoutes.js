const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminProtect } = require("../middleware/adminMiddleware");
const {
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
} = require("../controllers/adminController");

// All admin routes require authentication + admin role
router.use(protect, adminProtect);

// Dashboard
router.get("/stats", getDashboardStats);
router.get("/alerts", getAdminAlerts);
router.get("/search", globalAdminSearch);
router.get("/audit", getAuditLogs);
router.get("/system-health", getSystemHealth);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetail);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", toggleAdminRole);
router.post("/users/bulk-action", bulkUserAction);

// Searches
router.get("/searches", getAllSearches);
router.delete("/searches/:id", deleteSearch);
router.post("/searches/bulk-delete", bulkSearchDelete);

// Activity
router.get("/activity", getPlatformActivity);
router.get("/activity/recent", getRecentActivity);

module.exports = router;

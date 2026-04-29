const User = require("../models/User");

const parsePrice = (value) => {
  const numeric = parseFloat(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
};

const getWardrobe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("wardrobeItems");
    res.json(user?.wardrobeItems || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addWardrobeItem = async (req, res) => {
  try {
    const { name, category, imageUrl, tags } = req.body;
    if (!name) return res.status(400).json({ message: "name is required" });

    const user = await User.findById(req.user._id);
    user.wardrobeItems.push({
      name,
      category: category || "other",
      imageUrl: imageUrl || "",
      tags: Array.isArray(tags) ? tags : [],
    });
    await user.save();
    res.status(201).json(user.wardrobeItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeWardrobeItem = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wardrobeItems = user.wardrobeItems.filter((w) => w._id.toString() !== req.params.id);
    await user.save();
    res.json(user.wardrobeItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("notifications");
    const notifications = [...(user?.notifications || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const note = user.notifications.id(req.params.id);
    if (!note) return res.status(404).json({ message: "Notification not found" });
    note.isRead = true;
    await user.save();
    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.notifications.forEach((n) => {
      n.isRead = true;
    });
    await user.save();
    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const runPriceAlertCheck = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let generated = 0;

    user.favorites.forEach((fav) => {
      const target = parsePrice(fav.priceAlertTarget);
      const current = parsePrice(fav.price);
      if (!target || !current) return;
      if (current <= target) {
        user.notifications.push({
          type: "price-drop",
          message: `Price alert hit for ${fav.name || "saved item"} (${fav.price || "N/A"})`,
          metadata: { favoriteId: fav._id, target: fav.priceAlertTarget, current: fav.price },
        });
        generated += 1;
      }
    });

    if (generated === 0) {
      user.notifications.push({
        type: "info",
        message: "Price check completed. No items reached your alert target yet.",
      });
    }

    await user.save();
    res.json({ generated, notifications: user.notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWardrobe,
  addWardrobeItem,
  removeWardrobeItem,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  runPriceAlertCheck,
};

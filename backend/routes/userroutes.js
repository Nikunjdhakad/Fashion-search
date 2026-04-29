const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  getUsers,
  getUserProfile,
} = require("../controllers/userController");
const {
  updateProfile,
  getSavedFilters,
  addSavedFilter,
  deleteSavedFilter,
  exportUserData,
  deleteAccount,
} = require("../controllers/profileController");
const {
  getWardrobe,
  addWardrobeItem,
  removeWardrobeItem,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  runPriceAlertCheck,
} = require("../controllers/userFeaturesController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", createUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteAccount);
router.get("/saved-filters", protect, getSavedFilters);
router.post("/saved-filters", protect, addSavedFilter);
router.delete("/saved-filters/:id", protect, deleteSavedFilter);
router.get("/export-data", protect, exportUserData);
router.get("/wardrobe", protect, getWardrobe);
router.post("/wardrobe", protect, addWardrobeItem);
router.delete("/wardrobe/:id", protect, removeWardrobeItem);
router.get("/notifications", protect, getNotifications);
router.put("/notifications/:id/read", protect, markNotificationRead);
router.post("/notifications/mark-all-read", protect, markAllNotificationsRead);
router.post("/price-alerts/check", protect, runPriceAlertCheck);
router.get("/", protect, getUsers);

module.exports = router;
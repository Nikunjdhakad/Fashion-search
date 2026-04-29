const User = require("../models/User");
const bcrypt = require("bcryptjs");
const SearchHistory = require("../models/SearchHistory");
const Activity = require("../models/Activity");

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields
    const { name, email, stylePreference, fitPreference, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (stylePreference) user.stylePreference = stylePreference;
    if (fitPreference) user.fitPreference = fitPreference;

    // If password is provided, validate strength and update (will be hashed by pre-save hook)
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      if (!/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return res.status(400).json({ message: "Password must contain at least one number or special character" });
      }
      user.password = password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      mobileNo: updatedUser.mobileNo,
      email: updatedUser.email,
      name: updatedUser.name,
      stylePreference: updatedUser.stylePreference,
      fitPreference: updatedUser.fitPreference,
      styleLevel: updatedUser.styleLevel,
      uploadsCount: updatedUser.uploadsCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSavedFilters = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("savedFilters");
    res.json(user?.savedFilters || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addSavedFilter = async (req, res) => {
  try {
    const { name, filters } = req.body;
    if (!name || !filters) {
      return res.status(400).json({ message: "name and filters are required" });
    }
    const user = await User.findById(req.user._id);
    user.savedFilters.push({ name, filters });
    await user.save();
    res.status(201).json(user.savedFilters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSavedFilter = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedFilters = user.savedFilters.filter((f) => f._id.toString() !== req.params.id);
    await user.save();
    res.json(user.savedFilters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportUserData = async (req, res) => {
  try {
    const [user, history, activity] = await Promise.all([
      User.findById(req.user._id).select("-password").lean(),
      SearchHistory.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean(),
      Activity.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean(),
    ]);

    res.json({
      exportedAt: new Date().toISOString(),
      user,
      history,
      activity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    await Promise.all([
      SearchHistory.deleteMany({ userId: req.user._id }),
      Activity.deleteMany({ userId: req.user._id }),
      User.findByIdAndDelete(req.user._id),
    ]);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateProfile, getSavedFilters, addSavedFilter, deleteSavedFilter, exportUserData, deleteAccount };

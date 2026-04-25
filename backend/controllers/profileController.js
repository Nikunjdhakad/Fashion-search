const User = require("../models/User");
const bcrypt = require("bcryptjs");

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

module.exports = { updateProfile };

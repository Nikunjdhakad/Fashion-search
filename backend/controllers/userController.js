const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Create User
const createUser = async (req, res) => {
  try {
    const { username, mobileNo, password, email, name } = req.body;

    // Validate password strength
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one number or special character" });
    }

    // Check if user exists
    const userExists = await User.findOne({ mobileNo });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this mobile number" });
    }

    const user = await User.create({
      username,
      mobileNo,
      password,
      email,
      name
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        mobileNo: user.mobileNo,
        email: user.email,
        name: user.name,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { mobileNo, password } = req.body;
    const user = await User.findOne({ mobileNo });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        mobileNo: user.mobileNo,
        email: user.email,
        name: user.name,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid mobile number or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        mobileNo: user.mobileNo,
        email: user.email,
        name: user.name,
        styleLevel: user.styleLevel,
        uploadsCount: user.uploadsCount,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createUser, loginUser, getUsers, getUserProfile };
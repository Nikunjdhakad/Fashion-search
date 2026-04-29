const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const favoriteSchema = new mongoose.Schema({
  imageUrl: String,
  name: String,
  shopLink: String,
  price: String,
  matchScore: Number,
  description: String,
  tags: [String],
  folder: { type: String, default: "General" },
  note: { type: String, default: "" },
  priceAlertTarget: { type: String, default: "" },
  savedAt: { type: Date, default: Date.now },
});

const savedFilterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    filters: {
      minPrice: { type: Number, default: 0 },
      maxPrice: { type: Number, default: 100000 },
      minMatchScore: { type: Number, default: 0 },
      sortBy: { type: String, default: "match" },
      tag: { type: String, default: "" },
    },
  },
  { _id: true, timestamps: true }
);

const wardrobeItemSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "other" },
    tags: [{ type: String }],
  },
  { _id: true, timestamps: true }
);

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String, default: "info" },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    mobileNo: {
      type: String,
      required: [true, "Please add a mobile number"],
      unique: true,
    },
    username: {
      type: String,
      required: [true, "Please add a username"],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    stylePreference: {
      type: String,
      enum: ["minimalist", "streetwear", "vintage", "formal", "casual", ""],
      default: "",
    },
    fitPreference: {
      type: String,
      enum: ["slim", "regular", "relaxed", ""],
      default: "",
    },
    styleLevel: {
      type: String,
      default: "Fashion Forward",
    },
    uploadsCount: {
      type: Number,
      default: 0,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    favorites: [favoriteSchema],
    savedFilters: [savedFilterSchema],
    wardrobeItems: [wardrobeItemSchema],
    notifications: [notificationSchema],
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
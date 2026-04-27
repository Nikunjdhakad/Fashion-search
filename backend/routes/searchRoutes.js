const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { visualSearch } = require("../controllers/searchController");
const { generateTryOn } = require("../controllers/tryonController");

// Multer config with file validation
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Define Visual Search endpoint
router.post("/visual", optionalAuth, upload.single("image"), visualSearch);

// Define Try-on endpoint (JSON body instead of multer stream)
router.post("/try-on", protect, generateTryOn);


module.exports = router;

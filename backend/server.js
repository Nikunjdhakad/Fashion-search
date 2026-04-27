const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const validateEnv = require("./config/validateEnv");

dotenv.config();

// Validate environment variables before anything else
validateEnv();

// Connect to MongoDB
connectDB();

const app = express();

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Custom NoSQL injection sanitizer (express-mongo-sanitize is incompatible with Express 5)
function sanitizeObject(obj) {
  if (obj && typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        sanitizeObject(obj[key]);
      }
    }
  }
  return obj;
}

function mongoSanitize(req, res, next) {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  next();
}

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(limiter);
app.use(mongoSanitize); // Prevent NoSQL injection

// Routes
app.use("/api/users", require("./routes/userroutes"));
app.use("/api/search", require("./routes/searchRoutes"));
app.use("/api/activity", require("./routes/activityRoutes"));
app.use("/api/favorites", require("./routes/favoritesRoutes"));
app.use("/api/history", require("./routes/historyRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/compare", require("./routes/priceCompareRoutes"));

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Global error handler — catches multer & other unhandled errors as JSON
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "File too large. Maximum size is 10MB." });
  }
  if (err.message?.includes("Invalid file type")) {
    return res.status(400).json({ message: err.message });
  }
  console.error("Unhandled Error:", err.message);
  res.status(500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

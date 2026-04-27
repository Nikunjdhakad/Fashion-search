const express = require("express");
const router = express.Router();
const { optionalAuth } = require("../middleware/authMiddleware");
const { comparePrices } = require("../controllers/priceCompareController");

// POST /api/compare - Get price comparison for a product
router.post("/", optionalAuth, comparePrices);

module.exports = router;

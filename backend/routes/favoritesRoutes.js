const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getFavorites,
  addFavorite,
  updateFavorite,
  removeFavorite,
} = require("../controllers/favoritesController");

router.get("/", protect, getFavorites);
router.post("/", protect, addFavorite);
router.put("/:id", protect, updateFavorite);
router.delete("/:id", protect, removeFavorite);

module.exports = router;

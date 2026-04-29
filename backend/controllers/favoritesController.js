const User = require("../models/User");

// Get all favorites for current user
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("favorites");
    res.json(user.favorites || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a favorite
const addFavorite = async (req, res) => {
  try {
    const { imageUrl, name, shopLink, price, matchScore, description, tags, folder, note, priceAlertTarget } =
      req.body;

    if (!imageUrl || !name) {
      return res
        .status(400)
        .json({ message: "imageUrl and name are required" });
    }

    const user = await User.findById(req.user._id);

    // Check for duplicates by shopLink or imageUrl
    const alreadyExists = user.favorites.some(
      (fav) => fav.imageUrl === imageUrl || (shopLink && fav.shopLink === shopLink)
    );

    if (alreadyExists) {
      return res.status(400).json({ message: "Already in favorites" });
    }

    user.favorites.push({
      imageUrl,
      name,
      shopLink,
      price,
      matchScore,
      description,
      tags,
      folder: folder || "General",
      note: note || "",
      priceAlertTarget: priceAlertTarget || "",
      savedAt: new Date(),
    });

    await user.save();
    res.status(201).json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFavorite = async (req, res) => {
  try {
    const { folder, note, priceAlertTarget } = req.body;
    const user = await User.findById(req.user._id);
    const fav = user.favorites.id(req.params.id);

    if (!fav) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    if (folder !== undefined) fav.folder = folder || "General";
    if (note !== undefined) fav.note = note;
    if (priceAlertTarget !== undefined) fav.priceAlertTarget = priceAlertTarget;

    await user.save();
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a favorite by its _id
const removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.favorites = user.favorites.filter(
      (fav) => fav._id.toString() !== req.params.id
    );

    await user.save();
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFavorites, addFavorite, updateFavorite, removeFavorite };

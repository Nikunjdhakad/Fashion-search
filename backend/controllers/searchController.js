const cloudinary = require("../config/cloudinary");
const axios = require("axios");
const sharp = require("sharp");
const { logActivity } = require("./activityController");
const { saveSearchHistory } = require("./historyController");
const User = require("../models/User");

// List of reputable e-commerce domains to filter for
const REPUTABLE_DOMAINS = [
  "amazon.in", "amazon.com", "flipkart.com", "myntra.com", "meesho.com",
  "ajio.com", "nykaa.com", "zara.com", "hm.com", "asos.com", "shein.com",
  "nike.com", "adidas.com", "puma.com", "ebay.com", "etsy.com",
  "limeroad.com", "bewakoof.com", "urbanic.com", "tatacliq.com",
  "snapdeal.com", "shopclues.com", "koovs.com", "pantaloons.com",
  "maxfashion.com", "lifestylestores.com", "shoppersstop.com",
];

// Core orchestration method
const visualSearch = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided for search" });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." });
    }

    // 1. Compress image with sharp before uploading to Cloudinary
    let imageBuffer = req.file.buffer;
    try {
      imageBuffer = await sharp(req.file.buffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch (compressErr) {
      console.warn("Image compression skipped:", compressErr.message);
    }

    // 2. Upload to Cloudinary
    const b64 = Buffer.from(imageBuffer).toString("base64");
    const dataURI = "data:image/jpeg;base64," + b64;

    const cldRes = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
    });

    const imageUrl = cldRes.secure_url;

    // 3. Query SerpApi Google Lens
    console.log("Analyzing uploaded image via Google Lens:", imageUrl);
    const serpApiKey = process.env.SERPAPI_KEY;

    if (!serpApiKey) {
      return res.status(500).json({ message: "SERPAPI_KEY is missing from environment variables." });
    }

    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_lens",
        url: imageUrl,
        api_key: serpApiKey,
      },
    });

    const visualMatches = response.data.visual_matches || [];

    // 4. Filter matches to only include reputable e-commerce sites
    const filteredMatches = visualMatches.filter((match) => {
      const link = (match.link || "").toLowerCase();
      const source = (match.source || "").toLowerCase();

      return REPUTABLE_DOMAINS.some(
        (domain) =>
          link.includes(domain) || source.includes(domain.split(".")[0])
      );
    });

    // Fallback: remove social media if no reputable matches found
    const finalMatches =
      filteredMatches.length > 0
        ? filteredMatches
        : visualMatches.filter((match) => {
            const link = (match.link || "").toLowerCase();
            return (
              !link.includes("facebook.com") &&
              !link.includes("instagram.com") &&
              !link.includes("pinterest.com")
            );
          });

    // 5. Format the final matches for the frontend
    const formattedMatches = finalMatches.slice(0, 12).map((match, index) => {
      let priceStr = "";
      if (match.price) {
        priceStr = match.price.extracted_value
          ? `₹${match.price.extracted_value}`
          : match.price.currency + match.price.value;
      }

      return {
        id: match.position || index,
        name: match.title,
        matchScore: 99 - index * 2,
        imageUrl: match.thumbnail,
        description: `${match.source || "Verified Store"} • ${priceStr || "Visit Site"}`,
        tags: [match.source || "Shop", "Premium"],
        shopLink: match.link,
        price: priceStr,
      };
    });

    const itemsDetected =
      finalMatches.length > 0 ? (finalMatches.length > 5 ? 3 : 1) : 0;

    // 6. Log activity and save search history (only for logged-in users)
    if (req.user) {
      await Promise.all([
        logActivity(req.user._id, "search", {
          imageUrl,
          matchesCount: formattedMatches.length,
        }),
        saveSearchHistory(req.user._id, imageUrl, formattedMatches),
      ]);

      // 7. Increment user upload count
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { uploadsCount: 1 },
      });
    }

    res.json({
      uploadUrl: imageUrl,
      itemsDetected,
      matches: formattedMatches,
    });
  } catch (error) {
    console.error("Search Error Details:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack,
    });

    // Provide specific error messages based on the failure type
    let userMessage = "Visual Search failed.";
    if (error.response?.status === 401 || error.response?.status === 403) {
      userMessage = "Visual Search failed. API key is invalid or expired.";
    } else if (error.response?.status === 429) {
      userMessage = "API rate limit exceeded. Please try again in a few minutes.";
    } else if (error.message?.includes("timeout") || error.code === "ECONNABORTED") {
      userMessage = "Search timed out. Please try again with a smaller image.";
    } else if (error.message?.includes("Cloudinary") || error.message?.includes("upload")) {
      userMessage = "Image upload failed. Please try a different image.";
    } else if (error.message?.includes("SERPAPI") || error.message?.includes("serpapi")) {
      userMessage = "Search service temporarily unavailable. Please try again.";
    } else {
      userMessage = `Visual Search failed: ${error.message}`;
    }

    res.status(500).json({
      message: userMessage,
      error: error.message,
    });
  }
};

module.exports = {
  visualSearch,
};


const axios = require("axios");

// Search Google Shopping for a product and return store-wise prices
const comparePrices = async (req, res) => {
  try {
    const { productName } = req.body;

    if (!productName || productName.trim().length < 3) {
      return res.status(400).json({ message: "Product name is required." });
    }

    const serpApiKey = process.env.SERPAPI_KEY;
    if (!serpApiKey) {
      return res.status(500).json({ message: "Search API key is missing." });
    }

    console.log("Price compare for:", productName.trim());

    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_shopping",
        q: productName.trim(),
        api_key: serpApiKey,
        gl: "in",
        hl: "en",
        num: 15,
      },
    });

    const results = response.data.shopping_results || [];

    // Build store listings sorted by price
    const listings = [];
    for (const item of results) {
      let price = null;
      if (item.extracted_price) {
        price = item.extracted_price;
      } else if (item.price) {
        const num = parseFloat(String(item.price).replace(/[^0-9.]/g, ""));
        if (!isNaN(num)) price = num;
      }

      if (price === null) continue; // Skip items without price

      listings.push({
        store: item.source || "Store",
        price,
        priceFormatted: `₹${price.toLocaleString("en-IN")}`,
        productName: item.title || productName,
        link: item.link || "",
        thumbnail: item.thumbnail || "",
        rating: item.rating || null,
        reviews: item.reviews || null,
        delivery: item.delivery || null,
      });
    }

    // Sort by price ascending
    listings.sort((a, b) => a.price - b.price);

    // Take top 8 unique stores
    const seen = new Set();
    const unique = [];
    for (const l of listings) {
      const key = l.store.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(l);
      }
      if (unique.length >= 8) break;
    }

    res.json({
      query: productName.trim(),
      count: unique.length,
      stores: unique,
    });
  } catch (error) {
    console.error("Price compare error:", error.message);
    res.status(500).json({ message: "Price comparison failed." });
  }
};

module.exports = { comparePrices };

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Loader2, X, TrendingDown, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/config";
import { useAppContext } from "@/context/AppContext";

// Store brand colors for known platforms
const STORE_COLORS = {
  amazon: { bg: "#FF9900", text: "#fff", label: "Amazon" },
  flipkart: { bg: "#2874F0", text: "#fff", label: "Flipkart" },
  myntra: { bg: "#FF3F6C", text: "#fff", label: "Myntra" },
  ajio: { bg: "#3B3B3B", text: "#fff", label: "AJIO" },
  meesho: { bg: "#570A57", text: "#fff", label: "Meesho" },
  nykaa: { bg: "#FC2779", text: "#fff", label: "Nykaa" },
  snapdeal: { bg: "#E40046", text: "#fff", label: "Snapdeal" },
  tatacliq: { bg: "#6C3D96", text: "#fff", label: "Tata CLiQ" },
  shopclues: { bg: "#0460A9", text: "#fff", label: "ShopClues" },
  limeroad: { bg: "#E83E8C", text: "#fff", label: "LimeRoad" },
  bewakoof: { bg: "#FDD835", text: "#000", label: "Bewakoof" },
  zara: { bg: "#000", text: "#fff", label: "Zara" },
  hm: { bg: "#E50010", text: "#fff", label: "H&M" },
  nike: { bg: "#111", text: "#fff", label: "Nike" },
  adidas: { bg: "#000", text: "#fff", label: "Adidas" },
  puma: { bg: "#000", text: "#fff", label: "Puma" },
  ebay: { bg: "#E53238", text: "#fff", label: "eBay" },
  etsy: { bg: "#F1641E", text: "#fff", label: "Etsy" },
  jiomart: { bg: "#0078AD", text: "#fff", label: "JioMart" },
  firstcry: { bg: "#049CD8", text: "#fff", label: "FirstCry" },
  pantaloons: { bg: "#2E3092", text: "#fff", label: "Pantaloons" },
  shoppersstop: { bg: "#000", text: "#fff", label: "Shoppers Stop" },
};

function getStoreStyle(storeName) {
  const lower = storeName.toLowerCase();
  for (const [key, value] of Object.entries(STORE_COLORS)) {
    if (lower.includes(key)) return value;
  }
  // Default style based on name hash for consistent color
  const hash = storeName.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = hash % 360;
  return { bg: `hsl(${hue}, 55%, 45%)`, text: "#fff", label: storeName };
}

export default function PriceCompareSidebar({ product, onClose }) {
  const { user } = useAppContext();
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!product?.name) return;

    const fetchPrices = async () => {
      setIsLoading(true);
      setError(null);
      setStores([]);
      try {
        const headers = { "Content-Type": "application/json" };
        if (user?.token) headers.Authorization = `Bearer ${user.token}`;

        const res = await fetch(`${API_BASE_URL}/api/compare`, {
          method: "POST",
          headers,
          body: JSON.stringify({ productName: product.name }),
        });

        if (!res.ok) throw new Error("Failed to fetch prices");
        const data = await res.json();
        setStores(data.stores || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, [product?.name, product?.id]);

  if (!product) return null;

  const cheapest = stores.length > 0 ? stores[0].price : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full lg:w-[340px] xl:w-[370px] shrink-0"
    >
      <div className="sticky top-[8.5rem] rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card/80">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-emerald-500" />
            <h3 className="font-bold text-sm tracking-tight">Price Comparison</h3>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Selected Product */}
        <div className="px-4 py-3 border-b border-border/20 bg-muted/10">
          <div className="flex gap-2.5">
            <div className="h-12 w-10 rounded-lg overflow-hidden border border-border/40 shrink-0 bg-muted/20">
              <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-snug line-clamp-2">{product.name}</p>
              {product.price && (
                <p className="text-[11px] text-muted-foreground mt-0.5">Listed: <span className="font-bold text-foreground">{product.price}</span></p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[450px] overflow-y-auto">
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 px-4 gap-3">
              <Loader2 className="h-7 w-7 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground text-center">Searching prices across stores...</p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 px-4 gap-2">
              <AlertCircle className="h-7 w-7 text-destructive/50" />
              <p className="text-xs text-muted-foreground text-center">Could not fetch prices</p>
            </div>
          )}

          {/* No results */}
          {!isLoading && !error && stores.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 gap-2">
              <p className="text-xs text-muted-foreground text-center">No store listings found</p>
            </div>
          )}

          {/* Store Listings */}
          {!isLoading && stores.length > 0 && (
            <div className="divide-y divide-border/20">
              {stores.map((store, idx) => {
                const style = getStoreStyle(store.store);
                const isBest = store.price === cheapest && stores.length >= 2;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors ${isBest ? "bg-emerald-500/5" : ""}`}
                  >
                    {/* Store Badge */}
                    <div
                      className="h-11 w-[70px] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/10"
                      style={{ background: style.bg }}
                    >
                      <span
                        className="text-[10px] font-extrabold leading-tight text-center px-1 truncate"
                        style={{ color: style.text }}
                      >
                        {style.label}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-lg font-bold tracking-tight ${isBest ? "text-emerald-500" : ""}`}>
                        {store.priceFormatted}
                      </p>
                      {isBest && (
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Best Price</span>
                      )}
                    </div>

                    {/* Buy Now Button */}
                    <a
                      href={store.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <button className="h-9 px-4 rounded-full bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white text-[11px] font-bold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105 flex items-center gap-1.5 uppercase tracking-wide">
                        Buy Now
                        <ExternalLink className="h-3 w-3 opacity-70" />
                      </button>
                    </a>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer summary */}
        {!isLoading && stores.length >= 2 && (
          <div className="px-4 py-2.5 border-t border-border/30 bg-emerald-500/5">
            <p className="text-[11px] text-muted-foreground text-center">
              💰 Cheapest at <span className="font-bold text-foreground">{stores[0]?.store}</span>
              {stores.length > 1 && stores[stores.length - 1].price > stores[0].price && (
                <> · Save <span className="font-bold text-emerald-500">
                  ₹{Math.round(stores[stores.length - 1].price - stores[0].price).toLocaleString("en-IN")}
                </span></>
              )}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

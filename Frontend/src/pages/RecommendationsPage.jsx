import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Upload, ArrowRight, ExternalLink, Search, Sparkles, Filter, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import AuthPromptModal from "@/components/AuthPromptModal";
import PriceCompareSidebar from "@/components/PriceCompareSidebar";
import usePageTitle from "@/hooks/usePageTitle";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function RecommendationsPage() {
  usePageTitle("Style Matches");
  const { recommendations, latestUpload, addFavorite, removeFavorite, favorites, user } = useAppContext();
  const outfits = recommendations?.length > 0 ? recommendations : [];
  const [savingId, setSavingId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState("continue");
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const requireAuth = (actionLabel) => {
    if (!user) {
      setAuthAction(actionLabel);
      setShowAuthModal(true);
      return true;
    }
    return false;
  };

  const handleFavorite = async (e, outfit) => {
    e.stopPropagation();
    if (requireAuth("save to favorites")) return;
    setSavingId(outfit.id);

    const existing = getFavoriteEntry(outfit);
    if (existing) {
      await removeFavorite(existing._id);
    } else {
      await addFavorite({
        imageUrl: outfit.imageUrl,
        name: outfit.name,
        shopLink: outfit.shopLink,
        price: outfit.price,
        matchScore: outfit.matchScore,
        description: outfit.description,
        tags: outfit.tags,
      });
    }
    setSavingId(null);
  };

  const handleShopClick = (e, outfit) => {
    e.stopPropagation();
    if (requireAuth("shop this look")) {
      e.preventDefault();
    }
  };

  const getFavoriteEntry = (outfit) => {
    return favorites.find(
      (fav) => fav.imageUrl === outfit.imageUrl || (outfit.shopLink && fav.shopLink === outfit.shopLink)
    );
  };

  const isFavorited = (outfit) => !!getFavoriteEntry(outfit);

  // ── Empty State ──
  if (outfits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="relative h-28 w-28 mx-auto">
            <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center border border-border/30">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20"
            >
              <Search className="h-4 w-4 text-primary/60" />
            </motion.div>
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">No Matches Yet</h2>
            <p className="text-muted-foreground">
              Upload an outfit photo to discover matching products from top fashion retailers.
            </p>
          </div>
          <Link to="/upload">
            <Button size="lg" className="rounded-full h-12 px-8 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform gap-2">
              <Upload className="h-4 w-4" />
              Upload an Outfit
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* ── Header ── */}
      <div className="border-b border-border/30 bg-card/20 backdrop-blur-xl sticky top-16 z-30">
        <div className="container mx-auto px-4 py-5 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              {latestUpload?.imageUrl && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="h-14 w-14 rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg shadow-primary/10 shrink-0"
                >
                  <img
                    src={latestUpload.imageUrl}
                    alt="Your upload"
                    className="h-full w-full object-cover"
                  />
                </motion.div>
              )}
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  Style Matches
                  <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5 rounded-md">
                    {outfits.length}
                  </Badge>
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Click any product to compare prices across stores
                </p>
              </div>
            </div>
            <Link to="/upload">
              <Button variant="outline" size="sm" className="rounded-xl gap-2 h-10 px-5 border-border/40 hover:bg-primary/5 hover:border-primary/30 transition-all">
                <Upload className="h-4 w-4" />
                New Search
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Main Content: Grid + Sidebar ── */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex gap-6 items-start">
          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className={`grid gap-5 sm:grid-cols-2 ${selectedProduct ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"}`}
            >
              {outfits.map((outfit, index) => {
                const favorited = isFavorited(outfit);
                const isHovered = hoveredId === outfit.id;
                const isSelected = selectedProduct?.id === outfit.id;
                return (
                  <motion.div key={outfit.id || index} variants={fadeUp}>
                    <motion.div
                      onHoverStart={() => setHoveredId(outfit.id)}
                      onHoverEnd={() => setHoveredId(null)}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedProduct(isSelected ? null : outfit)}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className={`group relative rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm border hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full cursor-pointer ${
                        isSelected
                          ? "border-primary/50 ring-2 ring-primary/20 shadow-lg shadow-primary/10"
                          : "border-border/30 hover:border-primary/20"
                      }`}
                    >
                      {/* Image Section */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-muted/30">
                        <img
                          src={outfit.imageUrl}
                          alt={outfit.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Top badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
                          <Badge className="bg-background/85 backdrop-blur-lg text-foreground border-0 shadow-sm font-bold text-xs px-2.5 py-1 rounded-lg">
                            {outfit.matchScore}% Match
                          </Badge>
                          {outfit.price && (
                            <Badge className="bg-foreground/85 backdrop-blur-lg text-background border-0 shadow-sm font-bold text-xs px-2.5 py-1 rounded-lg">
                              {outfit.price}
                            </Badge>
                          )}
                        </div>

                        {/* Compare Prices hint */}
                        <div className="absolute bottom-3 left-3 z-10">
                          <span className={`flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[11px] font-bold shadow-sm transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground opacity-100"
                              : "bg-background/85 backdrop-blur-lg opacity-0 group-hover:opacity-100"
                          }`}>
                            <BarChart3 className="h-3.5 w-3.5" />
                            {isSelected ? "Comparing..." : "Compare Prices"}
                          </span>
                        </div>

                        {/* Favorite button */}
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleFavorite(e, outfit)}
                          disabled={savingId === outfit.id}
                          className={`absolute bottom-3 right-3 z-10 h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                            favorited
                              ? "bg-pink-500 text-white shadow-pink-500/30"
                              : "bg-background/85 backdrop-blur-lg text-foreground hover:bg-pink-500 hover:text-white hover:shadow-pink-500/20"
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${favorited ? "fill-current" : ""}`} />
                        </motion.button>

                        {/* Hover overlay */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent flex items-end p-4"
                            >
                              <a
                                href={outfit.shopLink || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => handleShopClick(e, outfit)}
                                className="w-full"
                              >
                                <motion.div
                                  initial={{ y: 10, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  exit={{ y: 10, opacity: 0 }}
                                  transition={{ delay: 0.05 }}
                                >
                                  <Button className="w-full rounded-xl h-11 font-semibold shadow-lg gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    Shop This Look
                                    <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-60" />
                                  </Button>
                                </motion.div>
                              </a>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Info Section */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                          {outfit.name || "Fashion Item"}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                          {outfit.description || "View product details"}
                        </p>

                        {/* Bottom action row — always visible */}
                        <div className="mt-auto flex items-center justify-between">
                          <a
                            href={outfit.shopLink || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => handleShopClick(e, outfit)}
                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                          >
                            Visit Store <ArrowRight className="h-3 w-3" />
                          </a>
                          {outfit.tags && outfit.tags.length > 0 && (
                            <span className="text-[10px] text-muted-foreground/60 font-medium bg-muted/40 px-2 py-0.5 rounded-md">
                              {outfit.tags[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* ── Price Compare Sidebar (right side) ── */}
          <AnimatePresence>
            {selectedProduct && (
              <PriceCompareSidebar
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        action={authAction}
      />
    </div>
  );
}
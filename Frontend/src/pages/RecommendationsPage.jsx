import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Upload, ArrowRight, ExternalLink, Search, Sparkles, ArrowUpDown, TrendingUp, TrendingDown, Type, SlidersHorizontal, BookmarkPlus, GitCompare } from "lucide-react";
import { Link } from "react-router-dom";
import AuthPromptModal from "@/components/AuthPromptModal";
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
  const { recommendations, latestUpload, addFavorite, removeFavorite, favorites, user, savedFilters, saveFilterPreset, deleteFilterPreset } = useAppContext();
  const outfits = recommendations?.length > 0 ? recommendations : [];
  const [savingId, setSavingId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState("continue");
  const [hoveredId, setHoveredId] = useState(null);
  const [sortBy, setSortBy] = useState("match");
  const [filters, setFilters] = useState({ minPrice: 0, maxPrice: 100000, minMatchScore: 0, tag: "" });
  const [presetName, setPresetName] = useState("");
  const [compareIds, setCompareIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Sort products
  const parsePrice = (p) => { const n = parseFloat(String(p || "").replace(/[^0-9.]/g, "")); return isNaN(n) ? Infinity : n; };
  const filteredOutfits = outfits.filter((o) => {
    const price = parsePrice(o.price);
    const score = o.matchScore || 0;
    const tagPass = !filters.tag || (o.tags || []).some((t) => String(t).toLowerCase().includes(filters.tag.toLowerCase()));
    return price >= filters.minPrice && price <= filters.maxPrice && score >= filters.minMatchScore && tagPass;
  });

  const sortedOutfits = [...filteredOutfits].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return parsePrice(a.price) - parsePrice(b.price);
      case "price-high": return parsePrice(b.price) - parsePrice(a.price);
      case "name": return (a.name || "").localeCompare(b.name || "");
      default: return (b.matchScore || 0) - (a.matchScore || 0);
    }
  });

  const requireAuth = (actionLabel) => {
    if (!user) {
      setAuthAction(actionLabel);
      setShowAuthModal(true);
      return true;
    }
    return false;
  };

  const handleFavorite = async (outfit) => {
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
  const comparedItems = sortedOutfits.filter((o) => compareIds.includes(o.id));

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
      <div className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
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
                  Curated products matching your uploaded outfit
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

          {/* Sorting Controls */}
          <div className="flex items-center gap-2 mt-4 pb-1 flex-wrap">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">Sort by</span>
            {[
              { key: "match", label: "Best Match", icon: Sparkles },
              { key: "price-low", label: "Price: Low → High", icon: TrendingUp },
              { key: "price-high", label: "Price: High → Low", icon: TrendingDown },
              { key: "name", label: "Name A–Z", icon: Type },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sortBy === opt.key
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <opt.icon className="h-3 w-3" />
                {opt.label}
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`h-10 rounded-xl gap-2 px-4 border-border/50 transition-all ${
                showFilters
                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 hover:bg-primary/90"
                  : "bg-background/70 hover:bg-muted/70"
              }`}
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>

            <AnimatePresence initial={false}>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-muted/40 to-background border border-border/50 space-y-3 shadow-sm">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Refine Matches</div>
                    <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-2">
                      <input type="number" min="0" value={filters.minPrice} onChange={(e) => setFilters((p) => ({ ...p, minPrice: Number(e.target.value || 0) }))} className="h-10 rounded-xl border border-input bg-background px-3 text-sm" placeholder="Min price" />
                      <input type="number" min="0" value={filters.maxPrice} onChange={(e) => setFilters((p) => ({ ...p, maxPrice: Number(e.target.value || 100000) }))} className="h-10 rounded-xl border border-input bg-background px-3 text-sm" placeholder="Max price" />
                      <input type="number" min="0" max="100" value={filters.minMatchScore} onChange={(e) => setFilters((p) => ({ ...p, minMatchScore: Number(e.target.value || 0) }))} className="h-10 rounded-xl border border-input bg-background px-3 text-sm" placeholder="Min match %" />
                      <input type="text" value={filters.tag} onChange={(e) => setFilters((p) => ({ ...p, tag: e.target.value }))} className="h-10 rounded-xl border border-input bg-background px-3 text-sm" placeholder="Tag (e.g. Premium)" />
                      <input type="text" value={presetName} onChange={(e) => setPresetName(e.target.value)} className="h-10 rounded-xl border border-input bg-background px-3 text-sm" placeholder="Preset name" />
                      <Button
                        size="sm"
                        className="h-10 rounded-xl gap-1.5"
                        onClick={async () => {
                          if (!presetName.trim()) return;
                          await saveFilterPreset({ name: presetName.trim(), filters: { ...filters, sortBy } });
                          setPresetName("");
                        }}
                      >
                        <BookmarkPlus className="h-3.5 w-3.5" /> Save Preset
                      </Button>
                    </div>
                    {savedFilters.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {savedFilters.map((preset) => (
                          <div key={preset._id} className="inline-flex items-center gap-1.5 bg-background border border-border/50 rounded-xl px-2.5 py-1.5 text-xs shadow-sm">
                            <button
                              onClick={() => {
                                setFilters({
                                  minPrice: preset.filters?.minPrice ?? 0,
                                  maxPrice: preset.filters?.maxPrice ?? 100000,
                                  minMatchScore: preset.filters?.minMatchScore ?? 0,
                                  tag: preset.filters?.tag ?? "",
                                });
                                if (preset.filters?.sortBy) setSortBy(preset.filters.sortBy);
                              }}
                              className="font-medium hover:text-primary"
                            >
                              {preset.name}
                            </button>
                            <button onClick={() => deleteFilterPreset(preset._id)} className="text-muted-foreground hover:text-destructive">x</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="container mx-auto px-4 pt-8 pb-10 max-w-7xl">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {sortedOutfits.map((outfit, index) => {
            const favorited = isFavorited(outfit);
            const isHovered = hoveredId === outfit.id;
            return (
              <motion.div key={outfit.id || index} variants={fadeUp}>
                <motion.div
                  onHoverStart={() => setHoveredId(outfit.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="group relative rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm border border-border/30 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full"
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

                    {/* Favorite button */}
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleFavorite(outfit)}
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
                    <div className="mt-2">
                      <Button
                        variant={compareIds.includes(outfit.id) ? "default" : "outline"}
                        size="sm"
                        className="h-8 rounded-lg w-full text-xs gap-1.5"
                        onClick={() =>
                          setCompareIds((prev) =>
                            prev.includes(outfit.id) ? prev.filter((id) => id !== outfit.id) : [...prev.slice(-1), outfit.id]
                          )
                        }
                      >
                        <GitCompare className="h-3.5 w-3.5" />
                        {compareIds.includes(outfit.id) ? "Selected for Compare" : "Compare"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {comparedItems.length === 2 && (
          <div className="mt-8 rounded-2xl border border-border/40 bg-card/40 p-4">
            <h3 className="text-sm font-semibold mb-3">Compare Mode</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {comparedItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-border/40 p-3 bg-background/50">
                  <p className="text-sm font-semibold line-clamp-2">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Match: {item.matchScore || 0}%</p>
                  <p className="text-xs text-muted-foreground">Price: {item.price || "N/A"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
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
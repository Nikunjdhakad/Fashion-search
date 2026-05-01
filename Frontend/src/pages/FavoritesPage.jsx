import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart, ShoppingBag, Trash2, ExternalLink, ArrowRight, Search, X,
} from "lucide-react";
import { Link } from "react-router-dom";
import AuthPromptModal from "@/components/AuthPromptModal";
import usePageTitle from "@/hooks/usePageTitle";
import { API_BASE_URL } from "@/config";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function FavoritesPage() {
  usePageTitle("Favorites");
  const { favorites, removeFavorite, updateFavorite, user } = useAppContext();
  const [removingId, setRemovingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const [activeFolder, setActiveFolder] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [editState, setEditState] = useState({ folder: "General", note: "", priceAlertTarget: "" });
  const [isCheckingPrices, setIsCheckingPrices] = useState(false);
  const [priceCheckMessage, setPriceCheckMessage] = useState("");

  const folders = ["All", ...Array.from(new Set(favorites.map((f) => f.folder || "General")))];
  const displayedFavorites = activeFolder === "All" ? favorites : favorites.filter((f) => (f.folder || "General") === activeFolder);

  const handleRemove = async (id) => {
    setRemovingId(id);
    await removeFavorite(id);
    setRemovingId(null);
    setShowConfirm(null);
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditState({
      folder: item.folder || "General",
      note: item.note || "",
      priceAlertTarget: item.priceAlertTarget || "",
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateFavorite(editingId, editState);
    setEditingId(null);
  };

  const runPriceCheck = async () => {
    if (!user?.token) return;
    setIsCheckingPrices(true);
    setPriceCheckMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/price-alerts/check`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setPriceCheckMessage(err.message || "Price alert check failed. Please try again.");
        return;
      }
      const data = await res.json();
      setPriceCheckMessage(
        data.generated > 0
          ? `${data.generated} price alert(s) generated successfully.`
          : "Price check completed. No items matched your target yet."
      );
    } catch (error) {
      console.error("Failed to run price check:", error);
      setPriceCheckMessage("Network error while running price check.");
    } finally {
      setIsCheckingPrices(false);
    }
  };

  // Empty state
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="h-24 w-24 mx-auto rounded-3xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
            <Heart className="h-12 w-12 text-pink-500/40" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Sign In to View Favorites</h2>
          <p className="text-muted-foreground">Create an account to save and manage your favorite fashion finds.</p>
          <Link to="/login">
            <Button size="lg" className="rounded-full h-12 px-8 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform gap-2">
              Sign In
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="relative h-28 w-28 mx-auto">
            <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center border border-border/30">
              <Heart className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20"
            >
              <Search className="h-4 w-4 text-pink-500/60" />
            </motion.div>
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">No Favorites Yet</h2>
            <p className="text-muted-foreground">
              When you ❤️ products from your search results, they'll appear here for easy access.
            </p>
          </div>
          <Link to="/upload">
            <Button size="lg" className="rounded-full h-12 px-8 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform gap-2">
              <Search className="h-4 w-4" />
              Start Searching
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
                My Favorites
                <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5 rounded-md">
                  {displayedFavorites.length}
                </Badge>
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Your saved fashion finds</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/upload">
                <Button variant="outline" size="sm" className="rounded-xl gap-2 h-10 px-5 border-border/40 hover:bg-primary/5 hover:border-primary/30 transition-all">
                  <Search className="h-4 w-4" />
                  Find More
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="rounded-xl h-10" onClick={runPriceCheck}>
                {isCheckingPrices ? "Checking..." : "Run Price Alert Check"}
              </Button>
            </div>
          </div>
          {priceCheckMessage ? (
            <div className="mt-3 rounded-lg border border-border/40 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              {priceCheckMessage}
            </div>
          ) : null}
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 pt-8 pb-10 max-w-6xl">
        <div className="flex flex-wrap gap-2 mb-5">
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                activeFolder === folder ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"
              }`}
            >
              {folder}
            </button>
          ))}
        </div>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {displayedFavorites.map((item) => (
              <motion.div
                key={item._id}
                variants={fadeUp}
                layout
                exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)", transition: { duration: 0.3 } }}
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="group relative rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm border border-border/30 hover:border-primary/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted/30">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Top badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
                      {item.matchScore && (
                        <Badge className="bg-background/85 backdrop-blur-lg text-foreground border-0 shadow-sm font-bold text-xs px-2.5 py-1 rounded-lg">
                          {item.matchScore}% Match
                        </Badge>
                      )}
                      {item.price && (
                        <Badge className="bg-foreground/85 backdrop-blur-lg text-background border-0 shadow-sm font-bold text-xs px-2.5 py-1 rounded-lg">
                          {item.price}
                        </Badge>
                      )}
                    </div>

                    {/* Remove button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowConfirm(item._id)}
                      className="absolute bottom-3 right-3 z-10 h-9 w-9 rounded-full bg-background/85 backdrop-blur-lg flex items-center justify-center shadow-lg text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>

                    {/* Confirm delete overlay */}
                    <AnimatePresence>
                      {showConfirm === item._id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20 p-4"
                        >
                          <p className="text-sm font-semibold text-center">Remove from favorites?</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemove(item._id)}
                              disabled={removingId === item._id}
                              className="rounded-lg h-9 px-4 gap-1.5 font-semibold"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {removingId === item._id ? "Removing..." : "Remove"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowConfirm(null)}
                              className="rounded-lg h-9 px-4 font-semibold"
                            >
                              Cancel
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {item.name || "Fashion Item"}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                      {item.description || "Saved from visual search"}
                    </p>
                    <div className="mb-3 space-y-1">
                      <p className="text-[10px] text-muted-foreground">Folder: {item.folder || "General"}</p>
                      {item.note ? <p className="text-[10px] text-muted-foreground line-clamp-2">Note: {item.note}</p> : null}
                      {item.priceAlertTarget ? <p className="text-[10px] text-amber-600 dark:text-amber-400">Alert at: {item.priceAlertTarget}</p> : null}
                    </div>

                    <div className="mt-auto">
                      <Button size="sm" variant="outline" className="w-full rounded-xl h-8 font-semibold mb-2" onClick={() => startEdit(item)}>
                        Edit Folder/Note
                      </Button>
                      <a
                        href={item.shopLink || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button size="sm" className="w-full rounded-xl h-9 font-semibold gap-2 shadow-sm">
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Shop Now
                          <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {editingId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md rounded-2xl bg-background border border-border p-4 space-y-3">
                <h3 className="text-sm font-semibold">Update Favorite</h3>
                <input className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm" value={editState.folder} onChange={(e) => setEditState((p) => ({ ...p, folder: e.target.value }))} placeholder="Folder name" />
                <input className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm" value={editState.note} onChange={(e) => setEditState((p) => ({ ...p, note: e.target.value }))} placeholder="Personal note" />
                <input className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm" value={editState.priceAlertTarget} onChange={(e) => setEditState((p) => ({ ...p, priceAlertTarget: e.target.value }))} placeholder="Price alert target (optional)" />
                <div className="flex gap-2">
                  <Button className="flex-1 rounded-lg" onClick={saveEdit}>Save</Button>
                  <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, Trash2, ChevronLeft, ChevronRight,
  Image as ImageIcon, User, Calendar, ExternalLink,
  ChevronDown, ChevronUp, FileDown, FileUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "@/config";
import usePageTitle from "@/hooks/usePageTitle";

export default function AdminSearches() {
  usePageTitle("Search Analytics");
  const { user } = useAppContext();
  const [searches, setSearches] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchSearches = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/searches?page=${page}&limit=15`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSearches(data.searches);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch searches:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSearches(1);
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/searches/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        setSearches((prev) => prev.filter((s) => s._id !== id));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const exportSearchesCsv = () => {
    const rows = [
      ["searchId", "user", "matchesCount", "createdAt", "imageUrl"],
      ...searches.map((s) => [
        s._id,
        s.userId?.username || s.userId?.name || "",
        String(s.matchesCount || s.matches?.length || 0),
        s.createdAt || "",
        s.imageUrl || "",
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-searches-page-${pagination.page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadSearchesTemplateCsv = () => {
    const rows = [
      ["searchId"],
      ["665f1c8e0a00000000001001"],
      ["665f1c8e0a00000000001002"],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "searches-import-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSearchesCsv = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return;

    const header = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
    const idx = header.findIndex((h) => h === "searchId");
    if (idx === -1) {
      alert("CSV must include a searchId column");
      return;
    }

    const imported = lines
      .slice(1)
      .map((line) => line.split(","))
      .map((cols) => cols[idx]?.replace(/"/g, "").trim())
      .filter(Boolean);
    setSelectedIds(Array.from(new Set(imported)));
    event.target.value = "";
  };

  const bulkDeleteSearches = async () => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/searches/bulk-delete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchIds: selectedIds }),
      });
      if (res.ok) {
        await fetchSearches(pagination.page);
        setSelectedIds([]);
      }
    } catch (error) {
      console.error("Bulk delete failed:", error);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Search className="h-6 w-6 text-emerald-500" />
          Search Analytics
          <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5 rounded-md ml-1">
            {pagination.total}
          </Badge>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">All visual searches across the platform</p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="rounded-xl" onClick={exportSearchesCsv}>
          <FileDown className="h-3.5 w-3.5 mr-1" /> Export CSV
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={downloadSearchesTemplateCsv}>
          <FileDown className="h-3.5 w-3.5 mr-1" /> Template CSV
        </Button>
        <label className="inline-flex">
          <input type="file" accept=".csv" className="hidden" onChange={importSearchesCsv} />
          <span className="inline-flex items-center rounded-xl border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-muted">
            <FileUp className="h-3.5 w-3.5 mr-1" /> Import CSV
          </span>
        </label>
        <Button variant="destructive" size="sm" className="rounded-xl" disabled={bulkLoading || selectedIds.length === 0} onClick={bulkDeleteSearches}>
          Delete Imported/Selected
        </Button>
        <span className="text-xs text-muted-foreground">{selectedIds.length} selected</span>
      </div>

      {/* Search List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : searches.length === 0 ? (
        <div className="text-center py-20">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No searches found</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <AnimatePresence>
            {searches.map((entry) => (
              <motion.div
                key={entry._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="bg-card/40 backdrop-blur-sm border-border/40 hover:shadow-md transition-all rounded-xl overflow-hidden">
                  <CardContent className="p-4">
                    {/* Main row */}
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(entry._id)}
                        onChange={() =>
                          setSelectedIds((prev) =>
                            prev.includes(entry._id) ? prev.filter((id) => id !== entry._id) : [...prev, entry._id]
                          )
                        }
                      />
                      {/* Image */}
                      <div className="h-14 w-14 rounded-xl overflow-hidden border border-border/50 shrink-0 bg-muted">
                        {entry.imageUrl ? (
                          <img src={entry.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <Link
                            to={`/admin/users/${entry.userId?._id}`}
                            className="text-sm font-semibold hover:text-primary transition-colors truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {entry.userId?.name || entry.userId?.username || "Deleted User"}
                          </Link>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {formatDate(entry.createdAt)}
                          </span>
                          <span>{entry.matchesCount || entry.matches?.length || 0} products</span>
                        </div>
                      </div>

                      {/* Match thumbnails */}
                      {entry.matches?.length > 0 && (
                        <div className="hidden sm:flex -space-x-2">
                          {entry.matches.slice(0, 4).map((m, i) => (
                            <div key={i} className="h-8 w-8 rounded-lg overflow-hidden border-2 border-background shadow-sm">
                              <img src={m.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                            </div>
                          ))}
                          {entry.matches.length > 4 && (
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center border-2 border-background text-[10px] font-bold text-muted-foreground">
                              +{entry.matches.length - 4}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(expandedId === entry._id ? null : entry._id)}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10"
                        >
                          {expandedId === entry._id ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry._id)}
                          disabled={deletingId === entry._id}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded products */}
                    <AnimatePresence>
                      {expandedId === entry._id && entry.matches?.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {entry.matches.map((match, i) => (
                              <a
                                key={i}
                                href={match.shopLink || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group rounded-xl overflow-hidden border border-border/40 hover:border-primary/30 hover:shadow-md transition-all"
                              >
                                <div className="aspect-square bg-muted/30 relative overflow-hidden">
                                  <img
                                    src={match.imageUrl}
                                    alt={match.name}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                    loading="lazy"
                                  />
                                  {match.price && (
                                    <Badge className="absolute top-1.5 right-1.5 bg-foreground/80 text-background text-[9px] font-bold px-1.5 py-0.5 border-0">
                                      {match.price}
                                    </Badge>
                                  )}
                                </div>
                                <div className="p-2">
                                  <p className="text-[11px] font-medium truncate group-hover:text-primary transition-colors">
                                    {match.name || "Product"}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground truncate flex items-center gap-1">
                                    <ExternalLink className="h-2.5 w-2.5" /> {match.source || "Shop"}
                                  </p>
                                </div>
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSearches(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="rounded-xl h-9 px-4 gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </Button>
          <span className="text-sm text-muted-foreground font-medium">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSearches(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="rounded-xl h-9 px-4 gap-1"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

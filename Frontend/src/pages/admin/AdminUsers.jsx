import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Search, Trash2, Shield, ShieldOff, Eye,
  ChevronLeft, ChevronRight, ArrowUpDown, FileDown, FileUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config";
import usePageTitle from "@/hooks/usePageTitle";

export default function AdminUsers() {
  usePageTitle("Manage Users");
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const exportUsersCsv = () => {
    const rows = [
      ["userId", "username", "name", "mobileNo", "isAdmin", "uploadsCount", "favoritesCount", "createdAt"],
      ...users.map((u) => [
        u._id,
        u.username || "",
        u.name || "",
        u.mobileNo || "",
        String(Boolean(u.isAdmin)),
        String(u.uploadsCount || 0),
        String(u.favoritesCount || 0),
        u.createdAt || "",
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-users-page-${pagination.page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadUsersTemplateCsv = () => {
    const rows = [
      ["userId"],
      ["665f1c8e0a00000000000001"],
      ["665f1c8e0a00000000000002"],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users-import-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importUsersCsv = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return;

    const header = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
    const idIndex = header.findIndex((h) => h === "userId");
    if (idIndex === -1) {
      alert("CSV must contain a userId column");
      return;
    }

    const importedIds = lines
      .slice(1)
      .map((line) => line.split(","))
      .map((cols) => cols[idIndex]?.replace(/"/g, "").trim())
      .filter(Boolean);

    setSelectedIds(Array.from(new Set(importedIds)));
    event.target.value = "";
  };

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        search: searchQuery,
        sort: sortField,
        order: sortOrder,
      });
      const res = await fetch(`${API_BASE_URL}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [searchQuery, sortField, sortOrder]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
        setShowDeleteConfirm(null);
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAdmin = async (id) => {
    setTogglingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, isAdmin: data.isAdmin } : u))
        );
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) {
      console.error("Failed to toggle role:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const toggleUserSelection = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const runBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/bulk-action`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, userIds: selectedIds }),
      });

      if (res.ok) {
        await fetchUsers(pagination.page);
        setSelectedIds([]);
      } else {
        const err = await res.json();
        alert(err.message || "Bulk action failed");
      }
    } catch (error) {
      console.error("Bulk action failed:", error);
    } finally {
      setBulkLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-500" />
          User Management
          <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5 rounded-md ml-1">
            {pagination.total}
          </Badge>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Search, view, and manage all registered users</p>
      </motion.div>

      {/* Search & Sort Controls */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by username, name, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-background/50"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort("createdAt")}
            className={`rounded-xl h-10 px-4 gap-2 ${sortField === "createdAt" ? "border-primary/30 bg-primary/5" : ""}`}
          >
            <ArrowUpDown className="h-3.5 w-3.5" /> Date
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort("uploadsCount")}
            className={`rounded-xl h-10 px-4 gap-2 ${sortField === "uploadsCount" ? "border-primary/30 bg-primary/5" : ""}`}
          >
            <ArrowUpDown className="h-3.5 w-3.5" /> Uploads
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="rounded-xl" onClick={exportUsersCsv}>
          <FileDown className="h-3.5 w-3.5 mr-1" /> Export CSV
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={downloadUsersTemplateCsv}>
          <FileDown className="h-3.5 w-3.5 mr-1" /> Template CSV
        </Button>
        <label className="inline-flex">
          <input type="file" accept=".csv" className="hidden" onChange={importUsersCsv} />
          <span className="inline-flex items-center rounded-xl border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-muted">
            <FileUp className="h-3.5 w-3.5 mr-1" /> Import CSV
          </span>
        </label>
        <Button variant="outline" size="sm" className="rounded-xl" disabled={bulkLoading || selectedIds.length === 0} onClick={() => runBulkAction("promote")}>
          Promote Selected
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl" disabled={bulkLoading || selectedIds.length === 0} onClick={() => runBulkAction("demote")}>
          Demote Selected
        </Button>
        <Button variant="destructive" size="sm" className="rounded-xl" disabled={bulkLoading || selectedIds.length === 0} onClick={() => runBulkAction("delete")}>
          Delete Selected
        </Button>
        <span className="text-xs text-muted-foreground">{selectedIds.length} selected</span>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No users found</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="space-y-2">
          {/* Header row - desktop */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-3">User</div>
            <div className="col-span-2">Mobile</div>
            <div className="col-span-1 text-center">Uploads</div>
            <div className="col-span-1 text-center">Favorites</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-1 text-center">Role</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* User rows */}
          <AnimatePresence>
            {users.map((u) => (
              <motion.div
                key={u._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="bg-card/40 backdrop-blur-sm border-border/40 hover:shadow-md hover:border-primary/10 transition-all rounded-xl overflow-hidden">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      {/* User info */}
                      <div className="md:col-span-3 flex items-center gap-3">
                        <input type="checkbox" checked={selectedIds.includes(u._id)} onChange={() => toggleUserSelection(u._id)} />
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[2px] shrink-0">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || u.username)}&background=random&size=64&bold=true`}
                            alt="Avatar"
                            className="h-full w-full rounded-full object-cover border border-background"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{u.name || u.username}</p>
                          <p className="text-[11px] text-muted-foreground truncate">@{u.username}</p>
                        </div>
                      </div>

                      {/* Mobile */}
                      <div className="md:col-span-2">
                        <span className="md:hidden text-[10px] text-muted-foreground font-medium uppercase mr-2">Mobile:</span>
                        <span className="text-sm">{u.mobileNo}</span>
                      </div>

                      {/* Uploads */}
                      <div className="md:col-span-1 md:text-center">
                        <span className="md:hidden text-[10px] text-muted-foreground font-medium uppercase mr-2">Uploads:</span>
                        <span className="text-sm font-semibold">{u.uploadsCount || 0}</span>
                      </div>

                      {/* Favorites */}
                      <div className="md:col-span-1 md:text-center">
                        <span className="md:hidden text-[10px] text-muted-foreground font-medium uppercase mr-2">Favorites:</span>
                        <span className="text-sm font-semibold">{u.favoritesCount || 0}</span>
                      </div>

                      {/* Joined */}
                      <div className="md:col-span-2">
                        <span className="md:hidden text-[10px] text-muted-foreground font-medium uppercase mr-2">Joined:</span>
                        <span className="text-sm text-muted-foreground">{formatDate(u.createdAt)}</span>
                      </div>

                      {/* Role */}
                      <div className="md:col-span-1 md:text-center">
                        {u.isAdmin ? (
                          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold px-2 py-0.5">
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5">
                            User
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="md:col-span-2 flex items-center gap-1.5 md:justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/users/${u._id}`)}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAdmin(u._id)}
                          disabled={togglingId === u._id || u._id === user._id}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-amber-500/10 hover:text-amber-600"
                          title={u.isAdmin ? "Demote from Admin" : "Promote to Admin"}
                        >
                          {u.isAdmin ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                        </Button>

                        {showDeleteConfirm === u._id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(u._id)}
                              disabled={deletingId === u._id}
                              className="h-8 px-2 rounded-lg text-[11px] font-semibold"
                            >
                              {deletingId === u._id ? "..." : "Yes"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowDeleteConfirm(null)}
                              className="h-8 px-2 rounded-lg text-[11px] font-semibold"
                            >
                              No
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(u._id)}
                            disabled={u._id === user._id}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                            title="Delete User"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
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
            onClick={() => fetchUsers(pagination.page - 1)}
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
            onClick={() => fetchUsers(pagination.page + 1)}
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

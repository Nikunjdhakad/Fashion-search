import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import { API_BASE_URL } from "@/config";
import usePageTitle from "@/hooks/usePageTitle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminAudit() {
  usePageTitle("Audit Logs");
  const { user } = useAppContext();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ action: "", adminId: "", from: "", to: "" });

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (filters.action) params.set("action", filters.action);
      if (filters.adminId) params.set("adminId", filters.adminId);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);

      const res = await fetch(`${API_BASE_URL}/api/admin/audit?${params.toString()}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) setLogs(await res.json());
    } catch (error) {
      console.error("Failed to load audit logs", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user?.token]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-indigo-500" />
          Audit Logs
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Track sensitive admin actions</p>
      </div>

      <Card className="bg-card/40 backdrop-blur-sm border-border/40">
        <CardHeader>
          <CardTitle className="text-base">Recent Admin Actions</CardTitle>
          <CardDescription className="text-xs">Promotions, deletions, and bulk actions</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-2">
          <div className="grid md:grid-cols-5 gap-2">
            <Input placeholder="Action e.g. bulk_delete" value={filters.action} onChange={(e) => setFilters((p) => ({ ...p, action: e.target.value }))} />
            <Input placeholder="Admin user id" value={filters.adminId} onChange={(e) => setFilters((p) => ({ ...p, adminId: e.target.value }))} />
            <Input type="date" value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} />
            <Input type="date" value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} />
            <Button onClick={fetchLogs} className="rounded-xl">Apply Filters</Button>
          </div>
        </CardContent>
        <CardContent className="space-y-3">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No audit logs found</p>
          ) : (
            logs.map((log) => (
              <div key={log._id} className="p-3 rounded-xl border border-border/30 bg-background/40">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{log.action.replaceAll("_", " ")}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      by {log.adminId?.name || log.adminId?.username || "Admin"} at {new Date(log.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize text-[10px]">{log.targetType}</Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

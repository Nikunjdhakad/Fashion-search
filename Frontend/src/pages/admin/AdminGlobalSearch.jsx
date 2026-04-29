import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon } from "lucide-react";
import { API_BASE_URL } from "@/config";
import usePageTitle from "@/hooks/usePageTitle";

export default function AdminGlobalSearch() {
  usePageTitle("Global Search");
  const { user } = useAppContext();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState({ users: [], searches: [], activity: [] });
  const [isLoading, setIsLoading] = useState(false);

  const runSearch = async (value) => {
    setQuery(value);
    if (!value.trim()) {
      setResult({ users: [], searches: [], activity: [] });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/search?q=${encodeURIComponent(value)}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) setResult(await res.json());
    } catch (error) {
      console.error("Global search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Global Admin Search</h1>
        <p className="text-muted-foreground text-sm mt-1">Search users, searches, and activity from one place</p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => runSearch(e.target.value)}
          placeholder="Type username, mobile, source, or activity type..."
          className="pl-10 h-11 rounded-xl"
        />
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Searching...</p> : null}

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-card/40 border-border/40">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold">Users <Badge variant="secondary">{result.users.length}</Badge></p>
            {result.users.map((u) => (
              <Link key={u._id} to={`/admin/users/${u._id}`} className="block text-sm hover:text-primary truncate">
                {u.name || u.username} ({u.mobileNo})
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/40">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold">Searches <Badge variant="secondary">{result.searches.length}</Badge></p>
            {result.searches.map((s) => (
              <p key={s._id} className="text-sm truncate">
                {(s.userId?.name || s.userId?.username || "User")} - {s.matchesCount || 0} matches
              </p>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/40">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold">Activity <Badge variant="secondary">{result.activity.length}</Badge></p>
            {result.activity.map((a) => (
              <p key={a._id} className="text-sm truncate capitalize">
                {(a.userId?.name || a.userId?.username || "User")} - {a.type}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

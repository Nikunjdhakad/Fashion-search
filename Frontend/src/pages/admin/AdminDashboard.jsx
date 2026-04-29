import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Search, Heart, TrendingUp, BarChart3,
  UserPlus, Zap, Activity as ActivityIcon, Bell,
} from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "@/config";
import usePageTitle from "@/hooks/usePageTitle";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function AdminDashboard() {
  usePageTitle("Admin Dashboard");
  const { user } = useAppContext();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        const [statsRes, activityRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/stats`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/activity/recent?limit=10`, { headers }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (activityRes.ok) setRecentActivity(await activityRes.json());
        const alertsRes = await fetch(`${API_BASE_URL}/api/admin/alerts`, { headers });
        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          setAlerts(alertsData.alerts || []);
        }
        const healthRes = await fetch(`${API_BASE_URL}/api/admin/system-health`, { headers });
        if (healthRes.ok) setHealth(await healthRes.json());
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user?.token]);

  const chartData = stats?.dailyChart || [];
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Searches", value: stats?.totalSearches || 0, icon: Search, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Favorites", value: stats?.totalFavorites || 0, icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10" },
    { label: "Today's Searches", value: stats?.todaySearches || 0, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "New Users (7d)", value: stats?.newUsersThisWeek || 0, icon: UserPlus, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Active Users (7d)", value: stats?.activeUsersWeek || 0, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform-wide metrics and recent activity</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <Card className="bg-card/50 backdrop-blur-sm border-border/40 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart + Activity Feed */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* 30-day Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card className="bg-card/40 backdrop-blur-sm border-border/40 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Search Activity (30 Days)</CardTitle>
                <CardDescription className="text-xs">Daily search volume across the platform</CardDescription>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
                  No activity data yet
                </div>
              ) : (
                <div className="w-full" style={{ height: "208px" }}>
                  <div className="relative w-full h-full flex items-end gap-[3px] pt-6">
                    {chartData.map((item, i) => {
                      const barMaxHeight = 180;
                      const heightPx = maxCount > 0 ? Math.max((item.count / maxCount) * barMaxHeight, 6) : 6;
                      return (
                        <div key={i} className="relative w-full flex flex-col items-center group">
                          <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] px-2 py-0.5 rounded-md shadow-lg pointer-events-none z-10 font-semibold whitespace-nowrap">
                            {item.count} searches · {item.date}
                          </div>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: heightPx }}
                            transition={{ duration: 0.6, delay: 0.3 + i * 0.02, ease: "easeOut" }}
                            className="w-full max-w-[12px] rounded-t bg-gradient-to-t from-primary/60 to-primary/20 hover:from-primary hover:to-primary/60 transition-colors cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card/40 backdrop-blur-sm border-border/40 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription className="text-xs">Latest actions across all users</CardDescription>
              </div>
              <ActivityIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {recentActivity.map((act, i) => (
                    <div key={act._id || i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        act.type === "search" ? "bg-emerald-500/10" : "bg-purple-500/10"
                      }`}>
                        {act.type === "search" ? (
                          <Search className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <ActivityIcon className="h-3.5 w-3.5 text-purple-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {act.userId?.username || act.userId?.name || "User"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {act.type === "search" ? "Visual search" : "Try-on"} ·{" "}
                          {act.metadata?.matchesCount ? `${act.metadata.matchesCount} matches` : ""}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 font-medium shrink-0">
                        {formatTimeAgo(act.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Links */}
      <Card className="bg-card/40 backdrop-blur-sm border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-500" />
            Admin Notifications
          </CardTitle>
          <CardDescription className="text-xs">Operational alerts based on recent platform usage</CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No alerts right now.</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.code} className="rounded-lg border border-border/30 p-3 bg-background/50">
                  <p className="text-sm font-medium">{alert.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-sm border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">System Health</CardTitle>
          <CardDescription className="text-xs">Database and platform pulse in last 24h</CardDescription>
        </CardHeader>
        <CardContent>
          {health ? (
            <div className="grid sm:grid-cols-4 gap-3 text-sm">
              <div className="rounded-lg border border-border/30 p-3">
                <p className="text-xs text-muted-foreground">Database</p>
                <p className="font-semibold capitalize">{health.database}</p>
              </div>
              <div className="rounded-lg border border-border/30 p-3">
                <p className="text-xs text-muted-foreground">Searches (24h)</p>
                <p className="font-semibold">{health.metrics?.searches24h ?? 0}</p>
              </div>
              <div className="rounded-lg border border-border/30 p-3">
                <p className="text-xs text-muted-foreground">Activity (24h)</p>
                <p className="font-semibold">{health.metrics?.activity24h ?? 0}</p>
              </div>
              <div className="rounded-lg border border-border/30 p-3">
                <p className="text-xs text-muted-foreground">New users (24h)</p>
                <p className="font-semibold">{health.metrics?.users24h ?? 0}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Health data unavailable.</p>
          )}
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid sm:grid-cols-3 gap-4"
      >
        {[
          { title: "Manage Users", desc: "View, search, and manage all users", icon: Users, path: "/admin/users", color: "text-blue-500", gradient: "from-blue-500/10 to-indigo-500/10" },
          { title: "Search Analytics", desc: "Browse all platform searches", icon: Search, path: "/admin/searches", color: "text-emerald-500", gradient: "from-emerald-500/10 to-teal-500/10" },
          { title: "Activity Monitor", desc: "30-day trends and live feed", icon: ActivityIcon, path: "/admin/activity", color: "text-purple-500", gradient: "from-purple-500/10 to-pink-500/10" },
        ].map((item) => (
          <Link key={item.path} to={item.path}>
            <Card className={`group h-full bg-gradient-to-br ${item.gradient} border-border/30 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer`}>
              <CardContent className="p-5">
                <div className={`h-10 w-10 rounded-xl bg-background/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}

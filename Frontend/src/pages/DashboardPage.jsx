import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Image as ImageIcon, Sparkles, BarChart3, Heart, Clock,
  Upload, ArrowRight, TrendingUp, Eye, ShoppingBag, Camera,
  Target, Star,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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

export default function DashboardPage() {
  const { uploads, user, favorites, setRecommendations, addUpload } = useAppContext();
  const navigate = useNavigate();
  const [activityData, setActivityData] = useState(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [recentHistory, setRecentHistory] = useState([]);
  const [feedback, setFeedback] = useState(() => localStorage.getItem("deep-fashion-feedback") || "");
  const [notifications, setNotifications] = useState([]);

  const totalItems = uploads.reduce((acc, curr) => acc + (curr.itemsDetected || 0), 0);
  const displayName = user?.name || user?.username || "User";
  usePageTitle("Dashboard");
  const uploadsCount = user?.uploadsCount !== undefined ? user.uploadsCount : uploads.length;

  // Fetch real activity data
  useEffect(() => {
    const fetchActivity = async () => {
      if (!user?.token) { setIsLoadingActivity(false); return; }
      try {
        const res = await fetch(`${API_BASE_URL}/api/activity`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (res.ok) setActivityData(await res.json());
      } catch (err) {
        console.error("Failed to fetch activity:", err);
      } finally {
        setIsLoadingActivity(false);
      }
    };
    fetchActivity();
  }, [user?.token]);

  useEffect(() => {
    const fetchRecentHistory = async () => {
      if (!user?.token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/history?page=1&limit=3`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRecentHistory(data.history || []);
        }
      } catch (err) {
        console.error("Failed to fetch recent history:", err);
      }
    };
    fetchRecentHistory();
  }, [user?.token]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/notifications`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (res.ok) setNotifications(await res.json());
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    fetchNotifications();
  }, [user?.token]);

  const chartData = activityData?.daily || [];
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const profileFields = [
    Boolean(user?.name),
    Boolean(user?.email),
    Boolean(user?.stylePreference),
    Boolean(user?.fitPreference),
  ];
  const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  return (
    <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">

      {/* ── Welcome Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/20 shrink-0">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=112&bold=true`}
              alt="Avatar"
              className="h-full w-full rounded-[14px] object-cover border-2 border-background"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {greeting}, {displayName}
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5">
              <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
              {user?.styleLevel || "Fashion Forward"}
            </p>
          </div>
        </div>
        <Link to="/upload">
          <Button className="rounded-xl gap-2 h-11 px-6 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform font-semibold">
            <Camera className="h-4 w-4" />
            New Search
          </Button>
        </Link>
      </motion.div>

      {/* ── New User Welcome ── */}
      {uploadsCount === 0 && !isLoadingActivity && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight mb-1">Welcome to Deep Fashion! 🎉</h2>
                    <p className="text-muted-foreground text-sm">
                      Get started in 3 simple steps — it only takes seconds to find your perfect match.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { step: "1", icon: Upload, label: "Upload", desc: "Drop any clothing photo" },
                      { step: "2", icon: Eye, label: "Discover", desc: "AI finds matching products" },
                      { step: "3", icon: Heart, label: "Save", desc: "Keep your favorites" },
                    ].map((s) => (
                      <div key={s.step} className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/30">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <s.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold">{s.label}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Link to="/upload" className="shrink-0">
                  <Button size="lg" className="rounded-xl h-12 px-8 font-semibold shadow-lg shadow-primary/20 gap-2 hover:scale-105 transition-transform">
                    <Camera className="h-4 w-4" />
                    Try Your First Search
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Stats Row ── */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Uploads", value: uploadsCount, icon: ImageIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Items Found", value: totalItems, icon: Eye, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Favorites", value: favorites.length, icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10" },
          { label: "Sessions", value: activityData?.totalActivity || 0, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <Card className="bg-card/50 backdrop-blur-sm border-border/40 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
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

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-card/40 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{profileCompletion}%</p>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${profileCompletion}%` }} />
            </div>
            <Link to="/profile-setup" className="text-xs text-primary hover:underline mt-2 inline-block">Complete profile</Link>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/40 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> Continue Exploring</CardTitle>
          </CardHeader>
          <CardContent>
            {recentHistory.length > 0 ? (
              <div className="space-y-2">
                {recentHistory.map((entry) => (
                  <div key={entry._id} className="text-xs rounded-lg border border-border/30 p-2 flex items-center justify-between">
                    <span>{entry.matchesCount || 0} matches from {new Date(entry.createdAt).toLocaleDateString("en-IN")}</span>
                    <Link to="/history" className="text-primary hover:underline">Open</Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent searches to continue yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            {
              title: "Visual Search",
              desc: "Find products by uploading a photo",
              icon: Upload,
              path: "/upload",
              gradient: "from-indigo-500/10 to-purple-500/10",
              iconColor: "text-indigo-500",
            },
            {
              title: "Style Matches",
              desc: "Browse your curated outfit matches",
              icon: ShoppingBag,
              path: "/recommendations",
              gradient: "from-pink-500/10 to-rose-500/10",
              iconColor: "text-pink-500",
            },
            {
              title: "Search History",
              desc: "Review your past searches & results",
              icon: Clock,
              path: "/history",
              gradient: "from-amber-500/10 to-orange-500/10",
              iconColor: "text-amber-500",
            },
            {
              title: "Wardrobe Builder",
              desc: "Save your pieces and build looks",
              icon: ShoppingBag,
              path: "/wardrobe",
              gradient: "from-cyan-500/10 to-blue-500/10",
              iconColor: "text-cyan-500",
            },
          ].map((action) => (
            <Link key={action.path} to={action.path}>
              <Card className={`group h-full bg-gradient-to-br ${action.gradient} border-border/30 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer`}>
                <CardContent className="p-5 flex flex-col h-full">
                  <div className={`h-10 w-10 rounded-xl bg-background/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                    <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{action.title}</h3>
                  <p className="text-xs text-muted-foreground flex-1">{action.desc}</p>
                  <div className="flex items-center gap-1 text-xs font-medium text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    Go <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Activity Chart + Recent Uploads (2-col on desktop) ── */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3"
        >
          <Card className="bg-card/40 backdrop-blur-sm border-border/40 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Weekly Activity</CardTitle>
                <CardDescription className="text-xs">Your sessions over the last 7 days</CardDescription>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingActivity ? (
                <div className="h-48 w-full flex items-end justify-between gap-3 pt-6">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="w-full flex flex-col items-center gap-2">
                      <Skeleton className="w-full max-w-[2.5rem] h-16 rounded-t-lg" />
                      <Skeleton className="h-3 w-6" />
                    </div>
                  ))}
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-center">
                  <BarChart3 className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No activity data yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Start uploading to see your activity chart</p>
                </div>
              ) : (
                <div className="w-full pt-6" style={{ height: "192px" }}>
                  <div className="relative w-full h-full flex items-end justify-between gap-3">
                    {chartData.map((item, i) => {
                      const barMaxHeight = 140; // px (192 - padding for label)
                      const heightPx = maxCount > 0 ? Math.max((item.count / maxCount) * barMaxHeight, 8) : 8;
                      return (
                        <div key={i} className="relative w-full flex flex-col items-center gap-2 group">
                          <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[11px] px-2 py-0.5 rounded-md shadow-lg pointer-events-none z-10 font-semibold whitespace-nowrap">
                            {item.count} {item.count === 1 ? "session" : "sessions"}
                          </div>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: heightPx }}
                            transition={{ duration: 0.8, delay: 0.4 + i * 0.08, ease: "easeOut" }}
                            className="w-full max-w-[2.5rem] rounded-t-lg bg-gradient-to-t from-primary/60 to-primary/20 hover:from-primary hover:to-primary/60 transition-colors cursor-pointer"
                          />
                          <span className="text-[11px] text-muted-foreground font-medium">{item.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Uploads */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card/40 backdrop-blur-sm border-border/40 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Recent Uploads</CardTitle>
                <CardDescription className="text-xs">Click to view products</CardDescription>
              </div>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {uploads.length > 0 ? (
                <div className="space-y-3">
                  {uploads.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.matches && item.matches.length > 0) {
                          setRecommendations(item.matches);
                          addUpload({ ...item });
                          navigate("/recommendations");
                        }
                      }}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors group ${item.matches?.length > 0 ? "cursor-pointer hover:bg-primary/5" : "opacity-70"}`}
                    >
                      {item.imageUrl ? (
                        <div className="h-10 w-10 rounded-lg overflow-hidden border border-border/50 shrink-0 bg-muted">
                          <img src={item.imageUrl} alt="upload" className="h-full w-full object-cover group-hover:scale-110 transition-transform" loading="lazy" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                          <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.id}</p>
                        <p className="text-[11px] text-muted-foreground">{item.date} · {item.itemsDetected} item{item.itemsDetected !== 1 ? "s" : ""}</p>
                      </div>
                      {item.matches?.length > 0 ? (
                        <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                      ) : (
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                          {item.status}
                        </span>
                      )}
                    </div>
                  ))}
                  {uploads.length > 5 && (
                    <Link to="/history" className="block text-center text-xs text-primary hover:underline font-medium pt-1">
                      View all uploads →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center">
                  <div className="h-12 w-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
                    <Camera className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">No uploads yet</p>
                  <Link to="/upload" className="text-xs text-primary hover:underline font-medium mt-2 flex items-center gap-1">
                    Upload your first outfit <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card className="bg-card/40 border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Notifications</CardTitle>
          <CardDescription className="text-xs">Price alerts and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {notifications.slice(0, 8).map((n) => (
                <div key={n._id} className={`rounded-lg border p-2 text-xs ${n.isRead ? "border-border/30" : "border-primary/40 bg-primary/5"}`}>
                  <p>{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/40 border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Quick Feedback</CardTitle>
          <CardDescription className="text-xs">Tell us if results felt useful</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full min-h-20 rounded-lg border border-input bg-background p-3 text-sm"
            placeholder="Write your feedback..."
          />
          <Button
            size="sm"
            onClick={() => {
              localStorage.setItem("deep-fashion-feedback", feedback);
            }}
          >
            Save Feedback
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
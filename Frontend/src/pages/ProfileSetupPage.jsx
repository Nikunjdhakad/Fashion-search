import { motion } from "framer-motion";
import { User, Phone, Shield, Sparkles, Upload, Heart, Clock } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "@/config";
import usePageTitle from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";

export default function ProfileSetupPage() {
  const { user, favorites, logout } = useAppContext();
  usePageTitle("Profile");
  const displayName = user?.name || user?.fullName || user?.username || "User";
  const completionChecks = [
    Boolean(user?.name),
    Boolean(user?.email),
    Boolean(user?.stylePreference),
    Boolean(user?.fitPreference),
  ];
  const completionPct = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100);

  const handleExportData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/export-data`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "deep-fashion-user-export.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Delete your account permanently? This cannot be undone.");
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) logout();
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-72 border-r border-border/40 bg-card/20 backdrop-blur-xl hidden lg:flex flex-col p-6"
      >
        <div className="flex flex-col items-center text-center pb-6 border-b border-border/40 mb-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[3px] shadow-lg shadow-indigo-500/20 mb-4">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=128&bold=true`}
              alt="Avatar"
              className="h-full w-full rounded-full object-cover border-[3px] border-background"
            />
          </div>
          <h3 className="font-bold text-lg tracking-tight">{displayName}</h3>
          <p className="text-sm text-muted-foreground">@{user?.username || "user"}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="h-3 w-3" />
            {user?.styleLevel || "Fashion Forward"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl bg-background/50 border border-border/30 p-3 text-center">
            <p className="text-2xl font-bold">{user?.uploadsCount || 0}</p>
            <p className="text-[11px] text-muted-foreground font-medium">Uploads</p>
          </div>
          <div className="rounded-xl bg-background/50 border border-border/30 p-3 text-center">
            <p className="text-2xl font-bold">{favorites?.length || 0}</p>
            <p className="text-[11px] text-muted-foreground font-medium">Favorites</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <Link to="/upload" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors group">
            <Upload className="h-4 w-4 group-hover:scale-110 transition-transform" /> Visual Search
          </Link>
          <Link to="/recommendations" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors group">
            <Heart className="h-4 w-4 group-hover:scale-110 transition-transform" /> Style Matches
          </Link>
          <Link to="/history" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors group">
            <Clock className="h-4 w-4 group-hover:scale-110 transition-transform" /> Search History
          </Link>
        </nav>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight mb-1">Profile</h1>
          <p className="text-muted-foreground">Your account information.</p>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-1">Profile Completion</p>
            <div className="h-2 rounded-full bg-muted overflow-hidden max-w-sm">
              <div className="h-full bg-primary" style={{ width: `${completionPct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{completionPct}% complete</p>
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 mb-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Account Info
            </h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Verified
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</p>
              <p className="font-semibold text-base flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" /> {user?.username || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mobile Number</p>
              <p className="font-semibold text-base flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" /> {user?.mobileNo || "—"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <User className="h-5 w-5 text-primary" /> Personal Info
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Display Name</p>
              <p className="text-base font-semibold">{displayName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Member Since</p>
              <p className="text-base font-semibold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—"}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 shadow-sm mt-6"
        >
          <h2 className="text-lg font-semibold mb-4">Privacy Controls</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExportData}>Export My Data</Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LayoutDashboard, Users, Search, Activity, ArrowLeft,
  Shield, Menu, X, ChevronRight, LogOut, ClipboardList, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";

const sidebarLinks = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Searches", path: "/admin/searches", icon: Search },
  { name: "Activity", path: "/admin/activity", icon: Activity },
  { name: "Global Search", path: "/admin/global-search", icon: Bell },
  { name: "Audit Logs", path: "/admin/audit", icon: ClipboardList },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = user?.name || user?.username || "Admin";

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-primary/20">

      {/* ═══ Desktop Sidebar ═══ */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/40 bg-card/30 backdrop-blur-xl fixed top-0 left-0 h-screen z-40">
        {/* Brand */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border/40 shrink-0">
          <Logo className="h-7 w-7" />
          <span className="font-bold text-lg tracking-tight">Admin Panel</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive(link.path)
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <link.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive(link.path) && "text-primary")} />
              {link.name}
              {isActive(link.path) && (
                <ChevronRight className="h-3.5 w-3.5 ml-auto text-primary/50" />
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-border/40 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Site
          </Link>
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[2px] shadow-sm shrink-0">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=64&bold=true`}
                alt="Avatar"
                className="h-full w-full rounded-full object-cover border border-background"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3 text-amber-500" /> Admin
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ Main Content ═══ */}
      <div className="flex-1 flex flex-col lg:ml-64">

        {/* Mobile Top Bar */}
        <header className="lg:hidden h-14 flex items-center justify-between px-4 border-b border-border/40 bg-background/95 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              <span className="font-bold text-sm">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile Nav Drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-b border-border/40 bg-background/98 backdrop-blur-xl overflow-hidden z-40"
            >
              <div className="px-4 py-3 space-y-1">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      isActive(link.path)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/dashboard"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors mt-2 border-t border-border/30 pt-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back to Site
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Top Bar */}
        <header className="hidden lg:flex h-16 items-center justify-between px-8 border-b border-border/40 bg-background/95 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-muted-foreground">
              DesiFit Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={logout}
              className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, LayoutDashboard, Upload, Heart, User, Menu, X, LogOut, ExternalLink, Mail, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";

export default function AppLayout() {
  const location = useLocation();
  const { user, logout } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Public nav links — always visible
  const publicNavLinks = [
    { name: "Search", path: "/upload", icon: Upload },
    { name: "Studio", path: "/studio", icon: Sparkles },
    { name: "Matches", path: "/recommendations", icon: Heart },
  ];

  // Auth-only nav links — visible only when logged in
  const authNavLinks = [
    { name: "Favorites", path: "/favorites", icon: Heart },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Profile", path: "/profile-setup", icon: User },
  ];

  const navLinks = user ? [...publicNavLinks, ...authNavLinks] : publicNavLinks;

  const closeMobile = () => setMobileMenuOpen(false);

  const displayName = user?.name || user?.username || "User";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" onClick={closeMobile}>
            <Logo className="h-8 w-8 group-hover:scale-105 transition-transform" />
            <span className="font-bold text-xl tracking-tight">DesiFit</span>
          </Link>

          <div className="flex items-center gap-6">
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-5 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "transition-colors hover:text-foreground/80 flex items-center gap-2",
                    location.pathname === link.path
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              {/* Admin Panel link — for admins */}
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Admin
                </Link>
              )}

              {/* Sign In — for guests */}
              {!user && (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
                >
                  Sign In
                </Link>
              )}

              {/* User avatar + sign out — for logged-in users (desktop) */}
              {user && (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/profile-setup"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted/60 transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[2px] shadow-sm">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=64&bold=true`}
                        alt="Avatar"
                        className="h-full w-full rounded-full object-cover border border-background"
                      />
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate">{displayName}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              )}

              <ThemeToggle />

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border/40 bg-background/98 backdrop-blur-xl overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
                {/* User info bar (mobile) */}
                {user && (
                  <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-muted/30 border border-border/30">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[2px] shadow-sm shrink-0">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=64&bold=true`}
                        alt="Avatar"
                        className="h-full w-full rounded-full object-cover border border-background"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground">@{user?.username || "user"}</p>
                    </div>
                  </div>
                )}

                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeMobile}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      location.pathname === link.path
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                ))}

                {/* Admin Panel (mobile admin) */}
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    onClick={closeMobile}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors mt-2"
                  >
                    <Shield className="h-5 w-5" />
                    Admin Panel
                  </Link>
                )}

                {/* Sign In (mobile guest) */}
                {!user && (
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors mt-2"
                  >
                    <User className="h-5 w-5" />
                    Sign In / Sign Up
                  </Link>
                )}

                {/* Sign Out (mobile logged-in) */}
                {user && (
                  <button
                    onClick={() => { closeMobile(); logout(); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-2 border border-destructive/20"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-1 flex flex-col relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-border/30 mt-auto bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-3">
                <Logo className="h-7 w-7" />
                <span className="font-bold text-lg tracking-tight">DesiFit</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered fashion search engine. Find any clothing from a photo.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/upload" className="hover:text-foreground transition-colors">Visual Search</Link></li>
                <li><Link to="/studio" className="hover:text-foreground transition-colors">3D Studio</Link></li>
                <li><Link to="/recommendations" className="hover:text-foreground transition-colors">Style Matches</Link></li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link to="/favorites" className="hover:text-foreground transition-colors">Favorites</Link></li>
                <li><Link to="/history" className="hover:text-foreground transition-colors">Search History</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://github.com/Nikunjdhakad/Minor-Project" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1.5"><ExternalLink className="h-3.5 w-3.5" />GitHub</a></li>
                <li><a href="mailto:support@deepfashion.ai" className="hover:text-foreground transition-colors flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />Contact</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground/60">
            <p>© {new Date().getFullYear()} DesiFit. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
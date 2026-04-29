import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import AppLayout from "./layouts/AppLayout";

// Code-split all pages with React.lazy
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const UploadPage = lazy(() => import("./pages/UploadPage"));
const RecommendationsPage = lazy(() => import("./pages/RecommendationsPage"));
const TryOnStudio = lazy(() => import("./pages/TryOnStudio"));
const WardrobePage = lazy(() => import("./pages/WardrobePage"));
const ProfileSetupPage = lazy(() => import("./pages/ProfileSetupPage"));
const SearchHistoryPage = lazy(() => import("./pages/SearchHistoryPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Admin pages
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminUserDetail = lazy(() => import("./pages/admin/AdminUserDetail"));
const AdminSearches = lazy(() => import("./pages/admin/AdminSearches"));
const AdminActivity = lazy(() => import("./pages/admin/AdminActivity"));
const AdminAudit = lazy(() => import("./pages/admin/AdminAudit"));
const AdminGlobalSearch = lazy(() => import("./pages/admin/AdminGlobalSearch"));

// Loading fallback for lazy pages
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}

function LazyPage({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function ProtectedRoute({ children }) {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  return <LazyPage>{children}</LazyPage>;
}

function AdminProtectedRoute({ children }) {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  const userData = JSON.parse(userStr);
  if (!userData.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LazyPage>{children}</LazyPage>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <LazyPage><LandingPage /></LazyPage> },
      { path: "login", element: <LazyPage><LoginPage /></LazyPage> },
      { path: "signup", element: <LazyPage><LoginPage isSignup /></LazyPage> },
      { path: "dashboard", element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
      { path: "upload", element: <LazyPage><UploadPage /></LazyPage> },
      { path: "studio", element: <LazyPage><TryOnStudio /></LazyPage> },
      { path: "wardrobe", element: <ProtectedRoute><WardrobePage /></ProtectedRoute> },
      { path: "recommendations", element: <LazyPage><RecommendationsPage /></LazyPage> },
      { path: "favorites", element: <LazyPage><FavoritesPage /></LazyPage> },
      { path: "profile-setup", element: <ProtectedRoute><ProfileSetupPage /></ProtectedRoute> },
      { path: "history", element: <ProtectedRoute><SearchHistoryPage /></ProtectedRoute> },
      { path: "*", element: <LazyPage><NotFoundPage /></LazyPage> },
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    ),
    children: [
      { index: true, element: <LazyPage><AdminDashboard /></LazyPage> },
      { path: "users", element: <LazyPage><AdminUsers /></LazyPage> },
      { path: "users/:id", element: <LazyPage><AdminUserDetail /></LazyPage> },
      { path: "searches", element: <LazyPage><AdminSearches /></LazyPage> },
      { path: "activity", element: <LazyPage><AdminActivity /></LazyPage> },
      { path: "audit", element: <LazyPage><AdminAudit /></LazyPage> },
      { path: "global-search", element: <LazyPage><AdminGlobalSearch /></LazyPage> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
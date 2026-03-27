import { createBrowserRouter, RouterProvider } from "react-router-dom"
import AppLayout from "./layouts/AppLayout"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import UploadPage from "./pages/UploadPage"
import RecommendationsPage from "./pages/RecommendationsPage"
import TryOnStudio from "./pages/TryOnStudio"
import ProfileSetupPage from "./pages/ProfileSetupPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <LoginPage isSignup /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "upload", element: <UploadPage /> },
      { path: "studio", element: <TryOnStudio /> },
      { path: "recommendations", element: <RecommendationsPage /> },
      { path: "profile-setup", element: <ProfileSetupPage /> },
    ]
  }
])

function App() {
  return <RouterProvider router={router} />
}

export default App

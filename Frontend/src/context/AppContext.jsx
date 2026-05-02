import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "@/config";

const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch actual Mongo profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const stored = localStorage.getItem("user");
      if (!stored) {
        setIsLoadingProfile(false);
        return;
      }

      const parsedUser = JSON.parse(stored);
      if (!parsedUser.token) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${parsedUser.token}`,
          },
        });

        if (response.ok) {
          const profileData = await response.json();
          const fullUser = { ...profileData, token: parsedUser.token };
          setUser(fullUser);
          localStorage.setItem("user", JSON.stringify(fullUser));
        } else {
          logout();
        }
      } catch (err) {
        console.error("Failed to fetch fresh profile data:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // Uploads — loaded from localStorage, no mock fallback
  const [uploads, setUploads] = useState(() => {
    const saved = localStorage.getItem("desifit-uploads");
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [latestUpload, setLatestUpload] = useState(() => {
    const saved = localStorage.getItem("desifit-uploads");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed[0];
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem("desifit-uploads", JSON.stringify(uploads));
  }, [uploads]);

  const addUpload = (upload) => {
    setUploads((prev) => [upload, ...prev]);
    setLatestUpload(upload);
  };

  const [recommendations, setRecommendations] = useState([]);

  // Favorites state
  const [favorites, setFavorites] = useState([]);
  const [savedFilters, setSavedFilters] = useState([]);

  const fetchFavorites = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
    }
  };

  const fetchSavedFilters = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/saved-filters`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedFilters(data);
      }
    } catch (err) {
      console.error("Failed to fetch saved filters:", err);
    }
  };

  const addFavorite = async (item) => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
        return true;
      } else {
        const err = await res.json();
        console.warn(err.message);
        return false;
      }
    } catch (err) {
      console.error("Failed to add favorite:", err);
      return false;
    }
  };

  const removeFavorite = async (id) => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/favorites/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  const updateFavorite = async (id, updates) => {
    if (!user?.token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/favorites/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to update favorite:", err);
      return false;
    }
  };

  const saveFilterPreset = async ({ name, filters }) => {
    if (!user?.token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/saved-filters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ name, filters }),
      });
      if (res.ok) {
        const data = await res.json();
        setSavedFilters(data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to save filter preset:", err);
      return false;
    }
  };

  const deleteFilterPreset = async (id) => {
    if (!user?.token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/saved-filters/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedFilters(data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to delete filter preset:", err);
      return false;
    }
  };

  // Load favorites when user changes
  useEffect(() => {
    if (user?.token) {
      fetchFavorites();
      fetchSavedFilters();
    } else {
      setFavorites([]);
      setSavedFilters([]);
    }
  }, [user?.token]);

  return (
    <AppContext.Provider
      value={{
        uploads,
        addUpload,
        latestUpload,
        recommendations,
        setRecommendations,
        user,
        loginUser,
        logout,
        isLoadingProfile,
        favorites,
        addFavorite,
        updateFavorite,
        removeFavorite,
        fetchFavorites,
        savedFilters,
        fetchSavedFilters,
        saveFilterPreset,
        deleteFilterPreset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { mockOutfits, mockUploadHistory } from "@/utils/mockData";
import type { Outfit } from "@/utils/mockData";

export type UploadRecord = {
  id: string;
  date: string;
  itemsDetected: number;
  status: string;
  imageUrl?: string;
}

type AppContextType = {
  uploads: UploadRecord[];
  addUpload: (upload: UploadRecord) => void;
  latestUpload: UploadRecord | null;
  getRecommendations: () => Outfit[];
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [uploads, setUploads] = useState<UploadRecord[]>(() => {
    const saved = localStorage.getItem("luma-uploads");
    if (saved) return JSON.parse(saved);
    return mockUploadHistory; // Fallback to mock data on first load
  });

  const [latestUpload, setLatestUpload] = useState<UploadRecord | null>(() => {
    const saved = localStorage.getItem("luma-uploads");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed[0];
    }
    return mockUploadHistory[0];
  });

  useEffect(() => {
    localStorage.setItem("luma-uploads", JSON.stringify(uploads));
  }, [uploads]);

  const addUpload = (upload: UploadRecord) => {
    setUploads((prev) => [upload, ...prev]);
    setLatestUpload(upload);
  };

  const getRecommendations = () => {
    // If we have a latest upload, randomize the mock outfits slightly or just return them
    // to simulate "AI processing" based on the new image.
    if (!latestUpload) return mockOutfits;
    
    // Shuffle to simulate different results based on upload
    return [...mockOutfits].sort(() => Math.random() - 0.5);
  };

  return (
    <AppContext.Provider value={{ uploads, addUpload, latestUpload, getRecommendations }}>
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

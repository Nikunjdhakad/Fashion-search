export type Outfit = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tags: string[];
  matchScore: number;
}

export const mockOutfits: Outfit[] = [
  {
    id: "outfit-1",
    name: "Urban Explorer",
    description: "A perfect blend of comfort and style for city walking.",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tags: ["Casual", "Streetwear", "Summer"],
    matchScore: 98
  },
  {
    id: "outfit-2",
    name: "Midnight Elegance",
    description: "Sleek dark tones for evening events and dates.",
    imageUrl: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tags: ["Formal", "Evening", "Dark"],
    matchScore: 94
  },
  {
    id: "outfit-3",
    name: "Oversized Comfort",
    description: "Relaxed fit for maximum comfort without sacrificing aesthetics.",
    imageUrl: "https://images.unsplash.com/photo-1434389678219-4b6e50f3b4f6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tags: ["Streetwear", "Comfort", "Fall"],
    matchScore: 89
  },
  {
    id: "outfit-4",
    name: "Minimalist Chic",
    description: "Clean lines and neutral colors for a timeless look.",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tags: ["Minimalist", "Workwear", "Neutral"],
    matchScore: 92
  }
];

export const mockUploadHistory = [
  { id: "up-1", date: "2024-03-20", itemsDetected: 3, status: "Analyzed" },
  { id: "up-2", date: "2024-03-18", itemsDetected: 5, status: "Analyzed" },
  { id: "up-3", date: "2024-03-10", itemsDetected: 2, status: "Analyzed" },
];

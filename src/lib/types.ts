export type WeatherData = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  location: string;
  icon: string;
  lat: number;
  lon: number;
};

export type WeatherForecast = {
    date: number;
    temp: number;
    condition: string;
    icon: string;
};

export type MarketPrice = {
  id: string;
  crop: string;
  price: number;
  unit: string;
  market: string;
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
  lat: number;
  lon: number;
};

export type UserProfile = {
  id: string;
  name: string;
  mobile?: string;
  language?: string;
  avatarUrl?: string;
  state?: string;
  district?: string;
  village?: string;
}

export type Comment = {
  id: string;
  userId: string;
  content: string;
  timestamp: any; // Firestore Timestamp
  author?: UserProfile; // Populated client-side
};

export type CommunityPost = {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  imageHint?: string;
  timestamp: any; // Firestore Timestamp
  likeCount: number;
  commentCount: number;
  author?: UserProfile; // Populated client-side
};

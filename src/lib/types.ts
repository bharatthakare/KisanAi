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

export type Comment = {
  id: string;
  author: string;
  authorAvatar: string;
  timestamp: string;
  content: string;
  replies?: Comment[];
};

export type CommunityPost = {
  id: string;
  author: string;
  authorAvatar: string;
  timestamp: string;
  content: string;
  imageUrl?: string;
  imageHint?: string;
  likes: number;
  comments: Comment[];
};

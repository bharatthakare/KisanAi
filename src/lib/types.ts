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

export type CommunityPost = {
  id: string;
  author: string;
  authorAvatar: string;
  timestamp: string;
  content: string;
  imageUrl?: string;
  imageHint?: string;
  likes: number;
  comments: number;
};

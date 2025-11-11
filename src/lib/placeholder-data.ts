import type { MarketPrice } from './types';

export const marketPrices: MarketPrice[] = [
  { id: '1', crop: 'Wheat', price: 2050, unit: 'Quintal', market: 'Nagpur', trend: 'up', timestamp: '2024-07-30T10:00:00Z', lat: 21.1458, lon: 79.0882 },
  { id: '2', crop: 'Soybean', price: 4800, unit: 'Quintal', market: 'Indore', trend: 'stable', timestamp: '2024-07-30T10:00:00Z', lat: 22.7196, lon: 75.8577 },
  { id: '3', crop: 'Cotton', price: 7100, unit: 'Quintal', market: 'Aurangabad', trend: 'down', timestamp: '2024-07-30T09:30:00Z', lat: 19.8762, lon: 75.3433 },
  { id: '4', crop: 'Gram', price: 6300, unit: 'Quintal', market: 'Jaipur', trend: 'up', timestamp: '2024-07-30T09:00:00Z', lat: 26.9124, lon: 75.7873 },
  { id: '5', crop: 'Paddy', price: 2200, unit: 'Quintal', market: 'Raipur', trend: 'stable', timestamp: '2024-07-30T08:30:00Z', lat: 21.2514, lon: 81.6296 },
  { id: '6', crop: 'Tomato', price: 2500, unit: 'Quintal', market: 'Pune', trend: 'up', timestamp: '2024-07-30T11:00:00Z', lat: 18.5204, lon: 73.8567 },
  { id: '7', crop: 'Onion', price: 1800, unit: 'Quintal', market: 'Nashik', trend: 'down', timestamp: '2024-07-30T10:30:00Z', lat: 20.0112, lon: 73.7909 },
  { id: '8', crop: 'Potato', price: 1500, unit: 'Quintal', market: 'Agra', trend: 'stable', timestamp: '2024-07-30T10:15:00Z', lat: 27.1767, lon: 78.0081 },
];

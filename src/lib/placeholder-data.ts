import type { MarketPrice, CommunityPost } from './types';
import { placeholderImages } from './placeholder-images';

export const marketPrices: MarketPrice[] = [
  { id: '1', crop: 'Wheat', price: 2050, unit: 'Quintal', market: 'Nagpur', trend: 'up', timestamp: '2024-07-30T10:00:00Z' },
  { id: '2', crop: 'Soybean', price: 4800, unit: 'Quintal', market: 'Indore', trend: 'stable', timestamp: '2024-07-30T10:00:00Z' },
  { id: '3', crop: 'Cotton', price: 7100, unit: 'Quintal', market: 'Aurangabad', trend: 'down', timestamp: '2024-07-30T09:30:00Z' },
  { id: '4', crop: 'Gram', price: 6300, unit: 'Quintal', market: 'Jaipur', trend: 'up', timestamp: '2024-07-30T09:00:00Z' },
  { id: '5', crop: 'Paddy', price: 2200, unit: 'Quintal', market: 'Raipur', trend: 'stable', timestamp: '2024-07-30T08:30:00Z' },
];

export const communityPosts: CommunityPost[] = [
  {
    id: '1',
    author: 'Ramesh Patel',
    authorAvatar: placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '',
    timestamp: '2 hours ago',
    content: 'Excellent yield from the new wheat variety this season. Planning to increase the acreage next year. Any suggestions for organic fertilizers?',
    imageUrl: placeholderImages.find(p => p.id === 'community-post-1')?.imageUrl,
    imageHint: placeholderImages.find(p => p.id === 'community-post-1')?.imageHint,
    likes: 15,
    comments: 4,
  },
  {
    id: '2',
    author: 'Sunita Devi',
    authorAvatar: placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl || '',
    timestamp: '5 hours ago',
    content: 'Just finished servicing my tractor for the upcoming sowing season. Remember to check your equipment, everyone! #FarmLife',
    imageUrl: placeholderImages.find(p => p.id === 'community-post-2')?.imageUrl,
    imageHint: placeholderImages.find(p => p.id === 'community-post-2')?.imageHint,
    likes: 42,
    comments: 8,
  },
  {
    id: '3',
    author: 'Vijay Kumar',
    authorAvatar: placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl || '',
    timestamp: '1 day ago',
    content: 'The monsoon has been good in our region. How is everyone else preparing for pest control?',
    likes: 22,
    comments: 12,
  },
];

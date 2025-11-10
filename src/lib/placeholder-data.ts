import type { MarketPrice, CommunityPost, Comment } from './types';
import { placeholderImages } from './placeholder-images';

const comments: Comment[] = [
  {
    id: 'c1',
    author: 'Sunita Devi',
    authorAvatar: placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl || '',
    timestamp: '1 hour ago',
    content: 'That\'s great to hear, Ramesh! I\'ve had good results with vermicompost. It really improves soil structure.',
    replies: [
      {
        id: 'r1',
        author: 'Ramesh Patel',
        authorAvatar: placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '',
        timestamp: '30 minutes ago',
        content: 'Thanks, Sunita! I will look into vermicompost for the next season.'
      }
    ]
  },
  {
    id: 'c2',
    author: 'Vijay Kumar',
    authorAvatar: placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl || '',
    timestamp: '45 minutes ago',
    content: 'Have you tried neem-based fertilizers? They also act as a mild pesticide.',
  },
];


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
    comments: comments,
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
    comments: [],
  },
  {
    id: '3',
    author: 'Vijay Kumar',
    authorAvatar: placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl || '',
    timestamp: '1 day ago',
    content: 'The monsoon has been good in our region. How is everyone else preparing for pest control?',
    likes: 22,
    comments: [],
  },
];

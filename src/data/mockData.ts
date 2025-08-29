import { Profile, Item, SwapOffer, Match, Claim, ChatThread, Message } from '@/types';

// Mock Users
export const mockProfiles: Profile[] = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    role: 'user',
    location: {
      address: 'New York, NY',
      lat: 40.7128,
      lng: -74.0060
    },
    joinedAt: '2024-01-15T10:00:00Z',
    isVerified: true
  },
  {
    id: '2',
    email: 'greenearth@ngo.org',
    name: 'Green Earth Foundation',
    avatar: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=100&h=100&fit=crop',
    role: 'ngo',
    location: {
      address: 'San Francisco, CA',
      lat: 37.7749,
      lng: -122.4194
    },
    joinedAt: '2024-01-10T09:00:00Z',
    isVerified: true
  },
  {
    id: '3',
    email: 'sara@example.com',
    name: 'Sara Wilson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b098?w=100&h=100&fit=crop&crop=face',
    role: 'user',
    location: {
      address: 'Los Angeles, CA',
      lat: 34.0522,
      lng: -118.2437
    },
    joinedAt: '2024-02-01T14:30:00Z',
    isVerified: false
  }
];

// Mock Items
export const mockItems: Item[] = [
  {
    id: '1',
    title: 'Vintage Leather Jacket',
    description: 'Beautiful vintage leather jacket in excellent condition. Perfect for style enthusiasts!',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop'
    ],
    tags: ['vintage', 'clothing', 'leather', 'fashion'],
    category: 'Fashion',
    condition: 'excellent',
    mode: 'barter',
    desiredTags: ['books', 'electronics', 'art'],
    desiredText: 'Looking for vintage books or retro electronics',
    ownerId: '1',
    owner: mockProfiles[0],
    location: mockProfiles[0].location,
    createdAt: '2024-02-28T12:00:00Z',
    updatedAt: '2024-02-28T12:00:00Z',
    status: 'active',
    views: 45,
    isPromoted: true
  },
  {
    id: '2',
    title: 'Children Books Collection',
    description: 'Donate these amazing children books to spread joy and learning!',
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop'
    ],
    tags: ['books', 'children', 'education', 'donation'],
    category: 'Books',
    condition: 'good',
    mode: 'gift',
    ownerId: '3',
    owner: mockProfiles[2],
    location: mockProfiles[2].location,
    createdAt: '2024-02-27T15:30:00Z',
    updatedAt: '2024-02-27T15:30:00Z',
    status: 'active',
    views: 23
  },
  {
    id: '3',
    title: 'MacBook Pro 2021',
    description: 'Excellent condition MacBook Pro with M1 chip. Perfect for work or study.',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'
    ],
    tags: ['electronics', 'laptop', 'apple', 'work'],
    category: 'Electronics',
    condition: 'excellent',
    mode: 'sell',
    price: 1200,
    ownerId: '1',
    owner: mockProfiles[0],
    location: mockProfiles[0].location,
    createdAt: '2024-02-26T10:15:00Z',
    updatedAt: '2024-02-26T10:15:00Z',
    status: 'active',
    views: 78
  }
];

// Mock Swap Offers
export const mockSwapOffers: SwapOffer[] = [
  {
    id: '1',
    fromUserId: '3',
    toUserId: '1',
    fromItem: mockItems[1],
    toItem: mockItems[0],
    message: 'Hi! I love your leather jacket. Would you be interested in these children books?',
    status: 'pending',
    createdAt: '2024-02-28T14:00:00Z',
    updatedAt: '2024-02-28T14:00:00Z'
  }
];

// Mock Matches
export const mockMatches: Match[] = [];

// Mock Claims
export const mockClaims: Claim[] = [
  {
    id: '1',
    ngoId: '2',
    ngo: mockProfiles[1],
    itemId: '2',
    item: mockItems[1],
    message: 'These books would be perfect for our literacy program!',
    status: 'pending',
    createdAt: '2024-02-28T16:00:00Z',
    updatedAt: '2024-02-28T16:00:00Z'
  }
];

// Mock Chat Threads
export const mockChatThreads: ChatThread[] = [
  {
    id: '1',
    participants: [mockProfiles[0], mockProfiles[2]],
    createdAt: '2024-02-28T14:05:00Z',
    updatedAt: '2024-02-28T14:30:00Z',
    relatedItem: mockItems[0]
  }
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: '1',
    threadId: '1',
    senderId: '3',
    sender: mockProfiles[2],
    content: 'Hi! I love your leather jacket. Would you be interested in these children books?',
    type: 'text',
    createdAt: '2024-02-28T14:05:00Z',
    isRead: true
  },
  {
    id: '2',
    threadId: '1',
    senderId: '1',
    sender: mockProfiles[0],
    content: 'Thanks for reaching out! The books look great. Let me think about it.',
    type: 'text',
    createdAt: '2024-02-28T14:30:00Z',
    isRead: false
  }
];

export const categories = [
  'Fashion', 'Electronics', 'Books', 'Home & Garden', 'Sports', 
  'Toys & Games', 'Art & Crafts', 'Music', 'Automotive', 'Other'
];

export const commonTags = [
  'vintage', 'handmade', 'electronics', 'books', 'clothing', 'furniture',
  'art', 'sports', 'gaming', 'music', 'tools', 'kitchen', 'children',
  'education', 'health', 'beauty', 'outdoor', 'technology', 'collectible'
];
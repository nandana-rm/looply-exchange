// Core data types for Looply Marketplace

export type ItemMode = 'gift' | 'barter' | 'sell' | 'buy';
export type ItemCondition = 'new' | 'excellent' | 'good' | 'fair' | 'poor';
export type UserRole = 'user' | 'ngo';
export type SwapStatus = 'pending' | 'accepted' | 'rejected' | 'completed';
export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  joinedAt: string;
  isVerified: boolean;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  category: string;
  condition: ItemCondition;
  mode: ItemMode;
  price?: number; // Only for 'sell' mode
  desiredTags?: string[]; // For 'barter' mode
  desiredText?: string; // For 'barter' mode
  ownerId: string;
  owner: Profile;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'reserved' | 'claimed' | 'sold' | 'completed';
  views: number;
  isPromoted?: boolean;
}

export interface SwapOffer {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromItem: Item;
  toItem: Item;
  message?: string;
  status: SwapStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  item1: Item;
  item2: Item;
  createdAt: string;
  isCompleted: boolean;
}

export interface Claim {
  id: string;
  ngoId: string;
  ngo: Profile;
  itemId: string;
  item: Item;
  message?: string;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ChatThread {
  id: string;
  participants: Profile[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
  relatedItem?: Item;
  relatedMatch?: Match;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  sender: Profile;
  content: string;
  type: 'text' | 'image' | 'system';
  createdAt: string;
  isRead: boolean;
}

export interface SearchFilters {
  query?: string;
  categories: string[];
  modes: ItemMode[];
  priceRange: [number, number];
  condition: ItemCondition[];
  ownerTypes: ('user' | 'ngo')[];
  sortBy: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'distance';
  maxDistance?: number; // in km
  location?: {
    lat: number;
    lng: number;
  };
}

export interface AppState {
  user: Profile | null;
  items: Item[];
  swapOffers: SwapOffer[];
  matches: Match[];
  claims: Claim[];
  chatThreads: ChatThread[];
  messages: Message[];
  filters: SearchFilters;
  isLoading: boolean;
  error: string | null;
}
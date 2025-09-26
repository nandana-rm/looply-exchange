// API abstraction layer - currently uses mock data, ready for Supabase integration

import { 
  Profile, Item, SwapOffer, Match, Claim, ChatThread, Message, SearchFilters 
} from '@/types';
import { 
  mockProfiles, mockItems, mockSwapOffers, mockMatches, 
  mockClaims, mockChatThreads, mockMessages 
} from '@/data/mockData';

// Simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<Profile> {
    await delay();
    const user = mockProfiles.find(p => p.email === email);
    if (!user) throw new Error('Invalid credentials');
    return user;
  },

  async register(userData: Omit<Profile, 'id' | 'joinedAt' | 'isVerified'>): Promise<Profile> {
    await delay();
    const newUser: Profile = {
      ...userData,
      id: Date.now().toString(),
      joinedAt: new Date().toISOString(),
      isVerified: false
    };
    mockProfiles.push(newUser);
    return newUser;
  },

  async getCurrentUser(): Promise<Profile | null> {
    await delay(100);
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }
};

// Items API
export const itemsApi = {
  async getItems(filters?: SearchFilters): Promise<Item[]> {
    await delay();
    let filteredItems = [...mockItems];

    if (filters) {
      if (filters.query) {
        const query = filters.query.toLowerCase();
        filteredItems = filteredItems.filter(item =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      if (filters.categories.length > 0) {
        filteredItems = filteredItems.filter(item =>
          filters.categories.includes(item.category)
        );
      }

      if (filters.modes.length > 0) {
        filteredItems = filteredItems.filter(item =>
          filters.modes.includes(item.mode)
        );
      }

      if (filters.condition.length > 0) {
        filteredItems = filteredItems.filter(item =>
          filters.condition.includes(item.condition)
        );
      }

      if (filters.ownerTypes.length > 0) {
        filteredItems = filteredItems.filter(item =>
          filters.ownerTypes.includes(item.owner.role)
        );
      }
    }

    return filteredItems;
  },

  async getItem(id: string): Promise<Item | null> {
    await delay();
    return mockItems.find(item => item.id === id) || null;
  },

  async createItem(itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'owner'>): Promise<Item> {
    await delay();
    const owner = mockProfiles.find(p => p.id === itemData.ownerId)!;
    const newItem: Item = {
      ...itemData,
      id: Date.now().toString(),
      owner,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0
    };
    mockItems.push(newItem);
    return newItem;
  },

  async updateItem(id: string, updates: Partial<Item>): Promise<Item> {
    await delay();
    const index = mockItems.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    
    mockItems[index] = {
      ...mockItems[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return mockItems[index];
  },

  async deleteItem(id: string): Promise<void> {
    await delay();
    const index = mockItems.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    mockItems.splice(index, 1);
  }
};

// Swaps API
export const swapsApi = {
  async getSwapOffers(userId: string): Promise<SwapOffer[]> {
    await delay();
    return mockSwapOffers.filter(offer => 
      offer.fromUserId === userId || offer.toUserId === userId
    );
  },

  async createSwapOffer(offerData: Omit<SwapOffer, 'id' | 'createdAt' | 'updatedAt'>): Promise<SwapOffer> {
    await delay();
    const newOffer: SwapOffer = {
      ...offerData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockSwapOffers.push(newOffer);
    return newOffer;
  },

  async updateSwapOffer(id: string, status: SwapOffer['status']): Promise<SwapOffer> {
    await delay();
    const index = mockSwapOffers.findIndex(offer => offer.id === id);
    if (index === -1) throw new Error('Swap offer not found');
    
    mockSwapOffers[index] = {
      ...mockSwapOffers[index],
      status,
      updatedAt: new Date().toISOString()
    };
    return mockSwapOffers[index];
  }
};

// Claims API (NGO specific)
export const claimsApi = {
  async getClaims(ngoId: string): Promise<Claim[]> {
    await delay();
    return mockClaims.filter(claim => claim.ngoId === ngoId);
  },

  async createClaim(claimData: Omit<Claim, 'id' | 'createdAt' | 'updatedAt'>): Promise<Claim> {
    await delay();
    const newClaim: Claim = {
      ...claimData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockClaims.push(newClaim);
    return newClaim;
  },

  async updateClaim(id: string, status: Claim['status']): Promise<Claim> {
    await delay();
    const index = mockClaims.findIndex(claim => claim.id === id);
    if (index === -1) throw new Error('Claim not found');
    
    mockClaims[index] = {
      ...mockClaims[index],
      status,
      updatedAt: new Date().toISOString()
    };
    return mockClaims[index];
  }
};

// Chat API
export const chatApi = {
  async getChatThreads(userId: string): Promise<ChatThread[]> {
    await delay();
    return mockChatThreads.filter(thread =>
      thread.participants.some(p => p.id === userId)
    ).map(thread => ({
      ...thread,
      lastMessage: mockMessages
        .filter(m => m.threadId === thread.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    }));
  },

  async getMessages(threadId: string): Promise<Message[]> {
    await delay();
    return mockMessages
      .filter(message => message.threadId === threadId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async sendMessage(messageData: Omit<Message, 'id' | 'createdAt' | 'sender'>): Promise<Message> {
    await delay();
    const sender = mockProfiles.find(p => p.id === messageData.senderId)!;
    const newMessage: Message = {
      ...messageData,
      id: Date.now().toString(),
      sender,
      createdAt: new Date().toISOString()
    };
    mockMessages.push(newMessage);
    return newMessage;
  }
};
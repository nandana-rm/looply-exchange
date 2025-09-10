// API abstraction layer - now using real Supabase integration

// Re-export all APIs from the new Supabase implementation
export { 
  authApi, 
  itemsApi, 
  swapsApi, 
  claimsApi, 
  ngoDrivesApi,
  forumsApi,
  usersApi,
  swipesApi,
  donationsApi
} from './supabase';

// Legacy chat API - TODO: Implement real-time messaging
export const chatApi = {
  async getChatThreads(userId: string): Promise<any[]> {
    // TODO: Implement real chat functionality
    return [];
  },

  async getMessages(threadId: string): Promise<any[]> {
    // TODO: Implement real messaging
    return [];
  },

  async sendMessage(messageData: any): Promise<any> {
    // TODO: Implement message sending
    throw new Error('Chat not implemented yet');
  }
};

// Legacy exports removed - using real Supabase API

// All APIs now use real Supabase - see supabase.ts
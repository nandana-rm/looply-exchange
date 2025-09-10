// Real Supabase API implementation
import { supabase } from '@/integrations/supabase/client';
import { 
  Profile, Item, SwapOffer, Match, Claim, ChatThread, Message, SearchFilters 
} from '@/types';

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<{ user: any; session: any }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return { user: data.user, session: data.session };
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'ngo';
    location: string;
  }): Promise<{ user: any; session: any }> {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: userData.name,
          role: userData.role,
          location: userData.location
        }
      }
    });

    if (error) throw error;
    return { user: data.user, session: data.session };
  },

  async getCurrentUser(): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};

// Items API (Listings)
export const itemsApi = {
  async getItems(filters?: SearchFilters): Promise<any[]> {
    let query = supabase
      .from('listings')
      .select(`
        *,
        users!listings_user_id_fkey (
          id,
          name,
          email,
          role,
          karma_points
        )
      `)
      .eq('status', 'available');

    if (filters?.query) {
      query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }

    if (filters?.categories && filters.categories.length > 0) {
      // Note: This assumes categories are stored as tags or in a separate field
      // You may need to adjust based on your schema
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getItem(id: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        users!listings_user_id_fkey (
          id,
          name,
          email,
          role,
          karma_points
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createItem(itemData: {
    title: string;
    description: string;
    images?: string[];
    tags?: string[];
    location?: string;
  }): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('listings')
      .insert({
        title: itemData.title,
        description: itemData.description,
        images: itemData.images || [],
        tags: itemData.tags || [],
        location: itemData.location,
        status: 'available',
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateItem(id: string, updates: Partial<any>): Promise<any> {
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Swaps API (Matches)
export const swapsApi = {
  async getSwapOffers(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user_a:users!matches_user_a_id_fkey (id, name, email),
        user_b:users!matches_user_b_id_fkey (id, name, email)
      `)
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

    if (error) throw error;
    return data || [];
  },

  async createSwapOffer(offerData: {
    user_b_id: string;
    item_a_id: string;
    item_b_id: string;
  }): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('matches')
      .insert({
        user_a_id: user.id,
        user_b_id: offerData.user_b_id,
        item_a_id: offerData.item_a_id,
        item_b_id: offerData.item_b_id,
        status: 'pending' as const
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSwapOffer(id: string, status: 'pending' | 'matched' | 'cancelled'): Promise<any> {
    const { data, error } = await supabase
      .from('matches')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Claims API (NGO specific)
export const claimsApi = {
  async getClaims(ngoId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('claims')
      .select(`
        *,
        listings!claims_listing_id_fkey (
          id,
          title,
          description,
          images
        )
      `)
      .eq('ngo_id', ngoId);

    if (error) throw error;
    return data || [];
  },

  async createClaim(claimData: {
    listing_id: string;
  }): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('claims')
      .insert({
        ngo_id: user.id,
        listing_id: claimData.listing_id,
        status: 'claimed' as const
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateClaim(id: string, status: 'claimed' | 'pickup_arranged' | 'received'): Promise<any> {
    const { data, error } = await supabase
      .from('claims')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// NGO Drives API
export const ngoDrivesApi = {
  async getDrives(): Promise<any[]> {
    const { data, error } = await supabase
      .from('ngo_drives')
      .select(`
        *,
        users!ngo_drives_ngo_id_fkey (
          id,
          name,
          email,
          role
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createDrive(driveData: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    deadline?: string;
  }): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('ngo_drives')
      .insert({
        ngo_id: user.id,
        title: driveData.title,
        description: driveData.description,
        priority: driveData.priority,
        deadline: driveData.deadline,
        status: 'active' as const
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Forums API
export const forumsApi = {
  async getForumPosts(): Promise<any[]> {
    const { data, error } = await supabase
      .from('forums')
      .select(`
        *,
        users!forums_user_id_fkey (
          id,
          name,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createForumPost(postData: {
    title: string;
    content: string;
    community?: string;
  }): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('forums')
      .insert({
        user_id: user.id,
        title: postData.title,
        content: postData.content,
        community: postData.community
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getComments(forumId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users!comments_user_id_fkey (
          id,
          name,
          email,
          role
        )
      `)
      .eq('forum_id', forumId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createComment(commentData: {
    forum_id: string;
    content: string;
  }): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        forum_id: commentData.forum_id,
        content: commentData.content
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Users API
export const usersApi = {
  async getCurrentUserProfile(): Promise<any | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(updates: {
    name?: string;
    [key: string]: any;
  }): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Swipes API
export const swipesApi = {
  async createSwipe(listingId: string, action: 'like' | 'pass'): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const swipeAction = action === 'pass' ? 'reject' : 'like';
    
    const { data, error } = await supabase
      .from('swipes')
      .insert({
        user_id: user.id,
        listing_id: listingId,
        action: swipeAction as 'like' | 'reject'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserSwipes(): Promise<any[]> {
    const { data, error } = await supabase
      .from('swipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// Donations API
export const donationsApi = {
  async createDonation(ngodriveId: string, itemId?: string): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('donations')
      .insert({
        user_id: user.id,
        ngo_drive_id: ngodriveId,
        item_id: itemId,
        status: 'pledged' as const
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserDonations(): Promise<any[]> {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        ngo_drives!donations_ngo_drive_id_fkey (
          id,
          title,
          description,
          users!ngo_drives_ngo_id_fkey (name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
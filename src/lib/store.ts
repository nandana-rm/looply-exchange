// Zustand store for global state management

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile, Item, SearchFilters, ItemMode, ItemCondition } from '@/types';

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  likedItems: string[];
  savedItems: string[];
  login: (user: Profile) => void;
  logout: () => void;
  updateUser: (updates: Partial<Profile>) => void;
  addLikedItem: (itemId: string) => void;
  removeLikedItem: (itemId: string) => void;
  addSavedItem: (itemId: string) => void;
  removeSavedItem: (itemId: string) => void;
}

interface FiltersState {
  filters: SearchFilters;
  updateFilters: (updates: Partial<SearchFilters>) => void;
  resetFilters: () => void;
}

interface AppState {
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultFilters: SearchFilters = {
  query: '',
  categories: [],
  modes: [],
  priceRange: [0, 10000],
  condition: [],
  ownerTypes: [],
  sortBy: 'newest',
  maxDistance: 50
};

// Auth Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      likedItems: [],
      savedItems: [],
      login: (user) => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('currentUser');
        set({ user: null, isAuthenticated: false, likedItems: [], savedItems: [] });
      },
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          set({ user: updatedUser });
        }
      },
      addLikedItem: (itemId) => {
        set((state) => ({
          likedItems: [...state.likedItems, itemId]
        }));
      },
      removeLikedItem: (itemId) => {
        set((state) => ({
          likedItems: state.likedItems.filter(id => id !== itemId)
        }));
      },
      addSavedItem: (itemId) => {
        set((state) => ({
          savedItems: [...state.savedItems, itemId]
        }));
      },
      removeSavedItem: (itemId) => {
        set((state) => ({
          savedItems: state.savedItems.filter(id => id !== itemId)
        }));
      },
    }),
    {
      name: 'looply-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        likedItems: state.likedItems,
        savedItems: state.savedItems
      }),
    }
  )
);

// Filters Store
export const useFiltersStore = create<FiltersState>((set) => ({
  filters: defaultFilters,
  updateFilters: (updates) =>
    set((state) => ({
      filters: { ...state.filters, ...updates }
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));

// App Store
export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  error: null,
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
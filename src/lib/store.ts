// Zustand store for global state management

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile, Item, SearchFilters, ItemMode, ItemCondition } from '@/types';

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  login: (user: Profile) => void;
  logout: () => void;
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
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('currentUser');
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'looply-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
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
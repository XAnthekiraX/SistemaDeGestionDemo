import { create } from 'zustand';
import type { User, UserRole } from '@/types/auth.types';

interface AuthState {
  access_token: string | null;
  refresh_token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  access_token: null,
  refresh_token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setTokens: (access_token, refresh_token) => {
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    set({ access_token, refresh_token, isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    set({ access_token: null, refresh_token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  initialize: () => {
    const access_token = localStorage.getItem('access_token');
    const refresh_token = localStorage.getItem('refresh_token');
    const userJson = localStorage.getItem('user');
    if (access_token && refresh_token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        set({ access_token, refresh_token, user, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));

export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectUserRole = (state: AuthState) => state.user?.role as UserRole | undefined;

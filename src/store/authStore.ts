import { create } from 'zustand';
import { authApi, type User, type LoginCredentials, type RegisterData } from '@/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isLoggedIn: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  isLoggedIn: false,

  login: async (credentials) => {
    try {
      set({ loading: true });
      const response = await authApi.login(credentials);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.token,
        loading: false,
        isLoggedIn: true,
      });
    } catch (error: any) {
      set({ loading: false });
      throw error; // Toast will be shown by axios interceptor
    }
  },

  register: async (data) => {
    try {
      set({ loading: true });
      const response = await authApi.register(data);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.token,
        loading: false,
        isLoggedIn: true,
      });
    } catch (error: any) {
      set({ loading: false });
      throw error; // Toast will be shown by axios interceptor
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isLoggedIn: false,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoggedIn: false, user: null });
      return;
    }

    try {
      const user = await authApi.me();
      set({
        user,
        isLoggedIn: true,
      });
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        user: null,
        token: null,
        isLoggedIn: false,
      });
      // Toast will be shown by axios interceptor
    }
  },
}));

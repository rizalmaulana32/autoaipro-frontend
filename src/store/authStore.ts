import { create } from 'zustand';
import { authApi, type User, type LoginCredentials, type RegisterData } from '@/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  isLoggedIn: !!localStorage.getItem('token'),

  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
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
      set({
        error: error.message || 'Login failed',
        loading: false,
      });
      throw error;
    }
  },

  register: async (data) => {
    try {
      set({ loading: true, error: null });
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
      set({
        error: error.message || 'Registration failed',
        loading: false,
      });
      throw error;
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
    }
  },

  clearError: () => set({ error: null }),
}));

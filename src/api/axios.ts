import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on the login page
      const isLoginPage = window.location.pathname === '/login';

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (!isLoginPage) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } else {
        // On login page, just show the error without redirecting
        const errorMessage = error.response?.data?.message || 'Invalid credentials';
        toast.error(errorMessage);
      }
    } else {
      // Handle other errors - show toast notification
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      toast.error(errorMessage);
    }

    return Promise.reject({
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default api;

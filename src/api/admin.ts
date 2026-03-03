import api from './axios';
import type { User } from './auth';

export const adminApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data.users;
  },

  updateUserRole: async (id: string, role: 'user' | 'admin'): Promise<User> => {
    const response = await api.put(`/admin/users/${id}`, { role });
    return response.data.user;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
};

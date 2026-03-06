import api from './axios';

export interface ClientMember {
  _id: string;
  username: string;
  email: string;
  role: 'client_admin' | 'member';
  status: 'active' | 'suspended';
  created_at: string;
  last_login?: string;
}

export interface AccountStats {
  total: number;
  active: number;
  suspended: number;
  account_limit: number;
  remaining: number;
}

export interface ClientProperty {
  _id: string;
  buildingName?: string;
  prefecture?: string;
  city?: string;
  rent?: string;
  management_status: 'pending' | 'approved' | 'rejected' | 'archived';
  source?: string;
  created_at: string;
  files?: { image_urls?: string[] };
}

export interface PropertyStats {
  total: number;
  pending: number;
  approved: number;
}

export const clientAdminApi = {
  getAccounts: async (): Promise<{ members: ClientMember[]; stats: AccountStats }> => {
    const response = await api.get('/client/accounts');
    return response.data;
  },

  createAccount: async (data: {
    username: string;
    email: string;
    password?: string;
    role: 'client_admin' | 'member';
  }): Promise<{ user: ClientMember; temp_password: string }> => {
    const response = await api.post('/client/accounts', data);
    return response.data;
  },

  updateAccount: async (id: string, data: { status?: 'active' | 'suspended'; role?: 'client_admin' | 'member' }): Promise<ClientMember> => {
    const response = await api.put(`/client/accounts/${id}`, data);
    return response.data.user;
  },

  deleteAccount: async (id: string): Promise<void> => {
    await api.delete(`/client/accounts/${id}`);
  },

  getProperties: async (params?: { status?: string; search?: string; date?: string }): Promise<{ properties: ClientProperty[]; stats: PropertyStats }> => {
    const response = await api.get('/client/properties', { params });
    return response.data;
  },

  updatePropertyStatus: async (id: string, status: 'pending' | 'approved' | 'rejected' | 'archived'): Promise<ClientProperty> => {
    const response = await api.put(`/client/properties/${id}/status`, { status });
    return response.data.property;
  },
};

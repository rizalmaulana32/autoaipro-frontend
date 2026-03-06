import api from './axios';

export interface ClientCompany {
  _id: string;
  company_name: string;
  email: string;
  account_limit: number;
  expiry_date: string;
  status: 'active' | 'inactive';
  created_at: string;
  account_count: number;
}

export interface SystemAdminStats {
  total_clients: number;
  active_clients: number;
  total_accounts_issued: number;
}

export interface CompanyUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'suspended';
  created_at: string;
  last_login?: string;
}

export const systemAdminApi = {
  getClients: async (): Promise<{ clients: ClientCompany[]; stats: SystemAdminStats }> => {
    const response = await api.get('/system-admin/clients');
    return response.data;
  },

  getClientUsers: async (clientId: string): Promise<CompanyUser[]> => {
    const response = await api.get(`/system-admin/clients/${clientId}/users`);
    return response.data.users;
  },

  createClient: async (data: {
    company_name: string;
    email: string;
    username: string;
    password: string;
    account_limit: number;
    expiry_date: string;
  }): Promise<{ client: ClientCompany; temp_password: string; username: string }> => {
    const response = await api.post('/system-admin/clients', data);
    return response.data;
  },

  updateClient: async (id: string, data: Partial<ClientCompany>): Promise<ClientCompany> => {
    const response = await api.put(`/system-admin/clients/${id}`, data);
    return response.data.client;
  },

  deleteClient: async (id: string): Promise<void> => {
    await api.delete(`/system-admin/clients/${id}`);
  },
};

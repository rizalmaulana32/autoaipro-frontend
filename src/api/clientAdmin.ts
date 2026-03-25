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
  reins_id?: string;

  // Location
  buildingName?: string;
  prefecture?: string;
  city?: string;
  town?: string;
  addressDetail?: string;
  roomNumber?: string;

  // Price
  rent?: string;
  securityDeposit?: string;
  keyMoney?: string;
  guaranteeDeposit?: string;
  managementFee?: string;
  commonServiceFee?: string;
  renewalFee?: string;
  contractPeriod?: string;

  // Area
  usableArea?: string;
  balconyArea?: string;

  // Transportation
  railwayLine1?: string;
  station1?: string;
  walkMinutes1?: string;
  railwayLine2?: string;
  station2?: string;
  walkMinutes2?: string;
  railwayLine3?: string;
  station3?: string;
  walkMinutes3?: string;

  // Layout & Building
  layoutType?: string;
  roomCount?: string;
  constructionDate?: string;
  buildingStructure?: string;
  aboveGroundFloors?: string;
  floorLocation?: string;
  balconyDirection?: string;
  totalUnits?: string;

  // Move-in & Parking
  moveInDate?: string;
  parkingAvailable?: string;
  parkingFee?: string;

  // Company
  companyName?: string;
  companyPhone?: string;
  inquiryPhone?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  internalManagementCode?: string;

  // Equipment & Amenities
  equipment?: string;
  amenities?: string;
  conditions?: string;
  housingPerformance?: string;

  // Files
  files?: {
    html_url?: string;
    floorplan_url?: string;
    image_urls?: string[];
  };

  // Meta
  management_status: 'pending' | 'approved' | 'rejected' | 'archived';
  source?: string;
  created_at: string;
  updated_at?: string;
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

  reparseProperty: async (id: string): Promise<{ updated: number; fields: string[] }> => {
    const response = await api.post(`/client/properties/${id}/reparse`);
    return response.data;
  },
};

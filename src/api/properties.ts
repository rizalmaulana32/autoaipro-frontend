import api from './axios';

export interface Property {
  _id: string;
  reins_id: string;
  buildingName: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  rent?: {
    monthlyRent?: number;
    managementFee?: number;
    deposit?: number;
    keyMoney?: number;
  };
  address?: {
    prefecture?: string;
    city?: string;
    town?: string;
    detail?: string;
  };
  building?: {
    structure?: string;
    floors?: number;
    builtYear?: number;
    builtMonth?: number;
  };
  room?: {
    floorLocation?: string;
    layout?: string;
    area?: number;
  };
  equipment?: string[];
  amenities?: string[];
  files?: {
    floorplan_filename?: string;
    floorplan_path?: string;
    html_filename?: string;
    html_path?: string;
    image_filenames?: string[];
    image_paths?: string[];
  };
  created_at: string;
  updated_at: string;
}

export const propertiesApi = {
  // Get all properties
  getAll: async (): Promise<Property[]> => {
    const response = await api.get('/properties');
    return response.data;
  },

  // Get single property
  getById: async (id: string): Promise<Property> => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  // Delete property
  delete: async (id: string): Promise<void> => {
    await api.delete(`/properties/${id}`);
  },

  // Create property (for Chrome Extension)
  create: async (formData: FormData): Promise<Property> => {
    const response = await api.post('/properties', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

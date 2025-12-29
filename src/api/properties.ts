import api from './axios';

// Property interface matching ACTUAL backend schema
export interface Property {
  _id: string;
  user_id: string;
  reins_id: string;

  // Location (flat, not nested)
  prefecture?: string;
  city?: string;
  town?: string;
  addressDetail?: string;
  buildingName?: string;
  roomNumber?: string;

  // Price (flat, not nested)
  rent?: string;
  securityDeposit?: string;
  keyMoney?: string;
  guaranteeDeposit?: string;
  managementFee?: string;
  commonServiceFee?: string;

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

  // Layout
  layoutType?: string;
  roomCount?: string;

  // Building
  constructionDate?: string;
  buildingStructure?: string;
  aboveGroundFloors?: string;
  undergroundFloors?: string;
  floorLocation?: string;
  balconyDirection?: string;

  // Equipment & Amenities
  equipment?: string;
  amenities?: string;

  // Files
  files?: {
    html_path?: string;
    html_filename?: string;
    floorplan_path?: string;
    floorplan_filename?: string;
    image_paths?: string[];
    image_filenames?: string[];
  };

  // Metadata
  created_at: string;
  updated_at: string;
}

export const propertiesApi = {
  // Get all properties (with pagination)
  getAll: async (offset: number = 0, limit: number = 20): Promise<{
    properties: Property[];
    total: number;
    count: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  }> => {
    const response = await api.get('/properties', {
      params: { offset, limit },
    });
    return {
      properties: response.data.properties || [],
      total: response.data.total || 0,
      count: response.data.count || 0,
      offset: response.data.offset || 0,
      limit: response.data.limit || 20,
      hasMore: response.data.hasMore || false,
    };
  },

  // Get single property
  getById: async (id: string): Promise<Property> => {
    const response = await api.get(`/properties/${id}`);
    return response.data.property || response.data;
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

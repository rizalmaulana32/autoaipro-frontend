import { create } from 'zustand';
import { propertiesApi, type Property } from '@/api';

interface PropertyFilters {
  search: string;
  status: 'all' | 'pending' | 'processing' | 'success' | 'failed';
}

interface PropertyState {
  properties: Property[];
  currentProperty: Property | null;
  loading: boolean;
  error: string | null;
  filters: PropertyFilters;

  // Computed values
  filteredProperties: () => Property[];
  countByStatus: () => Record<string, number>;

  // Actions
  fetchProperties: () => Promise<void>;
  fetchProperty: (id: string) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  setFilters: (filters: Partial<PropertyFilters>) => void;
  clearError: () => void;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  currentProperty: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    status: 'all',
  },

  // Computed: Filter properties based on search and status
  filteredProperties: () => {
    const { properties, filters } = get();

    return properties.filter((property) => {
      // Filter by status
      if (filters.status !== 'all' && property.status !== filters.status) {
        return false;
      }

      // Filter by search (building name or REINS ID)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = property.buildingName?.toLowerCase().includes(searchLower);
        const matchesReinsId = property.reins_id?.toLowerCase().includes(searchLower);
        return matchesName || matchesReinsId;
      }

      return true;
    });
  },

  // Computed: Count properties by status
  countByStatus: () => {
    const { properties } = get();
    const counts: Record<string, number> = {
      all: properties.length,
      pending: 0,
      processing: 0,
      success: 0,
      failed: 0,
    };

    properties.forEach((property) => {
      if (property.status in counts) {
        counts[property.status]++;
      }
    });

    return counts;
  },

  fetchProperties: async () => {
    try {
      set({ loading: true, error: null });
      const properties = await propertiesApi.getAll();
      set({ properties, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch properties',
        loading: false,
      });
      throw error;
    }
  },

  fetchProperty: async (id) => {
    try {
      set({ loading: true, error: null });
      const property = await propertiesApi.getById(id);
      set({ currentProperty: property, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch property',
        loading: false,
      });
      throw error;
    }
  },

  deleteProperty: async (id) => {
    try {
      set({ loading: true, error: null });
      await propertiesApi.delete(id);

      // Remove from local state
      set((state) => ({
        properties: state.properties.filter((p) => p._id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete property',
        loading: false,
      });
      throw error;
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearError: () => set({ error: null }),
}));

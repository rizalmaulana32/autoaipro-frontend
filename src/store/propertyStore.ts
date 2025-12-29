import { create } from 'zustand';
import { propertiesApi, type Property } from '@/api';

interface PropertyFilters {
  search: string;
  prefecture?: string;
  city?: string;
  minRent?: string;
  maxRent?: string;
  layoutType?: string;
  minArea?: string;
  maxArea?: string;
  buildingStructure?: string;
  station?: string;
}

interface PropertyState {
  properties: Property[];
  currentProperty: Property | null;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  total: number;
  offset: number;
  filters: PropertyFilters;

  // Computed values
  filteredProperties: () => Property[];
  activeFiltersCount: () => number;
  getActiveFilters: () => Array<{ key: string; value: string; label: string }>;

  // Actions
  fetchProperties: (reset?: boolean) => Promise<void>;
  fetchMoreProperties: () => Promise<void>;
  fetchProperty: (id: string) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  setFilters: (filters: Partial<PropertyFilters>) => void;
  clearFilters: () => void;
  removeFilter: (key: keyof PropertyFilters) => void;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  currentProperty: null,
  loading: false,
  loadingMore: false,
  hasMore: true,
  total: 0,
  offset: 0,
  filters: {
    search: '',
  },

  // Computed: Filter properties based on all filters
  filteredProperties: () => {
    const { properties, filters } = get();

    return properties.filter((property) => {
      // Filter by search (all attributes)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchableFields = [
          property.buildingName,
          property.reins_id,
          property.prefecture,
          property.city,
          property.town,
          property.addressDetail,
          property.layoutType,
          property.station1,
          property.station2,
          property.station3,
          property.buildingStructure,
        ];
        const matches = searchableFields.some(
          (field) => field?.toLowerCase().includes(searchLower)
        );
        if (!matches) return false;
      }

      // Filter by prefecture
      if (filters.prefecture && property.prefecture !== filters.prefecture) {
        return false;
      }

      // Filter by city
      if (filters.city && property.city !== filters.city) {
        return false;
      }

      // Filter by layout type
      if (filters.layoutType && property.layoutType !== filters.layoutType) {
        return false;
      }

      // Filter by building structure
      if (filters.buildingStructure && property.buildingStructure !== filters.buildingStructure) {
        return false;
      }

      // Filter by station
      if (filters.station) {
        const stationMatch =
          property.station1?.includes(filters.station) ||
          property.station2?.includes(filters.station) ||
          property.station3?.includes(filters.station);
        if (!stationMatch) return false;
      }

      // Filter by rent range
      if (filters.minRent || filters.maxRent) {
        const rent = parseInt(property.rent || '0');
        if (filters.minRent && rent < parseInt(filters.minRent)) return false;
        if (filters.maxRent && rent > parseInt(filters.maxRent)) return false;
      }

      // Filter by area range
      if (filters.minArea || filters.maxArea) {
        const area = parseFloat(property.usableArea || '0');
        if (filters.minArea && area < parseFloat(filters.minArea)) return false;
        if (filters.maxArea && area > parseFloat(filters.maxArea)) return false;
      }

      return true;
    });
  },

  // Count active filters (excluding search)
  activeFiltersCount: () => {
    const { filters } = get();
    let count = 0;
    if (filters.prefecture) count++;
    if (filters.city) count++;
    if (filters.minRent) count++;
    if (filters.maxRent) count++;
    if (filters.layoutType) count++;
    if (filters.minArea) count++;
    if (filters.maxArea) count++;
    if (filters.buildingStructure) count++;
    if (filters.station) count++;
    return count;
  },

  // Get active filters as array for badges
  getActiveFilters: () => {
    const { filters } = get();
    const active: Array<{ key: string; value: string; label: string }> = [];

    if (filters.prefecture) {
      active.push({ key: 'prefecture', value: filters.prefecture, label: `Prefecture: ${filters.prefecture}` });
    }
    if (filters.city) {
      active.push({ key: 'city', value: filters.city, label: `City: ${filters.city}` });
    }
    if (filters.layoutType) {
      active.push({ key: 'layoutType', value: filters.layoutType, label: `Layout: ${filters.layoutType}` });
    }
    if (filters.buildingStructure) {
      active.push({ key: 'buildingStructure', value: filters.buildingStructure, label: `Structure: ${filters.buildingStructure}` });
    }
    if (filters.station) {
      active.push({ key: 'station', value: filters.station, label: `Station: ${filters.station}` });
    }
    if (filters.minRent) {
      active.push({ key: 'minRent', value: filters.minRent, label: `Min Rent: ¥${filters.minRent}` });
    }
    if (filters.maxRent) {
      active.push({ key: 'maxRent', value: filters.maxRent, label: `Max Rent: ¥${filters.maxRent}` });
    }
    if (filters.minArea) {
      active.push({ key: 'minArea', value: filters.minArea, label: `Min Area: ${filters.minArea}m²` });
    }
    if (filters.maxArea) {
      active.push({ key: 'maxArea', value: filters.maxArea, label: `Max Area: ${filters.maxArea}m²` });
    }

    return active;
  },

  fetchProperties: async (reset = true) => {
    try {
      if (reset) {
        set({ loading: true, offset: 0, properties: [] });
      }
      const response = await propertiesApi.getAll(0, 20);
      console.log('[Property Store] Initial fetch response:', {
        received: response.count,
        total: response.total,
        hasMore: response.hasMore,
        offset: response.offset
      });
      set({
        properties: response.properties,
        total: response.total,
        hasMore: response.hasMore,
        offset: response.offset + response.count,
        loading: false,
      });
    } catch (error: any) {
      set({ loading: false });
      throw error; // Toast will be shown by axios interceptor
    }
  },

  fetchMoreProperties: async () => {
    const { offset, hasMore, loadingMore } = get();
    if (!hasMore || loadingMore) {
      console.log('[Property Store] fetchMoreProperties skipped:', { hasMore, loadingMore });
      return;
    }

    try {
      console.log('[Property Store] Fetching more properties with offset:', offset);
      set({ loadingMore: true });
      const response = await propertiesApi.getAll(offset, 20);
      console.log('[Property Store] Load more response:', {
        received: response.count,
        total: response.total,
        hasMore: response.hasMore,
        currentOffset: offset,
        newOffset: response.offset + response.count
      });
      set((state) => ({
        properties: [...state.properties, ...response.properties],
        total: response.total,
        hasMore: response.hasMore,
        offset: response.offset + response.count,
        loadingMore: false,
      }));
    } catch (error: any) {
      set({ loadingMore: false });
      throw error; // Toast will be shown by axios interceptor
    }
  },

  fetchProperty: async (id) => {
    try {
      set({ loading: true });
      const property = await propertiesApi.getById(id);
      set({ currentProperty: property, loading: false });
    } catch (error: any) {
      set({ loading: false });
      throw error; // Toast will be shown by axios interceptor
    }
  },

  deleteProperty: async (id) => {
    try {
      set({ loading: true });
      await propertiesApi.delete(id);

      // Remove from local state
      set((state) => ({
        properties: state.properties.filter((p) => p._id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ loading: false });
      throw error; // Toast will be shown by axios interceptor
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearFilters: () => {
    set({ filters: { search: '' } });
  },

  removeFilter: (key) => {
    set((state) => {
      const newFilters = { ...state.filters };
      delete newFilters[key];
      return { filters: newFilters };
    });
  },
}));

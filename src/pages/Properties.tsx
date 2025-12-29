import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePropertyStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { PropertyCardSkeleton } from '@/components/PropertyCardSkeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Filter, X } from 'lucide-react';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Properties() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    filteredProperties,
    loading,
    loadingMore,
    hasMore,
    filters,
    fetchProperties,
    fetchMoreProperties,
    setFilters,
    activeFiltersCount,
    getActiveFilters,
    clearFilters,
    removeFilter,
  } = usePropertyStore();

  const [searchInput, setSearchInput] = useState(filters.search);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Infinite scroll ref
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Debounce search
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    fetchProperties().finally(() => {
      // Delay enabling infinite scroll to prevent immediate triggering
      setTimeout(() => setInitialLoadComplete(true), 500);
    });
  }, []);

  useEffect(() => {
    setFilters({ search: debouncedSearch });
  }, [debouncedSearch]);

  // Infinite scroll observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    console.log('[Properties] Observer triggered:', {
      isIntersecting: target.isIntersecting,
      hasMore,
      loadingMore,
      loading,
      initialLoadComplete
    });
    if (target.isIntersecting && hasMore && !loadingMore && !loading && initialLoadComplete) {
      console.log('[Properties] Triggering fetchMoreProperties');
      fetchMoreProperties();
    }
  }, [hasMore, loadingMore, loading, initialLoadComplete, fetchMoreProperties]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '20px',
      threshold: 0,
    };
    observerRef.current = new IntersectionObserver(handleObserver, option);
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const viewProperty = (id: string) => {
    navigate(`/properties/${id}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setFilterDialogOpen(false);
  };

  const handleClearFilters = () => {
    const emptyFilters = { search: filters.search };
    setTempFilters(emptyFilters);
    clearFilters();
    setFilterDialogOpen(false);
  };

  const properties = filteredProperties();
  const activeFilters = getActiveFilters();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('properties.title')}</h1>
          <p className="text-gray-600 mt-2">{properties.length} {t('properties.title')}</p>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label>{t('common.search')}</Label>
                <Input
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t('properties.searchPlaceholder')}
                />
              </div>
              <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {t('properties.filters')}
                    {activeFiltersCount() > 0 && (
                      <Badge variant="default" className="ml-1">
                        {activeFiltersCount()}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('properties.filterProperties')}</DialogTitle>
                    <DialogDescription>
                      {t('properties.filterDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    {/* Prefecture */}
                    <div className="space-y-2">
                      <Label>{t('properties.prefecture')}</Label>
                      <Input
                        value={tempFilters.prefecture || ''}
                        onChange={(e) => setTempFilters({ ...tempFilters, prefecture: e.target.value })}
                        placeholder={t('properties.prefecture')}
                      />
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <Label>{t('properties.city')}</Label>
                      <Input
                        value={tempFilters.city || ''}
                        onChange={(e) => setTempFilters({ ...tempFilters, city: e.target.value })}
                        placeholder={t('properties.city')}
                      />
                    </div>

                    {/* Layout Type */}
                    <div className="space-y-2">
                      <Label>{t('properties.layoutType')}</Label>
                      <Input
                        value={tempFilters.layoutType || ''}
                        onChange={(e) => setTempFilters({ ...tempFilters, layoutType: e.target.value })}
                        placeholder={t('properties.layoutType')}
                      />
                    </div>

                    {/* Building Structure */}
                    <div className="space-y-2">
                      <Label>{t('properties.buildingStructure')}</Label>
                      <Input
                        value={tempFilters.buildingStructure || ''}
                        onChange={(e) => setTempFilters({ ...tempFilters, buildingStructure: e.target.value })}
                        placeholder={t('properties.buildingStructure')}
                      />
                    </div>

                    {/* Station */}
                    <div className="space-y-2">
                      <Label>{t('properties.station')}</Label>
                      <Input
                        value={tempFilters.station || ''}
                        onChange={(e) => setTempFilters({ ...tempFilters, station: e.target.value })}
                        placeholder={t('properties.station')}
                      />
                    </div>

                    {/* Min Rent */}
                    <div className="space-y-2">
                      <Label>{t('properties.minRent')}</Label>
                      <Input
                        type="number"
                        value={tempFilters.minRent || ''}
                        onChange={(e) => setTempFilters({ ...tempFilters, minRent: e.target.value })}
                        placeholder="0"
                      />
                    </div>

                    {/* Max Rent */}
                    <div className="space-y-2">
                      <Label>{t('properties.maxRent')}</Label>
                      <Input
                        type="number"
                        value={tempFilters.maxRent || ''}
                        onChange={(e) => setTempFilters({ ...tempFilters, maxRent: e.target.value })}
                        placeholder="999999"
                      />
                    </div>

                    {/* Min Area */}
                    <div className="space-y-2">
                      <Label>{t('properties.minArea')}</Label>
                      <Input
                        type="number"
                        value={tempFilters.minArea || ''}
                        onChange={(e) => setTempFilters({ ...tempFilters, minArea: e.target.value })}
                        placeholder="0"
                      />
                    </div>

                    {/* Max Area */}
                    <div className="space-y-2">
                      <Label>{t('properties.maxArea')}</Label>
                      <Input
                        type="number"
                        value={tempFilters.maxArea || ''}
                        onChange={(e) => setTempFilters({ ...tempFilters, maxArea: e.target.value })}
                        placeholder="999"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleClearFilters}>
                      {t('properties.clearFilters')}
                    </Button>
                    <Button onClick={handleApplyFilters}>
                      {t('properties.applyFilters')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Active Filters Badges */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">{t('properties.activeFilters')}:</span>
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-secondary/80"
                onClick={() => removeFilter(filter.key as any)}
              >
                {filter.label}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 text-xs"
            >
              {t('properties.clearAll')}
            </Button>
          </div>
        )}

        {/* Properties List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('properties.noProperties')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card
                  key={property._id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => viewProperty(property._id)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {property.buildingName || t('properties.noName')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('properties.reinsId')}:</span>
                        <span className="font-medium">{property.reins_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('properties.address')}:</span>
                        <span className="font-medium text-right">
                          {property.prefecture || ''} {property.city || ''}
                        </span>
                      </div>
                      {property.rent && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('properties.rent')}:</span>
                          <span className="font-medium">
                            ¥{property.rent}
                          </span>
                        </div>
                      )}
                      {property.layoutType && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('properties.layout')}:</span>
                          <span className="font-medium">{property.layoutType}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('properties.createdAt')}:</span>
                        <span className="font-medium">
                          {formatDate(property.created_at)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Loading More Skeletons - inside the same grid */}
              {loadingMore && [...Array(3)].map((_, i) => (
                <PropertyCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="h-10" />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

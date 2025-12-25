import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePropertyStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Properties() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    filteredProperties,
    countByStatus,
    loading,
    error,
    filters,
    fetchProperties,
    setFilters,
  } = usePropertyStore();

  useEffect(() => {
    fetchProperties();
  }, []);

  const viewProperty = (id: string) => {
    navigate(`/properties/${id}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'warning',
      processing: 'default',
      success: 'success',
      failed: 'destructive',
    };
    return variants[status] || 'secondary';
  };

  const counts = countByStatus();
  const properties = filteredProperties();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('properties.title')}</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{counts.all}</div>
              <div className="text-sm text-muted-foreground">
                {t('properties.statusAll')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{counts.pending}</div>
              <div className="text-sm text-muted-foreground">
                {t('properties.statusPending')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{counts.processing}</div>
              <div className="text-sm text-muted-foreground">
                {t('properties.statusProcessing')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{counts.success}</div>
              <div className="text-sm text-muted-foreground">
                {t('properties.statusSuccess')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{counts.failed}</div>
              <div className="text-sm text-muted-foreground">
                {t('properties.statusFailed')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label>{t('common.search')}</Label>
                <Input
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value })}
                  placeholder={t('properties.searchPlaceholder')}
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>{t('properties.status')}</Label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ status: e.target.value as any })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="all">{t('properties.statusAll')}</option>
                  <option value="pending">{t('properties.statusPending')}</option>
                  <option value="processing">{t('properties.statusProcessing')}</option>
                  <option value="success">{t('properties.statusSuccess')}</option>
                  <option value="failed">{t('properties.statusFailed')}</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={fetchProperties} disabled={loading}>
                {loading ? t('common.loading') : t('properties.fetchProperties')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Properties List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('common.loading')}</p>
          </div>
        ) : error ? (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('properties.noProperties')}</p>
            <Button variant="outline" className="mt-4" onClick={fetchProperties}>
              {t('properties.fetchProperties')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card
                key={property._id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => viewProperty(property._id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {property.buildingName || t('properties.noName')}
                    </CardTitle>
                    <Badge variant={getStatusVariant(property.status)}>
                      {t(`properties.status${property.status.charAt(0).toUpperCase() + property.status.slice(1)}`)}
                    </Badge>
                  </div>
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
                        {property.address?.prefecture || '-'}{' '}
                        {property.address?.city || ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('properties.rent')}:</span>
                      <span className="font-medium">
                        {property.rent?.monthlyRent
                          ? `¥${property.rent.monthlyRent.toLocaleString()}`
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('properties.layout')}:</span>
                      <span className="font-medium">
                        {property.room?.layout || '-'}
                      </span>
                    </div>
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
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

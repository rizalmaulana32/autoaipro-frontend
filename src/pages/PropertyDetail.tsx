import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePropertyStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function PropertyDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProperty, loading, fetchProperty } = usePropertyStore();

  useEffect(() => {
    if (id) {
      fetchProperty(id);
    }
  }, [id]);

  const openFile = (url: string) => {
    if (!url) return;
    // If it's already a full URL (Supabase), use it directly
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank');
      return;
    }
    // Otherwise, construct local URL (for backward compatibility)
    let cleanPath = url.replace(/^storage\//, '');
    cleanPath = `/files/${cleanPath}`;
    const fullUrl = `${apiBaseUrl}${cleanPath}`;
    window.open(fullUrl, '_blank');
  };

  const downloadFile = async (url: string, filename: string) => {
    if (!url) return;

    try {
      // Determine the final URL
      let downloadUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // Construct local URL for backward compatibility
        let cleanPath = url.replace(/^storage\//, '');
        cleanPath = `/files/${cleanPath}`;
        downloadUrl = `${apiBaseUrl}${cleanPath}`;
      }

      // Fetch the file as blob to force download
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Create and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentProperty) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">{t('properties.noProperties')}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const property = currentProperty;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {property.buildingName || t('properties.noName')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('properties.reinsId')}: {property.reins_id}
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('properties.basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.buildingName && (
                <div>
                  <span className="text-sm text-gray-600">{t('properties.buildingName')}</span>
                  <p className="font-medium">{property.buildingName}</p>
                </div>
              )}
              {property.roomNumber && (
                <div>
                  <span className="text-sm text-gray-600">{t('properties.roomNumber')}</span>
                  <p className="font-medium">{property.roomNumber}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-600">{t('properties.reinsId')}</span>
                <p className="font-medium">{property.reins_id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Information - only show if there's data */}
        {(property.rent || property.managementFee || property.commonServiceFee || property.securityDeposit || property.keyMoney || property.guaranteeDeposit) && (
          <Card>
            <CardHeader>
              <CardTitle>{t('properties.priceInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.rent && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.monthlyRent')}</span>
                    <p className="font-medium text-lg">¥{property.rent}</p>
                  </div>
                )}
                {property.managementFee && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.managementFee')}</span>
                    <p className="font-medium">¥{property.managementFee}</p>
                  </div>
                )}
                {property.commonServiceFee && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.commonServiceFee')}</span>
                    <p className="font-medium">¥{property.commonServiceFee}</p>
                  </div>
                )}
                {property.securityDeposit && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.securityDeposit')}</span>
                    <p className="font-medium">¥{property.securityDeposit}</p>
                  </div>
                )}
                {property.keyMoney && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.keyMoney')}</span>
                    <p className="font-medium">¥{property.keyMoney}</p>
                  </div>
                )}
                {property.guaranteeDeposit && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.guaranteeDeposit')}</span>
                    <p className="font-medium">¥{property.guaranteeDeposit}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location - only show if there's data */}
        {(property.prefecture || property.city || property.town || property.addressDetail) && (
          <Card>
            <CardHeader>
              <CardTitle>{t('properties.location')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.prefecture && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.prefecture')}</span>
                    <p className="font-medium">{property.prefecture}</p>
                  </div>
                )}
                {property.city && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.city')}</span>
                    <p className="font-medium">{property.city}</p>
                  </div>
                )}
                {property.town && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.town')}</span>
                    <p className="font-medium">{property.town}</p>
                  </div>
                )}
                {property.addressDetail && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.addressDetail')}</span>
                    <p className="font-medium">{property.addressDetail}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transportation */}
        {(property.railwayLine1 || property.railwayLine2 || property.railwayLine3) && (
          <Card>
            <CardHeader>
              <CardTitle>{t('properties.transportation')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {property.railwayLine1 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-600">{t('properties.railwayLine')} 1:</span>
                    <span className="font-medium">{property.railwayLine1}</span>
                    {property.station1 && (
                      <>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium">{property.station1}</span>
                        {property.walkMinutes1 && (
                          <span className="text-sm text-gray-600">
                            {t('properties.walkMinutes')} {property.walkMinutes1}{t('properties.minutes')}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
                {property.railwayLine2 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-600">{t('properties.railwayLine')} 2:</span>
                    <span className="font-medium">{property.railwayLine2}</span>
                    {property.station2 && (
                      <>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium">{property.station2}</span>
                        {property.walkMinutes2 && (
                          <span className="text-sm text-gray-600">
                            {t('properties.walkMinutes')} {property.walkMinutes2}{t('properties.minutes')}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
                {property.railwayLine3 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-600">{t('properties.railwayLine')} 3:</span>
                    <span className="font-medium">{property.railwayLine3}</span>
                    {property.station3 && (
                      <>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium">{property.station3}</span>
                        {property.walkMinutes3 && (
                          <span className="text-sm text-gray-600">
                            {t('properties.walkMinutes')} {property.walkMinutes3}{t('properties.minutes')}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Building Information - only show if there's data */}
        {(property.buildingStructure || property.constructionDate || property.aboveGroundFloors || property.undergroundFloors) && (
          <Card>
            <CardHeader>
              <CardTitle>{t('properties.buildingInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.buildingStructure && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.buildingStructure')}</span>
                    <p className="font-medium">{property.buildingStructure}</p>
                  </div>
                )}
                {property.constructionDate && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.constructionDate')}</span>
                    <p className="font-medium">{property.constructionDate}</p>
                  </div>
                )}
                {property.aboveGroundFloors && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.aboveGroundFloors')}</span>
                    <p className="font-medium">{property.aboveGroundFloors}</p>
                  </div>
                )}
                {property.undergroundFloors && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.undergroundFloors')}</span>
                    <p className="font-medium">{property.undergroundFloors}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Room Information - only show if there's data */}
        {(property.layoutType || property.roomCount || property.floorLocation || property.usableArea || property.balconyArea || property.balconyDirection) && (
          <Card>
            <CardHeader>
              <CardTitle>{t('properties.roomInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.layoutType && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.layoutType')}</span>
                    <p className="font-medium">{property.layoutType}</p>
                  </div>
                )}
                {property.roomCount && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.roomCount')}</span>
                    <p className="font-medium">{property.roomCount}</p>
                  </div>
                )}
                {property.floorLocation && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.floorLocation')}</span>
                    <p className="font-medium">{property.floorLocation}</p>
                  </div>
                )}
                {property.usableArea && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.usableArea')}</span>
                    <p className="font-medium">{property.usableArea} m²</p>
                  </div>
                )}
                {property.balconyArea && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.balconyArea')}</span>
                    <p className="font-medium">{property.balconyArea} m²</p>
                  </div>
                )}
                {property.balconyDirection && (
                  <div>
                    <span className="text-sm text-gray-600">{t('properties.balconyDirection')}</span>
                    <p className="font-medium">{property.balconyDirection}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Equipment & Amenities */}
        {(property.equipment || property.amenities) && (
          <Card>
            <CardHeader>
              <CardTitle>{t('properties.equipmentAmenities')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {property.equipment && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-2">{t('properties.equipment')}</span>
                    <p className="text-sm whitespace-pre-wrap">{property.equipment}</p>
                  </div>
                )}
                {property.amenities && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-2">{t('properties.amenities')}</span>
                    <p className="text-sm whitespace-pre-wrap">{property.amenities}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Files */}
        {property.files && (property.files.floorplan_path || property.files.html_path || (property.files.image_paths && property.files.image_paths.length > 0)) && (
          <Card>
            <CardHeader>
              <CardTitle>{t('properties.files')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Floor Plan PDF */}
                {(property.files.floorplan_url || property.files.floorplan_path) && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-2">{t('properties.floorPlan')}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openFile(property.files!.floorplan_url || property.files!.floorplan_path!)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {t('properties.openPdf')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          downloadFile(
                            property.files!.floorplan_url || property.files!.floorplan_path!,
                            property.files!.floorplan_filename || 'floorplan.pdf'
                          )
                        }
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {t('properties.downloadPdf')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* HTML Snapshot */}
                {(property.files.html_url || property.files.html_path) && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-2">{t('properties.htmlSnapshot')}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openFile(property.files!.html_url || property.files!.html_path!)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {t('properties.openHtml')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          downloadFile(
                            property.files!.html_url || property.files!.html_path!,
                            property.files!.html_filename || 'snapshot.html'
                          )
                        }
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {t('properties.downloadHtml')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Images */}
                {((property.files.image_urls && property.files.image_urls.length > 0) ||
                  (property.files.image_paths && property.files.image_paths.length > 0)) && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-2">
                      {t('properties.images')} ({property.files.image_urls?.length || property.files.image_paths?.length || 0})
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {/* Prefer image_urls (Supabase), fall back to image_paths (local) */}
                      {(property.files.image_urls && property.files.image_urls.length > 0
                        ? property.files.image_urls
                        : property.files.image_paths
                      )?.map((urlOrPath, index) => {
                        // Determine image URL based on type
                        const imageUrl = urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')
                          ? urlOrPath  // It's already a full URL (Supabase)
                          : `${apiBaseUrl}/files/${urlOrPath.replace(/^storage\//, '')}`; // Construct local URL

                        return (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openFile(imageUrl)}
                          >
                            <img
                              src={imageUrl}
                              alt={`Property image ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>{t('properties.metadata')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">{t('properties.createdAt')}</span>
                <p className="font-medium">{formatDate(property.created_at)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('properties.updatedAt')}</span>
                <p className="font-medium">{formatDate(property.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

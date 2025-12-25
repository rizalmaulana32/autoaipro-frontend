import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore, usePropertyStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { currentProperty, loading, error, fetchProperty, deleteProperty } =
    usePropertyStore();

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ||
    'http://localhost:3000';

  useEffect(() => {
    if (id) {
      fetchProperty(id);
    }
  }, [id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDelete = async () => {
    if (confirm('本当にこの物件を削除しますか？')) {
      try {
        if (id) {
          await deleteProperty(id);
          navigate('/');
        }
      } catch (error) {
        console.error('Failed to delete property:', error);
      }
    }
  };

  const openFile = (path: string) => {
    const url = `${apiBaseUrl}${path}`;
    window.open(url, '_blank');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP');
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

  const statusLabels: Record<string, string> = {
    pending: '保留中',
    processing: '処理中',
    success: '成功',
    failed: '失敗',
  };

  const property = currentProperty;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                ← 戻る
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">物件詳細</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Property Details */}
        {property && (
          <div className="space-y-6">
            {/* Header Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl">
                      {property.buildingName || '名称未設定'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      REINS ID: {property.reins_id}
                    </p>
                  </div>
                  <Badge
                    variant={getStatusVariant(property.status)}
                    className="text-lg px-4 py-2"
                  >
                    {statusLabels[property.status]}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>基本情報</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600">賃料</Label>
                        <p className="font-semibold text-lg">
                          {property.rent?.monthlyRent
                            ? `¥${property.rent.monthlyRent.toLocaleString()}`
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">管理費</Label>
                        <p className="font-semibold text-lg">
                          {property.rent?.managementFee
                            ? `¥${property.rent.managementFee.toLocaleString()}`
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">敷金</Label>
                        <p className="font-semibold">
                          {property.rent?.deposit
                            ? `¥${property.rent.deposit.toLocaleString()}`
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">礼金</Label>
                        <p className="font-semibold">
                          {property.rent?.keyMoney
                            ? `¥${property.rent.keyMoney.toLocaleString()}`
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>所在地</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">
                      {property.address?.prefecture || ''}{' '}
                      {property.address?.city || ''}{' '}
                      {property.address?.town || ''}{' '}
                      {property.address?.detail || ''}
                    </p>
                  </CardContent>
                </Card>

                {/* Building Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>建物情報</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600">構造</Label>
                        <p className="font-semibold">
                          {property.building?.structure || '-'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">階数</Label>
                        <p className="font-semibold">
                          {property.building?.floors
                            ? `${property.building.floors}階建`
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">築年月</Label>
                        <p className="font-semibold">
                          {property.building?.builtYear &&
                          property.building?.builtMonth
                            ? `${property.building.builtYear}年${property.building.builtMonth}月`
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Room Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>部屋情報</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600">所在階</Label>
                        <p className="font-semibold">
                          {property.room?.floorLocation || '-'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">間取り</Label>
                        <p className="font-semibold">
                          {property.room?.layout || '-'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">面積</Label>
                        <p className="font-semibold">
                          {property.room?.area
                            ? `${property.room.area}㎡`
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Equipment & Amenities */}
                {(property.equipment?.length || property.amenities?.length) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>設備・特徴</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {property.equipment?.length && (
                          <div>
                            <Label className="text-gray-600">設備</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {property.equipment.map((item, index) => (
                                <Badge key={index} variant="secondary">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {property.amenities?.length && (
                          <div>
                            <Label className="text-gray-600">アメニティ</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {property.amenities.map((item, index) => (
                                <Badge key={index} variant="outline">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Files */}
                <Card>
                  <CardHeader>
                    <CardTitle>ファイル</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* PDF */}
                    {property.files?.floorplan_filename && (
                      <div>
                        <Label className="text-gray-600">間取図（PDF）</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() =>
                            openFile(property.files!.floorplan_path!)
                          }
                        >
                          PDFを開く
                        </Button>
                      </div>
                    )}

                    {/* HTML */}
                    {property.files?.html_filename && (
                      <div>
                        <Label className="text-gray-600">
                          HTMLスナップショット
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => openFile(property.files!.html_path!)}
                        >
                          HTMLを開く
                        </Button>
                      </div>
                    )}

                    {/* Images */}
                    {property.files?.image_filenames?.length && (
                      <div>
                        <Label className="text-gray-600">
                          画像 ({property.files.image_filenames.length}枚)
                        </Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {property.files.image_paths
                            ?.slice(0, 4)
                            .map((path, index) => (
                              <button
                                key={index}
                                onClick={() => openFile(path)}
                                className="aspect-square rounded-md overflow-hidden border hover:border-primary transition-colors"
                              >
                                <img
                                  src={`${apiBaseUrl}${path}`}
                                  alt={`画像 ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                        </div>
                        {property.files.image_paths &&
                          property.files.image_paths.length > 4 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2"
                            >
                              すべて表示 ({property.files.image_paths.length})
                            </Button>
                          )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Metadata */}
                <Card>
                  <CardHeader>
                    <CardTitle>メタデータ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <Label className="text-gray-600">作成日</Label>
                      <p>{formatDateTime(property.created_at)}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">更新日</Label>
                      <p>{formatDateTime(property.updated_at)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>アクション</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={handleDelete}
                    >
                      削除
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

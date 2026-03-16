import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clientAdminApi, type ClientProperty, type PropertyStats } from '@/api/clientAdmin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Search, Download, FileText } from 'lucide-react';

// ── Local helpers ──────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
        {title}
      </h3>
      {children}
    </section>
  );
}

function FieldRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3 py-1 text-sm">
      <dt className="text-gray-500 shrink-0 w-28">{label}</dt>
      <dd className="text-gray-900 text-right break-all">{value}</dd>
    </div>
  );
}

function TagList({ items, color }: { items: string[]; color: 'blue' | 'green' | 'purple' }) {
  const cls = {
    blue:   'bg-blue-50 text-blue-700',
    green:  'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
  }[color];
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, i) => (
        <span key={i} className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending:  'secondary',
  approved: 'default',
  rejected: 'destructive',
  archived: 'outline',
};

// ── Main component ─────────────────────────────────────────────────────────────

export default function ClientProperties() {
  const { t } = useTranslation();

  const [properties, setProperties] = useState<ClientProperty[]>([]);
  const [stats, setStats]           = useState<PropertyStats>({ total: 0, pending: 0, approved: 0 });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selected, setSelected] = useState<ClientProperty | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await clientAdminApi.getProperties({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setProperties(data.properties);
      setStats(data.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => load();

  const handleStatusChange = async (status: 'pending' | 'approved' | 'rejected' | 'archived') => {
    if (!selected) return;
    setUpdating(true);
    try {
      await clientAdminApi.updatePropertyStatus(selected._id, status);
      setProperties(prev =>
        prev.map(p => p._id === selected._id ? { ...p, management_status: status } : p)
      );
      // Keep modal open, just update status
      setSelected(prev => prev ? { ...prev, management_status: status } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleBatchDownload = (urls: string[]) => {
    urls.forEach((url, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `image_${i + 1}`;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, i * 300);
    });
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending':  return t('clientAdmin.statusPending');
      case 'approved': return t('clientAdmin.statusApproved');
      case 'rejected': return t('clientAdmin.statusRejected');
      case 'archived': return t('clientAdmin.statusArchived');
      default:         return status;
    }
  };

  // Derived tag arrays (safe when selected is null)
  const equipmentTags  = selected?.equipment  ? selected.equipment.split(/[,、]+/).map(s => s.trim()).filter(Boolean)  : [];
  const amenityTags    = selected?.amenities   ? selected.amenities.split(/[,、]+/).map(s => s.trim()).filter(Boolean)   : [];
  const conditionTags  = selected?.conditions  ? selected.conditions.split(/[,、]+/).map(s => s.trim()).filter(Boolean)  : [];

  return (
    <div className="space-y-6">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t('clientAdmin.totalProperties'), value: stats.total   },
          { label: t('clientAdmin.pending'),          value: stats.pending },
          { label: t('clientAdmin.approved'),         value: stats.approved },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Search & filter ── */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder={t('clientAdmin.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">{t('clientAdmin.allStatuses')}</option>
          <option value="pending">{t('clientAdmin.statusPending')}</option>
          <option value="approved">{t('clientAdmin.statusApproved')}</option>
          <option value="rejected">{t('clientAdmin.statusRejected')}</option>
          <option value="archived">{t('clientAdmin.statusArchived')}</option>
        </select>
        <Button onClick={handleSearch}>{t('common.search')}</Button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">{t('clientAdmin.propertyInfo')}</th>
              <th className="px-6 py-3 font-medium">{t('clientAdmin.source')}</th>
              <th className="px-6 py-3 font-medium">{t('clientAdmin.importDate')}</th>
              <th className="px-6 py-3 font-medium">{t('clientAdmin.status')}</th>
              <th className="px-6 py-3 font-medium">{t('clientAdmin.detail')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">{t('common.loading')}</td></tr>
            ) : properties.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">{t('properties.noProperties')}</td></tr>
            ) : properties.map(prop => (
              <tr key={prop._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {prop.files?.image_urls?.[0] ? (
                      <img src={prop.files.image_urls[0]} alt="" className="w-12 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                        No img
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">
                        {prop.buildingName || t('properties.noName')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {[prop.prefecture, prop.city].filter(Boolean).join(' ')}
                      </div>
                      {prop.rent && <div className="text-xs text-gray-500">{prop.rent}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{prop.source || 'REINS'}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(prop.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={STATUS_VARIANT[prop.management_status] || 'secondary'}>
                    {statusLabel(prop.management_status)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelected(prop)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {t('clientAdmin.detail')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Detail modal ── */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0">

          {/* Header */}
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-200">
            <DialogTitle>
              {[selected?.buildingName, selected?.roomNumber].filter(Boolean).join('　') || t('properties.noName')}
            </DialogTitle>
          </DialogHeader>

          {/* Body — two columns */}
          <div className="flex" style={{ height: 'calc(90vh - 76px)' }}>

            {/* ── Left column (scrollable) ── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-w-0">

              {/* 基本情報 */}
              <Section title="基本情報">
                <dl>
                  <FieldRow
                    label="所在地"
                    value={[selected?.prefecture, selected?.city, selected?.town, selected?.addressDetail]
                      .filter(Boolean).join(' ') || undefined}
                  />
                  <FieldRow label="部屋番号"  value={selected?.roomNumber} />
                  <FieldRow label="賃料"      value={selected?.rent} />
                  <FieldRow label="敷金"      value={selected?.securityDeposit} />
                  <FieldRow label="礼金"      value={selected?.keyMoney} />
                  <FieldRow label="保証金"    value={selected?.guaranteeDeposit} />
                  <FieldRow label="管理費"    value={selected?.managementFee} />
                  <FieldRow label="共益費"    value={selected?.commonServiceFee} />
                  <FieldRow label="更新料"    value={selected?.renewalFee} />
                  <FieldRow label="契約期間"  value={selected?.contractPeriod} />
                </dl>
              </Section>

              {/* 担当 */}
              {(selected?.companyName || selected?.contactPerson || selected?.companyPhone) && (
                <Section title="担当">
                  <dl>
                    <FieldRow label="会社名"      value={selected?.companyName} />
                    <FieldRow label="代表電話"    value={selected?.companyPhone} />
                    <FieldRow label="問合せ電話"  value={selected?.inquiryPhone} />
                    <FieldRow label="担当者名"    value={selected?.contactPerson} />
                    <FieldRow label="担当直通"    value={selected?.contactPhone} />
                    <FieldRow label="メール"      value={selected?.contactEmail} />
                    <FieldRow label="管理番号"    value={selected?.internalManagementCode} />
                  </dl>
                </Section>
              )}

              {/* 物件詳細 */}
              <Section title="物件詳細">
                <dl>
                  <FieldRow label="間取り"        value={selected?.layoutType} />
                  <FieldRow label="専有面積"      value={selected?.usableArea} />
                  <FieldRow label="バルコニー面積" value={selected?.balconyArea} />
                  <FieldRow label="向き"          value={selected?.balconyDirection} />
                  <FieldRow label="所在階"        value={selected?.floorLocation} />
                  <FieldRow label="建物構造"      value={selected?.buildingStructure} />
                  <FieldRow label="築年月"        value={selected?.constructionDate} />
                  <FieldRow label="総戸数"        value={selected?.totalUnits} />
                  <FieldRow label="入居可能日"    value={selected?.moveInDate} />
                  <FieldRow label="駐車場"        value={selected?.parkingAvailable} />
                  <FieldRow label="駐車場料金"    value={selected?.parkingFee} />
                </dl>
              </Section>

              {/* アクセス・契約条件 */}
              {(selected?.railwayLine1 || selected?.railwayLine2 || selected?.railwayLine3) && (
                <Section title="アクセス・契約条件">
                  <dl>
                    {selected?.railwayLine1 && (
                      <FieldRow
                        label="路線 1"
                        value={[
                          selected.railwayLine1,
                          selected.station1,
                          selected.walkMinutes1 ? `徒歩${selected.walkMinutes1}分` : null,
                        ].filter(Boolean).join('　')}
                      />
                    )}
                    {selected?.railwayLine2 && (
                      <FieldRow
                        label="路線 2"
                        value={[
                          selected.railwayLine2,
                          selected.station2,
                          selected.walkMinutes2 ? `徒歩${selected.walkMinutes2}分` : null,
                        ].filter(Boolean).join('　')}
                      />
                    )}
                    {selected?.railwayLine3 && (
                      <FieldRow
                        label="路線 3"
                        value={[
                          selected.railwayLine3,
                          selected.station3,
                          selected.walkMinutes3 ? `徒歩${selected.walkMinutes3}分` : null,
                        ].filter(Boolean).join('　')}
                      />
                    )}
                  </dl>
                </Section>
              )}

              {/* 設備・条件 */}
              {(equipmentTags.length > 0 || amenityTags.length > 0 || conditionTags.length > 0) && (
                <Section title="設備・条件">
                  <div className="space-y-3">
                    {equipmentTags.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">設備</p>
                        <TagList items={equipmentTags} color="blue" />
                      </div>
                    )}
                    {amenityTags.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">アメニティ</p>
                        <TagList items={amenityTags} color="purple" />
                      </div>
                    )}
                    {conditionTags.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">条件</p>
                        <TagList items={conditionTags} color="green" />
                      </div>
                    )}
                  </div>
                </Section>
              )}

            </div>

            {/* ── Right column (scrollable, fixed width) ── */}
            <div className="w-72 shrink-0 border-l border-gray-200 overflow-y-auto p-6 space-y-6 bg-gray-50/50">

              {/* 備考 */}
              {selected?.housingPerformance && (
                <Section title="備考">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selected.housingPerformance}
                  </p>
                </Section>
              )}

              {/* 物件画像 */}
              <Section title="物件画像">
                {selected?.files?.image_urls && selected.files.image_urls.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {selected.files.image_urls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                          <img
                            src={url}
                            alt={`画像 ${i + 1}`}
                            className="w-full h-16 object-cover rounded border border-gray-200 hover:opacity-80 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                    <button
                      onClick={() => handleBatchDownload(selected.files?.image_urls ?? [])}
                      className="flex items-center justify-center gap-2 w-full py-2 px-3 border border-gray-300 rounded-md text-xs text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      画像を一括ダウンロード
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">画像なし</p>
                )}
              </Section>

              {/* 物件図面 */}
              <Section title="物件図面">
                {selected?.files?.floorplan_url ? (
                  <a
                    href={selected.files.floorplan_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 px-3 border border-gray-300 rounded-md text-xs text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="h-3 w-3" />
                    PDFダウンロード
                  </a>
                ) : (
                  <p className="text-xs text-gray-400">図面なし</p>
                )}
              </Section>

              {/* 取込情報 */}
              <Section title="取込情報">
                <dl>
                  <FieldRow label="ソース"    value={selected?.source || 'REINS'} />
                  <FieldRow label="取込日時"  value={selected ? new Date(selected.created_at).toLocaleDateString('ja-JP') : '-'} />
                  <FieldRow label="REINS ID"  value={selected?.reins_id} />
                </dl>
              </Section>

              {/* ステータスを変更 */}
              <Section title="ステータスを変更">
                <div className="space-y-2">
                  {([
                    {
                      status:      'pending'  as const,
                      label:       '未登録',
                      activeClass: 'bg-blue-600 text-white',
                      idleClass:   'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50',
                    },
                    {
                      status:      'approved' as const,
                      label:       '登録済み',
                      activeClass: 'bg-green-600 text-white',
                      idleClass:   'bg-white text-green-600 border border-green-200 hover:bg-green-50',
                    },
                    {
                      status:      'archived' as const,
                      label:       'アーカイブ',
                      activeClass: 'bg-gray-800 text-white',
                      idleClass:   'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100',
                    },
                  ]).map(({ status, label, activeClass, idleClass }) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={updating}
                      className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${
                        selected?.management_status === status ? activeClass : idleClass
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Section>

            </div>
          </div>

        </DialogContent>
      </Dialog>

    </div>
  );
}

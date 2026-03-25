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

// ── Modal sub-components ───────────────────────────────────────────────────────

/** Bold section title with bottom divider (e.g. 基本情報) */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-900 pb-2 mb-3 border-b border-gray-200">
      {children}
    </h3>
  );
}

/** Small sub-header inside a section (e.g. 会員情報 inside 担当) */
function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-gray-500 mb-2 mt-4 first:mt-0">{children}</p>
  );
}

/**
 * Full-width field: small gray label on top, value on the line below.
 * Renders nothing when value is empty/null.
 */
function Field({
  label,
  value,
  variant,
}: {
  label: string;
  value?: string | null;
  variant?: 'brand' | 'link';
}) {
  if (!value) return null;
  const valueClass =
    variant === 'brand' ? 'text-sm font-medium text-teal-600' :
    variant === 'link'  ? 'text-sm font-medium text-blue-600' :
                          'text-sm font-medium text-gray-900';
  return (
    <div className="mb-3">
      <dt className="text-xs text-gray-500 mb-0.5">{label}</dt>
      <dd className={valueClass}>{value}</dd>
    </div>
  );
}

/**
 * Half-width field for 2-column grids.
 * Always renders (shows '-' when empty) to keep grid columns aligned.
 */
function GridField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 mb-0.5">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value || '-'}</dd>
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
  const [reparsing, setReparsing] = useState(false);

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

  /** Open property modal — auto re-parse if fields like balconyDirection or moveInDate are missing */
  const handleOpenProperty = async (prop: ClientProperty) => {
    setSelected(prop);
    const needsReparse = prop.files?.html_url && (!prop.balconyDirection || !prop.moveInDate || !prop.railwayLine1);
    if (!needsReparse) return;
    setReparsing(true);
    try {
      await clientAdminApi.reparseProperty(prop._id);
      // Reload the property list to reflect updated data
      const data = await clientAdminApi.getProperties({ search: search || undefined, status: statusFilter || undefined });
      setProperties(data.properties);
      const updated = data.properties.find(p => p._id === prop._id);
      if (updated) setSelected(updated);
    } catch (e) {
      console.error('Reparse failed:', e);
    } finally {
      setReparsing(false);
    }
  };

  /** Update status without closing the modal */
  const handleStatusChange = async (status: 'pending' | 'approved' | 'rejected' | 'archived') => {
    if (!selected) return;
    setUpdating(true);
    try {
      await clientAdminApi.updatePropertyStatus(selected._id, status);
      setProperties(prev =>
        prev.map(p => p._id === selected._id ? { ...p, management_status: status } : p)
      );
      setSelected(prev => prev ? { ...prev, management_status: status } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  /** Force-download a single file via fetch → blob (works for cross-origin URLs) */
  const downloadFile = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch {
      window.open(url, '_blank');
    }
  };

  /** Download all images sequentially with a small stagger */
  const handleBatchDownload = async (urls: string[]) => {
    for (let i = 0; i < urls.length; i++) {
      if (i > 0) await new Promise<void>(r => setTimeout(r, 400));
      const ext = urls[i].split('?')[0].split('.').pop() || 'jpg';
      await downloadFile(urls[i], `image_${i + 1}.${ext}`);
    }
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

  // Pre-split tag lists — handles commas, Japanese commas, middle-dot, newlines
  const splitTags = (val?: string | null) =>
    val ? val.split(/[,、・\n\r]+/).map(s => s.trim()).filter(Boolean) : [];
  const allTags = [
    ...splitTags(selected?.equipment),
    ...splitTags(selected?.amenities),
    ...splitTags(selected?.conditions),
  ];

  // Unit formatters — append suffix only when value doesn't already contain one
  const formatRent = (val?: string | null) =>
    val ? (/[万円]/.test(val) ? val : `${val}万円`) : null;
  const formatFee = (val?: string | null) =>
    val ? (/[万円]/.test(val) ? val : `${val}円`) : null;
  // Deposit/key money: plain numbers are in ヶ月 units
  const formatDeposit = (val?: string | null) =>
    val ? (/[ヶ月万円]/.test(val) ? val : `${val}ヶ月`) : null;

  // Formatted access string for up to 3 train lines
  const stationLine = (line?: string | null, station?: string | null, walk?: string | null) => {
    if (!line && !station) return null;
    const locationParts = [line, station].filter(Boolean);
    const location = locationParts.join(' ');
    // If walk already has a unit (e.g. "300m"), use as-is; plain numbers get 分
    const walkStr = walk
      ? /^\d+$/.test(walk.trim()) ? `徒歩${walk}分` : `徒歩${walk}`
      : null;
    return [location, walkStr].filter(Boolean).join(' ');
  };

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

      {/* ── Property table ── */}
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
                    onClick={() => handleOpenProperty(prop)}
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
        {/* flex flex-col overrides the default grid so header/body/footer stack correctly */}
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0 flex flex-col">

          {/* Header */}
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-200 shrink-0">
            <DialogTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              {[selected?.buildingName, selected?.roomNumber].filter(Boolean).join('　')
                || t('properties.noName')}
              {reparsing && (
                <span className="text-xs font-normal text-gray-400 animate-pulse">データ同期中...</span>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* ── Body: two columns ── */}
          <div className="flex flex-1 overflow-hidden">

            {/* ════ LEFT COLUMN ════ */}
            <div className="flex-1 overflow-y-auto p-6 min-w-0 space-y-6">

              {/* 基本情報 */}
              <section>
                <SectionTitle>{t('clientAdmin.modalBasicInfo')}</SectionTitle>
                <dl>
                  <Field
                    label={t('clientAdmin.modalPropertyName')}
                    value={[selected?.buildingName, selected?.roomNumber].filter(Boolean).join('　') || undefined}
                  />
                  <Field
                    label={t('clientAdmin.modalAddress')}
                    value={[selected?.prefecture, selected?.city, selected?.town, selected?.addressDetail]
                      .filter(Boolean).join('') || undefined}
                  />
                  <div className="border-t border-gray-100 pt-3 mt-1 grid grid-cols-2 gap-x-6 gap-y-3">
                    <GridField label={t('clientAdmin.rent')}                    value={formatRent(selected?.rent)} />
                    <GridField label={t('clientAdmin.modalManagementFee')}      value={formatFee(selected?.managementFee)} />
                    <GridField label={t('clientAdmin.modalSecurityDeposit')}    value={formatDeposit(selected?.securityDeposit)} />
                    <GridField label={t('clientAdmin.modalKeyMoney')}           value={formatDeposit(selected?.keyMoney)} />
                    <GridField label={t('properties.guaranteeDeposit')}         value={selected?.guaranteeDeposit} />
                    <GridField label={t('properties.commonServiceFee')}         value={formatFee(selected?.commonServiceFee)} />
                    <GridField label={t('clientAdmin.modalRenewalFee')}         value={selected?.renewalFee} />
                  </div>
                </dl>
              </section>

              {/* 担当 */}
              {(selected?.companyName || selected?.contactPerson || selected?.companyPhone) && (
                <section>
                  <SectionTitle>{t('clientAdmin.modalContactInfo')}</SectionTitle>

                  {/* 会員情報 */}
                  <SubLabel>{t('clientAdmin.modalCompanyInfo')}</SubLabel>
                  <dl>
                    <Field
                      label={t('clientAdmin.modalTradeName')}
                      value={selected?.companyName}
                      variant="brand"
                    />
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-3">
                      <GridField label={t('clientAdmin.modalRepresentativePhone')} value={selected?.companyPhone} />
                      <GridField label={t('clientAdmin.modalInquiryPhone')}        value={selected?.inquiryPhone} />
                    </div>
                  </dl>

                  {/* 物件問合せ担当 */}
                  <SubLabel>{t('clientAdmin.modalPropertyInquiryContact')}</SubLabel>
                  <dl>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-3">
                      <GridField label={t('clientAdmin.modalPropertyInquiryPerson')} value={selected?.contactPerson} />
                      <GridField label={t('clientAdmin.modalPropertyContactPhone')}  value={selected?.contactPhone} />
                    </div>
                    <Field label={t('clientAdmin.modalEmail')} value={selected?.contactEmail} variant="link" />
                  </dl>

                  {/* 自社管理欄 */}
                  {selected?.internalManagementCode && (
                    <>
                      <SubLabel>{t('clientAdmin.modalInternalManagement')}</SubLabel>
                      <p className="text-sm font-medium text-gray-900 mb-3">
                        {selected.internalManagementCode}
                      </p>
                    </>
                  )}
                </section>
              )}

              {/* 物件詳細 */}
              <section>
                <SectionTitle>{t('clientAdmin.modalPropertyDetail')}</SectionTitle>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <GridField
                    label={t('clientAdmin.modalLayout')}
                    value={[selected?.roomCount, selected?.layoutType].filter(Boolean).join('') || null}
                  />
                  <GridField label={t('clientAdmin.modalUsableArea')}  value={selected?.usableArea} />
                  <GridField
                    label={t('clientAdmin.modalFloors')}
                    value={
                      selected?.floorLocation && selected?.aboveGroundFloors
                        ? `${selected.floorLocation} / ${selected.aboveGroundFloors}階建`
                        : selected?.floorLocation || selected?.aboveGroundFloors || null
                    }
                  />
                  <GridField label={t('clientAdmin.modalYearBuilt')}    value={selected?.constructionDate} />
                  <GridField label={t('clientAdmin.modalStructure')}    value={selected?.buildingStructure} />
                  <GridField label={t('clientAdmin.modalDirection')}    value={selected?.balconyDirection} />
                  <GridField label={t('clientAdmin.modalBalconyArea')}  value={selected?.balconyArea} />
                  <GridField label={t('clientAdmin.modalTotalUnits')}   value={selected?.totalUnits} />
                  <GridField label={t('clientAdmin.modalParking')}      value={selected?.parkingAvailable} />
                  <GridField label={t('clientAdmin.modalParkingFee')}   value={selected?.parkingFee} />
                </dl>
              </section>

              {/* アクセス・契約条件 */}
              <section>
                <SectionTitle>{t('clientAdmin.modalAccess')}</SectionTitle>
                <dl>
                  {stationLine(selected?.railwayLine1, selected?.station1, selected?.walkMinutes1) && (
                    <Field
                      label={t('clientAdmin.modalNearestStation')}
                      value={stationLine(selected?.railwayLine1, selected?.station1, selected?.walkMinutes1)}
                    />
                  )}
                  {stationLine(selected?.railwayLine2, selected?.station2, selected?.walkMinutes2) && (
                    <Field
                      label={`${t('clientAdmin.modalNearestStation')} 2`}
                      value={stationLine(selected?.railwayLine2, selected?.station2, selected?.walkMinutes2)}
                    />
                  )}
                  {stationLine(selected?.railwayLine3, selected?.station3, selected?.walkMinutes3) && (
                    <Field
                      label={`${t('clientAdmin.modalNearestStation')} 3`}
                      value={stationLine(selected?.railwayLine3, selected?.station3, selected?.walkMinutes3)}
                    />
                  )}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <GridField label={t('clientAdmin.modalMoveInDate')}     value={selected?.moveInDate} />
                    <GridField label={t('clientAdmin.modalContractPeriod')} value={selected?.contractPeriod} />
                  </div>
                </dl>
              </section>

              {/* 設備・条件 */}
              <section>
                <SectionTitle>{t('clientAdmin.modalEquipment')}</SectionTitle>
                {allTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 border border-gray-200 rounded-full text-xs text-gray-700 bg-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">-</p>
                )}
              </section>

            </div>

            {/* ════ RIGHT COLUMN ════ */}
            <div className="w-96 shrink-0 border-l border-gray-200 overflow-y-auto p-6 space-y-6 bg-gray-50">

              {/* 備考 */}
              {selected?.housingPerformance && (
                <section>
                  <SectionTitle>{t('clientAdmin.modalRemarks')}</SectionTitle>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selected.housingPerformance}
                  </p>
                </section>
              )}

              {/* 物件画像 */}
              <section>
                <SectionTitle>{t('clientAdmin.modalPropertyImages')}</SectionTitle>
                {selected?.files?.image_urls?.length ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {selected.files.image_urls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                          <img
                            src={url}
                            alt={`画像 ${i + 1}`}
                            className="w-full aspect-video object-cover rounded border border-gray-200 hover:opacity-80 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                    <button
                      onClick={() => handleBatchDownload(selected.files?.image_urls ?? [])}
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      {t('clientAdmin.modalBatchDownload')}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">{t('clientAdmin.modalNoImages')}</p>
                )}
              </section>

              {/* 物件図面 */}
              <section>
                <SectionTitle>{t('clientAdmin.modalFloorPlan')}</SectionTitle>
                {selected?.files?.floorplan_url ? (
                  <button
                    onClick={() => downloadFile(selected.files!.floorplan_url!, 'floor_plan.pdf')}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    {t('clientAdmin.modalDownloadPdf')}
                  </button>
                ) : (
                  <p className="text-xs text-gray-400">{t('clientAdmin.modalNoFloorPlan')}</p>
                )}
              </section>

              {/* 取込情報 */}
              <section>
                <SectionTitle>{t('clientAdmin.modalImportInfo')}</SectionTitle>
                <dl className="space-y-3">
                  <Field label={t('clientAdmin.modalImportSource')} value={selected?.source || 'REINS'} />
                  <Field
                    label={t('clientAdmin.modalImportDate')}
                    value={selected ? new Date(selected.created_at).toLocaleDateString('ja-JP') : '-'}
                  />
                  <div>
                    <dt className="text-xs text-gray-500 mb-1">{t('clientAdmin.currentStatus')}</dt>
                    <dd>
                      <Badge variant={STATUS_VARIANT[selected?.management_status ?? ''] ?? 'secondary'}>
                        {statusLabel(selected?.management_status ?? '')}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </section>

              {/* ステータスを変更 */}
              <section>
                <SectionTitle>{t('clientAdmin.changeStatus')}</SectionTitle>
                <select
                  value={selected?.management_status ?? ''}
                  onChange={e => handleStatusChange(e.target.value as 'pending' | 'approved' | 'rejected' | 'archived')}
                  disabled={updating}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                >
                  <option value="pending">{t('clientAdmin.statusPending')}</option>
                  <option value="approved">{t('clientAdmin.statusApproved')}</option>
                  <option value="rejected">{t('clientAdmin.statusRejected')}</option>
                  <option value="archived">{t('clientAdmin.statusArchived')}</option>
                </select>
              </section>

            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-3 flex justify-end shrink-0 bg-white">
            <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
              {t('clientAdmin.closeModal')}
            </Button>
          </div>

        </DialogContent>
      </Dialog>

    </div>
  );
}

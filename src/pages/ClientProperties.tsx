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
  DialogFooter,
} from '@/components/ui/Dialog';
import { Search } from 'lucide-react';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
  archived: 'outline',
};

export default function ClientProperties() {
  const { t } = useTranslation();

  const [properties, setProperties] = useState<ClientProperty[]>([]);
  const [stats, setStats] = useState<PropertyStats>({ total: 0, pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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

  useEffect(() => {
    load();
  }, []);

  const handleSearch = () => load();

  const handleStatusChange = async (status: 'pending' | 'approved' | 'rejected' | 'archived') => {
    if (!selected) return;
    setUpdating(true);
    try {
      const updated = await clientAdminApi.updatePropertyStatus(selected._id, status);
      setProperties(prev => prev.map(p => p._id === updated._id ? { ...p, ...updated } : p));
      setSelected(null);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending': return t('clientAdmin.statusPending');
      case 'approved': return t('clientAdmin.statusApproved');
      case 'rejected': return t('clientAdmin.statusRejected');
      case 'archived': return t('clientAdmin.statusArchived');
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t('clientAdmin.totalProperties'), value: stats.total },
          { label: t('clientAdmin.pending'), value: stats.pending },
          { label: t('clientAdmin.approved'), value: stats.approved },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
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
          onChange={e => { setStatusFilter(e.target.value); }}
        >
          <option value="">{t('clientAdmin.allStatuses')}</option>
          <option value="pending">{t('clientAdmin.statusPending')}</option>
          <option value="approved">{t('clientAdmin.statusApproved')}</option>
          <option value="rejected">{t('clientAdmin.statusRejected')}</option>
          <option value="archived">{t('clientAdmin.statusArchived')}</option>
        </select>
        <Button onClick={handleSearch}>{t('common.search')}</Button>
      </div>

      {/* Table */}
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
                      <img
                        src={prop.files.image_urls[0]}
                        alt=""
                        className="w-12 h-10 object-cover rounded"
                      />
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
                      {prop.rent && (
                        <div className="text-xs text-gray-500">{prop.rent}</div>
                      )}
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

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.buildingName || t('properties.noName')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selected?.files?.image_urls?.[0] && (
              <img
                src={selected.files.image_urls[0]}
                alt=""
                className="w-full h-40 object-cover rounded-lg"
              />
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">{t('clientAdmin.address')}: </span>
                <span className="text-gray-900">
                  {[selected?.prefecture, selected?.city].filter(Boolean).join(' ') || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">{t('clientAdmin.rent')}: </span>
                <span className="text-gray-900">{selected?.rent || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">{t('clientAdmin.source')}: </span>
                <span className="text-gray-900">{selected?.source || 'REINS'}</span>
              </div>
              <div>
                <span className="text-gray-500">{t('clientAdmin.importDate')}: </span>
                <span className="text-gray-900">
                  {selected ? new Date(selected.created_at).toLocaleDateString('ja-JP') : '-'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">{t('clientAdmin.currentStatus')}:</p>
              <Badge variant={STATUS_VARIANT[selected?.management_status || ''] || 'secondary'}>
                {statusLabel(selected?.management_status || '')}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">{t('clientAdmin.changeStatus')}:</p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => handleStatusChange('approved')}
                  disabled={updating || selected?.management_status === 'approved'}
                >
                  {t('clientAdmin.btnApprove')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('rejected')}
                  disabled={updating || selected?.management_status === 'rejected'}
                >
                  {t('clientAdmin.btnReject')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('archived')}
                  disabled={updating || selected?.management_status === 'archived'}
                >
                  {t('clientAdmin.btnArchive')}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)} disabled={updating}>
              {t('clientAdmin.closeModal')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

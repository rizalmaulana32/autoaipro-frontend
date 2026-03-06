import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store';
import { systemAdminApi, type ClientCompany, type SystemAdminStats, type CompanyUser } from '@/api/systemAdmin';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Users, Edit2, Trash2, LogOut, ChevronRight } from 'lucide-react';

const EMPTY_CLIENT_FORM = { company_name: '', email: '', username: '', password: '', confirmPassword: '', account_limit: 10, expiry_date: '' };

export default function SystemAdmin() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuthStore();

  const handleLogout = () => { logout(); navigate('/login'); };

  // ── Client companies ──────────────────────────────────────────
  const [clients, setClients] = useState<ClientCompany[]>([]);
  const [stats, setStats] = useState<SystemAdminStats>({ total_clients: 0, active_clients: 0, total_accounts_issued: 0 });
  const [loading, setLoading] = useState(true);

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_CLIENT_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tempDialog, setTempDialog] = useState<{ username: string; password: string } | null>(null);

  // Edit dialog
  const [editClient, setEditClient] = useState<ClientCompany | null>(null);
  const [editForm, setEditForm] = useState({ account_limit: 10, expiry_date: '', status: 'active' as 'active' | 'inactive' });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Members dialog
  const [membersClient, setMembersClient] = useState<ClientCompany | null>(null);
  const [members, setMembers] = useState<CompanyUser[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  useEffect(() => {
    const role = currentUser?.role;
    if (role && role !== 'admin' && role !== 'system_admin') navigate('/');
  }, [currentUser, navigate]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await systemAdminApi.getClients();
      setClients(data.clients);
      setStats(data.stats);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Actions ───────────────────────────────────────────────────
  const handleCreate = async () => {
    if (form.password !== form.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      const result = await systemAdminApi.createClient(form);
      setClients(prev => [result.client, ...prev]);
      setStats(prev => ({
        ...prev,
        total_clients: prev.total_clients + 1,
        active_clients: prev.active_clients + 1,
        total_accounts_issued: prev.total_accounts_issued + 1,
      }));
      setShowForm(false);
      setForm(EMPTY_CLIENT_FORM);
      setTempDialog({ username: result.username, password: result.temp_password });
    } catch (e: any) {
      setFormError(e?.data?.error || e?.message || 'Failed to create client');
    } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!editClient) return;
    setEditSubmitting(true);
    try {
      const updated = await systemAdminApi.updateClient(editClient._id, {
        account_limit: editForm.account_limit,
        expiry_date: editForm.expiry_date,
        status: editForm.status,
      });
      setClients(prev => prev.map(c => c._id === updated._id ? { ...c, ...updated } : c));
      setEditClient(null);
    } catch (e) { console.error(e); }
    finally { setEditSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await systemAdminApi.deleteClient(deleteId);
      setClients(prev => prev.filter(c => c._id !== deleteId));
      setDeleteId(null);
    } catch (e) { console.error(e); }
    finally { setDeleting(false); }
  };

  const openEdit = (client: ClientCompany) => {
    setEditClient(client);
    setEditForm({
      account_limit: client.account_limit,
      expiry_date: client.expiry_date ? client.expiry_date.split('T')[0] : '',
      status: client.status,
    });
  };

  const openMembers = async (client: ClientCompany) => {
    setMembersClient(client);
    setMembersLoading(true);
    setMembers([]);
    try {
      const data = await systemAdminApi.getClientUsers(client._id);
      setMembers(data);
    } catch (e) { console.error(e); }
    finally { setMembersLoading(false); }
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('ja-JP') : '-';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">{t('systemAdmin.title')}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:inline">{currentUser?.email}</span>
          <Select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)} className="w-auto">
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </Select>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.logout')}</span>
          </Button>
        </div>
      </header>

      <main className="px-8 py-8 max-w-6xl mx-auto space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: t('systemAdmin.totalClients'), value: stats.total_clients, icon: '🏢' },
            { label: t('systemAdmin.activeAccounts'), value: stats.active_clients, icon: '✅' },
            { label: t('systemAdmin.totalIssued'), value: stats.total_accounts_issued, icon: '👤' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <span>{stat.icon}</span>
                <span>{stat.label}</span>
              </div>
              <div className="text-4xl font-bold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Client list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('systemAdmin.clientList')}</h2>
            <Button onClick={() => { setShowForm(true); setFormError(''); setForm(EMPTY_CLIENT_FORM); }}>
              {t('systemAdmin.addClient')}
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Inline create form */}
            {showForm && (
              <div className="border-b border-gray-200 p-6 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-4">{t('systemAdmin.newClientForm')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>{t('systemAdmin.companyName')} *</Label>
                    <Input placeholder="株式会社サンプル不動産" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('admin.email')} *</Label>
                    <Input type="email" placeholder="admin@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('admin.username')} *</Label>
                    <Input placeholder="testclient" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('auth.password')} *</Label>
                    <PasswordInput placeholder={t('admin.passwordPlaceholder')} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('auth.confirmPassword')} *</Label>
                    <PasswordInput placeholder={t('admin.passwordPlaceholder')} value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('systemAdmin.accountLimit')} *</Label>
                    <Input type="number" min={1} value={form.account_limit} onChange={e => setForm({ ...form, account_limit: parseInt(e.target.value) || 10 })} />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('systemAdmin.expiry')} *</Label>
                    <Input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} />
                  </div>
                </div>
                {formError && <p className="text-red-600 text-sm mt-2">{formError}</p>}
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>{t('common.cancel')}</Button>
                  <Button onClick={handleCreate} disabled={submitting || !form.company_name || !form.email || !form.username || !form.password || !form.confirmPassword || !form.expiry_date}>
                    {submitting ? t('common.loading') : t('systemAdmin.register')}
                  </Button>
                </div>
              </div>
            )}

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500 bg-gray-50">
                  <th className="px-6 py-3 font-medium">{t('systemAdmin.companyName')}</th>
                  <th className="px-6 py-3 font-medium">{t('admin.email')}</th>
                  <th className="px-6 py-3 font-medium">{t('systemAdmin.accountCount')}</th>
                  <th className="px-6 py-3 font-medium">{t('systemAdmin.expiry')}</th>
                  <th className="px-6 py-3 font-medium">{t('systemAdmin.statusLabel')}</th>
                  <th className="px-6 py-3 font-medium">{t('systemAdmin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">{t('common.loading')}</td></tr>
                ) : clients.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">{t('systemAdmin.noClients')}</td></tr>
                ) : clients.map(client => (
                  <tr key={client._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{client.company_name}</div>
                      <div className="text-xs text-gray-400">{t('common.registeredAt')}: {formatDate(client.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{client.email}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openMembers(client)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <span>{client.account_count} / {client.account_limit}</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                      <div className="mt-1 w-32 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (client.account_count / client.account_limit) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {client.expiry_date ? formatDate(client.expiry_date) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status === 'active' ? t('systemAdmin.statusActive') : t('systemAdmin.statusInactive')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(client)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteId(client._id)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── Members dialog ── */}
      <Dialog open={!!membersClient} onOpenChange={() => setMembersClient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{membersClient?.company_name} — {t('clientAdmin.accountList')}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {membersLoading ? (
              <p className="text-center py-6 text-gray-400">{t('common.loading')}</p>
            ) : members.length === 0 ? (
              <p className="text-center py-6 text-gray-400">{t('admin.noUsers')}</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4 font-medium">{t('admin.username')}</th>
                    <th className="pb-2 pr-4 font-medium">{t('admin.email')}</th>
                    <th className="pb-2 pr-4 font-medium">{t('clientAdmin.role')}</th>
                    <th className="pb-2 pr-4 font-medium">{t('clientAdmin.status')}</th>
                    <th className="pb-2 font-medium">{t('admin.lastLogin')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map(m => (
                    <tr key={m._id}>
                      <td className="py-2.5 pr-4 font-medium text-gray-900">{m.username}</td>
                      <td className="py-2.5 pr-4 text-gray-600">{m.email}</td>
                      <td className="py-2.5 pr-4 text-gray-600">
                        {m.role === 'client_admin' ? t('clientAdmin.roleAdmin') : t('clientAdmin.roleMember')}
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge variant={m.status === 'active' ? 'default' : 'secondary'}>
                          {m.status === 'active' ? t('clientAdmin.accountActive') : t('clientAdmin.accountSuspended')}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-gray-600">{formatDate(m.last_login)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMembersClient(null)}>{t('systemAdmin.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Temp password dialog ── */}
      <Dialog open={!!tempDialog} onOpenChange={() => setTempDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✅ {t('systemAdmin.tempPasswordNote')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 font-mono text-sm">
              <div><span className="text-gray-500">{t('systemAdmin.username')}: </span><strong>{tempDialog?.username}</strong></div>
              <div><span className="text-gray-500">{t('systemAdmin.tempPassword')}: </span><strong>{tempDialog?.password}</strong></div>
            </div>
            <p className="text-xs text-gray-500">{t('common.tempPasswordWarning')}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setTempDialog(null)}>{t('systemAdmin.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit client dialog ── */}
      <Dialog open={!!editClient} onOpenChange={() => setEditClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('systemAdmin.editClientTitle')} — {editClient?.company_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>{t('systemAdmin.accountLimit')}</Label>
              <Input type="number" min={1} value={editForm.account_limit} onChange={e => setEditForm({ ...editForm, account_limit: parseInt(e.target.value) || 1 })} />
            </div>
            <div className="space-y-1">
              <Label>{t('systemAdmin.expiry')}</Label>
              <Input type="date" value={editForm.expiry_date} onChange={e => setEditForm({ ...editForm, expiry_date: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>{t('systemAdmin.statusLabel')}</Label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value as 'active' | 'inactive' })}>
                <option value="active">{t('systemAdmin.statusActive')}</option>
                <option value="inactive">{t('systemAdmin.statusInactive')}</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditClient(null)} disabled={editSubmitting}>{t('common.cancel')}</Button>
            <Button onClick={handleEdit} disabled={editSubmitting}>{editSubmitting ? t('common.loading') : t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete client confirm ── */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.delete')}</DialogTitle>
            <DialogDescription>{t('systemAdmin.deleteConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? t('common.loading') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

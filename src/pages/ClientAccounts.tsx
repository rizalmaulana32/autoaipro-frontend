import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clientAdminApi, type ClientMember, type AccountStats } from '@/api/clientAdmin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Label } from '@/components/ui/Label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';

const EMPTY_FORM = { username: '', email: '', password: '', confirmPassword: '', role: 'member' as 'client_admin' | 'member' };

export default function ClientAccounts() {
  const { t } = useTranslation();

  const [members, setMembers] = useState<ClientMember[]>([]);
  const [stats, setStats] = useState<AccountStats>({ total: 0, active: 0, suspended: 0, account_limit: 0, remaining: 0 });
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await clientAdminApi.getAccounts();
      setMembers(data.members);
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

  const handleCreate = async () => {
    if (form.password !== form.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      const result = await clientAdminApi.createAccount(form);
      setMembers(prev => [result.user, ...prev]);
      setStats(prev => ({ ...prev, total: prev.total + 1, active: prev.active + 1, remaining: prev.remaining - 1 }));
      setTempPassword(result.temp_password);
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch (e: any) {
      setFormError(e?.data?.error || e?.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (member: ClientMember) => {
    const newStatus = member.status === 'active' ? 'suspended' : 'active';
    setActionLoading(member._id);
    try {
      const updated = await clientAdminApi.updateAccount(member._id, { status: newStatus });
      setMembers(prev => prev.map(m => m._id === updated._id ? updated : m));
      setStats(prev => ({
        ...prev,
        active: newStatus === 'active' ? prev.active + 1 : prev.active - 1,
        suspended: newStatus === 'suspended' ? prev.suspended + 1 : prev.suspended - 1,
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const usedPct = stats.account_limit > 0
    ? Math.min(100, ((stats.total) / stats.account_limit) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Account Usage */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">{t('clientAdmin.accountStatus')}</h2>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all"
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-900">
            {stats.total} / {stats.account_limit}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          {t('clientAdmin.remaining', { count: stats.remaining })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t('clientAdmin.totalAccounts'), value: stats.total },
          { label: t('clientAdmin.activeAccounts'), value: stats.active },
          { label: t('clientAdmin.suspendedAccounts'), value: stats.suspended },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Account List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('clientAdmin.accountList')}</h2>
          <Button
            onClick={() => { setShowForm(true); setFormError(''); setForm(EMPTY_FORM); }}
            disabled={stats.remaining <= 0}
          >
            {t('clientAdmin.addAccount')}
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Inline create form */}
          {showForm && (
            <div className="border-b border-gray-200 p-6 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">{t('clientAdmin.newAccountForm')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>{t('auth.username')} *</Label>
                  <Input
                    placeholder="user123"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t('clientAdmin.email')} *</Label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t('auth.password')} *</Label>
                  <PasswordInput
                    placeholder={t('admin.passwordPlaceholder')}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t('auth.confirmPassword')} *</Label>
                  <PasswordInput
                    placeholder={t('admin.passwordPlaceholder')}
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t('clientAdmin.role')}</Label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value as 'client_admin' | 'member' })}
                  >
                    <option value="member">{t('clientAdmin.roleMember')}</option>
                    <option value="client_admin">{t('clientAdmin.roleAdmin')}</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">{t('admin.passwordPlaceholder')}</p>
              {formError && <p className="text-red-600 text-sm mt-2">{formError}</p>}
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={submitting || !form.username || !form.email || !form.password || !form.confirmPassword}
                >
                  {submitting ? t('common.loading') : t('clientAdmin.issueAccount')}
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 bg-gray-50">
                <th className="px-6 py-3 font-medium">{t('clientAdmin.userInfo')}</th>
                <th className="px-6 py-3 font-medium">{t('clientAdmin.role')}</th>
                <th className="px-6 py-3 font-medium">{t('clientAdmin.status')}</th>
                <th className="px-6 py-3 font-medium">{t('clientAdmin.lastLogin')}</th>
                <th className="px-6 py-3 font-medium">{t('systemAdmin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">{t('common.loading')}</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">{t('admin.noUsers')}</td></tr>
              ) : members.map(member => (
                <tr key={member._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{member.username}</div>
                    <div className="text-xs text-gray-400">{member.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {member.role === 'client_admin' ? t('clientAdmin.roleAdmin') : t('clientAdmin.roleMember')}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status === 'active' ? t('clientAdmin.accountActive') : t('clientAdmin.accountSuspended')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {member.last_login
                      ? new Date(member.last_login).toLocaleDateString('ja-JP')
                      : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(member)}
                      disabled={actionLoading === member._id}
                      className={
                        member.status === 'active'
                          ? 'text-orange-500 hover:text-orange-700 text-sm'
                          : 'text-green-600 hover:text-green-800 text-sm'
                      }
                    >
                      {member.status === 'active' ? t('clientAdmin.suspend') : t('clientAdmin.activate')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Temp password dialog */}
      <Dialog open={!!tempPassword} onOpenChange={() => setTempPassword('')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✅ {t('clientAdmin.tempPasswordCreated')}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
              <strong>{tempPassword}</strong>
            </div>
            <p className="text-xs text-gray-500 mt-3">{t('common.tempPasswordWarning')}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setTempPassword('')}>{t('systemAdmin.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

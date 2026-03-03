import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store';
import { adminApi } from '@/api/admin';
import type { User } from '@/api/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Trash2, Users } from 'lucide-react';

export default function Admin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, role: 'user' | 'admin') => {
    try {
      const updated = await adminApi.updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, ...updated } : u)));
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialogId) return;
    setDeleting(true);
    try {
      await adminApi.deleteUser(deleteDialogId);
      setUsers((prev) => prev.filter((u) => u._id !== deleteDialogId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setDeleting(false);
      setDeleteDialogId(null);
    }
  };

  const deleteTarget = users.find((u) => u._id === deleteDialogId);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-gray-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('admin.title')}</h1>
            <p className="text-gray-600 mt-1">{t('admin.userCount', { count: users.length })}</p>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.userList')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">{t('admin.loading')}</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{t('admin.noUsers')}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-3 pr-4 font-medium">{t('admin.username')}</th>
                      <th className="pb-3 pr-4 font-medium">{t('admin.email')}</th>
                      <th className="pb-3 pr-4 font-medium">{t('admin.propertyCount')}</th>
                      <th className="pb-3 pr-4 font-medium">{t('admin.registeredAt')}</th>
                      <th className="pb-3 pr-4 font-medium">{t('admin.lastLogin')}</th>
                      <th className="pb-3 pr-4 font-medium">{t('admin.role')}</th>
                      <th className="pb-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 font-medium">
                          {user.username}
                          {user._id === currentUser?._id && (
                            <span className="ml-2 text-xs text-gray-400">{t('admin.you')}</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-gray-600">{user.email}</td>
                        <td className="py-3 pr-4">
                          <Badge variant="secondary">{t('admin.propertiesUnit', { count: user.property_count ?? 0 })}</Badge>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">{formatDate(user.created_at)}</td>
                        <td className="py-3 pr-4 text-gray-600">{formatDate(user.last_login)}</td>
                        <td className="py-3 pr-4">
                          <Select
                            value={user.role || 'user'}
                            onChange={(e) =>
                              handleRoleChange(user._id, e.target.value as 'user' | 'admin')
                            }
                            disabled={user._id === currentUser?._id}
                            className="w-28"
                          >
                            <option value="user">{t('admin.roleUser')}</option>
                            <option value="admin">{t('admin.roleAdmin')}</option>
                          </Select>
                        </td>
                        <td className="py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteDialogId(user._id)}
                            disabled={user._id === currentUser?._id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialogId} onOpenChange={(open) => !open && setDeleteDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.deleteUser')}</DialogTitle>
            <DialogDescription>
              {t('admin.deleteConfirm')}
              <span className="block font-semibold mt-2 text-gray-900">
                {deleteTarget?.username} ({deleteTarget?.email})
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogId(null)}
              disabled={deleting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? t('admin.deleting') : t('admin.deleteBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

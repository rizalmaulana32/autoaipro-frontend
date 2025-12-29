import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Globe } from 'lucide-react';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login({
        username: formData.username,
        password: formData.password,
      });
      navigate('/');
    } catch (err) {
      // Error toast will be shown by axios interceptor
      console.error('Login failed:', err);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Language Switcher */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            {i18n.language === 'en' ? 'EN' : '日本語'}
          </Button>
        </div>

        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            {t('common.appName')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.propertyManagementSystem')}
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('auth.loginTitle')}</CardTitle>
            <CardDescription>{t('auth.loginDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">{t('auth.username')}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t('auth.usernamePlaceholder')}
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.loggingIn') : t('auth.login')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

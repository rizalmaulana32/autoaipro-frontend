import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, Globe } from 'lucide-react';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Left side - Menu button (mobile) */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900 hidden lg:block">
          {t('common.appName')}
        </h1>
      </div>

      {/* Right side - Language switcher and user menu */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="gap-2"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {i18n.language === 'en' ? 'EN' : '日本語'}
          </span>
        </Button>

        {/* User Info */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
          <span>{user?.username}</span>
        </div>

        {/* Logout Button */}
        <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{t('common.logout')}</span>
        </Button>
      </div>
    </header>
  );
}

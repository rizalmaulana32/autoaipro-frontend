import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

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

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 z-40">
      {/* Left side - Menu button (mobile) and App Name */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900">
          {t('common.appName')}
        </h1>
      </div>

      {/* Right side - Language switcher and user menu */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <Select
          value={i18n.language}
          onChange={handleLanguageChange}
          className="w-auto"
        >
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </Select>

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

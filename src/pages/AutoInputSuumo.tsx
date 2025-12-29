import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileEdit } from 'lucide-react';

export default function AutoInputSuumo() {
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('nav.autoInputSuumo')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('autoInputSuumo.description')}
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileEdit className="h-6 w-6 text-gray-400" />
              <span>{t('autoInputSuumo.comingSoonTitle')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileEdit className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('autoInputSuumo.comingSoonTitle')}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {t('autoInputSuumo.comingSoonMessage')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

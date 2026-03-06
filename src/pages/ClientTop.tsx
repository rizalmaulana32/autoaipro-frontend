import { useTranslation } from 'react-i18next';
import { Download, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ClientTop() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Download Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Download className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{t('clientAdmin.downloadTitle')}</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">{t('clientAdmin.downloadDesc')}</p>
        <a
          href="https://github.com/erines/autoaipro"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {t('clientAdmin.downloadBtn')}
          </Button>
        </a>
      </div>

      {/* Install Steps */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('clientAdmin.installTitle')}</h2>
        <ol className="space-y-3">
          {[
            t('clientAdmin.installStep1'),
            t('clientAdmin.installStep2'),
            t('clientAdmin.installStep3'),
            t('clientAdmin.installStep4'),
            t('clientAdmin.installStep5'),
          ].map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-sm text-gray-700 pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Manuals */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{t('clientAdmin.manualTitle')}</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">{t('clientAdmin.manualDesc')}</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            '拡張機能 使い方ガイド',
            'REINS 物件取り込みマニュアル',
            'SUUMO 自動入力マニュアル',
            'トラブルシューティング',
          ].map((title) => (
            <div
              key={title}
              className="border border-gray-200 rounded-lg p-4 text-sm text-gray-500 flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{title}</span>
              <span className="ml-auto text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded">{t('common.comingSoon')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

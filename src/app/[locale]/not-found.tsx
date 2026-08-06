'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="max-w-md text-center">
        <p className="mb-4 font-heading text-6xl font-bold text-green-600 dark:text-green-400">404</p>
        <h1 className="mb-4 font-heading text-3xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">{t('description')}</p>
        <Link
          href="/"
          className="inline-block bg-green-600 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-green-700"
        >
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}

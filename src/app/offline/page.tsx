'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';

type OfflineLocale = 'en' | 'ar';

type OfflineStrings = {
  dir: 'ltr' | 'rtl';
  home: string;
  title: string;
  description: string;
  availableTitle: string;
  availableDescription: string;
  offlineEnabled: string;
  tryAgain: string;
  goHome: string;
  tip: string;
};

const STRINGS: Record<OfflineLocale, OfflineStrings> = {
  en: {
    dir: 'ltr',
    home: '/en',
    title: "You're Offline",
    description:
      "Don't worry! You can still read your cached stories. Check your internet connection and try again.",
    availableTitle: 'Available Offline',
    availableDescription:
      "Stories you've previously viewed are available for reading without an internet connection.",
    offlineEnabled: 'Offline reading enabled',
    tryAgain: 'Try Again',
    goHome: 'Go to Homepage',
    tip: 'Tip: Install this app to your home screen for easier offline access',
  },
  ar: {
    dir: 'rtl',
    home: '/ar',
    title: 'أنت غير متصل',
    description:
      'لا تقلق! لا يزال بإمكانك قراءة القصص المحفوظة. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.',
    availableTitle: 'متاح دون اتصال',
    availableDescription: 'القصص التي شاهدتها مسبقًا متاحة للقراءة دون اتصال بالإنترنت.',
    offlineEnabled: 'القراءة دون اتصال مفعّلة',
    tryAgain: 'حاول مرة أخرى',
    goHome: 'الذهاب إلى الصفحة الرئيسية',
    tip: 'نصيحة: ثبّت هذا التطبيق على شاشتك الرئيسية للوصول الأسهل دون اتصال',
  },
};

function detectLocale(): OfflineLocale {
  if (typeof navigator === 'undefined') return 'en';
  return navigator.language.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

const emptySubscribe = () => () => {};

export default function OfflinePage() {
  const locale = useSyncExternalStore<OfflineLocale>(emptySubscribe, detectLocale, () => 'en');
  const s = STRINGS[locale];

  return (
    <div
      dir={s.dir}
      className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900"
    >
      <div className="max-w-md text-center">
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>

        <h1 className="mb-4 font-heading text-3xl font-bold text-gray-900 dark:text-white">
          {s.title}
        </h1>

        <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">{s.description}</p>

        <div className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            {s.availableTitle}
          </h2>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{s.availableDescription}</p>
          <div className="flex items-center justify-center text-green-600 dark:text-green-500">
            <svg
              className="me-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-medium">{s.offlineEnabled}</span>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-green-700"
          >
            {s.tryAgain}
          </button>

          <Link
            href={s.home}
            className="block w-full bg-gray-200 px-6 py-3 font-semibold text-gray-900 transition-colors duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            {s.goHome}
          </Link>
        </div>

        <p className="mt-8 text-xs text-gray-500 dark:text-gray-500">{s.tip}</p>
      </div>
    </div>
  );
}

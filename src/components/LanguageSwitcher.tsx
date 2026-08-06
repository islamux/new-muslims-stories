'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';

const LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ar', label: 'ع', name: 'العربية' },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (next: 'en' | 'ar') => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-md border border-line p-0.5"
      role="group"
      aria-label="Language"
    >
      {LANGS.map((lang) => {
        const active = locale === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => switchLocale(lang.code)}
            aria-current={active ? 'true' : undefined}
            aria-label={lang.name}
            className={`min-w-[2rem] rounded px-2 py-1 text-sm font-semibold transition-colors ${
              active
                ? 'bg-emerald-600 text-white'
                : 'text-ink-soft hover:text-emerald-700 dark:hover:text-emerald-300'
            }`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}

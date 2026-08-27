'use client';

import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useHasMounted } from '@/hooks/useHasMounted';

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations('Common');
  const mounted = useHasMounted();

  const isDark = mounted && resolvedTheme === 'dark';
  const nextLabel = isDark ? t('light') : t('dark');

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      disabled={!mounted}
      aria-label={`${nextLabel} ${t('theme')}`}
      title={`${nextLabel} ${t('theme')}`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink-soft transition-colors hover:border-gilt-400 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-60 dark:hover:text-emerald-300"
    >
      {isDark ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
    </button>
  );
}

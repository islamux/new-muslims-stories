'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import Star from './ui/Star';

export default function TopNav() {
  const t = useTranslations('Nav');

  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-ink transition-opacity hover:opacity-80"
        >
          <Star size={26} className="text-gilt-500" aria-label={t('brand')} />
          <span className="font-heading text-base font-bold tracking-tight sm:text-lg">
            {t('brand')}
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="#stories"
            className="hidden rounded-md px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-emerald-700 sm:inline dark:hover:text-emerald-300"
          >
            {t('stories')}
          </a>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

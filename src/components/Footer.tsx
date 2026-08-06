'use client';

import { useTranslations } from 'next-intl';
import Star from './ui/Star';

export default function Footer() {
  const t = useTranslations('Index');
  const nav = useTranslations('Nav');

  return (
    <footer className="border-t border-line bg-panel">
      <div className="container mx-auto flex flex-col items-center gap-3 px-4 py-10 text-center">
        <Star size={22} className="text-gilt-500" aria-hidden="true" />
        <p className="font-heading text-base font-bold text-ink">{nav('brand')}</p>
        <p className="font-sans text-xs text-ink-soft">
          {t('footerCopyright', { year: new Date().getFullYear().toString() })}
        </p>
      </div>
    </footer>
  );
}

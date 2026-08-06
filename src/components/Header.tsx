'use client';

import { useTranslations } from 'next-intl';

export default function Header() {
  const t = useTranslations('Index');

  return (
    <section className="py-6">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-heading text-xl font-bold text-ink-soft sm:text-2xl">{t('title')}</h2>
      </div>
    </section>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import Section from '@/components/ui/Section';

export default function WhatsNext() {
  const t = useTranslations('Index');

  return (
    <Section className="my-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 font-heading text-2xl font-bold text-ink sm:text-3xl">
            {t('whatsNext')}
          </h2>
          <p className="font-body text-lg leading-relaxed text-ink-soft">
            {t('whatsNextDescription')}
          </p>
        </div>
      </div>
    </Section>
  );
}

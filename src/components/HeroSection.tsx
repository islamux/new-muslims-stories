'use client';

import { useTranslations } from 'next-intl';
import Star from './ui/Star';
import { buttonVariants } from './Button';

const HeroSection = () => {
  const t = useTranslations('Hero');

  return (
    <section className="relative overflow-hidden">
      <div className="nur-glow absolute inset-0" aria-hidden="true" />
      <div className="container relative z-10 mx-auto px-4 pb-8 pt-10 text-center md:pb-10 md:pt-12 lg:pb-12 lg:pt-16">
        <Star size={40} className="mx-auto mb-6 text-gilt-500" aria-hidden="true" />
        <h1 className="mx-auto mb-6 max-w-4xl font-heading text-4xl font-bold leading-tight text-ink sm:text-5xl md:text-6xl lg:text-7xl">
          {t('headline')}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl font-body text-lg text-ink-soft md:text-xl">
          {t('subheadline')}
        </p>
        <a href="#stories" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
          {t('exploreStories')}
        </a>
      </div>
    </section>
  );
};

export default HeroSection;

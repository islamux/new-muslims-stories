'use client';

import { useTranslations } from 'next-intl';
import type { FeaturedStoriesProps } from '@/types';
import StoryCard from './StoryCard';
import Divider from './ui/Divider';

// Curated featured showcase (subset passed from the server).
export default function FeaturedShowcase({ stories }: FeaturedStoriesProps) {
  const t = useTranslations('Index');

  if (!stories.length) return null;

  return (
    <section className="pt-4 md:pt-6 lg:pt-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <p className="mb-2 font-sans text-sm font-semibold tracking-wide text-gilt-600 dark:text-gilt-400">
            {t('title')}
          </p>
          <h2 className="font-heading text-2xl font-bold text-ink sm:text-3xl">
            {t('featuredStories')}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>
      </div>
      <Divider className="mt-12" />
    </section>
  );
}

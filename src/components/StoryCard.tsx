'use client';

import { useMemo } from 'react';
import { Link } from '@/navigation';
import type { StoryCardProps } from '@/types';
import { useTranslations } from 'next-intl';
import StoryImage from '@/components/ui/StoryImage';

export default function StoryCard({ story }: StoryCardProps) {
  const commonT = useTranslations('Common');

  const excerpt = useMemo(
    () => story.contentHtml.replace(/<[^>]*>/g, '').trim().slice(0, 140),
    [story.contentHtml],
  );

  const meta = [story.country, story.previousReligion].filter(Boolean).join(' · ');

  return (
    <article className="group relative flex h-full flex-col rounded-lg border border-line bg-panel/60 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gilt-400 hover:shadow-lg">
      {story.profilePhoto && (
        <div className="relative mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full ring-2 ring-gilt-400/70 ring-offset-2 ring-offset-panel">
          <StoryImage src={story.profilePhoto} alt={story.firstName || story.title} sizes="96px" />
        </div>
      )}
      <h3 className="mb-2 font-heading text-lg font-bold leading-snug text-ink">
        <Link
          href={`/stories/${story.slug}`}
          className="after:absolute after:inset-0 hover:text-emerald-700 dark:hover:text-emerald-300"
        >
          {story.title}
        </Link>
      </h3>
      {meta && <p className="mb-3 font-sans text-xs text-ink-soft">{meta}</p>}
      <p className="mb-4 line-clamp-3 font-body text-sm text-ink-soft">{excerpt}</p>
      <span className="mt-auto self-center font-sans text-sm font-semibold text-emerald-700 dark:text-emerald-300">
        {commonT('learnMore')}
      </span>
    </article>
  );
}

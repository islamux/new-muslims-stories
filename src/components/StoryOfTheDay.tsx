'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import type { StoryOfTheDayProps } from '@/types';
import StoryImage from '@/components/ui/StoryImage';
import { buttonVariants } from './Button';

export default function StoryOfTheDay({ story }: StoryOfTheDayProps) {
  const commonT = useTranslations('Common');

  const excerpt = useMemo(
    () => story.contentHtml.replace(/<[^>]*>/g, '').trim().slice(0, 220),
    [story.contentHtml],
  );

  return (
    <article className="overflow-hidden rounded-xl border border-line bg-panel/60 md:grid md:grid-cols-[auto_1fr]">
      {story.profilePhoto && (
        <div className="relative h-48 w-full md:h-auto md:w-48">
          <StoryImage
            src={story.profilePhoto}
            alt={story.firstName}
            sizes="(max-width: 768px) 100vw, 192px"
          />
        </div>
      )}
      <div className="p-6 sm:p-8">
        <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-gilt-600">
          {commonT('storyOfTheDay')}
        </p>
        <h3 className="mb-3 font-heading text-2xl font-bold text-ink">{story.title}</h3>
        <p className="mb-5 font-body text-ink-soft">{excerpt}</p>
        <Link
          href={`/stories/${story.slug}`}
          className={buttonVariants({ variant: 'ghost', size: 'md' })}
        >
          {commonT('learnMore')}
        </Link>
      </div>
    </article>
  );
}

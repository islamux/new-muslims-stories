'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { useStorySections } from '@/hooks/useStorySections';
import ProfileHeader from './ProfileHeader';
import StoryImage from '@/components/ui/StoryImage';
import Divider from '@/components/ui/Divider';
import Star from '@/components/ui/Star';
import type { StoryContentDisplayProps } from '@/types';

interface StorySectionProps {
  title: string;
  content: string;
  index: number;
}

const PROSE =
  'prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-ink prose-p:text-ink prose-p:leading-relaxed prose-a:text-emerald-700 prose-strong:text-ink prose-blockquote:border-gilt-400 dark:prose-a:text-emerald-300';

function StorySection({ title, content, index }: StorySectionProps) {
  const isMoment = index === 1;

  return (
    <section
      className={
        isMoment ? 'border-s-2 border-gilt-400 ps-5 sm:ps-6' : undefined
      }
    >
      <h2
        className={`mb-4 font-heading text-2xl font-bold sm:text-3xl ${
          isMoment ? 'text-gilt-600' : 'text-emerald-700 dark:text-emerald-300'
        }`}
      >
        {title}
      </h2>
      <div
        className={`${PROSE} ${index === 0 ? 'drop-cap' : ''}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  );
}

export default function StoryContentDisplay({ story, prev, next }: StoryContentDisplayProps) {
  const t = useTranslations('Story');

  const { lifeBeforeIslam, momentOfGuidance, reflections } = useStorySections(story.contentHtml);

  const sections = [
    { key: 'lifeBeforeIslam' as const, content: lifeBeforeIslam },
    { key: 'momentOfGuidance' as const, content: momentOfGuidance },
    { key: 'reflections' as const, content: reflections },
  ];

  return (
    <article className="story-prose container mx-auto px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-ink-soft transition-colors hover:text-emerald-700 dark:hover:text-emerald-300"
        >
          <Star size={14} className="text-gilt-500" aria-hidden="true" />
          {t('return')}
        </Link>

        <h1 className="mb-6 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl md:text-5xl">
          {story.title}
        </h1>

        <ProfileHeader story={story} />

        {story.image && (
          <div className="relative mb-10 h-56 w-full overflow-hidden rounded-lg sm:h-72 md:h-80">
            <StoryImage
              src={story.image}
              alt={story.title}
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        {sections.map((section, i) => (
          <div key={section.key}>
            {i > 0 && <Divider className="my-10" />}
            <StorySection title={t(section.key)} content={section.content} index={i} />
          </div>
        ))}

        {(prev || next) && (
          <nav
            aria-label={t('navigation')}
            className="mt-14 border-t border-line pt-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              {prev ? (
                <Link
                  href={`/stories/${prev.slug}`}
                  className="group flex flex-1 flex-col"
                >
                  <span className="font-sans text-xs font-semibold uppercase tracking-wider text-gilt-600">
                    {t('previous')}
                  </span>
                  <span className="font-heading text-base font-bold text-ink group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span className="flex-1" aria-hidden="true" />
              )}
              {next ? (
                <Link
                  href={`/stories/${next.slug}`}
                  className="group flex flex-1 flex-col sm:items-end"
                >
                  <span className="font-sans text-xs font-semibold uppercase tracking-wider text-gilt-600">
                    {t('next')}
                  </span>
                  <span className="font-heading text-base font-bold text-ink group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                    {next.title}
                  </span>
                </Link>
              ) : (
                <span className="flex-1" aria-hidden="true" />
              )}
            </div>
          </nav>
        )}
      </div>
    </article>
  );
}

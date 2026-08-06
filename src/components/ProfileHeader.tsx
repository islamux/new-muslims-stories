'use client';

import { useTranslations } from 'next-intl';
import type { ProfileHeaderProps } from '@/types';
import StoryImage from '@/components/ui/StoryImage';

export default function ProfileHeader({ story }: ProfileHeaderProps) {
  const t = useTranslations('Common');

  return (
    <div className="mb-8 flex items-center gap-4">
      {story.profilePhoto && (
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-gilt-400/70 ring-offset-2 ring-offset-surface">
          <StoryImage src={story.profilePhoto} alt={story.firstName || story.title} sizes="64px" />
        </div>
      )}
      <div>
        <p className="font-heading text-lg font-bold text-ink">{story.firstName}</p>
        {story.country && (
          <p className="font-sans text-sm text-ink-soft">
            {story.age != null
              ? t('yearsOldFrom', { age: story.age, country: story.country })
              : story.country}
          </p>
        )}
        {story.previousReligion && (
          <p className="font-sans text-xs text-ink-soft">
            {t('previousReligion', { religion: story.previousReligion })}
          </p>
        )}
      </div>
    </div>
  );
}

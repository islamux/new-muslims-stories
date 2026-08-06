'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { FeaturedStoriesProps } from '@/types';
import Section from '@/components/ui/Section';
import StoryCard from '@/components/StoryCard';

export default function FeaturedStories({ stories }: FeaturedStoriesProps) {
  const t = useTranslations('Index');
  const commonT = useTranslations('Common');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [query, setQuery] = useState('');

  const countries = useMemo(
    () => Array.from(new Set(stories.map((s) => s.country).filter(Boolean))).sort(),
    [stories],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stories;
    return stories.filter((s) => {
      const title = (s.title ?? '').toLowerCase();
      const firstName = (s.firstName ?? '').toLowerCase();
      const country = (s.country ?? '').toLowerCase();
      const matchesCountry = !selectedCountry || s.country === selectedCountry;
      return (
        matchesCountry &&
        (title.includes(q) || firstName.includes(q) || country.includes(q))
      );
    });
  }, [stories, selectedCountry, query]);

  return (
    <Section id="stories" className="my-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 text-center font-heading text-2xl font-bold text-ink sm:text-3xl">
          {t('allStories')}
        </h2>

        <div className="mb-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={commonT('searchStories')}
            aria-label={commonT('searchStories')}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 font-sans text-sm text-ink placeholder:text-ink-soft focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 sm:max-w-xs"
          />
          <div className="flex items-center gap-2">
            <label htmlFor="country-filter" className="font-sans text-sm text-ink-soft">
              {commonT('filterByCountry')}:
            </label>
            <select
              id="country-filter"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="rounded-md border border-line bg-surface px-3 py-2 font-sans text-sm text-ink focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="">{commonT('filterAll')}</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center font-sans text-ink-soft">{commonT('noStories')}</p>
        )}
      </div>
    </Section>
  );
}

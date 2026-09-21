import type { Locale, StoryData } from '@/types';

export interface StorySlugEntry {
  slug: string;
  locale: Locale;
}

export interface StoryRepository {
  getAll(locale: Locale): Promise<StoryData[]>;
  getBySlug(slug: string, locale: Locale): Promise<StoryData | undefined>;
  getSlugEntries(): Promise<StorySlugEntry[]>;
}
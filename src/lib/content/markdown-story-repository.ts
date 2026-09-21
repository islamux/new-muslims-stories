import fs from 'fs';
import type { Locale, StoryData } from '@/types';
import { extractSlugAndLocale, parseStoryFile } from '../story-parser';
import type { StoryRepository, StorySlugEntry } from './types';

interface StoryCache {
  slugEntries: StorySlugEntry[];
  byKey: Map<string, StoryData>;
  sorted: Map<Locale, StoryData[]>;
}

const LOCALES: Locale[] = ['en', 'ar'];

/**
 * File-backed StoryRepository. All files are read and parsed exactly once
 * (memoized promise), so build-time pages no longer re-parse every story
 * file per page render.
 */
export class MarkdownStoryRepository implements StoryRepository {
  private readonly storiesDir: string;
  private loadPromise: Promise<StoryCache> | null = null;

  constructor(storiesDir: string) {
    this.storiesDir = storiesDir;
  }

  private load(): Promise<StoryCache> {
    this.loadPromise ??= this.buildCache();
    return this.loadPromise;
  }

  private async buildCache(): Promise<StoryCache> {
    const fileNames = fs
      .readdirSync(this.storiesDir)
      .filter((name) => name.endsWith('.md'))
      .sort();

    const stories = await Promise.all(
      fileNames.map((fileName) => parseStoryFile(fileName, this.storiesDir)),
    );

    const byKey = new Map<string, StoryData>();
    for (const [i, fileName] of fileNames.entries()) {
      const { locale } = extractSlugAndLocale(fileName);
      const story = stories[i];
      if (!story) {
        throw new Error(`[MarkdownStoryRepository] ${fileName}: no story parsed`);
      }
      if (story.language !== locale) {
        throw new Error(
          `[MarkdownStoryRepository] ${fileName}: frontmatter language "${story.language}" does not match filename locale "${locale}"`,
        );
      }
      byKey.set(`${locale}/${story.slug}`, story);
    }

    const sorted = new Map<Locale, StoryData[]>(
      LOCALES.map((locale) => [
        locale,
        stories
          .filter((story) => story.language === locale)
          .sort((a, b) => a.title.localeCompare(b.title)),
      ]),
    );

    const slugEntries = fileNames.map((fileName) => {
      const { slug, locale } = extractSlugAndLocale(fileName);
      return { slug, locale };
    });

    return { slugEntries, byKey, sorted };
  }

  async getAll(locale: Locale): Promise<StoryData[]> {
    return (await this.load()).sorted.get(locale) ?? [];
  }

  async getBySlug(slug: string, locale: Locale): Promise<StoryData | undefined> {
    return (await this.load()).byKey.get(`${locale}/${slug}`);
  }

  async getSlugEntries(): Promise<StorySlugEntry[]> {
    return (await this.load()).slugEntries;
  }
}

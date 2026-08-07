import type { StoryData } from '@/types';
import { parseStoryFile, getStoryFileNames, extractSlugAndLocale } from './story-parser';

/**
 * Service for managing story data operations
 */
export class StoryService {
  /**
   * Get all stories for a specific locale, sorted alphabetically.
   * A single unreadable/corrupt file is skipped (and logged) rather than
   * taking down the whole list.
   */
  static async getSortedStoriesData(locale: string): Promise<StoryData[]> {
    const fileNames = getStoryFileNames();

    const settled = await Promise.allSettled(fileNames.map((fileName) => parseStoryFile(fileName)));

    settled
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .forEach((r) => console.error('[StoryService] skipping unreadable story file:', r.reason));

    const filteredStories = settled
      .filter((r): r is PromiseFulfilledResult<StoryData> => r.status === 'fulfilled')
      .map((r) => r.value)
      .filter((story) => story.language === locale);

    // Sort stories by title alphabetically
    return filteredStories.sort((a, b) => a.title.localeCompare(b.title));
  }

  /**
   * Get a specific story by slug and locale
   */
  static async getStoryData(slug: string, locale: string): Promise<StoryData> {
    const fileName = locale === 'ar' ? `${slug}-ar.md` : `${slug}.md`;

    try {
      return await parseStoryFile(fileName);
    } catch {
      const fileNames = getStoryFileNames();
      const availableStories = fileNames.map((fileName) => fileName.replace('.md', ''));
      throw new Error(
        `Story with slug '${slug}' not found. Available stories: ${availableStories.join(', ')}`,
      );
    }
  }

  /**
   * Get all story slugs with their locales for static generation
   */
  static getAllStorySlugs() {
    const fileNames = getStoryFileNames();

    return fileNames.map((fileName) => {
      const { slug, locale } = extractSlugAndLocale(fileName);

      return {
        params: {
          slug,
          locale,
        },
      };
    });
  }

  /**
   * Get featured stories for a specific locale
   */
  static async getFeaturedStories(locale: string, limit: number = 6): Promise<StoryData[]> {
    const allStories = await this.getSortedStoriesData(locale);

    return allStories.filter((story) => story.featured).slice(0, limit);
  }

  /**
   * Get stories by country
   */
  static async getStoriesByCountry(locale: string, country: string): Promise<StoryData[]> {
    const allStories = await this.getSortedStoriesData(locale);

    return allStories.filter((story) => story.country.toLowerCase() === country.toLowerCase());
  }

  /**
   * Get all unique countries
   */
  static async getAllCountries(locale: string): Promise<string[]> {
    const allStories = await this.getSortedStoriesData(locale);
    const countries = new Set(allStories.map((story) => story.country));

    return Array.from(countries).sort();
  }
}

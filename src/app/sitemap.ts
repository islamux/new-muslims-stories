import type { MetadataRoute } from 'next';
import { StoryService } from '@/lib/story-service';
import { routing } from '@/i18n/routing';

const SITE_URL = 'https://newmuslimstories.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Locale homepages
  for (const locale of routing.locales) {
    entries.push({
      url: `${SITE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    });

    // Individual stories per locale
    const stories = await StoryService.getSortedStoriesData(locale);
    for (const story of stories) {
      entries.push({
        url: `${SITE_URL}/${locale}/stories/${story.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  return entries;
}

import type { MetadataRoute } from 'next';
import { storyRepository } from '@/lib/content';

export const dynamic = 'force-static';

const BASE_URL = 'https://newmuslimstories.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allSlugs = await storyRepository.getSlugEntries();

  const storyUrls = allSlugs.flatMap(({ slug, locale }) => [
    {
      url: `${BASE_URL}/${locale}/stories/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ]);

  const localeUrls = ['en', 'ar'].map((locale) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 1,
  }));

  return [
    ...localeUrls,
    ...storyUrls,
    {
      url: `${BASE_URL}/offline`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.1,
    },
  ];
}

import type { MetadataRoute } from 'next';
import { StoryService } from '@/lib/story-service';

const BASE_URL = 'https://newmuslimstories.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const allSlugs = StoryService.getAllStorySlugs();

  const storyUrls = allSlugs.flatMap(({ params }) => {
    const { slug, locale } = params;
    return [
      {
        url: `${BASE_URL}/${locale}/stories/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      },
    ];
  });

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

import { StoryService } from '@/lib/story-service';
import HomePageClient from '@/components/HomePageClient';
import { setRequestLocale } from 'next-intl/server';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const [stories, featuredStories] = await Promise.all([
    StoryService.getSortedStoriesData(locale),
    StoryService.getFeaturedStories(locale, 6),
  ]);

  return <HomePageClient stories={stories} featuredStories={featuredStories} />;
}

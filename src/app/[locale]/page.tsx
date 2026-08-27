import { StoryService } from '@/lib/story-service';
import HomePageClient from '@/components/HomePageClient';
import { setRequestLocale } from 'next-intl/server';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const stories = await StoryService.getSortedStoriesData(locale);
  const featuredStories = stories.filter((s) => s.featured).slice(0, 6);

  return <HomePageClient stories={stories} featuredStories={featuredStories} />;
}

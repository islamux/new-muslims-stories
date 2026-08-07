import type { Locale } from '@/types';
import { StoryService } from '@/lib/story-service';
import StoryContentDisplay from '@/components/StoryContentDisplay';
import { setRequestLocale } from 'next-intl/server';

// Only the slugs from generateStaticParams are valid; any other slug 404s
// at the router level (correct HTTP status, no dynamic rendering).
export const dynamicParams = false;

// Generate static params for all stories
export async function generateStaticParams() {
  return StoryService.getAllStorySlugs().map((entry) => entry.params);
}

// Story page component
export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string; locale: Locale }>;
}) {
  const { slug, locale } = await params;

  setRequestLocale(locale);

  const [story, allStories] = await Promise.all([
    StoryService.getStoryData(slug, locale),
    StoryService.getSortedStoriesData(locale),
  ]);

  const index = allStories.findIndex((s) => s.slug === slug);
  const prev = index > 0 ? allStories[index - 1] : undefined;
  const next = index >= 0 && index < allStories.length - 1 ? allStories[index + 1] : undefined;

  return (
    <div className="min-h-screen bg-surface text-ink">
      <StoryContentDisplay
        story={story}
        prev={prev ? { slug: prev.slug, title: prev.title } : undefined}
        next={next ? { slug: next.slug, title: next.title } : undefined}
      />
    </div>
  );
}

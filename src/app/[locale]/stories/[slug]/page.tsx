import type { Locale } from '@/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { storyRepository } from '@/lib/content';
import StoryContentDisplay from '@/components/StoryContentDisplay';
import { setRequestLocale } from 'next-intl/server';

export const dynamicParams = false;

export async function generateStaticParams() {
  return storyRepository.getSlugEntries();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: Locale }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;

  const story = await storyRepository.getBySlug(slug, locale);
  if (!story) {
    return { title: 'Story Not Found' };
  }

  const excerpt = story.contentHtml
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 160);

  const baseUrl = 'https://newmuslimstories.com';
  const storyUrl = `${baseUrl}/${locale}/stories/${slug}`;

  return {
    title: story.title,
    description: excerpt || `${story.firstName}'s story of guidance to Islam.`,
    openGraph: {
      title: story.title,
      description: excerpt,
      url: storyUrl,
      siteName: 'New Muslim Stories',
      type: 'article',
      publishedTime: story.date || undefined,
      authors: [story.author],
      ...(story.image && { images: [{ url: story.image, alt: story.title }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: story.title,
      description: excerpt,
      ...(story.image && { images: [story.image] }),
    },
    alternates: {
      canonical: storyUrl,
      languages: {
        en: `${baseUrl}/en/stories/${slug}`,
        ar: `${baseUrl}/ar/stories/${slug}`,
      },
    },
  };
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
    storyRepository.getBySlug(slug, locale),
    storyRepository.getAll(locale),
  ]);

  if (!story) {
    notFound();
  }

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

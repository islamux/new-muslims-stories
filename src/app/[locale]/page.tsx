import type { Metadata } from 'next';
import type { Locale } from '@/types';
import { storyRepository } from '@/lib/content';
import HomePageClient from '@/components/HomePageClient';
import { setRequestLocale } from 'next-intl/server';

const LOCALES = {
  en: {
    title: 'New Muslim Stories — Inspiring Journeys to Islam',
    description:
      'Discover inspiring stories of people who found guidance to Islam from around the world.',
  },
  ar: {
    title: 'قصص المسلمين الجدد — رحلات ملهمة إلى الإسلام',
    description: 'اكتشف قصصًا ملهمة للأشخاص الذين وجدوا الهداية إلى الإسلام من جميع أنحاء العالم.',
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = LOCALES[locale as keyof typeof LOCALES] ?? LOCALES.en;
  const baseUrl = 'https://newmuslimstories.com';

  return {
    title: loc.title,
    description: loc.description,
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        en: `${baseUrl}/en`,
        ar: `${baseUrl}/ar`,
      },
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const stories = await storyRepository.getAll(locale as Locale);
  const featuredStories = stories.filter((s) => s.featured).slice(0, 6);

  return <HomePageClient stories={stories} featuredStories={featuredStories} />;
}

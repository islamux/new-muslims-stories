'use client';

import dynamic from 'next/dynamic';
import { useSyncExternalStore } from 'react';
import type { HomePageClientProps } from '@/types';
import TopNav from '@/components/TopNav';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import FeaturedShowcase from '@/components/FeaturedShowcase';
import Divider from '@/components/ui/Divider';
import { useTranslations } from 'next-intl';
import Section from '@/components/ui/Section';

const FeaturedStories = dynamic(() => import('@/components/FeaturedStories'), {
  ssr: true,
  loading: () => (
    <Section className="my-12">
      <div className="container mx-auto">
        <div className="h-64 animate-pulse rounded-lg bg-line" />
      </div>
    </Section>
  ),
});

const WhoAreNewMuslims = dynamic(() => import('@/components/WhoAreNewMuslims'), {
  ssr: true,
  loading: () => (
    <Section className="my-12">
      <div className="container mx-auto">
        <div className="h-48 animate-pulse rounded-lg bg-line" />
      </div>
    </Section>
  ),
});

const StoryOfTheDay = dynamic(() => import('@/components/StoryOfTheDay'), {
  ssr: true,
  loading: () => (
    <div className="container mx-auto">
      <div className="h-48 animate-pulse rounded-xl bg-line" />
    </div>
  ),
});

const WhatsNext = dynamic(() => import('@/components/WhatsNext'), {
  ssr: true,
  loading: () => (
    <Section className="my-12">
      <div className="container mx-auto">
        <div className="h-48 animate-pulse rounded-lg bg-line" />
      </div>
    </Section>
  ),
});

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000);
}

export default function HomePageClient({ stories, featuredStories }: HomePageClientProps) {
  const commonT = useTranslations('Common');

  // Rotate the "Story of the Day" daily. Server/first-paint uses the first story
  // to avoid hydration mismatch; the client resolves the daily pick.
  const emptySubscribe = () => () => {};
  const storyOfTheDay = useSyncExternalStore(
    emptySubscribe,
    () => stories[getDayOfYear() % stories.length] ?? stories[0],
    () => stories[0],
  );

  return (
    <div className="min-h-screen bg-surface text-ink">
      <TopNav />
      <HeroSection />
      <main>
        <FeaturedShowcase stories={featuredStories} />
        <FeaturedStories stories={stories} />
        <Section className="my-12">
          <div className="container mx-auto px-4">
            <h2 className="mb-6 text-center font-heading text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {commonT('storyOfTheDay')}
            </h2>
            {storyOfTheDay && <StoryOfTheDay story={storyOfTheDay} />}
          </div>
        </Section>
        <Divider className="my-12" />
        <WhoAreNewMuslims />
        <WhatsNext />
      </main>
      <Footer />
    </div>
  );
}

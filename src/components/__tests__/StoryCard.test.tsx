import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import StoryCard from '@/components/StoryCard';
import type { StoryData } from '@/types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => (key === 'learnMore' ? 'Learn more' : key),
}));

// Link and StoryImage need Next.js router/image context that jsdom lacks.
vi.mock('@/navigation', () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
}));

vi.mock('@/components/ui/StoryImage', () => ({
  default: () => <span data-testid="story-image" />,
}));

const story: StoryData = {
  slug: 'a-r-rahman-story',
  title: 'A R Rahman Story',
  firstName: 'A R Rahman',
  author: 'Test Author',
  age: null,
  country: 'India',
  previousReligion: 'Hinduism',
  profilePhoto: '/images/a-r-rahman.webp',
  image: '/images/a-r-rahman.webp',
  featured: true,
  language: 'en',
  contentHtml: '<p>An excerpt from the story.</p>',
  date: '2024-01-01',
};

describe('StoryCard', () => {
  // Regression (2026-09-21): the CTA rendered as a <span>, so only the card
  // title navigated and the "Learn more" affordance was dead.
  it('renders the Learn more call to action as a link to the story', () => {
    const html = renderToStaticMarkup(<StoryCard story={story} />);
    const doc = new JSDOM(html).window.document;

    const learnMoreLink = Array.from(doc.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'Learn more',
    );

    expect(learnMoreLink).toBeDefined();
    expect(learnMoreLink?.getAttribute('href')).toBe('/stories/a-r-rahman-story');
  });
});

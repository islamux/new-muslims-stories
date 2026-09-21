import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { sanitizeHtmlServer } from '@/lib/sanitize';
import type { Locale, StoryData } from '@/types';
import { storyFrontmatterSchema } from './content/schema';

function extractSlug(fileName: string): string {
  return fileName.replace(/-ar\.md$/, '').replace(/\.md$/, '');
}

export function extractSlugAndLocale(fileName: string): { slug: string; locale: Locale } {
  return { slug: extractSlug(fileName), locale: fileName.endsWith('-ar.md') ? 'ar' : 'en' };
}

/**
 * Parses a single markdown story file into a validated, typed StoryData.
 * Invalid frontmatter throws — content bugs fail the build instead of
 * shipping silently with defaulted fields.
 */
export async function parseStoryFile(fileName: string, storiesDir: string): Promise<StoryData> {
  const fileContents = fs.readFileSync(path.join(storiesDir, fileName), 'utf8');
  const { data, content } = matter(fileContents);

  const parsed = storyFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ');
    throw new Error(`[story-parser] ${fileName}: invalid frontmatter -> ${issues}`);
  }
  const fm = parsed.data;

  const processed = await remark().use(html).process(content);
  return {
    slug: extractSlug(fileName),
    contentHtml: sanitizeHtmlServer(processed.toString()),
    title: fm.title,
    firstName: fm.firstName ?? fm.author,
    author: fm.author,
    age: fm.age ?? null,
    country: fm.country ?? '',
    previousReligion: fm.previousReligion ?? '',
    profilePhoto: fm.profilePhoto ?? '',
    image: fm.image ?? '',
    featured: fm.featured ?? false,
    language: fm.language,
    date: fm.date ?? '',
  };
}

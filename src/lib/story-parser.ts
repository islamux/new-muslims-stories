import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { sanitizeHtmlServer } from '@/lib/sanitize';
import type { StoryData, Locale } from '@/types';

const storiesDirectory = path.join(process.cwd(), 'src/stories');

/**
 * Extracts slug from filename (handles both en and ar locales)
 */
function extractSlug(fileName: string): string {
  const isArabic = fileName.endsWith('-ar.md');
  return isArabic ? fileName.replace(/-ar\.md$/, '') : fileName.replace(/\.md$/, '');
}

/**
 * Coerces raw frontmatter into a complete, typed StoryData.
 * Pure and side-effect-free so it can be unit-tested without the filesystem.
 * Fails safe: every field has a sane default so downstream code never sees
 * `undefined` (which previously caused `.toLowerCase()` crashes).
 */
export function normalizeStoryData(
  raw: Record<string, unknown>,
  slug: string,
  contentHtml: string,
): StoryData {
  const str = (v: unknown): string => (typeof v === 'string' ? v : '');
  const numOrNull = (v: unknown): number | null =>
    typeof v === 'number' && Number.isFinite(v) ? v : null;
  const language: Locale = raw.language === 'ar' ? 'ar' : 'en';
  const firstName = str(raw.firstName) || str(raw.author);

  return {
    slug,
    contentHtml,
    title: str(raw.title),
    firstName,
    author: str(raw.author),
    age: numOrNull(raw.age),
    country: str(raw.country),
    previousReligion: str(raw.previousReligion),
    profilePhoto: str(raw.profilePhoto),
    image: str(raw.image),
    featured: raw.featured === true,
    language,
    date: str(raw.date),
  };
}

/**
 * Parses a single markdown file into StoryData
 */
export async function parseStoryFile(fileName: string): Promise<StoryData> {
  const slug = extractSlug(fileName);

  const fullPath = path.join(storiesDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the story metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark().use(html).process(matterResult.content);
  const rawHtml = processedContent.toString();
  const contentHtml = sanitizeHtmlServer(rawHtml);

  return normalizeStoryData(matterResult.data, slug, contentHtml);
}

/**
 * Gets all story file names from the stories directory
 */
export function getStoryFileNames(): string[] {
  return fs.readdirSync(storiesDirectory).filter((name) => name.endsWith('.md'));
}

/**
 * Extracts slug and locale from filename
 */
export function extractSlugAndLocale(fileName: string): { slug: string; locale: string } {
  const isArabic = fileName.endsWith('-ar.md');
  const slug = extractSlug(fileName);
  const locale = isArabic ? 'ar' : 'en';

  return { slug, locale };
}

/**
 * Checks if a story file exists for given slug and locale
 */
export function storyFileExists(slug: string, locale: string): boolean {
  const fileName = locale === 'ar' ? `${slug}-ar.md` : `${slug}.md`;
  const fullPath = path.join(storiesDirectory, fileName);
  return fs.existsSync(fullPath);
}

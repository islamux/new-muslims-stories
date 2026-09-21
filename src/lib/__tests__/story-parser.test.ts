import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { extractSlugAndLocale, parseStoryFile } from '@/lib/story-parser';

let dir: string;

const writeStory = (fileName: string, frontmatter: string, body = '## Body\n\nSome content.') => {
  const fullPath = path.join(dir, fileName);
  fs.writeFileSync(fullPath, `---\n${frontmatter}\n---\n\n${body}`);
};

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'story-parser-'));
});

afterAll(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('story-parser', () => {
  describe('extractSlugAndLocale', () => {
    it('extracts english slug and locale from .md files', () => {
      const result = extractSlugAndLocale('ahmed-story.md');
      expect(result).toEqual({ slug: 'ahmed-story', locale: 'en' });
    });

    it('extracts arabic slug and locale from -ar.md files', () => {
      const result = extractSlugAndLocale('ahmed-story-ar.md');
      expect(result).toEqual({ slug: 'ahmed-story', locale: 'ar' });
    });
  });

  describe('parseStoryFile', () => {
    it('parses a valid story into StoryData', async () => {
      writeStory(
        'david.md',
        'title: "David: A Journey"\nauthor: "David Jones"\nfirstName: "David"\nlanguage: "en"\ndate: "2020-01-02"\nimage: "/images/david.webp"\nprofilePhoto: "/images/david.webp"\nage: 40\ncountry: "UK"\npreviousReligion: "Christianity"\nfeatured: true',
        '## Before\n\nLife before.',
      );

      const story = await parseStoryFile('david.md', dir);

      expect(story).toMatchObject({
        slug: 'david',
        title: 'David: A Journey',
        firstName: 'David',
        author: 'David Jones',
        age: 40,
        country: 'UK',
        previousReligion: 'Christianity',
        profilePhoto: '/images/david.webp',
        image: '/images/david.webp',
        featured: true,
        language: 'en',
        date: '2020-01-02',
      });
      expect(story.contentHtml).toContain('<h2>Before</h2>');
    });

    it('falls back to author for firstName and defaults missing fields', async () => {
      writeStory('minimal.md', 'title: "Minimal"\nauthor: "Only Author"\nlanguage: "en"');

      const story = await parseStoryFile('minimal.md', dir);

      expect(story.firstName).toBe('Only Author');
      expect(story.age).toBeNull();
      expect(story.country).toBe('');
      expect(story.previousReligion).toBe('');
      expect(story.profilePhoto).toBe('');
      expect(story.image).toBe('');
      expect(story.featured).toBe(false);
      expect(story.date).toBe('');
    });

    it('rejects a story missing required frontmatter', async () => {
      writeStory('no-title.md', 'author: "No Title"\nlanguage: "en"');

      await expect(parseStoryFile('no-title.md', dir)).rejects.toThrow(
        /invalid frontmatter -> title/,
      );
    });

    it('rejects unknown frontmatter keys', async () => {
      writeStory('typo.md', 'title: "Typo"\nauthor: "A"\nlanguage: "en"\ncuntry: "UK"');

      await expect(parseStoryFile('typo.md', dir)).rejects.toThrow(
        /invalid frontmatter -> .*cuntry/,
      );
    });

    it('rejects a malformed date', async () => {
      writeStory('bad-date.md', 'title: "Bad"\nauthor: "A"\nlanguage: "en"\ndate: "1977/12/23"');

      await expect(parseStoryFile('bad-date.md', dir)).rejects.toThrow(
        /invalid frontmatter -> date/,
      );
    });
  });
});

import { describe, it, expect } from 'vitest';
import { extractSlugAndLocale, normalizeStoryData, storyFileExists } from '@/lib/story-parser';

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

  describe('normalizeStoryData', () => {
    it('fills missing optional fields with empty strings', () => {
      const result = normalizeStoryData({}, 'ahmed-story.md');
      expect(result.firstName).toBe('');
      expect(result.country).toBe('');
      expect(result.previousReligion).toBe('');
      expect(result.image).toBe('');
    });

    it('keeps present values', () => {
      const result = normalizeStoryData(
        { firstName: 'Ahmed', country: 'Egypt', image: '/images/ahmed.webp', language: 'en' },
        'ahmed-story.md',
      );
      expect(result).toEqual({
        firstName: 'Ahmed',
        country: 'Egypt',
        previousReligion: '',
        image: '/images/ahmed.webp',
        language: 'en',
      });
    });

    it('derives language from the file name when frontmatter omits it', () => {
      expect(normalizeStoryData({}, 'ahmed-story.md').language).toBe('en');
      expect(normalizeStoryData({}, 'ahmed-story-ar.md').language).toBe('ar');
    });

    it('does not leak null values', () => {
      const result = normalizeStoryData({ firstName: null, country: null, language: null }, 'ahmed-story-ar.md');
      expect(result.firstName).toBe('');
      expect(result.country).toBe('');
      expect(result.language).toBe('ar');
    });
  });

  describe('storyFileExists', () => {
    it('returns false for non-existent story', () => {
      const result = storyFileExists('non-existent-story', 'en');
      expect(result).toBe(false);
    });
  });
});

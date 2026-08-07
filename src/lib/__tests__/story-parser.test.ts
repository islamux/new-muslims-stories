import { describe, it, expect } from 'vitest';
import { extractSlugAndLocale, storyFileExists, normalizeStoryData } from '@/lib/story-parser';

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

  describe('storyFileExists', () => {
    it('returns false for non-existent story', () => {
      const result = storyFileExists('non-existent-story', 'en');
      expect(result).toBe(false);
    });
  });

  describe('normalizeStoryData', () => {
    it('falls back to author when firstName is missing', () => {
      const result = normalizeStoryData({ author: 'David' }, 'david-story', '<p>x</p>');
      expect(result.firstName).toBe('David');
      expect(result.author).toBe('David');
    });

    it('prefers firstName over author when both are present', () => {
      const result = normalizeStoryData(
        { firstName: 'Ahmed', author: 'Ahmed Ali' },
        'ahmed',
        '',
      );
      expect(result.firstName).toBe('Ahmed');
    });

    it('defaults missing string fields to empty string (not undefined)', () => {
      const result = normalizeStoryData({}, 'slug', '');
      expect(result.title).toBe('');
      expect(result.country).toBe('');
      expect(result.previousReligion).toBe('');
      expect(result.profilePhoto).toBe('');
      expect(result.image).toBe('');
      expect(result.firstName).toBe('');
    });

    it('coerces age: null to null and invalid age to null', () => {
      expect(normalizeStoryData({ age: null }, 's', '').age).toBeNull();
      expect(normalizeStoryData({ age: 'old' }, 's', '').age).toBeNull();
      expect(normalizeStoryData({ age: 34 }, 's', '').age).toBe(34);
    });

    it('treats featured as true only when explicitly true', () => {
      expect(normalizeStoryData({ featured: true }, 's', '').featured).toBe(true);
      expect(normalizeStoryData({ featured: false }, 's', '').featured).toBe(false);
      expect(normalizeStoryData({}, 's', '').featured).toBe(false);
    });

    it('validates language to en|ar, defaulting unknown values to en', () => {
      expect(normalizeStoryData({ language: 'ar' }, 's', '').language).toBe('ar');
      expect(normalizeStoryData({ language: 'fr' }, 's', '').language).toBe('en');
      expect(normalizeStoryData({}, 's', '').language).toBe('en');
    });
  });
});

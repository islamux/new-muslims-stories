import { describe, expect, it } from 'vitest';
import { storyFrontmatterSchema } from '../schema';

const valid = { title: 'T', author: 'A', language: 'en' as const };

describe('storyFrontmatterSchema', () => {
  it('accepts minimal frontmatter (title, author, language)', () => {
    expect(() => storyFrontmatterSchema.parse(valid)).not.toThrow();
  });

  it('omits absent optional fields (parser applies defaults later)', () => {
    const fm = storyFrontmatterSchema.parse(valid);
    expect(fm).not.toHaveProperty('age');
    expect(fm).not.toHaveProperty('country');
    expect(fm).not.toHaveProperty('featured');
  });

  it('accepts full frontmatter with all fields', () => {
    const fm = storyFrontmatterSchema.parse({
      ...valid,
      firstName: 'Yusuf',
      date: '1977-12-23',
      image: '/img.webp',
      profilePhoto: '/img.webp',
      age: 77,
      country: 'UK',
      previousReligion: 'Christianity',
      featured: true,
    });
    expect(fm).toMatchObject({
      firstName: 'Yusuf',
      date: '1977-12-23',
      age: 77,
      country: 'UK',
      featured: true,
    });
  });

  it('rejects missing title', () => {
    expect(storyFrontmatterSchema.safeParse({ author: 'A', language: 'en' }).success).toBe(false);
  });

  it('rejects unknown keys (catches typos like cuntry)', () => {
    expect(storyFrontmatterSchema.safeParse({ ...valid, cuntry: 'UK' }).success).toBe(false);
  });

  it('rejects invalid language', () => {
    expect(storyFrontmatterSchema.safeParse({ ...valid, language: 'fr' }).success).toBe(false);
  });

  it('rejects non-ISO date and negative age when present', () => {
    expect(storyFrontmatterSchema.safeParse({ ...valid, date: '1977/12/23' }).success).toBe(false);
    expect(storyFrontmatterSchema.safeParse({ ...valid, age: -5 }).success).toBe(false);
  });
});
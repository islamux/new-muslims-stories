import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { parseStoryFile } from '../../story-parser';

const STORIES_DIR = path.join(process.cwd(), 'src', 'stories');
const fileNames = fs.readdirSync(STORIES_DIR).filter((n) => n.endsWith('.md'));

describe('real story content', () => {
  it('all story files parse with valid frontmatter', async () => {
    const failures: string[] = [];
    for (const f of fileNames) {
      try {
        await parseStoryFile(f, STORIES_DIR);
      } catch (err) {
        failures.push(String(err));
      }
    }
    expect(failures).toEqual([]);
  });

  it('every slug exists as an en/ar pair', () => {
    const slugs = new Set(fileNames.map((f) => f.replace(/-ar\.md$/, '').replace(/\.md$/, '')));
    for (const slug of slugs) {
      expect(fileNames).toContain(`${slug}.md`);
      expect(fileNames).toContain(`${slug}-ar.md`);
    }
  });

  it('frontmatter language always matches filename locale', async () => {
    for (const f of fileNames) {
      const story = await parseStoryFile(f, STORIES_DIR);
      expect(`${story.language === 'ar' ? `${story.slug}-ar` : story.slug}.md`).toBe(f);
    }
  });
});
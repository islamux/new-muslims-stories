import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { MarkdownStoryRepository } from '../markdown-story-repository';

let dir: string;

const writeStory = (fileName: string, title: string, language: string) => {
  const fullPath = path.join(dir, fileName);
  fs.writeFileSync(
    fullPath,
    `---\ntitle: "${title}"\nauthor: "Author"\nlanguage: "${language}"\n---\n\nBody.`,
  );
};

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'story-repo-'));
  // Titles deliberately out of alphabetical order to test sorting.
  writeStory('zulu.md', 'Zulu Story', 'en');
  writeStory('zulu-ar.md', 'قصة زولو', 'ar');
  writeStory('alpha.md', 'Alpha Story', 'en');
  writeStory('alpha-ar.md', 'قصة ألفا', 'ar');
  writeStory('beta.md', 'Beta Story', 'en');
});

afterAll(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('MarkdownStoryRepository', () => {
  let repo: MarkdownStoryRepository;

  beforeAll(() => {
    repo = new MarkdownStoryRepository(dir);
  });

  it('returns only english stories sorted by title', async () => {
    const stories = await repo.getAll('en');
    expect(stories.map((s) => s.slug)).toEqual(['alpha', 'beta', 'zulu']);
  });

  it('returns only arabic stories sorted by title', async () => {
    const stories = await repo.getAll('ar');
    expect(stories.map((s) => s.slug)).toEqual(['alpha', 'zulu']);
  });

  it('parses each file exactly once (memoized cache)', async () => {
    const first = await repo.getAll('en');
    const second = await repo.getAll('en');
    expect(second).toBe(first);
  });

  it('getBySlug returns the story for a slug and locale', async () => {
    const story = await repo.getBySlug('zulu', 'ar');
    expect(story).toBeDefined();
    expect(story?.slug).toBe('zulu');
    expect(story?.language).toBe('ar');
  });

  it('getBySlug returns undefined for a missing slug', async () => {
    const story = await repo.getBySlug('missing', 'en');
    expect(story).toBeUndefined();
  });

  it('getSlugEntries returns every locale variant', async () => {
    const entries = await repo.getSlugEntries();
    expect(entries).toEqual([
      { slug: 'alpha', locale: 'ar' },
      { slug: 'alpha', locale: 'en' },
      { slug: 'beta', locale: 'en' },
      { slug: 'zulu', locale: 'ar' },
      { slug: 'zulu', locale: 'en' },
    ]);
  });
});

describe('MarkdownStoryRepository language consistency', () => {
  it('rejects a file whose frontmatter language contradicts its filename', async () => {
    const badDir = fs.mkdtempSync(path.join(os.tmpdir(), 'story-repo-bad-'));
    fs.writeFileSync(
      path.join(badDir, 'wrong.md'),
      '---\ntitle: "Wrong"\nauthor: "A"\nlanguage: "ar"\n---\n\nBody.',
    );

    const badRepo = new MarkdownStoryRepository(badDir);
    await expect(badRepo.getAll('en')).rejects.toThrow(/does not match filename locale/);

    fs.rmSync(badDir, { recursive: true, force: true });
  });

  it('rejects a corrupt file (fail loud, no silent skip)', async () => {
    const badDir = fs.mkdtempSync(path.join(os.tmpdir(), 'story-repo-corrupt-'));
    fs.writeFileSync(path.join(badDir, 'broken.md'), 'not markdown at all');

    const badRepo = new MarkdownStoryRepository(badDir);
    await expect(badRepo.getAll('en')).rejects.toThrow(/invalid frontmatter/);

    fs.rmSync(badDir, { recursive: true, force: true });
  });
});
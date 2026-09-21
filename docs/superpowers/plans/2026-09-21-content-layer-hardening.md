# Content Layer Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Harden the Markdown content layer — parse-once caching (kills the O(n²) build), zod frontmatter validation (typos become build errors), and a typed `StoryRepository` interface so a future Turso/Drizzle swap touches one file.

**Architecture:** Keep Markdown in `src/stories/` as the source of truth. Introduce `src/lib/content/` containing a zod schema, a `StoryRepository` interface, and a `MarkdownStoryRepository` implementation with a parse-once promise cache. `story-parser.ts` shrinks to single-file parsing + validation. `story-service.ts` is deleted; its 4 consumers migrate to the repository.

**Tech Stack:** Next.js 16, TypeScript strict, zod v4 (new dep — the only one), vitest.

**Spec:** This chat's approved design (verbatim saved as this plan file in Task 0).

## Global Constraints

- Static generation must be preserved — no runtime data fetching (`generateStaticParams` + `dynamicParams = false` stay).
- All stories remain `.md` file pairs in `src/stories/`; no story content is edited (except where validation reveals a defect).
- Invalid frontmatter now **fails the build** (replaces today's warn-and-default). One unreadable file fails the build loudly instead of being silently skipped — content bugs must surface in CI/preview, prod keeps last good deploy.
- Behavior parity: same `StoryData` shape, same title-alphabetical sort (`localeCompare`), same 6-featured-on-home logic.
- TS strict, no `any`, 2-space indent, single quotes, semicolons, `import type` for types, `'use client'` unchanged where present.

**Audit facts this plan relies on** (verified in plan mode): the only frontmatter keys across all 198 files are `title`(198), `language`(198), `author`(198), `date`(196), `image`(188), `profilePhoto`(186), `firstName`(172), `country`(168), `previousReligion`(166), `featured`(166), `age`(166). Therefore `title`/`author`/`language` are required; everything else is optional-with-default; `.strict()` is safe (zero stray keys exist today).

---

### Task 0: Branch, plan file, dependency

**Files:** Create `docs/superpowers/plans/2026-09-21-content-layer-hardening.md` (this plan, verbatim).

- [ ] `git checkout main && git pull --ff-only && git checkout -b feat/content-layer-hardening`
- [ ] Save this plan to the path above and commit (`docs: add content layer hardening plan`)
- [ ] `pnpm add zod` (v4)

### Task 1: Frontmatter zod schema

**Files:**
- Create: `src/lib/content/schema.ts`
- Test: `src/lib/content/__tests__/schema.test.ts`

**Produces:** `storyFrontmatterSchema`, `StoryFrontmatter` (used by Task 2).

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, expect, it } from 'vitest';
import { storyFrontmatterSchema } from '../schema';

const valid = { title: 'T', author: 'A', language: 'en' as const };

describe('storyFrontmatterSchema', () => {
  it('accepts minimal frontmatter (title, author, language)', () => {
    expect(() => storyFrontmatterSchema.parse(valid)).not.toThrow();
  });

  it('applies defaults for optional fields', () => {
    const fm = storyFrontmatterSchema.parse(valid);
    expect(fm).toMatchObject({ age: null, country: undefined, featured: undefined });
  });

  it('rejects missing title', () => {
    const { title: _t, ...noTitle } = valid;
    expect(storyFrontmatterSchema.safeParse(noTitle).success).toBe(false);
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
```

- [ ] **Step 2: Run — expect FAIL** (`pnpm vitest run src/lib/content/__tests__/schema.test.ts`)
- [ ] **Step 3: Implement**

```typescript
import { z } from 'zod';

export const storyFrontmatterSchema = z.strictObject({
  title: z.string().min(1),
  author: z.string().min(1),
  firstName: z.string().min(1).optional(),
  language: z.enum(['en', 'ar']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  image: z.string().optional(),
  profilePhoto: z.string().optional(),
  age: z.number().int().positive().nullable().optional(),
  country: z.string().min(1).optional(),
  previousReligion: z.string().optional(),
  featured: z.boolean().optional(),
});

export type StoryFrontmatter = z.infer<typeof storyFrontmatterSchema>;
```

- [ ] **Step 4: Run — expect PASS**
- [ ] **Step 5: Commit** — `feat: add zod schema for story frontmatter`

### Task 2: Validate in `story-parser.ts`, delete silent defaults

**Files:**
- Modify: `src/lib/story-parser.ts` (rewrite; keep path to limit churn)
- Modify: `src/lib/__tests__/story-parser.test.ts`
- Create: `src/lib/content/__tests__/stories-content.test.ts` (real-content safety net)

**Consumes:** `storyFrontmatterSchema` (Task 1). **Produces:** `parseStoryFile(fileName, storiesDir): Promise<StoryData>`, `extractSlugAndLocale(fileName)` — signatures used by Task 3.

- [ ] **Step 1: Rewrite parser tests** — fixture-based via `fs.mkdtemp` in `beforeAll`, writing minimal `.md` files: valid (title/author/language + markdown body), missing title, unknown key, bad date. Assert `parseStoryFile` resolves with exact `StoryData` mapping (`firstName` falls back to `author`, `age ?? null`, defaults `''`/`false`) and rejects with `[story-parser] <file>: invalid frontmatter ->` + issue paths.
- [ ] **Step 2: Run — expect FAIL** (old implementation warns + defaults instead of throwing)
- [ ] **Step 3: Implement parser rewrite** — delete `normalizeStoryData`, `getStoryFileNames`, `storyFileExists`, `validateFrontmatter`, and the module-level `storiesDirectory`. New shape:

```typescript
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
```

- [ ] **Step 4: Add real-content test** (this is where any of the 198 real files with bad/missing data surfaces immediately):

```typescript
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
```

- [ ] **Step 5: Run all tests — expect PASS** (fix any real files the run exposes; `git status` must show only `src/stories/*.md` fixes if so)
- [ ] **Step 6: Commit** — `feat!: validate story frontmatter with zod, fail build on invalid content`

### Task 3: `StoryRepository` interface + parse-once `MarkdownStoryRepository`

**Files:**
- Create: `src/lib/content/types.ts`, `src/lib/content/markdown-story-repository.ts`
- Test: `src/lib/content/__tests__/markdown-story-repository.test.ts`

**Produces (exact interface consumed by Task 4):**

```typescript
import type { Locale, StoryData } from '@/types';

export interface StorySlugEntry {
  slug: string;
  locale: Locale;
}

export interface StoryRepository {
  getAll(locale: Locale): Promise<StoryData[]>;
  getBySlug(slug: string, locale: Locale): Promise<StoryData | undefined>;
  getSlugEntries(): Promise<StorySlugEntry[]>;
}
```

- [ ] **Step 1: Write failing tests** — fixture dir (4 files: `a.md`, `a-ar.md`, `b.md`, `b-ar.md`, titles out of alphabetical order): assert `getAll('en')` returns only-en sorted by `title.localeCompare`; second `getAll('en')` returns the **same array identity** (`toBe`) proving parse-once; `getBySlug` hit returns story, miss returns `undefined`; `getSlugEntries()` has 4 entries; a fixture whose `language:` contradicts its filename makes construction's first load **reject**.
- [ ] **Step 2: Run — expect FAIL**
- [ ] **Step 3: Implement** — cache built once via memoized promise; language-vs-filename mismatch throws; corrupt file throws (fail loud, per Global Constraints):

```typescript
import fs from 'fs';
import path from 'path';
import type { Locale, StoryData } from '@/types';
import { extractSlugAndLocale, parseStoryFile } from '../story-parser';
import type { StoryRepository, StorySlugEntry } from './types';

interface StoryCache {
  slugEntries: StorySlugEntry[];
  byKey: Map<string, StoryData>;
  sorted: Map<Locale, StoryData[]>;
}

const LOCALES: Locale[] = ['en', 'ar'];

export class MarkdownStoryRepository implements StoryRepository {
  private readonly storiesDir: string;
  private loadPromise: Promise<StoryCache> | null = null;

  constructor(storiesDir: string) {
    this.storiesDir = storiesDir;
  }

  private load(): Promise<StoryCache> {
    this.loadPromise ??= this.buildCache();
    return this.loadPromise;
  }

  private async buildCache(): Promise<StoryCache> {
    const fileNames = fs.readdirSync(this.storiesDir).filter((n) => n.endsWith('.md'));
    const stories = await Promise.all(fileNames.map((f) => parseStoryFile(f, this.storiesDir)));

    const byKey = new Map<string, StoryData>();
    for (const [i, fileName] of fileNames.entries()) {
      const { locale } = extractSlugAndLocale(fileName);
      const story = stories[i];
      if (story.language !== locale) {
        throw new Error(
          `[MarkdownStoryRepository] ${fileName}: frontmatter language "${story.language}" does not match filename locale "${locale}"`,
        );
      }
      byKey.set(`${locale}/${story.slug}`, story);
    }

    const sorted = new Map<Locale, StoryData[]>(
      LOCALES.map((locale) => [
        locale,
        stories
          .filter((s) => s.language === locale)
          .sort((a, b) => a.title.localeCompare(b.title)),
      ]),
    );

    return {
      slugEntries: fileNames.map((fileName) => {
        const { slug, locale } = extractSlugAndLocale(fileName);
        return { slug, locale };
      }),
      byKey,
      sorted,
    };
  }

  async getAll(locale: Locale): Promise<StoryData[]> {
    return (await this.load()).sorted.get(locale) ?? [];
  }

  async getBySlug(slug: string, locale: Locale): Promise<StoryData | undefined> {
    return (await this.load()).byKey.get(`${locale}/${slug}`);
  }

  async getSlugEntries(): Promise<StorySlugEntry[]> {
    return (await this.load()).slugEntries;
  }
}
```

- [ ] **Step 4: Run — expect PASS**
- [ ] **Step 5: Commit** — `feat: add parse-once MarkdownStoryRepository with StoryRepository interface`

### Task 4: Migrate consumers, delete `story-service.ts`

**Files:**
- Create: `src/lib/content/index.ts`
- Modify: `src/app/[locale]/page.tsx`, `src/app/[locale]/stories/[slug]/page.tsx`, `src/app/sitemap.ts`
- Delete: `src/lib/story-service.ts`

**Consumes:** `storyRepository` (Task 3 signatures).

- [ ] **Step 1: Create barrel:**

```typescript
import path from 'path';
import { MarkdownStoryRepository } from './markdown-story-repository';
import type { StoryRepository } from './types';

export type { StoryRepository, StorySlugEntry } from './types';

export const storyRepository: StoryRepository = new MarkdownStoryRepository(
  path.join(process.cwd(), 'src', 'stories'),
);
```

- [ ] **Step 2: Migrate `src/app/sitemap.ts`** — replace `StoryService.getAllStorySlugs()` with `await storyRepository.getSlugEntries()` (make `sitemap()` async); URL building unchanged.
- [ ] **Step 3: Migrate home page** — `const stories = await storyRepository.getAll(locale as Locale);` keep inline featured filter. Remove `StoryService` import.
- [ ] **Step 4: Migrate story page** — `generateStaticParams` becomes `async` returning `storyRepository.getSlugEntries()` (flat `{slug, locale}` objects); `generateMetadata` uses `const story = await storyRepository.getBySlug(slug, locale); if (!story) return { title: 'Story Not Found' };` (drop try/catch); page body uses `getBySlug` + `notFound()` from `next/navigation` on miss, and `getAll` for prev/next. Keep `dynamicParams = false`.
- [ ] **Step 5: Delete `src/lib/story-service.ts`** — `grep -r "story-service\|StoryService" src/` must return zero matches.
- [ ] **Step 6: Verify:** `pnpm lint && pnpm test && pnpm build` — build must pre-render all 198 story pages with no new warnings. Spot-check `pnpm dev` on `/en`, `/ar`, one story in both locales.
- [ ] **Step 7: Commit** — `refactor: migrate pages to StoryRepository, remove StoryService`

### Task 5: Docs + finish

- [ ] **Step 1:** AGENTS.md content-management section — add: *"Frontmatter is validated with zod at build (`src/lib/content/schema.ts`); invalid or unknown fields fail `pnpm build`."*
- [ ] **Step 2:** Full gate: `pnpm lint && pnpm test && pnpm audit:ar && pnpm build`
- [ ] **Step 3:** Commit `docs: document frontmatter validation`, push, create PR (no branch deletion on merge, per repo rules).

---

**Self-review done:** the three approved goals each map to tasks (cache → T3, validation → T1–T2, repository interface → T3–T4); signatures are consistent across tasks; no placeholders; behavior changes are explicit (fail-loud replaces skip-and-warn).
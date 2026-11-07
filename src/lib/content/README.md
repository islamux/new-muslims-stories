# Story Content Repository

## Overview
Filesystem-backed repository that reads Markdown stories from `src/stories`, validates frontmatter with zod, parses Markdown to sanitized HTML, and exposes locale-aware lookups through a single memoized cache.

## Interface
- `StorySlugEntry` — `{ slug, locale }`. `[types.ts:StorySlugEntry]`
- `StoryRepository` — `getAll`, `getBySlug`, `getSlugEntries`. `[types.ts:StoryRepository]`
- `MarkdownStoryRepository` — class implementing `StoryRepository`. `[markdown-story-repository.ts:MarkdownStoryRepository]`
- `storyFrontmatterSchema` — strict zod schema for story frontmatter. `[schema.ts:storyFrontmatterSchema]`
- `storyRepository` — singleton bound to `process.cwd()/src/stories`. `[index.ts:storyRepository]`
- Re-exported types `StoryRepository` and `StorySlugEntry`. `[index.ts:export type]`

## Invariants
- The cache is built once through a memoized `loadPromise`; subsequent calls reuse it. `[markdown-story-repository.ts:load]`
- Only files ending in `.md` are read, in sorted filename order. `[markdown-story-repository.ts:buildCache]`
- Each file's frontmatter `language` must equal the filename locale (`ar` only for `-ar.md`); mismatch throws. `[markdown-story-repository.ts:buildCache]`
- `getAll(locale)` returns stories sorted by `title.localeCompare`. `[markdown-story-repository.ts:buildCache]`
- `getBySlug` looks up the composite key `${locale}/${slug}`. `[markdown-story-repository.ts:getBySlug]`
- `storyFrontmatterSchema` is a `z.strictObject`; `title`, `author`, and `language` are required, and `language` is limited to `en`/`ar`. `[schema.ts:storyFrontmatterSchema]`
- Invalid or unknown frontmatter fails parsing instead of defaulting silently. `[schema.ts:storyFrontmatterSchema]` `[markdown-story-repository.ts:buildCache]`

## Side Effects
- Reads the stories directory with `fs.readdirSync`. `[markdown-story-repository.ts:buildCache]`
- Delegates file parsing to `parseStoryFile` in `../story-parser.ts`, which reads each Markdown file and sanitizes the rendered HTML. `[markdown-story-repository.ts:buildCache]`
- Throws on unparseable stories or locale/filename mismatches. `[markdown-story-repository.ts:buildCache]`

## Verification
- Run: `pnpm test`

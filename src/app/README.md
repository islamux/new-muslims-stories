# App Router Root

## Overview
Next.js App Router root containing the locale-aware application shell, the offline fallback route, global styles, and the statically generated `robots.txt` and `sitemap.xml` routes.

## Interface
- `dynamic = 'force-static'` in `robots.ts`. `[robots.ts:dynamic]`
- `robots()` — default metadata route returning crawl rules and the sitemap URL. `[robots.ts:robots]`
- `dynamic = 'force-static'` in `sitemap.ts`. `[sitemap.ts:dynamic]`
- `BASE_URL` — `https://newmuslimstories.com`. `[sitemap.ts:BASE_URL]`
- `sitemap()` — default async metadata route returning locale, story, and offline URLs. `[sitemap.ts:sitemap]`
- Child: [`[locale]/README.md`](./%5Blocale%5D/README.md) — localized app shell and pages.
- Child: [`offline/README.md`](./offline/README.md) — PWA offline fallback.
- Non-contract assets: `globals.css` and `favicon.ico`.

## Invariants
- `robots()` allows every user agent, disallows `/offline`, and points to `https://newmuslimstories.com/sitemap.xml`. `[robots.ts:robots]`
- `sitemap()` assigns priority `1` to locale homepages, `0.8` to story pages, and `0.1` to `/offline`. `[sitemap.ts:sitemap]`
- Both metadata routes are forced static. `[robots.ts:dynamic]` `[sitemap.ts:dynamic]`
- Every sitemap entry uses `new Date()` as `lastModified`. `[sitemap.ts:sitemap]`

## Side Effects
- `sitemap()` reads story slugs through `storyRepository.getSlugEntries()`. `[sitemap.ts:sitemap]`

## Verification
- Run: `pnpm test`

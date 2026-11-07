# Story Detail Route (`[slug]`)

## Overview
Dynamic story page for a single localized story. Next.js statically generates one page per slug/locale pair from the Markdown-backed story repository and renders the shared `StoryContentDisplay` component with previous/next navigation.

## Interface
- `dynamicParams` — set to `false`, disabling on-demand rendering for unknown params. `[page.tsx:dynamicParams]`
- `generateStaticParams()` — returns `storyRepository.getSlugEntries()`. `[page.tsx:generateStaticParams]`
- `generateMetadata({ params })` — returns story title, description, Open Graph, Twitter, canonical, and `en`/`ar` alternate metadata. `[page.tsx:generateMetadata]`
- `StoryPage({ params })` — default async page component; loads the story and all locale stories, computes `prev`/`next`, and renders `StoryContentDisplay`. `[page.tsx:StoryPage]`

## Invariants
- Only slugs returned by `getSlugEntries()` are renderable because `dynamicParams` is `false`; a missing story calls `notFound()`. `[page.tsx:dynamicParams]` `[page.tsx:StoryPage]`
- Missing metadata returns `{ title: 'Story Not Found' }` instead of throwing. `[page.tsx:generateMetadata]`
- `prev` exists only when the story index is greater than 0; `next` exists only when the index is below `allStories.length - 1`. `[page.tsx:StoryPage]`
- Canonical and language alternates are built from `https://newmuslimstories.com/${locale}/stories/${slug}`. `[page.tsx:generateMetadata]`

## Side Effects
- Reads story data through `storyRepository.getBySlug()` and `storyRepository.getAll()` (filesystem-backed, memoized repository). `[page.tsx:StoryPage]`
- Calls `setRequestLocale(locale)` before rendering. `[page.tsx:StoryPage]`
- Calls `notFound()` for an unknown story. `[page.tsx:StoryPage]`

## Verification
- Run: `pnpm test`

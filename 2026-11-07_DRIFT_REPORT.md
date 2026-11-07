# EGM Drift Report — 2026-11-07

Scope: the 16 contracts created or modified by the `egm-bootstrap` run for the repository root.

## src/app/[locale]/stories/[slug]/README.md

- Coverage gap: `generateMetadata` strips HTML tags, trims, and truncates the excerpt to 160 characters, then falls back to `${story.firstName}'s story of guidance to Islam.` when the excerpt is empty; the contract does not mention the excerpt or fallback logic. `[page.tsx:generateMetadata]`
- Coverage gap: the Open Graph object includes `publishedTime`, `authors`, and conditional `images`; the Twitter object uses `summary_large_image` and conditional images. The contract only says "Open Graph, Twitter". `[page.tsx:generateMetadata]`

## src/app/[locale]/stories/README.md

- No drift detected.

## src/app/offline/README.md

- Drift: `OfflineLayout` hardcodes `<html lang="en">` while `OfflinePage` can render Arabic with `dir="rtl"`. The document language therefore does not follow the detected locale, despite the contract describing bilingual offline rendering. `[layout.tsx:OfflineLayout]` `[page.tsx:OfflinePage]`
- Coverage gap: `detectLocale` catches `localStorage` access failures and silently falls back to `navigator.language`; the contract only says it reads the persisted locale. `[page.tsx:detectLocale]`

## src/app/[locale]/README.md

- Coverage gap: `LocaleLayout` renders a skip-to-content link and wraps `PlausibleAnalytics` in `<Suspense fallback={null}>`; neither is mentioned in the contract. `[layout.tsx:LocaleLayout]`
- Coverage gap: `LocaleLayout` sets `suppressHydrationWarning` on `<html>`; not documented. `[layout.tsx:LocaleLayout]`
- Coverage gap: `Home` casts the route locale to `Locale` and passes both `stories` and `featuredStories` to `HomePageClient`; the contract only describes the localized homepage. `[page.tsx:Home]`

## src/app/README.md

- Coverage gap: `sitemap()` assigns `changeFrequency` values of `monthly` to story pages, `weekly` to locale homepages, and `yearly` to `/offline`; the contract does not mention these values. `[sitemap.ts:sitemap]`

## src/components/ui/README.md

- Coverage gap: `StoryImage` substitutes the literal alt text `'Story portrait'` when `alt` is empty; not documented. `[StoryImage.tsx:StoryImage]`
- Coverage gap: `Star` applies `strokeWidth={4}` when `filled` is false; not documented. `[Star.tsx:Star]`
- Coverage gap: `Icon` prepends `flex-shrink-0` to the supplied class names; not documented. `[Icon.tsx:Icon]`

## src/components/README.md

- Coverage gap: `HomePageClient` code-splits `FeaturedStories`, `WhoAreNewMuslims`, `StoryOfTheDay`, and `WhatsNext` with `next/dynamic` and per-section skeleton loaders; the contract lists the components but not the dynamic imports or loading states. `[HomePageClient.tsx:dynamic]`
- Coverage gap: `FeaturedShowcase` returns `null` when the `stories` array is empty; not documented. `[FeaturedShowcase.tsx:FeaturedShowcase]`
- Coverage gap: `PlausibleAnalytics` defaults `PLAUSIBLE_URL` to `https://plausible.io`; not documented. `[PlausibleAnalytics.tsx:PLAUSIBLE_URL]`
- Coverage gap: `StoryCard` joins country and previous religion into a ` · `-separated meta line; not documented. `[StoryCard.tsx:StoryCard]`
- Coverage gap: `StoryContentDisplay` gives the second section a gilt border and the first section a drop-cap; not documented. `[StoryContentDisplay.tsx:StorySection]`
- Coverage gap: `ThemeToggle` is disabled until `useHasMounted()` returns true; not documented. `[ThemeToggle.tsx:ThemeToggle]`
- Coverage gap: `PWAInstall` renders a fixed feature list (`featureOffline`, `featureFast`, `featureHome`); not documented. `[PWAInstall.tsx:PWA_FEATURES]`

## src/hooks/README.md

- No drift detected.

## src/i18n/README.md

- No drift detected.

## src/lib/content/README.md

- Coverage gap: `storyFrontmatterSchema` optional fields and constraints are not documented: `firstName`, `date` (`YYYY` or `YYYY-MM-DD`), `image`, `profilePhoto`, `age` (positive integer), `country`, `previousReligion`, and `featured`. `[schema.ts:storyFrontmatterSchema]`
- Coverage gap: `buildCache` throws when a parsed story is missing, in addition to the documented locale mismatch. `[markdown-story-repository.ts:buildCache]`
- Coverage gap: `getAll` returns `[]` when the locale has no sorted bucket; not documented. `[markdown-story-repository.ts:getAll]`

## src/lib/README.md

- Coverage gap: the specific font families and CSS variables are not documented: `Inter` (`--font-ui`), `Source_Serif_4` (`--font-body`), `Amiri` (`--font-display`), and `Aref_Ruqaa` (`--font-ruqaa`). `[fonts.ts:fontUI]`
- Coverage gap: `metadata` includes an icon list and `appleWebApp` configuration; the contract only mentions the shared metadata export. `[metadata.ts:metadata]`
- Coverage gap: `parseStoryFile` runs `gray-matter`, `remark`, and `remark-html` before sanitization; the contract only says it parses Markdown. `[story-parser.ts:parseStoryFile]`

## src/types/README.md

- Coverage gap: the `StoryData` field list is not enumerated: `slug`, `title`, `firstName`, `author`, `age`, `country`, `previousReligion`, `profilePhoto`, `image`, `featured`, `language`, `contentHtml`, and `date`. `[story.types.ts:StoryData]`
- Coverage gap: `StoryNavEntry` (`slug`, `title`) and `StoryImageProps` (`src`, `alt`, `priority`, `sizes`) fields are not enumerated. `[component.types.ts:StoryNavEntry]` `[component.types.ts:StoryImageProps]`
- Coverage gap: `ButtonProps` extends `React.ButtonHTMLAttributes<HTMLButtonElement>` and requires `children`; not documented. `[component.types.ts:ButtonProps]`

## src/README.md

- No drift detected.

## public/README.md

- Coverage gap: the push notification payload (default body `'New story available'`, icon, badge, vibrate pattern, and data) is not documented. `[sw.js:'push']`
- Coverage gap: `notificationclick` opens `'/'` when no visible client exists; the contract only says it focuses or opens a window. `[sw.js:'notificationclick']`

## scripts/README.md

- No drift detected.

## README.md

- ~~Drift: the feature list and project structure claim "~69 stories × 2 languages"; `src/stories` currently contains 208 Markdown files (104 English + 104 Arabic).~~ **Resolved 2026-11-07:** replaced the volatile count with "bilingual English/Arabic story pairs" / "English/Arabic pairs" so the claim stays true as batches land. `[README.md:Features]`
- ~~Drift: the feature list claims `generateMetadata` is present "on all pages"; it is defined only in `src/app/[locale]/page.tsx` and `src/app/[locale]/stories/[slug]/page.tsx`.~~ **Resolved 2026-11-07:** now scoped to "the locale homepage and story detail pages". `[README.md:Features]` `[src/app/[locale]/page.tsx:generateMetadata]` `[src/app/[locale]/stories/[slug]/page.tsx:generateMetadata]`
- Coverage gap: root configuration files `tsconfig.json`, `lefthook.yml`, `vercel.json`, `pnpm-workspace.yaml`, `opencode.json`, and `.npmrc` are not described in Local Interface & Invariants. `[README.md:Local Interface & Invariants]`
- Coverage gap: the project structure omits `src/lib/content/__tests__/` and `src/test/setup.ts`. `[README.md:Project Structure]`

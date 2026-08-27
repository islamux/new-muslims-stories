# Production Audit Report

**Project:** New Muslim Stories
**Date:** May 21, 2026
**Auditor:** Production audit via static code analysis
**Branch:** `feat/audit-plan-execution`

> **Update (August 2026):** A follow-up senior review was conducted and all Critical, High, and Medium findings have been addressed across 5 phases of fixes. See `review-plan.md` for the updated audit plan and results. Key fixes include: i18n routing verified correct for Next.js 16, SEO metadata added to all 138 story pages, accessibility improvements (skip-to-content, focus-visible), dead code removal, and service worker hardening.

---

## 1. Executive Summary

New Muslim Stories is a Next.js 16 bilingual (English/Arabic) application with 138 Markdown-based story pages, PWA support, and i18n routing. The codebase shows careful attention to content organization and localization structure, but has significant production-readiness gaps across three critical areas:

**Internationalization routing is non-functional.** The middleware file is named `src/proxy.ts` instead of `src/middleware.ts`, which means Next.js never loads it. Without this, locale negotiation, redirects, and locale cookie handling are all broken — the root URL serves no locale at all and visitors get no language detection.

**Search engine optimization is entirely absent.** There is no `generateMetadata` on any page, no `robots.txt`, no `sitemap.xml`, no Open Graph or Twitter Card metadata, no canonical URLs, and no hreflang annotations. All 140+ pages share identical HTML `<title>` and meta description. The entire SEO surface area of a content-rich site with 138 unique stories is untapped.

**The component architecture forces maximum client-side JavaScript.** 100% of components in `src/components/` are `'use client'` components, including pure presentational wrappers. The `useHasMounted` anti-pattern causes the hero section (largest viewport element) to render as blank during SSR, degrading LCP and causing CLS. Two animation libraries (`framer-motion`, `react-scroll-parallax`) are installed as dependencies but never imported.

### Executive Scores

| Dimension | Score | Evidence |
|-----------|-------|----------|
| Overall Quality | 4/10 | Working content model but broken routing, no SEO, and excessive client JS |
| Scalability | 6/10 | Static generation structure supports 138+ stories; but missing SSG config limits it |
| Performance | 3/10 | 100% client components, no code splitting, no font optimization, LCP-damaging patterns |
| Maintainability | 5/10 | Clean file organization but fragile regex-based parsing, unused deps, missing validation |
| Production Readiness | 2/10 | Critical i18n routing failure, no SEO, XSS risks, accessibility violations |

**Verdict:** Not ready for production deployment. The middleware naming issue alone breaks the core value proposition (bilingual content delivery). The SEO gap means 138 stories have zero discoverability. Approximately 2-3 weeks of focused engineering work is needed to reach production readiness.

---

## 2. Critical Findings

### [CRITICAL] Middleware named `proxy.ts` instead of `middleware.ts` — i18n routing completely broken

- **Category:** Architecture
- **Location:** `src/proxy.ts:1`
- **Technical explanation:** Next.js only loads middleware from `src/middleware.ts` (or `<root>/middleware.ts`). The file at `src/proxy.ts` exports a valid `createMiddleware` from `next-intl/middleware` but is never loaded by the framework. All i18n routing — locale detection from `Accept-Language` header, locale cookie management, root URL redirect to preferred locale — is non-functional.
- **Production impact:** Users visiting the root URL get no locale redirect. The application may render without locale context, producing blank pages or untranslated content. This is a complete failure of the core bilingual delivery mechanism.
- **Fix strategy:** Rename `src/proxy.ts` to `src/middleware.ts`. The middleware config matcher is already correct.
- **Estimated impact after fixing:** Full i18n routing restored. Users redirected to their preferred locale based on browser settings. Locale cookie set correctly.

### [CRITICAL] No per-page metadata, no robots.txt, no sitemap.xml — entire site SEO surface area absent

- **Category:** SEO
- **Locations:**
  - `src/app/[locale]/page.tsx` — no `generateMetadata`
  - `src/app/[locale]/stories/[slug]/page.tsx` — no `generateMetadata`
  - `src/lib/metadata.ts:4-17` — no Open Graph, Twitter, hreflang, or canonical config
  - `public/` — no `robots.txt` or `sitemap.xml`
- **Technical explanation:** None of the pages export `generateMetadata`. The root layout re-exports static metadata from `src/lib/metadata.ts` which only contains `title`, `description`, `manifest`, `appleWebApp`, and `icons`. No page has unique `<title>` or `<meta name="description">`. No Open Graph or Twitter Card tags are emitted. No `robots.txt` or `sitemap.xml` exist.
- **Production impact:** All 138+ pages (69 stories × 2 locales) share the same generic title and description in search results. Social media sharing produces bare/unfurlable links. Search engines have no crawl guidance. This completely negates the SEO value of having 138 unique content pages.
- **Fix strategy:**
  1. Add `generateMetadata` to `src/app/[locale]/page.tsx` (locale-aware homepage metadata)
  2. Add `generateMetadata` to `src/app/[locale]/stories/[slug]/page.tsx` (dynamic per-story metadata: title from story frontmatter, description excerpt, OG image)
  3. Extend `src/lib/metadata.ts` with `openGraph`, `twitter`, `alternates` (hreflang for en/ar), and `robots` fields
  4. Create `public/robots.txt`
  5. Create `src/app/sitemap.ts` for dynamic sitemap generation
- **Estimated impact after fixing:** Every story page has unique SEO metadata optimized for its content and locale. Social sharing produces rich cards. Crawlers properly index all content with correct language targeting.

### [CRITICAL] Unsafe `dangerouslySetInnerHTML` with no XSS sanitization

- **Category:** Content
- **Location:** `src/components/StoryContentDisplay.tsx:19`
- **Technical explanation:** Story content is rendered via `dangerouslySetInnerHTML={{ __html: content }}` where `content` comes from `remark-html` Markdown-to-HTML conversion. The remark pipeline has no sanitization step — no `rehype-sanitize`, no DOMPurify. Any raw HTML embedded in a Markdown file (including `<script>`, `onerror`, etc.) passes through unchanged.
- **Production impact:** Content is currently authored by the development team, so risk is limited. However, if content files are ever editable via a CMS, CI/CD compromise, or third-party contribution, this becomes a critical XSS vector affecting all visitors to the affected story page.
- **Fix strategy:** Add `rehype-sanitize` to the remark pipeline in `src/lib/story-parser.ts`, or use DOMPurify to sanitize the HTML string client-side. Pre-sanitization at build/parse time is recommended.
- **Estimated impact after fixing:** Defense-in-depth against XSS. No visible change to content rendering.

### [CRITICAL] Unsafe frontmatter type assertions with zero runtime validation

- **Category:** Content
- **Location:** `src/lib/story-parser.ts:37-47`
- **Technical explanation:** `const data = matterResult.data as { title: string; firstName: string; ... }` is a TypeScript `as` assertion, not runtime validation. Missing fields silently become `undefined`. The `language` field cast `as Locale` doesn't verify it's `'en'` or `'ar'`. Two stories (`joram-van-klaveren*`) are missing the `language` field entirely, and two more (`abdal-malik-rezeski-story*`) have no frontmatter at all.
- **Production impact:** Missing fields cause silent data corruption — `story.firstName` is undefined, `story.language` is undefined (stories invisible), `story.age` is null (renders 'null years old'). Two files with no frontmatter may crash the entire build.
- **Fix strategy:** Replace the `as` cast with runtime validation (Zod schema or manual field checks with descriptive error messages). Add validation that required fields exist and have the correct type.
- **Estimated impact after fixing:** Invalid/missing fields produce clear errors instead of silent runtime failures. Frontmatter data integrity guaranteed.

---

## 3. High Priority Findings

### [HIGH] Missing `generateStaticParams` in locale layout — all pages dynamically rendered

- **Category:** Architecture
- **Location:** `src/app/[locale]/layout.tsx:1`
- **Technical explanation:** `setRequestLocale(locale)` is called but no `generateStaticParams` tells Next.js which locale values to pre-render. Without it, both locale variants are dynamically rendered on each request.
- **Production impact:** No static pre-rendering of locale variants. Increased server load, slower TTFB, cannot deploy to static hosting.
- **Fix strategy:** Add `export function generateStaticParams() { return [{ locale: 'en' }, { locale: 'ar' }]; }` to the locale layout.
- **Estimated impact after fixing:** Both locale variants pre-rendered at build time. Dramatically faster page loads.

### [HIGH] Story page throws 500 instead of 404 for missing slugs

- **Category:** Architecture
- **Location:** `src/app/[locale]/stories/[slug]/page.tsx:16-18`
- **Technical explanation:** When a slug is not found, a generic `Error` is thrown with filesystem information (`Available stories: ...`) in the message. Next.js renders this as a 500 error page.
- **Production impact:** Visitors to deleted or mistyped story URLs see a frightening 500 error. Filesystem structure leaked in error message.
- **Fix strategy:** Call `notFound()` from `next/navigation` instead of throwing. Add `export const dynamicParams = false;`.
- **Estimated impact after fixing:** Proper 404 behavior. No sensitive information leaked.

### [HIGH] `useHasMounted` causes blank hero section during SSR (LCP degradation)

- **Category:** Performance
- **Locations:** `src/components/HeroSection.tsx:20`, `src/components/Header.tsx:8-10`
- **Technical explanation:** Both components return `null` during SSR via `useHasMounted()`. The hero section — largest viewport element — is invisible on first paint, then appears after client hydration re-renders. This causes visible content pop-in and CLS.
- **Production impact:** LCP delayed by hundreds of milliseconds. CLS for the most visible page element. This is a major Lighthouse performance score drag.
- **Fix strategy:** Remove `useHasMounted` from both components. They use only `useTranslations` which next-intl/server supports server-side.
- **Estimated impact after fixing:** Hero content visible immediately. LCP improved by hundreds of ms. CLS eliminated for hero region.

### [HIGH] 100% of components are client components — zero server components

- **Category:** Performance
- **Location:** All files under `src/components/`
- **Technical explanation:** Every component in `src/components/` (21 files) has a `'use client'` directive. Even pure presentational wrappers (Section, Icon, Button) force client boundaries. Next.js 16's RSC architecture is entirely unused in the component tree.
- **Production impact:** Maximum JavaScript bundle size, maximum hydration cost, minimum Server-Side Rendering benefits. The app performs closer to a client-side-rendered app than a server-rendered one.
- **Fix strategy:** Systematic audit — remove `'use client'` from components with zero client-side hooks, state, or browser APIs. Use `getTranslations` from `next-intl/server` for server-side i18n.
- **Estimated impact after fixing:** Potentially 70-80% reduction in client JS. Dramatic improvement in LCP, TTI, TBT, and Lighthouse score.

### [HIGH] No code splitting via `next/dynamic` anywhere

- **Category:** Performance
- **Locations:** Entire application
- **Technical explanation:** Zero uses of `next/dynamic`, `React.lazy`, or dynamic `import()`. PWAInstall and ServiceWorkerRegistration — components not needed on initial render — are loaded unconditionally.
- **Production impact:** Every page load sends the full JS bundle, inflating time-to-interactive by an estimated 20-40KB gzipped.
- **Fix strategy:** Use `next/dynamic` for PWAInstall and ServiceWorkerRegistration with `ssr: false`.
- **Estimated impact after fixing:** Reduced initial JS payload. Improved TTI.

### [HIGH] Fonts loaded via CSS `@import` instead of `next/font`

- **Category:** Performance
- **Location:** `src/app/globals.css:3-4`
- **Technical explanation:** `@import '@fontsource/inter'` and `@import '@fontsource/montserrat'` load full font files with no subsetting, no preload, and render-blocking behavior.
- **Production impact:** Font files 80-90% larger than necessary. No automatic preload tags. Render-blocking font loading can delay first paint.
- **Fix strategy:** Replace with `next/font/google` calls (or `next/font/local` pointing to @fontsource packages) with `display: 'swap'` and `preload: true`.
- **Estimated impact after fixing:** Font payload reduced by 80-90% via subsetting. Preload tags injected. No render blocking.

### [HIGH] Offline page not localized; hardcoded `/en` link

- **Category:** i18n
- **Location:** `src/app/offline/page.tsx:74`
- **Technical explanation:** All text is hardcoded English. The "Go to Homepage" link hardcodes `/en`. Arabic users get English-only content and are redirected to English homepage.
- **Production impact:** Arabic users see untranslated content when offline — the only time they most need clear communication.
- **Fix strategy:** Use `useTranslations` for all strings. Use locale-aware navigation for the homepage link.
- **Estimated impact after fixing:** Fully localized offline experience.

### [HIGH] Missing skip-to-content link and heading hierarchy violations

- **Category:** Accessibility
- **Locations:** `src/app/[locale]/layout.tsx` (no skip link), `src/components/ProfileHeader.tsx:22` (title as `<p>` not `<h1>`)
- **Technical explanation:** No bypass block mechanism exists. Story detail pages have no `<h1>` heading — the story title is rendered as a `<p>` element.
- **Production impact:** WCAG SC 2.4.1 and SC 1.3.1 failures. Screen reader users must tab through all navigation before content. Document outline is semantically incorrect for all 138+ story pages.
- **Fix strategy:** Add skip-to-content link. Replace `<p>` with `<h1>` for story titles.
- **Estimated impact after fixing:** Immediate accessibility improvement for keyboard and screen reader users.

### [HIGH] RTL issues: hardcoded LTR spacing and `<html>` direction

- **Category:** RTL
- **Locations:** `src/app/layout.tsx:12` (hardcoded `lang="en"`), `src/app/[locale]/layout.tsx:32` (dir on `<div>` not `<html>`), `ThemeToggle.tsx:78`, `PWAInstall.tsx:75`, `offline/page.tsx:47`
- **Technical explanation:** Root `<html>` element hardcodes `lang="en"` and has no `dir` attribute (set on a child `<div>` instead). Multiple components use `ml-2`, `mr-2`, `left-4`, `right-4` instead of Tailwind logical properties (`ms-2`, `me-2`, `inset-inline-4`).
- **Production impact:** Browser scrollbars, spellcheck, and screen reader language detection use English on Arabic pages. Visual misalignment in RTL mode on every page.
- **Fix strategy:** Make root `<html>` `lang` and `dir` dynamic. Replace physical CSS properties with logical equivalents.
- **Estimated impact after fixing:** Correct RTL layout and document-level language/direction. Consistent rendering across all locales.

### [HIGH] Content section splitting by fragile regex breaks many stories

- **Category:** Content
- **Location:** `src/hooks/useStorySections.ts:15-20`
- **Technical explanation:** Regex `/ <h[23]>(.*?)<\\/h[23]>/g` with hardcoded array indices (2, 4, 6) assumes exactly three `##` sections. 35 files use `###` headings, 2 files have no headings, and some stories have different section counts between locale variants.
- **Production impact:** Content silently assigned to wrong sections or omitted entirely. Silent failure — no error, no monitoring signal.
- **Fix strategy:** Replace regex splitting with proper DOM-based section extraction, or enforce consistent heading structure across all story files.
- **Estimated impact after fixing:** Reliable section rendering across all 138 stories.

---

## 4. Medium Priority Findings

### [MEDIUM] Viewport metadata disables user zoom (WCAG 1.4.4 failure)

- **Category:** Accessibility
- **Location:** `src/lib/metadata.ts:20-26`
- **Fix:** Remove `maximumScale: 1` and `userScalable: false`.

### [MEDIUM] No `loading.tsx`, `error.tsx`, or `not-found.tsx` for locale routes

- **Category:** UX
- **Locations:** `src/app/[locale]/`, `src/app/[locale]/stories/`
- **Fix:** Add loading skeletons, error boundaries with retry buttons, and branded 404 pages.

### [MEDIUM] Dead dependencies: framer-motion and react-scroll-parallax

- **Category:** Architecture
- **Location:** `package.json:17,25`
- **Fix:** Remove from `dependencies`. ~8MB of unnecessary install weight.

### [MEDIUM] Unused CSS animation classes and orphaned IntersectionObserver hooks

- **Category:** Maintainability
- **Locations:** `src/app/globals.css:54-63`, `src/hooks/useIntersectionObserver.ts`, `src/hooks/useMultipleIntersectionObserver.ts`
- **Fix:** Remove dead CSS. Archive or delete unused hooks.

### [MEDIUM] Flag emojis in LanguageSwitcher inaccessible

- **Category:** Accessibility
- **Location:** `src/components/LanguageSwitcher.tsx:17-18`
- **Fix:** Replace with text labels (`EN` / `AR`) or proper icons with `aria-label`.

### [MEDIUM] Synchronous filesystem I/O blocks event loop during SSG

- **Category:** Performance
- **Location:** `src/lib/story-parser.ts:27`
- **Fix:** Replace `readFileSync`/`readdirSync` with `fs.promises` async alternatives.

### [MEDIUM] PWA install prompt lacks focus trap and Escape dismiss

- **Category:** Accessibility
- **Location:** `src/components/PWAInstall.tsx:107-119`
- **Fix:** Add focus trap, `aria-modal`, Escape key handler.

### [MEDIUM] getSortedStoriesData uses `Promise.all` without error isolation

- **Category:** Architecture
- **Location:** `src/lib/story-service.ts:11-23`
- **Fix:** Use `Promise.allSettled` or individual try/catch per file.

### [MEDIUM] Zero stories marked as `featured: true`

- **Category:** Content
- **Location:** All story frontmatter files
- **Fix:** Add `featured: true` to 6-12 curated stories, or remove the unused field.

### [MEDIUM] Insufficient visible focus indicators on interactive elements

- **Category:** Accessibility
- **Location:** Multiple components
- **Fix:** Add `focus-visible:ring-2` to all buttons, links, and interactive elements.

### [MEDIUM] PWA Install prompt uses hardcoded 5-second delay

- **Category:** UX
- **Location:** `src/components/PWAInstall.tsx:35`
- **Fix:** Use engagement-based triggers (scroll depth, story views).

### [MEDIUM] useStorySections incorrectly marked as `'use client'` (pure function)

- **Category:** Architecture
- **Location:** `src/hooks/useStorySections.ts:1`
- **Fix:** Remove `'use client'`. Rename to pure utility function in `src/lib/`.

### [MEDIUM] Null age and previousReligion display as 'null' in UI

- **Category:** Content
- **Location:** `src/components/ProfileHeader.tsx:24-27`
- **Fix:** Add null/undefined checks before rendering age and previousReligion.

---

## 5. Low Priority Findings

### [LOW] TypeScript target ES2017 outdated for Node 18+
- **Location:** `tsconfig.json:3`
- **Fix:** Change to `ES2022`.

### [LOW] Tailwind v4 with legacy v3 config via `@config` directive
- **Fix:** Migrate theme to CSS `@theme` directives, remove `tailwind.config.ts`.

### [LOW] `opencode-ai` listed as runtime dependency
- **Location:** `package.json:22`
- **Fix:** Move to `devDependencies`.

### [LOW] Hardcoded timezone `Asia/Aden` in i18n config
- **Location:** `src/i18n/request.ts:19`
- **Fix:** Use user locale-based timezone detection or document the choice.

### [LOW] Service worker cache name hardcoded (never incremented)
- **Location:** `public/sw.js:2`
- **Fix:** Derive cache name from build hash or package version.

### [LOW] Error message leaks filesystem info
- **Location:** `src/lib/story-service.ts:28-37`
- **Fix:** Use generic error messages, remove story slug enumeration from errors.

### [LOW] No resource hints for critical assets
- **Location:** `src/app/layout.tsx`
- **Fix:** Add preconnect/preload for fonts and critical CSS.

### [LOW] StoryCard excerpt uses naive regex HTML stripping
- **Location:** `src/components/StoryCard.tsx:29`
- **Fix:** Use proper HTML-to-text conversion.

---

## 6. Performance Deep Dive

The performance profile of New Muslim Stories has one dominant issue and several secondary problems:

### Primary Issue: Full Client-Side Rendering Architecture

The entire component tree (21 files) is marked `'use client'`. This means:

- **No React Server Components (RSC) streaming benefit.** Every page sends a complete JavaScript bundle that must download, parse, and execute before the page becomes interactive.
- **No server component rendering for static content.** The homepage hero section, header, footer, story cards, "what's next" section, and "who are new Muslims" section all render client-side, even though they have zero interactive state.
- **the `useHasMounted` pattern** compounds this by returning `null` during SSR for HeroSection and Header, causing double renders and visible content pop-in.

**Impact:** This is the single largest performance regression. Fixing it would reduce client JS by an estimated 70-80%.

### Secondary Issues

1. **No code splitting.** `next/dynamic` is unused. Components like `PWAInstall` and `ServiceWorkerRegistration` that are only needed after user interaction or in specific browsers are loaded unconditionally in the initial bundle.

2. **No font optimization.** Fonts are loaded via CSS `@import` instead of `next/font`, meaning full font files (no subsetting), no automatic preload, and render-blocking behavior.

3. **No image priority on homepage.** The first visible story profile photos (LCP candidates) lack the `priority` prop, so `next/image` lazy-loads them by default.

4. **Zero dynamic imports anywhere.** The entire JS payload ships as a single chunk per route.

### What's Done Well

- All 58 profile photos are WebP format (good modern format choice)
- `next/image` is used via `StoryImage` wrapper (proper image optimization pipeline available)
- `StoryContentDisplay` correctly uses `priority` on the story page hero image

### Bundle Size Estimates

Without a production build, exact bundle sizes cannot be measured. Based on code analysis:
- Current estimated client JS: ~150-250KB (all components bundled client-side)
- Potential after RSC migration: ~40-80KB (only interactive islands)

---

## 7. Architecture Review

### Strengths

- **Clean directory structure** follows Next.js App Router conventions with clear separation of concerns: `src/app/`, `src/components/`, `src/lib/`, `src/hooks/`, `src/types/`, `src/i18n/`.
- **Content model** is well-designed: Markdown files with YAML frontmatter, locale-paired naming convention (`story.md` / `story-ar.md`).
- **i18n setup** uses next-intl v4 correctly (routing config, request config, server/client component API).
- **TypeScript strict mode** is enabled with path aliases (`@/`).
- **Image pipeline** converts to WebP with sensible sizing.

### Critical Architectural Issues

1. **Middleware naming (`proxy.ts` vs `middleware.ts`)** — Next.js convention violation that breaks all i18n routing. This is the single most impactful bug in the application.

2. **Missing static generation configuration** — `generateStaticParams` not present in locale layout. `setRequestLocale` called but Next.js cannot pre-render locale variants without it.

3. **Fragile content parsing** — Regex-based HTML section splitting, no frontmatter schema validation, no sanitization pipeline. 2 of 138 story files are malformed.

4. **Cascading client boundary** — The entire component tree is client-rendered because `'use client'` directives propagate upward. A single client component in a wrapping layout forces all children into client bundles.

5. **Unused dependencies** — `framer-motion` and `react-scroll-parallax` are installed but never imported, adding complexity and install weight.

### Data Flow

```
Stories (Markdown + YAML frontmatter)
  → gray-matter parses frontmatter
  → remark-html converts body to HTML
  → StoryData object returned with typed interface (as-cast, no runtime validation)
  → getSortedStoriesData() / getStoryData() filter by locale
  → Server component calls these, passes to client component
  → Client component splits HTML by heading regex
  → dangerouslySetInnerHTML renders each section
```

The data flow is functional but has fragile points at (1) frontmatter validation, (2) HTML splitting, and (3) sanitization.

---

## 8. Quick Wins

These items can be fixed in under 30 minutes each and have meaningful impact:

| Fix | Time | Impact | Location |
|-----|------|--------|----------|
| Rename `proxy.ts` → `middleware.ts` | 1 min | Restores i18n routing | `src/proxy.ts` |
| Remove `useHasMounted` from HeroSection | 5 min | Fixes LCP + CLS | `HeroSection.tsx:20` |
| Remove `useHasMounted` from Header | 5 min | Fixes double render | `Header.tsx:8-10` |
| Add `generateStaticParams` to locale layout | 5 min | Enables static generation | `[locale]/layout.tsx` |
| Remove framer-motion, react-scroll-parallax | 5 min | Cleaner deps, smaller install | `package.json` |
| Move opencode-ai to devDependencies | 1 min | Cleaner deps | `package.json` |
| Remove dead CSS (section-animate) | 5 min | Smaller CSS | `globals.css:54-63` |
| Fix `handleLocaleSwitch` fragile string replace | 10 min | Robust locale switching | `LanguageSwitcher.tsx` |
| Replace flag emojis with text labels | 10 min | Better accessibility | `LanguageSwitcher.tsx:17-18` |
| Add missing `language` field to joram-van-klaveren | 3 min | Fixes 2 invisible stories | `stories/` |

---

## 9. Refactor Roadmap

### Week 1: Infrastructure & SEO (foundation)

| Day | Work | Effort |
|-----|------|--------|
| 1 | Fix middleware naming. Verify i18n routing works end-to-end. | 2h |
| 1 | Add `generateStaticParams` to locale layout. Verify SSG output. | 1h |
| 1-2 | Implement `generateMetadata` for homepage and story pages. | 4h |
| 2 | Add dynamic sitemap (`app/sitemap.ts`) and `public/robots.txt`. | 2h |
| 2 | Extend metadata with Open Graph, Twitter Cards, hreflang, canonical. | 3h |
| 3 | Add `loading.tsx`, `error.tsx`, `not-found.tsx` for all route segments. | 3h |
| 3 | Fix story page error handling — use `notFound()` instead of throw. | 1h |
| 3-4 | Clean up quick wins from Section 8 (dead deps, CSS, hooks). | 2h |

### Week 2: Component Architecture & Performance

| Day | Work | Effort |
|-----|------|--------|
| 1-2 | Convert server-component candidates: Section, Icon, Button, Footer, Header, WhoAreNewMuslims, WhatsNext, StoryCard, StoryOfTheDay, ProfileHeader, StoryImage. | 8h |
| 2 | Extract FeaturedStories country filter into isolated client island. | 3h |
| 2-3 | Remove `'use client'` from `useStorySections`, move to `src/lib/`. | 1h |
| 3 | Add `next/dynamic` for PWAInstall, ServiceWorkerRegistration. | 1h |
| 3 | Add image `priority` to above-fold story cards. | 1h |
| 4 | Migrate fonts to `next/font`. Verify preload and subsetting. | 2h |
| 4 | Add focus styles, skip-to-content link, fix heading hierarchy. | 3h |

### Week 3: Content Safety, RTL, PWA & Polish

| Day | Work | Effort |
|-----|------|--------|
| 1 | Add frontmatter validation (Zod schema) in story-parser. | 4h |
| 1 | Add `rehype-sanitize` to remark pipeline. | 1h |
| 1 | Fix section splitting — enforce consistent heading structure or use DOM parsing. | 3h |
| 2 | Fix offline page: add i18n, fix hardcoded `/en` link. | 2h |
| 2 | Fix RTL layout: dynamic `<html>` lang/dir, replace physical CSS with logical properties. | 3h |
| 2 | Fix null/undefined age and previousReligion display. | 1h |
| 3 | Fix PWA manifest: locale-aware start_url, generate screenshot files. | 2h |
| 3 | Fix service worker: add build-time precaching for `_next/static/*`. | 3h |
| 3-4 | Final build, lint, and type check pass. | 2h |
| 4 | Verve — final audit verification, tracker updates. | 2h |

**Total estimated effort: ~60-70 hours (2-3 weeks for one developer)**

---

## 10. Final Verdict

**Production readiness score: 2/10**

New Muslim Stories has a well-organized codebase with a strong content model and thoughtful localization structure, but is **not ready for production deployment** due to three blocking issues:

1. **i18n routing completely non-functional** (proxy.ts naming) — the application's core bilingual value proposition does not work.
2. **Zero SEO infrastructure** — 138 unique stories have no search discoverability.
3. **100% client-side component architecture** — the app delivers maximum possible JavaScript to every visitor.

Approximately 2-3 weeks of focused engineering work (detailed in the Refactor Roadmap above) is required to bring this to a production-ready state. The most critical fixes (middleware rename, SEO metadata, quick wins) can be done in 2-3 days and would raise the readiness score to approximately 5/10.

**Blocking deployment:** The middleware naming issue means the root URL does not serve locale-specific content. Deploying as-is would serve a non-functional or blank page to users visiting the root URL.

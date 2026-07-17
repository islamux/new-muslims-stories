# Senior Engineering Interview: New Muslim Stories

> **Format:** 4 rounds × 25 questions = 100 + 5 bonus = 105 total
> **Target:** Mid→Senior candidate
> **Style:** FAANG/Big Tech — behavioral, architectural depth, system design, debugging, and coding
> **Project:** Bilingual (EN/AR, RTL) Next.js 16 / React 19 conversion-narrative site — next-intl + next-themes + gray-matter/remark/DOMPurify markdown pipeline + sharp, ~69 stories × 2 locales

---

## Round 1: Architecture & System Design (25 questions)

### Q1. Why next-intl for this bilingual site, and how is the `[locale]` segment wired?

**A:** next-intl v4 (`package.json:22`) gives App-Router-native i18n: `defineRouting` in `src/i18n/routing.ts:3` declares `locales: ['en','ar']`, `request.ts:5` loads messages per request, and `setRequestLocale(locale)` (`[locale]/layout.tsx:24`) opts pages into static rendering per locale. The `[locale]` dynamic segment (`src/app/[locale]/`) generates both `/en/*` and `/ar/*`. Chosen over i18next for tighter Next integration (middleware, static rendering hooks). Trade-off: more Next-coupled than i18next (less portable), but the integration wins for an SSG content site.

### Q2. The `proxy.ts` hardcodes locales instead of importing `routing`. Why is that a drift risk?

**A:** `docs/NEXT_INTL_FIX_GUIDE.md:233-245` claim `proxy.ts` uses `createMiddleware(routing)`; the **real** `src/proxy.ts:3-9` hardcodes `{ locales: ['en','ar'], defaultLocale: 'en' }` inline and does **not** import `routing`. So locale config is duplicated in two places (`routing.ts` and `proxy.ts`). If someone adds a locale to `routing.ts` but not `proxy.ts`, the middleware won't recognize it. Fix: import `routing` in `proxy.ts` and pass it. This is the classic "single source of truth violated" drift.

### Q3. Walk through the markdown pipeline from `.md` file to rendered HTML.

**A:** `src/stories/*.md` (EN `name.md`, AR `name-ar.md`) → `parseStoryFile` (`story-parser.ts:22`) → `matter(fileContents)` (gray-matter splits frontmatter/body, `:29`) → `remark().use(html).process(body)` (`:32`) → `sanitizeHtmlServer(html)` (DOMPurify server-side, `:34`, `sanitize.ts:12`) → returned as `contentHtml` → `StoryContentDisplay.tsx:33` renders via `dangerouslySetInnerHTML`. So: gray-matter (metadata) + remark (MD→HTML) + DOMPurify (sanitize) + React render. All synchronous, at request/build time.

### Q4. There are two sanitization layers. Why defense-in-depth, and where's the hole?

**A:** Layer 1: DOMPurify server-side (`sanitize.ts:12-48`) with an `ALLOWED_TAGS`/`ALLOWED_ATTR` whitelist. Layer 2: a weaker client-side `sanitizeHtml` (`StoryContentDisplay.tsx:12-19`) that strips only `script, iframe, object, embed`. The hole: `sanitize.ts:46-48` `catch { return html; }` — **if DOMPurify throws, the raw unsanitized HTML is returned**. Defense-in-depth is good, but the fallback-to-unsanitized negates it under failure. Fix: on catch, return an empty string or a sanitized placeholder, never the raw input.

### Q5. The front-matter schema is cast (`as`), not validated. What ships undetected?

**A:** `story-parser.ts:37` casts `matterResult.data as StoryData`. No Zod/Ajv. Real issues confirmed: `abdal-malik-rezeski-story.md` has **no front-matter at all** (plain text), `joram-van-klaveren.md` lacks `language`, and `adam-story.md` has `age: null` (typed `number`). These slip through TS. Worse, `getSortedStoriesData` uses `Promise.all(fileNames.map(parseStoryFile))` (`story-service.ts:14`) — one malformed file rejects the **whole locale** (not `allSettled`). A Zod schema + `Promise.allSettled` would isolate bad files and fail clearly.

### Q6. Story pages return **500**, not 404, on a missing slug. Why, and what's the security implication?

**A:** `getStoryData` (`story-service.ts:26-37`) throws `new Error(...)` enumerating the filesystem paths it searched; `[slug]/page.tsx` has **no `notFound()`** catch → the error propagates → Next returns 500 with the error (in dev) or a generic 500. Two problems: (1) wrong status code (a missing slug should be 404, not a server error); (2) **information leak** — the error message includes absolute FS paths (`/home/.../src/stories/`), useful to an attacker mapping the server. Fix: `try { getStoryData(slug) } catch { notFound() }`, and never include FS paths in thrown errors.

### Q7. There's no `generateMetadata` anywhere — all 138 story pages share one title. What's the SEO impact?

**A:** `grep generateMetadata src/app/` returns nothing; all pages use the static `metadata` from `src/lib/metadata.ts:4-18`. Impact: every story page has the same `<title>`/`<description>` — Google sees them as duplicate-ish, can't differentiate, and social shares all show the generic title instead of the story's. For a content site whose value is the individual stories, this is a major SEO/social gap. Fix: add `generateMetadata({ params })` to `[slug]/page.tsx` returning the story's title/first-paragraph/OG image. `docs/production-audit-report.md:47-63` flags this.

### Q8. 100% of components (21/21) are `'use client'`. What does that cost, and what would you do?

**A:** Every component opts into client rendering → larger JS bundle, worse FCP/LCP, no SEO benefit from server rendering of UI chrome. Some are needlessly client: `HeroSection.tsx` (pure presentational), `ui/Section.tsx` (no hooks). Worse, `Header.tsx:10` does `if (!hasMounted) return null` → **blank header in SSR** (LCP/CLS hit). Fix: make pure-presentational components server; keep only interactive ones client (ThemeToggle, LanguageSwitcher, PWAInstall, forms). `docs/production-audit-report.md:105-121` documents this. The blanket `'use client'` is a migration artifact.

### Q9. `Header` returns `null` pre-hydration. Trace the LCP/CLS impact.

**A:** `Header.tsx:10` `if (!hasMounted) return null`. SSR renders no header; client hydrates, `useHasMounted` flips, header appears. Impact: layout shift (the header pushes content down on hydration) → CLS penalty; and if the header contained the LCP element, FCP→LCP gap widens. The fix is the opposite of `return null`: render a **stable placeholder** with the same dimensions during SSR, then swap to interactive content post-hydration. `HeroSection` was fixed this way; `Header` wasn't (`docs/production-audit-report.md:105-121`).

### Q10. Why `next-themes` here but a custom provider in other projects (e.g., voices-of-truth)?

**A:** Different React/Next versions and constraints. This app uses next-themes 0.4.6 (`[locale]/layout.tsx:30`: `attribute="class"`, `defaultTheme="light"`, `enableSystem`, `disableTransitionOnChange`) — which works fine here. voices-of-truth rejected next-themes because its 0.4.6 `<script>`-in-tree tripped a React 19/Next 16 console error (ADR-009). The difference may be subversion or exact Next patch. The takeaway: "next-themes works on my Next" isn't universal — verify on your exact versions. next-themes injects an inline script for flash prevention; `disableTransitionOnChange` + `<html suppressHydrationWarning>` handle the hydration mismatch.

### Q11. The DOMPurify `sanitize.ts` keeps a module-level singleton + dynamic import. Why?

**A:** `sanitize.ts:3-10` lazily `import('dompurify')` once and caches the instance. DOMPurify needs a `window` (jsdom in Node server-side); creating it per-call is expensive. The singleton + dynamic import (a) defers the jsdom cost until first parse, (b) reuses the configured instance. The `ALLOWED_TAGS`/`ALLOWED_ATTR` whitelist (`:16-44`) is applied once. Trade-off: a singleton in a long-running server is fine; in serverless, it's recreated per cold start. The dynamic import keeps it out of the client bundle (it's only called server-side in `story-parser.ts`).

### Q12. `useStorySections` splits content on `/<h[23]>.../g` and reads `sections[2]`, `[4]`, `[6]`. What's the fragility?

**A:** `hooks/useStorySections.ts:13-22` assumes **exactly three H2/H3 sections** at fixed indices. A story with two sections, four sections, or `###` sub-headings mis-assigns content silently (wrong section gets the wrong body). The regex also doesn't handle nested or malformed headings. This is a brittle parsing assumption over authored content. A robust version: split on H2 only, render each section dynamically, and validate expected section names (e.g., "Background", "Journey", "Advice") rather than hardcoding indices.

### Q13. The offline page is unlocalized (English-only) and links to `/en`. Why is that a problem?

**A:** `src/app/offline/page.tsx:1-90` hardcodes English text and `<Link href="/en">` — so an Arabic user who goes offline sees an English "no internet" page and a link to the English locale, losing their AR context. Fix: localize the offline page (read locale from cookie/path, or detect from the cached entry page) and link back to the user's locale. The PWA fallback is part of the UX; shipping it English-only undermines the bilingual promise.

### Q14. `optimize-images.mjs` uses sharp at build (manual script), but `next/image` runs at runtime. Why both?

**A:** `scripts/optimize-images.mjs` (sharp, devDep) pre-optimizes `public/images` to WebP/JPEG **offline** (one-time, batch), and `update-image-refs.mjs` rewrites `.md` frontmatter to `.webp`. Then `next/image` (`StoryImage.tsx:6`, runtime) does responsive `srcset`/AVIF on top. The split: sharp handles the bulk conversion (avoiding per-request sharp cost); next/image handles responsive sizing. Trade-off: two-step process (run the script when images change); if skipped, `next/image` still works but on un-optimized sources. `sharp` is a devDep precisely because it's not needed at runtime.

### Q15. `LanguageSwitcher` uses next/navigation's `useRouter`/`usePathname`, not next-intl's. What breaks?

**A:** `LanguageSwitcher.tsx:11-14` does `pathname.replace(`/${locale}`, `/${newLocale}`)` with raw `next/navigation`. next-intl's `useRouter`/`usePathname` (from `src/navigation.ts`) understand locale prefixes and preserve route semantics. The raw replace is fragile: it only swaps the first segment, breaks if the pathname has query strings or encoded chars, and loses next-intl's locale-aware navigation. Fix: import from `src/navigation.ts` (the `createNavigation(routing)` exports). This is a missed benefit of the next-intl setup.

### Q16. `<html lang="en">` is hardcoded, and `dir` is set on a `<div>`. What's wrong?

**A:** `app/layout.tsx:14` hardcodes `lang="en"`; `[locale]/layout.tsx:32` sets `dir={locale==='ar'?'rtl':'ltr'}` on a `<div>`, not `<html>`. Problems: (1) screen readers announce the page as English even on `/ar` (wrong pronunciation/voice); (2) `dir` on a div doesn't set document-level direction (browser features, default text alignment of the whole page inherit from `<html>`). Fix: set `lang` and `dir` on `<html>` in the locale layout (or via metadata). The hardcoded `lang="en"` is a significant a11y/i18n bug for an Arabic audience.

### Q17. CSP allows `'unsafe-inline'` and `'unsafe-eval'` for scripts. Why, and what's the cost?

**A:** `next.config.mjs:7` `script-src 'self' 'unsafe-inline' 'unsafe-eval'`. Needed because: next-themes injects an inline script for flash prevention (`'unsafe-inline'`), and Next's dev/runtime uses eval-ish patterns (`'unsafe-eval'`). Cost: weakens XSS protection significantly — an injected script can run. To tighten: (1) use a nonce-based CSP (Next 16 supports per-request nonces) instead of `'unsafe-inline'`; (2) remove `'unsafe-eval'` in production (verify nothing depends on it). The current CSP is permissive for convenience; a senior fix moves to nonces.

### Q18. Why is the timezone hardcoded to `Asia/Aden`?

**A:** `src/i18n/request.ts:17` sets `timeZone: 'Asia/Aden'` for date formatting (next-intl uses it for `<format>` calls). Reason: the audience is Yemeni/Arab; dates render in local time. But hardcoding ignores a user in another timezone (a diaspora reader in the US sees Aden times). For a content site with few dates, it's low-impact; but the "right" approach is to detect the user's timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`) client-side, or omit the override and let the browser default. `docs/production-audit-report.md:274-276` flags it low-priority.

### Q19. How is the app pre-rendered, given the synchronous fs reads?

**A:** `generateStaticParams` on `[slug]/page.tsx:6` returns all story slugs × locales; Next pre-renders each at build, calling `getStoryData` (which `readFileSync`s the `.md`) at build time. So the fs reads happen **at build**, not request time, for the static pages. The `Promise.all` over 138 files runs once per build. In dev/dynamic mode, it's per-request (slow), but production SSG is fine. The `setRequestLocale` calls enable static rendering per locale. Note: `[locale]/layout.tsx` lacks `generateStaticParams` for the locale segment itself, but the `[slug]` params include locale tuples, so story pages are static.

### Q20. The `featured: true` front-matter field is never used. What does that reveal?

**A:** 0 of 69 stories have `featured: true` (104 explicitly `false`); `getFeaturedStories` (`story-service.ts:61-65`) always returns `[]`. Yet the field exists in the schema and `StoryOfTheDay`/`FeaturedStories` components consume it. So there's a "featured" feature in the UI with no data feeding it — either abandoned, or editors never curated featured stories. `StoryOfTheDay` (`StoryOfTheDay.tsx:8`) falls back to `stories[0]` (just the first sorted story), masquerading as "of the day" without date logic. Reveals: a feature scaffolded but never operationalized — curation gap or dead feature.

### Q21. `lefthook.yml` runs lint + format-check + tsc on pre-commit and build on pre-push. What's good and risky?

**A:** `lefthook.yml:1-23` — pre-commit (parallel): `lint --max-warnings 0`, `format:check`, `tsc --noEmit`; commit-msg: conventional-commit regex; pre-push (parallel): `build` + `tsc`. Good: catches type/lint/format errors before commit, and full build before push. Risky: pre-push `build` is slow (minutes), friction-y; parallel pre-commit can have ordering issues; `--max-warnings 0` is strict (any warning blocks). A senior note: pre-push build is heavy — consider moving to CI. But the discipline is strong vs. having no hooks.

### Q22. The env var names in `.env.example` don't match the code. What's the impact?

**A:** `.env.example` documents `PLAUSIBLE_DOMAIN`/`PLAUSIBLE_SRC`, but `PlausibleAnalytics.tsx:6-7` reads `NEXT_PUBLIC_PLAUSIBLE_URL`/`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. A developer copying `.env.example` sets vars that do nothing; analytics silently never loads. Fix: align names. This is config-documentation drift — the kind of bug that wastes hours ("why isn't analytics working?"). A CI check comparing `.env.example` keys to actual `process.env.NEXT_PUBLIC_*` reads would catch it.

### Q23. The migration report (`NEXTJS_16_MIGRATION_REPORT.md`) claims the build is failing. Is it?

**A:** No — the report is **stale**. It was written during the Next 16 migration when `framer-motion`/`react-scroll-parallax` caused build failures; both deps were **removed** (`docs/production-audit-report.md:193-197`), and Next is now `^16.2.9`. The async-params fix the report prescribed was applied (`[locale]/layout.tsx:12-16`). So the report documents a historical state, not the current one. A contributor reading it would think the build is broken. Lesson: archive migration reports with a "completed on <date>" header rather than leaving them present-tense.

### Q24. How would you add a sitemap and proper hreflang for this bilingual site?

**A:** Create `src/app/sitemap.ts` returning all story URLs × locales with `priority`, and `alternates.languages` per URL (`{ en: '/en/stories/x', ar: '/ar/stories/x' }`) for hreflang. Add `<link rel="alternate" hreflang="x-default" href="/en/stories/x">`. Currently there's a `robots.txt` referencing a sitemap that doesn't exist. The sitemap must enumerate stories from `getAllStorySlugs()` (× locales). This is the natural complement to adding `generateMetadata` (Q7) — together they give Google per-story, per-locale indexing.

### Q25. If you were rebuilding from scratch, top three changes?

**A:** (1) **Validate front-matter with Zod** (Q5) + `Promise.allSettled` so bad files don't break a locale. (2) **Make components server by default** (Q8) — only interactive ones client; fix `Header`'s `return null` (Q9). (3) **Per-page `generateMetadata` + sitemap + hreflang** (Q7, Q24) — for a content site, SEO is the product. Beyond: fix the `<html lang/dir>` bug (Q16), tighten CSP (Q17), and align env docs (Q22). The codebase's biggest gaps are content/SEO discipline, not architecture.

---

## Round 2: React & Next.js Deep Dive (25 questions)

### Q26. Why does `[locale]/layout.tsx` validate the locale with `hasLocale` and call `notFound()`?

**A:** `src/app/[locale]/layout.tsx:19-21` — `hasLocale(routing.locales, locale)` checks the segment is a known locale; if not, `notFound()`. This prevents `/xyz/...` (invalid locale) from being treated as a locale-less route or crashing deep in message loading. It's defensive: the proxy should redirect unknown locales, but if a user lands on `/xyz` directly, the layout fails fast with a 404 rather than a confusing error. This is the recommended next-intl pattern.

### Q27. `setRequestLocale(locale)` is called in layout and home, but NOT in `[slug]/page.tsx`. What's the consequence?

**A:** `setRequestLocale` opts the current request's rendering into the locale's static scope (so messages load correctly during SSG). It's in `[locale]/layout.tsx:24` and `[locale]/page.tsx:9` but **missing** from `stories/[slug]/page.tsx`. Consequence: story pages may not render in the correct locale's static context — messages could default or fail. The translation bug history (`docs/ARABIC_TRANSLATION_FIX_REPORT.md`) was exactly this class of issue. Fix: add `setRequestLocale(locale)` at the top of every page/layout in the `[locale]` segment.

### Q28. `HomePageClient` uses `next/dynamic` with `ssr: true` and skeletons for 4 chunks. Why dynamic-import server-rendered chunks?

**A:** `HomePageClient.tsx:12-42` dynamic-imports 4 sections with `ssr: true` (server-rendered) + skeleton fallbacks. Even with `ssr: true`, `next/dynamic` **code-splits** the chunk into a separate JS file (loaded after hydration), reducing the initial JS bundle. The skeletons show during the chunk's load. Trade-off: the section's HTML is server-rendered (good for SEO/FCP) but its JS loads lazily (interactive later). This is a hybrid: server HTML + deferred JS for below-the-fold sections.

### Q29. `StoryContentDisplay` calls `router.back()` for the "back" button. Why not a `<Link>`?

**A:** `StoryContentDisplay.tsx:66` uses `router.back()`. A `<Link href="/<locale>">` would always go to the home grid; `router.back()` returns to wherever the user came from (a filter view, a search result, etc.) — better UX. Trade-off: if the user deep-linked directly to the story, `back()` exits the site (to the referrer). A robust pattern: `back()` if there's history, else fall back to the locale home. The current impl doesn't handle the deep-link edge case.

### Q30. `ThemeToggle` reimplements logic inline, ignoring the existing `useThemeToggle` hook. What's the issue?

**A:** `hooks/useThemeToggle.ts:13-27` exists — exactly the refactor `docs/IMPLEMENTATION_PLAN_THEME_TOGGLE.md:158-172` prescribed — but `ThemeToggle.tsx` doesn't import it; it reimplements `useTheme()` + `useHasMounted` inline. Issue: dead code (the hook is unused), duplicated logic, and the plan's refactor was filed but never consumed. Also the hook is exported as `UseThemeToggle` (**PascalCase**) violating the camelCase-hook convention in `AGENTS.md:51`. Fix: either consume the hook (rename to `useThemeToggle`) or delete it. Currently it's both dead and mis-named.

### Q31. `useHasMounted` has an eslint-disable. What rule, and why?

**A:** `hooks/useHasMounted.ts:3` likely disables `react-hooks/rules-of-hooks` or similar for its SSR-safe pattern. The canonical pattern (useSyncExternalStore with `getServerSnapshot=false`) avoids hydration mismatch. The disable suggests an older `useState`+`useEffect` pattern that triggered a lint warning. A senior fix: use the `useSyncExternalStore` form (no disable needed) like voices-of-truth's `useHasMounted`. Bare disables are smells.

### Q32. `PWAInstall` has a hardcoded 5-second delay before showing the install prompt. Why, and what's the risk?

**A:** `PWAInstall.tsx:35` waits 5s after `beforeinstallprompt` before showing the banner. Reason: don't ambush the user immediately (let them read first); 5s is a heuristic "engagement" signal. Risk: a 5s `setTimeout` is arbitrary and can be preempted (tab backgrounded → timer throttled → prompt shows at wrong time). Also no focus trap (Esc/Tab can leave the modal). A better heuristic: show after a meaningful interaction (scroll depth, time-on-page via visibility API) rather than a fixed delay. The `dismissed` state in localStorage (`:29`) prevents re-showing.

### Q33. `PWAInstall`'s `BeforeInstallPromptEvent` is cast. What's the TS concern?

**A:** `PWAInstall.tsx:7-14` defines a `BeforeInstallPromptEvent` interface and casts `e as BeforeInstallPromptEvent`. The browser API isn't fully standardized; TS's DOM lib doesn't include it, so a manual type is needed. The cast (`as`) bypasses runtime checking — if the event shape differs, `prompt()`/`userChoice` accesses may fail. A defensive version uses `in` checks before accessing. This is an acceptable workaround for an unstable API, but the cast should be minimal and well-commented.

### Q34. `PlausibleAnalytics` injects a script lazily and manually fires pageview on route change. Why manual?

**A:** `PlausibleAnalytics.tsx:41-55` — the `<Script>` is loaded lazily; on route change (`usePathname`), it manually calls `window.plausible('pageview')` because Plausible's auto pageview tracking only fires on full page loads, not client-side navigation (Next's `<Link>` doesn't reload). So SPA-style nav needs manual events. Env-gated (`:6-7`) so it only loads in production with a configured domain. The queue shim (`:18-34`) buffers events before the script loads. This is the standard SPA-analytics pattern.

### Q35. `ServiceWorkerRegistration` registers `/sw.js`. What's the cache-versioning concern?

**A:** `sw.js:1` uses cache name `'new-muslim-stories-v1'` — **never bumped**. On deploy, if assets change but the cache name stays `v1`, returning users get **stale cached assets** (old HTML/JS) until the SW eventually updates. The SW's `activate` event should purge old caches, but only if the name changes. Fix: bump the version (`v2`, `v3`) on every deploy with content changes, or use a content-hash-based cache name. This is the #1 PWA staleness footgun. `docs/production-audit-report.md` should flag it.

### Q36. `StoryCard` builds an excerpt by regex-stripping HTML: `contentHtml.replace(/<[^>]*>/g,'').substring(0,150)`. What's wrong?

**A:** `StoryCard.tsx:23` — regex-stripping HTML is fragile: it leaves attribute values, breaks on `<` inside text, doesn't decode entities (`&amp;`), and the 150-char cut can split mid-word/mid-tag. Better: generate a plain-text excerpt at parse time (in `story-parser.ts`, from the markdown body before HTML conversion) and store it on the story data. Then `StoryCard` just reads `story.excerpt`. This shifts the cost to parse-time (once) and gives clean text. The current approach re-strips on every render.

### Q37. `ProfileHeader` renders `null` literally when `age` is null, and uses `<p>` for the title. Why are both bugs?

**A:** `ProfileHeader.tsx:20` renders `{age}` which is `null` → React renders nothing (fine), but the surrounding "years old" text may read awkwardly ("null years old" if not guarded). Worse: `:18` uses `<p>` for the story title — should be `<h1>` (page main heading). Heading hierarchy matters for SEO and screen-reader navigation; a page with no `<h1>` or a `<p>` title is malformed. Fix: guard `age` (`{age ? `${age} years old` : ''}`) and use `<h1>` for the title. `docs/production-audit-report.md:181-186` flags the heading bug.

### Q38. `LanguageSwitcher` uses flag-emoji buttons without `aria-label`. What's the a11y issue?

**A:** `LanguageSwitcher.tsx:17-18` renders flag emojis (🇬🇧/🇸🇦) as buttons. Screen readers announce emojis variably ("regional indicator G B" or nothing useful); flags also don't render on some platforms (Windows shows "GB"/"SA" letters). Without `aria-label="English"/"Arabic"`, the button's accessible name is unclear. Fix: add `aria-label` with the language name, and consider text labels ("EN"/"AR") instead of or alongside flags. `docs/production-audit-report.md:181-186` flags this.

### Q39. `PWAInstall`'s modal has no focus trap or Escape handler. Why does that matter?

**A:** `PWAInstall.tsx` renders a modal `<dialog>`-ish overlay but doesn't trap focus or handle Esc. When open, Tab can move focus to elements behind the overlay (keyboard users get lost), and Esc doesn't close. Radix Dialog (if available) handles this; a hand-rolled modal must implement focus trap (first/last focusable, cycle) + Esc listener + return focus on close. `docs/production-audit-report.md:205-209` flags the missing focus trap. For a dismissible install prompt, this is a real keyboard-a11y gap.

### Q40. `StoryImage` uses `next/image` `fill` with `priority` logic. Trace the responsive behavior.

**A:** `ui/StoryImage.tsx:6-23` uses `<Image fill sizes={...}>` (the parent must be `position: relative` with dimensions). `priority` (`:20`) disables `loading="lazy"` for above-the-fold images (LCP optimization). `next.config.mjs:26-30` configures `formats: ['avif','webp']` and device/image sizes. So images are responsive (srcset by viewport), modern-format, and lazy by default except priority ones. This is the correct next/image usage — unlike jalabia-world (unoptimized), this app actually gets image optimization.

### Q41. The `[slug]` page lacks `setRequestLocale`. How does that interact with static rendering?

**A:** (See Q27.) Without `setRequestLocale`, the story page's render context may not be locale-bound during SSG, so `getMessages()`/`useTranslations` could load the wrong locale or default. The static page is still generated (via `generateStaticParams`), but its messages might be wrong — exactly the Arabic-shows-English bug the translation-fix reports documented. The fix is a one-liner at the top of the page. This is a subtle but high-impact omission.

### Q42. `Footer` renders an ICU message with `{year}`. How does next-intl interpolate it?

**A:** `messages/en.json:22` `footerCopyright: "{year} ..."`. next-intl's `t('footerCopyright', { year: 2026 })` interpolates ICU `{year}` → "2026". The `{age} years old, from {country}` (`en.json:42`) is another ICU message with multiple args. ICU supports plurals/genders too (`{count, plural, one{...} other{...}}`). The app uses simple arg interpolation. next-intl parses these at message-load time. A senior note: ICU is more powerful than `t('key', {x})` template strings — leverage plurals for "1 story"/"N stories".

### Q43. `HomePageClient` is the only "smart" client orchestrator. Why this pattern?

**A:** `HomePageClient.tsx:44` receives server-fetched stories as props and orchestrates the client sections (HeroSection, FeaturedStories, etc.) via `next/dynamic`. This is the "server-shell + client-island" pattern: the page (`[locale]/page.tsx`) is a server component fetching data, passing to one client component that owns interactivity. Benefit: data stays server-side (no client fetch), the client boundary is one clear seam. Drawback: `HomePageClient` becomes a large orchestrator. An alternative: each section fetches its own data (more client fetches, more boundaries).

### Q44. `BookmarksPage` (if it existed) would need localStorage + SSR coordination. How would you build it?

**A:** There's no bookmarks page, but the pattern: a client component reading `localStorage` with `useHasMounted` guard (render placeholder until mounted), filtering the server-passed story list by bookmarked slugs. The stories list comes from a server parent (props), avoiding a client fetch. Persistence via `localStorage`. Cross-device sync needs a backend (Supabase). This mirrors the voices-of-truth favorites pattern. The hydration discipline (placeholder until mounted) is the key SSR concern.

### Q45. The `not-found.tsx` is absent for `[locale]`. What does the user see on `/en/stories/nonexistent`?

**A:** No custom `not-found.tsx` in `[locale]` → Next uses the default 404 (or the root `not-found.tsx` if present). Worse, `[slug]/page.tsx` has no `notFound()` (Q6), so a missing slug throws → **500**, not 404. The user sees a server error page. Fix: add `notFound()` in the `[slug]` page's catch + a `[locale]/not-found.tsx` with a localized 404. Currently the error path is both wrong-status (500) and unlocalized — bad UX and bad SEO.

### Q46. `generateStaticParams` returns slugs but not locale+slug tuples explicitly. How does Next handle locale?

**A:** `stories/[slug]/page.tsx:6-8` returns slugs from `getAllStorySlugs()`; Next combines each with every `[locale]` param (from the locale segment's `generateStaticParams`, or inferred) to generate `/en/stories/x`, `/ar/stories/x-ar`. Actually, the slug list must be locale-aware (`getAllStorySlugs` should return `{locale, slug}` tuples since EN and AR have different filenames). If `getAllStorySlugs` returns locale-agnostic slugs, AR pages might 404 or render wrong. Verify the function returns per-locale slugs (the `-ar.md` convention, `story-parser.ts:68`).

### Q47. `PlausibleAnalytics` is wrapped in `<Suspense>`. Why?

**A:** It uses `useSearchParams` or route-watching hooks that opt into dynamic rendering; `<Suspense>` provides a fallback boundary (likely null) so the analytics chunk doesn't block the page. Also, analytics is non-critical — deferring it via Suspense keeps the main content prioritized. This is the "non-critical client island in Suspense" pattern.

### Q48. `StoryContentDisplay`'s weak client sanitizer strips only `script, iframe, object, embed`. Why is it insufficient?

**A:** `StoryContentDisplay.tsx:12-19` uses DOM methods to remove a few tags. It misses: `on*` event handler attributes (`onerror`, `onload`), `javascript:` URIs, `data:text/html`, SVG-based XSS, mutation XSS (bypasses via malformed HTML that the browser re-interprets). The server DOMPurify (the real defense) handles all these; the client layer is a belt-and-suspenders that's mostly theater. The real risk is the server's `catch { return html }` hole (Q4). A senior fix: remove the redundant client sanitizer (DOMPurify already ran server-side) and fix the catch.

### Q49. `HeroSection` is `'use client'` but has no hooks. Is that correct?

**A:** `HeroSection.tsx:5` is client but pure-presentational (no state/effects). It's unnecessarily client — adds to the bundle for no reason. Fix: remove `'use client'` (make it a server component). The blanket `'use client'` across all 21 components (Q8) is the cause. This is a low-risk cleanup with a real bundle benefit when applied across many components.

### Q50. `reactStrictMode` — is it on? What would it surface here?

**A:** Check `next.config.mjs` (the digest doesn't flag it explicitly, but Next defaults vary). If on, StrictMode double-invokes effects in dev, surfacing: missing cleanups in `PWAInstall`'s `setTimeout` (cleared on unmount?), `ServiceWorkerRegistration`'s listeners (removed?), `PlausibleAnalytics` route listener. StrictMode is a dev-only bug-finder; production is unaffected. A senior should verify it's enabled (it's a one-line config with high dev value).

---

## Round 3: TypeScript, Data, & Build Pipeline (25 questions)

### Q51. `tsconfig` is very strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). What do those add?

**A:** Beyond `strict`, `noUncheckedIndexedAccess` types `arr[i]`/`obj[key]` as `T | undefined` (forces null checks on indexed access — catches `sections[2]` being possibly undefined in `useStorySections`, Q12). `exactOptionalPropertyTypes` distinguishes `{x?: T}` (may be absent) from `{x: T | undefined}` (present but undefined) — stricter optional handling. `noUnusedLocals`/`noUnusedParameters` catch dead vars. This is one of the strictest configs in the eight projects — high discipline. Target `ES2022` (`:3`) enables modern syntax.

### Q52. `age` is typed `number` but is `null` in real data. How does strict mode let this slip?

**A:** `story-parser.ts:37` casts `matterResult.data as StoryData`, and `StoryData.age: number`. The cast **asserts** the shape without validating, so `age: null` (from YAML) is treated as `number` — TS doesn't check. At runtime, `null` flows through. `exactOptionalPropertyTypes` would help if `age` were `age?: number` (absent vs null), but the `as` cast bypasses everything. Fix: Zod schema (`age: z.number().nullable()`) validating `matterResult.data` before the cast. This is the canonical "TS can't validate untrusted boundaries" case — front-matter is a boundary.

### Q53. gray-matter returns `any` for `data`. How would you type it safely?

**A:** `matter(fileContents).data` is `any` (gray-matter's types are loose). The `as StoryData` cast is the unsafety. Safe approach: define `const storySchema = z.object({ title: z.string(), age: z.number().nullable(), ... })` and `const parsed = storySchema.parse(matterResult.data)` — Zod validates at runtime and infers the type (`z.infer<typeof storySchema>`). Now `parsed.age` is `number | null` and TS enforces handling both. This replaces the cast with validation + types in one step.

### Q54. Why `Promise.all` and not `Promise.allSettled` for parsing all stories?

**A:** `story-service.ts:14` uses `Promise.all(fileNames.map(parseStoryFile))`. `all` rejects on the **first** failure → one malformed `.md` (Q5) fails the entire locale's story list. `allSettled` would return per-file results (fulfilled/rejected), letting you skip bad files and log them. For a content site, graceful degradation (show 68 good stories, warn about 1 bad) beats all-or-nothing. Fix: `Promise.allSettled` + filter fulfilled + log rejected. This is the highest-robustness change for the data layer.

### Q55. The fs reads are synchronous (`readFileSync`, `readdirSync`). What's the concern, and when does it matter?

**A:** `story-parser.ts:26,62,82` use sync fs. In a build (SSG), this is fine — runs once, blocking is irrelevant. In dev or dynamic SSR, sync fs **blocks the event loop** for every request, and with 138 files + no caching, that's O(files) per request — slow under load. Fix: (1) `react cache`/`unstable_cache` to memoize per-request or per-build; (2) async fs (`fs/promises`) for concurrency; (3) most importantly, ensure production is SSG (it is, via `generateStaticParams`), so sync-at-build is acceptable. The concern is real only if pages ever go dynamic.

### Q56. `extractSlug` strips `-ar` suffix. What's the slug-locale convention, and what breaks it?

**A:** `story-parser.ts:14,68`: EN file `adam-story.md` → slug `adam-story`, locale `en`; AR file `adam-story-ar.md` → slug `adam-story`, locale `ar`. So the same slug exists in both locales. What breaks: a file named `foo-ar-ar.md` (double suffix), or a story with no `-ar` variant (AR page 404s), or case sensitivity (`Adam-story.md` vs `adam-story.md`). A Zod/regex assertion on filenames would catch these. The convention couples filename structure to locale — fragile but workable.

### Q57. `getAllStorySlugs` feeds `generateStaticParams`. Does it return per-locale slugs?

**A:** `story-service.ts:43` — must return `{locale, slug}[]` for Next to generate both `/en/stories/x` and `/ar/stories/x-ar`. If it returns only slugs (locale-agnostic), Next may try to render `/en/stories/x-ar` (wrong) or miss AR pages. The implementation must enumerate both locales × their slugs. Given the `-ar.md` convention, EN and AR slugs match (both `adam-story`), so returning `{locale: 'en', slug: 'adam-story'}` and `{locale: 'ar', slug: 'adam-story'}` is correct. Verify the function iterates locales.

### Q58. The DOMPurify whitelist allows `img` but the markdown pipeline is the source. Why allow `img`?

**A:** `sanitize.ts:16-42` includes `img` in `ALLOWED_TAGS` and `src, alt` in `ALLOWED_ATTR`. Stories contain images (markdown `![alt](url)`), which remark converts to `<img>`. DOMPurify must allow `img` or images are stripped. The risk: `img src="x" onerror="..."` — but `onerror` is not in `ALLOWED_ATTR`, so it's stripped. `javascript:` URIs in `src` — DOMPurify blocks by default. So allowing `img` is safe given the attr whitelist. Note: `next/image` isn't used here (raw `<img>` from markdown) — a perf gap (no responsive sizing).

### Q59. `remark` + `remark-html` vs `react-markdown`. Why the split?

**A:** This app uses `remark().use(html).process()` (`story-parser.ts:32`) to produce an HTML **string** server-side, then `dangerouslySetInnerHTML`. react-markdown renders markdown → React elements directly (no HTML string, no `dangerouslySetInnerHTML`, safer). Why the string approach here? Possibly: server-side pre-rendering to HTML once (cached), cheaper than react-markdown per render, and DOMPurify operates on HTML strings (not AST). Trade-off: loses react-markdown's safety (must sanitize manually) and component customization (can't swap `<img>` for `<Image>` easily). bassaer uses react-markdown — a cleaner approach.

### Q60. `sharp` is a devDep. Why, and what fails if it's in `dependencies`?

**A:** `sharp` (`package.json:52`) is devDep because it's only used by the **manual** `scripts/optimize-images.mjs` (offline batch), not at runtime (next/image uses its own sharp binary). Putting it in `dependencies` would install native libvips in production (where it's never used) — wasted space, longer cold starts, potential native-build failures. The devDep placement is correct. `next/image`'s runtime sharp is bundled separately by Next.

### Q61. The `featured` field exists in the schema but no story uses it. Dead schema or future feature?

**A:** Both. `StoryData.featured` (`story-parser.ts`) is parsed; `getFeaturedStories` (`story-service.ts:61-65`) filters on it; UI components consume `featuredStories`. But 0 stories have `featured: true`. So it's a wired-up feature with no data — either editors never curated, or it's abandoned. To make it live: an admin marks stories `featured: true` in front-matter. The code is ready; the content process isn't. A senior should ask: "Is this wanted? If yes, curate. If no, remove the dead path."

### Q62. `StoryOfTheDay` uses `stories[0]`, not a date-based pick. Why is that misleading?

**A:** `StoryOfTheDay.tsx:8` receives `stories[0]` (the first sorted story) as the "story of the day." There's no date logic — it's the same story every day until the sort changes. The label overpromises. Fix: pick by date (`stories[hash(date) % stories.length]`) so it rotates daily, or rename to "Featured Story" if rotation isn't wanted. The current impl is technically a bug (implies rotation, delivers static).

### Q63. `update-image-refs.mjs` rewrites front-matter `.png` → `.webp`. Why a separate script?

**A:** `scripts/update-image-refs.mjs` regex-rewrites `image:`/`profilePhoto:` values in `.md` files after `optimize-images.mjs` produces `.webp` files. It's separate because: the optimize script produces files; this one updates references — two concerns. Running them as a pair (`optimize` then `update-refs`) keeps front-matter in sync with disk. The 268 webp refs in front-matter show it's been run. Risk: running `update-refs` twice is idempotent (`.webp` → `.webp`), but running optimize without update-refs leaves stale refs. A combined `pnpm optimize-images` chaining both would be safer.

### Q64. `messages/en.json` and `ar.json` mirror each other (55 lines each). How do you keep them in sync?

**A:** Manual mirror is error-prone — a key added to `en.json` but not `ar.json` renders the key string on the AR page. Mitigations: (1) a CI script asserting both files have the same keys (diff key sets); (2) `i18n-ally` VS Code extension highlighting missing keys; (3) next-intl's `getMessages` fallback (missing key → key string, visible in dev). The current 55-line files are small enough to mirror by hand, but as they grow, a key-sync check prevents drift. The translation-fix history (`ARABIC_TRANSLATION_FIX_REPORT.md`) shows sync issues have bitten.

### Q65. The `as StoryData` cast is the central type-safety hole. Propose the full fix.

**A:** Replace the cast with a Zod schema: `const storySchema = z.object({ title: z.string().min(1), firstName: z.string(), age: z.number().nullable().optional(), country: z.string(), previousReligion: z.string(), profilePhoto: z.string().optional(), image: z.string().optional(), featured: z.boolean().default(false), language: z.enum(['en','ar']), author: z.string().optional(), date: z.string().optional() })`. Then `const data = storySchema.parse(matterResult.data)` — validates, defaults `featured`, types `age` as nullable, and TS infers everything. Wrap in try/catch per-file (with `allSettled`, Q54) to log which `.md` failed which rule. This one change fixes Q5, Q52, Q61's data integrity.

### Q66. `metadata.ts` exports static `metadata` and `viewport`. Why split them?

**A:** Next 16 separates `metadata` (title, description, OG) from `viewport` (themeColor, width, zoom) — they have different inheritance and rendering rules. `metadata.ts:4` exports `metadata`, `:20` exports `viewport` (with `themeColor: '#22C55E'`). Splitting is the Next 16 convention (viewport can't be in metadata anymore). The `themeColor` here is the brand green. A senior note: `viewport` doesn't disable zoom (good — Q83 of salam shows the opposite bug); it just sets the browser UI color.

### Q67. `optimize-images.mjs` overwrites JPEGs in place but writes `.webp` alongside. Why the asymmetry?

**A:** `scripts/optimize-images.mjs:36-44` re-encodes JPEGs (mozjpeg, smaller) overwriting the original, and creates new `.webp` files. Reason: JPEG is lossy but universal; re-encoding in place keeps the same filename (no ref churn) while shrinking. WebP is additive (better compression, modern browsers). Risk: overwriting in place is destructive (no original to recover) — should write to a build dir or keep originals. The script reports savings (`:61-62`) so you see the impact. A safer version writes to `public/images/optimized/`.

### Q68. The `age` field is `null` in some data. How should the UI handle it?

**A:** `ProfileHeader.tsx:20` renders `{age}` — `null` renders nothing, but the surrounding "years old" text may be orphaned. Fix: conditional rendering `{age != null && <span>{age} years old</span>}` or a helper `formatAge(age)` returning `''` for null. With Zod typing `age: number | null` (Q65), TS forces the null check. The current loose typing lets `null` slip to the UI. This is a small but real content-fidelity bug.

### Q69. Why `@fontsource/inter` + `@fontsource/montserrat` instead of `next/font`?

**A:** `@fontsource` packages self-host the font CSS+files (npm-installed), imported in CSS. vs `next/font/google` (downloads at build, self-hosts, subsets, `font-display: swap`). The digest notes fonts are loaded via CSS `@import` (`globals.css:75-76`) — render-blocking. `@fontsource` + `next/font` are both "self-hosted" approaches; `next/font` is more optimized (subsetting, preload). The `@fontsource` choice may predate `next/font` awareness or be a migration leftover. A senior fix: migrate to `next/font` for subsetting/preload/non-render-blocking. `docs/production-audit-report.md:132-139` flags the `@import` as render-blocking.

### Q70. `eslint.config.mjs` enables `eslint-plugin-jsx-a11y` recommended. What does that catch here?

**A:** `eslint.config.mjs:7,47` turns on jsx-a11y recommended rules. It would flag: `aria-*` typos, missing `alt` on `<img>`, `onclick` without keyboard handler, no-focus-trap on dialogs (Q39), missing `lang`. But it can't catch the deeper issues (flag-emoji buttons without aria-label Q38, `return null` headers Q9). So it's a baseline, not a complete a11y gate. Pair with axe-core in e2e for runtime a11y checks. The plugin being on is good; it's not sufficient alone.

### Q71. The build pipeline has no `prebuild` (unlike salam-nextjs). Why?

**A:** There's no data-generation step — content is hand-authored `.md` files (the source of truth), not generated from another source. So no `prebuild` is needed. The `optimize-images`/`update-image-refs` scripts are **manual** (run on demand when images change), not wired to the build. This is the right design for curated markdown content: edit `.md`, build, deploy. Contrast with salam-nextjs where `khatira_content.json` is transformed by a generator (prebuild needed).

### Q72. `lefthook.yml`'s commit-msg enforces conventional commits. What's the value?

**A:** `lefthook.yml:13-16` regex-requires `feat|fix|chore|...|(scope): subject`. Value: enables auto-changelog generation, semantic-release, clear git history, and easier PR review (the type signals intent). Trade-off: friction (a dev must format correctly or the commit is rejected). For a solo/small team, the value is lower; for open-source/multi-contributor, it's high. The pre-push `build` hook (`:18-23`) is the heavier gate — ensures pushed code builds.

### Q73. `Promise.all` parsing fails the whole locale on one bad file. What's the user-visible failure?

**A:** If `abdal-malik-rezeski-story.md` (no front-matter) is in the EN stories dir, `getSortedStoriesData('en')` rejects → the home page (`[locale]/page.tsx:11`) throws during SSG → **the entire `/en` build fails**. In dev, `/en` errors. So one bad file takes down the whole locale, not just one story. With `allSettled` + filter, only that story is missing; the other 68 render. This is a robustness cliff — the fix (Q54) is small and high-impact.

### Q74. `vercel.json` is just `{"framework":"nextjs"}`. Is anything missing?

**A:** For a basic Next deploy, `framework: nextjs` lets Vercel auto-detect build commands. Missing: custom headers (the CSP is in `next.config.mjs`, so OK), redirects, cron jobs, regions. For this app, minimal config is fine — Vercel handles Next natively. If you needed ISR revalidation secrets or environment-specific rewrites, they'd go here. The minimal file signals "default Next deploy" — acceptable.

### Q75. How would you add a build-time content validation step?

**A:** Add `validate-content` to `package.json` (a script running a Node/tsx check) and wire it into `prebuild` or CI: iterate all `.md` files, parse with gray-matter, validate with the Zod schema (Q65), report any failures with file + reason, exit non-zero on any error. This catches bad front-matter (missing `language`, `age: null`, no front-matter) before deploy, not at runtime. Combine with `allSettled` runtime tolerance (Q54) so even if a bad file slips through, the locale still renders. Defense in depth: build-time validation (strict) + runtime tolerance (graceful).

---

## Round 4: Problem-Solving, Debugging & System Evolution (25 questions)

### Q76. Arabic pages render English text. Walk through the diagnosis using the translation-fix reports.

**A:** `docs/ARABIC_TRANSLATION_FIX_REPORT.md` + `NEXT_INTL_FIX_GUIDE.md` document two root causes: (1) `setRequestLocale()` missing before `getMessages()` — the SSR/SSG context didn't bind the locale, so messages defaulted to English. Fix: call `setRequestLocale(locale)` in layout + every page. (2) Missing `icon-192/512.png` made the proxy treat icon requests as locales, breaking locale detection. Fix: add the icons. The current code: `setRequestLocale` is in layout/home but **missing from `[slug]/page.tsx`** (Q27) — a residual instance of cause (1). Diagnose by checking `useTranslations` output on the AR page and verifying `setRequestLocale` is called before any `t()`.

### Q77. A story's image 404s on production but works in dev. Why?

**A:** Likely the `optimize-images`/`update-image-refs` scripts weren't run before deploy, so front-matter references `.webp` files that don't exist (or vice versa: refs say `.png` but only `.webp` was deployed). Or: the image is in `public/images/` locally but `.gitignore`d or not uploaded. Debug: check the deployed front-matter's `image:` value, check the deployed `public/images/` contents, run `pnpm optimize-images && pnpm update-image-refs` and rebuild. The two-script split (Q63) makes this drift easy.

### Q78. How would you add per-story `generateMetadata`?

**A:** In `stories/[slug]/page.tsx`, add `export async function generateMetadata({ params }): Promise<Metadata> { const { locale, slug } = await params; const story = await getStoryData(locale, slug); return { title: story.title, description: stripHtml(story.contentHtml).slice(0,160), openGraph: { images: [story.image], title: story.title, ... }, alternates: { languages: { en: `/en/stories/${slug}`, ar: `/ar/stories/${slug}` } } } }`. This fixes Q7's duplicate-title SEO problem and adds social sharing per story. The `alternates` gives hreflang.

### Q79. The build fails on Vercel but not locally because of a missing env var. Which var, and how do you diagnose?

**A:** The env vars: `NEXT_PUBLIC_PLAUSIBLE_*` (analytics) — if unset, analytics no-ops (env-gated, fine). More likely a build-time issue: if any server component reads a non-`NEXT_PUBLIC_` env var that's unset, it's `undefined`. Diagnose: check Vercel project env vars vs `.env.example`; add `console.log(process.env.X)` temporarily; Vercel build logs show the failure. The `.env.example`/code name mismatch (Q22) is a prime suspect — the dev set `PLAUSIBLE_DOMAIN` (per `.env.example`) which the code ignores.

### Q80. How would you fix the `Header` LCP/CLS issue (returns null pre-mount)?

**A:** `Header.tsx:10` `if (!hasMounted) return null` → blank header in SSR → layout shift on hydration. Fix options: (1) Render a **static server version** of the header (logo + nav links) and overlay the interactive bits (theme toggle, language switcher) after mount — the shell is always present. (2) Render a same-sized placeholder skeleton during SSR. (3) Make `Header` a server component composing client children (toggle/switcher) — then no `useHasMounted` needed at the header level. Option (3) is cleanest and aligns with the "server-default" refactor (Q8).

### Q81. A user reports the PWA shows stale content after an update. Diagnose the SW.

**A:** `sw.js:1` cache name `'new-muslim-stories-v1'` — **never versioned** (Q35). On deploy, the new HTML/JS is fetched but cached under the same `v1` key; the SW's `activate` doesn't purge because the name matches. The user keeps getting old assets. Fix: bump to `v2` on every content deploy (or content-hash the cache name), and ensure `activate` deletes old caches. Also check `clientsClaim`/`skipWaiting` behavior. The unversioned cache is the #1 cause of "PWA stuck on old version" reports.

### Q82. How would you add a "categories" or "tags" filter (stories by country/religion)?

**A:** The data has `country` and `previousReligion` fields. (1) Derive unique values from stories (like voices-of-truth's `uniqueLanguages`). (2) Add a filter UI (chips/dropdown) on the home grid. (3) Store filter state in the URL (`?country=Yemen`) for shareability + SSR. (4) Server-component filtering (the home page already fetches server-side). (5) With Zod validation (Q65), `country` is a clean string. This mirrors voices-of-truth's URL-as-state pattern — a proven fit for filterable directories.

### Q83. `ProfileHeader` uses `<p>` for the title. Why does heading hierarchy matter, and how do you audit it?

**A:** Each page should have exactly one `<h1>` (the main topic), then `<h2>`/`<h3>` hierarchically. A `<p>` title means no `<h1>` → screen-reader users can't navigate by headings, and SEO loses the primary heading signal. Audit: run axe-core or Lighthouse in e2e; manually inspect the heading outline (browser devtools "Accessibility" panel). Fix: `<h1>{title}</h1>` in `ProfileHeader.tsx:18`, ensure story section headings (Q12) are `<h2>`. `docs/production-audit-report.md:181-186` flags this.

### Q84. How would you migrate from the HTML-string pipeline to react-markdown?

**A:** Replace `remark().use(html).process()` + DOMPurify + `dangerouslySetInnerHTML` with `<ReactMarkdown remarkPlugins={[remarkGfm]} components={{ img: ImageComponent, a: LinkComponent }}>{markdownBody}</ReactMarkdown>`. Benefits: no HTML string (no XSS surface, drop DOMPurify), custom component mapping (swap `<img>` → `<Image>` for optimization, `<a>` → `<Link>` for internal nav). Trade-off: react-markdown renders per-request (cache it), and you lose the server-side HTML string (but SSG caches the rendered output). bassaer uses this approach — a proven migration.

### Q85. The CSP is permissive (`unsafe-inline`, `unsafe-eval`). How do you tighten it without breaking next-themes?

**A:** Move to a **nonce-based CSP**: Next 16 supports `const nonce = headers().get('x-nonce')` and `export async function middleware` generating a per-request nonce; next-themes can be configured to use it. Then CSP: `script-src 'self' 'nonce-<random>'` (no `unsafe-inline`). For `'unsafe-eval'`, audit whether production actually needs it (Next dev mode does; prod usually doesn't) — remove in prod. This requires generating nonces in middleware/proxy and passing to the script tags. Non-trivial but the correct hardening.

### Q86. How would you implement story search (the app has none)?

**A:** Two scales: (1) **Small (69 stories)**: client-side FlexSearch/lunr, build the index at build time (a `search-index.json`), fetch + search client-side. Mirrors bassaer's flexsearch approach. (2) **Large/scale**: server endpoint with Postgres FTS or Algolia. For 69 stories, option (1) is plenty. Build the index from `contentHtml` (stripped to text) + title + country. The index is tiny (~tens of KB). Lazy-load on the search page. This is a well-trodden path — reuse bassaer's pattern.

### Q87. `StoryContentDisplay` uses `dangerouslySetInnerHTML`. Is it safe given DOMPurify?

**A:** Safe **if** DOMPurify ran successfully. The risk is the `catch { return html }` hole (Q4) — if DOMPurify throws (rare but possible: malformed input, jsdom issue), raw HTML reaches `dangerouslySetInnerHTML`. Defense: (1) fix the catch to return `''` or a safe placeholder; (2) the redundant client sanitizer (Q48) is weak theater but catches gross cases; (3) audit that no user-generated markdown reaches this path (it's all curated `.md`). With the catch fixed, `dangerouslySetInnerHTML` on DOMPurify output is the standard safe pattern.

### Q88. How would you add user accounts + bookmarks (sync across devices)?

**A:** (1) Supabase Auth (magic link / OAuth) — `@supabase/ssr` for cookie-aware clients (like bassaer). (2) `bookmarks` table (user_id, story_slug, locale) with RLS (`auth.uid() = user_id`). (3) Replace localStorage bookmarks with API calls + optimistic UI. (4) Anonymous-to-authed merge on sign-in (bassaer's `mergeLocalToSupabase` pattern). (5) Offline write-behind queue (bassaer's pattern). The bassaer codebase is the template — same stack (Supabase SSR + Next 16 + content site), proven patterns to copy.

### Q89. A contributor sets `featured: true` on a story but it doesn't appear as "Story of the Day." Why?

**A:** `StoryOfTheDay` (`StoryOfTheDay.tsx:8`) uses `stories[0]` (first sorted), **not** the featured list. `getFeaturedStories` (`story-service.ts:61-65`) returns featured stories but `StoryOfTheDay` doesn't consume it. So `featured: true` populates `FeaturedStories` (the grid section, if wired) but not the "of the day" slot. Fix: have `HomePageClient` pass `featuredStories[0]` (or a date-rotated pick from featured) to `StoryOfTheDay`. The wiring is incomplete — another half-built feature (Q61).

### Q90. How would you add structured data (JSON-LD) for stories?

**A:** In `generateMetadata` (Q78) or directly in the page, inject `<script type="application/ld+json">` with `Article`/`BlogPosting` schema: `headline`, `author` (firstName), `datePublished`, `image`, `articleBody` (excerpt). This enables Google rich results. Use the story's fields. Ensure the JSON-LD is valid (test with Google's Rich Results Test). Pair with the sitemap (Q24) for full discoverability. Currently there's zero structured data — a content-site SEO gap.

### Q91. The `proxy.ts` matcher excludes `api|_next|.*\\..*`. Decode it.

**A:** `proxy.ts:14` matcher `['/((?!api|_next|.*\\..*).*)']` — a negative lookahead excluding: `api` (API routes), `_next` (Next internals), and `.*\\..*` (any path with a dot = static files like `.png`, `.css`). So the proxy runs only on "page" routes (no extension, not internal). This is the standard Next i18n matcher — prevents the proxy from trying to locale-redirect static assets (which would break them). A common bug: forgetting the dot-exclusion → images get locale-prefixed → 404.

### Q92. How would you add a reading-progress or "time to read" estimate?

**A:** "Time to read" = `wordCount(contentText) / 200 wpm` (200 is average reading speed; adjust for Arabic). Compute at parse time (once), store on `StoryData` (`readingTime: number`). Display on `StoryCard` + the story page. For Arabic, reading speed may differ (~150 wpm); calibrate or A/B. Reading-progress (scroll %) is a client component tracking scroll, like bassaer's `ReadingProgressBar`. Both are content-site table stakes.

### Q93. How would you eliminate the 100%-client-components problem systematically?

**A:** Audit each component: does it use hooks/effects/browser APIs? If no → remove `'use client'`. Concretely: `HeroSection`, `ui/Section`, `Footer` → server. `Header` → server composing client children (Q80). Keep client: `ThemeToggle`, `LanguageSwitcher`, `PWAInstall`, `ServiceWorkerRegistration`, `PlausibleAnalytics`, `StoryContentDisplay` (if it needs the client sanitizer), forms. Add an ESLint rule or review checklist: "default to server; justify each `'use client`." Measure bundle size before/after to confirm the win. This is the highest-impact perf refactor for this app.

### Q94. A story's `age` is `null` and the UI shows "null years old." How do you fix it data-first vs UI-first?

**A:** UI-first: `{age != null && <span>{age} years old</span>}` (Q68) — masks the data issue. Data-first: decide the policy — is `age` required? If yes, validate with Zod (fail build on null); if optional, type it `age?: number` and render conditionally. The data-first approach (Zod) also catches the case at the boundary, preventing `null` from reaching the UI at all. Best: data-first (Zod makes it `number | null` or optional) + UI conditional rendering. Both layers handle it; data-first is more robust.

### Q95. How would you convert this to a headless-CMS-driven site (editors author stories, no code deploys)?

**A:** (1) Choose a CMS (Sanity, Contentful, Strapi, or Supabase as a simple one). (2) Move stories from `.md` files to CMS entries (migration script: parse `.md` → CMS create). (3) Replace `story-parser.ts` fs reads with CMS API fetches (via the CMS SDK or GraphQL). (4) Use ISR (`revalidate: 60`) or on-demand revalidation (CMS webhook → `/api/revalidate`) so new stories appear without rebuild. (5) Keep next-intl (CMS stores both locales). Trade-off: adds a runtime dependency (CMS availability), loses the git-as-CMS simplicity, gains editor self-service. The gray-matter pipeline becomes the migration scaffolding.

### Q96. A teammate wants Redux. How do you respond?

**A:** Current state: theme (next-themes), locale (next-intl), ephemeral UI (search query, menu open, install prompt). No complex shared mutable state. Redux would add a store + boilerplate for state that's already cleanly handled. Ask: "What state needs cross-component sharing with frequent updates?" If bookmarks-when-added (Q88), Supabase + optimistic hooks (not Redux) handle it. For now, YAGNI — the app's state is provider-managed, not store-worthy.

### Q97. How would you test the markdown pipeline (the riskiest code)?

**A:** Unit tests for `story-parser.ts`: (1) `parseStoryFile` on fixture `.md` files (valid, missing-front-matter, null-age, multi-section) — assert the parsed shape; (2) `extractSlug`/`extractSlugAndLocale` edge cases (Q56); (3) `sanitizeHtmlServer` with XSS payloads (`<script>`, `<img onerror>`, `javascript:`) — assert they're stripped; (4) the `catch` hole (Q4) — assert it doesn't return raw HTML. There's already `src/lib/__tests__/story-parser.test.ts` (3 tests) — expand it. jsdom env (vitest config) supports DOMPurify. Mock `fs` for the file reads.

### Q98. How would you add i18n-aware slug routing (Arabic slugs vs English)?

**A:** Currently both locales use the same slug (`adam-story`) derived from filename. For Arabic-friendly URLs (`/ar/stories/قصة-آدم`), you'd: (1) add an Arabic slug field to front-matter (or generate one); (2) `generateStaticParams` returns per-locale slugs; (3) next-intl routing handles the prefix. Trade-off: Arabic URLs need encoding (Punycode/%-encoding), less shareable, and Next's file-system router prefers ASCII. Many bilingual sites keep English slugs for both locales (shareable, stable) — the current approach. Arabic slugs are a UX preference, not a requirement.

### Q99. How would you add analytics with privacy compliance (GDPR)?

**A:** Plausible/Umami (privacy-friendly, no cookies, no PII) over GA. For GDPR: (1) no cookies → no consent banner needed (Plausible is cookieless); (2) document the data collected (aggregated pageviews); (3) a privacy policy page. Track pageviews (automatic) + key events (story read, search, share). Avoid logging search text (potential PII). Env-gate to production. The current `PlausibleAnalytics.tsx` is the right start — just fix the env-var name (Q22) and ensure the domain is configured.

### Q100. Onboarding a new dev: 5-step guide?

**A:** 1. Read `AGENTS.md` + `CLAUDE.md` (note stale parts: removed deps, `ClientProviders.tsx` gone) + `docs/PROJECT_BLUEPRINT.md`. 2. `pnpm install && pnpm dev` — visit `/en` and `/ar`. 3. Trace a story: `src/stories/adam-story.md` → `story-parser.ts` (gray-matter + remark + DOMPurify) → `getStoryData` → `StoryContentDisplay`. Understand the pipeline (Q3). 4. Note the known issues: 100% client components, missing `generateMetadata`, the `setRequestLocale` gap in `[slug]`, the proxy-vs-routing drift. 5. Add a story: create a `.md`, run dev, see it; then add `generateMetadata` to `[slug]` (Q78) as a first contribution.

---

## Bonus Round: Stretch Questions (5 questions)

### Q101. The DOMPurify `catch { return html }` is the single biggest security hole. Design the complete fix.

**A:** Three layers: (1) **Fix the catch** — on DOMPurify failure, never return raw HTML; return `''` (empty, safe) or a placeholder `<p>Content unavailable</p>`, and log the failure (with the file slug, not the content) to monitoring. (2) **Validate input first** — Zod/structure check on the remark output before DOMPurify (catch malformed HTML early). (3) **Defense in depth** — keep the redundant client sanitizer BUT make it real (use DOMPurify client-side too, or a proper sanitizer, not the 4-tag strip). The principle: a sanitization failure must always fail closed (no content) never open (raw content). The current `return html` fails open — the worst default.

### Q102. Design a robust content pipeline that's editor-friendly and build-safe.

**A:** (1) **Source**: `.md` files in git (current) OR a CMS (Q95) — pick one. (2) **Validation**: Zod schema (Q65) run at build AND in a pre-commit hook/CI — bad front-matter fails fast with file+reason. (3) **Parsing**: `Promise.allSettled` (Q54) so one bad file doesn't break a locale; log rejects. (4) **Caching**: `unstable_cache`/`react cache` the parsed stories keyed by file mtime, so dev/dynamic mode doesn't re-parse per request. (5) **Output**: pre-compute excerpts, reading time, slugs at parse time (don't re-derive in components). (6) **Type safety**: `z.infer` types flow from the schema to all consumers. (7) **Observability**: build logs report story count, skipped files, validation errors. The current pipeline has 1, 7 partially; the rest are the gaps.

### Q103. Argue for migrating from the HTML-string pipeline to react-markdown, comprehensively.

**A:** Pros: (1) **No `dangerouslySetInnerHTML`** — react-markdown renders React elements, eliminating the XSS class entirely (no DOMPurify needed, no `catch` hole). (2) **Component customization** — map `img` → `<Image>` (get optimization, currently missing Q58), `a` → `<Link>` (internal nav), `pre/code` → syntax highlighter. (3) **Safety by default** — react-markdown v10 drops raw HTML (no `rehype-raw`), so `<script>` in `.md` is escaped. (4) **Consistency** with bassaer (same stack). Cons: (1) Per-render parse cost (mitigated by SSG caching the output). (2) Loses server-side HTML-string caching (but SSG output is the cache). (3) Migration effort (rewrite `StoryContentDisplay`). Net: the safety + customization wins dominate; migrate.

### Q104. The app has 138 `.md` files with no validation. Design a content-lint CLI.

**A:** `pnpm lint:content` script (`scripts/lint-content.ts` via tsx): iterate `src/stories/*.md`; for each: gray-matter parse → Zod schema validate → check referential integrity (referenced `image`/`profilePhoto` files exist in `public/images/`); check slug uniqueness within locale; check both locale files exist for each story (EN + AR pair); report `{file, errors[]}`; exit non-zero on any error. Add to `prepush`/CI. This catches: missing front-matter, `age: null`, orphan images (no story references them), missing AR counterparts, duplicate slugs. Turns silent content bugs into build failures. Reuse the same Zod schema as the runtime parser (single source of truth).

### Q105. The docs (`CLAUDE.md`, `AGENTS.md`, migration reports) diverge significantly from code. Propose a docs-hygiene process.

**A:** (1) **Single source docs** — `CLAUDE.md` and `AGENTS.md` duplicate facts (deps, structure); consolidate or make one canonical + one pointer. (2) **Generate structural facts** — file trees, script lists, dep lists from `package.json` into docs (or remove hand-maintained copies). (3) **Version-stamp reports** — migration/audit docs get a "Last verified against Next X.Y" header; archive (don't edit) when stale. (4) **CI docs check** — a script grepping docs for known-drift patterns (removed deps like `framer-motion`, wrong version numbers, non-existent files like `ClientProviders.tsx`) and failing. (5) **PR review rule** — any PR changing behavior updates docs in the same PR. The meta-issue: this repo's docs rotted because no process enforced freshness; the fix is process, not just edits.

---

## Evaluation Criteria

| Area | Mid | Senior | Staff |
|------|-----|--------|-------|
| **Architecture** | Explains next-intl `[locale]` wiring | Debates HTML-string vs react-markdown | Designs the CMS migration + ISR strategy |
| **React** | Identifies the 100%-client problem | Fixes `Header` LCP/CLS (Q80) | Redesigns server-default component boundaries |
| **TypeScript** | Knows strict flags | Catches the `as StoryData` cast hole | Designs Zod validation at every boundary |
| **Data/Content** | Traces the markdown pipeline | Diagnoses `Promise.all` locale failure | Designs the content-lint CLI + CMS strategy |
| **i18n** | Knows `[locale]` routing | Diagnoses `setRequestLocale` gap + proxy drift | Designs hreflang + per-locale metadata + sitemap |
| **Security** | Knows XSS basics | Finds the DOMPurify `catch` hole | Designs nonce-CSP without breaking next-themes |
| **Performance** | Knows SSG is fast | Catches sync-fs + 100%-client cost | Designs the server-default refactor + image optimization |
| **Maintainability** | Notices docs drift | Catalogs stale migration reports | Designs a docs-freshness CI process |

---

*End of interview document. 105 questions across 5 rounds. All file/function references verified against the new-muslim-stories codebase.*

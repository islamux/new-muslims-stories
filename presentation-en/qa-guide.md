# Q&A Guide — New Muslim Stories

Presenter's guide (technical team Q&A). Every question comes with an answer speakable in 30–60 seconds, a precise reference from the code, an honest statement of the trade-off/limitation, and a suggested follow-up improvement. Technical terms are kept in English.

---

## 1. Architecture & system design

### Q. 1
**Question:** Why did we choose Static Site Generation (SSG) instead of Server-Side Rendering or a purely client-side app?

**Answer (30-60s):** Because the Markdown content is static and does not change per request, every page is built once at build time as ready HTML served directly from a CDN. This gives the fastest TTFB, free/simple hosting, and a smaller attack surface. We enforce this with `dynamicParams = false` and `generateStaticParams`, which make the pages fully static.

**Reference:** `src/app/[locale]/stories/[slug]/page.tsx:7-11` — sets `dynamicParams=false` and pre-generates the params, so generation is static, not dynamic.

**Trade-off/limitation:** Any content update requires a full rebuild; there is no per-request live data refresh.

**Follow-up improvement:** Add partial revalidation (ISR) or a webhook that triggers a rebuild only when a Markdown file changes.

### Q. 2
**Question:** Why did we use Markdown as a database (Markdown-as-a-DB) instead of a real database like Postgres?

**Answer (30-60s):** The content is editorial stories with a simple structure (title, name, country, HTML), not dynamic relational data. Markdown files are easy to review via git, and they are read at build time directly — no network connection or database server needed. This simplifies operations down to just static files.

**Reference:** `src/lib/story-parser.ts:9` — `storiesDirectory` reads `.md` files from `src/stories` via `fs` at build time.

**Trade-off/limitation:** No complex queries, no relations, no indexes, and no live updates — anything dynamic needs a different structure.

**Follow-up improvement:** Migrate to a Headless CMS (like Sanity/Contentful) that keeps Markdown behind an API if we ever need collaborative editing.

### Q. 3
**Question:** How do we organize the project's folders and what is each one's role? And what does the absence of any API routes mean?

**Answer (30-60s):** The app uses the App Router with a `[locale]` folder per language, `src/lib` for parsing and services, `src/stories` for content, and `src/components` for the UI. There is no `api/` directory at all because everything is resolved at build time from files; no dynamic server is needed.

**Reference:** `src/proxy.ts:14` — the matcher explicitly excludes `api` (`/((?!api|_next|.*\\..*).*)`), confirming that no API routes are intended.

**Trade-off/limitation:** This is a read-only architecture; there are no user input forms or writes.

**Follow-up improvement:** When interaction is needed (search, forms), add serverless functions separate from the pages.

### Q. 4
**Question:** How do we handle newly added files / missing content without crashing the site?

**Answer (30-60s):** `Promise.allSettled` lets us skip a single corrupted file instead of dropping the whole list, only logging the error. Also, the normalize function provides safe default values for every field so the code doesn't break on missing data, and validation warns instead of throwing.

**Reference:** `src/lib/story-service.ts:16-20` — `allSettled` with filtering and logging of rejected results; and `src/lib/story-parser.ts:57-69` warns on missing fields without `throw`.

**Trade-off/limitation:** A corrupted file is silently dropped from the list, and the developer may only notice it in the log.

**Follow-up improvement:** Add a CI check that blocks merging an incomplete or corrupted Markdown file.

---

## 2. Rendering & hydration (SSR/SSG/CSR)

### Q. 5
**Question:** What is the difference between SSR, CSR, and hydration?

**Answer (30-60s):** In CSR, empty HTML + JavaScript is sent and the DOM is built in the browser (slow first paint, weak SEO). In SSR, complete HTML is generated on the server per request and sent along with JS. Hydration is the process of attaching that static HTML to React on the client, so events and state bind without rebuilding. Here we use SSG (generation at build time) then hydration on the client.

**Reference:** `src/app/[locale]/layout.tsx:23-25` — `generateStaticParams` generates all pages at build time; then `src/components/ThemeToggle.tsx:45-64` is a client component that activates after hydration.

**Trade-off/limitation:** Hydration adds initial JS cost and may cause a brief flash before events wire up.

**Follow-up improvement:** Move to Progressive Hydration or interactive islands only where needed.

### Q. 6
**Question:** Why does hydration mismatch happen, and how do we prevent it?

**Answer (30-60s):** A mismatch happens when the server produces HTML that differs from the first client render — the most common cause is reading `window`/`localStorage` or random state during render. We prevent it with the `useHasMounted` gate: we don't compare browser state until after mount, and within it `ThemeToggle` decides dark mode.

**Reference:** `src/components/ThemeToggle.tsx:48,50` — `mounted = useHasMounted()` and `isDark = mounted && resolvedTheme === 'dark'` prevent reading the theme before hydration.

**Trade-off/limitation:** This approach momentarily shows the default (light) version before switching to the desired mode, which can cause a flash.

**Follow-up improvement:** Add `suppressHydrationWarning` for expected attributes only, or use script-blocking to inject the theme before render.

### Q. 7
**Question:** What happens before and after `useEffect`, and what is its correct place in SSR?

**Answer (30-60s):** Before `useEffect`, the full render runs (SSG on the server, then the first render on the client) with no side effects; `useEffect` runs only after commit in the browser, so it is the only safe place to read the browser (localStorage, SW, etc.). After it, the cleanup from the return runs on every update or when the component unmounts.

**Reference:** `src/components/LocalePersist.tsx:6-12` — writes to `localStorage` only inside `useEffect`, because `localStorage` is unavailable during render on the server.

**Trade-off/limitation:** Anything in `useEffect` shows up late (after first paint), so it is unsuitable for SEO-critical content.

**Follow-up improvement:** Move critical logic to the server or to `useSyncExternalStore` when higher priority is needed.

### Q. 8
**Question:** Why can't browser APIs (like window/localStorage) be read during render in an SSR app?

**Answer (30-60s):** Because the first render happens on the server, where there is no `window`, `navigator`, or `document`. If we tried to read them in the component body, the server-side code would break the build. The deeper reason: even if they exist in the browser, reading them during the first render produces a result different from the server's, causing a mismatch.

**Reference:** `src/components/ThemeProvider.tsx:7-9` — the `typeof window !== 'undefined'` condition restricts browser work to prevent a crash during SSG.

**Trade-off/limitation:** It forces us to defer all browser logic until after mount, which adds extra JavaScript or a flash.

**Follow-up improvement:** Rely on `useSyncExternalStore` with a fixed server-side default value, as done in the offline page.

### Q. 9
**Question:** Where does the app draw the boundary between server and client components (server/client boundary), and why?

**Answer (30-60s):** Every `page.tsx` is a Server component that fetches data and passes it as props to Client components that handle interactivity. Files starting with `'use client'` (like ThemeToggle, PWAInstall, and LocalePersist) ship JavaScript and run in the browser, while the rest of the app is SSG.

**Reference:** `src/app/[locale]/page.tsx:46-49` — the Server page fetches the stories and passes them to `HomePageClient` (Server→Client structure).

**Trade-off/limitation:** Any interactive state must live in a client component, which increases the client bundle size.

**Follow-up improvement:** Keep these components small and isolate the critical ones; use React Server Components wherever possible.

---

## 3. Routing & state

### Q. 10
**Question:** How does the multilingual `[locale]` routing work, and what is `proxy.ts`?

**Answer (30-60s):** The route includes a `[locale]` segment (`/en/...` or `/ar/...`), and `proxy.ts` (Next 16's replacement for middleware) rewrites/redirects requests according to the language via next-intl, with a matcher that excludes static assets and `_next`.

**Reference:** `src/proxy.ts:3-9` — `createMiddleware` for the two languages en/ar; and `:14` the matcher `['/((?!api|_next|.*\\..*).*)']`.

**Trade-off/limitation:** Middleware adds processing overhead to every request, and incorrect routing can cause locale inconsistency.

**Follow-up improvement:** Unit-test the matcher and verify the default locale behavior in edge cases.

### Q. 11
**Question:** How do we manage RTL (right-to-left/left-to-right) direction per language?

**Answer (30-60s):** We set `dir` on the `<html>` tag based on the locale — `rtl` is enabled for Arabic and `ltr` for English — so the entire layout flips automatically without per-element CSS changes.

**Reference:** `src/app/[locale]/layout.tsx:40` — `const dir = locale === 'ar' ? 'rtl' : 'ltr'`, and `:43` applies it as `<html dir={dir}>`.

**Trade-off/limitation:** Some third-party components may not respect `dir` and need manual fixes.

**Follow-up improvement:** Consistently use CSS logical properties (margin-inline-start…) across the app.

### Q. 12
**Question:** How are theme and locale state managed and persisted across sessions?

**Answer (30-60s):** The theme goes through `next-themes`: `ThemeProvider` applies `attribute="class"` for dark mode and is toggled via `ThemeToggle`; the locale goes through `LocalePersist`, which writes it to `localStorage` so it survives return visits.

**Reference:** `src/app/[locale]/layout.tsx:45-50` sets up ThemeProvider (defaultTheme light); and `src/components/LocalePersist.tsx:5-15` writes `localStorage.setItem('locale', locale)` in an effect.

**Trade-off/limitation:** We rely on `localStorage`, which is browser-scoped only — not shared across devices — and may be unavailable in private browsing (handled with try/catch).

**Follow-up improvement:** Sync the locale with a server-side cookie to match the visitor's preference across requests.

---

## 4. Data pipeline & text processing

### Q. 13
**Question:** How does the story processing pipeline work, from Markdown to safe HTML?

**Answer (30-60s):** The file is read with `gray-matter` to extract the frontmatter (metadata), then `remark`+`remark-html` convert the Markdown to HTML, then `sanitizeHtmlServer` sanitizes the output via DOMPurify, and finally `normalizeStoryData` builds a fully typed `StoryData` object.

**Reference:** `src/lib/story-parser.ts:81` (matter), `:86` (remark), `:88` (sanitize), `:90` (normalize) inside `parseStoryFile`.

**Trade-off/limitation:** The pipeline runs at build time only; any change requires a rebuild, and there is no dynamic content generation.

**Follow-up improvement:** Add a cache for parsed results or parallel build processing as the file count grows.

### Q. 14
**Question:** How do we split story content into sections, and what are the limits of that approach?

**Answer (30-60s):** `getStorySections` splits the HTML at `h2/h3` boundaries and collects the section texts into `lifeBeforeIslam`, `momentOfGuidance`, and `reflections`, and it tolerates missing headings instead of breaking the indices.

**Reference:** `src/lib/story-sections.ts:12-28` — split on `/h[23]/` with fallback `bodies[0] ?? ''` and `bodies.slice(2).join`.

**Trade-off/limitation:** It depends on the actual heading order in the file; any missing heading shifts how the sections are distributed.

**Follow-up improvement:** Rely on explicit identifiers/patterns for each section instead of the order in which headings appear.

### Q. 15
**Question:** Why do we use DOMPurify with a tight allowlist, and what does that protect against?

**Answer (30-60s):** We convert Markdown — potentially from external sources — into inline HTML; DOMPurify strips any malicious script or on* attributes by allowing only 24 explicitly listed tags and 7 attributes, with `ALLOW_DATA_ATTR: false` to prevent data injection.

**Reference:** `src/lib/sanitize.ts:17-43` (ALLOWED_TAGS for the allowed tags), `:44` (ALLOWED_ATTR), `:45` (ALLOW_DATA_ATTR=false).

**Trade-off/limitation:** The tight list may remove legitimate tags/attributes from rich content, and it does not fully handle advanced browser mutation complexity (mXSS).

**Follow-up improvement:** Update the DOMPurify version regularly and add tests targeting known XSS vectors.

### Q. 16
**Question:** How does the app defend against malicious HTML coming from the story files?

**Answer (30-60s):** The whole pipeline sanitizes the output before display: the sanitizer runs on the server side (not the client), meaning the stored HTML is clean to begin with. The CSP in `next.config.mjs:7` allows `unsafe-inline` and `unsafe-eval` in `script-src` (an acknowledged weak point), and prevents framing via `frame-ancestors 'none'` (`:12`).

**Reference:** `src/lib/story-parser.ts:88` — `sanitizeHtmlServer(rawHtml)` before `normalizeStoryData`; and `next.config.mjs:7` and `:12` — CSP.

**Trade-off/limitation:** The app never actually renders HTML authored by external users, so the threat is largely theoretical.

**Follow-up improvement:** Document the real threat model in the README and test suspicious cases.

---

## 5. API / database / identity

### Q. 17
**Question:** Why does the project have no API routes, no database, and no auth (identity) system? Isn't that a shortcoming?

**Answer (30-60s):** It is a design choice, not a shortcoming: static content served via SSG needs no server-side API or DB, and removing the dynamic server shrinks the attack surface and eliminates the need for session management or input sanitization. Everything is resolved at build time from files.

**Reference:** `src/proxy.ts:14` — the matcher explicitly excludes `api`, confirming that no API routes are intended; and `src/lib/story-parser.ts:9` — data comes from local files at build time.

**Trade-off/limitation:** No stored user preferences, no data submission, no server-side analytics, and no features requiring a user profile.

**Follow-up improvement:** Add a serverless function (e.g., form handling or search) when the need arises, without turning the whole project into a dynamic server.

### Q. 18
**Question:** If we wanted to add a real database, how would we do it today without breaking the current architecture?

**Answer (30-60s):** To decouple data fetching from the SSG output: we add a `StoryService` layer behind a stable interface, so we can swap the `fs` source for database/CMS reads without changing the callers. Then we add revalidation or ISR for the dynamic parts.

**Reference:** `src/lib/story-service.ts:13-29` — `getSortedStoriesData` currently derives from the parser, making its source easy to replace with any data provider.

**Trade-off/limitation:** The build becomes a network operation, adding time and the possibility of failure and/or an external connection.

**Follow-up improvement:** Isolate the source via dependency injection and test the data layer in isolation.

### Q. 19
**Question:** If the app needed an auth (identity) system and user profiles, what would the architecture look like?

**Answer (30-60s):** New `api` routes or serverless functions would be added for sessions and authentication (e.g., OAuth), while keeping the story pages SSG. There is currently no user model or token anywhere in the code; all data is public and readable.

**Reference:** `src/types/story.types.ts:7-21` — `StoryData` contains no user/identity field; all the data is public.

**Trade-off/limitation:** It would bring the security complexity (password hashing, CSRF protection, session management) that we avoid today.

**Follow-up improvement:** Implement OAuth via an external provider instead of managing passwords in-house.

---

## 6. Performance, caching & PWA

### Q. 20
**Question:** How does SSG deliver superior performance, and what is the caching strategy?

**Answer (30-60s):** Every page is ready HTML served from the edge/CDN with no server compute; TTFB is very low. Service Worker strategies complement this: network-first for navigation, stale-while-revalidate for stories, and cache-first for static assets.

**Reference:** `public/sw.js:40-78` (network-first for navigation), `:80-122` (SWR for stories), `:124-164` (cache-first for static assets).

**Trade-off/limitation:** Cache versioning is manual (the name is written in `sw.js:1`), and any mistake in the strategy can serve stale content.

**Follow-up improvement:** Adopt an SW generation tool or split the strategies automatically by asset type.

### Q. 21
**Question:** What is the offline page, and how does its language detection work?

**Answer (30-60s):** A page used when navigation fails due to the network; it displays texts in both languages from a table embedded directly in the file, and detects the language via `useSyncExternalStore` by reading `localStorage` then `navigator.language`, with a default server-side value of `'en'` to avoid a mismatch.

**Reference:** `src/app/offline/page.tsx:21-49` (the text table), `:51-65` (detectLocale), and `:65` uses `useSyncExternalStore` with the default `'en'`.

**Trade-off/limitation:** The page deliberately bypasses next-intl (no messages are loaded), and it may momentarily appear in a language that doesn't match the visitor's preference.

**Follow-up improvement:** Bundle the messages needed for these texts into the SW, or pass the language via the URL.

### Q. 22
**Question:** How does the PWA install prompt work, and why is it deliberately delayed?

**Answer (30-60s):** We listen for the `beforeinstallprompt` event, prevent the default behavior, then show the prompt after a 5-second delay so it doesn't compete with the user's first interaction, and we persist the dismissal in `localStorage` so it doesn't show again.

**Reference:** `src/components/PWAInstall.tsx:37` (5000ms display delay), and `:27` saves `pwa-install-dismissed` on dismissal.

**Trade-off/limitation:** The `beforeinstallprompt` event is unavailable on iOS, so the feature is limited to certain browsers/devices.

**Follow-up improvement:** Provide a manual instructional fallback for iOS via the "Add to Home Screen" settings.

### Q. 23
**Question:** Which features in `sw.js` were added but are inactive (dead code)?

**Answer (30-60s):** There are handlers for `push` notifications and background `sync` that are written, but nothing in `public/` or the app invokes them, and there are no notification permissions or background sync registrations — they are inactive future-proofing.

**Reference:** `public/sw.js:167-232` — the `push`, `notificationclick`, and `sync` handlers exist but have no actual trigger source.

**Trade-off/limitation:** Unused code increases runtime size and reading confusion with no current benefit.

**Follow-up improvement:** Remove them now, or document a roadmap for enabling them later.

---

## 7. Security & threat model

### Q. 24
**Question:** What is the Content-Security-Policy, and what is its known vulnerability?

**Answer (30-60s):** We set the CSP in the headers: `default-src 'self'`, restricted `img/font/connect` values, and `frame-ancestors 'none'`. But we rely on `script-src 'self' 'unsafe-inline' 'unsafe-eval'` and `style-src 'unsafe-inline'` — which weakens the CSP's effectiveness because injected inline scripts/eval may succeed.

**Reference:** `next.config.mjs:5-15` — the full CSP text, with `:7` specifically `script-src 'self' 'unsafe-inline' 'unsafe-eval'`.

**Trade-off/limitation:** `unsafe-inline/unsafe-eval` is required by Next.js and its modern modes, but it voids a large part of the protection — we don't claim "fully secure".

**Follow-up improvement:** Move to nonces or script hashes when Next/config support allows lifting the inline restriction without breaking the app.

### Q. 25
**Question:** What is the real attack surface of a static site, and what exactly are we protecting?

**Answer (30-60s):** Since there is no dynamic server, no API, no DB, and no user input, the main attack surface is the published HTML and browser interactions (XSS from content, asset vulnerabilities, attacks via the CDN). We protect it by sanitizing the HTML, with the CSP, and with headers like frame-ancestors.

**Reference:** `src/lib/sanitize.ts:17-45` (HTML sanitization), and `next.config.mjs:18-21` (additional security headers like nosniff and Referrer-Policy).

**Trade-off/limitation:** Headers + the sanitizer mitigate the risks but don't eliminate them; the CSP weakness noted earlier remains.

**Follow-up improvement:** Periodic dependency vulnerability reviews (npm audit) and asset pinning via Subresource Integrity where possible.

---

## 8. Testing & observability

### Q. 26
**Question:** What has actually been tested, and what hasn't?

**Answer (30-60s):** 5 files with 29 tests via vitest/jsdom were tested: the HTML sanitizer, the story parser, section splitting, the console filter, and the Button component. Not tested: PWA/SW integration, multiple pages together, actual routing/locale, hydration performance, or E2E scenarios in a real browser.

**Reference:** The five files: `src/lib/__tests__/theme-console-filter.test.ts`, `sanitize.test.ts`, `story-parser.test.ts`, `story-sections.test.ts`, and `src/components/__tests__/Button.test.ts` (29 tests in total per the brief).

**Trade-off/limitation:** Coverage is essentially unit-level; there is no E2E (Playwright/Cypress) and no cross-browser tests.

**Follow-up improvement:** Add an E2E layer covering navigation, both languages, and dark mode; and measure coverage with `vitest --coverage`.

### Q. 27
**Question:** We noticed a `theme-console-filter.ts` file. What does it actually do, and does it address the root of the problem?

**Answer (30-60s):** It intercepts `console.error` in development mode only, to mute a specific warning that next-themes produces when injecting a script during component render. It is **symptom suppression**, not a root fix — the original warning still occurs.

**Reference:** `src/lib/theme-console-filter.ts:7-17` — `installThemeConsoleFilter` replaces `console.error` to ignore the matching message; and it is enabled in `src/components/ThemeProvider.tsx:7-9` under a `development` condition.

**Trade-off/limitation:** It may hide similar errors from the developer and make diagnosis harder; it is merely suppression of the symptom.

**Follow-up improvement:** Find the root cause of the next-themes warning (most likely a different approach to script placement) or move to a newer version that removes it.

### Q. 28
**Question:** Does the app have any observability? How do we know its performance in production?

**Answer (30-60s):** There is no systematic observability: no server logging (there is no server at all), no aggregated errors, and no RUM metrics in any official setup. What exists is client-side console.log (like SW registration logging), and unofficial analytics could be attached.

**Reference:** `src/components/ServiceWorkerRegistration.tsx:14` — `console.log('Service Worker registered:')` as an example of primitive logging without a monitoring system.

**Trade-off/limitation:** We can't actually measure production errors or real-user performance; diagnosis relies on manual reports.

**Follow-up improvement:** Add a client-side error tracking tool (Sentry/Rollbar) and Core Web Vitals metrics via a RUM tool.

---

## 9. Trade-offs & roadmap

### Q. 29
**Question:** Why are the domain and timezone hardcoded?

**Answer (30-60s):** The base URL `https://newmuslimstories.com` is written literally in several places (metadata, robots, sitemap), and the `Asia/Aden` timezone is fixed in the next-intl settings, to avoid depending on the runtime environment and to guarantee fast, consistent generation at build time.

**Reference:** `src/app/[locale]/page.tsx:25`, `src/app/[locale]/stories/[slug]/page.tsx:27`, `src/lib/metadata.ts:5`, `src/app/robots.ts:12`, and `src/app/sitemap.ts:4` (the same domain), and `src/i18n/request.ts:17` (`timeZone: 'Asia/Aden'`).

**Trade-off/limitation:** When the domain changes or in multi-environment scenarios, the value must be updated everywhere; and the fixed timezone doesn't suit visitors from other time zones.

**Follow-up improvement:** Extract the domain and timezone into central environment (env) variables.

### Q. 30
**Question:** Why is there no pagination despite the number of stories?

**Answer (30-60s):** The current count (69 stories × 2 languages = 138 files) is small enough for a single countable page, and the service returns all the stories together without any pagination or limit mechanism.

**Reference:** `src/lib/story-service.ts:87-92` and `:78-82` — no limit/page; the functions return all the results at once.

**Trade-off/limitation:** If the content grows a lot, the initial HTML will grow and slow loading, and the page becomes uncomfortable to browse.

**Follow-up improvement:** Upgrade the current client-side filtering (`FeaturedStories.tsx`) to fully indexed search or server-side search when needed, or add pagination/infinite scroll.

### Q. 31
**Question:** How do we build a risk-based security roadmap for this architecture?

**Answer (30-60s):** We rank the risks: the highest is a stale dependency / a batch of vulnerabilities in DOMPurify or Next, then the CSP weakness from `unsafe-inline`, then the lack of E2E. The lowest risks: the server attack surface (there is no server) and the dead code in the SW. We prioritize the first two.

**Reference:** `package.json:18-29` — the production dependencies that need periodic updates (especially DOMPurify and Next); and `next.config.mjs:7` — the CSP weakness.

**Trade-off/limitation:** Without E2E and observability, production regressions can't be verified easily, so some risks remain invisible.

**Follow-up improvement:** Prepare a recurring checklist: npm audit, updating SW cache versioning, and reviewing the CSP with every Next upgrade.

---

## Mandatory honesty notes for the presenter (don't over-promise)

1. **No API, no database, no auth** — present this not as a missing feature but as a design choice based on SSG and static content.
2. **Don't present it as "fully secure"** — the CSP uses `unsafe-inline/unsafe-eval` (`next.config.mjs:7`), and `theme-console-filter.ts` is merely **symptom suppression** (`src/lib/theme-console-filter.ts:1-17`), not a root fix.
3. **Don't claim full test coverage** — only 29 unit-level tests, **no E2E**.
4. **Don't claim production monitoring** — no official observability, only basic console.log.
5. **Some PWA features may be dead/inactive** on some browsers (`beforeinstallprompt` is unavailable on iOS; `push/sync` in `sw.js` are unactivated).
6. **The answers' references are accurate** — every `file:line` above was reopened and confirmed against the actual code before inclusion.

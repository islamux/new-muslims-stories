# Live Demo Script — New Muslim Stories

**Frame:** a 60-minute technical presentation; the slot allocated to the live demo is **about 11 minutes**, with a compression plan down to **about 6 minutes** (running the critical path only).
**Audience:** a technical team.
**Language:** English prose, with technical terms in English.

> Before going on stage: make sure the following commands are listed in `package.json` and that they work (the checklist is in item 1 below).

---

## Time map (11 minutes — 7 segments)

| # | Segment | Time | On the critical path when compressing? |
|---|---------|-------|---------------------|
| 1 | Preflight | 1 minute | Yes |
| 2 | Routing / URL state | 2 minutes | Yes |
| 3 | Local state + reload (with a Hydration intro) | 2 minutes | Yes |
| 4 | Story page processing | 1.5 minutes | Yes |
| 5 | Markdown source edit (HMR) | 1.5 minutes | **No** (optional) |
| 6 | Production build + PWA/offline | 2 minutes | Yes |
| 7 | Hydration deep-dive | 1 minute | **No** (merged into 3) |

**Total: 1 + 2 + 2 + 1.5 + 1.5 + 2 + 1 = 11 minutes** ✔

---

## Segment 1 — Preflight (one minute)

**Opens in the terminal:** a terminal ready at the project root.

**Narration (what the speaker says):**

> These are the pre-presentation commands, and they are the actual commands present in `package.json`. The first step is installing the dependencies: `pnpm install` — this is pnpm's standard installer, not a script inside the package. Then I check that the tests and quality pass before anything else on stage.

**Commands (present in `package.json`):**

```bash
pnpm install          # the standard installer (not in scripts; a pnpm convention)
pnpm test             # = vitest run → 5 files / 29 tests (confirmed)
pnpm lint             # eslint . --max-warnings=999
pnpm dev              # dev server at http://localhost:3000
```

> All of these are cross-platform commands and do not require any special Linux environment.

**External evidence then internal link:** we mention that `pnpm test` passes (5/5 files, 29/29 tests) as recorded in Task 1, and most importantly we will actually run it now. In segments 4/6 we will run some of the useful (sanitize) tests coming from `src/lib/__tests__/`.

**Honesty note:** we do not run `pnpm build` and `pnpm start` here in preflight (we will in segment 6 to demonstrate PWA from a production build). This preflight only proves that the tests and the linter work.

---

## Segment 2 — Routing / URL state (two minutes)

**Opens in the browser:** `http://localhost:3000/en`.

**Narration (what the speaker says):**

> The project is bilingual en/ar via `next-intl` with App Router handling. The routing here is not a component inside a page; it goes through `defineRouting`, which declares the list of locales and the default. Let me open `/en` and then change the language from the switcher.

**External evidence then internal link:**
- The locales definition: `src/i18n/routing.ts:5` (locales en/ar) and `:8` (defaultLocale en).
- The middleware (in Next 16 via `proxy.ts`): `src/proxy.ts:3-9` redirects requests and adds the locale automatically, and `src/proxy.ts:14` sets the matcher, excluding `api|_next` and static files — meaning there is no interference with any internal routing.

**Activating URL state:**

1. From inside `/en`, click the language switcher (Language switcher) to switch to Arabic.
2. Notice that the URL actually changed to `/ar` (real URL state in the browser, not just text).
3. Notice the direction flip: `src/app/[locale]/layout.tsx:40` computes `dir = locale === 'ar' ? 'rtl' : 'ltr'` and applies it to the `<html>` element at `:43`.
4. Try a hard URL: `http://localhost:3000/ar/stories/<slug>` (pick an existing slug such as `omar-story`). Notice that the browser shows the Arabic version of the story directly, because the routing picks the locale up from the pathname.

**Takeaway (spoken):**
> The routing is "URL state": the language is part of the address, and switching between the two languages expresses itself in the URL and in the page direction.

---

## Segment 3 — Local state + reload (two minutes) — includes a Hydration intro

**Opens in the browser:** the current site (any locale).

**Narration (what the speaker says):**

> Now we hit Local state and reload the page. First the theme: I toggle dark/light from the theme switcher, then I reload the page. The theme persists because `next-themes` stores it (a system/user preference, not read directly during render).

**Internal evidence (theme):**
- The mounted gate protects the button's first render so it doesn't flicker: `src/components/ThemeToggle.tsx:48` (`const mounted = useHasMounted()`), `:57` (`disabled={!mounted}`), `:50` (isDark only after mounted).
- The hook itself: `src/hooks/useHasMounted.ts:1-12` flips `hasMounted` to true inside `useEffect` — and this is the safe pattern for avoiding mismatch.
- In the layout we persist the theme via `src/app/[locale]/layout.tsx:45-50` with `defaultTheme="light"` at `:47` and `suppressHydrationWarning` at `:43` (because the theme script changes the class before hydration).

**Internal evidence (locale):**
- Switching the language and reloading persists the language as well: `src/components/LocalePersist.tsx:8` writes `localStorage.setItem('locale', locale)` inside `useEffect` (`:6-12`), with a `try/catch` to handle localStorage being unavailable.

**Hydration intro (spoken briefly by the speaker):**

> This double demonstration (theme + locale surviving a reload) is really a Hydration example: the initial HTML that arrives from the server matches what the client will render. Had we not enabled the mounted gate, we would read localStorage directly during render, so the server would arrive with one value (dark by default, or light) and the client with another, and a mismatch would ignite. We will detail this in segment 7.

**Honesty note:** there is no server-side search and no search page; there is in-memory client-side filtering on the home page (and this is not that segment — this is a "local state and reload" segment, as required).

---

## Segment 4 — Story page processing (1.5 minutes)

**Opens in the browser:** a story from the list (e.g. `/en/stories/omar-story`).

**Narration (what the speaker says):**

> This is the "core content processing" — it flows from the Markdown as props through to the rendered view. Every story is displayed in three sections: before Islam / the moment of guidance / reflections. The section split is not based on fixed markers, but on analyzing the HTML produced from the headings.

**External evidence then internal link:**
- The splitting mechanism: `src/lib/story-sections.ts:12-28` — `getStorySections` splits on `<h2/h3>` and collects each section's body without relying on fixed indices (it tolerates extra/missing headings) at `:16-21`.
- Prev/next navigation: `src/app/[locale]/stories/[slug]/page.tsx:77-79` finds the current story's index in the ordered list and determines the previous and next ones (index > 0 → prev; index < length-1 → next).
- Safety: before the HTML is displayed, it is sanitized via `src/lib/sanitize.ts` (DOMPurify with a defined list of tags and attrs at `:17-44`), and the call happens at `src/lib/story-parser.ts:88`.

> I want to be honest: there is no server-side search, no search index, and no /search; there is client-side filtering of the loaded stories on the home page (`FeaturedStories.tsx`). Nor are there API routes or a database; the `robots.txt` file is generated via `src/app/robots.ts`. What we are showing here is "core processing": splitting the story, sanitizing it, and displaying it.

---

## Segment 5 — Markdown source edit / HMR (1.5 minutes) — optional when compressing

**Opens:** an editor on `src/stories/<slug>.md` beside the browser.

**Narration (what the speaker says):**

> The data here is Markdown — not a database. I edit a line of frontmatter or body, save, and the dev server picks the change up via fast refresh and repaints the page instantly. This shows that the content is a "Markdown database".

**Steps (a small, reversible change):**
1. Open `src/stories/omar-story.md` (the English version) — frontmatter at `:1-13` and the body from `:15`.
2. Temporarily edit a line in the title (e.g. add a word) at `:2`.
3. Save, and watch the browser update.
4. **Revert the change** immediately and save (undo) — we don't want to leave a random edit in the repository.

**Internal evidence:**
- The processing path from file to HTML: `src/lib/story-parser.ts:74-91` (`parseStoryFile`) — it reads the file (`:78`), parses the frontmatter with gray-matter (`:81`), converts the Markdown to HTML with remark/remark-html (`:86`), then sanitizes (`:88`).

**Honesty note (spoken):**
> This works because it is SSG (static generation): in production the story is rebuilt at build time, not on every request. This quick edit is specific to the development environment via fast refresh.

---

## Segment 6 — Production build + PWA/offline (two minutes)

**Opens in the terminal then the browser.**

**Narration (what the speaker says):**

> Now we move to real production. The app is a PWA, but an important clarification is due: **the service worker is nearly ineffective in development mode** (`next dev` does not serve `public/sw.js` with the production caching mechanism), so we demonstrate offline from a **production build** (`pnpm build` then `pnpm start`).

**Commands (present in `package.json`):**

```bash
pnpm build        # next build → SSG for the pages
pnpm start        # next start → production server at http://localhost:3000
```

**External evidence then internal link:**
- The manifest and installability: open `public/manifest.json` (name at `:2`, display standalone at `:6`, icons at `:13-26`).
- The service worker is keyed to a version number: `public/sw.js:1` (`CACHE_NAME = 'new-muslim-stories-v0.1.0'`), and it deletes the old versions in activate at `:25-37`.
- Caching strategies:
  - **Network-first** for navigation (HTML): `public/sw.js:40-78` — it tries the network first and caches, and on failure it serves from the cache or the offline page at `:66-70`.
  - **Stale-while-revalidate** for content/stories: `public/sw.js:80-122` — it returns the cached copy immediately and then updates it in the background (`:88-100`).
  - **Cache-first** for static assets (CSS/JS/images/`/_next/`): `public/sw.js:124-164`.
- Registration: `src/components/ServiceWorkerRegistration.tsx:5-37` registers `/sw.js` with the scope `'/'` at `:10-12` and handles updates at `:17-26`.
- The offline page: `src/app/offline/page.tsx` — it detects the locale from `localStorage.getItem('locale')` at `:54` (with a fallback to `navigator.language` at `:59`).

**Demo steps:**
1. Run `pnpm build` then `pnpm start` (from a production build).
2. Open the site and check the manifest and installability (after `beforeinstallprompt` is activated via `PWAInstall`).
3. From DevTools > Network, enable **Offline**.
4. Reload a story page you have already visited — it will still render from the cache (the stale-while-revalidate strategy for stories).
5. Go to an uncached URL — the **offline page** will appear (`src/app/offline/page.tsx`).

**Honesty notes:**
- The offline locale detection and the caching only work in production, not in dev.
- There is no database and no env vars required here; the app-level "sync" is local state persistence (theme/locale) and offline caching, not server sync.

---

## Segment 7 — Hydration deep-dive (one minute) — merged into 3 when compressing

**Opens in the browser + terminal (curl or View Source).**

**Narration (what the speaker says):**

> I want to show that the initial HTML is produced server-side. I open the source or run curl against the page and see it complete before any JS loads. Then client hydration follows, attaching the event handlers.

**External evidence then internal link:**
- View the page source (View Source) or: `curl -s http://localhost:3000/en` in the terminal — a complete story/HTML structure is visible without JS.
- Hydration preserves this HTML because it matches, with `suppressHydrationWarning` and `defaultTheme="light"` set in `src/app/[locale]/layout.tsx:43,47`.
- The mismatch-safe pattern: `src/hooks/useHasMounted.ts:1-12` + its application in `src/components/ThemeToggle.tsx:48-57`.

**Honesty note:** this segment is the first thing we drop or merge into segment 3 when compressing to 6 minutes, because the essence of Hydration (the mounted gate and mismatch) is already covered in segment 3.

---

## The compressed plan (down to ~6 minutes)

Run **the critical path only:** segments 1, 2, 3, 4, and 6 in full; drop/lighten segment 5 (down to a screenshot or a single mention) and merge segment 7 into segment 3; tighten the talking.

| # | Segment | Time |
|---|---------|-------|
| 1 | Preflight (shortened: `pnpm test` + `pnpm dev`) | 0.5 minutes |
| 2 | Routing / URL state | 1.5 minutes |
| 3 | Local state + reload + Hydration intro | 2 minutes |
| 4 | Story processing (splitting/sanitizing) | 0.5 minutes |
| 5 | (a Markdown screenshot, not run) | — |
| 6 | Build + PWA/offline | 1.5 minutes |
| 7 | (merged into 3) | — |

**Total: 0.5 + 1.5 + 2 + 0.5 + 0 + 1.5 + 0 = 6 minutes** ✔. **The compression key:** have the build (seg 6) running beforehand on a second machine or in a parallel slot, and present PWA/offline without waiting for `pnpm build` in front of the audience. Segment 5 is replaced with a ready screenshot, and segment 7 has been merged into segment 3.

> **Important:** do not keep segment 5 as a live run when compressing; replace it with a ready screenshot showing the `.md` beside the browser.

---

## The Hydration explanation — the ten required points (a summary for reference, detailed in slides 20-24)

1. **Server render limits:** the server has no `window`/`document`/`localStorage`; therefore any read of these during render is forbidden.
2. **HTML arrives first:** the server sends complete HTML (proven by View Source/curl) — this is the "first paint".
3. **The client's first render must match the initial HTML:** otherwise, mismatch.
4. **Hydration = attaching the handlers, not repainting from an empty DOM:** React reuses the existing DOM tree and attaches events instead of recreating it.
5. **Effects run after commit:** `useEffect` runs after hydration, so it cannot be relied on to compute the first render.
6. **The wrong example:** if we read localStorage directly during render (`const theme = localStorage.getItem('theme')` outside useEffect): the server sees (light by default), and the client sees a different stored value → mismatch.
7. **The outcome:** either React failing/repairing, or a flash — and that is what we prevent with the mounted gate and `suppressHydrationWarning`.
8. **The correct pattern in this project:** `defaultTheme="light"` + `suppressHydrationWarning` in `src/app/[locale]/layout.tsx:43,47`, and the mounted gate `src/hooks/useHasMounted.ts:1-12`, applied in `src/components/ThemeToggle.tsx:48-57`.
9. **Telling mismatch apart from post-useEffect changes:** mismatch happens if the client's first render differs from the server HTML; whereas changing the DOM after `useEffect` (like toggling a class) is legitimate behavior and does not constitute a mismatch, because `useEffect` runs after commit.
10. **Tying it to the test hooks:** our pattern is backed by a real test, not a claim: `src/lib/__tests__/theme-console-filter.test.ts` proves that we filter only the script-tag warning, with the tests defined (`:12-40`). Also, `src/lib/__tests__/sanitize.test.ts` proves the HTML sanitization (`:6-26`) — which is what protects the story content.

**Including mismatch + safe pattern:** the wrong example (point 6) and the safe example (point 8) are both present above.

---

## Fallback plan

There is no database and no env vars required, so the possible scenarios:

1. **`pnpm build` fails** — do not make the audience wait. Switch immediately to the dev server (`pnpm dev`), bring it to the foreground, and show the ready screenshots for segment 6 (offline from a previous production build). Prepare a ready build screenshot before the presentation.
2. **The build succeeds but there is no time to demo it live** — have the build running on a secondary machine/process before the presentation (or use a stored build). When compressing (6 minutes), rely on this screenshot or on a prebuilt build.
3. **`localStorage` is blocked** (private mode/storage full) — theme/locale will not persist across a reload, and the offline page will fall into the fallback to `navigator.language` (`src/app/offline/page.tsx:59`). At that point, describe the behavior instead of running it: "The expected behavior is persistence; here storage is blocked, so we will describe it." The attempts are wrapped in `try/catch` (e.g. `LocalePersist.tsx:9-11`) so the page does not break.
4. **DevTools offline does not activate** — explain the logic theoretically and show the ready screenshot for segment 6.
5. **The switcher/theme does not respond** — reload the page and try once; if it persists, move on to segment 4/6 and come back to it later. Do not stop.

**General rule:** for any step that does not run smoothly, switch to its theoretical presentation (internal evidence `file:line`) or a ready screenshot, and do not stop in front of the audience.

---

## Phrases to say (and not to say)

### Allowed to say — with evidence:
- The routing handles the language via URL state, and switching shows up in the address and the direction (evidence: `routing.ts`, `proxy.ts`, `layout.tsx:40`).
- The theme and locale persist across a reload (evidence: `ThemeToggle.tsx`, `LocalePersist.tsx`).
- The stories are sanitized before display via DOMPurify (evidence: `sanitize.ts`) and split into three sections (`story-sections.ts`).
- The project is a PWA in **production** (the SW works from a production build, not in dev) with rich caching strategies (evidence: `sw.js:40-164`).
- There is no server-side search, no search index, no API, and no database — there is only in-memory client-side filtering (`FeaturedStories.tsx`) — we present "content processing", not that.
- Hydration is safe thanks to the pattern (mounted gate + suppressHydrationWarning) and it is proven by tests (`theme-console-filter.test.ts`, `sanitize.test.ts`).

### Forbidden to say (no evidence / overclaim):
- ❌ "A fully secure system / fully secure" — we sanitize HTML but we do not test every attack; there is no comprehensive guarantee.
- ❌ "No hydration issues ever" — we prevent mismatch through the pattern and tests, but we do not promise absolutes.
- ❌ "Scales to millions of users" — there is no load testing/measurement; this is a false claim.
- ❌ "Instant server-side story search / indexed search" — do not claim full indexed or server-side search — there is only in-memory client-side filtering.
- ❌ "An API/route handler syncs a database" — **there is no API and no DB**; do not describe what does not exist.
- ❌ "Offline works in development" — only from a production build; do not describe the opposite.
- ❌ "A queryable content database" — the content is Markdown built at build time (SSG), not a live query.

---

## Self-check summary (the presenter's pre-show check)
- [ ] `pnpm install`, `pnpm test`, `pnpm lint`, `pnpm dev` all pass (segment 1).
- [ ] `pnpm build` then `pnpm start` are available for the PWA/offline run (segment 6).
- [ ] Every `file:line` mentioned has been reopened and confirmed in the source (review the segments above).
- [ ] The 11-minute timing and the compressed duration both add up (the two tables above).
- [ ] The ten Hydration points + the mismatch example + the safe pattern are present.
- [ ] Every code block has balanced opening and closing (matching triple backticks).

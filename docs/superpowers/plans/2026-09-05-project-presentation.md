# New Muslim Stories — Technical Presentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a bilingual (Arabic prose + English technical terms), 60-minute technical presentation package in `presentation/` that proves deep code understanding to a technical team.

**Architecture:** 4 self-contained deliverables: a single-file HTML deck, a live demo script, a team Q&A guide, and a package README. No application code changes and no new dependencies; verification reuses the project's existing `jsdom` dependency for HTML smoke tests.

**Tech Stack:** Vanilla HTML/CSS/JS deck (RTL, `lang="ar"`), Markdown documentation (gray-matter, remark, DOMPurify, next-themes, PWA concepts discussed), vitest/jsdom for verification.

**Spec:** `reusable-presentation-prompt.en.md` (at repo root) with these filled parameters:
- Project Name: New Muslim Stories
- Project Path: /media/islamux/Variety/JavaScriptProjects/new-muslim-stories
- Presentation Language: Bilingual — Arabic prose, English technical terms (SSG, Hydration, Route Handler, etc.)
- Duration: 60 minutes
- Audience: Technical team
- Output Folder: presentation/

## Global Constraints

- **Branch:** work on `presentation/project-presentation`; never touch `main`.
- **No application code changes and no new dependencies** (prompt rule 7). The package is documentation + presentation only, self-contained.
- **Every claim verified against source** with `path:line` before writing. Never fabricate a function, endpoint, config key, test, or feature. No fake code; snippets labeled "snippet" when incomplete.
- **RTL deck:** `lang="ar"` `dir="rtl"`; technical terms (SSG, Hydration, Route Handler, `useEffect`) stay in English.
- **No generic marketing claims** ("extremely fast", "fully secure"). State limitations and trade-offs explicitly.
- **Hydration explanation is mandatory** and must cover all 10 required points with the real project pattern (next-themes, `suppressHydrationWarning`, `useHasMounted`, mounted gate, `LocalePersist`).
- **Sequential verification:** `pnpm test` → `pnpm lint` → `pnpm build`, never parallel (typecheck reads `.next` files).
- **No commits or PR unless the user explicitly approves** (prompt rule 9) — commits are gated at the end.
- Report references use the verified facts in the exploration report (see Task 1); re-open every cited file to confirm the `path:line` before using it.

---

## 60-Minute Time Budget (scaled from the prompt's 45-min table)

| Section | Min | Slides |
|---|---|---|
| Opening (product + problem) | 5 | 4 |
| Thesis (governing idea) | 4 | 2 |
| Decisions journey | 7 | 4 |
| Mental model (data flow) | 4 | 1 |
| Product experience | 5 | 3 |
| Technical deep dive + Hydration | 14 | 10 |
| Live demo (fallback: 6) | 11 | divider |
| Trade-offs | 4 | 2 |
| Roadmap | 3 | 1 |
| Closing + Q&A | 3 | 1 |
| **Total** | **60** | **~32** |

---

## Verified Project Facts (from exploration — re-verify before use)

- **Stack:** `package.json:22` `next ^16.2.9`, `react ^19.2.7` (`package.json:25-26`), `next-intl ^4.13.0` (`:23`), `next-themes ^0.4.6` (`:24`), Tailwind v4 (`package.json:54`), vitest (`:58`).
- **Routing:** `src/i18n/routing.ts:3-9` locales `['en','ar']`, default `'en'`. `src/proxy.ts:1-15` is the Next 16 middleware (createMiddleware from next-intl). `next.config.mjs:1-3` wires next-intl plugin.
- **Layout:** `src/app/[locale]/layout.tsx:27-69` — sole HTML layout; `dir` set at `:40`, `suppressHydrationWarning` at `:43`, `<ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>` at `:45-50`.
- **Home:** `src/app/[locale]/page.tsx:40-50` server component, fetches stories, filters featured max 6 (`:47`), renders `HomePageClient`.
- **Story page:** `src/app/[locale]/stories/[slug]/page.tsx` — `dynamicParams=false` (`:7`), `generateStaticParams` all slugs (`:9-11`), prev/next (`:77-79`).
- **ZHydration pattern:**
  - `src/components/ThemeProvider.tsx:1-15` wrapper; dev-only `installThemeConsoleFilter()` at `:7-9`.
  - `src/lib/theme-console-filter.ts:1-18` monkey-patches `console.error` in dev to drop the React 19 script-tag warning; `:7-17` the patch.
  - `src/hooks/useHasMounted.ts:1-12` mount guard.
  - `src/components/ThemeToggle.tsx:48,50,57` mounted gate, disabled until mount.
  - `src/components/LocalePersist.tsx:5-15` writes locale to localStorage in an effect.
  - `src/app/offline/page.tsx:51-65` reads locale via `useSyncExternalStore` with server snapshot `'en'`.
- **Data pipeline:** `src/lib/story-parser.ts` — dir `src/stories` (`:9`), slug extract (`:14-17`,`:103-109`), `parseStoryFile` (`:74-91`) gray-matter→remark→`sanitizeHtmlServer` (`:88`), `normalizeStoryData` (`:25-51`), `validateFrontmatter` warn-never-throw (`:57-69`).
  - `src/lib/story-service.ts` — `getSortedStoriesData` (`:13-29`) allSettled + filter + sort by title (`:28`); `getStoryData` (`:34-46`); `getAllStorySlugs` (`:51-64`); `getFeaturedStories` (`:69-73`); `getStoriesByCountry` (`:78-82`); `getAllCountries` (`:87-92`). No pagination.
  - `src/lib/story-sections.ts:12-28` splits on h2/h3 into lifeBeforeIslam/momentOfGuidance/reflections.
  - `src/types/story.types.ts:4-21` StoryData shape; `Locale` at `:4`.
- **Sanitization:** `src/lib/sanitize.ts` — server-side via JSDOM (`:1-12`), allowlist 24 tags (`:17-43`), 7 attrs (`:44`), `ALLOW_DATA_ATTR:false` (`:45`).
- **Security headers:** `next.config.mjs:5-23` CSP + headers; `'unsafe-inline' 'unsafe-eval'` in script-src (`:7`).
- **PWA:** `public/sw.js` cache `new-muslim-stories-v0.1.0` (`:1`), precache list (`:5-11`), network-first nav (`:40-78`), stale-while-revalidate stories (`:80-122`), cache-first assets (`:124-164`), dead push/sync (`:167-232`). Registration `src/components/ServiceWorkerRegistration.tsx:5-37`. Install prompt `src/components/PWAInstall.tsx:20-119` (5s delay `:37`, localStorage dismiss `:27`). Offline page `src/app/offline/page.tsx` (own string table `:21-49`).
- **Tests:** `vitest.config.ts:1-16` jsdom, setup `src/test/setup.ts`. 5 test files: story-parser.test.ts (64), sanitize.test.ts (27), story-sections.test.ts (53), theme-console-filter.test.ts (51), Button.test.ts (28). `package.json:9` `"test": "vitest run"`. No component-render/E2E.
- **Numbers:** 138 story files = 69 en + 69 ar. 25 components (20 + 5 ui). 1 hook (`useHasMounted`). No API routes.
- **Known limitations:** hardcoded base URL `https://newmuslimstories.com` in 4-5 places; hardcoded timezone `'Asia/Aden'` (`src/i18n/request.ts:17`); no pagination; dead PWA push/sync; console monkey-patch; offline page bypasses next-intl; AGENTS.md drift.

---

## Task 0: Branch setup
- Create branch `presentation/project-presentation` (done), verify `git branch --show-current`.

## Task 1: Plan + fact verification
- Save this plan to `docs/superpowers/plans/2026-09-05-project-presentation.md` (done).
- Run `pnpm test` and record fresh output with pass counts (evidence for the deck and QA guide).
- Re-open and confirm each cited `path:line` in the fact table above before any deliverable uses it.
- Verification: fresh `pnpm test` output recorded in the ledger.

## Task 2: `presentation/slides.html`
Self-contained RTL deck, ~32 slides, visual identity from the product palette (`#0f5c3e` green, `#faf6ec` cream from `public/manifest.json`), signature element = the data path motif. Full slide map + features as specified in the chat plan (title→closing, mandatory hydration slides 20-24, dynamic slide numbering, keyboard nav, aria-labels, slide index, speaker notes, fullscreen, touch, prefers-reduced-motion, responsive, print styles). Snippets real and labeled with `file:line`.
- Verification: jsdom smoke test (existing dep) — parse the HTML, count slides, simulate keys, check index/notes/reduced-motion/aria-labels.

## Task 3: `presentation/demo-script.md`
11-minute numbered demo (fallback 6-min). 7 segments; preflight commands verified from `package.json`; each step: what to open, what to say, outside evidence → inside `file:line`. Fallback plan + "say / don't say" lists. Hydration deep-dive with mismatch + safe-pattern example.
- Verification: every command exists in `package.json`; every `file:line` re-opened; balanced code fences; no fabricated commands (note Linux/PWA requirements + alternatives).

## Task 4: `presentation/qa-guide.md`
~30 questions in Arabic grouped per the 9 prompt categories, each: 30-60s answer, `file:line` ref, trade-off, follow-up. Mandatory questions (SSR/CSR/Hydration, mismatches, useEffect timing, browser APIs in render, what was tested/not, claims not to make).
- Verification: question count 25-35; all refs verified; mandatory questions present.

## Task 5: `presentation/README.md`
Package usage order, keyboard shortcuts, pre-presentation checks, 60-min rehearsal checklist (timer run, slide-count, preflight commands, fallback test, projector aspect).
- Verification: checklist matches the 60-min table.

## Task 6: Full verification + final report
- Re-review every claim/path/number; check fence balance; check HTML/JS, slide count vs numbering, shortcuts; `git diff --check`; sequential `pnpm test` → `pnpm lint` → `pnpm build` (fresh results with numbers/status).
- Ask the user whether to commit (no commit without approval).

---

## Final Report
Report: files created + responsibility; key visual/organizational decisions; how Hydration + SSR/CSR mismatch were explained; verification commands + actual results; remaining warnings; branch name; confirmation no commit/PR was made.

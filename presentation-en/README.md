# Presentation Package — presentation-en/

This package is for a 60-minute technical presentation about the **New Muslim Stories** project (Next.js 16 · bilingual en/ar · SSG). It contains four files, detailed in the sections below. The narrative language here is English prose with English technical terms, consistent with the rest of the package.

---

## 1) Package components — the role of each file

| File | Responsibility |
|---|---|
| `README.md` | This file — the guide for running the presentation from scratch: what each file is, the order of use, how to open the slides, the real keyboard shortcuts, the environment requirements, and the preparation checklist. |
| `slides.html` | The self-contained presentation deck — 32 slides that open directly in the browser with no build and no server. It contains all the presentation content: the thesis, the decisions journey, the mental model, the technical deep dive, the live demo, the trade-offs, and the roadmap. |
| `demo-script.md` | The step-by-step live demo script — full duration ~11 minutes with a ~6-minute fallback plan. It depends on a **production build** (see the environment requirements section). |
| `qa-guide.md` | The Q&A team guide — 31 anticipated questions with suggested answers, for preparing for the Q&A session. |

---

## 2) Order of use

1. **Read `README.md`** — understand the package structure and its requirements first.
2. **Open `slides.html`** in the browser and browse through it to grasp the presentation narrative.
3. **Rehearse with `demo-script.md`** — run the live demo more than once with a timer.
4. **Prepare for questions with `qa-guide.md`** — review the suggested answers and match them to the relevant slide.

---

## 3) Opening/running the slides

`slides.html` is a **self-contained** file: all the styles (CSS) and the script (JS) are embedded in it, and its fonts come from the system (system font stack). Therefore:

- Open it directly in any modern browser (drag and drop or `file://`).
- **No build and no server required** — it works on its own in offline mode.
- It can be exported for printing/PDF via the browser menu (it has a forced `@media print` in the source) — useful as a backup copy.

---

## 4) Keyboard shortcuts and controls — exactly as in the source

Taken verbatim from `slides.html` (the `keydown` handler in the source script):

| Key | Function |
|---|---|
| `→` `ArrowRight` | Go to the next slide |
| `←` `ArrowLeft` | Go to the previous slide |
| `N` / `n` | Open/close the speaker notes panel (Speaker Notes) |
| `F` / `f` | Toggle fullscreen mode (fullscreen) |
| `A` / `a` | Open/close an overview of all slides (overview) |
| `Escape` | Close the overview if it is open; otherwise close the notes panel if it is open |

**On-screen controls** (a bar at the bottom of the screen):
- The "Prev" button (`#prevBtn`, aria-label "Previous slide") next to the "Next" button (`#nextBtn`, aria-label "Next slide").
- An "xx / 32" counter (`#count`) — computed dynamically from the number of `.slide` elements in the DOM.
- A fullscreen button (`#fullscreenBtn`, aria-label "Toggle fullscreen mode").
- A hint inside the bar: "Keys: ← → to navigate · N notes · F fullscreen · A overview".
- Close buttons: "Close (A)" for the overview (aria-label "Close overview"), and "×" for the notes (aria-label "Close notes").

**Touch:** a horizontal swipe (swipe) to navigate, with a 50px threshold. And because the page is `dir="ltr"` (the source `<html lang="en" dir="ltr">`), the directions are standard: swipe left → next, swipe right → previous (the source matches LTR logic).

---

## 5) Real environment requirements (explicit)

- **The live PWA / offline demo requires a production build.** The Service Worker registration (`ServiceWorkerRegistration.tsx`) is not gated by any conditional env, but `/sw.js` only provides a reliable offline/PWA experience from a production build. So, to try offline/installation you must first:
  ```
  pnpm install
  pnpm build
  pnpm start
  ```
  with the caveat that: `pnpm start` requires a prior build, and `node_modules` to be present.
- **Fonts:** system-based (system stack) — no network is needed to load fonts.
- **Tests/tools that actually exist** in `package.json`: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm test` (= `vitest run`, 5 files / 29 tests), `pnpm lint`, `pnpm format`, `pnpm format:check`.
- Every command mentioned above exists in `package.json` — nothing is invented.

---

## 6) Pre-presentation preparation checklist (60 minutes)

### a) A full run-through against the schedule
Run the full deck once with a timer and compare it against the time distribution table (it must **add up to 60**):

| Section | Slides | Minutes |
|---|---|---|
| Opening | 1-4 | 5 |
| Thesis | 5-6 | 4 |
| Decisions | 7-10 | 7 |
| Mental model | 11 | 4 |
| Product | 12-14 | 5 |
| Deep dive | 15-27 | 14 |
| Demo | 28 | 11 |
| Trade-offs | 29-30 | 4 |
| Roadmap | 31 | 3 |
| Closing | 32 | 3 |
| **Total** | — | **60** |

### b) Verify the slide count and indexing
- Make sure the counter displays "xx / 32" — the source computes `total` dynamically from the number of `.slide` elements (32 in the file).

### c) Preflight commands
Run them and confirm they pass before going on stage:
- `pnpm install`
- `pnpm test` (5 files / 29 tests)
- `pnpm lint`
- `pnpm dev`

### d) The fallback demo plan
- If no production build or suitable environment is available, prepare a condensed plan (the ~6-minute short script in `demo-script.md`) or rely on static screenshots of the UI.

### e) Test the slides themselves in the browser
Open `slides.html` and verify:
- Keyboard navigation (←/→),
- Fullscreen (F),
- The notes panel (N),
- The overview (A) and jumping across slides,
- Touch support (if presenting on a touch device).

### f) Presenting on a projector and printing
- Verify the print/PDF export and that the slides render intact on the projector: **aspect ratio**, no clipped text, and every slide clearly legible.

### g) A backup for the demo
- Prepare a backup (screenshots or a frozen build) because the live demo can be fragile (it depends on `pnpm build` + `pnpm start`).

---

## Reliability note

Every piece of information in this file is verifiable from the source: the shortcuts are taken from the `slides.html` code itself, the commands from `package.json`, and the schedule from the presentation specs. There are no unverifiable claims.

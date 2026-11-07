# Offline Fallback Route

## Overview
Standalone `/offline` page served by the service worker when navigation fails. It sits outside the `[locale]` segment, detects the persisted locale on the client, and renders bilingual offline guidance with a retry and a localized home link.

## Interface
- `OfflineLocale` — `'en' | 'ar'`. `[page.tsx:OfflineLocale]`
- `OfflineStrings` — shape of the bilingual copy. `[page.tsx:OfflineStrings]`
- `STRINGS` — English and Arabic copy, direction, and home paths. `[page.tsx:STRINGS]`
- `detectLocale()` — reads the persisted locale, then the browser language. `[page.tsx:detectLocale]`
- `emptySubscribe` — no-op subscription used by `useSyncExternalStore`. `[page.tsx:emptySubscribe]`
- `OfflinePage()` — default client component. `[page.tsx:OfflinePage]`
- `OfflineLayout({ children })` — root HTML/body wrapper for the offline route. `[layout.tsx:OfflineLayout]`
- `metadata` — title `Offline — New Muslim Stories`. `[layout.tsx:metadata]`

## Invariants
- Locale resolution order is: `localStorage['locale']` when exactly `'ar'` or `'en'`; otherwise `navigator.language` beginning with `ar`; otherwise `'en'`. `[page.tsx:detectLocale]`
- The server snapshot always returns `'en'`, avoiding hydration mismatch. `[page.tsx:OfflinePage]`
- `dir` is `'rtl'` for Arabic and `'ltr'` for English. `[page.tsx:STRINGS]`
- Retry reloads the current window; the home link points to `/en` or `/ar`. `[page.tsx:OfflinePage]`

## Side Effects
- Reads `localStorage` key `locale`. `[page.tsx:detectLocale]`
- Reads `navigator.language`. `[page.tsx:detectLocale]`
- Calls `window.location.reload()` on retry. `[page.tsx:OfflinePage]`
- Imports the shared `../globals.css` stylesheet. `[layout.tsx:OfflineLayout]`

## Verification
- Run: `pnpm test`

# Static Assets & Service Worker

## Overview
Publicly served assets for the PWA: manifest, icons, images, robots.txt, and the service worker that provides precaching, offline navigation, cache-first story/static responses, push notifications, and background sync.

## Interface
- `CACHE_NAME` — `'new-muslim-stories-v0.1.0'`. `[sw.js:CACHE_NAME]`
- `OFFLINE_URL` — `'/offline'`. `[sw.js:OFFLINE_URL]`
- `PRECACHE_URLS` — `['/', '/en', '/ar', '/offline', '/manifest.json']`. `[sw.js:PRECACHE_URLS]`
- `install` listener — precaches and activates the worker. `[sw.js:'install']`
- `activate` listener — deletes stale caches and claims clients. `[sw.js:'activate']`
- `fetch` listener — navigation, story, and static-asset strategies. `[sw.js:'fetch']`
- `push` listener — notification payload and actions. `[sw.js:'push']`
- `notificationclick` listener — focuses or opens a window. `[sw.js:'notificationclick']`
- `sync` listener — retries cached requests for `sync-stories`. `[sw.js:'sync']`

## Invariants
- Install precaches `PRECACHE_URLS` and calls `skipWaiting()`. `[sw.js:'install']`
- Activate removes every cache whose name differs from `CACHE_NAME` and calls `clients.claim()`. `[sw.js:'activate']`
- Navigation requests are network-first; on failure they fall back to the matching cache, then to `/offline` for HTML requests. `[sw.js:'fetch']`
- Requests containing `/stories/` or `stories` are cache-first with a background refresh; network failure returns a `503` response with `Content not available offline`. `[sw.js:'fetch']`
- Static asset requests (`.css`, `.js`, `.png`, `.jpg`, `.svg`, `.ico`, `/_next/`) are cache-first; missing images return an empty `204`. `[sw.js:'fetch']`
- Push notifications use `/icon-192x192.png` and the `explore`/`close` actions. `[sw.js:'push']`
- The `sync` handler only reacts to tag `sync-stories`. `[sw.js:'sync']`
- `public/sw.js` is excluded from ESLint by the repository flat config. `[../eslint.config.mjs:ignores]`

## Side Effects
- Reads, writes, and deletes Cache Storage entries. `[sw.js:'install']` `[sw.js:'activate']` `[sw.js:'fetch']`
- Performs network fetches for navigation, stories, static assets, and sync retries. `[sw.js:'fetch']` `[sw.js:'sync']`
- Displays notifications and focuses/opens windows. `[sw.js:'push']` `[sw.js:'notificationclick']`
- Intercepts fetch events for controlled pages. `[sw.js:'fetch']`

## Verification
- Run: `pnpm test`

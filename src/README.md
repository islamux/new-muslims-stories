# Application Source Root

## Overview
Application source root for the Next.js 16 App Router project. It exposes locale-aware navigation helpers and the `next-intl` proxy middleware, and groups the route tree, UI components, hooks, i18n configuration, core library, and shared types.

## Interface
- `Link`, `redirect`, `usePathname`, `useRouter` — navigation helpers created by `createNavigation(routing)`. `[navigation.ts:Link]`
- default middleware — `createMiddleware({ locales: ['en', 'ar'], defaultLocale: 'en' })`. `[proxy.ts:createMiddleware]`
- `config.matcher` — `['/((?!api|_next|.*\\..*).*)']`. `[proxy.ts:config]`
- Child: [`app/README.md`](./app/README.md) — App Router routes and metadata routes.
- Child: [`components/README.md`](./components/README.md) — React UI components.
- Child: [`hooks/README.md`](./hooks/README.md) — shared React hooks.
- Child: [`i18n/README.md`](./i18n/README.md) — `next-intl` routing and request configuration.
- Child: [`lib/README.md`](./lib/README.md) — core library and story repository.
- Child: [`types/README.md`](./types/README.md) — TypeScript contracts.
- Non-contract content: `stories/` (Markdown story files) and `test/` (Vitest setup).

## Invariants
- Navigation helpers are derived from the shared `routing` object. `[navigation.ts:Link]`
- The proxy supports exactly `en` and `ar`, defaulting to `en`. `[proxy.ts:createMiddleware]`
- The proxy matcher excludes `api`, `_next`, and any path containing a dot. `[proxy.ts:config]`

## Side Effects
- The proxy middleware intercepts matching requests before they reach route handlers. `[proxy.ts:createMiddleware]`
- `redirect` and `useRouter` perform locale-aware navigation. `[navigation.ts:redirect]`

## Verification
- Run: `pnpm test`

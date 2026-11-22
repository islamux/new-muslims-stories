# Localized App Shell

## Overview
Locale-aware App Router shell for English and Arabic. It validates the `[locale]` segment, configures `next-intl`, sets text direction, and composes the global providers, PWA install prompt, analytics, service-worker registration, and locale persistence around every page.

## Interface
- `LocaleLayoutProps` — `children` and a promise of `{ locale }`. `[layout.tsx:LocaleLayoutProps]`
- `generateStaticParams()` — maps `routing.locales` to `{ locale }` params. `[layout.tsx:generateStaticParams]`
- `LocaleLayout({ children, params })` — default async layout. `[layout.tsx:LocaleLayout]`
- Re-exported `metadata` and `viewport` from `@/lib/metadata`. `[layout.tsx:export { metadata, viewport }]`
- `Home({ params })` — localized homepage page component. `[page.tsx:Home]`
- `generateMetadata({ params })` — localized title, description, and canonical/alternate URLs. `[page.tsx:generateMetadata]`
- `Error({ reset })` — localized error boundary. `[error.tsx:Error]`
- `Loading()` — skeleton loading state. `[loading.tsx:Loading]`
- `NotFound()` — localized 404 page. `[not-found.tsx:NotFound]`
- Child: [`stories/README.md`](./stories/README.md) — story route group.

## Invariants
- An incoming locale that fails `hasLocale(routing.locales, locale)` calls `notFound()`. `[layout.tsx:LocaleLayout]`
- `dir` is `rtl` only when the locale is `ar`; all other locales use `ltr`. `[layout.tsx:LocaleLayout]`
- `generateStaticParams` prerenders exactly the locales declared in `routing.locales`. `[layout.tsx:generateStaticParams]`
- The homepage features only stories with `featured === true`, sliced to the first six. `[page.tsx:Home]`
- Unknown homepage locales fall back to the English `LOCALES.en` metadata. `[page.tsx:generateMetadata]`
- `Error` and `NotFound` are client components that read their copy through `useTranslations`. `[error.tsx:Error]` `[not-found.tsx:NotFound]`

## Side Effects
- Calls `setRequestLocale(locale)` in both the layout and the homepage. `[layout.tsx:LocaleLayout]` `[page.tsx:Home]`
- Loads messages and time zone with `getMessages()` and `getTimeZone()`. `[layout.tsx:LocaleLayout]`
- Renders `ThemeProvider`, `NextIntlClientProvider`, `PWAInstall`, `PlausibleAnalytics`, `ServiceWorkerRegistration`, and `LocalePersist`. `[layout.tsx:LocaleLayout]`
- Imports the shared `../globals.css` stylesheet. `[layout.tsx:LocaleLayout]`
- The error boundary invokes `reset()` when the retry button is pressed. `[error.tsx:Error]`

## Verification
- Run: `pnpm test`

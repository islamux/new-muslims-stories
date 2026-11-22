# React UI Components

## Overview
Client-side React components for the homepage, navigation, story presentation, theming, PWA installation, analytics, and locale persistence. Shared primitives live in the `ui` child package.

## Interface
- `Button` / `buttonVariants` — styled button and class-name helper. `[Button.tsx:Button]` `[Button.tsx:buttonVariants]`
- `FeaturedShowcase({ stories })` — curated featured grid. `[FeaturedShowcase.tsx:FeaturedShowcase]`
- `FeaturedStories({ stories })` — searchable, country-filtered story grid. `[FeaturedStories.tsx:FeaturedStories]`
- `Footer()` — site footer. `[Footer.tsx:Footer]`
- `HeroSection()` — homepage hero. `[HeroSection.tsx:HeroSection]`
- `HomePageClient({ stories, featuredStories })` — homepage composition. `[HomePageClient.tsx:HomePageClient]`
- `LanguageSwitcher()` — locale toggle. `[LanguageSwitcher.tsx:LanguageSwitcher]`
- `LocalePersist({ locale })` — persists the active locale. `[LocalePersist.tsx:LocalePersist]`
- `PlausibleAnalytics()` / `trackEvent()` — analytics loader and event helper. `[PlausibleAnalytics.tsx:PlausibleAnalytics]` `[PlausibleAnalytics.tsx:trackEvent]`
- `ProfileHeader({ story })` — story profile summary. `[ProfileHeader.tsx:ProfileHeader]`
- `PWAInstall()` — install prompt. `[PWAInstall.tsx:PWAInstall]`
- `ServiceWorkerRegistration()` — registers `/sw.js`. `[ServiceWorkerRegistration.tsx:ServiceWorkerRegistration]`
- `StoryCard({ story })` — story list card. `[StoryCard.tsx:StoryCard]`
- `StoryContentDisplay({ story, prev, next })` — story article and navigation. `[StoryContentDisplay.tsx:StoryContentDisplay]`
- `StoryOfTheDay({ story })` — daily story panel. `[StoryOfTheDay.tsx:StoryOfTheDay]`
- `ThemeProvider({ children, ...props })` — `next-themes` wrapper. `[ThemeProvider.tsx:ThemeProvider]`
- `ThemeToggle()` — light/dark toggle. `[ThemeToggle.tsx:ThemeToggle]`
- `TopNav()` — sticky navigation. `[TopNav.tsx:TopNav]`
- `WhatsNext()` — closing homepage section. `[WhatsNext.tsx:WhatsNext]`
- `WhoAreNewMuslims()` — introductory homepage section. `[WhoAreNewMuslims.tsx:WhoAreNewMuslims]`
- Child: [`ui/README.md`](./ui/README.md) — shared UI primitives.

## Invariants
- Every component in this directory is a client component (`'use client'`). `[Button.tsx:Button]` `[HomePageClient.tsx:HomePageClient]`
- `Button` defaults to `variant = 'primary'` and `size = 'md'`; supported variants are `primary`, `ghost`, and `link`, and sizes are `md` and `lg`. `[Button.tsx:Button]` `[../types/component.types.ts:ButtonVariant]`
- `HomePageClient` uses `useSyncExternalStore` with `stories[0]` as the server snapshot; the client rotates the daily story by `getDayOfYear() % stories.length`. `[HomePageClient.tsx:HomePageClient]` `[HomePageClient.tsx:getDayOfYear]`
- `FeaturedStories` derives sorted, unique non-empty countries and filters by title, first name, or country; an empty query returns all stories. `[FeaturedStories.tsx:FeaturedStories]`
- `PWAInstall` persists dismissal under `pwa-install-dismissed` and delays showing the prompt by 5000 ms. `[PWAInstall.tsx:PWAInstall]`
- `PlausibleAnalytics` loads and tracks only when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set. `[PlausibleAnalytics.tsx:PlausibleAnalytics]`
- `ThemeProvider` installs the console filter only in development. `[ThemeProvider.tsx:ThemeProvider]`
- `LocalePersist` writes the active locale to `localStorage['locale']`. `[LocalePersist.tsx:LocalePersist]`
- `StoryCard` truncates excerpts at 140 characters; `StoryOfTheDay` truncates at 220. `[StoryCard.tsx:StoryCard]` `[StoryOfTheDay.tsx:StoryOfTheDay]`
- `StoryContentDisplay` renders `story.contentHtml` through `dangerouslySetInnerHTML`; that HTML is sanitized upstream by the story parser. `[StoryContentDisplay.tsx:StoryContentDisplay]` `[../lib/story-parser.ts:parseStoryFile]`

## Side Effects
- Writes `localStorage` keys `locale` and `pwa-install-dismissed`. `[LocalePersist.tsx:LocalePersist]` `[PWAInstall.tsx:PWAInstall]`
- Registers the service worker at `/sw.js` with scope `/`. `[ServiceWorkerRegistration.tsx:ServiceWorkerRegistration]`
- Injects the Plausible script into `document.head` and sends `pageview` events. `[PlausibleAnalytics.tsx:loadPlausibleScript]` `[PlausibleAnalytics.tsx:PlausibleAnalytics]`
- Adds and removes `beforeinstallprompt`, `appinstalled`, and `keydown` window listeners, and calls `installPrompt.prompt()`. `[PWAInstall.tsx:PWAInstall]`
- `ThemeProvider` applies theme classes through `next-themes`. `[ThemeProvider.tsx:ThemeProvider]`
- `LanguageSwitcher` replaces the current route with the selected locale. `[LanguageSwitcher.tsx:LanguageSwitcher]`
- Story links navigate to `/stories/${slug}`. `[StoryCard.tsx:StoryCard]` `[StoryContentDisplay.tsx:StoryContentDisplay]`

## Verification
- Run: `pnpm test`

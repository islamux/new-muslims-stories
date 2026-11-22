# Type Definitions

## Overview
Central TypeScript contracts for story data and component props, re-exported through a single barrel.

## Interface
- `Locale` — `'en' | 'ar'`. `[story.types.ts:Locale]`
- `StoryData` — normalized story shape used by pages and components. `[story.types.ts:StoryData]`
- `StoryList` / `StoriesByLocale` — list and locale-map helpers. `[story.types.ts:StoryList]` `[story.types.ts:StoriesByLocale]`
- `WithClassName` / `WithId` — shared optional prop fragments. `[component.types.ts:WithClassName]` `[component.types.ts:WithId]`
- `ButtonVariant` / `ButtonSize` / `ButtonProps` — button contract. `[component.types.ts:ButtonProps]`
- `FeaturedStoriesProps`, `StoryCardProps`, `StoryNavEntry`, `StoryContentDisplayProps`, `SectionProps`, `HomePageClientProps`, `ProfileHeaderProps`, `StoryOfTheDayProps`, `StoryImageProps` — component prop contracts. `[component.types.ts:FeaturedStoriesProps]` `[component.types.ts:StoryContentDisplayProps]` `[component.types.ts:StoryImageProps]`
- Barrel exports. `[index.ts:export *]`

## Invariants
- `Locale` is exactly `'en' | 'ar'`. `[story.types.ts:Locale]`
- `StoryData` fields are required (non-optional) in the interface. `[story.types.ts:StoryData]`
- `index.ts` re-exports every story and component type. `[index.ts:export *]`

## Side Effects
- None; this directory contains type-only modules.

## Verification
- Run: `pnpm test`

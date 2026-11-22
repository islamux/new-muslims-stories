# UI Primitives

## Overview
Small presentational building blocks shared across the application: section wrapper, icon set, ornamental star/divider, and the Next.js image wrapper.

## Interface
- `Divider({ className })` — gilded hairline/star/hairline separator. `[Divider.tsx:Divider]`
- `IconProps` — `name: 'check' | 'close'` plus SVG props. `[Icon.tsx:IconProps]`
- `Icon({ name, className, ...props })` — renders the named SVG or `null`. `[Icon.tsx:Icon]`
- `Section` — `React.FC<SectionProps>` rendering `<section>`. `[Section.tsx:Section]`
- `StarProps` — `size?` and `filled?` plus SVG props. `[Star.tsx:StarProps]`
- `Star({ size, filled, ...props })` — eight-pointed khatam star. `[Star.tsx:Star]`
- `STAR_PATH` — shared star path geometry. `[Star.tsx:STAR_PATH]`
- `StoryImage({ src, alt, priority, sizes })` — `next/image` wrapper. `[StoryImage.tsx:StoryImage]`

## Invariants
- `Divider` is decorative: it sets `aria-hidden="true"` and renders a `Star` at size 18. `[Divider.tsx:Divider]`
- `Icon` is typed to only `check` and `close`; unknown runtime values return `null`. `[Icon.tsx:Icon]`
- `Star` defaults to `size = 24` and `filled = true`; it is `aria-hidden` unless an `aria-label` is supplied, in which case it renders `role="img"` and a `<title>`. `[Star.tsx:Star]`
- `StoryImage` uses `fill` + `object-cover`, defaults `sizes` to `'(max-width: 768px) 100vw, 50vw'`, and lazy-loads unless `priority` is true. `[StoryImage.tsx:StoryImage]`
- `Section` forwards `id` and `className` directly to the `<section>` element. `[Section.tsx:Section]`

## Side Effects
- `Icon` and `StoryImage` are client components (`'use client'`). `[Icon.tsx:Icon]` `[StoryImage.tsx:StoryImage]`
- `StoryImage` emits a browser image request through `next/image`. `[StoryImage.tsx:StoryImage]`

## Verification
- Run: `pnpm test`

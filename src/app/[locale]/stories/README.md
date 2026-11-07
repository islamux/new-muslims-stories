# Stories Route Group

## Overview
Grouping directory for the localized story routes. It contains no direct source files; the public interface of this subtree is the dynamic story detail route in `[slug]`.

## Subdirectories & Boundaries
- `[slug]`: [story detail contract](<./[slug]/README.md>) - Statically generated story page, metadata, and previous/next navigation. `[slug]/page.tsx` owns all route behavior.

## Invariants
- No source code files exist directly in this directory; every behavior is owned by `[slug]/page.tsx`. `[[slug]/page.tsx:StoryPage]`
- The only child route is the dynamic `[slug]` segment; there is no index page in this directory.

## Side Effects
- None directly; all repository reads and rendering side effects occur in `[slug]/page.tsx`. `[[slug]/page.tsx:StoryPage]`

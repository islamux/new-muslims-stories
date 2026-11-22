# Maintenance Scripts

## Overview
Node.js utilities for content auditing, image optimization, PWA icon generation, documentation index regeneration, and Markdown image-reference migration. Each script is run directly with `node` and operates on repository files.

## Interface
- `audit-ar-stories.mjs` — scans `src/stories/*-ar.md` for CJK, Cyrillic, and Latin residue; writes `docs/ar-translation-audit.md`; `--check` exits non-zero on blockers. `[audit-ar-stories.mjs:REPORT_OUT]` `[audit-ar-stories.mjs:--check]`
- `generate-icons.mjs` — renders the khatam star into four PNG icons under `public/`. `[generate-icons.mjs:TARGETS]`
- `optimize-images.mjs` — converts `public/images` and `public/images/stories` images to WebP and recompresses JPEGs. `[optimize-images.mjs:imageDirs]`
- `regenerate-doc-indexes.mjs` — regenerates `docs/muslim-names.md` and `docs/existing-muslims.md`; supports `--out` and `--stories-dir`. `[regenerate-doc-indexes.mjs:argValue]`
- `update-image-refs.mjs` — rewrites `.png`/`.jpg`/`.jpeg` image references in story Markdown to `.webp`. `[update-image-refs.mjs:exts]`

## Invariants
- `audit-ar-stories.mjs --check` blocks only CJK, Cyrillic, or title findings; Latin residue is informational. `[audit-ar-stories.mjs:--check]`
- `regenerate-doc-indexes.mjs` preserves the existing index file byte-for-byte when table rows are unchanged, including its date. `[regenerate-doc-indexes.mjs:rowsSlice]` `[regenerate-doc-indexes.mjs:writeIfChanged]`
- `regenerate-doc-indexes.mjs` derives names from `firstName`, then `author`, with the Arabic file as fallback. `[regenerate-doc-indexes.mjs:nameFromFrontmatter]`
- `optimize-images.mjs` caps width at 1200, uses WebP quality 80 and JPEG quality 85, and skips PNG recompression. `[optimize-images.mjs:maxWidth]` `[optimize-images.mjs:webpQuality]` `[optimize-images.mjs:jpegQuality]`
- `generate-icons.mjs` emits 512, 192, 180, and 32 pixel icons. `[generate-icons.mjs:TARGETS]`
- `update-image-refs.mjs` only rewrites `image:` and `profilePhoto:` values that match its extension patterns. `[update-image-refs.mjs:exts]`

## Side Effects
- Writes `docs/ar-translation-audit.md`. `[audit-ar-stories.mjs:REPORT_OUT]`
- Writes PNG icons to `public/`. `[generate-icons.mjs:TARGETS]`
- Writes WebP files and rewrites JPEG originals in `public/images*`. `[optimize-images.mjs:imageDirs]`
- Writes `docs/muslim-names.md` and `docs/existing-muslims.md`. `[regenerate-doc-indexes.mjs:writeIfChanged]`
- Rewrites story Markdown files in `src/stories`. `[update-image-refs.mjs:storiesDir]`
- Reads story Markdown and calls `process.exit(1)` on audit blockers. `[audit-ar-stories.mjs:--check]`

## Verification
- Run: `pnpm test`

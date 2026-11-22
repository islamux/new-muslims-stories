# Core Library

## Overview
Framework-agnostic helpers for fonts, site metadata, HTML sanitization, story parsing and sectioning, and the development-only theme console filter. The Markdown story repository lives in the `content` child package.

## Interface
- `fontUI`, `fontBody`, `fontDisplay`, `fontArabicUI` — `next/font/google` font instances. `[fonts.ts:fontUI]` `[fonts.ts:fontBody]` `[fonts.ts:fontDisplay]` `[fonts.ts:fontArabicUI]`
- `fontVariables` — combined CSS-variable class string. `[fonts.ts:fontVariables]`
- `metadata` / `viewport` — shared Next.js metadata and viewport exports. `[metadata.ts:metadata]` `[metadata.ts:viewport]`
- `sanitizeHtmlServer(html)` — server-side DOMPurify sanitizer. `[sanitize.ts:sanitizeHtmlServer]`
- `extractSlugAndLocale(fileName)` — filename to `{ slug, locale }`. `[story-parser.ts:extractSlugAndLocale]`
- `parseStoryFile(fileName, storiesDir)` — reads, validates, parses, and sanitizes one story. `[story-parser.ts:parseStoryFile]`
- `StorySections` / `getStorySections(contentHtml)` — ordered story sections. `[story-sections.ts:StorySections]` `[story-sections.ts:getStorySections]`
- `isThemeScriptWarning(args)` / `installThemeConsoleFilter()` — theme warning filter. `[theme-console-filter.ts:isThemeScriptWarning]` `[theme-console-filter.ts:installThemeConsoleFilter]`
- Child: [`content/README.md`](./content/README.md) — Markdown story repository.

## Invariants
- `fontVariables` concatenates the four font CSS variables. `[fonts.ts:fontVariables]`
- `metadataBase` is fixed to `https://newmuslimstories.com`, the manifest is `/manifest.json`, and the theme color is `#0F5C3E`. `[metadata.ts:metadata]` `[metadata.ts:viewport]`
- `sanitizeHtmlServer` allows a fixed tag/attribute allowlist, disables data attributes, and returns `''` after logging if sanitization throws. `[sanitize.ts:sanitizeHtmlServer]`
- Slug extraction removes `-ar.md` and then `.md`; locale is `ar` only when the filename ends in `-ar.md`. `[story-parser.ts:extractSlugAndLocale]`
- `parseStoryFile` throws on invalid frontmatter and applies defaults: `firstName` from `author`, `age` null, `country`/`previousReligion`/`profilePhoto`/`image`/`date` empty strings, and `featured` false. `[story-parser.ts:parseStoryFile]`
- `getStorySections` splits on `h2`/`h3`, maps the first two bodies to `lifeBeforeIslam` and `momentOfGuidance`, and joins the rest into `reflections`; missing headings yield empty strings. `[story-sections.ts:getStorySections]`
- `isThemeScriptWarning` matches only the exact theme script warning substring. `[theme-console-filter.ts:isThemeScriptWarning]`

## Side Effects
- `sanitizeHtmlServer` lazily creates and caches a JSDOM/DOMPurify instance. `[sanitize.ts:sanitizeHtmlServer]`
- `parseStoryFile` reads the Markdown file from disk. `[story-parser.ts:parseStoryFile]`
- `installThemeConsoleFilter` replaces `console.error` and returns a restore function. `[theme-console-filter.ts:installThemeConsoleFilter]`
- `next/font/google` loads the configured font families. `[fonts.ts:fontUI]`

## Verification
- Run: `pnpm test`

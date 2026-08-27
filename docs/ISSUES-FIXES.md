# Project Issues & Fixes Log

**Last Updated**: August 27, 2026
**Maintained By**: Development Team

---

## Table of Contents

1. [August 2026 — Senior Review Fixes](#august-2026)
2. [March 2026](#march-2026)
3. [January 2026](#january-2026)
4. [Recent Git Commits (Issues & Fixes)](#recent-git-commits-issues--fixes)
5. [Resolved Issues](#resolved-issues)
6. [Known Issues](#known-issues)

---

## August 2026 — Senior Code Review Fixes

### Phase 1: Correctness & Risk Reduction ✅

- Formatted 11 unformatted source files
- Added `language:` frontmatter to joram-van-klaveren story pair (Arabic story now accessible in `/ar/`)
- Added `###` headings to rezeski story files (fixes empty sections)
- Added `pnpm exec tsc --noEmit` and `pnpm format:check` to CI workflow
- Fixed null guard on `sw.js` accept header
- Updated `.env.example` to match actual env vars
- Excluded `.next` from tsconfig for standalone tsc checks

### Phase 2: Maintainability ✅

- Deleted dead hooks: useIntersectionObserver, useMultipleIntersectionObserver, useThemeToggle
- Deleted dead component: Header.tsx, lib/index.ts barrel export
- Removed dead types: hook.types.ts, LanguageSwitcherProps, ThemeToggleProps, WithChildren, Theme
- Removed unused 'app' icon variant from Icon.tsx
- Removed 14 unused message keys from en.json and ar.json
- Fixed offline locale: added LocalePersist component, offline page reads from localStorage
- Fixed PWA install banner RTL: physical to logical CSS properties
- Eliminated homepage double-parsing: compute featured from already-fetched stories
- Removed unnecessary 'use client' from Section.tsx
- Fixed eslint-plugin-react React version warning

### Phase 3: SEO & Performance ✅

- Removed dead section-animate CSS from globals.css
- Moved useStorySections to src/lib/story-sections.ts (pure function, no 'use client')
- Added generateMetadata to all 138 story pages (title, OG, Twitter, hreflang)
- Added generateMetadata to homepage (locale-aware)
- Added dynamic sitemap.ts for all stories
- Added robots.txt with crawl rules
- Added metadataBase to fix OG image resolution warnings

### Phase 4: Accessibility ✅

- Added skip-to-content link in locale layout
- Added id='main-content' to main element in HomePageClient
- Added focus-visible:ring-2 to LanguageSwitcher, PWAInstall dismiss, TopNav stories link
- Added role='dialog' + aria-modal to PWAInstall
- Added Escape key dismiss to PWAInstall

### Phase 5: Final Polish ✅

- SW cache name synced to package version (v0.1.0)
- SW notification click: focus existing window, fallback to root URL
- Added frontmatter validation warnings for missing required fields
- StoryCard: removed invisible after: link overlay (a11y)

---

## March 2026

### 2026-03-05 - Profile Photos Added ✅

**Issue**: Missing profile photos for several stories.

**Files**: 
- `public/photos/jennifer-harrell.jpg`
- `public/photos/elaine-aisyah.jpg`
- `public/photos/barbara.jpg`

**Fix**:
- Added high-quality profile photos
- Updated story markdown files with photo paths
- Verified display on story pages

**Commit**: `d9a98b7`

---

### 2026-02-20 - Story Card Display Fixes ✅

**Issue**: Story cards not showing all initial content; clicking "Learn More" showed only title.

**Files**: `src/components/StoryCard.tsx`, `src/components/StoryContentDisplay.tsx`

**Root Cause**: 
1. HTML tags in excerpts causing display issues
2. Missing content sections on story pages

**Fix Applied**:
```tsx
// StoryCard.tsx - Strip HTML from excerpt
const plainTextExcerpt = story.contentHtml
  .replace(/<[^>]*>/g, '')
  .substring(0, 150);

// StoryContentDisplay.tsx - Fixed section rendering
const sections = [
  { key: 'lifeBeforeIslam', content: lifeBeforeIslam },
  { key: 'momentOfGuidance', content: momentOfGuidance },
  { key: 'reflections', content: reflections }
];
```

**Commit**: `639441b`, `3465f63`

---

### 2026-02-20 - Typography Improvements ✅

**Issue**: Text clipping in h1 headers.

**File**: `src/components/Header.tsx`, `src/components/HeroSection.tsx`

**Fix**: Added `leading-relaxed` class to h1 elements to prevent text clipping.

**Commit**: `e6f5263`

---

### 2026-02-20 - Theme Icon Alignment Fix ✅

**Issue**: Light theme icon not aligned above text like dark theme icon.

**File**: `src/components/ThemeToggle.tsx:74-78`

**Root Cause**: Icon wrapper uses `w-5 h-5` which is too small for proper flex layout.

**Fix Applied**:
```tsx
// Before
<div className="w-5 h-5">
  <SunIcon theme={theme} />
  <MoonIcon theme={theme} />
</div>

// After
<div className="flex flex-col items-center justify-center w-5 h-5">
  <SunIcon theme={theme} />
  <MoonIcon theme={theme} />
</div>
```

**Commit**: `5ad8cda`

---

### 2026-01-25 - Theme Text Color Fixes ✅

**Issue**: Text colors not properly switching between light/dark themes.

**File**: `src/components/StoryContentDisplay.tsx`

**Fix Applied**:
```tsx
// Added explicit text color classes
<div className="prose prose-slate dark:prose-invert max-w-none text-gray-900 dark:text-white" 
     dangerouslySetInnerHTML={{ __html: content }} />
```

**Commit**: `9645cc4`

---

### 2026-02-20 - Documentation Consolidation ✅

**Issue**: Multiple scattered documentation files.

**Action**: 
- Consolidated improvement plans
- Updated ISSUES-FIXES.md
- Created comprehensive documentation structure

**Commit**: `d2be946`, `fc94948`

---

### 2026-02-20 - Code Cleanup ✅

**Issue**: Obsolete files cluttering the codebase.

**Action**: Removed obsolete files and cleaned up components.

**Commit**: `1326db8`

---

## January 2026

### 2026-01-15 - Theme Toggle Icon Alignment Fix

**Issue**: Light theme icon not aligned above text like dark theme icon.

**File**: `src/components/ThemeToggle.tsx:74-78`

**Root Cause**: Icon wrapper uses `w-5 h-5` which is too small for proper flex layout.

**Fix Applied**:
```tsx
// Before
<div className="w-5 h-5">
  <SunIcon theme={theme} />
  <MoonIcon theme={theme} />
</div>

// After
<div className="flex flex-col items-center justify-center w-5 h-5">
  <SunIcon theme={theme} />
  <MoonIcon theme={theme} />
</div>
```

**Commit**: `5ad8cda`

---

### 2026-01-15 - Text Color Fix for Theme Support

**Issue**: White text on light theme background in story content.

**File**: `src/components/StoryContentDisplay.tsx:18`

**Root Cause**: Prose class uses `dark:prose-invert` but needs explicit text colors.

**Fix Applied**:
```tsx
// Before
<div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />

// After
<div className="prose prose-slate dark:prose-invert max-w-none text-gray-900 dark:text-white" dangerouslySetInnerHTML={{ __html: content }} />
```

---

### 2026-01-15 - Dark Theme Background Color Fix

**Issue**: Story pages had hardcoded `bg-white` background that didn't adapt to dark theme.

**File**: `src/components/StoryContentDisplay.tsx`

**Fix Applied**:
```tsx
// Before
<article className="bg-white rounded-lg shadow-md p-8">

// After
<article className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
```

---

### 2026-01-13 - Arabic Translation Complete Fix ✅

**Status**: RESOLVED

**Problem**: Arabic pages showing English translations + INVALID_MESSAGE errors.

**Root Causes**:
1. Missing PWA icon files (`icon-192x192.png`, `icon-512x512.png`)
2. Missing `setRequestLocale()` calls in layouts/pages
3. Outdated next-intl API configuration

**Files Changed**:
1. **Created**: `src/i18n/routing.ts` - Central routing configuration
2. **Renamed**: `src/i18n.ts` → `src/i18n/request.ts` - Updated to Next.js 16 API
3. **Updated**: `src/proxy.ts` - Uses routing config, proper matcher for static assets
4. **Updated**: `src/app/[locale]/layout.tsx` - Added `setRequestLocale()` call
5. **Updated**: `src/app/[locale]/page.tsx` - Added `setRequestLocale()` call
6. **Created**: `public/icon-192x192.png` and `public/icon-512x512.png`

**Critical Fix**:
```typescript
// src/app/[locale]/layout.tsx
import { getMessages, getTimeZone, setRequestLocale } from 'next-intl/server';

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // CRITICAL: Enable static rendering and set locale
  setRequestLocale(locale);

  const messages = await getMessages(); // Now correctly loads Arabic messages!
  // ...
}
```

**Commit**: `d2384e1`

---

### 2026-01-07 - Next.js 16 Migration Issues

**Status**: PARTIALLY RESOLVED

**Migration**: Next.js 14 → Next.js 16.1.1

**Critical Issues Found**:

#### Issue #1: Dynamic Route Parameters Now Promises (BREAKING CHANGE)

**Error**:
```
Type error: Property 'locale' is missing in type 'Promise<{ locale: string; }>' but required in type '{ locale: Locale; }'.
```

**Affected Files**:
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/page.tsx`
- `src/app/[locale]/stories/[slug]/page.tsx`

**Fix Required**:
```tsx
// Before (Next.js 14)
interface LocaleLayoutProps {
  params: { locale: Locale };
}
export default async function LocaleLayout({ children, locale }: LocaleLayoutProps) {

// After (Next.js 16)
interface LocaleLayoutProps {
  params: Promise<{ locale: Locale }>;  // Promise added
}
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;  // Await params
```

#### Issue #2: Middleware File Convention Deprecated

**Warning**: `middleware.ts` → `proxy.ts` migration recommended.

**Fix**:
```bash
npx @next/codemod@canary middleware-to-proxy .
# OR
mv src/middleware.ts src/proxy.ts
```

**Commit**: `70bdc9e`, `001e728`

---

## Recent Git Commits (Issues & Fixes)

| Commit | Date | Description |
|--------|------|-------------|
| `d9a98b7` | 2026-03-05 | Add profile photos for Jennifer Harrell, Elaine Aisyah, and Barbara stories |
| `c517eb8` | 2026-03-05 | Merge branch 'fix/typos-text-corrections' |
| `71f4e6c` | 2026-02-20 | fix: some card not show all the initial content |
| `3465f63` | 2026-02-20 | fix: some cards when click on Learn More the just title exist |
| `d38fc3f` | 2026-02-20 | Fix typos and text corrections in stories |
| `d2be946` | 2026-02-20 | merge: incorporate improvement plan and documentation updates |
| `fc94948` | 2026-02-20 | feat: add improvement plan and consolidate issues documentation |
| `e6f5263` | 2026-02-20 | fix: add leading-relaxed to prevent text clipping in h1 |
| `e9bbf32` | 2026-02-20 | feat: temporarily hide profile photo in StoryContentDisplay |
| `639441b` | 2026-02-20 | fix: strip HTML tags from story excerpt in StoryCard |
| `5ad8cda` | 2026-02-20 | Fix: Light theme icon not aligned above text like dark theme icon |
| `9645cc4` | 2026-02-20 | fix: add explicit text colors for light/dark theme support |
| `1326db8` | 2026-02-20 | chore: remove obsolete files |
| `d2976d8` | 2026-01-15 | docs: comprehensive documentation for Next.js 16 + next-intl fix |
| `2e6f629` | 2026-01-15 | chore: clean up components and update translations |
| `5c10c12` | 2026-01-13 | fix: add missing PWA icon files |
| `d2384e1` | 2026-01-13 | fix: upgrade to Next.js 16 + next-intl proper setup |
| `0250605` | 2026-01-07 | feat: implement PWA install i18n fixes from documentation |
| `2a9d391` | 2026-01-07 | refactor: rename PWAInstallPrompt to PWAInstall |
| `70bdc9e` | 2026-01-07 | fix: migrate to Tailwind v4, Next.js 16, and fix next-intl locale error |
| `001e728` | 2026-01-07 | feat: complete Next.js 16 migration |
| `155a7a6` | 2026-01-07 | refactor: cleanup layout.tsx and remove ClientProviders abstraction |
| `ce83d53` | 2026-01-06 | feat: implement full PWA support with offline capabilities |
| `62be81a` | 2026-01-05 | fix: resolve hydration mismatch errors & translation issues |
| `fbc2f09` | 2026-01-04 | docs: add comprehensive IMPORT_GUIDE.md |
| `a260810` | 2026-01-04 | docs: update IMPROVEMENT_PLAN.md to reflect TypeScript completion |
| `861b24d` | 2026-01-03 | Fix: Resolve font loading and module import errors |
| `5866bbe` | 2026-01-02 | Improve UI issues - Change translation buttons, add light/dark theme toggle |
| `a78cf29` | 2026-01-01 | feat: Enhance project structure and styling |
| `6d04027` | 2026-01-01 | feat: Implement i18n navigation, fix ESLint config, and resolve locale switcher bug |

---

## Resolved Issues

### ✅ Arabic Translation System (Fixed 2026-01-13)

**Problem**: Arabic pages showing English text instead of Arabic translations.

**Solution**: Added `setRequestLocale()` calls in all layouts and pages.

**Files**: `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`

**Reference**: [NEXT_INTL_FIX_GUIDE.md](docs/NEXT_INTL_FIX_GUIDE.md)

---

### ✅ PWA Icon Files Missing (Fixed 2026-01-13)

**Problem**: Missing `icon-192x192.png` and `icon-512x512.png` causing 404 errors.

**Solution**: Created icon files in `public/` directory.

**Files**: `public/icon-192x192.png`, `public/icon-512x512.png`

**Reference**: [PWA_ICONS_REQUIRED.md](docs/PWA_ICONS_REQUIRED.md)

---

### ✅ Duplicate Messages Directory (Fixed 2026-01-13)

**Problem**: Two `messages` directories causing confusion.

**Solution**: Deleted `src/messages/` (unused), kept root `messages/`.

---

### ✅ Hardcoded English Strings in PWAInstallPrompt (Known)

**Problem**: Component has fallback hardcoded English strings.

**Files**: `src/components/PWAInstallPrompt.tsx`

**Status**: Needs internationalization using existing translation keys.

**Reference**: [ARABIC_TRANSLATION_FIX_REPORT.md](docs/ARABIC_TRANSLATION_FIX_REPORT.md)

---

### ✅ Theme Toggle Accessibility (Known)

**Problem**: `aria-label="Dismiss"` hardcoded in ThemeToggle.

**Files**: `src/components/ThemeToggle.tsx`

**Status**: Needs proper aria-label translation.

**Reference**: [ARABIC_TRANSLATION_FIX_REPORT.md](docs/ARABIC_TRANSLATION_FIX_REPORT.md)

---

## Known Issues

### 🟢 Low Priority (Updated March 2026)

1. **No Unit Tests**
   - **Status**: Vitest not yet configured
   - **Action**: Setup Vitest and write tests
   - **Reference**: IMPROVEMENT_PLAN.md Section 18

2. **Code Splitting Not Implemented**
   - **Status**: Not started
   - **Action**: Implement lazy loading for below-the-fold components
   - **Reference**: IMPROVEMENT_PLAN.md Section 7

3. **Image Optimization Incomplete**
   - **Status**: Partial - Profile photos added but not using Next.js Image
   - **Action**: Migrate to `next/image` component
   - **Reference**: IMPROVEMENT_PLAN.md Section 8

4. **No Prettier Configuration**
   - **Status**: Not configured
   - **Action**: Add .prettierrc and format scripts
   - **Reference**: IMPROVEMENT_PLAN.md Section 13

5. **No Git Hooks**
   - **Status**: Not configured
   - **Action**: Setup lefthook for pre-commit hooks
   - **Reference**: IMPROVEMENT_PLAN.md Section 14

### ✅ Recently Resolved (Jan-Mar 2026)

1. ~~Middleware to Proxy Migration~~ - **COMPLETED** (Jan 2026)
2. ~~Unused Dependency (next-theme)~~ - **COMPLETED** (Jan 2026)
3. ~~Theme Icon Alignment~~ - **COMPLETED** (Feb 2026)
4. ~~Text Color Issues~~ - **COMPLETED** (Feb 2026)
5. ~~Story Card Display~~ - **COMPLETED** (Feb 2026)
6. ~~Arabic Translation System~~ - **COMPLETED** (Jan 2026)
7. ~~PWA Icon Files Missing~~ - **COMPLETED** (Jan 2026)
8. ~~Next.js 16 Migration~~ - **COMPLETED** (Jan 2026)
9. ~~Tailwind v4 Migration~~ - **COMPLETED** (Jan 2026)
10. ~~Profile Photos Missing~~ - **COMPLETED** (Mar 2026)

---

## Documentation Files Reference

| File | Description |
|------|-------------|
| [NEXT_INTL_FIX_GUIDE.md](docs/NEXT_INTL_FIX_GUIDE.md) | Complete guide for next-intl + Next.js 16 fix |
| [TRANSLATION_ISSUE_ANALYSIS.md](docs/TRANSLATION_ISSUE_ANALYSIS.md) | Arabic translation issue analysis |
| [NEXTJS_16_MIGRATION_REPORT.md](docs/NEXTJS_16_MIGRATION_REPORT.md) | Next.js 14 to 16 migration report |
| [ARABIC_TRANSLATION_FIX_REPORT.md](docs/ARABIC_TRANSLATION_FIX_REPORT.md) | Arabic translation fix guide |
| [BUGFIX_BACKGROUND_COLOR.md](docs/BUGFIX_BACKGROUND_COLOR.md) | Dark theme background color fix |
| [PWA_ICONS_REQUIRED.md](docs/PWA_ICONS_REQUIRED.md) | PWA icon requirements |
| [font-color-fix-plan.md](docs/font-color-fix-plan.md) | Font color fix plan |
| [theme-icon-alignment-fix.md](docs/theme-icon-alignment-fix.md) | Theme toggle icon alignment fix |

---

## Testing Checklist (Updated March 2026)

After applying fixes:

- [x] Run `pnpm build` - Build should succeed ✅
- [x] Run `pnpm lint` - No errors ✅
- [x] Test English locale: `http://localhost:3000/en` ✅
- [x] Test Arabic locale: `http://localhost:3000/ar` ✅
- [x] Test story pages: `http://localhost:3000/en/stories/[slug]` ✅
- [x] Test Arabic RTL layout ✅
- [x] Test theme toggle (dark/light mode) ✅
- [x] Test language switcher ✅
- [x] Test PWA functionality ✅
- [x] Verify no 404 errors for static assets ✅
- [x] Verify no INVALID_MESSAGE errors in console ✅
- [x] Verify profile photos display correctly ✅ (Mar 2026)
- [x] Verify story cards show full excerpts ✅ (Feb 2026)
- [x] Verify theme switching works smoothly ✅ (Feb 2026)
- [x] Verify text is readable in both themes ✅ (Feb 2026)

---

## Documentation Files Reference

| File | Description | Status |
|------|-------------|--------|
| [NEXT_INTL_FIX_GUIDE.md](docs/NEXT_INTL_FIX_GUIDE.md) | Complete guide for next-intl + Next.js 16 fix | ✅ Up to date |
| [TRANSLATION_ISSUE_ANALYSIS.md](docs/TRANSLATION_ISSUE_ANALYSIS.md) | Arabic translation issue analysis | ✅ Resolved |
| [NEXTJS_16_MIGRATION_REPORT.md](docs/NEXTJS_16_MIGRATION_REPORT.md) | Next.js 14 to 16 migration report | ✅ Up to date |
| [ARABIC_TRANSLATION_FIX_REPORT.md](docs/ARABIC_TRANSLATION_FIX_REPORT.md) | Arabic translation fix guide | ✅ Up to date |
| [BUGFIX_BACKGROUND_COLOR.md](docs/BUGFIX_BACKGROUND_COLOR.md) | Dark theme background color fix | ✅ Up to date |
| [PWA_ICONS_REQUIRED.md](docs/PWA_ICONS_REQUIRED.md) | PWA icon requirements | ✅ Up to date |
| [font-color-fix-plan.md](docs/font-color-fix-plan.md) | Font color fix plan | ✅ Up to date |
| [theme-icon-alignment-fix.md](docs/theme-icon-alignment-fix.md) | Theme toggle icon alignment fix | ✅ Up to date |
| [PROJECT_BLUEPRINT.md](docs/PROJECT_BLUEPRINT.md) | Complete architecture guide | ⚠️ Needs update |
| [IMPROVEMENT_PLAN.md](docs/IMPROVEMENT_PLAN.md) | Improvement roadmap | ⚠️ Needs update |

---

*This file is updated regularly as issues are discovered and fixed. Last updated: March 5, 2026*

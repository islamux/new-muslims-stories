# New Muslim Stories

## 🧠 General Idea

This web application, built with Next.js and TypeScript, focuses on showcasing stories of new Muslims from around the world. The application aims to be a source of inspiration and an introduction to the experiences of these individuals and how they embraced Islam, along with brief information about their previous cultural and religious backgrounds. The goal is to convey powerful human and spiritual messages in a visually appealing and engaging manner.

## 🧱 Technical Requirements

*   **Framework:** Next.js (App Router) with TypeScript.
*   **Styling:** Tailwind CSS for the user interface.
*   **Responsiveness:** Fully responsive design for mobile, tablet, and desktop.
*   **Multilingual Support:** Internationalization (i18n) with support for at least English and Arabic.
*   **Content Storage:** Markdown or a CMS (e.g., Sanity.io or Contentful) for storing stories.

## 🎨 UI/UX Design

*   **Overall Aesthetic:** Attractive and modern interface with calm and spiritual touches.
*   **Homepage:**
    *   Elegant header with a welcoming phrase (e.g., "Stories of Guidance from Around the World").
    *   Featured Stories section displaying selected stories using animated cards.
    *   "Who are New Muslims?" section with introductory information.
*   **Individual Story Page:**
    *   Person's photo (if available), country, first name only (for privacy), and age.
    *   Brief background about their life before Islam.
    *   Details about the moment of conversion and reason for embracing Islam.
    *   Impactful quotes from them after embracing Islam.
*   **Visual Effects:**
    *   Scroll-triggered animations.
    *   Calm color gradients (colors like light green, beige, gold, sky blue).

## ✨ Features

✅ **Implemented**:
- Multi-language support (English/Arabic with full RTL)
- Markdown-based story content management (~69 stories × 2 languages)
- PWA with offline support, install prompt, and service worker
- Dark/Light theme toggle
- Optimized profile photos (WebP via next/image)
- Story filtering and search
- Story of the Day (auto-rotating featured story)
- "What's Next?" and "Who are New Muslims?" sections
- Responsive design (mobile, tablet, desktop)
- Static site generation (SSG)
- Plausible Analytics integration
- SEO: `generateMetadata` on all pages, dynamic `sitemap.xml`, `robots.txt`
- Accessibility: skip-to-content link, focus-visible indicators, ARIA labels
- Frontmatter validation with missing-field warnings
- Code splitting via `next/dynamic` on homepage sections
- Locale persistence for offline page detection

🚧 **Planned**:
- Storybook documentation
- Expanded unit/integration test coverage

## Getting Started

### Prerequisites

- **Node.js**: 18+ (LTS recommended)
- **Package Manager**: pnpm (v11.2.2+)

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Available Scripts

```bash
pnpm dev            # Start development server
pnpm build          # Build for production
pnpm start          # Start production server
pnpm test           # Run unit tests (Vitest)
pnpm lint           # Run ESLint
pnpm format         # Format code with Prettier
pnpm format:check   # Check formatting without modifying
```

### Project Structure

```
new-muslim-stories/
├── docs/                 # Documentation (plans, audits, guides)
├── messages/             # i18n translations (en.json, ar.json)
├── public/               # Static assets (photos, icons, manifest, sw.js)
├── scripts/              # Utility scripts (image optimization, etc.)
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── globals.css   # Global Tailwind styles
│   │   ├── robots.ts     # Dynamic robots.txt
│   │   ├── sitemap.ts    # Dynamic sitemap.xml
│   │   ├── [locale]/     # Dynamic locale routes (en/ar)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── error.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── stories/[slug]/page.tsx
│   │   └── offline/      # PWA offline fallback page
│   ├── components/       # React components
│   │   ├── ui/           # UI primitives (Section, Button, Icon, Star, etc.)
│   │   ├── Footer.tsx, TopNav.tsx
│   │   ├── LanguageSwitcher.tsx, ThemeToggle.tsx
│   │   ├── HeroSection.tsx, FeaturedStories.tsx, FeaturedShowcase.tsx
│   │   ├── StoryCard.tsx, StoryContentDisplay.tsx, ProfileHeader.tsx
│   │   ├── StoryOfTheDay.tsx, WhoAreNewMuslims.tsx, WhatsNext.tsx
│   │   ├── HomePageClient.tsx, PWAInstall.tsx, ServiceWorkerRegistration.tsx
│   │   ├── LocalePersist.tsx, PlausibleAnalytics.tsx
│   │   └── __tests__/Button.test.ts
│   ├── hooks/            # Custom React hooks
│   │   └── useHasMounted.ts
│   ├── lib/              # Core business logic & utilities
│   │   ├── fonts.ts, metadata.ts, sanitize.ts
│   │   ├── story-parser.ts, story-sections.ts, story-service.ts
│   │   └── __tests__/    # Unit tests
│   ├── stories/          # Markdown story files (~69 × 2 languages)
│   ├── i18n/             # Internationalization configuration
│   │   ├── routing.ts, request.ts
│   ├── types/            # TypeScript type definitions
│   └── proxy.ts          # i18n middleware (Next.js 16 proxy)
├── review-plan.md        # Senior code review plan and findings
├── AGENTS.md             # Agent guide with full project reference
├── next.config.mjs       # Next.js configuration
├── eslint.config.mjs     # ESLint flat config
└── tsconfig.json         # TypeScript configuration
```

## Internationalization (i18n)

This project supports English and Arabic with full RTL support using `next-intl`.

### Key i18n Files

- **`src/i18n/routing.ts`** - Central routing configuration
- **`src/i18n/request.ts`** - Request configuration for Next.js 16
- **`src/proxy.ts`** - Middleware for locale routing
- **`messages/en.json`** - English translations
- **`messages/ar.json`** - Arabic translations

### Important: Next.js 16 + next-intl Setup

**This project uses Next.js 16 which requires specific i18n setup:**

1. **`setRequestLocale()` must be called** in all layouts and pages before using `getMessages()` or `useTranslations()`

2. **File naming changes:**
   - `middleware.ts` → `proxy.ts` (Next.js 16 rename)
   - `i18n.ts` → `i18n/request.ts` (new API)

3. **Centralized routing config:**
   - All locale config is in `src/i18n/routing.ts`
   - Imported by `proxy.ts`, `navigation.ts`, and `request.ts`

### Adding New Translations

1. Add keys to both `messages/en.json` and `messages/ar.json`
2. Use in components: `const t = useTranslations('Namespace'); t('key')`

### Common Issues

**Arabic pages showing English?**
- Ensure `setRequestLocale(locale)` is called in `src/app/[locale]/layout.tsx`
- Check that `proxy.ts` excludes static assets: `matcher: ['/((?!api|_next|.*\\..*).*)']`

For detailed troubleshooting, see [`docs/NEXT_INTL_FIX_GUIDE.md`](docs/NEXT_INTL_FIX_GUIDE.md).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Next.js 16 features and API
- [React Documentation](https://react.dev/) - React 19 features
- [next-intl Documentation](https://next-intl.dev/docs) - Internationalization
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Tailwind v4

## Documentation

For detailed project documentation, see:

- [docs/](docs/) - Documentation directory (plans, audits, guides, tutorials)
- [PROJECT_MAP.md](PROJECT_MAP.md) - High-level project overview
- [AGENTS.md](AGENTS.md) - Agent guide with full project reference
- [CLAUDE.md](CLAUDE.md) - Agent instructions

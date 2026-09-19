# New Muslim Stories - Agent Guide

This repository hosts a Next.js 16 application for "New Muslim Stories", featuring internationalization (English/Arabic), Markdown-based content management, and a modern UI with Tailwind CSS v4.

**Branching:** Start each task on a fresh git branch before making changes. Use a lowercase kebab-case branch name with a descriptive prefix, such as `audit-production-audit` or `fix-arabic-translation`.

## 1. Build, Lint, and Test Commands

**Package Manager:** `pnpm` (v11.2.2)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the development server at `http://localhost:3000` |
| `pnpm build` | Build the application for production |
| `pnpm start` | Start the production server after building |
| `pnpm lint` | Run ESLint to check for code quality and errors |
| `pnpm format` | Format code with Prettier |

**Testing:**
- Tests are not yet configured in `package.json`.
- `@types/jest` is available as a dev dependency for type support.
- Run specific test once configured: `npx jest path/to/file.test.ts`.

## 2. Code Style & Guidelines

### Technology Stack
- **Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS v4
- **i18n:** `next-intl` v4 (en/ar) with `src/i18n/` routing and request config
- **Content:** Markdown files in `src/stories/` with YAML frontmatter (parsed via `gray-matter`, `remark`, `remark-html`)
- **PWA:** Service worker, web manifest, install prompt
- **Dark Mode:** `next-themes`
- **Animations:** CSS transitions and Tailwind animations

### Key Dependencies
- `next` ^16.0.10, `react` ^19.0.0, `react-dom` ^19.0.0
- `next-intl` ^4.1.0, `next-themes` ^0.4.6
- `gray-matter` ^4.0.3, `remark` ^15.0.1, `remark-html` ^16.0.1
- Fonts: `@fontsource/inter`, `@fontsource/montserrat`

### Formatting & Syntax
- **Indentation:** 2 spaces.
- **Semicolons:** Always use semicolons.
- **Quotes:** Single quotes `'` for JS/TS strings, double quotes `"` for JSX attributes.
- **Directives:** Use `'use client';` at the top of client-side components.

### Naming Conventions
- **Components:** PascalCase (e.g., `StoryCard.tsx`, `HeroSection.tsx`).
- **Files:** PascalCase for components, camelCase for utilities/hooks (e.g., `stories.ts`, `useScroll.ts`), kebab-case for config/scripts.
- **Interfaces:** PascalCase, often suffixed with `Props` for component props (e.g., `RootLayoutProps`, `ButtonProps`).
- **Variables/Functions:** camelCase.

### TypeScript & Types
- **Strict Mode:** Enabled. Avoid `any`.
- **Imports:** Use `import type` for type-only imports.
- **Props:** Define explicit interfaces for component props.
  ```typescript
  import type { ButtonProps } from '@/types/component.types';
  // or locally
  interface MyComponentProps { ... }
  ```
- **Path Aliases:** Use `@/` to refer to `src/` (e.g., `import X from '@/components/X'`).

### Component Structure
- Use functional components.
- Destructure props in the function signature.
- Keep components small and focused. Extract logic to hooks or utility functions if complex.
- **i18n:** Use `next-intl` hooks (`useTranslations`) for UI text.
  ```typescript
  import { useTranslations } from 'next-intl';
  const t = useTranslations('HomePage');
  // Usage: {t('title')}
  ```
- **Server Component Pattern:** Any `page.tsx` is always a server component. It fetches data/imports server-only functions and passes them as props to a client component which handles interactivity and UI rendering.

### CSS & Styling
- Use Tailwind CSS utility classes (v4 with `@tailwindcss/postcss`).
- Support RTL (Right-to-Left) layouts using logical properties or `rtl:` modifiers where necessary, though usually handled by `dir="rtl"` layout.
- Dark mode is supported via `next-themes`.

### Error Handling
- Use React Error Boundaries for UI recovery.
- For async operations/API calls, use `try/catch` blocks.
- Log errors meaningfully (console.error in dev, monitoring service in prod).

### File Organization
- `src/app/[locale]`: Locale-aware routes and pages (dynamic `[locale]` segment).
- `src/app/[locale]/stories/[slug]`: Individual story pages.
- `src/app/offline`: Offline/PWA fallback page.
- `src/components`: Reusable UI components (includes `ui/` subdirectory).
- `src/hooks`: Custom React hooks (e.g., `useIntersectionObserver`, `useStorySections`).
- `src/i18n`: i18n configuration (`request.ts`, `routing.ts`).
- `src/lib`: Utilities and data fetching (e.g., story parsing).
- `src/stories`: Markdown content files (en + ar pairs, ~69 stories x 2 languages).
- `src/types`: TypeScript type definitions (`story.types.ts`, `component.types.ts`, `hook.types.ts`).
- `messages`: Translation JSON files (`en.json`, `ar.json`).
- `public`: Static assets, PWA icons, `manifest.json`, `sw.js`.
- `docs`: Project documentation, plans, blueprints, and tutorials.

### Content Management (Adding a New Muslim)

- **Before adding a new Muslim story, ALWAYS read `docs/existing-muslims.md`** — it indexes every Muslim already in `src/stories/` (slug, EN/AR names, country, previous religion). Check it for duplicates (match by name AND country) before creating any new story file.
- **After adding, editing, or removing a story**, update `docs/existing-muslims.md` (add/edit/remove the matching row) so the index stays in sync.
- Keep story frontmatter consistent: `firstName`/`author`, `country`, `previousReligion`, `language`, and an `-ar` counterpart for every English story (and vice versa).
- Do NOT place non-story `.md` files inside `src/stories/` — the story parser reads every `.md` there (`getStoryFileNames`) and would break.

### GitHub Flow

```
1. git add <files>
2. git commit -m "<message>"
3. git push -u origin <current-branch>
4. Create PR (gh pr create)
5. Accept/merge PR (do NOT delete branch)
6. git checkout main && git pull
```

## 3. Agent & Prompt Configurations

- **Speckit Agents:** `~/.github/agents/` — 9 agent definitions (analyze, checklist, clarify, constitution, implement, plan, specify, tasks, tasks-to-issues).
- **Speckit Prompts:** `~/.github/prompts/` — matching prompt templates for each agent.

## 4. Cursor & Copilot Rules

- **Cursor:** No specific `.cursorrules` found.
- **Copilot:** No specific `.github/copilot-instructions.md` found.

---
*Updated May 2026 based on repository analysis.*

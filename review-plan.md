# Senior Code Review and Architecture Audit

## Role and Objective

You are a senior software architect and experienced Next.js/TypeScript engineer.

Review the existing **New Muslim Stories** repository as it currently exists. Your goal is to identify concrete defects, maintainability problems, architectural weaknesses, security risks, performance concerns, documentation drift, and missing validation.

Do not rewrite the project. Do not modify files. Do not add dependencies. Do not apply refactoring during the review.

Every finding must be tied to the current codebase with file and line references.

The goal is to make the existing project simpler, safer, easier to understand, easier to test, and easier to extend without introducing unnecessary architecture.

---

## Current Project Context

Treat this section as initial context only. Verify it against the repository before drawing conclusions.

- Framework: Next.js 16 with the App Router.
- UI: React 19 and TypeScript.
- Styling: Tailwind CSS v4.
- Internationalization: `next-intl` with English (`en`) and Arabic (`ar`).
- Testing: Vitest with JSDOM and Node environments.
- Deployment target: Vercel.
- Content: Markdown files in `src/stories/`, with English and Arabic story variants.
- Content parsing: `gray-matter`, `remark`, and `remark-html`.
- HTML rendering: sanitized content rendered through `dangerouslySetInnerHTML`.
- Main application routes: `src/app/[locale]/`.
- Offline route: `src/app/offline/`.
- PWA assets and service worker: `public/`.
- Story logic: `src/lib/story-parser.ts` and `src/lib/story-service.ts`.
- UI components: `src/components/`.
- Client hooks: `src/hooks/`.
- Locale configuration: `src/i18n/`, `src/proxy.ts`, and `src/navigation.ts`.
- Translations: `messages/en.json` and `messages/ar.json`.
- Validation and maintenance scripts: `scripts/`.
- CI workflow: `.github/workflows/ci.yml`.

The project is primarily a static, file-based content application. Do not assume that databases, authentication, authorization, API routes, payments, or background services exist. Mark those areas as not applicable unless the source code proves otherwise.

Do not fact-check the religious or historical content itself unless explicitly requested. Review content structure, metadata integrity, rendering safety, localization, and privacy-related exposure.

---

## Review Constraints

- Review the current source, not an imagined architecture.
- Do not modify source files, content, configuration, dependencies, generated files, or documentation.
- Do not rename files during the review.
- Do not report an issue only because a different architecture would be preferred.
- Do not report a theoretical security issue without explaining the actual attack path or operational risk.
- Do not report a performance issue without identifying the likely workload or measurable consequence.
- Do not report a missing test unless the missing coverage creates a concrete regression risk.
- Do not force every SOLID principle onto code where it is not applicable.
- Do not report a design-pattern violation merely because a pattern is absent.
- Do not recommend a design pattern unless it solves an observed problem.
- Do not recommend a complete rewrite unless the current system cannot reasonably be improved incrementally.
- Do not invent findings to fill a category or a Top 10 list.
- If no issue exists in a category, state that explicitly.
- If evidence is incomplete, label the conclusion as unverified instead of presenting it as fact.

---

## Phase 1: Establish the Current State

Before making recommendations:

1. Read `AGENTS.md`, `CLAUDE.md`, `README.md`, and relevant documentation.
2. Inspect `package.json`, `tsconfig.json`, ESLint configuration, Vitest configuration, Next.js configuration, and CI workflows.
3. Record the current branch, commit, and working-tree state.
4. Identify generated directories and exclude them from source review.
5. Inspect the complete source structure.
6. Identify all application routes and route-level states.
7. Trace the main homepage data flow.
8. Trace the individual story-page data flow.
9. Trace the Markdown parsing, normalization, sanitization, and HTML rendering pipeline.
10. Trace locale selection, translation loading, RTL handling, and locale-aware navigation.
11. Trace service-worker registration, caching, offline behavior, and PWA installation.
12. Inspect existing tests and determine which production paths they cover.

Treat the current source, current package scripts, current tests, and current CI configuration as authoritative.

Historical documents may contain outdated findings. In particular, verify claims in documents such as:

- `docs/production-audit-report.md`
- `docs/SENIOR_INTERVIEW_QUESTIONS.md`
- `docs/NEXTJS_16_MIGRATION_REPORT.md`
- `docs/PROJECT_BLUEPRINT.md`
- `README.md`
- `CLAUDE.md`

If documentation conflicts with the current source, report the conflict as documentation drift. Do not copy old findings without rechecking them.

---

## Phase 2: Validation

Run non-mutating validation commands when dependencies and the environment allow:

```bash
pnpm test
pnpm lint
pnpm build
pnpm exec tsc --noEmit
pnpm format:check
```

For each command, record:

- Whether it was run.
- Whether it passed or failed.
- The relevant error or warning.
- Whether the result affects the review.

Do not run commands that modify the working tree unless explicitly requested. This includes:

```bash
pnpm format
pnpm optimize-images
pnpm update-image-refs
pnpm generate-icons
```

Inspect `scripts/audit-ar-stories.mjs` before running it because audit commands may write reports or modify files.

Do not treat a successful exit code as proof that the application is correct. Inspect warnings, build output, and relevant runtime behavior.

---

## Phase 3: Architecture and Data-Flow Review

Describe the current architecture before criticizing it.

Assess whether the current architecture is appropriate for the project's size and purpose.

Review:

- App Router route organization.
- Locale route boundaries.
- Server and client component boundaries.
- The relationship between pages, components, hooks, and library code.
- The role of `StoryService`.
- The role of `story-parser.ts`.
- The Markdown-to-HTML content pipeline.
- Translation and locale configuration boundaries.
- PWA and service-worker ownership.
- Build-time versus runtime work.
- Dependency direction.
- Coupling between UI components and story data.
- Whether shared utilities are cohesive.
- Whether the folder structure reflects actual responsibilities.
- Whether the architecture is under-engineered, over-engineered, or appropriately simple.

Do not recommend Clean Architecture, Hexagonal Architecture, DDD, CQRS, repositories, dependency-injection containers, or similar patterns automatically.

If suggesting a structural change, explain:

1. The current problem.
2. The proposed change.
3. Why the change is worth its additional complexity.
4. Which files or boundaries would be affected.
5. How the change would be validated.

---

## Review Areas

### 1. Correctness and Reliability

Inspect:

- Locale validation and fallback behavior.
- Root, locale, story, offline, loading, error, and not-found routes.
- Static parameter generation.
- Invalid locale and invalid slug behavior.
- English and Arabic story slug pairing.
- Missing or duplicate story files.
- Story ordering and previous/next navigation.
- Empty story collections.
- Story-of-the-day selection.
- Malformed Markdown and malformed frontmatter.
- Missing, invalid, or incorrectly typed metadata.
- Missing headings or content sections.
- Filesystem errors and partial content failures.
- Error messages and error propagation.
- Silent failure or accidental content loss.
- Assumptions about deployment-time filesystem access.

### 2. Content Pipeline and Data Integrity

Trace the full path:

```text
Markdown file
-> frontmatter parsing
-> metadata normalization
-> Markdown conversion
-> HTML sanitization
-> StoryData
-> page/component rendering
```

Inspect:

- Frontmatter validation.
- Required and optional fields.
- Type coercion and default values.
- Locale metadata consistency.
- Filename-derived locale versus frontmatter locale.
- Story-pair completeness.
- Date and age handling.
- Image and profile-photo fields.
- Empty or malformed content.
- Duplicate slugs.
- Whether invalid content is rejected, skipped, or silently corrupted.
- Whether parser and service responsibilities are clearly separated.
- Whether content errors are diagnosable.

### 3. Next.js and Rendering Architecture

Inspect:

- Server components versus client components.
- Unnecessary client boundaries.
- Hydration behavior.
- Loading and error states.
- Static rendering and build-time behavior.
- Dynamic imports and whether they provide a real benefit.
- Metadata generation.
- Sitemap and robots behavior.
- Image configuration and image loading.
- Route-level caching and repeated work.
- Use of framework conventions appropriate to the installed Next.js version.
- Whether framework assumptions are based on an older Next.js version.

Do not report `src/proxy.ts` as incorrect merely because older Next.js versions used `middleware.ts`. Verify the convention for the installed Next.js version before making a finding.

### 4. Internationalization and RTL

Inspect:

- `src/i18n/routing.ts`.
- `src/i18n/request.ts`.
- `src/proxy.ts`.
- `src/navigation.ts`.
- Locale route layouts and pages.
- Translation key parity between `messages/en.json` and `messages/ar.json`.
- Missing, unused, or hardcoded user-facing strings.
- Arabic content and interface direction.
- Physical CSS properties that break RTL layouts.
- Locale-aware links and redirects.
- Offline-page language handling.
- Manifest and PWA locale behavior.
- Locale-specific metadata and canonical URLs.
- Whether fallback behavior is explicit and correct.

### 5. Security and Privacy

Inspect security issues that are relevant to the actual application:

- Markdown HTML sanitization.
- `dangerouslySetInnerHTML` sinks.
- Allowed HTML tags and attributes.
- URL protocols allowed in links and images.
- Remote image handling.
- Content injection through story files.
- Path traversal or unsafe filename handling.
- Content Security Policy correctness.
- Environment-variable exposure.
- Analytics configuration.
- Sensitive information included in client bundles or metadata.
- Personal information exposed through story fields.
- Unsafe redirects.
- Service-worker scope and cache behavior.
- Dependency vulnerabilities if a supported audit command is available.

For each security finding, explain:

- The attacker or failure source.
- The affected input or endpoint.
- Whether exploitation is currently reachable.
- The likely impact.
- The practical mitigation.

Do not classify a risk as Critical only because it could become dangerous after a future CMS migration.

### 6. Performance

Inspect likely or measurable bottlenecks:

- Repeated parsing of the full story corpus.
- Repeated sorting or filtering.
- Build-time filesystem and Markdown work.
- Unnecessary client-side JavaScript.
- Hydration and client rendering costs.
- Dynamic imports.
- Large images and image sizing.
- Font loading.
- Service-worker cache behavior.
- Unnecessary network requests.
- Expensive work in render paths.
- Memory leaks or incorrectly managed observers.
- Large dependencies that are actually imported.

Separate:

- Confirmed performance measurements.
- Build-output evidence.
- Static code risks.
- Concerns requiring profiling.

Do not use unsupported claims such as "fast," "slow," or "production-ready" without evidence.

### 7. PWA and Offline Behavior

Inspect:

- Service-worker registration.
- Installation and activation lifecycle.
- Cache naming and invalidation.
- Precached routes.
- Navigation fallback behavior.
- Story-page caching.
- Static asset matching.
- Stale content behavior.
- Offline route localization.
- Manifest correctness.
- Service-worker update behavior.
- Notification and background-sync scaffolding.
- Whether unused PWA features create maintenance or reliability risks.

### 8. Accessibility and UI Reliability

Inspect:

- Semantic HTML.
- Form labels and accessible names.
- Keyboard navigation.
- Focus management.
- Button and link behavior.
- Heading hierarchy.
- Color contrast.
- Motion and reduced-motion handling.
- Loading and empty states.
- Error states.
- Image alternative text.
- RTL interaction and layout.
- Mobile and desktop overflow.
- Whether client-only behavior causes blank or misleading content.

Keep this review tied to concrete user impact. Do not turn it into a subjective visual redesign.

### 9. Clean Code and Design Principles

Review:

- Naming.
- Function and component size.
- Module responsibility.
- Cohesion and coupling.
- Duplication.
- Conditional complexity.
- Hidden side effects.
- Error handling consistency.
- Magic values.
- Unused code and unused dependencies.
- Inconsistent conventions.
- Excessive comments.
- Premature abstractions.
- Overly broad utility modules.
- Unclear ownership of state.
- Composition versus inheritance.
- Law of Demeter violations.
- DRY, KISS, YAGNI, and separation of concerns.

Do not label ordinary React composition as an SRP violation without explaining the actual maintenance cost.

### 10. Testing, CI, Scripts, and Documentation

Inspect:

- Existing Vitest coverage.
- Parser and sanitizer test quality.
- Hook and component tests.
- Missing tests around high-risk behavior.
- Route and static-generation validation.
- i18n validation.
- PWA validation.
- Metadata and content-integrity validation.
- TypeScript validation in CI.
- Formatting validation in CI.
- Arabic-story audit behavior.
- Whether maintenance scripts are safe and deterministic.
- Whether package scripts match documented commands.
- Documentation accuracy.
- Stale paths, versions, commands, and architectural claims.

A test gap is significant only when the untested behavior has a realistic regression risk.

---

## SOLID Assessment

Assess SOLID only where it applies.

Use this table:

| Principle | Rating | Evidence and Explanation |
|---|---|---|
| SRP | Excellent / Good / Needs Improvement / Poor / Not Applicable | Concrete modules or components |
| OCP | Excellent / Good / Needs Improvement / Poor / Not Applicable | Extension and change pressure |
| LSP | Excellent / Good / Needs Improvement / Poor / Not Applicable | Inheritance or substitutability evidence |
| ISP | Excellent / Good / Needs Improvement / Poor / Not Applicable | Interface or contract evidence |
| DIP | Excellent / Good / Needs Improvement / Poor / Not Applicable | Dependency-direction evidence |

Do not downgrade the project simply because it does not use interfaces, inheritance, dependency injection, or polymorphism.

For LSP and ISP, use `Not Applicable` when the codebase has no meaningful inheritance hierarchy or oversized interface contracts.

---

## Evidence and Finding Rules

Do not report a finding without concrete evidence.

Each finding must include:

### Finding

A concise description of the problem.

### Location

Specific file paths and line ranges.

### Confidence

One of:

- Confirmed
- Likely
- Needs Verification

### Evidence

What the source, command output, or runtime behavior demonstrates.

### Impact

The practical effect on users, maintainers, reliability, security, performance, or delivery.

### Principle or Category

Examples:

- Correctness
- Security
- Reliability
- SRP
- OCP
- DRY
- KISS
- Separation of Concerns
- Tight Coupling
- Accessibility
- Documentation Drift

### Recommendation

The smallest practical improvement that addresses the root cause.

### Validation

How the improvement should be tested or verified.

### Complexity

One of:

- Small
- Medium
- Large

Avoid reporting the same root cause repeatedly under different categories. Group related symptoms into one finding when appropriate.

---

## Severity Definitions

### Critical

A currently reachable issue that causes a serious security compromise, major data corruption, application-wide outage, or failure of a core user journey.

Do not use Critical for theoretical future risks or stale documentation claims.

### High

A likely and significant security, correctness, reliability, build, or user-facing problem with meaningful impact.

### Medium

A concrete defect affecting an edge case, maintainability, testability, content integrity, accessibility, or performance, but with limited scope or practical workarounds.

### Low

A localized cleanup, minor inconsistency, documentation issue, optional improvement, or low-impact maintainability concern.

---

## Required Final Report

# Executive Summary

Include:

- What the application does.
- Current architecture in one paragraph.
- Main strengths.
- Main weaknesses.
- Overall maintainability assessment.
- Validation commands run and their results.
- Important limitations or unverified areas.

Do not provide a numerical score unless it is supported by a clear and repeatable basis.

# Current Architecture and Data Flow

Describe:

- Route structure.
- Story-loading and parsing flow.
- Server/client boundaries.
- i18n flow.
- PWA flow.
- Testing and CI boundaries.
- Dependency direction.
- Whether the architecture is appropriate for the current project.

# Critical Issues

List confirmed Critical findings first.

If none exist, write:

```text
No confirmed Critical issues found.
```

# High Priority Issues

List confirmed High findings.

# Medium Priority Issues

List confirmed Medium findings.

# Low Priority Issues

List Low findings and optional improvements.

For every finding, use the evidence format defined above.

# Security Assessment

Summarize:

- Confirmed vulnerabilities.
- Reachable attack paths.
- Content and HTML risks.
- Environment and configuration risks.
- Privacy concerns.
- Remaining unverified security areas.

# Performance Assessment

Separate:

- Measured findings.
- Build-output findings.
- Static code risks.
- Concerns requiring profiling.

# SOLID Assessment

Include the SOLID table and explain any non-applicable principles.

# Clean Code Assessment

Assess:

- Naming.
- Readability.
- Function and component size.
- Module responsibility.
- Duplication.
- Complexity.
- Error handling.
- Consistency.
- Coupling and cohesion.
- Unused code.

# Testing, CI, and Documentation Assessment

Explain:

- What is tested.
- What high-risk behavior is untested.
- Which validation commands CI runs.
- Which useful checks are missing.
- Which documentation is inaccurate or stale.
- Whether documentation drift creates operational risk.

# Highest-Value Improvements

List no more than ten real improvements. If fewer than ten are justified, list fewer.

For each improvement include:

1. Description.
2. Affected files or modules.
3. Root problem addressed.
4. Expected benefit.
5. Complexity.
6. Validation approach.
7. Whether it is required or optional.

# Recommended Refactoring Roadmap

## Phase 1: Correctness and Risk Reduction

Include only fixes for:

- Confirmed bugs.
- Reachable security problems.
- Broken content or locale behavior.
- Build or deployment failures.
- Serious reliability problems.

## Phase 2: High-Value Maintainability

Include improvements to:

- Module boundaries.
- Testability.
- Content validation.
- Error diagnosis.
- Client/server separation.
- CI confidence.
- Documentation accuracy.

## Phase 3: Optional Architectural Improvements

Include this phase only if the evidence shows that the current structure will materially limit expected growth.

Do not add this phase merely to introduce a recognized architecture pattern.

For every roadmap item, explain:

- Current problem.
- Proposed change.
- Why the complexity is justified.
- Dependencies.
- Risk.
- Validation.

# Assumptions and Open Questions

List:

- Unverified runtime behavior.
- Missing deployment information.
- Assumptions about content authorship.
- Assumptions about expected traffic or story growth.
- Areas not applicable to this repository.

---

## Final Rules

- Be opinionated, but remain evidence-based.
- Prefer source references over general advice.
- Distinguish current defects from future risks.
- Distinguish source problems from documentation drift.
- Do not treat old audit reports as current truth.
- Do not repeat stale findings without verification.
- Do not force SOLID ratings where principles are not applicable.
- Do not recommend abstractions with only one implementation unless there is a clear reason.
- Do not recommend a rewrite without overwhelming evidence.
- Do not modify the repository during the review.
- End with the highest-value, smallest practical next steps.

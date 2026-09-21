# Static Export (dual-mode) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `pnpm build:static` producing `out/` for Hostinger, while `pnpm build` (Vercel) stays 100% unchanged.

**Architecture:** Gate `output: 'export'` behind `STATIC_EXPORT=true` env var in `next.config.mjs`; add an `.htaccess` (copied into `out/`) that restores security headers, redirects `/` → `/en/`, and wires the 404 page — things the static host must do since there is no Next server.

**Tech Stack:** Next.js 16 App Router, next-intl v4, pnpm, Apache/LiteSpeed `.htaccess` (Hostinger).

**Spec:** Compatibility audit performed 2026-09-21 (findings inlined in tasks).

## Global Constraints

- `pnpm build` (no env var) MUST remain byte-for-byte equivalent in behavior: server output in `.next/`, `headers()` active, image optimization active.
- Static mode MUST be opt-in only via `STATIC_EXPORT=true`.
- `out/` is generated output; never commit it.
- Security headers defined in `next.config.mjs` (CSP + 4 others) MUST be reproduced in `.htaccess` for the static host.
- Hostinger is Apache/LiteSpeed with `.htaccess` support.

## Review Focus

- Requesting `/` on the static host: no `index.html` is emitted for `/` (no middleware in export) — a reasonable person expects a redirect to a locale, not a 404.
- Requesting a missing story URL: expects a themed 404, not the host default or a crash.
- Loading a story image: with `unoptimized: true` the raw asset path must resolve — a broken `src` is silent.
- Security headers: CSP/XFO/Referrer-Policy must still be present on the static host, matching server mode.
- Deep-link refresh on `/en/stories/<slug>/`: directory-style serving must resolve without a rewrite.

---

### Task 1: Env-gated config in `next.config.mjs`

**Files:**
- Modify: `next.config.mjs:25-39`

**Interfaces:**
- Produces: `STATIC_EXPORT=true` build emits `out/`; unset build emits `.next/`.

- [ ] **Step 1: Apply the env-gated config**

```js
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    ...(isStaticExport && { unoptimized: true }),
  },
  ...(isStaticExport && { output: 'export', trailingSlash: true }),
  ...(!isStaticExport && {
    async headers() {
      return [{ source: '/(.*)', headers: securityHeaders }];
    },
  }),
};
```

- [ ] **Step 2: Verify server mode unchanged (regression)**

Run: `pnpm build`
Expected: build succeeds; `.next/` produced; no `out/` produced.

- [ ] **Step 3: Verify static mode produces `out/`**

Run: `STATIC_EXPORT=true pnpm build`
Expected: build succeeds; `out/` produced containing `en/`, `ar/`, `offline/`, `sitemap.xml`, `robots.txt`, `sw.js`, `manifest.json`.

- [ ] **Step 4: Commit**

```bash
git add next.config.mjs
git commit -m "feat: gate static export behind STATIC_EXPORT env var"
```

### Task 2: `build:static` script

**Files:**
- Modify: `package.json` scripts

**Interfaces:**
- Consumes: Task 1's `STATIC_EXPORT` gate.
- Produces: `pnpm build:static` → `out/` with `.htaccess` copied in (Task 3 creates the source file).

- [ ] **Step 1: Add the script (placeholder copy for now)**

```json
"build:static": "STATIC_EXPORT=true next build"
```

- [ ] **Step 2: Verify**

Run: `pnpm build:static`
Expected: exit 0; `out/` exists.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add build:static script"
```

### Task 3: Hostinger `.htaccess`

**Files:**
- Create: `scripts/static-host/.htaccess`
- Modify: `package.json` (append copy step to `build:static`)

**Interfaces:**
- Consumes: `out/` from Task 2.
- Produces: `out/.htaccess` after `pnpm build:static`.

- [ ] **Step 1: Determine the generated 404 path**

Run: `find out -name '404.html'`
Expected: at least one path; record it. Fallback if none: use `/offline/`.

- [ ] **Step 2: Create `scripts/static-host/.htaccess`**

```apache
RedirectMatch 302 ^/$ /en/
ErrorDocument 404 /en/404.html

<IfModule mod_headers.c>
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), interest-cohort=()"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
</IfModule>

<IfModule mod_headers.c>
<Location "/_next/static/">
Header set Cache-Control "public, max-age=31536000, immutable"
</Location>
</IfModule>
```

- [ ] **Step 3: Wire the copy into `build:static`**

```json
"build:static": "STATIC_EXPORT=true next build && cp scripts/static-host/.htaccess out/.htaccess"
```

- [ ] **Step 4: Verify**

Run: `pnpm build:static && test -f out/.htaccess && echo OK`
Expected: `OK`.

- [ ] **Step 5: Commit**

```bash
git add scripts/static-host/.htaccess package.json
git commit -m "feat: add Hostinger .htaccess for static export"
```

### Task 4: Verification & ship

- [ ] **Step 1: Lint + unit tests**

Run: `pnpm lint && pnpm test`
Expected: both pass.

- [ ] **Step 2: Server-mode regression**

Run: `pnpm build`
Expected: `.next/` produced.

- [ ] **Step 3: Static build + local serve smoke test**

Run: `pnpm build:static && npx serve out`
Expected: `/en/`, `/ar/`, one story per locale, `/offline/` all render; story image loads; `sw.js` and `manifest.json` reachable.

- [ ] **Step 4: Count story pages**

Run: `find out -path '*/stories/*/index.html' | wc -l`
Expected: 2 × number of stories.

- [ ] **Step 5: Commit, push, PR**

```bash
git push -u origin feat-static-export
gh pr create --title "feat: static export for Hostinger" --body "Env-gated static export (STATIC_EXPORT=true) producing out/ with Hostinger .htaccess. Server/Vercel build unchanged."
```

**Known follow-ups (out of scope):** sitemap URLs lack trailing slashes (SEO nit); `pnpm start` does not apply in static mode by design.

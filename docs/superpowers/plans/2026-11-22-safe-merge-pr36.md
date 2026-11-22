# Safe Merge of PR #36 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Safely update PR #36's branch from `main`, resolve its two generated-doc conflicts, verify, and merge without losing batch-3 or batch-4 content.

**Architecture:** Merge `origin/main` into `content-batch3-stories`, keep `main`'s side of the two generated index files, then rebuild those files from all story frontmatter with the repo's regeneration script. Verify locally (lint, vitest, build), push, confirm GitHub CI and mergeability, merge with a merge commit, and refresh local `main`.

**Tech Stack:** Git + GitHub CLI (`gh`), Node script `scripts/regenerate-doc-indexes.mjs` (gray-matter), pnpm scripts `lint` / `test` (vitest) / `build` (Next.js 16).

**Spec:** `docs/superpowers/specs/2026-11-22-safe-merge-pr36-design.md`

## Global Constraints

- Generated files `docs/existing-muslims.md` and `docs/muslim-names.md` must never be hand-edited; only `node scripts/regenerate-doc-indexes.mjs` may rewrite them.
- Update strategy is **merge `main` into the PR branch**, never rebase.
- Expected final index total is **106 Muslims** (101 on `main` + 5 from PR #36).
- All 7 names must be present after regeneration: Mahershala Ali, Hamza Yusuf, Wayne Parnell, Martin Lings, Susan Carland, Suhaib Webb, Ingrid Mattson.
- PR #36 and the `content-batch3-stories` branch must remain; do not close or delete either.
- Verification must pass before merge: `pnpm lint`, `pnpm test`, `pnpm build`.

## Review Focus

1. Taking the wrong side of the index conflicts (ours = PR branch, theirs = `main`) would silently drop batch-4 rows → pinned in Task 2 by checking out `--theirs` and asserting 106 plus all seven names.
2. Hand-edited indexes or leftover conflict markers would corrupt generated docs → pinned in Task 2 by running the regeneration script and grepping for `<<<<<<<` / `=======` / `>>>>>>>`.
3. Story files or portraits being dropped during conflict handling → pinned in Task 2 by counting the 14 batch-3/batch-4 story files and 6 portraits tracked after resolution.
4. CI failing or the PR remaining conflicting after push → pinned in Task 3 by `gh pr checks 36 --watch` and `mergeable: MERGEABLE` / `mergeStateStatus: CLEAN`.
5. Local `main` not refreshed, or the PR branch deleted after merge → pinned in Task 4 by checking `origin/main` has 106 stories and `content-batch3-stories` still exists locally.

---

## Task 1: Check out the PR branch

**Files:** None (git state only).

**Interfaces:**
- Consumes: clean working tree on `plan-safe-merge-pr36`.
- Produces: clean working tree on local branch `content-batch3-stories`, based on `origin/content-batch3-stories`.

- [ ] **Step 1: Refresh remote refs and confirm a clean tree**

Run:
```bash
git fetch origin --prune && git status --short && git rev-parse --verify origin/main && git rev-parse --verify origin/content-batch3-stories
```
Expected: `git status --short` prints nothing; both rev-parse commands print SHA-1s.

- [ ] **Step 2: Create the local PR branch**

Run:
```bash
git checkout -b content-batch3-stories origin/content-batch3-stories
```
Expected: `Switched to a new branch 'content-batch3-stories'`.

- [ ] **Step 3: Confirm the PR baseline**

Run:
```bash
git log --oneline -3 && git status --short
```
Expected: tip is `100d56a content: add Batch 3 stories (Ali, Carland, Yusuf, Parnell, Lings)`; status is empty.

## Task 2: Merge `main` and resolve only the generated docs

**Files:**
- Modify: `docs/existing-muslims.md`
- Modify: `docs/muslim-names.md`

**Interfaces:**
- Consumes: clean `content-batch3-stories` from Task 1; `origin/main` at 101 stories.
- Produces: a merge commit on `content-batch3-stories` whose generated indexes report 106 Muslims and contain all seven new names.

- [ ] **Step 1: Merge `main` into the PR branch**

Run:
```bash
git merge origin/main --no-edit
```
Expected: conflicts in exactly `docs/existing-muslims.md` and `docs/muslim-names.md`; merge is in progress. If any other file conflicts, stop and re-plan.

- [ ] **Step 2: Take `main`'s versions of the two generated files**

`ours` is `content-batch3-stories`; `theirs` is `origin/main`. Run:
```bash
git checkout --theirs -- docs/existing-muslims.md docs/muslim-names.md && git add docs/existing-muslims.md docs/muslim-names.md
```
Expected: no output; both files staged with `main`'s content (101-story rows).

- [ ] **Step 3: Rebuild the indexes from all story frontmatter**

Run:
```bash
node scripts/regenerate-doc-indexes.mjs
```
Expected output line: `regenerate-doc-indexes: 106 Muslims — muslim-names.md updated, existing-muslims.md updated`.

- [ ] **Step 4: Assert content and absence of conflicts/markers**

Run:
```bash
grep '^_Total Muslims' docs/existing-muslims.md
grep -iE 'Mahershala Ali|Hamza Yusuf|Wayne Parnell|Martin Lings|Susan Carland|Suhaib Webb|Ingrid Mattson' docs/muslim-names.md
git diff --name-only --diff-filter=U
git ls-files src/stories | grep -cE '(mahershala-ali|hamza-yusuf|wayne-parnell|martin-lings|susan-carland|suhaib-webb|ingrid-mattson)'
git ls-files public/images/stories | grep -cE '(mahershala-ali|hamza-yusuf|martin-lings|wayne-parnell|suhaib-webb|ingrid-mattson)\.webp'
! grep -nE '^(<<<<<<<|=======|>>>>>>>)' docs/existing-muslims.md docs/muslim-names.md
```
Expected: `_Total Muslims: 106`; exactly 7 matching names; no unmerged paths; story count `14`; portrait count `6`; no conflict-marker lines.

- [ ] **Step 5: Commit the merge**

Run:
```bash
git commit --no-edit && git status --short
```
Expected: merge commit created; status is empty.

## Task 3: Verify, push, and confirm GitHub is ready

**Files:** None (verification only).

**Interfaces:**
- Consumes: merge commit from Task 2.
- Produces: updated `origin/content-batch3-stories` and PR #36 reported as mergeable with green checks.

- [ ] **Step 1: Lint**

Run: `pnpm lint`
Expected: exit code 0, no errors.

- [ ] **Step 2: Test**

Run: `pnpm test`
Expected: all vitest tests pass (baseline 49/49).

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: exit code 0; Next.js build completes and prerenders story routes.

- [ ] **Step 4: Push the updated branch**

Run: `git push origin content-batch3-stories`
Expected: push succeeds; PR #36 is updated.

- [ ] **Step 5: Wait for CI and check mergeability**

Run:
```bash
gh pr checks 36 --watch
gh pr view 36 --json mergeable,mergeStateStatus
```
Expected: all checks pass; JSON shows `"mergeable":"MERGEABLE"` and `"mergeStateStatus":"CLEAN"`.

## Task 4: Merge and finish

**Files:** None (git state only).

**Interfaces:**
- Consumes: green, mergeable PR #36 from Task 3.
- Produces: PR #36 merged into `main`; local `main` refreshed; `content-batch3-stories` preserved.

- [ ] **Step 1: Merge PR #36 with a merge commit**

Run: `gh pr merge 36 --merge`
Expected: PR merges successfully (without `--delete-branch`).

- [ ] **Step 2: Confirm the merge**

Run:
```bash
gh pr view 36 --json state,mergedAt
gh pr list --state open
```
Expected: `"state":"MERGED"` with a timestamp; no open PRs listed.

- [ ] **Step 3: Refresh local `main`**

Run:
```bash
git checkout main && git pull --ff-only
```
Expected: fast-forward to the merge commit.

- [ ] **Step 4: Verify `main` and branch preservation**

Run:
```bash
git ls-tree -r --name-only origin/main src/stories | grep -cE '(mahershala-ali|hamza-yusuf|wayne-parnell|martin-lings|susan-carland)'
git show origin/main:docs/existing-muslims.md | grep '^_Total Muslims'
git branch --list content-batch3-stories
```
Expected: `10` batch-3 story files on `main`; `_Total Muslims: 106`; the local branch is still listed.

- [ ] **Step 5: Note documentation branch**

The design and this plan live on `plan-safe-merge-pr36` and are intentionally not part of PR #36. If they should be on `main`, open a separate docs PR later; take no action in this task.

## Commit habit

Commit after each task's verification step. Task 2 produces the only content commit (the merge commit); Tasks 1, 3, and 4 are state/verification steps with no code changes to commit.

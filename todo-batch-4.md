# TODO - Batch 4 (two new Muslims)

Started 2026-11-07 on branch `content-batch4-stories` from `main` (99 story pairs).
Owner approved the candidate pair: **Suhaib Webb + Ingrid Mattson**.

## Stories (2 pilots)

Done (pilot, approved by owner):
- [x] suhaib-webb-story (.md + -ar.md), conversion 1992, United States, Christianity
- [x] ingrid-mattson-story (.md + -ar.md), conversion 1987, Canada, Agnosticism

## Candidate screening

| Candidate | Country | Previous religion | Verdict |
| --- | --- | --- | --- |
| Suhaib Webb | United States | Christianity (Church of Christ) | ACCEPTED |
| Ingrid Mattson | Canada | Agnosticism (raised Catholic) | ACCEPTED |
| Anthony Mundine | Australia | Christianity | Shortlisted, not selected (public record polarising) |
| André Carson | United States | — | DROPPED (no accessible source pinning conversion year or previous religion) |

Duplicate checks performed against `docs/existing-muslims.md`, `docs/muslim-names.md`, and the open Batch 3 PR #36
(Hamza Yusuf, Mahershala Ali, Martin Lings, Susan Carland, Wayne Parnell). No name-and-country match.
`alexander-russell-webb-story` is a different person (19th-century American diplomat).

## Notes / deviations

- Mattson's shortlist row said "Christianity"; sources (Christian Science Monitor 2001, Wikipedia) show she was
  raised Catholic but left the church at 16 and did not believe, so `previousReligion` is `Agnosticism`
  (`اللاأدرية` in Arabic). Narrative still records the Catholic upbringing.
- Images added after owner approval:
  - `suhaib-webb.webp` — ICNA, via YouTube, CC BY 3.0. Resized to 832×800 and converted to WebP.
  - `ingrid-mattson.webp` — Festival of Faiths, via Flickr, CC BY 2.0. Resized to 648×864 and converted to WebP.
  - Both licences require attribution; because the site has no credit field/UI, each story body ends with a
    small italic credit line (EN + AR) linking the source and licence and noting the resize/format change.
- `age` omitted for both: birth dates are known but exact conversion dates are not, so age at conversion is uncertain.

## Docs / Verify / Ship

- [x] Owner reviewed and approved the two pilots for style and tone
- [x] `node scripts/regenerate-doc-indexes.mjs`; `_Total Muslims: 101_`, additions only
- [x] Slug-pairing check: 100 EN + 100 AR `-story` files (+ joram pair = 101 stories)
- [x] `pnpm lint` clean
- [x] `pnpm test` 49/49 passing
- [x] `pnpm build` passing (210 static pages)
- [x] Commit, push `content-batch4-stories`, open PR #38
- [ ] Owner merges PR #38 (never delete branch)
- [ ] Run global finish-work skill: gates in order, owner confirmation before merge

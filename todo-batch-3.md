# TODO — Batch 3 (`content-batch3-stories`)

Process: `docs/workflow-add-new-muslims.md`. Batch 2 record: `todo.md` (do not delete).

## Step 0 — State check

- [x] `docs/existing-muslims.md` read: 99 existing (98 `*-story.md` pairs + `joram-van-klaveren` pair)
- [x] EN/AR pair count equal, no orphans
- [x] Branch `content-batch3-stories` created from `main` (`1670aa6`)

## Step 1 — Candidates + duplicate check (owner approved all 5)

| Candidate | Country | Previous religion | Verdict |
|-----------|---------|-------------------|---------|
| Mahershala Ali | United States | Christianity | accepted |
| Hamza Yusuf (Mark Hanson) | United States | Christianity (Greek Orthodox) | accepted |
| Wayne Parnell | South Africa | Christianity | accepted |
| Martin Lings (Abu Bakr Siraj ad-Din) | United Kingdom | Protestant | accepted |
| Susan Carland | Australia (new country in roster) | Christianity (Baptist / Uniting) | accepted |

Dropped at dedupe (already in the 99, matched by name AND country):

- [x] nicolas-anelka → duplicate
- [x] franck-ribery → duplicate
- [x] mike-tyson → duplicate
- [x] sonny-bill-williams → duplicate
- [x] hamza-story cross-check → unrelated anonymous man named Hamza, not Hamza Yusuf

## Stories (2 pilots + 3 remaining)

Pilots (approved):

- [x] mahershala-ali-story (.md + -ar.md) + image
- [x] susan-carland-story (.md + -ar.md) — NO IMAGE (no public portrait), no `date`

Batch (after pilot approval):

- [x] hamza-yusuf-story (.md + -ar.md) + image (no `age`: birth month unknown)
- [x] wayne-parnell-story (.md + -ar.md) + image (age 21)
- [x] martin-lings-story (.md + -ar.md) + image (age 29)

## Images

- [x] `public/images/stories/mahershala-ali.webp` (Commons portrait, TIFF 2026; 10 MB JPEG → 182 KB WebP)
- [x] `public/images/stories/hamza-yusuf.webp` (Commons portrait, 2025; 663 KB PNG → 43 KB)
- [x] `public/images/stories/wayne-parnell.webp` (Commons, 2010; 980 KB JPEG → 95 KB)
- [x] `public/images/stories/martin-lings.webp` (Commons `Lings1.jpg`, 1948; 1 MB → 312 KB)
- [x] intermediate `.png`/`.jpg` sources removed (repo keeps WebP only)
- [x] susan-carland omits `image`/`profilePhoto` (parser-safe, Batch 2 precedent)

## Sources (verified, per story)

- Mahershala Ali — Wikipedia "Early life and education" + "Personal life"; Guardian 21 Feb 2017 ("not a shock" quote); conversion 2000, Gilmore → Ali, Ahmadi 2001
- Susan Carland — Wikipedia "Early life and education" / "Career" / "Personal life"; converted to Sunni Islam at 19 in her first year at Monash; PhD 2015; *Fighting Hislam* 2017; married Waleed Aly 2002; 2 children; Melbourne. No verified conversion year → `date` omitted
- Hamza Yusuf — Wikipedia "Early life and education"; Cairo Review "All-American Sheikh"; Guardian 2001
- Wayne Parnell — Wikipedia "Personal life"; Express Tribune 2011; Sport24 2011 (announced 30 Jul 2011, converted Jan 2011)
- Martin Lings — Wikipedia; Guardian obituary (Gai Eaton); NYT obituary (died 12 May 2005)

## Docs / Verify / Ship

- [x] `node scripts/regenerate-doc-indexes.mjs` run (99 → 104)
- [ ] `pnpm lint` clean
- [ ] `pnpm test` green
- [ ] `pnpm build` passes (zod validates every new file)
- [ ] Final item: run the finish-work flow — gates in order, owner confirmation BEFORE merge; check off only when shipped

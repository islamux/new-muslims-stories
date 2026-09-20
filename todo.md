# TODO - Batch 2 (new-muslims2) not yet fully applied

- is the data sst or exist twice - dublicated .  → CHECKED: index regenerated from frontmatter, no duplicates, slug-pairing verified (99 pairs).

## Stories (31 candidate: 3 pilots + 28 remaining; 1 dropped)

Done (pilot, approved):
- [x] muhammad-asad-story (.md + -ar.md) + image
- [x] dave-chappelle-story (.md + -ar.md) + image
- [x] sinead-oconnor-story (.md + -ar.md) + image

Done (batch 2, verified facts via web):
- [x] alexander-russell-webb-story  (1888, age 41)
- [x] a-r-rahman-story
- [x] ashley-chin-story
- [x] bjorn-fortuin-story (NO IMAGE; Ramadan 2021, name Imaad)
- [x] charles-eaton-story  (1951)
- [x] clarence-seedorf-story
- [x] eric-abidal-story
- [x] everlast-story  (by 1996)
- [x] franck-ribery-story
- [x] giancarlo-esposito-story  (2026, Saudi Arabia, verified June 2026 report)
- [x] hamid-algar-story (NO IMAGE; conversion c.1963, first Sunni then Shia)
- [x] jermaine-jackson-story
- [x] jeffrey-lang-story (NO IMAGE)
- [x] kareem-abdul-jabbar-story  (converted 1968, name 1971)
- [x] keith-ellison-story
- [x] mahmoud-abdul-rauf-story  (1993)
- [x] marmaduke-pickthall-story
- [x] maryam-jameelah-story (NO IMAGE)
- [x] mike-tyson-story  (1992; NO name change per Wikipedia)
- [x] murad-hofmann-story
- [x] naledi-pandor-story
- [x] nicolas-anelka-story  (age 16/1995, formal 2004 UAE)
- [x] sonny-bill-williams-story  (2009)
- [x] stephen-jackson-story  (Jan 6 2021 shahada, no Muslim name verified)
- [x] timothy-winter-story
- [x] titus-burckhardt-story (NO IMAGE)
- [x] yvonne-ridley-story  (2003, June)

Dropped:
- [x] jerome-correia-story  → DROPPED (no verifiable public identity; not Courtailler)

## Images (25 sources, 22 copied; 3 no-image)
- [x] all 22 remaining webp copied to public/images/stories/
- [x] no-image stories (bjorn-fortuin, hamid-algar, jeffrey-lang, maryam-jameelah, titus-burckhardt) omit image/profilePhoto (parser-safe)

## Research (all resolved)
- [x] jerome-correia → dropped (unverifiable)
- [x] nicolas-anelka → confirmed (16yo/1995, formal 2004 UAE, Abdul-Salam Bilal)
- [x] kareem-abdul-jabbar → confirmed (1968 conversion, 1971 name change)
- [x] yvonne-ridley → confirmed (born 1958, captured 2001, converted mid-2003)

## Docs / Verify / Ship
- [x] docs/existing-muslims.md regenerated from frontmatter (99 rows, 69->99), Last updated 2026-09-20
- [x] Slug-pairing check: 99 EN + 99 AR, no orphans
- [x] pnpm lint clean
- [x] pnpm build passes (206 routes; 99 EN + 99 AR stories in prerender manifest)
- [ ] Run global finish-work skill: gates in order, user confirmation before merge (PENDING — execution done, ship not yet)EVIDENCE: lint exit 0; build 206/206; manifest shows /en/stories + /ar/stories × 99.
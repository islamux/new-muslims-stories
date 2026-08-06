// Audits Arabic story translations (src/stories/*-ar.md) for non-Arabic contamination
// leaked in by translation tooling: Chinese (CJK), Russian (Cyrillic), and untranslated
// English residue (Latin runs), excluding an allowlist of acronyms / famous names.
//
//   node scripts/audit-ar-stories.mjs          # writes docs/ar-translation-audit.md
//   node scripts/audit-ar-stories.mjs --check  # exit 1 if any non-allowlisted finding (CI guard)
//
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const STORIES_DIR = 'src/stories';
const REPORT_OUT = 'docs/ar-translation-audit.md';

const RE = {
  cjk: /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]+/g,
  cyrillic: /[\u0400-\u04ff\u0500-\u052f]+/g,
  latinRun: /[A-Za-z]{3,}/g,
  url: /https?:\/\/\S+|www\.\S+|\b\w+\.(?:com|org|net|io|md|webp|png|jpg|jpeg|gif)\b/gi,
  inlineCode: /`[^`]*`/g,
  // Markdown link "[label](url)" — label is navigation text, not prose.
  markdownLink: /\[[^\]]*\]\([^)]*\)/g,
  fence: /^---\s*$/,
};

// Famous names / titles kept in Latin by choice (brands, shows, songs, orgs).
// Matched case-insensitively and masked before Latin tokenization.
const PHRASE_ALLOW = [
  'daily mail',
  'mail on sunday',
  'sky news',
  'channel 5',
  'in search of a holy land',
  'the deen show',
  'living the life',
  'islam in spanish',
  'zuma luma',
  'the secret life of chaos',
  'wild world',
  'peace train',
  'morning has broken',
  'islam 10',
];

// Tokens permitted as Latin inside Arabic text. Auto-allowed: ALL-CAPS acronyms (>=3).
// Extend this set with famous proper names / orgs as the report surfaces them.
const EXPLICIT_ALLOW = new Set(['iera', 'mtv', 'quran', 'embrace']);

function isAllowedLatin(token) {
  if (/^[A-Z]{3,}$/.test(token)) return true; // NFL, UNIA, USA, BBC, ...
  return EXPLICIT_ALLOW.has(token.toLowerCase());
}

function stripProse(text) {
  let s = text.replace(RE.markdownLink, '').replace(RE.url, '').replace(RE.inlineCode, '');
  for (const phrase of PHRASE_ALLOW) {
    s = s.replace(new RegExp(phrase, 'gi'), ' '.repeat(phrase.length));
  }
  return s;
}

function flagsIn(text) {
  // CJK/Cyrillic are checked on the raw-ish text (a Chinese link label still renders).
  const cleanForScripts = text.replace(RE.url, '').replace(RE.inlineCode, '');
  const cleanForLatin = stripProse(text);
  const out = [];
  for (const m of cleanForScripts.matchAll(RE.cjk)) out.push({ cat: 'cjk', text: m[0] });
  for (const m of cleanForScripts.matchAll(RE.cyrillic)) out.push({ cat: 'cyrillic', text: m[0] });
  for (const m of cleanForLatin.matchAll(RE.latinRun)) {
    if (!isAllowedLatin(m[0])) out.push({ cat: 'latin', text: m[0] });
  }
  return out;
}

function classify({ cjk, cyrillic, latin, titleIssue }) {
  if (cjk > 0 || cyrillic > 0 || titleIssue) return 'heavy';
  if (latin > 5) return 'heavy';
  if (latin > 0) return 'minor';
  return 'clean';
}

const files = readdirSync(STORIES_DIR).filter((f) => f.endsWith('-ar.md')).sort();
const results = [];

for (const file of files) {
  const raw = readFileSync(join(STORIES_DIR, file), 'utf8');
  const { data: fm } = matter(raw);
  const lines = raw.split('\n');
  const title = String(fm.title ?? '');

  // Frontmatter end → global line numbers for the body.
  let fmEnd = -1;
  if (RE.fence.test(lines[0] ?? '')) {
    for (let i = 1; i < lines.length; i++) {
      if (RE.fence.test(lines[i])) {
        fmEnd = i;
        break;
      }
    }
  }

  const flags = []; // { line, cat, text }
  // Title: CJK/Cyrillic are unambiguous contamination.
  for (const f of flagsIn(title)) {
    if (f.cat !== 'latin') flags.push({ line: 2, cat: f.cat, text: f.text, snippet: title });
  }
  // Body
  for (let i = fmEnd + 1; i < lines.length; i++) {
    for (const f of flagsIn(lines[i])) {
      flags.push({ line: i + 1, cat: f.cat, text: f.text, snippet: lines[i].trim().slice(0, 140) });
    }
  }

  const cjk = flags.filter((f) => f.cat === 'cjk').length;
  const cyrillic = flags.filter((f) => f.cat === 'cyrillic').length;
  const latin = flags.filter((f) => f.cat === 'latin').length;
  const titleIssue = flags.some((f) => f.line === 2);

  // Group flags by line for readable detail.
  const byLine = new Map();
  for (const f of flags) {
    if (!byLine.has(f.line)) byLine.set(f.line, { cats: new Set(), snippet: f.snippet });
    byLine.get(f.line).cats.add(f.cat);
  }
  const findings = [...byLine.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([line, v]) => ({ line, category: [...v.cats].join('/'), snippet: v.snippet }));

  const summary = { file, cjk, cyrillic, latin, titleIssue, findings };
  summary.status = classify(summary);
  results.push(summary);
}

// ----- Report -----
const clean = results.filter((r) => r.status === 'clean').length;
const minor = results.filter((r) => r.status === 'minor').length;
const heavy = results.filter((r) => r.status === 'heavy').length;
const tally = (cat) => results.reduce((n, r) => n + r[cat], 0);

const md = [
  '# Arabic Translation Audit',
  '',
  `Generated: ${new Date().toISOString()}`,
  `Files scanned: **${results.length}** — Clean: **${clean}** · Minor: **${minor}** · Heavy: **${heavy}**`,
  '',
  `Totals — CJK: **${tally('cjk')}** · Cyrillic: **${tally('cyrillic')}** · Latin residue: **${tally('latin')}**`,
  '',
  '> Detects Chinese (CJK), Russian (Cyrillic), and untranslated English (Latin) inside',
  '> `src/stories/*-ar.md` bodies and titles. ALL-CAPS acronyms and an explicit allowlist',
  '> are permitted. The allowlist is intentionally minimal — refine it from false positives.',
  '',
  '## Summary',
  '',
  '| File | Status | CJK | Cyrillic | Latin | Title issue |',
  '| --- | --- | --- | --- | --- | --- |',
  ...results
    .filter((r) => r.status !== 'clean')
    .sort((a, b) => heavyRank(b) - heavyRank(a) || b.latin - a.latin)
    .map(
      (r) =>
        `| ${r.file} | **${r.status.toUpperCase()}** | ${r.cjk} | ${r.cyrillic} | ${r.latin} | ${r.titleIssue ? 'yes' : ''} |`,
    ),
  '',
  '## Details',
  '',
  ...results
    .filter((r) => r.status !== 'clean')
    .sort((a, b) => heavyRank(b) - heavyRank(a))
    .flatMap((r) => [
      `### ${r.file} — ${r.status.toUpperCase()}`,
      '',
      ...r.findings.map((f) => `- **L${f.line}** (${f.category}): \`${f.snippet}\``),
      '',
    ]),
].join('\n');

function heavyRank(r) {
  return r.cjk * 10 + r.cyrillic * 10 + (r.titleIssue ? 10 : 0) + r.latin;
}

writeFileSync(REPORT_OUT, md);

console.log(`Scanned ${results.length} AR files.`);
console.log(`Clean ${clean} · Minor ${minor} · Heavy ${heavy}`);
console.log(`Totals — CJK: ${tally('cjk')}, Cyrillic: ${tally('cyrillic')}, Latin residue: ${tally('latin')}`);
console.log(`Report written to ${REPORT_OUT}`);

if (process.argv.includes('--check')) {
  // CI guard: block the unambiguous non-Arabic-script contamination
  // (Chinese / Cyrillic / title). Latin residue is informational only, since it may
  // include permitted brand names and proper nouns.
  const blockers = results.filter((r) => r.cjk > 0 || r.cyrillic > 0 || r.titleIssue);
  if (blockers.length) {
    console.error(
      `\nBlocked: non-Arabic script in ${blockers.length} file(s):\n` +
        blockers.map((r) => `  - ${r.file} (cjk=${r.cjk}, cyrillic=${r.cyrillic}, title=${r.titleIssue})`).join('\n'),
    );
    process.exit(1);
  }
}

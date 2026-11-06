#!/usr/bin/env node
// Regenerates the two content reference docs from the story frontmatter:
//   - docs/muslim-names.md     (names only, one per line, alphabetical)
//   - docs/existing-muslims.md (table: slug, EN name, AR name, country, previous religion)
//
// Name rule per story:  firstName -> author  (EN file), last resort: AR firstName -> AR author.
// "Last updated" is only rewritten when the table rows change, so a run on an
// unchanged tree is a no-op (byte-for-byte).
//
// Usage: node scripts/regenerate-doc-indexes.mjs [--out <docs-dir>] [--stories-dir <dir>]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import matter from 'gray-matter';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function argValue(name, fallback) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const storiesDir = path.resolve(argValue('--stories-dir', path.join(REPO_ROOT, 'src', 'stories')));
const outDir = path.resolve(argValue('--out', path.join(REPO_ROOT, 'docs')));

const NAMES_FILE = path.join(outDir, 'muslim-names.md');
const INDEX_FILE = path.join(outDir, 'existing-muslims.md');

const cmp = (a, b) => {
  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  return la < lb ? -1 : la > lb ? 1 : 0;
};

const clean = (v) => (typeof v === 'string' ? v.trim() : '');

function nameFromFrontmatter(data) {
  const firstName = clean(data.firstName);
  if (firstName && firstName !== 'null') return firstName;
  return clean(data.author);
}

function readRows() {
  const files = fs.readdirSync(storiesDir).filter((f) => f.endsWith('.md'));
  const enFiles = files.filter((f) => !f.endsWith('-ar.md')).sort();

  return enFiles.map((enFile) => {
    const slug = enFile.replace(/\.md$/, '');
    const en = matter(fs.readFileSync(path.join(storiesDir, enFile), 'utf8')).data;
    const arFile = `${slug}-ar.md`;
    const arPath = path.join(storiesDir, arFile);
    const ar =
      fs.existsSync(arPath) ? matter(fs.readFileSync(arPath, 'utf8')).data : {};

    const enName = nameFromFrontmatter(en);
    const arName = fs.existsSync(arPath) ? nameFromFrontmatter(ar) : '';
    const displayName = enName || arName;

    return {
      slug,
      displayName,
      enName,
      arName,
      country: clean(en.country),
      previousReligion: clean(en.previousReligion),
    };
  });
}

function rowsTable(rows) {
  return rows
    .map(
      (r) =>
        `| ${r.slug} | ${r.enName} | ${r.arName} | ${r.country} | ${r.previousReligion} |`,
    )
    .join('\n');
}

const TABLE_HEADER =
  '| slug | Name (EN) | Name (AR) | Country | Previous Religion |\n|------|-----------|------------|---------|--------------------|';
const TABLE_SEP_END = '|--------------------|';

// Rows-only slice of the table (everything after the header separator line).
function rowsSlice(fullTable) {
  return fullTable.slice(fullTable.indexOf(TABLE_SEP_END) + TABLE_SEP_END.length + 1);
}

function writeIfChanged(file, content) {
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === content) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return true;
}

const rows = readRows().sort((a, b) => cmp(a.slug, b.slug));

// names-only list: display name per new Muslim, no header, no date.
const namesContent = rows
  .map((r) => r.displayName)
  .filter(Boolean)
  .sort(cmp)
  .map((n) => `${n}\n`)
  .join('');

const fullTable = `${TABLE_HEADER}\n${rowsTable(rows)}\n`;
const candidateRows = rowsSlice(fullTable);

let date = new Date().toISOString().slice(0, 10);
let indexContent;
if (fs.existsSync(INDEX_FILE)) {
  const existing = fs.readFileSync(INDEX_FILE, 'utf8');
  if (rowsSlice(existing) === candidateRows) {
    indexContent = existing; // rows unchanged → preserve bytes (incl. date)
    date = null;
  }
}
if (date) {
  indexContent = [
    '# Existing New Muslims Index',
    '',
    "This file is a reference list of every new Muslim currently present in `src/stories/`. Its purpose is to **avoid adding a duplicate of an existing Muslim**. Always read it before adding a new Muslim story, and update it (add/edit a row) whenever you add, edit, or remove a story.",
    '',
    "Extracted automatically from the stories' frontmatter (English + Arabic). The (EN) name comes from the English file, the (AR) name from the Arabic file, and the country and previous religion from the English file.",
    '',
    `_Total Muslims: ${rows.length}_ — _Last updated: ${date}_`,
    '',
    fullTable,
  ].join('\n');
}

const namesChanged = writeIfChanged(NAMES_FILE, namesContent);
const indexChanged = date ? writeIfChanged(INDEX_FILE, indexContent) : false;

console.log(
  `regenerate-doc-indexes: ${rows.length} Muslims — muslim-names.md ${namesChanged ? 'updated' : 'unchanged'}, existing-muslims.md ${date ? (indexChanged ? 'updated' : 'unchanged') : 'preserved'}`,
);

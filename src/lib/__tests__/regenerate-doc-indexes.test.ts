import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '../../..');
const SCRIPT = path.join(ROOT, 'scripts', 'regenerate-doc-indexes.mjs');
const NAMES_PATH = path.join(ROOT, 'docs', 'muslim-names.md');
const INDEX_NAME = 'existing-muslims.md';
const INDEX_PATH = path.join(ROOT, 'docs', INDEX_NAME);

function expectScriptExists(): void {
  expect(fs.existsSync(SCRIPT), 'scripts/regenerate-doc-indexes.mjs should exist').toBe(true);
}

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'doc-indexes-'));
}

function runScript(outDir: string, storiesDir?: string): void {
  const args = [SCRIPT, '--out', outDir];
  if (storiesDir) args.push('--stories-dir', storiesDir);
  execFileSync('node', args, { cwd: ROOT, encoding: 'utf8' });
}

function writeStory(dir: string, slug: string, data: string[]): void {
  fs.writeFileSync(path.join(dir, slug), ['---', ...data, '---', 'Body.'].join('\n'));
}

describe('scripts/regenerate-doc-indexes.mjs', () => {
  it('regenerates muslim-names.md byte-identical to the committed file', () => {
    expectScriptExists();
    const outDir = makeTempDir();
    runScript(outDir);

    const expected = fs.readFileSync(NAMES_PATH, 'utf8');
    const actual = fs.readFileSync(path.join(outDir, 'muslim-names.md'), 'utf8');
    expect(actual).toBe(expected);
  });

  it('leaves existing-muslims.md untouched when the rows are unchanged', () => {
    expectScriptExists();
    const outDir = makeTempDir();
    const committed = fs.readFileSync(INDEX_PATH, 'utf8');
    // Same rows as the real data, but keep the file's current date: the
    // script must preserve the whole file byte-for-byte instead of bumping
    // the date on every run.
    fs.writeFileSync(path.join(outDir, INDEX_NAME), committed);
    const before = fs.readFileSync(path.join(outDir, INDEX_NAME), 'utf8');

    runScript(outDir);

    const after = fs.readFileSync(path.join(outDir, INDEX_NAME), 'utf8');
    expect(after).toBe(before);
  });

  it('writes today-date, correct rows and name fallbacks for new tables', () => {
    expectScriptExists();
    const temp = makeTempDir();
    const storiesDir = path.join(temp, 'stories');
    const outDir = path.join(temp, 'docs');
    fs.mkdirSync(storiesDir);
    fs.mkdirSync(outDir);

    // firstName present → used everywhere.
    writeStory(storiesDir, 'adam-story.md', [
      'title: "T"',
      'author: "Adam"',
      'language: "en"',
      'firstName: "Adam"',
      'country: "Egypt"',
      'previousReligion: "Christianity"',
    ]);
    // firstName absent in EN → author fallback; AR firstName exists.
    writeStory(storiesDir, 'bilal-story.md', [
      'title: "T"',
      'author: "Bilal (formerly Greg)"',
      'language: "en"',
    ]);
    writeStory(storiesDir, 'bilal-story-ar.md', [
      'title: "ت"',
      'author: "بلال"',
      'language: "ar"',
      'firstName: "بلال"',
    ]);
    // Nothing in EN → last-resort AR author fallback; slug order B < M.
    writeStory(storiesDir, 'muallaqa-story.md', ['title: "T"', 'language: "en"']);
    writeStory(storiesDir, 'muallaqa-story-ar.md', [
      'title: "ت"',
      'language: "ar"',
      'author: "معلقة"',
    ]);

    runScript(outDir, storiesDir);

    const names = fs.readFileSync(path.join(outDir, 'muslim-names.md'), 'utf8');
    expect(names).toBe('Adam\nBilal (formerly Greg)\nمعلقة\n');

    const index = fs.readFileSync(path.join(outDir, INDEX_NAME), 'utf8');
    const today = new Date().toISOString().slice(0, 10);
    expect(index).toContain('_Total Muslims: 3_');
    expect(index).toContain(`_Last updated: ${today}_`);
    expect(index).toContain('| adam-story | Adam |  | Egypt | Christianity |');
    expect(index).toContain('| bilal-story | Bilal (formerly Greg) | بلال |  |  |');
    expect(index).toContain('| muallaqa-story |  | معلقة |  |  |');
  });
});

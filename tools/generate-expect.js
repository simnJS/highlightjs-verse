#!/usr/bin/env node
/**
 * Regenerate the `.expect.txt` companions for every markup fixture.
 *
 *   node tools/generate-expect.js
 *
 * The generated output is a snapshot, not an oracle. Always review the diff
 * (and `node tools/inspect.js <fixture>`) before committing a regenerated
 * expectation, otherwise a grammar regression silently becomes the new
 * baseline.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';
import hljs from 'highlight.js/lib/core';
import verse from '../dist/verse.es.js';

hljs.registerLanguage('verse', verse);

const here = path.dirname(fileURLToPath(import.meta.url));
// glob patterns are always POSIX-style; a Windows path would be read as escapes.
const fixtures = globSync('../test/markup/verse/*.txt', {
  cwd: here,
  absolute: true
}).filter((file) => !file.endsWith('.expect.txt'));

if (fixtures.length === 0) {
  console.error('no markup fixtures found');
  process.exit(1);
}

for (const fixture of fixtures) {
  const source = fs.readFileSync(fixture, 'utf8');
  const html = hljs.highlight(source, { language: 'verse' }).value;
  const target = fixture.replace(/\.txt$/, '.expect.txt');
  fs.writeFileSync(target, `${html.trim()}\n`, 'utf8');
  console.log(`wrote ${path.relative(process.cwd(), target)}`);
}

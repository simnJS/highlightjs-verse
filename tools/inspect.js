#!/usr/bin/env node
/**
 * Development helper: print the scopes highlight.js assigns to a Verse file.
 *
 *   node tools/inspect.js test/markup/verse/default.txt
 *
 * Output uses `⟦scope|text⟧` so that mis-scoped tokens are obvious at a glance.
 */
import fs from 'fs';
import hljs from 'highlight.js/lib/core';
import verse from '../dist/verse.es.js';

hljs.registerLanguage('verse', verse);

const file = process.argv[2];
if (!file) {
  console.error('usage: node tools/inspect.js <file>');
  process.exit(1);
}

const source = fs.readFileSync(file, 'utf8');
const html = hljs.highlight(source, { language: 'verse' }).value;

const annotated = html
  .replace(/<span class="hljs-([^"]+)">/g, '⟦$1|')
  .replace(/<\/span>/g, '⟧')
  .replace(/&quot;/g, '"')
  .replace(/&#x27;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&');

console.log(annotated);

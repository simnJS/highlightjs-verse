import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import hljs from 'highlight.js/lib/core';
import verse from '../dist/verse.es.js';

const COMPETITORS = ['bash','c','cpp','csharp','css','delphi','go','java','javascript','json','kotlin','lua','markdown','php','python','ruby','rust','scala','sql','swift','typescript','xml','yaml'];
hljs.registerLanguage('verse', verse);
for (const n of COMPETITORS) hljs.registerLanguage(n, (await import(`highlight.js/lib/languages/${n}`)).default);

for (const dir of ['test/detect/verse', 'test/detect/not-verse']) {
  console.log(`\n=== ${dir} ===`);
  for (const f of globSync(`${dir}/*.txt`)) {
    const src = fs.readFileSync(f, 'utf8');
    const r = hljs.highlightAuto(src);
    const verseScore = hljs.highlight(src, { language: 'verse' }).relevance;
    console.log(
      path.basename(f).padEnd(28),
      'detected=' + String(r.language).padEnd(12),
      'score=' + String(r.relevance).padEnd(5),
      'second=' + String(r.secondBest && r.secondBest.language).padEnd(12),
      'verseScore=' + verseScore
    );
  }
}

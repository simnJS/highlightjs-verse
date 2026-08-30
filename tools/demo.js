#!/usr/bin/env node
/**
 * End-to-end demo: register the grammar with highlight.js exactly the way a
 * consumer would, highlight real Verse, print the resulting HTML, and write a
 * self-contained page to `demo/index.html` for visual inspection.
 *
 *   npm run demo
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import hljs from 'highlight.js/lib/core';
import verse from '../dist/verse.es.js';

hljs.registerLanguage('verse', verse);

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');

const SNIPPET = `using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }

<# A round-based score tracker.
   Block comments <# nest #> in Verse. #>
score_tracker_device := class(creative_device):

    @editable
    ScoreThreshold : int = 0x0A

    var Scores : [agent]int = map{}

    OnBegin<override>()<suspends>:void =
        Print("Tracking up to {ScoreThreshold} points")
        loop:
            Sleep(1.0)

    Award<public>(Agent:agent, Points:int)<decides><transacts>:int =
        Current := Scores[Agent] or 0
        Total := Current + Points
        set Scores[Agent] = Total
        Total
`;

const result = hljs.highlight(SNIPPET, { language: 'verse' });

console.log('registered languages :', hljs.listLanguages().join(', '));
console.log('language             :', result.language);
console.log('relevance            :', result.relevance);
console.log('\n--- highlighted HTML ---\n');
console.log(result.value);

// Sanity check: the grammar must actually produce markup, not plain text.
const scopes = [ ...result.value.matchAll(/class="hljs-([^"]+)"/g) ]
  .map((m) => m[1]);
const unique = [ ...new Set(scopes) ].sort();
console.log('\n--- scopes produced ---\n');
console.log(unique.join('\n'));

const REQUIRED = [ 'comment', 'keyword', 'string', 'number', 'meta', 'symbol' ];
const missing = REQUIRED.filter((scope) => !unique.includes(scope));
if (missing.length > 0) {
  console.error(`\nFAIL: expected scopes missing: ${missing.join(', ')}`);
  process.exit(1);
}

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>highlightjs-verse demo</title>
<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release/build/styles/github-dark.min.css">
<style>
  body { background: #0d1117; color: #c9d1d9; font: 16px/1.6 system-ui, sans-serif; padding: 2rem; }
  pre  { border-radius: 8px; padding: 1rem; overflow-x: auto; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14px; }
</style>
</head>
<body>
<h1>highlightjs-verse</h1>
<p>Verse syntax highlighting for highlight.js.</p>
<pre><code class="hljs language-verse">${result.value}</code></pre>
</body>
</html>
`;

fs.mkdirSync(path.join(root, 'demo'), { recursive: true });
fs.writeFileSync(path.join(root, 'demo/index.html'), page, 'utf8');
console.log('\nwrote demo/index.html');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';
import 'should';
import hljs from 'highlight.js/lib/core';
import verse from '../dist/verse.es.js';

// A representative slice of the built-in library. Auto-detection is only
// meaningful when Verse has to compete with other grammars, and these are the
// languages most likely to be confused with Verse: `:=` bindings (Go, Pascal),
// angle-bracket generics (C++, TypeScript, Java, C#), `#` comments (Python,
// Ruby, Bash), word-operators (Pascal, Ruby, Python) and `<# #>` block comments
// (PowerShell).
const COMPETITORS = [
  'bash', 'c', 'cpp', 'csharp', 'css', 'delphi', 'go', 'java', 'javascript',
  'json', 'kotlin', 'lua', 'markdown', 'php', 'powershell', 'python', 'ruby',
  'rust', 'scala', 'sql', 'swift', 'typescript', 'xml', 'yaml'
];

before(async () => {
  hljs.registerLanguage('verse', verse);
  for (const name of COMPETITORS) {
    const mod = await import(`highlight.js/lib/languages/${name}`);
    hljs.registerLanguage(name, mod.default);
  }
});

const here = path.dirname(fileURLToPath(import.meta.url));

const read = (file) => fs.readFileSync(file, 'utf8');
// glob patterns are always POSIX-style; a Windows path would be read as escapes.
const fixtures = (dir) => globSync(`detect/${dir}/*.txt`, {
  cwd: here,
  absolute: true
});

const verseFixtures = fixtures('verse');
const otherFixtures = fixtures('not-verse');

describe('verse auto-detection', () => {
  it('should have fixtures to run', () => {
    verseFixtures.length.should.be.above(0);
    otherFixtures.length.should.be.above(0);
  });

  describe('recognises Verse', () => {
    verseFixtures.forEach((file) => {
      it(`should detect ${path.basename(file)} as verse`, () => {
        hljs.highlightAuto(read(file)).language.should.equal('verse');
      });
    });
  });

  // False-positive guard: Verse must not shadow unrelated languages.
  describe('does not over-claim other languages', () => {
    otherFixtures.forEach((file) => {
      it(`should not detect ${path.basename(file)} as verse`, () => {
        hljs.highlightAuto(read(file)).language.should.not.equal('verse');
      });
    });
  });
});

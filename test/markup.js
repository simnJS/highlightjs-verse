import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';
import 'should';
import hljs from 'highlight.js/lib/core';
import verse from '../dist/verse.es.js';

hljs.registerLanguage('verse', verse);

const here = path.dirname(fileURLToPath(import.meta.url));
// glob patterns are always POSIX-style; a Windows path would be read as escapes.
const expects = globSync('markup/verse/*.expect.txt', {
  cwd: here,
  absolute: true
});

describe('verse markup', () => {
  it('should have fixtures to run', () => {
    expects.length.should.be.above(0);
  });

  expects.forEach((filename) => {
    const name = path.basename(filename, '.expect.txt');
    const skipped = name.endsWith('.skip');
    const run = skipped ? it.skip : it;
    run(`should markup ${name}`, () => {
      const source = fs.readFileSync(filename.replace(/\.expect/, ''), 'utf8');
      const expected = fs.readFileSync(filename, 'utf8');
      hljs.highlight(source, { language: 'verse' }).value.trim()
        .should.equal(expected.trim());
    });
  });
});

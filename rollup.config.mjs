import { createRequire } from 'module';
import terser from '@rollup/plugin-terser';

const require = createRequire(import.meta.url);
const hljsVersion = require('highlight.js/package.json').version;
const banner = `/*! \`verse\` grammar built and tested with Highlight.js ${hljsVersion} */\n`;

export default {
  input: 'src/languages/verse.js',
  output: [
    {
      file: 'dist/verse.es.js',
      format: 'es',
      banner
    },
    {
      file: 'dist/verse.es.min.js',
      format: 'es',
      banner,
      plugins: [ terser() ]
    },
    {
      file: 'dist/verse.cjs',
      format: 'cjs',
      exports: 'default',
      banner
    },
    // Browser build: registers itself when loaded after highlight.js.
    {
      file: 'dist/verse.js',
      format: 'iife',
      name: 'hljsVerse',
      banner,
      footer: 'hljs.registerLanguage("verse", hljsVerse);'
    },
    {
      file: 'dist/verse.min.js',
      format: 'iife',
      name: 'hljsVerse',
      banner,
      footer: 'hljs.registerLanguage("verse", hljsVerse);',
      plugins: [ terser() ]
    }
  ]
};

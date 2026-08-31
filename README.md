# highlightjs-verse

[![CI](https://github.com/simnJS/highlightjs-verse/actions/workflows/ci.yml/badge.svg)](https://github.com/simnJS/highlightjs-verse/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A [Verse](https://dev.epicgames.com/documentation/en-us/uefn/verse-language-reference)
language grammar for [highlight.js](https://highlightjs.org/).

Verse is Epic Games' multi-paradigm programming language. It is the scripting
language of Unreal Editor for Fortnite (UEFN) and Fortnite Creative, and Epic
has announced it as the programming language of Unreal Engine 6.

This package is a **native highlight.js grammar**, written against the
highlight.js language model rather than converted mechanically from a TextMate
grammar. It is maintained by the author of
[`simnJS/verse-grammar`](https://github.com/simnJS/verse-grammar), the TextMate
grammar GitHub Linguist uses for `.verse` files.

> Listed in highlight.js's
> [`SUPPORTED_LANGUAGES.md`](https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md)
> since [highlightjs/highlight.js#4524](https://github.com/highlightjs/highlight.js/pull/4524).
> highlight.js [no longer merges new languages into core](https://highlightjs.readthedocs.io/en/latest/language-requests.html)
> or hosts third-party grammar repositories, so a self-hosted package plus that
> listing is the documented path for a third-party grammar.

```verse
using { /Fortnite.com/Devices }
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
```

## Installation

> **Not on npm.** The name `highlightjs-verse` on npm belongs to a
> [separate Verse grammar](https://github.com/abdelrahman-mohammad/highlightjs-verse)
> by another author, published before this one — `npm install highlightjs-verse`
> installs *that* package, not this one. See
> [Related work](#related-work) below; consolidating the two is being discussed
> in [their issue #10](https://github.com/abdelrahman-mohammad/highlightjs-verse/issues/10).

Until that is settled, use the CDN or a git dependency.

**jsDelivr** (served straight from this repository):

```html
<script src="https://cdn.jsdelivr.net/gh/simnJS/highlightjs-verse@main/dist/verse.min.js"></script>
```

**git dependency:**

```bash
npm install github:simnJS/highlightjs-verse
```

Or load a prebuilt file from `dist/` directly in a browser.

## Usage

### Node, bundlers, ESM

```javascript
import hljs from 'highlight.js';
import verse from 'highlightjs-verse';

hljs.registerLanguage('verse', verse);
hljs.highlightAll();
```

### CommonJS

```javascript
const hljs = require('highlight.js');
const verse = require('highlightjs-verse');

hljs.registerLanguage('verse', verse);
hljs.highlightAll();
```

### Static website

The `dist/verse.js` build registers itself, so load it after highlight.js:

```html
<script src="/path/to/highlight.min.js"></script>
<script src="/path/to/verse.min.js"></script>
<script>
  hljs.highlightAll();
</script>
```

### From a CDN

jsDelivr serves this repository directly, so no npm publish is required:

```html
<script src="https://cdn.jsdelivr.net/gh/simnJS/highlightjs-verse@main/dist/verse.min.js"></script>
```

Pin a tag or commit instead of `@main` for production.

### Highlighting a single block

Once registered, the `verse` identifier works like any built-in language:

````markdown
```verse
MyFunction():void =
    Print("Hello World")
```
````

```javascript
const html = hljs.highlight(source, { language: 'verse' }).value;
```

## Language coverage

| Area | Supported |
| :--- | :--- |
| Comments | `#` line, `<# … #>` block (**nested**), `<#>` indented-block marker |
| Strings | `"…"`, escapes (`\n`, `\t`, `\{`, `\#`, …), `{Expr}` interpolation |
| Characters | `'A'`, `'\n'`, `0o…` (UTF-8) and `0u…` (UTF-32) code points |
| Numbers | integers, floats, exponents, `0x` hexadecimal, `..` ranges |
| Definitions | `class`, `struct`, `interface`, `enum`, `module` |
| Functions | definitions, methods, calls, failable calls (`Foo[…]`) |
| Archetypes | instantiation such as `button_device{}` |
| Specifiers | access (`<public>`, `<private>`, …), effects (`<computes>`, `<decides>`, `<suspends>`, `<transacts>`, …), structure (`<abstract>`, `<final>`, `<override>`, `<unique>`, …), `<attribscope_*>` |
| Attributes | `@editable`, `@editable_number`, `@doc`, `@available`, … |
| Mutability | `var` / `set` bindings, compound assignment |
| Control flow | `if` / `then` / `else`, `for`, `loop`, `case`, `block`, `defer`, `break`, `return` |
| Failure | `<decides>`, `or` fallbacks, `?` option queries |
| Concurrency | `sync`, `race`, `rush`, `branch`, `spawn` |
| Containers | arrays, maps, tuples, options |
| Types | `int`, `float`, `logic`, `string`, `char`, `char32`, `void`, `any`, `comparable`, `rational`, … |
| Modules | `using`, module paths such as `/Verse.org/Simulation` |
| Operators | `:=`, `=`, `<>`, `=>`, `->`, `..`, `?`, arithmetic, comparison, `and` / `or` / `not` |

### Known limitations

- **Indented block comments.** Verse treats everything indented beneath a `<#>`
  marker as commentary. highlight.js is not indentation-aware, so only the
  marker line itself is highlighted as a comment.
- **Verse markup expressions.** The `<tag>…</tag>` markup form accepted by the
  Verse parser is not modelled; it is vanishingly rare in UEFN code and a
  general `<…>` rule would collide with comparison operators.
- **Specifiers are matched from a known list.** A generic `<word>` rule would
  match C++/TypeScript generics such as `vector<int>`, which would wreck
  auto-detection. A specifier Epic adds in future needs a one-line update here.

### Auto-detection

Verse shares a large keyword surface with Ruby and Pascal (`class`, `module`,
`case`, `then`, `do`, `until`, `and`, `or`, `not`, …), so common keywords are
weighted `|0` and relevance is carried by constructs that only occur in Verse:
effect and access specifiers, `/Verse.org/…` module paths, and `<# … #>`
comments. `test/detect/not-verse/` guards against Verse claiming Bash, C++,
Delphi, Go, PowerShell, Python, Ruby or TypeScript sources.

## Development

```bash
npm install
npm run build
npm test
```

Useful scripts:

| Command | Purpose |
| :--- | :--- |
| `npm run build` | Build the ESM, CJS and browser bundles into `dist/` |
| `npm test` | Build, then run the markup and detection suites |
| `npm run demo` | Register the grammar, highlight a sample, write `demo/index.html` |
| `node tools/inspect.js <file>` | Print the scope assigned to every token |
| `node tools/generate-expect.js` | Refresh the markup expectation snapshots |

### Testing

Two suites run under Mocha:

- **`test/markup.js`** compares highlighted output against the checked-in
  `test/markup/verse/*.expect.txt` snapshots. Expectations are generated with
  `tools/generate-expect.js` and reviewed by hand — regenerate only after
  reading the diff, or a regression becomes the new baseline.
- **`test/detect.js`** registers Verse alongside 24 built-in grammars and
  asserts that real Verse is auto-detected as `verse`, and that unrelated
  sources are not.

`dist/` is committed so the package works straight from a CDN or a git
dependency; CI fails if the checked-in build is stale.

## Relationship to `simnJS/verse-grammar`

[`simnJS/verse-grammar`](https://github.com/simnJS/verse-grammar) is a TextMate
grammar (scope `source.verse`) used by GitHub Linguist to highlight `.verse`
files on GitHub. This repository is a **separate, independent implementation**
for highlight.js: TextMate and highlight.js use different grammar models, so the
syntax knowledge was carried over and re-expressed rather than converted.

Both are MIT licensed and maintained by the same author.

## Related work

[`abdelrahman-mohammad/highlightjs-verse`](https://github.com/abdelrahman-mohammad/highlightjs-verse)
is an independent Verse grammar for highlight.js, published to npm as
`highlightjs-verse` in April 2026 — before this one, and without my knowledge
while writing it. It derives its token colours from Epic's official VS Code
extension and ships a matching `verse-dark` theme and TypeScript definitions,
neither of which this package has.

Two competing grammars serve nobody, so consolidation is being discussed in
[their issue #10](https://github.com/abdelrahman-mohammad/highlightjs-verse/issues/10).
Until that resolves, prefer whichever fits your needs; if you want the Epic
colour theme, use theirs.

## GitHub Linguist

Verse is an officially supported language in GitHub Linguist. It was added in
[github-linguist/linguist#7440](https://github.com/github-linguist/linguist/pull/7440),
merged on 10 August 2026, which registered:

- language name `Verse`, `language_id` `180832205`
- extension `.verse`
- TextMate scope `source.verse`, provided by `simnJS/verse-grammar`
- colour `#518ef8`

That is a Linguist result and says nothing about this highlight.js package;
GitHub does not endorse this implementation.

## Discord

The long-term goal is working ```` ```verse ```` blocks in Discord. See
[`docs/DISCORD.md`](docs/DISCORD.md) for what is publicly known about Discord's
highlighting stack and what would have to happen next.

## References

- [Verse Language Reference](https://dev.epicgames.com/documentation/en-us/uefn/verse-language-reference) — Epic Games
- [Book of Verse](https://verselang.github.io/book/) — community reference (CC0-1.0)
- [highlight.js](https://github.com/highlightjs/highlight.js) and its
  [language definition guide](https://highlightjs.readthedocs.io/en/latest/language-guide.html)
- [`simnJS/verse-grammar`](https://github.com/simnJS/verse-grammar) — the TextMate grammar
- [github-linguist/linguist#7440](https://github.com/github-linguist/linguist/pull/7440) — Linguist support for Verse

## Licence

MIT — see [LICENSE](LICENSE).

Two auto-detection fixtures are reused from
[`sprintermax/UEFNVerseSnippets`](https://github.com/sprintermax/UEFNVerseSnippets)
(MIT, Copyright © 2023 Sprintermax); see
[`test/detect/verse/ATTRIBUTION.md`](test/detect/verse/ATTRIBUTION.md).

# Verse syntax highlighting in Discord

The goal:

````markdown
```verse
MyFunction():void =
    Print("Hello World")
```
````

rendering with Verse syntax highlighting in a Discord message.

This document records what is publicly verifiable about Discord's highlighting
stack, what is not, and what would actually have to happen. It is deliberately
conservative: where public evidence is missing, that is stated rather than
guessed at.

## What is publicly established

**Discord's fenced code blocks accept a language identifier.** Writing
` ```python ` (no space before the identifier) highlights the block. This is
documented by Discord's own support material on message formatting and is
trivially reproducible in any client.

**The highlighting is highlight.js.** Every independent reference of Discord's
code-block languages — community documentation, the
[discord-syntax-highlighting](https://github.com/cherryblossom000/discord-syntax-highlighting)
reference site, third-party formatting guides — describes the feature as
highlight.js, and the identifiers and aliases that work in Discord line up with
highlight.js language names and aliases (`py`, `js`, `ts`, `cpp`, `rb`, `rs`,
`md`, `yml`, …). Unrecognised identifiers degrade silently to an unhighlighted
block rather than erroring, which is consistent with a `getLanguage()` lookup.

**Only a subset of highlight.js ships.** The identifiers reliably reported as
working correspond to highlight.js's *common* language set (roughly 40
grammars), not the full ~200. highlight.js's own default browser build bundles
the same common subset, so this is the expected shape of an off-the-shelf
integration.

**Third-party grammars are in no highlight.js build.** This is the decisive
technical point, and it is documented by highlight.js itself: new languages are
[no longer merged into the core library](https://highlightjs.readthedocs.io/en/latest/language-requests.html),
and third-party grammars live in their own packages. `highlightjs-verse` is
therefore not, and will never be, reachable by upgrading highlight.js. Discord
would have to add the package to its bundle and register it explicitly.

## What is not publicly verifiable

The Discord client is closed source. The following cannot be established from
public evidence, and this document does not assert them:

- the exact highlight.js version Discord bundles;
- whether Discord's build is stock or customised, and whether the language list
  is hand-picked or inherited from the default build;
- whether Discord has any internal process, formal or informal, for adding a
  language to that list;
- whether any language has ever been added to Discord's set in response to a
  public request.

There is no public repository for the Discord client, and no public issue
tracker covering client features. [`discord/discord-api-docs`](https://github.com/discord/discord-api-docs)
is scoped to the developer platform (APIs, bots, activities), not to client
rendering behaviour, so it is not the right venue for this.

## What would have to happen

1. **A maintained, tested, third-party highlight.js grammar exists.** — done,
   this repository.
2. **highlight.js lists it publicly**, so Discord can find it and see it is real
   rather than a one-off gist. — done,
   [`SUPPORTED_LANGUAGES.md`](https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md)
   lists Verse as of
   [highlightjs/highlight.js#4524](https://github.com/highlightjs/highlight.js/pull/4524).
3. **The package is published to npm**, so adding it is a dependency bump rather
   than vendoring a file. *(Maintainer decision — not yet done.)*
4. **Discord adds `highlightjs-verse` to its bundle** and registers `verse`.
   This is a Discord product decision; nothing outside Discord can force it.

Steps 1 and 2 are the parts under our control, and they are what makes step 4 a
small, low-risk change on Discord's side rather than a request to design a Verse
grammar from scratch.

## Where to ask

Ranked by how plausible each route is:

1. **[feedback.discord.com](https://feedback.discord.com)** — Discord's official
   product feedback site, and the channel Discord's own support documentation
   points users to for feature requests. Existing ideas can be searched and
   upvoted, which matters more than the text of any single post: a request with
   visible demand from UEFN creators is far more actionable than a lone one.
2. **Discord's support portal** (`dis.gd/contact`, category *Feedback*) — a
   one-way intake form. Useful as a secondary signal, not as a conversation.
3. **Community amplification** — the UEFN and Fortnite Creative communities are
   the constituency here. Concentrating upvotes on a single feedback item is
   worth more than scattered duplicate posts.

Not appropriate: the `discord-api-docs` issue tracker (wrong scope), and
unsolicited direct contact with Discord staff.

## Draft feature request

The `SUPPORTED_LANGUAGES.md` entry is merged and can now be cited. Publishing to
npm first is still worth doing, so the ask is a dependency bump rather than
"vendor this file". Keep the post short; feedback items are triaged, not read
closely.

> **Title:** Add Verse (Epic Games / UEFN) to code block syntax highlighting
>
> Discord code blocks already highlight ~40 languages via highlight.js. Please
> add `verse`.
>
> **What Verse is.** Verse is Epic Games' programming language for Unreal Editor
> for Fortnite (UEFN) and Fortnite Creative, and Epic has announced it as the
> programming language of Unreal Engine 6. Fortnite island creators share Verse
> snippets in Discord constantly — Discord is where most UEFN support happens —
> and every one of those blocks is currently unhighlighted plain text.
>
> **The work is already done.** I am not asking anyone at Discord to write a
> grammar. A production-ready highlight.js grammar exists, is MIT licensed, and
> is maintained:
>
> - Grammar: https://github.com/simnJS/highlightjs-verse
> - Listed by highlight.js in `SUPPORTED_LANGUAGES.md`
> - Test suite covering markup output and auto-detection, including
>   false-positive guards so Verse does not claim other languages
>
> The same author maintains the Verse TextMate grammar that GitHub Linguist uses
> to highlight `.verse` files on GitHub (merged in
> github-linguist/linguist#7440), so Verse is already an officially supported
> language on GitHub.
>
> **What it would take.** Add the `highlightjs-verse` package and register it:
>
> ```js
> import verse from 'highlightjs-verse';
> hljs.registerLanguage('verse', verse);
> ```
>
> I am happy to make any changes Discord would need, and to keep the grammar
> maintained as Verse evolves.

## Status

| Step | State |
| :--- | :--- |
| highlight.js grammar written and tested | done |
| Listed in highlight.js `SUPPORTED_LANGUAGES.md` | done — [#4524](https://github.com/highlightjs/highlight.js/pull/4524) merged 30 Aug 2026 |
| Published to npm | not done — maintainer decision |
| Submitted to Discord feedback | ready to send once published to npm |
| Adopted by Discord | out of our hands |

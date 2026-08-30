/*! `verse` grammar built and tested with Highlight.js 11.12.0 */

/*
Language: Verse
Author: Simon GAY (simnJS) <simnkrystal@gmail.com>
Description: Verse is Epic Games' multi-paradigm programming language, used to script gameplay for Unreal Editor for Fortnite (UEFN) and Fortnite Creative.
Website: https://dev.epicgames.com/documentation/en-us/uefn/verse-language-reference
Category: gaming, scripting
*/

/** @type LanguageFn */
function verse(hljs) {
  // Keywords shared with many other languages are weighted `|0`. Verse-specific
  // relevance is carried by the specifier, concurrency and path modes below so
  // that unrelated sources are not aggressively classified as Verse.
  const KEYWORDS = [
    // control flow
    'if|0', 'then|0', 'else|0', 'for|0', 'loop|0', 'case|0', 'block|0',
    'defer|0', 'return|0', 'break|0', 'continue|0', 'yield|0', 'first|0',
    'do|0', 'until|0', 'catch|0', 'of|0', 'at|0', 'where|0', 'when|0',
    'next|0', 'over|0', 'while|0', 'in|0', 'is|0',
    // bindings and mutability
    'var|0', 'set|0', 'ref|0', 'alias', 'live',
    // definitions
    'class|0', 'struct|0', 'interface|0', 'enum|0', 'module|0',
    'using|0', 'external|0', 'with|0', 'import|0',
    // Verse spells the logical operators as words
    'and|0', 'or|0', 'not|0',
    // concurrency
    'sync', 'race', 'rush', 'branch', 'spawn', 'await|0', 'batch|0', 'upon'
  ];

  const LITERALS = [ 'true|0', 'false|0', 'NaN', 'Inf' ];

  const TYPES = [
    'int|0', 'float|0', 'logic', 'string|0', 'char|0', 'char32', 'void|0',
    'any|0', 'comparable', 'rational', 'tuple|0', 'array|0', 'map|0',
    'option|0', 'type|0', 'subtype', 'castable_subtype', 'concrete_subtype',
    'weak_map'
  ];

  const BUILT_INS = [ 'Self', 'super' ];

  const KEYWORD_DEF = {
    $pattern: /[A-Za-z_]\w*/,
    keyword: KEYWORDS,
    literal: LITERALS,
    type: TYPES,
    built_in: BUILT_INS
  };

  // Bare words that must never be re-scoped as a call or definition title.
  const RESERVED_WORDS = []
    .concat(KEYWORDS, LITERALS, TYPES, BUILT_INS)
    .map((word) => word.replace(/\|\d+$/, ''));
  const NOT_RESERVED = `(?!(?:${RESERVED_WORDS.join('|')})\\b)`;

  const IDENT = '[A-Za-z_]\\w*';

  // ---------------------------------------------------------------- comments

  // `<#>` opens an indented block comment: the rest of the line, and the
  // indented block beneath it, are commentary. highlight.js is not
  // indentation-aware, so only the marker line itself is covered.
  const INDENTED_COMMENT = hljs.COMMENT(/<#>/, /$/, { relevance: 2 });

  // Verse block comments nest: `<# outer <# inner #> still outer #>`.
  // PowerShell shares the `<# ... #>` delimiters, so the relevance bonus here
  // is kept modest.
  const BLOCK_COMMENT = {
    scope: 'comment',
    begin: /<#(?!>)/,
    end: /#>/,
    relevance: 2,
    contains: [ 'self' ]
  };

  const LINE_COMMENT = hljs.COMMENT(/#/, /$/);

  // -------------------------------------------------------------- specifiers

  // Only known Verse specifiers are matched. A generic `<word>` rule would
  // collide with C++/Java/TypeScript generics such as `vector<int>`.
  const SPECIFIER_NAMES = [
    // access
    'public', 'internal', 'protected', 'private', 'scoped', 'epic_internal',
    // effects
    'computes', 'converges', 'decides', 'reads', 'writes', 'allocates',
    'transacts', 'suspends', 'diverges', 'no_rollback', 'predicts',
    'dictates', 'varies',
    // structure and behaviour
    'abstract', 'concrete', 'unique', 'final', 'final_super',
    'final_super_base', 'castable', 'persistable', 'constructor', 'override',
    'native', 'native_callable', 'localizes', 'open', 'closed', 'external',
    'getter', 'setter', 'available', 'experimental', 'deprecated', 'editable',
    'module_scoped_var_weak_map_key'
  ];

  const SPECIFIER_RE =
    `<(?:attribscope_[a-z_]+|${SPECIFIER_NAMES.join('|')})(?:[({][^)}]*[)}])?>`;

  // Specifiers are the single most reliable Verse marker, so they carry most of
  // the auto-detection weight. Verse shares a large keyword surface with Ruby
  // and Pascal; `<computes>` and friends do not appear in either.
  const SPECIFIER = {
    scope: 'meta',
    relevance: 3,
    match: new RegExp(SPECIFIER_RE)
  };

  // Zero or more specifiers glued to a name, e.g. `Foo<public><final>`.
  const SPECIFIER_LIST_RE = `(?:${SPECIFIER_RE})*`;

  // Attributes: `@editable`, `@editable_number`, `@doc`, `@available`, ...
  // Relevance 0: Ruby instance variables (`@score`) look identical.
  const ATTRIBUTE = {
    scope: 'meta',
    relevance: 0,
    match: new RegExp(`@${IDENT}`)
  };

  // ------------------------------------------------------------------- paths

  // A path rooted at one of Epic's published module domains can only be Verse.
  const VERSE_PATH = {
    scope: 'symbol',
    relevance: 10,
    match: /\/(?:Verse\.org|Fortnite\.com|UnrealEngine\.com|EpicGames\.com)(?:@[\w.-]+)?(?:\/[A-Za-z_][\w.-]*)+/
  };

  // Other module paths, e.g. `/MyProject/MyModule`. At least two segments are
  // required so plain division (`A/B`) is not hit. Scored at 0 because generic
  // filesystem paths in shell scripts look the same.
  const PATH = {
    scope: 'symbol',
    relevance: 0,
    match: /\/[A-Za-z_][\w.-]*(?:@[\w.-]+)?(?:\/[A-Za-z_][\w.-]*)+/
  };

  // ----------------------------------------------------------------- strings

  const ESCAPE = {
    scope: 'char.escape',
    match: /\\[rnt'"\\{}#<>&~]/
  };

  const SUBST = {
    scope: 'subst',
    begin: /\{/,
    end: /\}/,
    contains: [] // populated with MODES below
  };

  const STRING = {
    scope: 'string',
    begin: /"/,
    end: /"/,
    illegal: /\n/,
    contains: [ ESCAPE, SUBST ]
  };

  // Character literals: `'A'`, `'\n'`.
  const CHARACTER = {
    scope: 'string',
    match: /'(?:\\[rnt'"\\{}#<>&~]|[^'\\\n])'/
  };

  // ----------------------------------------------------------------- numbers

  const NUMBER = {
    scope: 'number',
    relevance: 0,
    variants: [
      { match: /\b0[xX][0-9a-fA-F]+\b/ },         // hexadecimal
      { match: /\b0[ou][0-9a-fA-F]+\b/ },         // char8 / char32 code points
      { match: /\b\d+\.\d+(?:[eE][+-]?\d+)?\b/ }, // float
      { match: /\b\d+(?:[eE][+-]?\d+)?\b/ }       // int
    ]
  };

  // ------------------------------------------------------------ declarations

  // `my_device<public> := class(creative_device):`
  const TYPE_DEFINITION = {
    begin: [
      new RegExp(IDENT),
      new RegExp(SPECIFIER_LIST_RE),
      /\s*/,
      /:=/,
      /\s*/,
      /(?:class|struct|interface|enum|module)\b/
    ],
    beginScope: {
      1: 'title.class',
      2: 'meta',
      4: 'operator',
      6: 'keyword'
    }
  };

  // `MyFunction<public>(Arg:int)<suspends>:void =` and ordinary calls.
  // Indexing is folded in on purpose: in Verse `Array[0]` *is* a failable call.
  const CALL = {
    begin: [
      new RegExp(`\\b${NOT_RESERVED}${IDENT}`),
      new RegExp(SPECIFIER_LIST_RE),
      /(?=[([])/
    ],
    beginScope: {
      1: 'title.function',
      2: 'meta'
    },
    relevance: 0
  };

  // Archetype instantiation: `button_device{}`, `my_class{Field := 1}`.
  // The brace must be adjacent, so that `if (X) {` and `else {` are untouched.
  const CONSTRUCTION = {
    scope: 'title.class',
    relevance: 0,
    match: new RegExp(`\\b${NOT_RESERVED}${IDENT}(?=\\{)`)
  };

  // `var Score : int = 0` and `set Score = 1`
  const MUTABLE_BINDING = {
    begin: [ /\b(?:var|set)\b/, /\s+/, new RegExp(IDENT) ],
    beginScope: {
      1: 'keyword',
      3: 'variable'
    }
  };

  const OPERATOR = {
    scope: 'operator',
    relevance: 0,
    match: /:=|=>|->|\.\.|[+\-*/]=|<>|<=|>=|[+\-*/=<>?^&|:]/
  };

  const MODES = [
    INDENTED_COMMENT,
    BLOCK_COMMENT,
    LINE_COMMENT,
    STRING,
    CHARACTER,
    NUMBER,
    VERSE_PATH,
    PATH,
    ATTRIBUTE,
    SPECIFIER,
    TYPE_DEFINITION,
    MUTABLE_BINDING,
    CALL,
    CONSTRUCTION,
    OPERATOR
  ];

  SUBST.contains = MODES;

  return {
    name: 'Verse',
    aliases: [ 'verse' ],
    keywords: KEYWORD_DEF,
    contains: MODES
  };
}

export { verse as default };

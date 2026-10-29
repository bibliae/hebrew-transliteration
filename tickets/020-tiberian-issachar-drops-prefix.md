# 020: Tiberian "Issachar" rule drops prefixes and suffixes

- **Type:** Bug
- **Priority:** Medium
- **Location:** `src/schemas/tiberian.ts:694-707`

## Problem

The pattern `/(וְ)?יִשָּׂשכָר/` isn't anchored, so it matches inside longer words. The callback then returns only `vav + issachar` and throws away the rest of the word. Prefixes such as `לְ` are lost. The existing tests only cover the plain and `וְ` forms.

## Repro

```js
transliterate("יִשָּׂשכָר", new Schema(tiberian));    // "jissɔːˈχɔːɔʀ̟"
transliterate("לְיִשָּׂשכָר", new Schema(tiberian));  // "jissɔːˈχɔːɔʀ̟"
transliterate("וּלְיִשָּׂשכָר", new Schema(tiberian)); // "jissɔːˈχɔːɔʀ̟"
```

**Expected:** the prefix is kept.

## Suggested fix

Replace only the matched part, so the rest of the word survives:

```ts
text.replace(heb, (_m, vav = "") => vav + issachar)
```

Add tests for the `לְ`, `בְּ` and `וּלְ` forms.

## Resolution

The callback now replaces only the matched part of the word, so a prefix survives and goes through the normal rules.

The vowel of the prefix's sheva follows the existing test for the `וְ` form (`vajissɔːˈχɔːɔʀ̟`), so `לְיִשָּׂשכָר` gives `lajissɔːˈχɔːɔʀ̟`. This is different from the schema's general rule for a sheva before a yod (`לְיִצְחָק` → `lijisˁˈħɔːɔq̟`). A version that produced `li-`/`vi-` broke the existing `וְ` test, so the author's choice was kept. **Needs a decision from the schema owner:** whether the prefix vowel before Issachar should be `a` or `i`.

Tests: `test/schemas/tiberian.test.ts` ("ticket 020"), next to the existing `issachar` tests.

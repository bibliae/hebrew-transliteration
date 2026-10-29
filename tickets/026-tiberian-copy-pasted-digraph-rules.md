# 026: Merge the five copy-pasted Tiberian digraph rules

- **Type:** Cleanup
- **Priority:** Low
- **Location:** `src/schemas/tiberian.ts:80-250`

## Problem

The Tav, Pe, Kaf, Tet and Tsadi "with Dagesh" features are near-identical copies, and their cross-reference comments are out of date. Two bugs come from this duplication: [004](004-tiberian-pe-rule-matches-every-pe.md) (wrong Pe pattern) and [007](007-tiberian-construct-gemination-mid-word.md) (construct check runs for letters inside the word).

## Suggested fix

Write one factory that takes the pattern, the schema key and the second character (e.g. `ʰ`), and build the five features from it. Fix 004 and 007 inside the factory.

## Resolution

The five rules are now built by `digraphWithDagesh(title, hebrew, consonant, key, secondChar)` in `src/schemas/tiberian.ts`. The fixes for [004](004-tiberian-pe-rule-matches-every-pe.md) and [007](007-tiberian-construct-gemination-mid-word.md) are part of it. Kaf's special case (`כ` or `ך` at the end of the previous syllable) is handled by passing a `consonant` pattern. The out-of-date cross-reference comments are gone, and the file is about 120 lines shorter.

One fix came with it. A schema without the digraph value (e.g. `{ ...tiberian, TAV_DAGESH: undefined }`) used to print the literal text "undefined" (`vaˈundefinedeːʃɛv`). It now falls back to the normal rules (`vaθˈθeːʃɛv`).

All 364 Hebrew strings in the test files give identical Tiberian output before and after the change.

Tests: `test/schemas/tiberian.test.ts` ("ticket 026").

# 015: `remove()` changes characters it wasn't asked to remove

- **Type:** Bug
- **Priority:** Medium
- **Location:** `src/sequence.ts:23-25`, called from `src/remove.ts`

## Problem

`remove()` passes the input through `sequence()`. When the text contains any Hebrew vowel, `sequence()` rebuilds it with havarotjs `Text`, and `Text` makes three changes:

- It applies compatibility normalization (NFKD), which also changes non-Hebrew text.
- It trims leading whitespace.
- It moves a holam male off its vav, onto the previous letter.

Without vowels the text is returned unchanged, so results also differ depending on whether the input is pointed.

## Repro

```js
remove("שָׁלוֹם");        // ...5dc 5b9 5d5...  (input was 5dc 5d5 5b9: the holam moved)
remove("  שָׁלוֹם");      // "שָׁלֹום"  (leading spaces gone)
remove("  שלום");        // "  שלום"  (kept)
remove("שָׁלוֹם café ½"); // "שָׁלֹום café 1⁄2"
```

**Expected:** only the requested marks are removed. Everything else stays as it was, apart from the documented mark reordering.

## Suggested fix

Do the reordering without havarotjs `Text`, e.g. with a small per-cluster sorter. Alternatively, remove characters from the original string and skip sequencing when it isn't needed.

## Notes

`sequence()` is public and behaves the same way. Decide whether `sequence()` itself should keep the holam male on the vav.

## Resolution

`remove()` now uses a new `sequenceMarks()` in `src/sequence.ts` instead of `sequence()`. `sequenceMarks()` uses havarotjs's low-level mark sorter (`havarotjs/utils/sequence`), the same consonant - dagesh - vowel - ta'am order `Text` uses, but skips the rest of what `Text` does. It doesn't normalize, trim or move a holam male. It only decomposes Hebrew presentation forms (U+FB1D–U+FB4F), so `remove()` can still strip their points.

`sequence()` itself is unchanged. It's public, and transliteration relies on its havarotjs behavior (see [017](017-feature-hebrew-not-sequenced.md)). Its docs now say that it normalizes, trims and moves a holam male.

Tests: `test/remove.test.ts` ("ticket 015"). The existing `remove()` tests pass unchanged.

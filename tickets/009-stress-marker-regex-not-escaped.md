# 009: Stress marker builds a regex from unescaped schema values

- **Type:** Bug
- **Priority:** Medium
- **Location:** `src/rules.ts:65-88` (`addStressMarker`)

## Problem

For the `before-vowel` and `after-vowel` locations, `addStressMarker` joins the schema's vowel strings into a `RegExp` without escaping them. This causes three failures:

- Regex metacharacters change what matches, or throw.
- An empty-string vowel matches at index 0.
- Michigan-Claremont's `SHUREQ: "W."` matches "W" followed by any character, so a consonantal vav is taken as the vowel.

## Repro

```js
const after = { location: "after-vowel", mark: "'" };
transliterate("מֶ֣לֶךְ", { SEGOL: "(e", STRESS_MARKER: after });
// SyntaxError: Invalid regular expression: ... Unterminated group
transliterate("מֶ֣לֶךְ", { HATAF_PATAH: "", STRESS_MARKER: after }); // "'melek"
transliterate("וַ֣יֵּלֶךְ", {
  ...michiganClaremont,
  STRESS_MARKER: { location: "before-vowel", mark: "'" }
}); // `'WAYY"LEK`
```

**Expected:** no error with `(e`, then `me'lek` and `W'AYY"LEK`.

## Suggested fix

Drop empty strings, and escape each vowel before joining them:

```ts
v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
```

## Resolution

`addStressMarker` now skips empty vowels and escapes each vowel with a new `escapeRegExp` helper. It inserts the mark at the match's index instead of calling `String.replace`, so the mark itself is inserted literally too (a mark of `$&` used to be expanded).

Tests: `test/transliterate.test.ts` ("ticket 009").

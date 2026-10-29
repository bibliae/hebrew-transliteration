# 018: Stress mark skipped when a letter maps to the mark character

- **Type:** Bug
- **Priority:** Low
- **Location:** `src/rules.ts:38-41` (`addStressMarker`)

## Problem

`text.includes(mark)` checks the transliterated output. If any letter in the syllable maps to the same character as the mark, the stress mark is skipped. Commit 6ed63e3 changed this check from `syl.text.includes(mark)`, which looked at the Hebrew text.

## Repro

```js
const stress = { location: "after-vowel", mark: "'" };
transliterate("אָ֣דָם", { ALEF: "'", STRESS_MARKER: stress }); // "'ādām"
transliterate("אָ֣דָם", { STRESS_MARKER: stress });            // "ʾā'dām"  (control)
```

**Expected:** `'ā'dām`. The `before-syllable` location fails the same way.

## Suggested fix

Go back to checking the Hebrew `syl.text`. It can only contain the mark if a feature inserted it.

## Resolution

The "already marked" check in `addStressMarker` once again looks at the Hebrew `syl.text`, as it did before commit 6ed63e3. The Hebrew only contains the mark if a pass-through feature put it there, so a mark added by a feature is still not doubled.

Tests: `test/transliterate.test.ts` ("ticket 018"). They cover both locations, a control, and a feature that adds the mark itself.

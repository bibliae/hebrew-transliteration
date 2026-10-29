# 011: No stress mark on SBL's long ī / ū

- **Type:** Bug
- **Priority:** Medium
- **Location:** `src/rules.ts:65-87` (`addStressMarker`), `src/schemas/sblAcademic.ts:396-411`

## Problem

SBL's default "Defective Long Vowels" feature outputs precomposed `ī` / `ū`, which is `HIRIQ` / `QUBUTS` plus a macron, normalized to NFC. `addStressMarker` only searches for the plain schema vowels, so it never finds the stressed vowel and adds no mark. This affects default SBL output whenever a stress marker is set.

## Repro

```js
transliterate("קֻ֣ם", { STRESS_MARKER: { location: "after-vowel", mark: "́" } });
// "qūm"  (no mark)
```

**Expected:** `qū́m`

## Suggested fix

Add the macron forms to the vowel list. Alternatively, match a base vowel plus any combining marks after NFD normalization.

## Resolution

The stress marker's vowel list now also includes `HIRIQ` and `QUBUTS` with a macron, composed to NFC (a new `withMacron` helper). These are the forms SBL's `defectiveLongVowels` feature outputs.

Tests: `test/transliterate.test.ts` ("ticket 011").

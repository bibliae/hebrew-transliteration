# 002: SBL's default features leak into other built-in schemas

- **Type:** Bug
- **Priority:** High
- **Location:** `src/transliterate.ts:76`

## Problem

`transliterate` treats any schema that isn't `instanceof Schema` as a partial SBL schema and wraps it in `new SBL(...)`. The built-in schemas are exported as plain object literals, so they all go through `SBL`.

Four of them don't define `ADDITIONAL_FEATURES`: brillAcademic, brillSimple, michiganClaremont and sblAcademicSpirantization. They pick up SBL's default "Defective Long Vowels" (macrons) and "Euphonic Dagesh" features.

## Repro

```js
transliterate("מִ֣ן", michiganClaremont); // "MĪN"  (non-ASCII in an ASCII scheme)
transliterate("קֻ֣ם", michiganClaremont); // "QŪM"
transliterate("מִ֣ן", brillSimple);       // "mīn"  (macron in a "simple" scheme)
```

**Expected:** each schema's own vowels, with no macron: `MIN`, `QUM`, `min`.

## Suggested fix

Export the built-in schemas as `new Schema({...})` instances, or have `transliterate` skip the SBL wrapper for complete schemas.

## Notes

- This depends on [001](001-schema-instance-crashes.md), because `new Schema(...)` currently crashes for these schemas.
- This leak is how [003](003-euphonic-dagesh-strips-dagesh-lene.md) reaches brillAcademic and sblAcademicSpirantization.
- Output changes for the four schemas. Existing tests may encode the leaked behavior, so add a changelog note.

## Resolution

While fixing this, a second symptom turned up. brillAcademic already uses `ī` / `ū` for `HIRIQ` / `QUBUTS`, and sblAcademicSpirantization uses `ū` for `QUBUTS`. SBL's "Defective Long Vowels" feature added another macron on top, giving `mī̄n` and `qū̄m`.

The fix takes a different route from the one suggested above. Exporting the schemas as `new Schema(...)` wouldn't help, because users spread them (`{ ...brillSimple, X }`), which turns them back into plain objects. Instead:

- SBL's two default features are now named exports of `src/schemas/sblAcademic.ts`: `defectiveLongVowels` and `euphonicDagesh`.
- The four schemas now declare `ADDITIONAL_FEATURES` explicitly, so nothing is inherited by accident:
  - michiganClaremont, brillSimple and brillAcademic: `[euphonicDagesh]`.
  - sblAcademicSpirantization: `[defectiveLongVowels, euphonicDagesh]`. It follows SBL's academic style.
- `defectiveLongVowels` no longer adds a macron to a vowel that already has one.

Output changes:
- The macrons are gone from michiganClaremont and brillSimple.
- The double macrons are gone from brillAcademic and sblAcademicSpirantization.
- All other output is unchanged, including the euphonic-dagesh handling.

**Needs a decision from the schema owner:** whether michiganClaremont and the Brill schemas should keep the euphonic-dagesh feature. It was kept so their output doesn't change.

Tests: `test/schemas/builtins.test.ts` ("ticket 002").

# 025: SBL constructor sets every field twice

- **Type:** Cleanup
- **Priority:** Low
- **Location:** `src/schemas/sblAcademic.ts:245-326` and `328-447`

## Problem

`super({...})` already sets every field with its default. Lines 328-447 then set every field again. The two lists have started to drift:

- `holemHaser` uses `||` in one list (line 324) and `??` in the other (line 446).
- The `ADDITIONAL_FEATURES` default appears only in the second list.

## Suggested fix

Build the defaults in a single object and pass it to `super()`. Remove the second list of assignments.

## Resolution

The SBL constructor now passes one object of defaults to `super()`, and the second list of `this.X = …` assignments is gone. Comparing the two lists showed where they had drifted. The second list's values were the ones in effect, so they're the ones kept:
- `ADDITIONAL_FEATURES` now defaults to `[defectiveLongVowels, euphonicDagesh]` in the single list.
- `holemHaser` and `ketivQeres` use `??`.

`ON_COMPLETE` was only in the `super()` list, and it stays. A comparison of `new SBL({})` and of an `SBL` with every field overridden gives identical objects before and after the change.

Tests: `test/transliterate.test.ts` ("ticket 025"). They check that every field is set, that the defaults hold, and that overrides (including `ON_COMPLETE`) are kept.

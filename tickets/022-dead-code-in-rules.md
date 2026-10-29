# 022: Remove dead code in `joinSyllableChars` and `materFeatures`

- **Type:** Cleanup
- **Priority:** Low
- **Location:** `src/rules.ts:208-226`, `src/rules.ts:308-310`

## Problem

- All four branches of `joinSyllableChars` return the same `sylChars.map(mapChars(schema)).join("")`. These are leftovers from the stress-marker refactor in commit 6ed63e3.
- The maqaf workaround in `materFeatures` never runs, because havarotjs puts the maqaf in its own cluster.

## Suggested fix

Replace `joinSyllableChars` with the single expression and delete the maqaf workaround. Do this together with [010](010-stress-marker-on-construct-and-paseq.md), which moves the guards to where they belong.

## Resolution

- `joinSyllableChars` is gone. Its last caller-visible effect (the stress guards) moved into `addStressMarker` in [010](010-stress-marker-on-construct-and-paseq.md), so the two call sites now map and join the characters directly.
- The maqaf workaround in `materFeatures` is removed. A check over several maqaf words confirmed that havarotjs always puts the maqaf in its own cluster, so a mater cluster never contains one.

No behavior change. The full suite passes unchanged.

Tests: `test/transliterate.test.ts` ("ticket 022") pins down maqaf output after each kind of mater, with the default and a custom `MAQAF`.

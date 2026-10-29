# 024: `prevWord.syllables` is recomputed twice per check

- **Type:** Cleanup (performance)
- **Priority:** Low
- **Location:** `src/rules.ts:190` (`isDageshChazaq`)

## Problem

`prevWord.syllables[prevWord.syllables.length - 1]` reads the `syllables` getter twice. havarotjs re-syllabifies the word on every read. This runs for every dagesh cluster, and for every cluster when the stress mark goes before the syllable.

## Suggested fix

Read it once with `prevWord.syllables.at(-1)`. The tiberian rules already do this.

## Resolution

`isDageshChazaq` now reads the previous word's syllables once (`prevWord.syllables.at(-1)`). For `מַה־זֹּאת`, the construct word is syllabified 2 times instead of 3. For a longer text with three construct pairs repeated 10 times, total `syllables` reads drop from 100 to 80.

Tests: `test/transliterate.test.ts` ("ticket 024"). One test spies on havarotjs's `Word.syllables` getter and checks the read count. The other checks that construct doubling still depends on the previous word's last syllable.

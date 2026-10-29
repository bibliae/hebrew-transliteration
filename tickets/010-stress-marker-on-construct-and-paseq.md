# 010: Stress marker is added to construct words and paseq

- **Type:** Bug
- **Priority:** Medium
- **Location:** `src/rules.ts:16` (`addStressMarker`), `src/rules.ts:208-226` (`joinSyllableChars`)

## Problem

Commit 6ed63e3 moved stress handling from `joinSyllableChars` into `addStressMarker`. Two guards didn't move with it: skip words in construct, and skip punctuation-only syllables such as paseq. Both guards are still in `joinSyllableChars`, where they now do nothing (see [022](022-dead-code-in-rules.md)).

## Repro

```js
const stress = { location: "after-syllable", mark: "ˈ" };
transliterate("בֵּ֣ית־אֵ֔ל", { STRESS_MARKER: stress });                // "bêt-ˈʾēlˈ"
transliterate("רַ֛עַל ׀ רַ֛עַל", { PASEQ: "|", STRESS_MARKER: stress }); // "raˈʿal |ˈ raˈʿal"
```

**Expected:** `bêt-ʾēlˈ` and `raˈʿal | raˈʿal`.

## Suggested fix

Move the `isInConstruct` and punctuation-only checks into `addStressMarker`, and delete them from `joinSyllableChars`.

## Resolution

`addStressMarker` now skips words in construct and punctuation-only syllables, as `joinSyllableChars` did before commit 6ed63e3. The copies of these checks left in `joinSyllableChars` are dead code and are removed in [022](022-dead-code-in-rules.md), so this commit only changes behavior.

Tests: `test/transliterate.test.ts` ("ticket 010").

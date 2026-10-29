# 005: Divine Name drops an attached sof pasuq or maqaf

- **Type:** Bug
- **Priority:** Medium
- **Location:** `src/rules.ts:157-164` (`getDivineName`)

## Problem

`getDivineName` keeps the word's first and last character only when they aren't Hebrew. But `hebChars` covers the whole Hebrew block (U+0590–U+05FF), which includes sof pasuq (U+05C3) and maqaf (U+05BE). Both are dropped, and a maqaf loss runs two words together.

## Repro

```js
transliterate("נְאֻם יְהוָה׃", { SOF_PASUQ: "." }); // "nəʾūm yhwh"
transliterate("יְהוָה־צְבָאוֹת");                  // "yhwhṣəbāʾôt"
```

**Expected:** `nəʾūm yhwh.` and `yhwh-ṣəbāʾôt`.

## Suggested fix

Map leading and trailing punctuation (sof pasuq, maqaf, paseq) through the schema instead of dropping it. For example, strip the Divine Name's letters and points, then run what's left through `mapChars`.

## Resolution

`getDivineName` now keeps everything before the Divine Name's first letter and after its last letter. It strips the points and accents that belong to those letters and maps the rest through `mapChars`, so maqaf, paseq and sof pasuq use the schema's values. This also fixes a related case: the old code kept only one character on each side, so `(יְהוָה),` lost its comma.

Tests: `test/transliterate.test.ts` ("ticket 005").

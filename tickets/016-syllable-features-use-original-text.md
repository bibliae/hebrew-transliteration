# 016: Later syllable features ignore earlier pass-through output

- **Type:** Bug
- **Priority:** Medium
- **Location:** `src/rules.ts:480-506` (`sylRules`), and the suffix checks at `src/rules.ts:519-538`

## Problem

`sylRules` tests and transliterates every syllable feature against `baseSyllableText`, which is the original syllable. When an earlier pass-through feature changes the syllable, later features never see that change. The `MS_SUFX`, `SEGOL_HE`, `TSERE_HE` and `PATAH_HE` checks have the same problem. Cluster features handle this correctly.

## Repro

```js
const features = (type) => [
  { FEATURE: type, HEBREW: "ד", TRANSLITERATION: (x) => x.text.replace("ד", "ב") },
  { FEATURE: type, HEBREW: "ב", TRANSLITERATION: "X" }
];
transliterate("דָּבָר", { ADDITIONAL_FEATURES: features("syllable") }); // "bāXār"
transliterate("דָּבָר", { ADDITIONAL_FEATURES: features("cluster") });  // "XāXār"
```

**Expected:** `XāXār` for both.

## Suggested fix

Keep a running syllable text that each pass-through feature updates, and test the next feature against it. Run the suffix checks against the current `syl.text` (with taamim removed), not `baseSyllableText`.

## Resolution

**Partly fixed. The matching behavior is now documented instead of changed.**

Matching each syllable feature against the current text, as proposed above, breaks 10 Tiberian tests. The Tiberian schema relies on matching the original Hebrew. Its features gradually replace Hebrew with IPA, and later features use lookbehinds such as "no Hebrew vowel before this sheva". Once the "Full Vowel Syllable" feature has turned the patah into `ɑ`, the "Syllable with Sheva" feature wrongly treats the sheva as vocal: `dɑrˁˈkʰoː` becomes `dɑrˁɑˈkʰoː`. Custom schemas modeled on Tiberian would break the same way. So this behavior stays, and the `PASS_THROUGH` docs now describe it:
- Syllable features are matched against the original syllable.
- Each callback receives the syllable as updated by earlier pass-through features.
- Cluster and word features (since [013](013-word-feature-pass-through-stops-chain.md)) are matched against the current text.

The bug that remained is fixed. The `MS_SUFX`, `SEGOL_HE`, `TSERE_HE` and `PATAH_HE` checks after the feature loop now look at the syllable's current text, so a tsere produced by a feature gets `TSERE_HE` (Repro B above).

**Needs a decision from the maintainer:** whether syllable features should get an opt-in way to be matched against the current text, e.g. a per-feature flag.

Tests: `test/transliterate.test.ts` ("ticket 016"). They cover the fixed suffix checks and the documented matching behavior.

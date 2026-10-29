# 019: Syllable separator missing when `MAQAF` uses the same character

- **Type:** Bug
- **Priority:** Low
- **Location:** `src/transliterate.ts:97`

## Problem

`c.includes(SYLLABLE_SEPARATOR)` is there to avoid adding a second separator after dagesh-chazaq doubling, which inserts one itself. But it also fires when `MAQAF`, or a feature's output, produces the same character. SBL's `MAQAF` is already `"-"`, so setting `SYLLABLE_SEPARATOR: "-"` hits this.

## Repro

```js
transliterate("וְכָל־הָאָרֶץ", { SYLLABLE_SEPARATOR: "-" });              // "wəkol-hā-ʾā-reṣ"
transliterate("וְכָל־הָאָרֶץ", { SYLLABLE_SEPARATOR: "-", MAQAF: "=" }); // "wə-kol=hā-ʾā-reṣ"
```

**Expected:** `wə-kol-hā-ʾā-reṣ`

## Suggested fix

Replace the substring test with an explicit check for a doubled first consonant. For example, export `isDageshChazaq` and test the syllable's first cluster.

## Done when

The doubling case keeps working: `transliterate("שַׁבָּת", { SYLLABLE_SEPARATOR: "-" })` still gives `šab-bāt`.

## Resolution

`transliterate` now skips the separator only when the syllable starts with a doubled consonant. A new exported helper, `startsWithDoubledConsonant` in `src/rules.ts`, checks for that. The "before-syllable" stress marker ([012](012-stress-before-syllable-doubled-consonant.md)) uses the same helper. Also fixed: feature output that happens to contain the separator character no longer suppresses the separator.

Tests: `test/transliterate.test.ts` ("ticket 019"). The existing separator tests (`haq-qiṭ-ṭēr`, `yā.eer`) still pass.

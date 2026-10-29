# 003: "Euphonic Dagesh" rule removes a normal dagesh lene

- **Type:** Bug
- **Priority:** High
- **Location:** `src/schemas/sblAcademic.ts:414-432` (default `ADDITIONAL_FEATURES`; `euphonicDagesh` after ticket 002)

## Problem

The rule removes the dagesh from the first syllable of any word that follows a construct (maqaf) word. It doesn't check that the previous word ends in an open syllable, which is the only place a euphonic dagesh occurs. After a closed syllable the dagesh is a dagesh lene. Removing it makes BGDKPT letters spirantized in any schema that has `*_DAGESH` values.

## Repro

```js
transliterate("אֶת־כָּל", sblAcademicSpirantization);   // "ʾeṯ-ḵol"
transliterate("עַל־בְּנֵי", sblAcademicSpirantization); // "ʿal-ḇənê"
transliterate("בֶּן־דָּוִד", sblAcademicSpirantization); // "ben-ḏāwīḏ"
transliterate("עַל־פְּנֵי", brillAcademic);             // "ʿal-p̄ᵉnê"
transliterate("עַל־בְּנֵי", { BET: "v", BET_DAGESH: "b" }); // "ʿal-vənê"
```

**Expected:** the letter stays plosive: `ʾeṯ-kol`, `ʿal-bənê`, `ben-dāwīḏ`, `ʿal-pᵉnê`, `ʿal-bənê`.

## Suggested fix

Leave the syllable unchanged unless `!prevWord.syllables.at(-1)?.isClosed`. The tiberian dagesh rules already use this check.

Also check the BGDKPT case after an open syllable. Even a euphonic dagesh marks the letter as plosive, so removing it outright may still give the spirant form.

## Notes

The doc comment at `sblAcademic.ts:180-196` repeats the rule and needs the same change.

## Resolution

The fix also covers a third case that turned up while working on this. The rule removed the *first* dagesh in the syllable, which could be the dagesh of a shureq. So `כִּי־הוּא` came out as `kî-hwʾ`, even in default SBL.

`euphonicDagesh` now:
- leaves the syllable alone when the previous word ends in a closed syllable;
- only touches a dagesh on the syllable's first consonant;
- maps a BeGaDKePaT letter with a euphonic dagesh to its plosive value (`*_DAGESH`) when the schema has one, instead of letting it spirantize (`mah-beṣaʿ`, not `mah-ḇeṣaʿ`).

The SBL doc comment used to repeat the feature code, and that copy had drifted. It now briefly describes each default feature instead.

Tests: `test/transliterate.test.ts` ("ticket 003").

# 027: A `$` in a schema value is read as a replacement pattern

- **Type:** Bug
- **Priority:** Medium
- **Location:** `src/rules.ts` (`replaceWithRegex`, and the `SHUREQ`, `MS_SUFX`, `SEGOL_HE`, `TSERE_HE` and `PATAH_HE` replacements in `cluterRules` and `sylRules`)

Found while fixing [008](008-holam-haser-furtive-patah-ignored.md); not part of the original review.

## Problem

Schema values are inserted with `String.replace(pattern, value)`. That reads `$$`, `$&`, `` $` `` and `$'` in the value as replacement patterns, so a value containing `$` can come out differently.

Michigan-Claremont uses `$` for `SHIN`. A doubled shin is written `"$" + "$"`, which `String.replace` turns into a single `$`, so the doubling is lost.

## Repro

```js
transliterate("הַשָּׁמַ֖יִם", michiganClaremont); // "HA$FMAYIM"
transliterate("מִשָּׁם", michiganClaremont);      // "MI$FM"
transliterate("דְּבָרָ֖יו", { MS_SUFX: "$&" });   // "dəbārāyw": "$&" inserts the matched "āyw" again
```

**Expected:** `HA$$FMAYIM`, `MI$$FM` and `dəbār$&`.

## Suggested fix

Insert schema values with a replacer function, `input.replace(pattern, () => value)`, so they're used literally.

## Resolution

- `replaceWithRegex` now inserts its value with a replacer function. So do the `SHUREQ` replacement in `cluterRules` and the `MS_SUFX`, `SEGOL_HE`, `TSERE_HE` and `PATAH_HE` replacements in `sylRules`.
- A feature's own `TRANSLITERATION` string still uses `String.replace` semantics, so a `$1` there keeps working as before.
- The other places that insert schema values already used replacer functions: the furtive patah (008), the stress marker (009) and doubled consonants (023).

Tests: `test/schemas/builtins.test.ts` and `test/transliterate.test.ts` ("ticket 027").

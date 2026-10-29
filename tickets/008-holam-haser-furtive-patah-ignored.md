# 008: `HOLAM_HASER` and `FURTIVE_PATAH` options are ignored

- **Type:** Bug
- **Priority:** Medium
- **Location:** `src/rules.ts:249` (`mapChars`), `src/rules.ts:409-424` (`cluterRules`)

## Problem

Both options are required in `Schema`, documented with examples (`schema.ts:502-520`, `schema.ts:671-687`) and set in every built-in schema. Neither is ever read:

- `mapChars` maps U+05BA (holam haser for vav) to `HOLAM`.
- The furtive-patah branch moves the patah before the guttural, then still outputs `PATAH`.

## Repro

```js
transliterate("עָוֺן֙", { HOLAM_HASER: "X", holemHaser: "preserve" }); // "ʿāwōn"
transliterate("נֹ֖חַ", { FURTIVE_PATAH: "X" });                       // "nōaḥ"
```

**Expected:** `ʿāwXn` and `nōXḥ`.

## Suggested fix

- Map U+05BA to `HOLAM_HASER`.
- Have the furtive branch emit a value that maps to `FURTIVE_PATAH`.

Before merging, compare each built-in schema's values for these two keys with its current output, so the fix doesn't change output by surprise.

## Resolution

- `mapChars` maps U+05BA to `HOLAM_HASER`, and `HOLAM_HASER` is in the stress marker's vowel list. This only shows with `holemHaser: "preserve"` or `"update"`. With `"remove"`, the default in every built-in schema, havarotjs turns U+05BA into a plain holam first.
- The furtive-patah branch now outputs `FURTIVE_PATAH` before the consonant, using a replacer function so `$` in the value is kept literally.
- Every built-in schema has `HOLAM_HASER === HOLAM` and `FURTIVE_PATAH === PATAH`, except Romaniote. Its `FURTIVE_PATAH` was a Latin `"a"` in an otherwise Greek schema. It's now `"α"`, so Romaniote's output doesn't change; its existing furtive tests cover this.

Tests: `test/transliterate.test.ts` ("ticket 008").

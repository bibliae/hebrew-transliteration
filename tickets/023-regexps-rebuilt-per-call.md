# 023: Compile feature and vowel RegExps once per schema

- **Type:** Cleanup (performance)
- **Priority:** Low
- **Location:** `src/rules.ts:380-383`, `482-485`, `557-561`, `65-88`, `467`

## Problem

- For every cluster, syllable and word, the code filters `ADDITIONAL_FEATURES` again and compiles `new RegExp(feature.HEBREW, "u")`.
- `addStressMarker` rebuilds and sorts the vowel list and its RegExp for every stressed syllable.
- `cluterRules` builds a new RegExp for every doubled cluster.

## Suggested fix

Precompute the features by type, along with their RegExps and the vowel RegExp, once per `transliterate` call or per schema. Cache them in a `WeakMap` keyed by the schema. This is also a natural place to apply the fixes in [009](009-stress-marker-regex-not-escaped.md) and [017](017-feature-hebrew-not-sequenced.md).

## Resolution

- **Feature RegExps:** `compileFeature` caches each feature's sequenced `HEBREW` value and RegExp in a `WeakMap` keyed by the feature object. An entry is rebuilt if the feature's `HEBREW` or the schema's `holemHaser` has changed, since sequencing ([017](017-feature-hebrew-not-sequenced.md)) depends on it.
- **Stress-marker vowels:** the vowel RegExp is cached by its pattern (`cachedRegExp`, capped at 100 entries).
- **Doubled consonants:** a plain string replacement replaces the per-cluster RegExp.
- **Not cached:** filtering `ADDITIONAL_FEATURES` by type. It's cheap, and caching it could go stale if a user changes the array in place.

Median time to transliterate Genesis 1:1–2 repeated 40 times (7 runs, after a warm-up):

| Schema | Before | After |
|--------|-------:|------:|
| SBL | 117 ms | 112 ms |
| SBL with stress marker | 149 ms | 137 ms |
| tiberian | 225 ms | 151 ms |
| romaniote | 144 ms | 110 ms |

Tests: `test/transliterate.test.ts` ("ticket 023") checks that the caches don't go stale. Each test fails if its cache check is removed.

# Tickets

Issues found in a code review of `src/` at commit `880cc68`. Ticket 027 was found later, while fixing 008. Each bug was reproduced against that commit with havarotjs 0.25.4, and the outputs shown in the tickets are real. None of these cases was covered by the existing tests. Each ticket ends with a Resolution section that describes the fix and names its regression tests.

The repros assume these imports:

```js
import { transliterate, Schema, SBL, remove } from "hebrew-transliteration";
import {
  brillAcademic, brillSimple, michiganClaremont,
  sblAcademicSpirantization, sblSimple, tiberian
} from "hebrew-transliteration/schemas";
import { all, vowels } from "hebrew-transliteration/removeOptions";
```

## Suggested order

Fix 001 first, then 002. 002 changes how the built-in schemas run and depends on 001, and it's also how 003 reaches the Brill and spirantization schemas. Fix 004 and 007 together through 026.

## High

| # | Ticket | Area |
|---|--------|------|
| 001 | [`new Schema(...)` crashes for 7 of 8 built-in schemas](001-schema-instance-crashes.md) | transliterate |
| 002 | [SBL's default features leak into other built-in schemas](002-sbl-defaults-leak-into-schemas.md) | transliterate |
| 003 | ["Euphonic Dagesh" rule removes a normal dagesh lene](003-euphonic-dagesh-strips-dagesh-lene.md) | SBL schema |
| 004 | [Tiberian "Pe with Dagesh" rule matches pe without a dagesh](004-tiberian-pe-rule-matches-every-pe.md) | Tiberian schema |

## Medium

| # | Ticket | Area |
|---|--------|------|
| 005 | [Divine Name drops an attached sof pasuq or maqaf](005-divine-name-drops-punctuation.md) | rules |
| 006 | [Prefix before the Divine Name loses syllables](006-divine-name-prefix-loses-syllables.md) | rules |
| 007 | [Tiberian construct doubling applies to every letter in the word](007-tiberian-construct-gemination-mid-word.md) | Tiberian schema |
| 008 | [`HOLAM_HASER` and `FURTIVE_PATAH` options are ignored](008-holam-haser-furtive-patah-ignored.md) | rules |
| 009 | [Stress marker builds a regex from unescaped schema values](009-stress-marker-regex-not-escaped.md) | stress marker |
| 010 | [Stress marker is added to construct words and paseq](010-stress-marker-on-construct-and-paseq.md) | stress marker |
| 011 | [No stress mark on SBL's long ī / ū](011-stress-marker-missing-on-long-vowels.md) | stress marker |
| 013 | [Word features stop after the first pass-through match](013-word-feature-pass-through-stops-chain.md) | features |
| 015 | [`remove()` changes characters it wasn't asked to remove](015-remove-changes-untouched-text.md) | remove / sequence |
| 016 | [Later syllable features ignore earlier pass-through output](016-syllable-features-use-original-text.md) | features |
| 017 | [Feature `HEBREW` strings don't match normal (NFC) Hebrew](017-feature-hebrew-not-sequenced.md) | features |
| 020 | [Tiberian "Issachar" rule drops prefixes and suffixes](020-tiberian-issachar-drops-prefix.md) | Tiberian schema |
| 027 | [A `$` in a schema value is read as a replacement pattern](027-dollar-in-schema-values.md) | rules |

## Low

| # | Ticket | Area |
|---|--------|------|
| 012 | ["Before-syllable" stress mark lands in the wrong place on doubled consonants](012-stress-before-syllable-doubled-consonant.md) | stress marker |
| 014 | [`remove()` leaves holam haser for vav (U+05BA)](014-remove-leaves-holam-haser-for-vav.md) | remove |
| 018 | [Stress mark skipped when a letter maps to the mark character](018-stress-marker-skipped-if-mark-in-output.md) | stress marker |
| 019 | [Syllable separator missing when `MAQAF` uses the same character](019-separator-skipped-when-maqaf-matches.md) | transliterate |
| 021 | [Documented `new SBL()` example crashes](021-sbl-docs-example-crashes.md) | SBL schema / docs |

## Cleanup

| # | Ticket | Area |
|---|--------|------|
| 022 | [Remove dead code in `joinSyllableChars` and `materFeatures`](022-dead-code-in-rules.md) | rules |
| 023 | [Compile feature and vowel RegExps once per schema](023-regexps-rebuilt-per-call.md) | rules |
| 024 | [`prevWord.syllables` is recomputed twice per check](024-prevword-syllables-computed-twice.md) | rules |
| 025 | [SBL constructor sets every field twice](025-sbl-constructor-duplicate-assignments.md) | SBL schema |
| 026 | [Merge the five copy-pasted Tiberian digraph rules](026-tiberian-copy-pasted-digraph-rules.md) | Tiberian schema |

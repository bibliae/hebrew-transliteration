# 006: Prefix before the Divine Name loses syllables

- **Type:** Bug
- **Priority:** Medium
- **Location:** `src/rules.ts:549-551` (`wordRules`), `src/rules.ts:161-162`

## Problem

When the Divine Name has a prefix, only `word.syllables[0]` of the word is transliterated. A prefix of two or more syllables loses everything after its first syllable.

Two related problems:
- The joiner is a hard-coded `"-"`.
- The hiriq test in `getDivineName` scans the whole word. A hiriq in the prefix therefore picks `DIVINE_NAME_ELOHIM`.

## Repro

```js
transliterate("וְלַיהוָה"); // "wə-yhwh"
transliterate("וּבַיהוָה"); // "û-yhwh"
transliterate("מִיְהוָה", { DIVINE_NAME_ELOHIM: "ELOHIM" }); // "miy-ELOHIM"
```

**Expected:** `wəla-yhwh` and `ûba-yhwh`. The last case should use `DIVINE_NAME`, because the hiriq belongs to the prefix.

## Suggested fix

Transliterate every syllable before the Divine Name, and only test for hiriq within the Divine Name itself. Decide whether the joiner should come from the schema.

## Resolution

- The new `getDivineNamePrefix` finds where the Divine Name's letters start in the word. It transliterates every syllable before that point and joins them with `SYLLABLE_SEPARATOR`.
- A syllable that runs into the Divine Name, such as `מִיְ` in `מִיְהוָה` or `לֵי` in `לֵיהוִה`, is cut at the start of the name. The cut-off part is built with `copySyllable`, so it keeps its stress and context.
- `getDivineName` now only looks for a hiriq within the Divine Name itself.
- The `-` joiner stays hard-coded. It follows SBL's convention (`ba-yhwh`), and existing tests rely on it.

Tests: `test/transliterate.test.ts` ("ticket 006").

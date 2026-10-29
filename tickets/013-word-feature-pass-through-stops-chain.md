# 013: Word features stop after the first pass-through match

- **Type:** Bug
- **Priority:** Medium
- **Location:** `src/rules.ts:557-578` (`wordRules`)

## Problem

A matching word feature with `PASS_THROUGH` (the default) returns `new Word(...)` immediately. This has two effects:

- Later word features never run. Cluster and syllable features chain, but word features don't.
- The new `Word` has no `prev`/`next` links. Rules that depend on context, such as construct doubling, stop working, even if the callback returns the text unchanged.

## Repro

```js
// Both calls set ADDITIONAL_FEATURES, so SBL's default features are off in both.
const off = { FEATURE: "cluster", HEBREW: "NOMATCH", TRANSLITERATION: "x" };
const noop = { FEATURE: "word", HEBREW: "ז", TRANSLITERATION: (w) => w.text };
transliterate("מַה־זֹּאת", { ADDITIONAL_FEATURES: [off] });  // "mah-zzōʾt"
transliterate("מַה־זֹּאת", { ADDITIONAL_FEATURES: [noop] }); // "mah-zōʾt"

transliterate("דָּבָר", {
  ADDITIONAL_FEATURES: [
    { FEATURE: "word", HEBREW: "ד", TRANSLITERATION: (w) => w.text },
    { FEATURE: "word", HEBREW: "ב", TRANSLITERATION: "B" }
  ]
}); // "dābār"
```

**Expected:** a no-op feature doesn't change output (`mah-zzōʾt`), and the second feature still applies (`dāBār`).

## Suggested fix

Keep looping over features with the updated text, as syllable features should (see [016](016-syllable-features-use-original-text.md)). When the text has changed, rebuild the `Word` once at the end and carry over the `prev`/`next` links.

## Resolution

`wordRules` now loops over every word feature. Each one is tested against, and receives, the result of the previous pass-through feature.

The word is only rebuilt when a feature changes its text. The rebuild uses a new `copyWord` helper, which carries over the `prev`/`next` links, so rules that depend on the surrounding words (such as construct doubling) keep working.

Tests: `test/transliterate.test.ts` ("ticket 013").

# 017: Feature `HEBREW` strings don't match normal (NFC) Hebrew

- **Type:** Bug
- **Priority:** Medium
- **Location:** `src/rules.ts:383`, `485`, `561`

## Problem

havarotjs reorders the input text: consonant, then shin/sin dot, then dagesh, then vowel. But a feature's `HEBREW` string is used exactly as written. A normal NFC string puts the vowel before the dagesh, so it never matches, and custom features silently do nothing.

The doc example at `schema.ts:1550` (`שְׁתַּיִם`) only works because it was typed in havarotjs order. The same string normalized to NFC doesn't match.

## Repro

```js
const nfc = "דָּבָר".normalize("NFC"); // 5d3 5b8 5bc ...
transliterate("דָּבָר", {
  ADDITIONAL_FEATURES: [{ FEATURE: "word", HEBREW: nfc, TRANSLITERATION: "DAVAR" }]
}); // "dābār"

transliterate("בָּא", {
  ADDITIONAL_FEATURES: [{ FEATURE: "cluster", HEBREW: "בָּ".normalize("NFC"), TRANSLITERATION: "BA" }]
}); // "bāʾ"
```

**Expected:** `DAVAR` and `BAʾ`. The same feature written in havarotjs order (`5d3 5bc 5b8 ...`) does give `DAVAR`.

## Suggested fix

Run string `HEBREW` values through `sequence()` before building the RegExp. Document that RegExp values must be written in havarotjs order.

## Resolution

- A new `sequenceFeatureHebrew` helper prepares a `HEBREW` string made only of Hebrew characters before it's turned into a RegExp. It puts the marks in havarotjs order with `sequenceMarks` (from [015](015-remove-changes-untouched-text.md)), then applies havarotjs's own holem-waw handling with the schema's `holemHaser`. That's the same order the text being matched is in.
- Callbacks receive this sequenced string as their `hebrew` argument, so `text.replace(hebrew, …)` works.
- A RegExp, or a string with regex syntax (anything that isn't Hebrew or whitespace), is used as written. The `HEBREW` docs now say it must be in havarotjs order.
- Not covered: qamets-qatan conversion. With `qametsQatan: true`, the text has U+05C7 where the input had a qamets, so a feature has to use U+05C7 too. The fix doesn't convert a feature's string, because the conversion depends on the surrounding word.

Tests: `test/transliterate.test.ts` ("ticket 017").

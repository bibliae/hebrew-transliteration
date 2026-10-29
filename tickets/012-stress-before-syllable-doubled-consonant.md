# 012: "Before-syllable" stress mark lands in the wrong place on doubled consonants

- **Type:** Bug
- **Priority:** Low
- **Location:** `src/rules.ts:47-56` (`addStressMarker`)

## Problem

When a syllable starts with a doubled consonant, the code splits the output at the length of `schema[characterName]`. That's the plain letter's value (e.g. `KAF`), not the dagesh value that was actually output (`KAF_DAGESH`). It also ignores the `SYLLABLE_SEPARATOR` that `getDageshChazaqVal` inserts.

## Repro

```js
const stress = { location: "before-syllable", mark: "ˈ" };
transliterate("הַכֹּ֣ל", { ...sblSimple, STRESS_MARKER: stress });              // "hakkˈol"
transliterate("הַמֶּ֣לֶךְ", { SYLLABLE_SEPARATOR: "-", STRESS_MARKER: stress }); // "hamˈ-me-lek"
```

**Expected:** `hakˈkol` and `ham-ˈme-lek`.

## Suggested fix

Work out the split point from the doubled output itself, i.e. the value from `getDageshChazaqVal` plus the separator. Don't recompute it from the plain letter.

## Resolution

For a syllable whose first consonant is doubled, the mark now goes where the consonant's own (undoubled) value starts again in the syllable's output:
- The value comes from a new helper, `getConsonantValue`. It picks the `*_DAGESH` value when the schema has one, and tells sin from shin.
- This also works when features produce the doubling, as the Tiberian digraph rules do. Before, Tiberian tet and tsadi were split inside the digraph (`mɑttˈˁɔː`); now they're split between the two halves (`mɑtˈtˁɔː`).
- When `DAGESH_CHAZAQ` is a mark rather than `true`, nothing is doubled, so the mark goes before the syllable.

One existing Tiberian expectation (`qof > word initial doubled`) encoded the old split inside the tsadi digraph (`issˈˁiː`). It now expects `isˈsˁiː`, the same pattern as tav and pe in the same file (`vatˈtʰeːʃɛv`, `hapˈpʰɛː`).

Tests: `test/transliterate.test.ts` and `test/schemas/tiberian.test.ts` ("ticket 012").

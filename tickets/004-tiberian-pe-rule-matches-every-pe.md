# 004: Tiberian "Pe with Dagesh" rule matches pe without a dagesh

- **Type:** Bug
- **Priority:** High
- **Location:** `src/schemas/tiberian.ts:126`

## Problem

The rule's pattern is `/פ/u`, while the sibling rules use the letter plus dagesh (`/תּ/u`, `/כּ|ךּ/u`, `/טּ/u`, `/צּ/u`). Every pe enters the rule. After a construct word that ends in an open syllable, a fricative pe is doubled and aspirated.

## Repro

```js
transliterate("מַה־יָּפִ֤ית", new Schema(tiberian)); // "mah-ɟɟɔːˈppʰiːiθ"
transliterate("יָּפִ֤ית", new Schema(tiberian));     // "ɟɟɔːˈfiːiθ"  (correct)
```

**Expected:** `mah-ɟɟɔːˈfiːiθ` (Song 7:7).

## Suggested fix

Change the pattern to `/פּ/u` (pe + U+05BC).

## Notes

See [026](026-tiberian-copy-pasted-digraph-rules.md). Building the five digraph rules from one factory would have prevented this.

## Resolution

The rule's pattern is now `/פּ/u` (pe + dagesh), like its sibling rules.

Tests: `test/schemas/tiberian.test.ts` ("ticket 004"). They cover the Song 7:7 case, plus pe with a dagesh lene, a doubled pe and a fricative pe, so the narrower pattern doesn't break those.

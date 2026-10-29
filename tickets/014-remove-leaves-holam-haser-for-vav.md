# 014: `remove()` leaves holam haser for vav (U+05BA)

- **Type:** Bug
- **Priority:** Low
- **Location:** `src/remove.ts:448-449` (`removeMap`)

## Problem

`HOLAM_HASER_FOR_VAV` is commented out of `removeMap`. The comment says `sequence()` never outputs it, but it does. The `all`, `points` and `vowels` presets all leave it in the text.

## Repro

```js
remove("עָוֺן", all);    // code points: 5e2 5d5 5ba 5df
remove("עָוֺן", vowels); // code points: 5e2 5d5 5ba 5df
```

**Expected:** `5e2 5d5 5df`

## Suggested fix

Restore the `removeMap` entry. Add a `HOLAM_HASER_FOR_VAV` option to `RemoveOptions`, and include it in the `vowels` and `points` presets.

## Resolution

- `RemoveOptions` has a new `HOLAM_HASER_FOR_VAV` option, the `removeMap` entry is restored, and the `points` and `vowels` presets (and therefore `all`) include it.
- With the old comment about `sequence()` removed, the option behaves like every other vowel option.

Tests: `test/remove.test.ts` ("ticket 014").

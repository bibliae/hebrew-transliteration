# 007: Tiberian construct doubling applies to every letter in the word

- **Type:** Bug
- **Priority:** Medium
- **Location:** `src/schemas/tiberian.ts:96`, `135`, `166`, `199`, `231`

## Problem

In the Tav, Pe, Kaf, Tet and Tsadi "with Dagesh" rules, one check doubles the letter when the previous word is in construct and ends in an open syllable. That check runs before the check that the cluster starts the word. A dagesh lene inside the word, after a silent sheva, gets doubled too.

## Repro

```js
transliterate("מִֽי־יִשְׁפֹּ֖ט", new Schema(tiberian)); // "ˌmiˑ-jiʃˈppʰoːotˁ"
transliterate("יִשְׁפֹּ֖ט", new Schema(tiberian));     // "jiʃˈpʰoːotˁ"  (correct)
transliterate("מִי־יִשְׁתֶּה", tiberian);             // "miː-jiʃˈttʰɛː"
```

**Expected:** `ˌmiˑ-jiʃˈpʰoːotˁ` and `miː-jiʃˈtʰɛː`.

## Suggested fix

Only run the construct check when the cluster is the first in the word (`!cluster.prev`). Fix it in one place as part of [026](026-tiberian-copy-pasted-digraph-rules.md).

## Resolution

In all five rules, the construct check now sits inside the "cluster starts the word" branch (`!cluster.prev || cluster.prev.value?.isNotHebrew`). A letter inside the word goes on to the existing dagesh-lene / dagesh-chazaq check.

Tests: `test/schemas/tiberian.test.ts` ("ticket 007"). They cover the letters inside a word that used to be doubled, and the word-initial doubling that must still happen.

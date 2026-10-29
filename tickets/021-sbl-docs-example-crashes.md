# 021: Documented `new SBL()` example crashes

- **Type:** Bug (docs)
- **Priority:** Low
- **Location:** `src/schemas/sblAcademic.ts:200-216` (doc example), `src/schemas/sblAcademic.ts:244` (constructor)

## Problem

Passing any `ADDITIONAL_FEATURES` replaces SBL's default features instead of adding to them. That part is intended. The doc comment includes an example, "Extending SBL with a new feature and keeping the default features", that gets the defaults by calling `new SBL()`. The constructor has no default argument, so that call throws.

## Repro

```js
new SBL();
// TypeError: Cannot read properties of undefined (reading 'VOCAL_SHEVA')
new SBL({}).ADDITIONAL_FEATURES.length; // 2  (works)
```

**Expected:** the example runs as written.

## Suggested fix

- Give the constructor a default argument: `constructor(schema: Partial<Schema> = {})`.
- Optionally, explain on the docs site that custom features replace the defaults, and show how to keep them. Today only the TypeDoc comment says this.

## Resolution

The `SBL` constructor now defaults its argument to `{}`, so the documented `new SBL()` example works. The fact that custom features replace the defaults is described in the SBL `ADDITIONAL_FEATURES` docs. Since [003](003-euphonic-dagesh-strips-dagesh-lene.md), those docs list the two default features by name. TypeDoc generates the docs site from them, so the site wasn't changed separately.

Tests: `test/transliterate.test.ts` ("ticket 021"). One test runs the documented example.

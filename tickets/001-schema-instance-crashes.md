# 001: `new Schema(...)` crashes for 7 of 8 built-in schemas

- **Type:** Bug
- **Priority:** High
- **Location:** `src/transliterate.ts:18` (`getSylOpts`)

## Problem

`getSylOpts` says it avoids passing `undefined` to havarotjs, but it copies every option, including undefined ones. havarotjs rejects `undefined` for boolean options.

`shevaWithMeteg` is optional in `Schema`, and only `tiberian` sets it. Wrapping any other built-in schema in `new Schema(...)` therefore crashes. That covers brillAcademic, brillSimple, jss, michiganClaremont, romaniote, sblSimple and sblAcademicSpirantization. The docs recommend `new Schema(...)` for full custom schemas.

## Repro

```js
transliterate("מִ֣ן", new Schema(brillSimple));
// Error: The value undefined is not a valid option for shevaWithMeteg
```

**Expected:** a transliteration, no error.

## Suggested fix

Drop undefined keys before passing the options on:

```ts
Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== undefined))
```

## Done when

- A test wraps every built-in schema in `new Schema(...)` and transliterates a word.
- This must land before [002](002-sbl-defaults-leak-into-schemas.md).

## Resolution

`getSylOpts` now drops options whose value is `undefined` before passing them to havarotjs, so havarotjs falls back to its own defaults.

Tests: `test/schemas/builtins.test.ts` ("ticket 001") wraps every built-in schema in `new Schema(...)`, and also checks a schema with an optional option explicitly set to `undefined`.

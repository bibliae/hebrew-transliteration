import { describe, expect, test } from "vitest";
import { Schema, transliterate } from "../../src/index";
import {
  brillAcademic,
  brillSimple,
  jss,
  michiganClaremont,
  romaniote,
  sblAcademicSpirantization,
  sblSimple,
  tiberian
} from "../../src/schemas/index";

const builtIns = Object.entries({
  brillAcademic,
  brillSimple,
  jss,
  michiganClaremont,
  romaniote,
  sblAcademicSpirantization,
  sblSimple,
  tiberian
});

// tickets/001-schema-instance-crashes.md
describe("ticket 001: built-in schemas wrapped in new Schema()", () => {
  test.each(builtIns)("%s does not throw", (_name, schema) => {
    // shevaWithMeteg is optional and unset in most built-in schemas;
    // passing it to havarotjs as undefined used to throw
    expect(() => transliterate("מִ֣ן", new Schema(schema))).not.toThrow();
    expect(transliterate("מִ֣ן", new Schema(schema))).not.toBe("");
  });

  test("an optional syllabification option left undefined does not throw", () => {
    const schema = new Schema({ ...brillSimple, shevaWithMeteg: undefined });
    expect(transliterate("שָׁל֣וֹם", schema)).toBe("shalom");
  });
});

// tickets/002-sbl-defaults-leak-into-schemas.md
describe("ticket 002: built-in schemas don't inherit SBL's default features", () => {
  test.each`
    name                           | schema                       | hebrew    | transliteration
    ${"michiganClaremont"}         | ${michiganClaremont}         | ${"מִ֣ן"} | ${"MIN"}
    ${"michiganClaremont"}         | ${michiganClaremont}         | ${"קֻ֣ם"} | ${"QUM"}
    ${"brillSimple"}               | ${brillSimple}               | ${"מִ֣ן"} | ${"min"}
    ${"brillSimple"}               | ${brillSimple}               | ${"קֻ֣ם"} | ${"qum"}
    ${"brillAcademic"}             | ${brillAcademic}             | ${"מִ֣ן"} | ${"mīn"}
    ${"brillAcademic"}             | ${brillAcademic}             | ${"קֻ֣ם"} | ${"qūm"}
    ${"sblAcademicSpirantization"} | ${sblAcademicSpirantization} | ${"מִ֣ן"} | ${"mīn"}
    ${"sblAcademicSpirantization"} | ${sblAcademicSpirantization} | ${"קֻ֣ם"} | ${"qūm"}
  `("$name: $hebrew → $transliteration", ({ schema, hebrew, transliteration }) => {
    // used to be MĪN / mīn (macrons leaked from SBL), and ī̄ / ū̄ (a second macron)
    expect(transliterate(hebrew, schema)).toBe(transliteration);
  });

  test.each`
    name                           | schema                       | transliteration
    ${"michiganClaremont"}         | ${michiganClaremont}         | ${"MAH-$:MOW"}
    ${"brillSimple"}               | ${brillSimple}               | ${"mah-shᵉmo"}
    ${"brillAcademic"}             | ${brillAcademic}             | ${"mah-šᵉmô"}
    ${"sblAcademicSpirantization"} | ${sblAcademicSpirantization} | ${"mah-šəmô"}
  `("$name keeps the euphonic dagesh feature", ({ schema, transliteration }) => {
    expect(transliterate("מַה־שְּׁמוֹ", schema)).toBe(transliteration);
  });

  test.each(builtIns)("%s gives the same output as a plain object and as new Schema()", (_name, schema) => {
    const hebrew = "בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים מִ֣ן קֻ֣ם";
    expect(transliterate(hebrew, schema)).toBe(transliterate(hebrew, new Schema(schema)));
  });

  test("spreading a built-in schema keeps its own features", () => {
    expect(transliterate("מִ֣ן", { ...michiganClaremont })).toBe("MIN");
  });

  test("SBL does not add a second macron when the schema's vowel is already long", () => {
    expect(transliterate("קֻ֣ם", { QUBUTS: "ū" })).toBe("qūm");
    expect(transliterate("קֻ֣ם")).toBe("qūm");
  });
});

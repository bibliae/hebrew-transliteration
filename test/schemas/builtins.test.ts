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

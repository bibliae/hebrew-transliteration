import { describe, expect, test } from "vitest";
import { remove, sequence } from "../src/index";
import { accents, all, points, vowels } from "../src/remove";

test("default", () => {
  const test = "שָׂרַ֣י אִשְׁתְּךָ֔, וַֽיִּמְצְא֗וּ";
  const result = sequence("שָׂרַי אִשְׁתְּךָ, וַיִּמְצְאוּ");
  expect(remove(test)).toBe(result);
});

test("remove only accents", () => {
  const test = "שָׂרַ֣י אִשְׁתְּךָ֔, וַֽיִּמְצְא֗וּ";
  const result = sequence("שָׂרַי אִשְׁתְּךָ, וַֽיִּמְצְאוּ");
  expect(remove(test, accents)).toBe(result);
});

test("remove accents and vowels, but not shin/sin dots", () => {
  const test = "שָׂרַ֣י אִשְׁתְּךָ֔, וַֽיִּמְצְא֗וּ";
  const result = sequence("שׂרי אשׁתך, וימצאו");
  expect(remove(test, { ...accents, ...vowels, METEG: true })).toBe(result);
});

test("remove all", () => {
  const test = "שָׂרַ֣י אִשְׁתְּךָ֔, וַֽיִּמְצְא֗וּ";
  const result = sequence("שרי אשתך, וימצאו");
  expect(remove(test, all)).toBe(result);
});

test("remove custom", () => {
  const test = "שָׂרַ֣י אִשְׁתְּךָ֔";
  const result = sequence("שָרַ֣י אִשְתְּךָ֔");
  expect(remove(test, { SHIN_DOT: true, SIN_DOT: true })).toBe(result);
});

test("remove maqqef", () => {
  const test = "עַֽל־פַּלְגֵ֫י־מָ֥יִם";
  const result = sequence("עַֽל פַּלְגֵ֫י מָ֥יִם");
  expect(remove(test, { MAQAF: true })).toBe(result);
});

describe("ON_COMPLETE callback", () => {
  test("modifies result string with result argument", () => {
    expect(
      remove("שָׂרַ֣י", {
        ...accents,
        ...vowels,
        ON_COMPLETE: (result) => result.replace("ר", "r")
      })
    ).toBe("שׂrי");
  });

  test("accesses original Hebrew text via callback arguments", () => {
    let capturedOriginal: string | undefined;
    remove("שָׂרַ֣י", {
      ...accents,
      ...vowels,
      ON_COMPLETE: (_result, { original }) => {
        capturedOriginal = original;
        return _result;
      }
    });
    expect(capturedOriginal).toBe("שָׂרַ֣י");
  });

  test("accesses options via callback arguments", () => {
    let capturedOptions: { ETNAHTA?: boolean } | undefined;
    remove("שָׂרַ֣י", {
      ...accents,
      ...vowels,
      ON_COMPLETE: (_result, { options }) => {
        capturedOptions = options;
        return _result;
      }
    });
    expect(capturedOptions?.ETNAHTA).toBe(true);
  });

  test("works with default options when callback returns result unchanged", () => {
    expect(
      remove("שָׂרַ֣י", {
        ...accents,
        ...vowels,
        ON_COMPLETE: (result) => result
      })
    ).toBe("שׂרי");
  });
});

// tickets/014-remove-leaves-holam-haser-for-vav.md
describe("ticket 014: holam haser for vav (U+05BA) can be removed", () => {
  const holamHaser = "\u{05BA}";

  test.each([
    ["all", all],
    ["points", points],
    ["vowels", vowels]
  ])("the %s preset removes it", (_name, options) => {
    expect(remove("עָוֺן", options)).not.toContain(holamHaser);
  });

  test("it can be removed on its own", () => {
    expect(remove("עָוֺן", { HOLAM_HASER_FOR_VAV: true })).toBe(sequence("עָון"));
  });

  test("it is kept when not asked for", () => {
    expect(remove("עָוֺן", { HOLAM: true })).toContain(holamHaser);
  });
});

// tickets/015-remove-changes-untouched-text.md
describe("ticket 015: remove() only removes what it is asked to", () => {
  test("a holam male stays on its vav", () => {
    // ל + ו + holam, not ל + holam + ו
    expect(remove("שָׁלוֹם")).toBe("\u{05E9}\u{05C1}\u{05B8}\u{05DC}\u{05D5}\u{05B9}\u{05DD}");
  });

  test("leading whitespace is kept, with or without vowels", () => {
    expect(remove("  שָׁלוֹם")).toBe("  " + remove("שָׁלוֹם"));
    expect(remove("  שלום")).toBe("  שלום");
  });

  test("text that is not Hebrew is not normalized", () => {
    expect(remove("שָׁלוֹם café ½")).toBe(remove("שָׁלוֹם") + " café ½");
    expect(remove("שָׁלוֹם café")).toBe(remove("שָׁלוֹם") + " café");
  });

  test("marks are still put in order", () => {
    // kaf + hiriq + dagesh + yod → kaf + dagesh + hiriq + yod
    expect(remove("\u{05DB}\u{05B4}\u{05BC}\u{05D9}", {})).toBe("\u{05DB}\u{05BC}\u{05B4}\u{05D9}");
  });

  test("Hebrew presentation forms are still decomposed", () => {
    // U+FB2C is shin + dagesh + shin dot
    expect(remove("\u{FB2C}\u{05B8}", all)).toBe("\u{05E9}");
  });
});

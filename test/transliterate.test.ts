import type { Cluster } from "havarotjs/cluster";
import type { Syllable } from "havarotjs/syllable";
import { describe, expect, test } from "vitest";
import type { Schema } from "../src/index";
import { transliterate } from "../src/index";
import { brillAcademic, michiganClaremont, sblAcademicSpirantization, sblSimple } from "../src/schemas/index";

interface Inputs {
  hebrew: string;
  transliteration: string;
  options?: Partial<Schema>;
}
/**
 * most tests use taamim
 */
describe("using default options", () => {
  describe("basic tests", () => {
    test.each`
      description                    | hebrew                           | transliteration
      ${"consonants"}                | ${"אבגדהוזחטיכךלמםנןסעפףצץקרשת"} | ${"ʾbgdhwzḥṭykklmmnnsʿppṣṣqršt"}
      ${"sin ligature w/o vowels"}   | ${"שׂגב"}                        | ${"śgb"}
      ${"no special cases"}          | ${"רַ֛עַל"}                      | ${"raʿal"}
      ${"preserve non-Hebrew chars"} | ${"v1. רַ֛עַל"}                  | ${"v1. raʿal"}
      ${"preserve line breaks"}      | ${"v1.\n רַ֛עַל"}                | ${"v1.\n raʿal"}
      ${"multiple words and passeq"} | ${"רַ֛עַל ׀ רַ֛עַל"}             | ${"raʿal  raʿal"}
      ${"taamim, but not vowels"}    | ${"אֽנכ֖י יהו֣ה אלה֑יך"}         | ${"ʾnky yhwh ʾlhyk"}
    `("$description", (inputs: Inputs) => {
      const { hebrew, transliteration } = inputs;
      expect(transliterate(hebrew)).toBe(transliteration);
    });
  });

  describe("consonant features", () => {
    describe("spirantization and ligature tests", () => {
      test.each`
        description              | hebrew       | transliteration
        ${"unspirantized bet"}   | ${"בָּ֣ם"}   | ${"bām"}
        ${"spirantized bet"}     | ${"אָ֣ב"}    | ${"ʾāb"}
        ${"unspirantized gimel"} | ${"גָּדַ֣ל"} | ${"gādal"}
        ${"spirantized gimel"}   | ${"חָ֣ג"}    | ${"ḥāg"}
        ${"unspirantized dalet"} | ${"דָּ֣ם"}   | ${"dām"}
        ${"spirantized dalet"}   | ${"סַ֣ד"}    | ${"sad"}
        ${"unspirantized kaf"}   | ${"כָּמָ֣ר"} | ${"kāmār"}
        ${"spirantized kaf"}     | ${"לֵ֣ךְ"}   | ${"lēk"}
        ${"unspirantized peh"}   | ${"פֹּ֣ה"}   | ${"pōh"}
        ${"spirantized peh"}     | ${"אֶ֣לֶף"}  | ${"ʾelep"}
        ${"unspirantized tav"}   | ${"תָּ֣ם"}   | ${"tām"}
        ${"spirantized tav"}     | ${"מַ֣ת"}    | ${"mat"}
        ${"shin"}                | ${"שֶׁ֣לֶם"}  | ${"šelem"}
        ${"sin"}                 | ${"אָ֣רַשׂ"}  | ${"ʾāraś"}
      `("$description", (inputs: Inputs) => {
        const { hebrew, transliteration } = inputs;
        expect(transliterate(hebrew)).toBe(transliteration);
      });
    });

    describe("furtive", () => {
      test.each`
        description                           | hebrew         | transliteration
        ${"furtive patach, chet"}             | ${"נֹ֖חַ"}     | ${"nōaḥ"}
        ${"furtive patach, ayin"}             | ${"רָקִ֖יעַ"}  | ${"rāqîaʿ"}
        ${"furtive patach, he"}               | ${"גָּבֹ֗הַּ"} | ${"gābōah"}
        ${"furtive patach, with a sof pasuq"} | ${"רֽוּחַ׃"}   | ${"rûaḥ"}
      `("$description", (inputs: Inputs) => {
        const { hebrew, transliteration } = inputs;
        expect(transliterate(hebrew)).toBe(transliteration);
      });
    });

    describe("dagesh", () => {
      test.each`
        description                                               | hebrew           | transliteration
        ${"dagesh qal beginning of word"}                         | ${"בֹּ֔סֶר"}     | ${"bōser"}
        ${"dagesh qal middle of word"}                            | ${"מַסְגֵּ֖ר"}   | ${"masgēr"}
        ${"dagesh chazaq - not BeGaDKePhaT"}                      | ${"מִנְּזָר֜"}   | ${"minnəzār"}
        ${"dagesh chazaq - BeGaDKePhaT"}                          | ${"מַגָּ֖ל"}     | ${"maggāl"}
        ${"dagesh chazaq - final tav suffix"}                     | ${"הֵיטַ֛בְתְּ"} | ${"hêṭabt"}
        ${"dagesh chazaq - final tav sfx + syl starts w/ dagesh"} | ${"וַיֵּשְׁתְּ"}    | ${"wayyēšt"}
        ${"mappiq he"}                                            | ${"וְלַ֨הּ"}     | ${"wəlah"}
        ${"euphonic dagesh"}                                      | ${"מַה־שְּׁמוֹ"} | ${"mah-šəmô"}
      `("$description", (inputs: Inputs) => {
        const { hebrew, transliteration } = inputs;
        expect(transliterate(hebrew)).toBe(transliteration);
      });
    });

    describe("shewa", () => {
      test.each`
        description                                     | hebrew              | transliteration
        ${"vocal shewa"}                                | ${"שְׁמֹֽר"}        | ${"šəmōr"}
        ${"silent shewa"}                               | ${"סַלְכָ֣ה"}       | ${"salkâ"}
        ${"final shewa"}                                | ${"כָּ֣ךְ"}         | ${"kāk"}
        ${"two final shewas"}                           | ${"קָטַ֣לְתְּ"}     | ${"qāṭalt"}
        ${"omitted dagesh chazaq after article, yod"}   | ${"הַיְאֹ֗ר"}       | ${"hayəʾōr"}
        ${"omitted dagesh chazaq after article, mem"}   | ${"הַמְיַלֶּ֗דֶת"}  | ${"haməyalledet"}
        ${"omitted dagesh chazaq after article, lamed"} | ${"הַלְוִיִּ֔ם"}    | ${"haləwiyyīm"}
        ${"silent shewa and ligature consonant"}        | ${"אַשְׁכְּנַזִּי"} | ${"ʾaškənazzî"}
      `("$description", (inputs: Inputs) => {
        const { hebrew, transliteration } = inputs;
        expect(transliterate(hebrew)).toBe(transliteration);
      });
    });
  });

  describe("vowel features", () => {
    test.each`
      description       | hebrew             | transliteration
      ${"short hiriq"}  | ${"מִנְחָה"}       | ${"minḥâ"}
      ${"long hiriq"}   | ${"דָּוִ֑ד"}       | ${"dāwīd"}
      ${"short qubuts"} | ${"וַיֻּגַּ֖ד"}    | ${"wayyuggad"}
      ${"long qubuts"}  | ${"וַיֹּצִאֻ֥הוּ"} | ${"wayyōṣiʾūhû"}
    `("$description", (inputs: Inputs) => {
      const { hebrew, transliteration } = inputs;
      expect(transliterate(hebrew)).toBe(transliteration);
    });
  });

  describe("mater features", () => {
    describe("typical", () => {
      test.each`
        description     | hebrew          | transliteration
        ${"hiriq yod"}  | ${"עִ֔יר"}      | ${"ʿîr"}
        ${"tsere yod"}  | ${"אֵ֤ין"}      | ${"ʾên"}
        ${"seghol yod"} | ${"אֱלֹהֶ֑יךָ"} | ${"ʾĕlōhêkā"}
        ${"holem vav"}  | ${"ס֣וֹא"}      | ${"sôʾ"}
        ${"qamets he"}  | ${"עֵצָ֖ה"}     | ${"ʿēṣâ"}
        ${"seghol he"}  | ${"יִקְרֶ֥ה"}   | ${"yiqreh"}
        ${"tsere he"}   | ${"הָאַרְיֵ֔ה"} | ${"hāʾaryēh"}
        ${"shureq"}     | ${"קוּם"}       | ${"qûm"}
      `("$description", (inputs: Inputs) => {
        const { hebrew, transliteration } = inputs;
        expect(transliterate(hebrew)).toBe(transliteration);
      });
    });

    describe("edge cases", () => {
      test.each`
        description                                                            | hebrew              | transliteration
        ${"const yod with hiriq as vowel"}                                     | ${"יַ֣יִן"}         | ${"yayin"}
        ${"final hiriq yod with maqaf"}                                        | ${"וַֽיְהִי־כֵֽן"}  | ${"wayəhî-kēn"}
        ${"final shureq with maqaf"}                                           | ${"נַשְּׁקוּ־בַ֡ר"} | ${"naššəqû-bar"}
        ${"hiriq followed by const yod (fake word)"}                           | ${"רִיֵם"}          | ${"riyēm"}
        ${"consonantal vav with holem as vowel"}                               | ${"עָוֺ֖ן"}         | ${"ʿāwōn"}
        ${"consonantal vav with holem vav as vowel"}                           | ${"עָו֑וֹן"}        | ${"ʿāwôn"}
        ${"consonantal vav with holem, holem vav, and shureq (post biblical)"} | ${"עֲוֹנוֹתֵינוּ"}  | ${"ʿăwōnôtênû"}
        ${"initial shureq"}                                                    | ${"וּמִן"}          | ${"ûmīn"}
        ${"bgdkpt letter with mater"}                                          | ${"בִּיטוֹן"}       | ${"bîṭôn"}
      `("$description", (inputs: Inputs) => {
        const { hebrew, transliteration } = inputs;
        expect(transliterate(hebrew)).toBe(transliteration);
      });
    });
  });

  describe("divine name", () => {
    test.each`
      description             | hebrew           | transliteration
      ${"by itself"}          | ${"יְהוָ֥ה"}     | ${"yhwh"}
      ${"with a maqqef"}      | ${"אֶת־יְהוָ֤ה"} | ${"ʾet-yhwh"}
      ${"with a preposition"} | ${"בַּֽיהוָ֔ה"}  | ${"ba-yhwh"}
    `("$description", (inputs: Inputs) => {
      const { hebrew, transliteration } = inputs;
      expect(transliterate(hebrew)).toBe(transliteration);
    });
  });

  describe("divine name, elohim", () => {
    test.each`
      description           | hebrew        | transliteration | options
      ${"full pointing"}    | ${"יֱהֹוִ֡ה"} | ${"ʾelōhim"}    | ${{ DIVINE_NAME_ELOHIM: "ʾelōhim" }}
      ${"with segol"}       | ${"יֱהוִה"}   | ${"ʾelōhim"}    | ${{ DIVINE_NAME_ELOHIM: "ʾelōhim" }}
      ${"with holam"}       | ${"יְהֹוִה"}  | ${"ʾelōhim"}    | ${{ DIVINE_NAME_ELOHIM: "ʾelōhim" }}
      ${"with hiriq"}       | ${"יְהוִֽה׃"} | ${"ʾelōhim"}    | ${{ DIVINE_NAME_ELOHIM: "ʾelōhim" }}
      ${"undefined option"} | ${"יֱהֹוִ֡ה"} | ${"yhwh"}       | ${{ DIVINE_NAME_ELOHIM: undefined }}
    `("$description", (inputs: Inputs) => {
      const { hebrew, transliteration, options } = inputs;
      expect(transliterate(hebrew, options)).toBe(transliteration);
    });
  });

  describe("qamets qatan", () => {
    test.each`
      description            | hebrew           | transliteration
      ${"standard"}          | ${"כָּל־הָעָ֖ם"} | ${"kol-hāʿām"}
      ${"with hatef qamets"} | ${"נָעֳמִי֙"}    | ${"noʿŏmî"}
    `("$description", (inputs: Inputs) => {
      const { hebrew, transliteration } = inputs;
      expect(transliterate(hebrew)).toBe(transliteration);
    });
  });

  describe("3ms suffix", () => {
    test.each`
      description                         | hebrew          | transliteration
      ${"basic suffix"}                   | ${"דְּבָרָ֖יו"} | ${"dəbārāyw"}
      ${"doubled consonatnt with suffix"} | ${"בַּדָּיו"}     | ${"baddāyw"}
    `("$description", (inputs: Inputs) => {
      const { hebrew, transliteration } = inputs;
      expect(transliterate(hebrew)).toBe(transliteration);
    });
  });
});

/**
 * users should have the ability to enter any optional argument
 * even if it is not part of the SBL schema
 */
describe("extending SBL schema for optional arguments", () => {
  describe("syllable separator", () => {
    test.each`
      description                | hebrew          | transliteration
      ${"basic"}                 | ${"רַ֛עַל"}     | ${"ra-ʿal"}
      ${"between dagesh chazaq"} | ${"הַקִּטֵּ֗ר"} | ${"haq-qiṭ-ṭēr"}
    `("$description", (inputs: Inputs) => {
      const { hebrew, transliteration } = inputs;
      expect(transliterate(hebrew, { SYLLABLE_SEPARATOR: "-" })).toBe(transliteration);
    });
  });

  test("syllable separator when two vowles are next to each other", () => {
    const hebrew = "יָאֵר";
    const transliteration = "yā.eer";
    expect(transliterate(hebrew, { SYLLABLE_SEPARATOR: ".", ALEF: "", TSERE: "ee" })).toBe(transliteration);
  });

  describe("consonant features", () => {
    describe("spirantization and ligature tests", () => {
      test.each`
        description              | hebrew       | transliteration
        ${"unspirantized bet"}   | ${"בָּ֣ם"}   | ${"Bām"}
        ${"spirantized bet"}     | ${"אָ֣ב"}    | ${"ʾāb"}
        ${"unspirantized gimel"} | ${"גָּדַ֣ל"} | ${"Gādal"}
        ${"spirantized gimel"}   | ${"חָ֣ג"}    | ${"ḥāg"}
        ${"unspirantized dalet"} | ${"דָּ֣ם"}   | ${"Dām"}
        ${"spirantized dalet"}   | ${"סַ֣ד"}    | ${"sad"}
        ${"unspirantized kaf"}   | ${"כָּמָ֣ר"} | ${"Kāmār"}
        ${"spirantized kaf"}     | ${"לֵ֣ךְ"}   | ${"lēk"}
        ${"unspirantized peh"}   | ${"פֹּ֣ה"}   | ${"Pōh"}
        ${"spirantized peh"}     | ${"אֶ֣לֶף"}  | ${"ʾelep"}
        ${"unspirantized tav"}   | ${"תָּ֣ם"}   | ${"Tām"}
        ${"spirantized tav"}     | ${"מַ֣ת"}    | ${"mat"}
      `("$description", (inputs: Inputs) => {
        const { hebrew, transliteration } = inputs;
        const options: Partial<Schema> = {
          BET_DAGESH: "B",
          GIMEL_DAGESH: "G",
          DALET_DAGESH: "D",
          KAF_DAGESH: "K",
          PE_DAGESH: "P",
          TAV_DAGESH: "T"
        };
        expect(transliterate(hebrew, options)).toBe(transliteration);
      });
    });

    describe("dagesh chazaq", () => {
      test.each`
        description                              | hebrew            | transliteration | options
        ${"false, results in no doubling"}       | ${"שַׁבָּת֔וֹן"}  | ${"šabātôn"}    | ${{ DAGESH_CHAZAQ: false }}
        ${"false, change character"}             | ${"שַׁבָּת֔וֹן"}  | ${"šavātôn"}    | ${{ DAGESH_CHAZAQ: false, BET: "v" }}
        ${"false, with a BET_DAGESH"}            | ${"שַׁבָּת֔וֹן"}  | ${"šabātôn"}    | ${{ DAGESH_CHAZAQ: false, BET: "v", BET_DAGESH: "b" }}
        ${"true, with a BET_DAGESH"}             | ${"שַׁבָּת֔וֹן"}  | ${"šabbātôn"}   | ${{ DAGESH_CHAZAQ: true, BET: "v", BET_DAGESH: "b" }}
        ${"string, where it is a dagesh chazaq"} | ${"שַׁבָּת֔וֹן"}  | ${"šab́ātôn"}    | ${{ DAGESH_CHAZAQ: "\u0301" }}
        ${"string, where it is a dagesh qal "}   | ${"בְּרֵאשִׁ֖ית"} | ${"bərēʾšît"}   | ${{ DAGESH_CHAZAQ: "\u0301" }}
      `("$description", (inputs: Inputs) => {
        const { hebrew, transliteration, options } = inputs;
        expect(transliterate(hebrew, options)).toBe(transliteration);
      });
    });

    describe("patah he", () => {
      test.each`
        description                          | hebrew         | transliteration | options
        ${"furtive patah is not affected"}   | ${"גָּבֹ֗הַּ"} | ${"gābōah"}     | ${{ PATAH_HE: "â" }}
        ${"patah he from reduced qamats he"} | ${"מַה־"}      | ${"mâ-"}        | ${{ PATAH_HE: "â" }}
      `("$description", (inputs: Inputs) => {
        const { hebrew, transliteration, options } = inputs;
        expect(transliterate(hebrew, options)).toBe(transliteration);
      });
    });
  });

  describe("additional features", () => {
    test.each`
      description           | hebrew                    | transliteration      | options
      ${"cluster feature"}  | ${"הַזֹּאת"}              | ${"hatzōʾt"}         | ${{ ADDITIONAL_FEATURES: [{ FEATURE: "cluster", HEBREW: "זּ", TRANSLITERATION: "tz" }] }}
      ${"syllable feature"} | ${"בְּרֵאשִׁ֖ית בָּרָ֣א"} | ${"bəRAYšît bārāʾ"}  | ${{ ADDITIONAL_FEATURES: [{ FEATURE: "syllable", HEBREW: "רֵא", TRANSLITERATION: "RAY" }] }}
      ${"word feature"}     | ${"וְאֵ֥ת הָאָֽרֶץ"}      | ${"wəʾēt The Earth"} | ${{ ADDITIONAL_FEATURES: [{ FEATURE: "word", HEBREW: "הָאָרֶץ", TRANSLITERATION: "The Earth" }] }}
    `("$description", (inputs: Inputs) => {
      const { hebrew, transliteration, options } = inputs;
      expect(transliterate(hebrew, options)).toBe(transliteration);
    });
  });

  describe("additional feature with callback for a cluster", () => {
    test("cluster callback", () => {
      const heb = "בְּרֵאשִׁ֖ית";
      expect(
        transliterate(heb, {
          ADDITIONAL_FEATURES: [
            {
              HEBREW: "\u{05B0}",
              FEATURE: "cluster",
              TRANSLITERATION: function (cluster, hebrew, schema) {
                const tsere = /\u{05B5}/u;
                const next = cluster.next as Cluster;
                if (next && tsere.test(next.text)) {
                  return cluster.text.replace(new RegExp(hebrew, "u"), schema["TSERE"]);
                }
                return cluster.text;
              }
            }
          ]
        })
      ).toEqual("bērēʾšît");
    });
  });

  describe("additional feature with callback for a syllable", () => {
    test("syllable callback where sheva is vocal", () => {
      const heb = "בְּרֵאשִׁ֖ית";
      expect(
        transliterate(heb, {
          ADDITIONAL_FEATURES: [
            {
              HEBREW: "(?<![\u{05B1}-\u{05BB}\u{05C7}].*)\u{05B0}",
              FEATURE: "syllable",
              TRANSLITERATION: function (syllable, _hebrew, schema) {
                const next = syllable.next as Syllable;
                const nextVowel = next.vowelNames[0] === "SHEVA" ? "VOCAL_SHEVA" : next.vowelNames[0];

                if (next && nextVowel) {
                  const vowel = schema[nextVowel] || "";
                  return syllable.text.replace(/\u{05B0}/u, vowel);
                }

                return syllable.text;
              }
            }
          ]
        })
      ).toEqual("bērēʾšît");
    });

    test("syllable callback where sheva is silent", () => {
      const heb = "וַיַּבְדֵּל";
      expect(
        transliterate(heb, {
          ADDITIONAL_FEATURES: [
            {
              HEBREW: "(?<![\u{05B1}-\u{05BB}\u{05C7}].*)\u{05B0}",
              FEATURE: "syllable",
              TRANSLITERATION: function (syllable, _hebrew, schema) {
                const next = syllable.next as Syllable;
                const nextVowel = next.vowelNames[0] === "SHEVA" ? "VOCAL_SHEVA" : next.vowelNames[0];

                if (next && nextVowel) {
                  const vowel = schema[nextVowel] || "";
                  return syllable.text.replace(/\u{05B0}/u, vowel);
                }

                return syllable.text;
              }
            }
          ]
        })
      ).toEqual("wayyabdēl");
    });

    test("syllable callback with PASS_THROUGH false", () => {
      const heb = "בְּרֵאשִׁ֖ית";
      expect(
        transliterate(heb, {
          ADDITIONAL_FEATURES: [
            {
              HEBREW: "(?<![\u{05B1}-\u{05BB}\u{05C7}].*)\u{05B0}",
              FEATURE: "syllable",
              PASS_THROUGH: false,
              TRANSLITERATION: function (syllable, _hebrew, schema) {
                const next = syllable.next as Syllable;
                const nextVowel = next.vowelNames[0] === "SHEVA" ? "VOCAL_SHEVA" : next.vowelNames[0];

                if (next && nextVowel) {
                  const vowel = schema[nextVowel] || "";
                  return syllable.text.replace(/\u{05B0}/u, vowel);
                }

                return syllable.text;
              }
            }
          ]
        })
      ).toEqual("בּērēʾšît");
    });
  });

  describe("additional feature with callback for a word", () => {
    test("word callback", () => {
      const heb = "שְׁתַּיִם";
      expect(
        transliterate(heb, {
          ADDITIONAL_FEATURES: [
            {
              HEBREW: "שְׁתַּיִם",
              FEATURE: "word",
              TRANSLITERATION: function (_word, _hebrew, schema) {
                return (
                  schema["SHIN"] +
                  (schema["TAV_DAGESH"] ?? schema["TAV"]) +
                  schema["PATAH"] +
                  schema["YOD"] +
                  schema["HIRIQ"] +
                  schema["FINAL_MEM"]
                );
              }
            }
          ]
        })
      ).toEqual("štayim");
    });

    test("word callback with PASS_THROUGH false (no effect)", () => {
      const heb = "שְׁתַּיִם";
      expect(
        transliterate(heb, {
          ADDITIONAL_FEATURES: [
            {
              HEBREW: "שְׁתַּיִם",
              FEATURE: "word",
              PASS_THROUGH: false,
              TRANSLITERATION: function (_word, _hebrew, schema) {
                return (
                  schema["SHIN"] +
                  (schema["TAV_DAGESH"] ?? schema["TAV"]) +
                  schema["PATAH"] +
                  schema["YOD"] +
                  schema["HIRIQ"] +
                  schema["FINAL_MEM"]
                );
              }
            }
          ]
        })
      ).toEqual("štayim");
    });
  });

  describe("stress marks", () => {
    test.each`
      description                       | hebrew                     | transliteration            | options
      ${"before-syllable"}              | ${"דָּבָ֑ר"}               | ${"dāˈbār"}                | ${{ STRESS_MARKER: { location: "before-syllable", mark: "ˈ" } }}
      ${"after-syllable"}               | ${"דָּבָ֑ר"}               | ${"dābārˈ"}                | ${{ STRESS_MARKER: { location: "after-syllable", mark: "ˈ" } }}
      ${"before-vowel"}                 | ${"מֶ֣לֶךְ"}               | ${"ḿelek"}                 | ${{ STRESS_MARKER: { location: "before-vowel", mark: "\u0301" } }}
      ${"after-vowel"}                  | ${"מֶ֣לֶךְ"}               | ${"mélek"}                 | ${{ STRESS_MARKER: { location: "after-vowel", mark: "\u0301" } }}
      ${"after-vowel with mater"}       | ${"אֱלֹהִ֔ים"}             | ${"ʾĕlōhî́m"}               | ${{ STRESS_MARKER: { location: "after-vowel", mark: "\u0301" } }}
      ${"after-vowel with digraph"}     | ${"בֵּ֣ית"}                | ${"beít"}                  | ${{ TSERE_YOD: "ei", STRESS_MARKER: { location: "after-vowel", mark: "\u0301" } }}
      ${"before-syllable with digraph"} | ${"מִקֶּ֑דֶם"}             | ${"miq\u031Fˈq\u031Fedem"} | ${{ QOF: "q\u031F", STRESS_MARKER: { location: "before-syllable", mark: "ˈ" } }}
      ${"exclude undefined"}            | ${"בֹּ֖קֶר י֥וֹם אֶחָֽד׃"} | ${"bṓqer yốm ʾeḥā́d"}       | ${{ STRESS_MARKER: { location: "after-vowel", mark: "\u0301" } }}
      ${"exclude never"}                | ${"בֹּ֖קֶר י֥וֹם אֶחָֽד׃"} | ${"bṓqer yốm ʾeḥā́d"}       | ${{ STRESS_MARKER: { location: "after-vowel", mark: "\u0301", exclude: "never" } }}
      ${"exclude single"}               | ${"בֹּ֖קֶר י֥וֹם אֶחָֽד׃"} | ${"bṓqer yôm ʾeḥā́d"}       | ${{ STRESS_MARKER: { location: "after-vowel", mark: "\u0301", exclude: "single" } }}
      ${"exclude final"}                | ${"בֹּ֖קֶר י֥וֹם אֶחָֽד׃"} | ${"bṓqer yôm ʾeḥād"}       | ${{ STRESS_MARKER: { location: "after-vowel", mark: "\u0301", exclude: "final" } }}
      ${"ignore paseq"}                 | ${"לְפָנַ֨י ׀ שֻׁלְחָ֗ן"}  | ${"ləpāˈnay  šulˈḥān"}     | ${{ STRESS_MARKER: { location: "before-syllable", mark: "ˈ" } }}
    `("$description", (inputs: Inputs) => {
      const { hebrew, transliteration, options } = inputs;
      expect(transliterate(hebrew, options)).toBe(transliteration);
    });
  });

  describe("ON_COMPLETE callback", () => {
    test("modifies result string with result argument", () => {
      expect(
        transliterate("תִתְהַלָּֽל", {
          ON_COMPLETE: (result) => result.replace("th", "t'h")
        })
      ).toBe("tit'hallāl");
    });

    test("accesses original Hebrew text via callback arguments", () => {
      let capturedOriginal: string | undefined;
      transliterate("שָּׁלוֹם", {
        ON_COMPLETE: (_result, { original }) => {
          capturedOriginal = original;
          return _result;
        }
      });
      expect(capturedOriginal).toBe("שָּׁלוֹם");
    });

    test("accesses schema via callback arguments", () => {
      let capturedSchema: Schema | undefined;
      transliterate("שָּׁלוֹם", {
        ON_COMPLETE: (_result, { schema }) => {
          capturedSchema = schema;
          return _result;
        },
        PATAH: "a"
      });
      expect(capturedSchema?.PATAH).toBe("a");
    });

    test("accesses Text object via callback arguments", () => {
      let hasWords = false;
      transliterate("שָּׁלוֹם", {
        ON_COMPLETE: (_result, { text }) => {
          hasWords = text.words.length > 0;
          return _result;
        }
      });
      expect(hasWords).toBe(true);
    });

    test("multiple transformations via ON_COMPLETE", () => {
      expect(
        transliterate("אָבָן", {
          ON_COMPLETE: (result) => result.replace(/ā/g, "ah")
        })
      ).toBe("ʾahbahn");
    });
  });
});

// tickets/003-euphonic-dagesh-strips-dagesh-lene.md
describe("ticket 003: euphonic dagesh only after an open syllable, and only on the first consonant", () => {
  const spirantization: Partial<Schema> = { BET: "v", BET_DAGESH: "b", KAF: "kh", KAF_DAGESH: "k" };

  test.each`
    description                                         | hebrew           | transliteration | options
    ${"dagesh lene after a closed syllable stays"}      | ${"עַל־בְּנֵי"}  | ${"ʿal-bənê"}   | ${spirantization}
    ${"dagesh lene after a closed syllable stays, kaf"} | ${"אֶת־כָּל"}    | ${"ʾet-kol"}    | ${spirantization}
    ${"euphonic dagesh on BeGaDKePaT stays plosive"}    | ${"מַה־בֶּ֗צַע"} | ${"mah-beṣaʿ"}  | ${spirantization}
    ${"euphonic dagesh is not doubled"}                 | ${"מַה־שְּׁמוֹ"} | ${"mah-šəmô"}   | ${{}}
    ${"euphonic dagesh is not doubled, nun"}            | ${"לְכָה־נָּא"}  | ${"ləkâ-nāʾ"}   | ${{}}
    ${"shureq after a construct word keeps its dagesh"} | ${"כִּֽי־הוּא"}  | ${"kî-hûʾ"}     | ${{}}
  `("$description: $hebrew → $transliteration", (inputs: Inputs) => {
    const { hebrew, transliteration, options } = inputs;
    expect(transliterate(hebrew, options)).toBe(transliteration);
  });

  test.each`
    hebrew           | transliteration
    ${"אֶת־כָּל"}    | ${"ʾet\u0331-kol"}
    ${"עַל־בְּנֵי"}  | ${"ʿal-bənê"}
    ${"בֶּן־דָּוִד"} | ${"ben-dāwīd\u0331"}
    ${"מַה־בֶּ֗צַע"} | ${"mah-beṣaʿ"}
  `("sblAcademicSpirantization: $hebrew → $transliteration", (inputs: Inputs) => {
    const { hebrew, transliteration } = inputs;
    expect(transliterate(hebrew, sblAcademicSpirantization)).toBe(transliteration);
  });

  test("brillAcademic keeps the dagesh lene after a closed syllable", () => {
    expect(transliterate("עַל־פְּנֵי", brillAcademic)).toBe("ʿal-pᵉnê");
  });
});

// tickets/005-divine-name-drops-punctuation.md
describe("ticket 005: Divine Name keeps attached punctuation", () => {
  test.each`
    description                             | hebrew                  | transliteration     | options
    ${"sof pasuq"}                          | ${"נְאֻם יְהוָה׃"}      | ${"nəʾūm yhwh."}    | ${{ SOF_PASUQ: "." }}
    ${"sof pasuq, default schema"}          | ${"נְאֻם יְהוָה׃"}      | ${"nəʾūm yhwh"}     | ${{}}
    ${"maqaf"}                              | ${"יְהוָה־צְבָאוֹת"}    | ${"yhwh-ṣəbāʾôt"}   | ${{}}
    ${"sof pasuq with a prefix"}            | ${"לַיהוָה׃"}           | ${"la-yhwh."}       | ${{ SOF_PASUQ: "." }}
    ${"sof pasuq, read as elohim"}          | ${"יְהוִֽה׃"}           | ${"ʾelōhim."}       | ${{ SOF_PASUQ: ".", DIVINE_NAME_ELOHIM: "ʾelōhim" }}
    ${"accent on the last letter"}          | ${"יְהוָה֙"}            | ${"yhwh"}           | ${{}}
    ${"non-Hebrew characters on each side"} | ${"(יְהוָה),"}          | ${"(yhwh),"}        | ${{}}
    ${"paseq after the Divine Name"}        | ${"יְהוָ֥ה ׀ אֱלֹהִים"} | ${"yhwh | ʾĕlōhîm"} | ${{ PASEQ: "|" }}
  `("$description: $hebrew → $transliteration", (inputs: Inputs) => {
    const { hebrew, transliteration, options } = inputs;
    expect(transliterate(hebrew, options)).toBe(transliteration);
  });
});

// tickets/006-divine-name-prefix-loses-syllables.md
describe("ticket 006: every syllable of a prefix before the Divine Name is kept", () => {
  test.each`
    description                             | hebrew            | transliteration | options
    ${"two-syllable prefix"}                | ${"וְלַיהוָה"}    | ${"wəla-yhwh"}  | ${{}}
    ${"two-syllable prefix with shureq"}    | ${"וּבַיהוָה"}    | ${"ûba-yhwh"}   | ${{}}
    ${"prefix before a yod with sheva"}     | ${"וּֽמֵיְהוָ֖ה"} | ${"ûmē-yhwh"}   | ${{}}
    ${"one-syllable prefix"}                | ${"בַּֽיהוָ֔ה"}   | ${"ba-yhwh"}    | ${{}}
    ${"syllable that runs into the name"}   | ${"מִיְהוָה"}     | ${"mi-yhwh"}    | ${{}}
    ${"hiriq in the prefix is not elohim"}  | ${"מִיְהוָה"}     | ${"mi-yhwh"}    | ${{ DIVINE_NAME_ELOHIM: "ELOHIM" }}
    ${"hiriq in the name is still elohim"}  | ${"לֵיהוִה"}      | ${"lē-ELOHIM"}  | ${{ DIVINE_NAME_ELOHIM: "ELOHIM" }}
    ${"prefix syllables use the separator"} | ${"וְלַיהוָה"}    | ${"wə.la-yhwh"} | ${{ SYLLABLE_SEPARATOR: "." }}
  `("$description: $hebrew → $transliteration", (inputs: Inputs) => {
    const { hebrew, transliteration, options } = inputs;
    expect(transliterate(hebrew, options)).toBe(transliteration);
  });
});

// tickets/008-holam-haser-furtive-patah-ignored.md
describe("ticket 008: HOLAM_HASER and FURTIVE_PATAH are used", () => {
  test.each`
    description                                 | hebrew         | transliteration | options
    ${"holam haser, preserved"}                 | ${"עָוֺן֙"}    | ${"ʿāwXn"}      | ${{ HOLAM_HASER: "X", holemHaser: "preserve" }}
    ${"holam haser, removed (becomes a holam)"} | ${"עָוֺן֙"}    | ${"ʿāwōn"}      | ${{ HOLAM_HASER: "X", holemHaser: "remove" }}
    ${"holam haser takes a stress mark"}        | ${"עָוֺ֙ן"}    | ${"ʿāwX'n"}     | ${{ HOLAM_HASER: "X", holemHaser: "preserve", STRESS_MARKER: { location: "after-vowel", mark: "'" } }}
    ${"furtive patah, het"}                     | ${"נֹ֖חַ"}     | ${"nōXḥ"}       | ${{ FURTIVE_PATAH: "X" }}
    ${"furtive patah, ayin (with a mater)"}     | ${"רָקִ֖יעַ"}  | ${"rāqîXʿ"}     | ${{ FURTIVE_PATAH: "X" }}
    ${"furtive patah, he"}                      | ${"גָּבֹ֗הַּ"} | ${"gābōXh"}     | ${{ FURTIVE_PATAH: "X" }}
    ${"furtive patah, with a sof pasuq"}        | ${"רֽוּחַ׃"}   | ${"rûXḥ"}       | ${{ FURTIVE_PATAH: "X" }}
    ${"furtive patah value is used literally"}  | ${"נֹ֖חַ"}     | ${"nō$&ḥ"}      | ${{ FURTIVE_PATAH: "$&" }}
    ${"default furtive patah is unchanged"}     | ${"נֹ֖חַ"}     | ${"nōaḥ"}       | ${{}}
  `("$description: $hebrew → $transliteration", (inputs: Inputs) => {
    const { hebrew, transliteration, options } = inputs;
    expect(transliterate(hebrew, options)).toBe(transliteration);
  });
});

// tickets/009-stress-marker-regex-not-escaped.md
describe("ticket 009: stress marker treats schema vowels as plain text", () => {
  const after = { location: "after-vowel", mark: "'" } as const;
  const before = { location: "before-vowel", mark: "'" } as const;

  test("a vowel with regex syntax does not throw", () => {
    expect(transliterate("מֶ֣לֶךְ", { SEGOL: "(e", STRESS_MARKER: after })).toBe("m(e'l(ek");
  });

  test("an empty vowel does not match at the start of the syllable", () => {
    expect(transliterate("מֶ֣לֶךְ", { HATAF_PATAH: "", STRESS_MARKER: after })).toBe("me'lek");
  });

  test("a vowel with a '.' only matches itself (Michigan-Claremont SHUREQ 'W.')", () => {
    expect(transliterate("וַ֣יֵּלֶךְ", { ...michiganClaremont, STRESS_MARKER: before })).toBe("W'AYY\"LEK");
    expect(transliterate("ק֣וּם", { ...michiganClaremont, STRESS_MARKER: after })).toBe("QW.'M");
  });

  test("the mark is inserted literally", () => {
    expect(transliterate("מֶ֣לֶךְ", { STRESS_MARKER: { location: "after-vowel", mark: "$&" } })).toBe("me$&lek");
  });
});

// tickets/010-stress-marker-on-construct-and-paseq.md
describe("ticket 010: no stress marker on construct words or paseq", () => {
  const stress = { location: "after-syllable", mark: "ˈ" } as const;

  test.each`
    description                                   | hebrew               | transliteration      | options
    ${"accented word in construct"}               | ${"בֵּ֣ית־אֵ֔ל"}     | ${"bêt-ʾēlˈ"}        | ${{ STRESS_MARKER: stress }}
    ${"paseq with a schema value"}                | ${"רַ֛עַל ׀ רַ֛עַל"} | ${"raˈʿal | raˈʿal"} | ${{ PASEQ: "|", STRESS_MARKER: stress }}
    ${"unaccented word in construct (unchanged)"} | ${"כָּל־הָאָ֖רֶץ"}   | ${"kol-hāʾāˈreṣ"}    | ${{ STRESS_MARKER: stress }}
  `("$description: $hebrew → $transliteration", (inputs: Inputs) => {
    const { hebrew, transliteration, options } = inputs;
    expect(transliterate(hebrew, options)).toBe(transliteration);
  });
});

// tickets/011-stress-marker-missing-on-long-vowels.md
describe("ticket 011: stress marker on SBL's long ī and ū", () => {
  const afterVowel = { STRESS_MARKER: { location: "after-vowel", mark: "́" } } as const;

  test.each`
    description              | hebrew                | transliteration   | options
    ${"long qubuts"}         | ${"קֻ֣ם"}             | ${"qū́m"}          | ${afterVowel}
    ${"long hiriq"}          | ${"דָּוִ֑ד"}          | ${"dāwī́d"}        | ${afterVowel}
    ${"second word in text"} | ${"יִשְׂרָאֵ֣ל אִ֣ם"} | ${"yiśrāʾḗl ʾī́m"} | ${afterVowel}
    ${"non-combining mark"}  | ${"מִ֣ן"}             | ${"mī'n"}         | ${{ STRESS_MARKER: { location: "after-vowel", mark: "'" } }}
  `("$description: $hebrew → $transliteration", (inputs: Inputs) => {
    const { hebrew, transliteration, options } = inputs;
    expect(transliterate(hebrew, options).normalize("NFC")).toBe(transliteration.normalize("NFC"));
  });
});

// tickets/012-stress-before-syllable-doubled-consonant.md
describe("ticket 012: before-syllable stress marker on a doubled consonant", () => {
  const stress = { location: "before-syllable", mark: "ˈ" } as const;

  test.each`
    description                                     | hebrew          | transliteration   | options
    ${"dagesh value differs from the plain letter"} | ${"הַכֹּ֣ל"}    | ${"hakˈkol"}      | ${{ ...sblSimple, STRESS_MARKER: stress }}
    ${"with a syllable separator"}                  | ${"הַמֶּ֣לֶךְ"} | ${"ham-ˈme-lek"}  | ${{ SYLLABLE_SEPARATOR: "-", STRESS_MARKER: stress }}
    ${"digraph for shin"}                           | ${"הַשָּׁ֣ם"}   | ${"hashˈshām"}    | ${{ SHIN: "sh", STRESS_MARKER: stress }}
    ${"digraph for sin"}                            | ${"הַשָּׂ֣ר"}   | ${"has'ˈs'ār"}    | ${{ SIN: "s'", STRESS_MARKER: stress }}
    ${"dagesh chazaq as a mark, not doubled"}       | ${"שַׁבָּ֑ת"}   | ${"šaˈb\u0301āt"} | ${{ DAGESH_CHAZAQ: "\u0301", STRESS_MARKER: stress }}
    ${"default schema (unchanged)"}                 | ${"הַמֶּ֣לֶךְ"} | ${"hamˈmelek"}    | ${{ STRESS_MARKER: stress }}
  `("$description: $hebrew → $transliteration", (inputs: Inputs) => {
    const { hebrew, transliteration, options } = inputs;
    expect(transliterate(hebrew, options)).toBe(transliteration);
  });
});

// tickets/013-word-feature-pass-through-stops-chain.md
describe("ticket 013: word features chain and keep the word's context", () => {
  // setting ADDITIONAL_FEATURES turns off SBL's default features, so compare against a schema that also sets them
  const neverMatches: Schema["ADDITIONAL_FEATURES"] = [{ FEATURE: "cluster", HEBREW: "NOMATCH", TRANSLITERATION: "x" }];

  test("a word feature that changes nothing does not change the output", () => {
    const baseline = transliterate("מַה־זֹּאת", { ADDITIONAL_FEATURES: neverMatches });
    expect(baseline).toBe("mah-zzōʾt");
    expect(
      transliterate("מַה־זֹּאת", {
        ADDITIONAL_FEATURES: [{ FEATURE: "word", HEBREW: "ז", TRANSLITERATION: (word) => word.text }]
      })
    ).toBe(baseline);
  });

  test("a word changed by a feature still knows the previous word is in construct", () => {
    expect(
      transliterate("מַה־זֹּאת", {
        ADDITIONAL_FEATURES: [{ FEATURE: "word", HEBREW: "ז", TRANSLITERATION: (word) => word.text.replace("א", "") }]
      })
    ).toBe("mah-zzōt");
  });

  test("a later word feature still applies after a pass-through feature", () => {
    expect(
      transliterate("דָּבָר", {
        ADDITIONAL_FEATURES: [
          { FEATURE: "word", HEBREW: "ד", TRANSLITERATION: (word) => word.text },
          { FEATURE: "word", HEBREW: "ב", TRANSLITERATION: "B" }
        ]
      })
    ).toBe("dāBār");
  });

  test("a later word feature sees the output of an earlier one", () => {
    expect(
      transliterate("דָּבָר", {
        ADDITIONAL_FEATURES: [
          { FEATURE: "word", HEBREW: "ד", TRANSLITERATION: (word) => word.text.replace("ד", "ב") },
          { FEATURE: "word", HEBREW: "בּ", TRANSLITERATION: (word) => word.text.replace("בּ", "ג") }
        ]
      })
    ).toBe("gābār");
  });
});

// tickets/016-syllable-features-use-original-text.md
describe("ticket 016: rules after syllable features see the features' output", () => {
  const segolToTsere: Schema["ADDITIONAL_FEATURES"] = [
    {
      FEATURE: "syllable",
      HEBREW: "\u{05B6}",
      TRANSLITERATION: (syllable) => syllable.text.replace("\u{05B6}", "\u{05B5}")
    }
  ];

  test("the tsere he rule applies to a tsere produced by a feature", () => {
    expect(
      transliterate("שָׂדֶה", { SEGOL_HE: "SEGOLHE", TSERE_HE: "TSEREHE", ADDITIONAL_FEATURES: segolToTsere })
    ).toBe("śādTSEREHE");
    expect(transliterate("שָׂדֶה", { SEGOL_HE: "SEGOLHE", TSERE_HE: "TSEREHE" })).toBe("śādSEGOLHE");
  });

  test("syllable features are matched against the original syllable, but receive the updated one", () => {
    // documented in PASS_THROUGH: the Tiberian schema relies on matching the original Hebrew
    let received = "";
    const result = transliterate("דָּבָר", {
      ADDITIONAL_FEATURES: [
        { FEATURE: "syllable", HEBREW: "ד", TRANSLITERATION: (syllable) => syllable.text.replace("ד", "ב") },
        {
          FEATURE: "syllable",
          HEBREW: "\u{05B8}",
          TRANSLITERATION: (syllable) => {
            if (!received) {
              received = syllable.text;
            }
            return syllable.text;
          }
        },
        { FEATURE: "syllable", HEBREW: "ב", TRANSLITERATION: "X" }
      ]
    });
    // bet + dagesh + qamats: the first feature turned the dalet into a bet
    expect(received).toBe("\u{05D1}\u{05BC}\u{05B8}");
    expect(result).toBe("bāXār");
  });
});

// tickets/017-feature-hebrew-not-sequenced.md
describe("ticket 017: feature HEBREW strings match no matter how they are typed", () => {
  // NFC puts a vowel before a dagesh (and a sheva before a shin dot), unlike the text havarotjs builds
  const nfc = (str: string) => str.normalize("NFC");

  test.each`
    description                             | hebrew         | feature                                                                  | transliteration
    ${"word feature, NFC"}                  | ${"דָּבָר"}    | ${{ FEATURE: "word", HEBREW: nfc("דָּבָר"), TRANSLITERATION: "DAVAR" }}  | ${"DAVAR"}
    ${"word feature, NFC, with a shin dot"} | ${"שְׁתַּיִם"} | ${{ FEATURE: "word", HEBREW: nfc("שְׁתַּיִם"), TRANSLITERATION: "TWO" }} | ${"TWO"}
    ${"cluster feature, NFC"}               | ${"בָּא"}      | ${{ FEATURE: "cluster", HEBREW: nfc("בָּ"), TRANSLITERATION: "BA" }}     | ${"BAʾ"}
    ${"syllable feature, NFC"}              | ${"בָּרָא"}    | ${{ FEATURE: "syllable", HEBREW: nfc("בָּ"), TRANSLITERATION: "BA" }}    | ${"BArāʾ"}
    ${"word feature with a holam male"}     | ${"שָׁלוֹם"}   | ${{ FEATURE: "word", HEBREW: "שָׁלוֹם", TRANSLITERATION: "SHALOM" }}     | ${"SHALOM"}
  `("$description", ({ hebrew, feature, transliteration }) => {
    expect(transliterate(hebrew, { ADDITIONAL_FEATURES: [feature] })).toBe(transliteration);
  });

  test("a callback receives the sequenced string, so it can use it to replace text", () => {
    expect(
      transliterate("בָּא", {
        ADDITIONAL_FEATURES: [
          {
            FEATURE: "cluster",
            HEBREW: nfc("בָּ"),
            TRANSLITERATION: (cluster, hebrew) => cluster.text.replace(hebrew, "BA")
          }
        ]
      })
    ).toBe("BAʾ");
  });

  test("a string with regex syntax is used as written", () => {
    expect(
      transliterate("בְּרֵאשִׁ֖ית", {
        ADDITIONAL_FEATURES: [
          {
            FEATURE: "syllable",
            HEBREW: "(?<![\u{05B1}-\u{05BB}\u{05C7}].*)\u{05B0}",
            TRANSLITERATION: (syllable) => syllable.text.replace(/\u{05B0}/u, "\u{05B5}")
          }
        ]
      })
    ).toBe("bērēʾšît");
  });
});

// tickets/018-stress-marker-skipped-if-mark-in-output.md
describe("ticket 018: stress marker when a letter maps to the mark character", () => {
  test.each`
    description                               | transliteration | options
    ${"after-vowel"}                          | ${"'ā'dām"}     | ${{ ALEF: "'", STRESS_MARKER: { location: "after-vowel", mark: "'" } }}
    ${"before-syllable"}                      | ${"''ādām"}     | ${{ ALEF: "'", STRESS_MARKER: { location: "before-syllable", mark: "'" } }}
    ${"control: alef maps to something else"} | ${"ʾā'dām"}     | ${{ STRESS_MARKER: { location: "after-vowel", mark: "'" } }}
  `("$description: אָ֣דָם → $transliteration", ({ transliteration, options }) => {
    expect(transliterate("אָ֣דָם", options)).toBe(transliteration);
  });

  test("a mark already added by a feature is not added again", () => {
    expect(
      transliterate("דָּבָ֑ר", {
        STRESS_MARKER: { location: "after-syllable", mark: "ˈ" },
        ADDITIONAL_FEATURES: [
          { FEATURE: "syllable", HEBREW: "ר", TRANSLITERATION: (syllable) => syllable.text.replace("ר", "רˈ") }
        ]
      })
    ).toBe("dābārˈ");
  });
});

// tickets/019-separator-skipped-when-maqaf-matches.md
describe("ticket 019: syllable separator when the output already contains the separator character", () => {
  test.each`
    description                                     | hebrew             | transliteration       | options
    ${"MAQAF is the same as the separator"}         | ${"וְכָל־הָאָרֶץ"} | ${"wə-kol-hā-ʾā-reṣ"} | ${{ SYLLABLE_SEPARATOR: "-" }}
    ${"control: a different MAQAF"}                 | ${"וְכָל־הָאָרֶץ"} | ${"wə-kol=hā-ʾā-reṣ"} | ${{ SYLLABLE_SEPARATOR: "-", MAQAF: "=" }}
    ${"feature output contains the separator"}      | ${"בְּרֵאשִׁית"}   | ${"bə-R-A-šît"}       | ${{ SYLLABLE_SEPARATOR: "-", ADDITIONAL_FEATURES: [{ FEATURE: "syllable", HEBREW: "רֵא", TRANSLITERATION: "R-A" }] }}
    ${"doubled consonant still gets one separator"} | ${"שַׁבָּת"}       | ${"šab-bāt"}          | ${{ SYLLABLE_SEPARATOR: "-" }}
    ${"dagesh chazaq as a mark is not doubled"}     | ${"שַׁבָּת"}       | ${"ša-b́āt"}           | ${{ SYLLABLE_SEPARATOR: "-", DAGESH_CHAZAQ: "́" }}
  `("$description: $hebrew → $transliteration", (inputs: Inputs) => {
    const { hebrew, transliteration, options } = inputs;
    expect(transliterate(hebrew, options)).toBe(transliteration);
  });
});

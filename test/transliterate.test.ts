import { Cluster } from "havarotjs/cluster";
import { Syllable } from "havarotjs/syllable";
import { describe, expect, test } from "vitest";
import { Schema, transliterate } from "../src/index";

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
      description                   | hebrew                     | transliteration        | options
      ${"before-syllable"}          | ${"דָּבָ֑ר"}               | ${"dāˈbār"}            | ${{ STRESS_MARKER: { location: "before-syllable", mark: "ˈ" } }}
      ${"after-syllable"}           | ${"דָּבָ֑ר"}               | ${"dābārˈ"}            | ${{ STRESS_MARKER: { location: "after-syllable", mark: "ˈ" } }}
      ${"before-vowel"}             | ${"מֶ֣לֶךְ"}               | ${"ḿelek"}             | ${{ STRESS_MARKER: { location: "before-vowel", mark: "\u0301" } }}
      ${"after-vowel"}              | ${"מֶ֣לֶךְ"}               | ${"mélek"}             | ${{ STRESS_MARKER: { location: "after-vowel", mark: "\u0301" } }}
      ${"after-vowel with mater"}   | ${"אֱלֹהִ֔ים"}             | ${"ʾĕlōhî́m"}           | ${{ STRESS_MARKER: { location: "after-vowel", mark: "\u0301" } }}
      ${"after-vowel with digraph"} | ${"בֵּ֣ית"}                | ${"beít"}              | ${{ TSERE_YOD: "ei", STRESS_MARKER: { location: "after-vowel", mark: "\u0301" } }}
      ${"exclude undefined"}        | ${"בֹּ֖קֶר י֥וֹם אֶחָֽד׃"} | ${"bṓqer yốm ʾeḥā́d"}   | ${{ STRESS_MARKER: { location: "after-vowel", mark: "\u0301" } }}
      ${"exclude never"}            | ${"בֹּ֖קֶר י֥וֹם אֶחָֽד׃"} | ${"bṓqer yốm ʾeḥā́d"}   | ${{ STRESS_MARKER: { location: "after-vowel", mark: "\u0301", exclude: "never" } }}
      ${"exclude single"}           | ${"בֹּ֖קֶר י֥וֹם אֶחָֽד׃"} | ${"bṓqer yôm ʾeḥā́d"}   | ${{ STRESS_MARKER: { location: "after-vowel", mark: "\u0301", exclude: "single" } }}
      ${"exclude final"}            | ${"בֹּ֖קֶר י֥וֹם אֶחָֽד׃"} | ${"bṓqer yôm ʾeḥād"}   | ${{ STRESS_MARKER: { location: "after-vowel", mark: "\u0301", exclude: "final" } }}
      ${"ignore paseq"}             | ${"לְפָנַ֨י ׀ שֻׁלְחָ֗ן"}  | ${"ləpāˈnay  šulˈḥān"} | ${{ STRESS_MARKER: { location: "before-syllable", mark: "ˈ" } }}
    `("$description", (inputs: Inputs) => {
      const { hebrew, transliteration, options } = inputs;
      expect(transliterate(hebrew, options)).toBe(transliteration);
    });
  });
});

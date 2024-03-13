import { Schema } from "../schema";

export const romaniote: Schema = {
  ALEF: "",
  BET: "β",
  BET_DAGESH: "μπ",
  GIMEL: "γ",
  GIMEL_DAGESH: "γκ",
  DALET: "δ",
  DALET_DAGESH: "ντ",
  HE: "",
  VAV: "β",
  ZAYIN: "ζ",
  HET: "χ",
  TET: "τ",
  YOD: "γι",
  KAF: "χ",
  KAF_DAGESH: "κ",
  FINAL_KAF: "χ",
  LAMED: "λ",
  MEM: "μ",
  FINAL_MEM: "μ",
  NUN: "ν",
  FINAL_NUN: "ν",
  SAMEKH: "σ",
  AYIN: "",
  PE: "φ",
  PE_DAGESH: "π",
  FINAL_PE: "φ",
  TSADI: "τσ",
  FINAL_TSADI: "τς",
  QOF: "κ",
  RESH: "ρ",
  SIN: "σ",
  SHIN: "σσ",
  TAV: "θ",
  TAV_DAGESH: "τ",
  DAGESH: "",
  DAGESH_CHAZAQ: false,
  VOCAL_SHEVA: "ε",
  PATAH: "α",
  HATAF_PATAH: "α",
  QAMATS: "α",
  HATAF_QAMATS: "ο",
  SEGOL: "ε",
  HATAF_SEGOL: "ε",
  TSERE: "ε",
  HIRIQ: "ι",
  HOLAM: "ω",
  HOLAM_HASER: "ω",
  QUBUTS: "ου",
  QAMATS_HE: "α",
  SEGOL_HE: "ε",
  TSERE_HE: "ε",
  SEGOL_YOD: "ε",
  HIRIQ_YOD: "ι",
  TSERE_YOD: "ε",
  FURTIVE_PATAH: "a",
  QAMATS_QATAN: "ο",
  HOLAM_VAV: "ω",
  SHUREQ: "ου",
  MS_SUFX: "άβ",
  PASEQ: "",
  SOF_PASUQ: "",
  MAQAF: "-",
  DIVINE_NAME: "Αδωνάη",
  ADDITIONAL_FEATURES: [
    {
      FEATURE: "cluster",
      HEBREW: "זּ",
      TRANSLITERATION: "τζ"
    },
    {
      FEATURE: "cluster",
      // final shin or samekh
      HEBREW: /(\u{05E9}\u{05C2}|\u{05E9}|\u{05E1})$/u,
      TRANSLITERATION: "ς"
    },
    {
      FEATURE: "syllable",
      // final sin
      HEBREW: /\u{05E9}\u{05C1}$/u,
      TRANSLITERATION: (syllable, hebrew) => {
        if (syllable.isFinal) {
          return syllable.text.replace(hebrew, "σς");
        }
        return syllable.text;
      }
    },
    {
      FEATURE: "syllable",
      // patach or qamats yod
      HEBREW:
        /(?<patachYod>[\u{05B7}\u{05B8}][\u{0590}-\u{05AF}\u{05BD}\u{05BF}]?\u{05D9}[\u{0590}-\u{05AF}\u{05BD}\u{05BF}]?)(?<maqqaf>\u{05BE}?)/u,
      TRANSLITERATION: (syllable, hebrew) => {
        const match = syllable.text.match(hebrew);

        const groups = match?.groups;
        if (!groups) {
          return syllable.text;
        }
        const { patachYod } = groups;

        return syllable.text.replace(patachYod, "αη");
      }
    },
    {
      FEATURE: "cluster",
      // consonantal yod with hiriq as vowel
      HEBREW: /(\u{05D9}\u{05B4})/u,
      TRANSLITERATION: "γι"
    },
    {
      FEATURE: "syllable",
      // tsere yod
      HEBREW:
        /(?<tsereYod>\u{05B5}[\u{0590}-\u{05AF}\u{05BD}\u{05BF}]?\u{05D9}[\u{0590}-\u{05AF}\u{05BD}\u{05BF}]?)(?<maqqaf>\u{05BE}?)$/u,
      TRANSLITERATION: (syllable, hebrew) => {
        const match = syllable.text.match(hebrew);

        const groups = match?.groups;
        if (!groups) {
          return syllable.text;
        }
        const { tsereYod } = groups;

        if (syllable.isFinal) {
          return syllable.text.replace(tsereYod, "αι\u{301}");
        }
        return syllable.text.replace(tsereYod, "ε");
      }
    },
    {
      FEATURE: "syllable",
      // hiriq yod
      HEBREW:
        /(?<hiriqYod>\u{05B4}[\u{0590}-\u{05AF}\u{05BD}\u{05BF}]?\u{05D9}[\u{0590}-\u{05AF}\u{05BD}\u{05BF}]?)(?<maqqaf>\u{05BE}?)$/u,
      TRANSLITERATION: (syllable, hebrew) => {
        const match = syllable.text.match(hebrew);

        const groups = match?.groups;
        if (!groups) {
          return syllable.text;
        }
        const { hiriqYod } = groups;

        if (syllable.isFinal) {
          const finalHiriqYod = syllable.isAccented ? "ή" : "η";
          return syllable.text.replace(hiriqYod, finalHiriqYod);
        }
        return syllable.isAccented ? syllable.text.replace(hiriqYod, "ί") : syllable.text.replace(hiriqYod, "ι");
      }
    },
    {
      FEATURE: "syllable",
      // masculine plural marker
      HEBREW: /(\u{05B4}[\u{0590}-\u{05AF}\u{05BD}\u{05BF}]?\u{05D9}\u{05DD})/u,
      TRANSLITERATION: (syllable, hebrew) => {
        return syllable.text.replace(hebrew, "ει\u{301}μ");
      }
    }
  ],
  STRESS_MARKER: {
    mark: "\u{301}",
    location: "after-vowel",
    exclude: "single"
  },
  longVowels: true,
  shevaAfterMeteg: true,
  sqnmlvy: true,
  qametsQatan: true,
  wawShureq: true,
  article: true,
  allowNoNiqqud: true,
  strict: false,
  holemHaser: "remove"
};

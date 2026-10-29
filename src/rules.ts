import { Cluster } from "havarotjs/cluster";
import { Syllable } from "havarotjs/syllable";
import { clusterSplitGroup } from "havarotjs/utils/regularExpressions";
import { Word } from "havarotjs/word";
import type { Schema } from "./schema.js";

const taamim = /[\u{0591}-\u{05AF}\u{05BD}\u{05BF}]/gu;
const hebLetter = /[\u{05D0}-\u{05F2}]/u;
/** the letters of the Divine Name, with any points or accents between them */
const divineNameLetters =
  /\u{05D9}[^\u{05D0}-\u{05F4}]*\u{05D4}[^\u{05D0}-\u{05F4}]*\u{05D5}[^\u{05D0}-\u{05F4}]*\u{05D4}/u;
/** points and accents that attach to a letter, as opposed to punctuation such as maqaf, paseq, or sof pasuq */
const letterMarks = /[\u{0591}-\u{05BD}\u{05BF}\u{05C1}\u{05C2}\u{05C4}\u{05C5}\u{05C7}]/gu;

/**
 * Adds a stress marker to a syllable according to the schema settings
 *
 * @param text the transliterated text
 * @param syl the current syllable
 * @param schema the schema
 */
const addStressMarker = (text: string, syl: Syllable, schema: Schema) => {
  if (!schema.STRESS_MARKER || !text) {
    return text;
  }

  if (!syl.isAccented) {
    return text;
  }

  // a word in construct is not stressed on its own
  if (syl.word?.isInConstruct) {
    return text;
  }

  // a syllable that is only punctuation (e.g. a paseq) is not stressed
  if (syl.clusters.every((c) => c.isPunctuation)) {
    return text;
  }

  const exclude = schema.STRESS_MARKER?.exclude ?? "never";

  if (exclude === "single" && !syl.prev && !syl.next) {
    return text;
  }

  if (exclude === "final" && !syl.next) {
    return text;
  }

  const location = schema.STRESS_MARKER.location;
  const mark = schema.STRESS_MARKER.mark;

  // if the stress marker is already present, no need to add it again
  if (text.includes(mark)) {
    return text;
  }

  if (location === "before-syllable") {
    // a doubled consonant is split between the previous syllable and this one (e.g. hak-ˈkol),
    // so the mark goes before the second half, where the consonant's own value starts again
    const onset = syl.clusters[0];
    if (onset && typeof schema.DAGESH_CHAZAQ === "boolean" && isDageshChazaq(onset, schema)) {
      const consonant = getConsonantValue(onset, schema);
      const index = consonant ? text.indexOf(consonant, 1) : -1;
      if (index > 0) {
        return `${text.slice(0, index)}${mark}${text.slice(index)}`;
      }
    }

    return `${mark}${text}`;
  }

  if (location === "after-syllable") {
    return `${text}${mark}`;
  }

  const vowels = [
    schema.PATAH,
    schema.HATAF_PATAH,
    schema.QAMATS,
    schema.HATAF_QAMATS,
    schema.SEGOL,
    schema.HATAF_SEGOL,
    schema.TSERE,
    schema.HIRIQ,
    schema.HOLAM,
    schema.HOLAM_HASER,
    schema.QAMATS_QATAN,
    schema.QUBUTS,
    schema.QAMATS_HE,
    schema.SEGOL_HE,
    schema.TSERE_HE,
    schema.HIRIQ_YOD,
    schema.TSERE_YOD,
    schema.SEGOL_YOD,
    schema.HOLAM_VAV,
    schema.SHUREQ,
    // a hiriq or qubuts marked as long by a feature (e.g. SBL's defectiveLongVowels outputs ī and ū)
    withMacron(schema.HIRIQ),
    withMacron(schema.QUBUTS)
  ]
    // an empty vowel would match at the start of every syllable
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .sort((a, b) => b.length - a.length);
  if (!vowels.length) {
    return text;
  }

  // schema values are plain text, so escape any regex syntax in them (e.g. the "." in "W.")
  const vowelRgx = new RegExp(vowels.map(escapeRegExp).join("|"), "u");
  const match = vowelRgx.exec(text);
  if (!match) {
    return text;
  }

  const index = location === "before-vowel" ? match.index : match.index + match[0].length;
  return text.slice(0, index) + mark + text.slice(index);
};

/** The schema keys for consonants that have a separate value with a dagesh */
const dageshKeys: Partial<Record<string, keyof Schema>> = {
  BET: "BET_DAGESH",
  GIMEL: "GIMEL_DAGESH",
  DALET: "DALET_DAGESH",
  KAF: "KAF_DAGESH",
  FINAL_KAF: "KAF_DAGESH",
  PE: "PE_DAGESH",
  TAV: "TAV_DAGESH"
};

/**
 * Gets the schema value of a cluster's consonant, as it is output when it is not doubled
 *
 * @returns the value, or an empty string if the cluster does not start with a consonant in the schema
 */
const getConsonantValue = (cluster: Cluster, schema: Schema): string => {
  const name = cluster.chars[0]?.characterName;
  if (!name) {
    return "";
  }

  if (name === "SHIN" && /\u{05C2}/u.test(cluster.text)) {
    return schema.SIN;
  }

  const dageshKey = /\u{05BC}/u.test(cluster.text) ? dageshKeys[name] : undefined;
  const dageshValue = dageshKey ? schema[dageshKey] : undefined;
  if (typeof dageshValue === "string" && dageshValue) {
    return dageshValue;
  }

  const value = name in schema ? schema[name as keyof Schema] : undefined;
  return typeof value === "string" ? value : "";
};

/** Adds a macron to a vowel, composing it where possible (e.g. "i" → "ī") */
const withMacron = (vowel: string | undefined) => (vowel ? (vowel + "\u{0304}").normalize("NFC") : vowel);

/** Escapes a string so that it matches itself literally when used in a RegExp */
const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const copySyllable = (newText: string, old: Syllable) => {
  const newClusters = newText.split(clusterSplitGroup).map((clusterString) => new Cluster(clusterString, true));
  const oldClusters = old.clusters;

  // set prev and next based on old syllable
  if (newClusters.length === oldClusters.length) {
    newClusters.forEach((c, i) => ((c.prev = oldClusters[i]?.prev ?? null), (c.next = oldClusters[i]?.next ?? null)));
  } else {
    for (let i = 0; i < newClusters.length; i++) {
      const c = newClusters[i];
      if (oldClusters[i]?.text[0] === c?.text[0]) {
        c.prev = oldClusters[i]?.prev ?? null;
        c.next = oldClusters[i]?.next ?? null;
      } else {
        c.prev = oldClusters[i]?.prev ?? null;
        c.next = oldClusters[i + 1]?.next ?? null;
        i++;
      }
    }
  }

  const newSyl = new Syllable(newClusters, {
    isClosed: old.isClosed,
    isAccented: old.isAccented,
    isFinal: old.isFinal
  });

  newClusters.forEach((c) => (c.syllable = newSyl));

  newSyl.prev = old.prev;
  newSyl.next = old.next;
  newSyl.word = old.word;

  return newSyl;
};

const getDageshChazaqVal = (input: string, schema: Schema, isChazaq: boolean) => {
  if (!isChazaq) {
    return input;
  }

  const dagesh = schema["DAGESH_CHAZAQ"];
  const syllableSeparator = schema["SYLLABLE_SEPARATOR"] ?? "";

  if (typeof dagesh === "boolean") {
    return input + syllableSeparator + input;
  }

  return input + dagesh;
};

/**
 * Formats the Divine Name with any Latin chars
 *
 * @param str word text
 * @param schema
 * @returns the Divine Name with any pre or proceding Latin chars
 */
const getDivineName = (str: string, schema: Schema): string => {
  // if DN is pointed with a hiriq, then it is read as 'elohim
  // only look at the Divine Name itself, not at a prefix (e.g. מִ)
  const divineNameText = str.match(divineNameLetters)?.[0] ?? str;
  const divineName =
    schema.DIVINE_NAME_ELOHIM && /\u{05B4}/u.test(divineNameText) ? schema.DIVINE_NAME_ELOHIM : schema.DIVINE_NAME;

  const chars = [...str];
  const first = chars.findIndex((char) => hebLetter.test(char));
  if (first === -1) {
    return divineName;
  }
  let last = chars.length - 1;
  while (!hebLetter.test(chars[last])) {
    last--;
  }

  // keep whatever surrounds the Divine Name (e.g. parentheses, a maqaf, or a sof pasuq),
  // but not the points and accents that belong to its letters
  const before = chars.slice(0, first).join("");
  const after = chars
    .slice(last + 1)
    .join("")
    .replace(letterMarks, "");
  return `${mapChars(schema)(before)}${divineName}${mapChars(schema)(after)}`;
};

/**
 * Transliterates the prefix of a word that contains the Divine Name (e.g. the וְלַ of וְלַיהוָה)
 *
 * @param word a word for which `hasDivineName` is true
 * @param schema
 * @returns the transliterated prefix, or an empty string if there is none
 */
const getDivineNamePrefix = (word: Word, schema: Schema): string => {
  const start = word.text.search(divineNameLetters);
  if (start <= 0) {
    return "";
  }

  const prefix: string[] = [];
  let length = 0;
  for (const syl of word.syllables) {
    if (length + syl.text.length > start) {
      // the syllable runs into the Divine Name (e.g. the מִיְ of מִיְהוָה),
      // so only transliterate the part before it
      const rest = word.text.slice(length, start);
      if (rest) {
        prefix.push(sylRules(copySyllable(rest, syl), schema));
      }
      break;
    }
    prefix.push(sylRules(syl, schema));
    length += syl.text.length;
  }

  return prefix.join(schema.SYLLABLE_SEPARATOR ?? "");
};

const isDageshChazaq = (cluster: Cluster, schema: Schema) => {
  // if there is no dagesh chazaq in the schema, then return false
  if (!schema.DAGESH_CHAZAQ) {
    return false;
  }

  // a shureq could potentially match because of dagesh
  if (cluster.isShureq) {
    return false;
  }

  // if there is no dagesh in the text, then return false
  if (!/\u{05BC}/u.test(cluster.text)) {
    return false;
  }

  // if the previous cluster has a sheva, then it is not a dagesh chazaq
  // likely being a Qal 2fs suffix (e.g. קָטַלְתְּ)
  const prevCluster = cluster.prev?.value;
  if (prevCluster?.hasSheva) {
    return false;
  }

  const prevWord = cluster.syllable?.word?.prev?.value;
  if (prevWord?.isInConstruct && !prevWord.syllables[prevWord.syllables.length - 1].isClosed) {
    return true;
  }

  // this could be a code smell, b/c the copySyllable function results are not the most predictable
  const prevSyllable = cluster.syllable?.prev;
  if (!prevSyllable) {
    return false;
  }

  const prevCoda = prevSyllable.value?.codaWithGemination;
  if (!prevCoda) {
    return false;
  }

  return prevCoda === cluster.syllable?.onset;
};

const joinSyllableChars = (syl: Syllable, sylChars: string[], schema: Schema): string => {
  const isInConstruct = syl.word?.isInConstruct;

  if (isInConstruct) {
    return sylChars.map(mapChars(schema)).join("");
  }

  if (!syl.isAccented) {
    return sylChars.map(mapChars(schema)).join("");
  }

  // if syllable is only punctuation (e.g. a paseq), it should not receive a stress marker
  const isOnlyPunctuation = syl.clusters.map((c) => c.isPunctuation).every((c) => c);
  if (isOnlyPunctuation) {
    return sylChars.map(mapChars(schema)).join("");
  }

  return sylChars.map(mapChars(schema)).join("");
};

/**
 * Maps Hebrew characters to schema
 *
 * @param input - text to be transliterated
 * @param schema - a {@link Schema} for transliterating the input
 * @returns transliteration of characters
 *
 */
const mapChars = (schema: Schema) => (input: string) => {
  const map = {
    //   niqqud
    "\u{05B0}": "VOCAL_SHEVA", // HEBREW POINT SHEVA (U+05B0)
    "\u{05B1}": "HATAF_SEGOL", // HEBREW POINT HATAF SEGOL (U+05B1)
    "\u{05B2}": "HATAF_PATAH", // HEBREW POINT HATAF PATAH (U+05B2)
    "\u{05B3}": "HATAF_QAMATS", // HEBREW POINT HATAF QAMATS (U+05B3)
    "\u{05B4}": "HIRIQ", // HEBREW POINT HIRIQ (U+05B4)
    "\u{05B5}": "TSERE", // HEBREW POINT TSERE (U+05B5)
    "\u{05B6}": "SEGOL", // HEBREW POINT SEGOL (U+05B6)
    "\u{05B7}": "PATAH", // HEBREW POINT PATAH (U+05B7)
    "\u{05B8}": "QAMATS", // HEBREW POINT QAMATS (U+05B8)
    "\u{05B9}": "HOLAM", // HEBREW POINT HOLAM (U+05B9)
    "\u{05BA}": "HOLAM_HASER", // HEBREW POINT HOLAM HASER FOR VAV (U+05BA)
    "\u{05BB}": "QUBUTS", // HEBREW POINT QUBUTS (U+05BB)
    "\u{05BC}": "DAGESH", // HEBREW POINT DAGESH OR MAPIQ (U+05BC)
    //  "\u{05BD}": "", // HEBREW POINT METEG (U+05BD)
    "\u{05BE}": "MAQAF", // HEBREW PUNCTUATION MAQAF (U+05BE)
    "\u{05C0}": "PASEQ", // HEBREW PUNCTUATION PASEQ (U+05C0)
    "\u{05C3}": "SOF_PASUQ", // HEBREW PUNCTUATION SOF PASUQ (U+05C3)
    "\u{05C7}": "QAMATS_QATAN", // HEBREW POINT QAMATS QATAN (U+05C7)
    //   consonants
    א: "ALEF", // HEBREW LETTER ALEF (U+05D0)
    ב: "BET", // HEBREW LETTER BET (U+05D1)
    ג: "GIMEL", // HEBREW LETTER GIMEL (U+05D2)
    ד: "DALET", // HEBREW LETTER DALET (U+05D3)
    ה: "HE", // HEBREW LETTER HE (U+05D4)
    ו: "VAV", // HEBREW LETTER VAV (U+05D5)
    ז: "ZAYIN", // HEBREW LETTER ZAYIN (U+05D6)
    ח: "HET", // HEBREW LETTER HET (U+05D7)
    ט: "TET", // HEBREW LETTER TET (U+05D8)
    י: "YOD", // HEBREW LETTER YOD (U+05D9)
    ך: "FINAL_KAF", // HEBREW LETTER FINAL KAF (U+05DA)
    כ: "KAF", // HEBREW LETTER KAF (U+05DB)
    ל: "LAMED", // HEBREW LETTER LAMED (U+05DC)
    ם: "FINAL_MEM", // HEBREW LETTER FINAL MEM (U+05DD)
    מ: "MEM", // HEBREW LETTER MEM (U+05DE)
    ן: "FINAL_NUN", // HEBREW LETTER FINAL NUN (U+05DF)
    נ: "NUN", // HEBREW LETTER NUN (U+05E0)
    ס: "SAMEKH", // HEBREW LETTER SAMEKH (U+05E1)
    ע: "AYIN", // HEBREW LETTER AYIN (U+05E2)
    ף: "FINAL_PE", // HEBREW LETTER FINAL PE (U+05E3)
    פ: "PE", // HEBREW LETTER PE (U+05E4)
    ץ: "FINAL_TSADI", // HEBREW LETTER FINAL TSADI (U+05E5)
    צ: "TSADI", // HEBREW LETTER TSADI (U+05E6)
    ק: "QOF", // HEBREW LETTER QOF (U+05E7)
    ר: "RESH", // HEBREW LETTER RESH (U+05E8)
    ש: "SHIN", // HEBREW LETTER SHIN (U+05E9)
    ת: "TAV" // HEBREW LETTER TAV (U+05EA)
    // "\u{05EF}": "", // HEBREW YOD TRIANGLE (U+05EF)
    // װ: "", // HEBREW LIGATURE YIDDISH DOUBLE VAV (U+05F0)
    // ױ: "", // HEBREW LIGATURE YIDDISH VAV YOD (U+05F1)
    // ײ: "" // HEBREW LIGATURE YIDDISH DOUBLE YOD (U+05F2)
  } as const;

  function isMapKey(key: string): key is keyof typeof map {
    return key in map;
  }
  return [...input].map((char: string) => (isMapKey(char) ? schema[map[char]] : char)).join("");
};

const materFeatures = (syl: Syllable, schema: Schema) => {
  const mater = syl.clusters.filter((c) => c.isMater)[0];
  const prev = mater.prev instanceof Cluster ? mater.prev : null;
  const materText = mater.text;
  const prevText = (prev?.text || "").replace(taamim, "");
  // string comprised of all non-mater clusters in a syl with a mater
  let noMaterText = syl.clusters
    .filter((c) => !c.isMater)
    .map((c) => cluterRules(c, schema))
    .join("");

  // workaround for maqaf
  const hasMaqaf = mater.text.includes("־");
  noMaterText = hasMaqaf ? noMaterText.concat("־") : noMaterText;

  if (/י/.test(materText)) {
    // hiriq
    if (/\u{05B4}/u.test(prevText)) {
      return replaceWithRegex(noMaterText, /\u{05B4}/u, schema.HIRIQ_YOD);
    }
    // tsere
    if (/\u{05B5}/u.test(prevText)) {
      return replaceWithRegex(noMaterText, /\u{05B5}/u, schema.TSERE_YOD);
    }
    // segol
    if (/\u{05B6}/u.test(prevText)) {
      return replaceWithRegex(noMaterText, /\u{05B6}/u, schema.SEGOL_YOD);
    }
  }

  if (/ו/u.test(materText)) {
    // holam
    if (/\u{05B9}/u.test(prevText)) {
      return replaceWithRegex(noMaterText, /\u{05B9}/u, schema.HOLAM_VAV);
    }
  }

  if (/ה/.test(materText)) {
    // qamets
    if (/\u{05B8}/u.test(prevText)) {
      return replaceWithRegex(noMaterText, /\u{05B8}/u, schema.QAMATS_HE);
    }
  }

  return materText;
};

const removeTaamim = (input: string) => input.replace(taamim, "");

/**
 * Replaces part of a string and transliterates the remaining characters according to the schema
 *
 * @example
 * ```ts
 * // replaces בָ as VA, but only when matching the regex sequence
 * const betAndQamats = /\u{05D1}\u{05B8}/u
 * replaceAndTransliterate("דָּבָר", betAndQamats, "VA", schema);
 * // dāVAr
 * ```
 *
 * @param input the text to be transliterated
 * @param regex the regex used as the search value
 * @param replaceValue the string to replace the regex
 * @param schema the Schema
 */
const replaceAndTransliterate = (input: string, regex: RegExp, replaceValue: string, schema: Schema) => {
  const sylSeq = replaceWithRegex(input, regex, replaceValue);
  return [...sylSeq].map(mapChars(schema)).join("");
};

/**
 * Wrapper around `String.replace()` to constrain to a RegExp
 *
 * @param input the string to be modified
 * @param regex the regex to be used as the search value
 * @param replaceValue the string to replace the regex
 */
const replaceWithRegex = (input: string, regex: RegExp, replaceValue: string) => input.replace(regex, replaceValue);

// MAIN RULES

const cluterRules = (cluster: Cluster, schema: Schema) => {
  let clusterText = removeTaamim(cluster.text);
  const clusterFeatures = schema.ADDITIONAL_FEATURES?.filter((seq) => seq.FEATURE === "cluster");
  if (clusterFeatures) {
    for (const feature of clusterFeatures) {
      const heb = new RegExp(feature.HEBREW, "u");
      if (feature.FEATURE === "cluster" && heb.test(clusterText)) {
        const transliteration = feature.TRANSLITERATION;
        const passThrough = feature.PASS_THROUGH ?? true;

        if (typeof transliteration === "string") {
          return replaceAndTransliterate(clusterText, heb, transliteration, schema);
        }

        if (!passThrough) {
          return transliteration(cluster, feature.HEBREW, schema);
        }

        clusterText = transliteration(cluster, feature.HEBREW, schema);
      }
    }
  }

  const syl = cluster.syllable;
  clusterText = cluster.hasSheva && syl?.isClosed ? clusterText.replace(/\u{05B0}/u, "") : clusterText;

  // mappiq he
  if (/ה\u{05BC}$/mu.test(clusterText)) {
    return replaceWithRegex(clusterText, /ה\u{05BC}/u, schema.HE);
  }

  if (syl?.isFinal && !syl?.isClosed) {
    // a furtive patah is pronounced before its consonant,
    // so output the FURTIVE_PATAH value first and let the consonant be mapped as usual
    const furtivePatah = schema.FURTIVE_PATAH;

    const furtiveChet = /\u{05D7}\u{05B7}$/mu;
    if (furtiveChet.test(clusterText)) {
      return clusterText.replace(furtiveChet, () => furtivePatah + "\u{05D7}");
    }

    const furtiveAyin = /\u{05E2}\u{05B7}$/mu;
    if (furtiveAyin.test(clusterText)) {
      return clusterText.replace(furtiveAyin, () => furtivePatah + "\u{05E2}");
    }

    const furtiveHe = /\u{05D4}\u{05BC}\u{05B7}$/mu;
    if (furtiveHe.test(clusterText)) {
      return clusterText.replace(furtiveHe, () => furtivePatah + "\u{05D4}\u{05BC}");
    }
  }

  // dagesh chazaq
  const isDageshChazq = isDageshChazaq(cluster, schema);

  if (schema.BET_DAGESH && /ב\u{05BC}/u.test(clusterText)) {
    return replaceWithRegex(clusterText, /ב\u{05BC}/u, getDageshChazaqVal(schema.BET_DAGESH, schema, isDageshChazq));
  }

  if (schema.GIMEL_DAGESH && /ג\u{05BC}/u.test(clusterText)) {
    return replaceWithRegex(clusterText, /ג\u{05BC}/u, getDageshChazaqVal(schema.GIMEL_DAGESH, schema, isDageshChazq));
  }

  if (schema.DALET_DAGESH && /ד\u{05BC}/u.test(clusterText)) {
    return replaceWithRegex(clusterText, /ד\u{05BC}/u, getDageshChazaqVal(schema.DALET_DAGESH, schema, isDageshChazq));
  }

  if (schema.KAF_DAGESH && /כ\u{05BC}/u.test(clusterText)) {
    return replaceWithRegex(clusterText, /כ\u{05BC}/u, getDageshChazaqVal(schema.KAF_DAGESH, schema, isDageshChazq));
  }

  if (schema.KAF_DAGESH && /ך\u{05BC}/u.test(clusterText)) {
    return replaceWithRegex(clusterText, /ך\u{05BC}/u, getDageshChazaqVal(schema.KAF_DAGESH, schema, isDageshChazq));
  }

  if (schema.PE_DAGESH && /פ\u{05BC}/u.test(clusterText)) {
    return replaceWithRegex(clusterText, /פ\u{05BC}/u, getDageshChazaqVal(schema.PE_DAGESH, schema, isDageshChazq));
  }

  if (schema.TAV_DAGESH && /ת\u{05BC}/u.test(clusterText)) {
    return replaceWithRegex(clusterText, /ת\u{05BC}/u, getDageshChazaqVal(schema.TAV_DAGESH, schema, isDageshChazq));
  }

  if (/ש\u{05C1}/u.test(clusterText)) {
    return replaceWithRegex(clusterText, /ש\u{05C1}/u, getDageshChazaqVal(schema.SHIN, schema, isDageshChazq));
  }

  if (/ש\u{05C2}/u.test(clusterText)) {
    return replaceWithRegex(clusterText, /ש\u{05C2}/u, getDageshChazaqVal(schema.SIN, schema, isDageshChazq));
  }

  if (isDageshChazq) {
    const consonant = cluster.chars[0].text;
    const consonantDagesh = new RegExp(consonant + "\u{05BC}", "u");
    return replaceWithRegex(clusterText, consonantDagesh, getDageshChazaqVal(consonant, schema, isDageshChazq));
  }

  if (cluster.isShureq) {
    return clusterText.replace("וּ", schema.SHUREQ);
  }

  return clusterText;
};

export const sylRules = (syl: Syllable, schema: Schema): string => {
  /** The syllable's original text with taamim removed */
  const baseSyllableText = syl.text.replace(taamim, "");

  const syllableFeatures = schema.ADDITIONAL_FEATURES?.filter((seq) => seq.FEATURE === "syllable");
  if (syllableFeatures) {
    for (const feature of syllableFeatures) {
      const heb = new RegExp(feature.HEBREW, "u");
      if (feature.FEATURE === "syllable" && heb.test(baseSyllableText)) {
        const transliteration = feature.TRANSLITERATION;
        const passThrough = feature.PASS_THROUGH ?? true;

        if (typeof transliteration === "string") {
          return replaceAndTransliterate(baseSyllableText, heb, transliteration, schema);
        }

        if (!passThrough) {
          return transliteration(syl, feature.HEBREW, schema);
        }

        const newText = transliteration(syl, feature.HEBREW, schema);

        // if the transliteration just returns the syllable.text, then no need to copy the syllable
        if (newText !== baseSyllableText) {
          syl = copySyllable(newText, syl);
        }
      }
    }
  }

  const hasMater = syl.clusters.map((c) => c.isMater).includes(true);
  if (hasMater) {
    const materSyl = materFeatures(syl, schema);
    const text = joinSyllableChars(syl, [...materSyl], schema);
    return addStressMarker(text, syl, schema);
  }

  const clusters = syl.clusters.map((cluster) => cluterRules(cluster, schema));
  const joined = joinSyllableChars(syl, clusters, schema).replace(taamim, "");

  // syllable is 3ms sufx
  const mSSuffix = /\u{05B8}\u{05D9}\u{05D5}/u;
  if (syl.isFinal && mSSuffix.test(baseSyllableText)) {
    const text = joined.replace(schema["QAMATS"] + schema["YOD"] + schema["VAV"], schema.MS_SUFX);
    return addStressMarker(text, syl, schema);
  }

  if (schema.SEGOL_HE && /\u{05B6}\u{05D4}/u.test(baseSyllableText)) {
    const text = joined.replace(schema["SEGOL"] + schema["HE"], schema.SEGOL_HE);
    return addStressMarker(text, syl, schema);
  }

  if (schema.TSERE_HE && /\u{05B5}\u{05D4}/u.test(baseSyllableText)) {
    const text = joined.replace(schema["TSERE"] + schema["HE"], schema.TSERE_HE);
    return addStressMarker(text, syl, schema);
  }

  if (schema.PATAH_HE && /\u{05B7}\u{05D4}/u.test(baseSyllableText)) {
    const text = joined.replace(schema["PATAH"] + schema["HE"], schema.PATAH_HE);
    return addStressMarker(text, syl, schema);
  }

  const text = joined.replace(taamim, "");
  return addStressMarker(text, syl, schema);
};

export const wordRules = (word: Word, schema: Schema): string | Word => {
  if (word.isDivineName) {
    return getDivineName(word.text, schema);
  }

  if (word.hasDivineName) {
    const prefix = getDivineNamePrefix(word, schema);
    const divineName = getDivineName(word.text, schema);
    return prefix ? `${prefix}-${divineName}` : divineName;
  }

  if (word.isNotHebrew) {
    return word.text;
  }

  const wordFeatures = schema.ADDITIONAL_FEATURES?.filter((seq) => seq.FEATURE === "word");
  if (!wordFeatures) {
    return word;
  }

  // like cluster and syllable features, each pass-through feature works on the result of the previous one
  let current = word;
  for (const feature of wordFeatures) {
    const text = current.text.replace(taamim, "");
    const heb = new RegExp(feature.HEBREW, "u");
    if (!heb.test(text)) {
      continue;
    }

    const transliteration = feature.TRANSLITERATION;
    const passThrough = feature.PASS_THROUGH ?? true;

    if (typeof transliteration === "string") {
      return replaceAndTransliterate(text, heb, transliteration, schema);
    }

    if (!passThrough) {
      return transliteration(current, feature.HEBREW, schema);
    }

    const newText = transliteration(current, feature.HEBREW, schema);
    // only rebuild the word if the feature changed it
    if (newText !== current.text && newText !== text) {
      current = copyWord(newText, current, schema);
    }
  }

  return current;
};

/**
 * Creates a new Word from new text, keeping the links to the words around the old one
 * (e.g. so a following word can still see that this word is in construct)
 */
const copyWord = (newText: string, old: Word, schema: Schema) => {
  const newWord = new Word(newText, schema);
  newWord.prev = old.prev;
  newWord.next = old.next;
  return newWord;
};

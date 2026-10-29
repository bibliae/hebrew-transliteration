import { Text } from "havarotjs";
import { sequence as sequenceChars } from "havarotjs/utils/sequence";

export const vowels = /[\u{05B0}-\u{05BC}\u{05C7}]/u;

/** Hebrew presentation forms (e.g. U+FB2C), which are written as a letter with its points */
const presentationForms = /[\u{FB1D}-\u{FB4F}]/gu;

/**
 * Sequences Hebrew charactes according to the [SBL Hebrew Font Manual](https://www.sbl-site.org/Fonts/SBLHebrewUserManual1.5x.pdf)
 *
 * @param text - a string of Hebrew character
 * @param qametsQatan - convert qamets to qamets qatan
 * @returns a sequenced string of text
 *
 * @example
 * ```js
 * import { sequence } from "hebrew-transliteration";
 *
 * sequence("\u{5D1}\u{5B0}\u{5BC}\u{5E8}\u{5B5}\u{5D0}\u{5E9}\u{5B4}\u{5C1}\u{596}\u{5D9}\u{5EA}");
 * //       "\u{5D1}\u{5BC}\u{5B0}\u{5E8}\u{5B5}\u{5D0}\u{5E9}\u{5C1}\u{5B4}\u{596}\u{5D9}\u{5EA}";
 * ```
 *
 * @remarks
 * Seqeuncing follows the pattern of: consonant - dagesh - vowel - ta'am as defined in the {@link https://www.sbl-site.org/Fonts/SBLHebrewUserManual1.5x.pdf | SBL Hebrew Font Manual}
 *
 * Text with vowels is prepared the same way havarotjs prepares it for transliteration:
 * it is normalized (NFKD) and trimmed, and a holam male is moved off its vav (e.g. `וֹ` becomes `ֹו`).
 */
export const sequence = (text: string, qametsQatan = false): string => {
  return vowels.test(text) ? new Text(text, { qametsQatan }).text : text;
};

/**
 * Puts the marks of each Hebrew letter in order (consonant - dagesh - vowel - ta'am), without changing anything else
 *
 * Unlike {@link sequence}, it does not normalize, trim, or move a holam male,
 * so text that is not Hebrew, whitespace, and the position of each mark stay as they are.
 *
 * @param text - a string of Hebrew characters
 * @returns the text with the marks of each letter in order
 */
export const sequenceMarks = (text: string): string => {
  const decomposed = text.replace(presentationForms, (char) => char.normalize("NFKD"));
  return sequenceChars(decomposed)
    .flat()
    .map((char) => char.text)
    .join("");
};

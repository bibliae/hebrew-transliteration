# hebrew-transliteration

A JavaScript package for transliterating Hebrew

## install

### npm

```bash
npm install hebrew-transliteration
```

### from source

You will need to have [node installed](https://nodejs.org/en/download/).

Download or clone this repository

```bash
cd hebrew-transliteration
npm install
npm run build
```

## quickstart

You can ESM:

```javascript
import { transliterate } from "hebrew-transliteration";
transliterate("אֱלֹהִים");
// ʾĕlōhîm
```

Or CommonJS: 

```javascript
const heb = require("hebrew-transliteration");
const transliterate = heb.transliterate;
transliterate("אֱלֹהִים");
// ʾĕlōhîm
```

## DOCS

### About

This is a JavaScript package for transliterating Hebrew.

It exports 3 [functions](#functions):

1. [`transliterate()`](#transliterate) — the main function which transliterates Hebrew
2. [`remove()`](#remove) — removes taamim and optionally removes certain niqqudim
3. [`sequence()`](#sequence) — sequences Hebrew characters according to the [SBL Hebrew Font Manual](https://www.sbl-site.org/Fonts/SBLHebrewUserManual1.5x.pdf)

And it exports 2 [classes](#classes):

1. [`Text`](#text) — the [`Text`](https://charlesloder.github.io/havarotjs/classes/text.Text.html) class from the `havarotjs` package
2. [`Schema`](#schema) — a schema for transliterating Hebrew

### Functions

#### `transliterate()`

Takes a `string` or [`Text`](#text), and optionally a [`Schema`](#schema) or `Partial<Schema>`

```javascript
heb.transliterate("אֱלֹהִים");
// ʾĕlōhîm
```

If no [`Schema`](#schema) is passed, then the package defaults to SBL's academic style.

You can pass in a `Partial<Schema>` that will modify SBL's academic style:

```javascript
heb.transliterate("שָׁלוֹם", { SHIN: "sh" });
// shālôm
```

There are premade schemas as well.

```javascript
const brillAcademic = require("hebrew-transliteration/schemas").brillAcademic;

heb.transliterate("בְּבֵית", brillAcademic)
// bᵉḇêṯ
```
**Note**: schemas are not endorsed by publishers.

If you need a fully customized transliteration, it is best to use the [`Schema`](#schema) constructor:

```javascript
const schema = new heb.Schema({
  ALEF: "'",
  BET: "B",
  ...
  QAMETS: "A",
  ...
}) // truncated for brevity

heb.transliterate("אָ֣ב", schema)
// 'AB
```


#### `remove()`

Takes `string` and `RemoveOptions`.

The default removes accents (i.e. characters called HEBREW ACCENT) and metheg and rafe.

```javascript
heb.remove("שָׂרַ֣י אִשְׁתְּךָ֔");
// שָׂרַי אִשְׁתְּךָ;
```

The `RemoveOptions` can be customized.

```javascript
heb.remove("שָׂרַ֣י אִשְׁתְּךָ֔", { SHIN_DOT: true, SIN_DOT: true });
// שָרַ֣י אִשְתְּךָ֔
```

**Note:** unlike a `Schema` where a `Partial<Schema>` extends the default, `RemoveOptions` does not accept a `Partial<RemoveOptions>`.

All properties for `RemoveOptions` can be found in the [source](src/remove.ts).

There are some preset options availables as well.

```javascript
const opts = require("hebrew-transliteration/removeOptions");
heb.remove("שָׂרַ֣י אִשְׁתְּךָ֔", opts.all);
// שרי אשתך, וימצאו
```


#### `sequence()`

Takes a `string`. Returns a string of properly sequenced characters according to the [SBL Hebrew Font manual](https://www.sbl-site.org/Fonts/SBLHebrewUserManual1.5x.pdf) following the pattern of: consonant - dagesh - vowel - ta'am

```javascript
heb.sequence("\u{5D1}\u{5B0}\u{5BC}\u{5E8}\u{5B5}\u{5D0}\u{5E9}\u{5B4}\u{5C1}\u{596}\u{5D9}\u{5EA}");
//           "\u{5D1}\u{5BC}\u{5B0}\u{5E8}\u{5B5}\u{5D0}\u{5E9}\u{5C1}\u{5B4}\u{596}\u{5D9}\u{5EA}"
```

### Classes

#### Text

The [`Text`](https://charlesloder.github.io/havarotjs/classes/text.Text.html) class from the [`havarotjs`](https://www.npmjs.com/package/havarotjs) package.

This class is used by [`transliterate()`](#transliterate) internally to syllabify Hebrew text, but it is exposed as well.

```javascript
const text = new heb.Text("הֲבָרֹות");
text.syllables;
// [
//    Syllable { original: "הֲ" },
//    Syllable { original: "בָ" },
//    Syllable { original: "רֹות" }
//  ]
```

If a `Text` is passed into [`transliterate()`](#transliterate) instead of a `string`, then the syllabification from the `Text` class is used.
If a `string` is passed in, then syllabification come from the options passed into the [`Schema`](#schema).
See more under [syllabification](#syllabification).

#### Schema

A `Schema` is used to define a schema for transliteration. See the [`Schema` source](src/schema.ts) for all available properties.

The `Schema` can be divided into a few categories.

##### 1) Syllabification

The options used for syllabifying Hebrew text can be found [here](https://charlesloder.github.io/havarotjs/interfaces/text.SylOpts.html)

###### Differences between `Text` and `Schema`

There are 5 options for syllabification that are the [same as the ones used by the `Text`](https://charlesloder.github.io/havarotjs/interfaces/text.SylOpts.html) class.

Read more about the syllabification options for the [`Text`](https://charlesloder.github.io/havarotjs/interfaces/text.SylOpts.html) and a [higher level overview](https://charlesloder.github.io/havarotjs/pages/Linguistic/syllabification.html)

###### Precedence of `Text` over `Schema`

The syllabification options set by `Schema` are used if a `string` is passed into [`transliterate()`](#transliterate). If a `Text` is passed into [`transliterate()`](#transliterate) instead of a `string`, then the syllabification from the `Text` class is used:

```javascript
// using default
heb.transliterate("חָכְמָ֣ה"); // ḥokmâ

// using Schema for syllabification
heb.transliterate("חָכְמָ֣ה", { qametsQatan: false }); // ḥākǝmâ

// using Text for syllabification
heb.transliterate(new heb.Text("חָכְמָ֣ה", { qametsQatan: false })); // ḥākǝmâ

// using Schema and Text — Text takes precedence
heb.transliterate(new heb.Text("חָכְמָ֣ה", { qametsQatan: true }), { qametsQatan: false }); // ḥokmâ
```

**Note**: `qametsQatan` only converts a regular _qamets_ character; if a [_qamets qatan_ character](https://www.compart.com/en/unicode/U+05C7) is used, it will always be a _qamets qatan_.

##### 2) Characters

Most `Schema` properties are for defining single Hebrew characters:

```javascript
heb.transliterate("אָ", { ALEF: "@", QAMETS: "A" });
// @A
```

##### 3) Orthographic Features

Some properties are for defining common Hebrew orthographies for:

###### _BeGaDKePhaT_

There are properties for the digraphs of _BeGaDKePhaT_ letters:

- `BET_DAGESH`
- `GIMEL_DAGESH`
- `DALET_DAGESH`
- `KAF_DAGESH`
- `PE_DAGESH`
- `TAV_DAGESH`

Each one is the consonant character followed by the _dagesh_ character (U+05BC).

These are helpful for distinguishing between spirantized forms.

```javascript
heb.transliterate("בְּבֵית", { BET: "b" });
// bǝbêt

heb.transliterate("בְּבֵית", { BET: "v", BET_DAGESH: "b" });
// bǝvêt
```

###### Matres Lectionis

The following properties are for _matres lectionis_:

- `HIRIQ_YOD`
- `TSERE_YOD`
- `SEGOL_YOD`
- `SHUREQ`
- `HOLAM_VAV`
- `QAMATS_HE`
- `SEGOL_HE`
- `TSERE_HE`

```javascript
heb.transliterate("פֶּה", { SEGOL_HE: "é" });
// pé
```

###### Others

There are other orthographic features:

- `MS_SUFX` — HEBREW LETTER QAMATS (U+05B8) and YOD (U+05D9) and VAV (U+05D5) יו◌ָ
- `DIVINE_NAME` — the full form of the divine name - יהוה
- `DIVINE_NAME_ELOHIM` — optionally, the form of the divine name pointed as ʾelōhîm (e.g. יֱהֹוִה)
- `SYLLABLE_SEPARATOR` — a syllable separator, usually an empty string
- `DAGESH_CHAZAQ` — if true, repeats the consonant with the _dagesh_, or can take a string

```javascript
heb.transliterate("שַׁבָּת", { DAGESH_CHAZAQ: true });
// šabbāt

heb.transliterate("שַׁבָּת", { DAGESH_CHAZAQ: false });
// šabāt

heb.transliterate("שַׁבָּת", { DAGESH_CHAZAQ: "\u0301" });
// šab́āt

heb.transliterate("הָאָֽרֶץ", { SYLLABLE_SEPARATOR: "-" });
// hā-ʾā-reṣ
```

##### 4) Others

###### Additional Features

The `ADDITIONAL_FEATURES` property is for defining non-typical Hebrew orthography, example:

```javascript
heb.transliterate("הַזֹּאת", {
  ADDITIONAL_FEATURES: [
    {
      FEATURE: "cluster",
      HEBREW: "זּ",
      TRANSLITERATION: "tz"
    }
  ]
});
// hatzōʾt
```

- The orthography `זּ` is most often a doubling of the `ZAYIN` (i.e. `'z'` with no _dagesh_, and `'zz'` with a _dagesh chazaq_)
- In the Romaniote reading tradition, however, the `ZAYIN` is usually transliterated with `'z'` (really `'ζ'`),
- but a `ZAYIN` followed by a _dagesh_ is transliterated as `'tz'` (really `'τζ'`)

Each additional feature consists of 4 properties:

1. `FEATURE` — has three options:
  - `"cluster"` — a `cluster` is any combination of a single character and optionally a *dagesh* and vowel.
  - `"syllable"` — a `syllable` is any combination of a multiple characters and a single vowel and optionally a *dagesh*
  - `"word"` — covers everything else
2. `HEBREW` — the Hebrew text to be transliterated
3. `TRANSLITERATION` — the text used to transliterate the Hebrew text, or a callback function
4. `PASS_THROUGH` — if `true` passes the characters of the result of the `TRANSLITERATION` callback to the be mapped to the schema. If `TRANSLITERATION` is a string, this does nothing. Default `true`.

**Using a callback**

A callback can be used `TRANSLITERATION` instead of just a string.

```js
const heb = require("hebrew-transliteration");
const rules = require("hebrew-transliteration/dist/rules");

// use a callback to transliterate a vocal sheva with the same character as the next syllable
heb.transliterate("בְּרֵאשִׁ֖ית וַיַּבְדֵּל", {
  ADDITIONAL_FEATURES: [
    {
      // matches any sheva in a syllable that is NOT preceded by a vowel character
      HEBREW: "(?<![\u{05B1}-\u{05BB}\u{05C7}].*)\u{05B0}",
      FEATURE: "syllable",
      TRANSLITERATION: function (syllable, _hebrew, schema) {
        const next = syllable.next;
        // ensure type safety
        const nextVowel = next.vowelName === "SHEVA" ? "VOCAL_SHEVA" : next.vowelName;

        if (next && nextVowel) {
          const vowel = schema[nextVowel] || "";
          return syllable.text.replace(new RegExp("\u{05B0}", "u"), vowel);
        }

        return syllable.text;
      }
    }
  ]
});

// bērēʾšît wayyabdēl
```


:warning: this is an experimental `ADDTIONAL_FEATURES`; results may not always meet expectations.

###### Stress Marker

The `STRESS_MARKER` property is an optional property to indicate stress in transliteration.

It's properties are:
- location
- mark
- exclude (optional)

**Example**
```javascript
heb.transliterate("מֶ֣לֶךְ", { STRESS_MARKER: { location: "after-vowel", mark: "\u0301" } });
// mélek
```

_mark_

The string used to mark stress (e.g. [a combining acute accent (U+0301)](https://www.compart.com/en/unicode/U+0301) )

_location_

The `location` has four options:

- `"before-syllable"`
- `"after-syllable"`
- `"before-vowel"`
- `"after-vowel"`

A combining mark (e.g. `"\u0301"`) placed `"after-vowel"` will print on top of the vowel, and placed after a digraph will print on the second vowel.

```javascript
heb.transliterate("בֵּ֣ית", {
  TSERE_YOD: "ei",
  STRESS_MARKER: { location: "after-vowel", mark: "\u0301" }
});
// beít
```

_exclude_

An optional property determining whether to exclude the mark on certain syllables.

It has three options
- `undefined`/`"never"`
- `"single"`
- `"final"`

Examples:

```js
// undefined and "never" are the same
heb.transliterate("בֹּ֖קֶר י֥וֹם אֶחָֽד׃ ", {
  STRESS_MARKER: {
    location: "after-vowel",
    mark: "\u0301",
  }
});

// bṓqer yốm ʾeḥā́d

// exclude only single syllable words
heb.transliterate("בֹּ֖קֶר י֥וֹם אֶחָֽד׃ ", {
  STRESS_MARKER: {
    location: "after-vowel",
    mark: "\u0301",
    exclude: "single"
  }
});

// bṓqer yôm ʾeḥā́d

// exclude when accent is on the final syllable
// implicitly excludes single syllable words
heb.transliterate("בֹּ֖קֶר י֥וֹם אֶחָֽד׃ ", {
  STRESS_MARKER: {
    location: "after-vowel",
    mark: "\u0301",
    exclude: "single"
  }
});

// bṓqer yôm ʾeḥād
```

## Live

Use it live at [https://hebrewtransliteration.app](https://hebrewtransliteration.app)

## Contributing

See [contributing](./CONTRIBUTING.md)

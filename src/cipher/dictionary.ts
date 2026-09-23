import wordList from "./words.txt?raw";

/**
 * Two-letter entries in the source list are mostly abbreviations ("uk", "pc"),
 * which would let gibberish score well, so only real words are kept.
 */
const TWO_LETTER_WORDS = new Set(
  "am an as at be by do go he hi if in is it me my no of oh ok on or so to up us we".split(
    " ",
  ),
);

/** Stand-alone words; they count only when delimited by spaces or the ends. */
export const SINGLE_LETTER_WORDS = new Set(["a", "i"]);

export function buildDictionary(raw: string): Set<string> {
  const words = raw
    .split(/\r?\n/)
    .map((w) => w.trim().toLowerCase())
    .filter(
      (w) => /^[a-z]+$/.test(w) && (w.length >= 3 || TWO_LETTER_WORDS.has(w)),
    );
  return new Set(words);
}

export const DICTIONARY = buildDictionary(wordList);

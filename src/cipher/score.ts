import { SINGLE_LETTER_WORDS } from "./dictionary";

export interface Score {
  /** Share of letters covered by dictionary words, 0 to 1. */
  coverage: number;
  /** Words used by the best split; fewer is better on equal coverage. */
  words: number;
}

interface Best {
  covered: number;
  words: number;
}

const MAX_WORD_LENGTH = 20;

function better(a: Best, b: Best): boolean {
  return (
    a.covered > b.covered || (a.covered === b.covered && a.words < b.words)
  );
}

function isBoundary(message: string, index: number): boolean {
  return index < 0 || index >= message.length || message[index] === " ";
}

/**
 * Finds the split of the message into non-overlapping dictionary words that
 * covers the most letters, by dynamic programming over prefixes.
 */
export function scoreMessage(message: string, dictionary: Set<string>): Score {
  const n = message.length;
  const best: Best[] = Array.from({ length: n + 1 }, () => ({
    covered: -1,
    words: 0,
  }));
  best[0] = { covered: 0, words: 0 };
  const relax = (to: number, candidate: Best) => {
    if (better(candidate, best[to])) best[to] = candidate;
  };

  for (let i = 0; i < n; i++) {
    const from = best[i];
    relax(i + 1, from);
    if (message[i] === " ") continue;
    for (let j = i + 1; j <= Math.min(n, i + MAX_WORD_LENGTH); j++) {
      if (message[j - 1] === " ") break;
      const word = message.slice(i, j);
      const matches =
        word.length === 1
          ? SINGLE_LETTER_WORDS.has(word) &&
            isBoundary(message, i - 1) &&
            isBoundary(message, j)
          : dictionary.has(word);
      if (matches) {
        relax(j, {
          covered: from.covered + word.length,
          words: from.words + 1,
        });
      }
    }
  }

  const letters = message.replaceAll(" ", "").length;
  return {
    coverage: letters === 0 ? 0 : best[n].covered / letters,
    words: best[n].words,
  };
}

export function compareScores(a: Score, b: Score): number {
  return b.coverage - a.coverage || a.words - b.words;
}

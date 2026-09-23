import { decodeSymbols, MAX_SYMBOL } from "./alphabet";
import { DICTIONARY } from "./dictionary";
import { fromTextMatrix, KEY_MAX, type Key, type Matrix } from "./matrix";
import { compareScores, type Score, scoreMessage } from "./score";

export const TOP_CANDIDATES = 10;
/** Keys kept per candidate; the rest are only counted. */
export const KEYS_PER_CANDIDATE = 50;

export interface Candidate {
  message: string;
  t: Matrix<number>;
  score: Score;
  keys: Key[];
  keyCount: number;
}

export interface CrackResult {
  candidates: Candidate[];
}

/** Returns T = E⁻¹C when every entry is a whole number in 0..MAX_SYMBOL. */
function tryKey(
  a: number,
  b: number,
  c: number,
  d: number,
  top: number[],
  bottom: number[],
): Matrix<number> | null {
  const det = a * d - b * c;
  if (det === 0) return null;
  const k = top.length;
  for (let j = 0; j < k; j++) {
    const n1 = d * top[j] - b * bottom[j];
    if (n1 % det !== 0) return null;
    const t1 = n1 / det;
    if (t1 < 0 || t1 > MAX_SYMBOL) return null;
    const n2 = a * bottom[j] - c * top[j];
    if (n2 % det !== 0) return null;
    const t2 = n2 / det;
    if (t2 < 0 || t2 > MAX_SYMBOL) return null;
  }
  // Validated above; built only now so rejected keys allocate nothing.
  return [
    top.map((x, j) => (d * x - b * bottom[j]) / det),
    top.map((x, j) => (a * bottom[j] - c * x) / det),
  ];
}

/**
 * Tries every key E with entries in 0..KEY_MAX and det ≠ 0, keeps those that
 * decode C to a valid T, groups them by T and ranks the messages.
 * onProgress receives the fraction of keys tried so far.
 */
export function crack(
  cipher: Matrix<number>,
  onProgress: (done: number) => void = () => {},
  dictionary: Set<string> = DICTIONARY,
): CrackResult {
  const [top, bottom] = cipher;
  const groups = new Map<string, Candidate>();
  const size = KEY_MAX + 1;

  for (let a = 0; a < size; a++) {
    onProgress(a / size);
    for (let b = 0; b < size; b++) {
      for (let c = 0; c < size; c++) {
        for (let d = 0; d < size; d++) {
          const t = tryKey(a, b, c, d, top, bottom);
          if (!t) continue;
          const id = t.join(";");
          let group = groups.get(id);
          if (!group) {
            const message = decodeSymbols(fromTextMatrix(t));
            group = {
              message,
              t,
              score: scoreMessage(message, dictionary),
              keys: [],
              keyCount: 0,
            };
            groups.set(id, group);
          }
          group.keyCount++;
          if (group.keys.length < KEYS_PER_CANDIDATE) {
            group.keys.push([
              [a, b],
              [c, d],
            ]);
          }
        }
      }
    }
  }
  onProgress(1);

  const candidates = [...groups.values()]
    .sort((x, y) => compareScores(x.score, y.score))
    .slice(0, TOP_CANDIDATES);
  return { candidates };
}

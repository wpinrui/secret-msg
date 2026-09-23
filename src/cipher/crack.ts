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

/** Entries a, b, c, d of the key [[a, b], [c, d]], reused across the search. */
type KeyEntries = Int32Array;

/** Returns T = E⁻¹C when every entry is a whole number in 0..MAX_SYMBOL. */
function tryKey(
  key: KeyEntries,
  cipher: Matrix<number>,
): Matrix<number> | null {
  // Indexed reads: destructuring a typed array goes through its iterator,
  // which is measurably slower across 10⁸ calls.
  const a = key[0];
  const b = key[1];
  const c = key[2];
  const d = key[3];
  const top = cipher[0];
  const bottom = cipher[1];
  const det = a * d - b * c;
  if (det === 0) return null;
  for (let j = 0; j < top.length; j++) {
    const t1 = (d * top[j] - b * bottom[j]) / det;
    if (!Number.isInteger(t1) || t1 < 0 || t1 > MAX_SYMBOL) return null;
    const t2 = (a * bottom[j] - c * top[j]) / det;
    if (!Number.isInteger(t2) || t2 < 0 || t2 > MAX_SYMBOL) return null;
  }
  // Validated above; built only now so rejected keys allocate nothing.
  return [
    top.map((x, j) => (d * x - b * bottom[j]) / det),
    top.map((x, j) => (a * bottom[j] - c * x) / det),
  ];
}

/** Advances the key like an odometer; returns false after the last key. */
function nextKey(key: KeyEntries): boolean {
  for (let i = key.length - 1; i >= 0; i--) {
    if (++key[i] <= KEY_MAX) return true;
    key[i] = 0;
  }
  return false;
}

type Group = Omit<Candidate, "message" | "score">;

function record(
  groups: Map<string, Group>,
  t: Matrix<number>,
  key: KeyEntries,
) {
  const id = t.join(";");
  let group = groups.get(id);
  if (!group) {
    group = { t, keys: [], keyCount: 0 };
    groups.set(id, group);
  }
  group.keyCount++;
  if (group.keys.length < KEYS_PER_CANDIDATE) {
    group.keys.push([
      [key[0], key[1]],
      [key[2], key[3]],
    ]);
  }
}

/**
 * Tries every key E with entries in 0..KEY_MAX and det ≠ 0, keeps those that
 * decode C to a valid T, groups them by T and ranks the messages.
 * onProgress receives the fraction of keys tried, once per value of E's first entry.
 */
export function crack(
  cipher: Matrix<number>,
  onProgress: (done: number) => void = () => {},
  dictionary: Set<string> = DICTIONARY,
): CrackResult {
  const groups = new Map<string, Group>();
  const key: KeyEntries = new Int32Array(4);
  do {
    if (key[1] === 0 && key[2] === 0 && key[3] === 0) {
      onProgress(key[0] / (KEY_MAX + 1));
    }
    const t = tryKey(key, cipher);
    if (t) record(groups, t, key);
  } while (nextKey(key));
  onProgress(1);

  const candidates = [...groups.values()]
    .map((group) => {
      const message = decodeSymbols(fromTextMatrix(group.t));
      return { ...group, message, score: scoreMessage(message, dictionary) };
    })
    .sort((x, y) => compareScores(x.score, y.score))
    .slice(0, TOP_CANDIDATES);
  return { candidates };
}

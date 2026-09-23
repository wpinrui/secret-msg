import { add, type Fraction, fraction, mul, sub } from "./rational";

/** Row-major matrix. */
export type Matrix<T> = T[][];
export type Key = Matrix<number>;

export const KEY_MAX = 99;

/** Arranges symbols column by column into a 2 by k matrix, padding with 0. */
export function toTextMatrix(symbols: number[]): Matrix<number> {
  const padded = symbols.length % 2 === 0 ? symbols : [...symbols, 0];
  const top: number[] = [];
  const bottom: number[] = [];
  for (let i = 0; i < padded.length; i += 2) {
    top.push(padded[i]);
    bottom.push(padded[i + 1]);
  }
  return [top, bottom];
}

/** Reads a 2 by k matrix back out column by column. */
export function fromTextMatrix(t: Matrix<number>): number[] {
  return t[0].flatMap((top, j) => [top, t[1][j]]);
}

export function multiply(a: Matrix<number>, b: Matrix<number>): Matrix<number> {
  return a.map((row) =>
    b[0].map((_, j) => row.reduce((sum, x, k) => sum + x * b[k][j], 0)),
  );
}

export function multiplyExact(
  a: Matrix<Fraction>,
  b: Matrix<number>,
): Matrix<Fraction> {
  return a.map((row) =>
    b[0].map((_, j) =>
      row.reduce(
        (sum, x, k) => add(sum, mul(x, fraction(b[k][j]))),
        fraction(0),
      ),
    ),
  );
}

export function det2(m: Key): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

export function detExact(m: Matrix<Fraction>): Fraction {
  return sub(mul(m[0][0], m[1][1]), mul(m[0][1], m[1][0]));
}

/** Exact inverse of an invertible 2 by 2 integer matrix. */
export function inverse(m: Key): Matrix<Fraction> {
  const det = det2(m);
  if (det === 0) throw new RangeError("Singular matrix");
  return [
    [fraction(m[1][1], det), fraction(-m[0][1], det)],
    [fraction(-m[1][0], det), fraction(m[0][0], det)],
  ];
}

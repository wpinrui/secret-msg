/** An exact rational number, always normalised: den > 0 and gcd(num, den) = 1. */
export interface Fraction {
  num: number;
  den: number;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

export function fraction(num: number, den = 1): Fraction {
  if (den === 0) throw new RangeError("Zero denominator");
  if (num === 0) return { num: 0, den: 1 };
  const sign = den < 0 ? -1 : 1;
  const g = gcd(num, den);
  return { num: (sign * num) / g, den: Math.abs(den) / g };
}

export function add(a: Fraction, b: Fraction): Fraction {
  return fraction(a.num * b.den + b.num * a.den, a.den * b.den);
}

export function mul(a: Fraction, b: Fraction): Fraction {
  return fraction(a.num * b.num, a.den * b.den);
}

export function sub(a: Fraction, b: Fraction): Fraction {
  return add(a, fraction(-b.num, b.den));
}

export function isInteger(f: Fraction): boolean {
  return f.den === 1;
}

/** Parses "7", "-3" or "3/7"; returns null for anything else or a zero denominator. */
export function parseFraction(text: string): Fraction | null {
  const match = /^\s*(-?\d+)\s*(?:\/\s*(\d+)\s*)?$/.exec(text);
  if (!match) return null;
  const den = match[2] === undefined ? 1 : Number(match[2]);
  if (den === 0) return null;
  return fraction(Number(match[1]), den);
}

export function formatFraction(f: Fraction): string {
  return f.den === 1 ? String(f.num) : `${f.num}/${f.den}`;
}

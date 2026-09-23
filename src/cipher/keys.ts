import { KEY_MAX, type Key } from "./matrix";
import { gcd } from "./rational";

/** Returns [g, x, y] with a*x + b*y = g = gcd(a, b). */
function extendedGcd(a: number, b: number): [number, number, number] {
  if (b === 0) return [a, 1, 0];
  const [g, x, y] = extendedGcd(b, a % b);
  return [g, y, x - Math.floor(a / b) * y];
}

function randomInt(min: number, max: number, random: () => number): number {
  return min + Math.floor(random() * (max - min + 1));
}

/**
 * A random key with every entry in 1..KEY_MAX and det = ±1, so its inverse is
 * an integer matrix. Picks a coprime top row (a, b), then solves a*d - b*c = 1
 * over the family d = x + t*b, c = -y + t*a, keeping only in-range members.
 */
export function randomUnimodularKey(random: () => number = Math.random): Key {
  for (;;) {
    const a = randomInt(1, KEY_MAX, random);
    const b = randomInt(1, KEY_MAX, random);
    if (gcd(a, b) !== 1) continue;
    const [, x, y] = extendedGcd(a, b);
    const tMin = Math.max(Math.ceil((1 - x) / b), Math.ceil((1 + y) / a));
    const tMax = Math.min(
      Math.floor((KEY_MAX - x) / b),
      Math.floor((KEY_MAX + y) / a),
    );
    if (tMin > tMax) continue;
    const t = randomInt(tMin, tMax, random);
    const key: Key = [
      [a, b],
      [-y + t * a, x + t * b],
    ];
    return random() < 0.5 ? key : [key[1], key[0]];
  }
}

export const MAX_MESSAGE_LENGTH = 20;
export const MAX_SYMBOL = 26;

const A_CODE = "a".charCodeAt(0);

/** Lowercases, drops anything but letters and spaces, and caps the length. */
export function sanitizeMessage(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .slice(0, MAX_MESSAGE_LENGTH);
}

/** space = 0, a = 1, ..., z = 26. */
export function encodeMessage(message: string): number[] {
  return [...message].map((ch) =>
    ch === " " ? 0 : ch.charCodeAt(0) - A_CODE + 1,
  );
}

export function decodeSymbols(symbols: number[]): string {
  return symbols
    .map((n) => (n === 0 ? " " : String.fromCharCode(A_CODE + n - 1)))
    .join("")
    .trimEnd();
}

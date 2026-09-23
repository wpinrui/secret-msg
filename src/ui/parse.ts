import { KEY_MAX, type Key, type Matrix } from "../cipher/matrix";
import { type Fraction, parseFraction } from "../cipher/rational";

export interface Parsed<T> {
  /** The matrix, or null while any cell is empty or invalid. */
  value: Matrix<T> | null;
  /** Cells to flag: invalid text, or empty when the matrix is needed. */
  invalid: Matrix<boolean>;
}

function parseCells<T>(
  cells: Matrix<string>,
  parse: (text: string) => T | null,
  flagEmpty: boolean,
): Parsed<T> {
  const parsed = cells.map((row) =>
    row.map((text) => (text.trim() === "" ? null : parse(text))),
  );
  const invalid = cells.map((row, r) =>
    row.map((text, c) =>
      text.trim() === "" ? flagEmpty : parsed[r][c] === null,
    ),
  );
  const complete = parsed.every((row) => row.every((x) => x !== null));
  return { value: complete ? (parsed as Matrix<T>) : null, invalid };
}

function parseKeyEntry(text: string): number | null {
  if (!/^\s*\d+\s*$/.test(text)) return null;
  const n = Number(text);
  return n <= KEY_MAX ? n : null;
}

function parseInteger(text: string): number | null {
  return /^\s*-?\d+\s*$/.test(text) ? Number(text) : null;
}

/** E: whole numbers 0..KEY_MAX. */
export function parseKey(cells: Matrix<string>): Parsed<number> & {
  value: Key | null;
} {
  return parseCells(cells, parseKeyEntry, true);
}

export function parseCipher(cells: Matrix<string>): Parsed<number> {
  return parseCells(cells, parseInteger, false);
}

export function parseDecryptionKey(
  cells: Matrix<string>,
  flagEmpty: boolean,
): Parsed<Fraction> {
  return parseCells(cells, parseFraction, flagEmpty);
}

export function isBlank(cells: Matrix<string>): boolean {
  return cells.every((row) => row.every((text) => text.trim() === ""));
}

export function toCells(m: Matrix<number>): Matrix<string> {
  return m.map((row) => row.map(String));
}

export function blankCells(rows: number, columns: number): Matrix<string> {
  return Array.from({ length: rows }, () => Array(columns).fill(""));
}

import type { Matrix } from "../cipher/matrix";

const SEPARATOR = /[\s,;]+/;

export interface PasteTarget {
  row: number;
  column: number;
  /** Set when the matrix may change its column count to fit the paste. */
  maxColumns?: number;
}

/**
 * Spreads a pasted list of values across the matrix, row by row. Pasted into
 * the first cell of a resizable matrix, the list replaces it, split evenly
 * across the rows; anywhere else it fills onward from the target cell.
 * Returns null when the text holds a single value, so the native paste runs.
 */
export function pasteIntoMatrix(
  values: Matrix<string>,
  text: string,
  target: PasteTarget,
): Matrix<string> | null {
  const tokens = text.trim().split(SEPARATOR).filter(Boolean);
  if (tokens.length <= 1) return null;
  const rows = values.length;

  const { maxColumns } = target;
  if (maxColumns !== undefined && target.row === 0 && target.column === 0) {
    const columns = Math.min(Math.ceil(tokens.length / rows), maxColumns);
    return Array.from({ length: rows }, (_, r) =>
      Array.from({ length: columns }, (_, c) => tokens[r * columns + c] ?? ""),
    );
  }

  const columns = values[0].length;
  const start = target.row * columns + target.column;
  const next = values.map((row) => [...row]);
  tokens.slice(0, rows * columns - start).forEach((value, k) => {
    const index = start + k;
    next[Math.floor(index / columns)][index % columns] = value;
  });
  return next;
}

// @vitest-environment node
import { describe, expect, it } from "vitest";
import { pasteIntoMatrix } from "./paste";

const blank = (columns: number) => [
  Array(columns).fill(""),
  Array(columns).fill(""),
];
const origin = { row: 0, column: 0, maxColumns: 10 };

describe("pasteIntoMatrix", () => {
  it("leaves a single value to the native paste", () => {
    expect(pasteIntoMatrix(blank(2), " 42\n", origin)).toBeNull();
  });

  it("splits a flat list evenly across the rows and fits the columns", () => {
    expect(
      pasteIntoMatrix(blank(3), "1227\n207\n1395\n1498\n253\n1703\n", origin),
    ).toEqual([
      ["1227", "207", "1395"],
      ["1498", "253", "1703"],
    ]);
    expect(pasteIntoMatrix(blank(8), "1, 2, 3", origin)).toEqual([
      ["1", "2"],
      ["3", ""],
    ]);
  });

  it("reads two pasted lines as the rows", () => {
    expect(pasteIntoMatrix(blank(1), "1\t2\t3\n4\t5\t6", origin)).toEqual([
      ["1", "2", "3"],
      ["4", "5", "6"],
    ]);
  });

  it("fills a fixed-size matrix row by row, dropping overflow", () => {
    expect(
      pasteIntoMatrix(blank(2), "1 2 3 4 5", { row: 0, column: 0 }),
    ).toEqual([
      ["1", "2"],
      ["3", "4"],
    ]);
  });

  it("fills onward from a later cell without clearing earlier ones", () => {
    const values = [
      ["9", "", ""],
      ["", "", ""],
    ];
    expect(
      pasteIntoMatrix(values, "1 2 3", { row: 0, column: 2, maxColumns: 10 }),
    ).toEqual([
      ["9", "", "1"],
      ["2", "3", ""],
    ]);
  });

  it("caps the columns at the maximum", () => {
    const text = Array.from({ length: 30 }, (_, i) => i).join(" ");
    const next = pasteIntoMatrix(blank(3), text, origin);
    expect(next?.[0]).toHaveLength(10);
    expect(next?.[1][9]).toBe("19");
  });
});

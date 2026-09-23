// @vitest-environment node
import { describe, expect, it } from "vitest";
import { decodeSymbols, encodeMessage, sanitizeMessage } from "./alphabet";
import { crack } from "./crack";
import { buildDictionary, DICTIONARY } from "./dictionary";
import { randomUnimodularKey } from "./keys";
import {
  det2,
  fromTextMatrix,
  inverse,
  KEY_MAX,
  multiply,
  multiplyExact,
  toTextMatrix,
} from "./matrix";
import { fraction, parseFraction } from "./rational";
import { scoreMessage } from "./score";

describe("alphabet", () => {
  it("folds case, drops other characters and caps the length", () => {
    expect(sanitizeMessage("Hi, There!")).toBe("hi there");
    expect(sanitizeMessage("a".repeat(30))).toHaveLength(20);
  });

  it("maps space to 0 and a..z to 1..26, and back", () => {
    expect(encodeMessage("az b")).toEqual([1, 26, 0, 2]);
    expect(decodeSymbols([1, 26, 0, 2, 0])).toBe("az b");
  });
});

describe("matrix", () => {
  it("fills T column by column and pads an odd length", () => {
    expect(toTextMatrix([8, 9, 0])).toEqual([
      [8, 0],
      [9, 0],
    ]);
    expect(
      fromTextMatrix([
        [8, 0],
        [9, 0],
      ]),
    ).toEqual([8, 9, 0, 0]);
  });

  it("inverts exactly, so D(ET) = T", () => {
    const e = [
      [3, 5],
      [7, 2],
    ];
    const t = toTextMatrix(encodeMessage("hello"));
    const back = multiplyExact(inverse(e), multiply(e, t));
    expect(back).toEqual(t.map((row) => row.map((x) => fraction(x))));
  });
});

describe("rational", () => {
  it("parses integers and fractions and normalises", () => {
    expect(parseFraction("-4/6")).toEqual({ num: -2, den: 3 });
    expect(parseFraction("7")).toEqual({ num: 7, den: 1 });
    expect(parseFraction("1/0")).toBeNull();
    expect(parseFraction("x")).toBeNull();
    expect(fraction(0, -5)).toEqual({ num: 0, den: 1 });
  });
});

describe("randomUnimodularKey", () => {
  it("returns in-range keys with det ±1", () => {
    for (let i = 0; i < 200; i++) {
      const key = randomUnimodularKey();
      expect(Math.abs(det2(key))).toBe(1);
      for (const x of key.flat()) {
        expect(x).toBeGreaterThanOrEqual(1);
        expect(x).toBeLessThanOrEqual(KEY_MAX);
      }
    }
  });
});

describe("scoreMessage", () => {
  const dict = buildDictionary("hello\nworld\nuk\ncat");

  it("rewards full coverage and fewer words", () => {
    expect(scoreMessage("hello world", dict).coverage).toBe(1);
    expect(scoreMessage("xqzv", dict).coverage).toBe(0);
  });

  it("drops two-letter abbreviations and counts a or i only standalone", () => {
    expect(scoreMessage("uk", dict).coverage).toBe(0);
    expect(scoreMessage("a cat", dict).coverage).toBe(1);
    expect(scoreMessage("acat", dict).coverage).toBe(0.75);
  });

  it("ranks real English above gibberish with the bundled list", () => {
    expect(scoreMessage("meet at noon", DICTIONARY).coverage).toBe(1);
    expect(scoreMessage("qxv zkw", DICTIONARY).coverage).toBe(0);
  });
});

describe("crack", () => {
  it("recovers the message as the top candidate", () => {
    const e = [
      [17, 4],
      [9, 31],
    ];
    const t = toTextMatrix(encodeMessage("attack at dawn"));
    const { candidates } = crack(multiply(e, t));
    expect(candidates[0].message).toBe("attack at dawn");
    expect(candidates[0].keys).toContainEqual(e);
  }, 60_000);
});

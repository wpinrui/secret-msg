import type { KeyboardEvent, ReactNode } from "react";
import { MAX_SYMBOL, symbolToChar } from "../cipher/alphabet";
import type { Matrix } from "../cipher/matrix";
import type { Fraction } from "../cipher/rational";
import { pasteIntoMatrix } from "./paste";

function Brackets({
  columns,
  label,
  children,
}: {
  columns: number;
  label: string;
  children: ReactNode;
}) {
  return (
    <fieldset
      className="matrix"
      aria-label={label}
      style={{ gridTemplateColumns: `repeat(${columns}, auto)` }}
    >
      {children}
    </fieldset>
  );
}

/** Row-major so Tab walks across each row, then down. */
function cells<T>(values: Matrix<T>) {
  return values.flatMap((row, r) => row.map((value, c) => ({ value, r, c })));
}

/** Up and Down move to the same column in the neighbouring row. */
function moveVertically(
  event: KeyboardEvent<HTMLInputElement>,
  columns: number,
) {
  const step = { ArrowUp: -1, ArrowDown: 1 }[event.key];
  if (step === undefined) return;
  const inputs = event.currentTarget
    .closest("fieldset")
    ?.querySelectorAll("input");
  const index = [...(inputs ?? [])].indexOf(event.currentTarget);
  const target = inputs?.[index + step * columns];
  if (!target) return;
  event.preventDefault();
  target.focus();
}

export function MatrixInput({
  label,
  values,
  onChange,
  invalid,
  maxColumns,
  inputMode = "numeric",
}: {
  label: string;
  values: Matrix<string>;
  onChange: (values: Matrix<string>) => void;
  invalid?: Matrix<boolean>;
  /** Lets a paste grow or shrink the matrix up to this many columns. */
  maxColumns?: number;
  /** "text" where the on-screen keyboard must offer "/" and "-". */
  inputMode?: "numeric" | "text";
}) {
  const update = (r: number, c: number, text: string) =>
    onChange(
      values.map((row, i) =>
        i === r ? row.map((cell, j) => (j === c ? text : cell)) : row,
      ),
    );
  const paste = (r: number, c: number, text: string) =>
    pasteIntoMatrix(values, text, { row: r, column: c, maxColumns });
  return (
    <Brackets columns={values[0].length} label={label}>
      {cells(values).map(({ value, r, c }) => (
        <input
          key={`${r}-${c}`}
          className="matrix-cell"
          aria-label={`${label} row ${r + 1} column ${c + 1}`}
          aria-invalid={invalid?.[r][c] || undefined}
          inputMode={inputMode}
          autoComplete="off"
          value={value}
          onFocus={(event) => event.currentTarget.select()}
          onKeyDown={(event) => moveVertically(event, values[0].length)}
          onChange={(event) => update(r, c, event.target.value)}
          onPaste={(event) => {
            const next = paste(r, c, event.clipboardData.getData("text"));
            if (!next) return;
            event.preventDefault();
            onChange(next);
          }}
        />
      ))}
    </Brackets>
  );
}

function FractionView({ value }: { value: Fraction }) {
  if (value.den === 1) return <>{value.num}</>;
  return (
    <span className="fraction">
      {value.num < 0 && <span>−</span>}
      <span className="fraction-stack">
        <span>{Math.abs(value.num)}</span>
        <span>{value.den}</span>
      </span>
    </span>
  );
}

/** The letter a T entry encodes, or nothing when the entry is not a symbol. */
function Letter({ value }: { value: number | Fraction }) {
  const n =
    typeof value === "number" ? value : value.den === 1 ? value.num : -1;
  if (!Number.isInteger(n) || n < 0 || n > MAX_SYMBOL) return null;
  return (
    <span className="matrix-letter" aria-hidden="true">
      {n === 0 ? "␣" : symbolToChar(n)}
    </span>
  );
}

export function MatrixView({
  label,
  values,
  flagged,
  letters = false,
}: {
  label: string;
  values: Matrix<number | Fraction>;
  flagged?: Matrix<boolean>;
  /** Shows the letter each entry encodes; for T. */
  letters?: boolean;
}) {
  return (
    <Brackets columns={values[0].length} label={label}>
      {cells(values).map(({ value, r, c }) => (
        <span
          key={`${r}-${c}`}
          className="matrix-cell"
          data-flagged={flagged?.[r][c] || undefined}
        >
          {typeof value === "number" ? value : <FractionView value={value} />}
          {letters && <Letter value={value} />}
        </span>
      ))}
    </Brackets>
  );
}

/** An italic math symbol, optionally followed by "=". */
export function MathSymbol({
  name,
  equals = true,
}: {
  name: ReactNode;
  equals?: boolean;
}) {
  return (
    <span className="symbol">
      <var>{name}</var>
      {equals && " ="}
    </span>
  );
}

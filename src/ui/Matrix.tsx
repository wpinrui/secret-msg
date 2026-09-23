import type { ReactNode } from "react";
import type { Matrix } from "../cipher/matrix";
import type { Fraction } from "../cipher/rational";

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

export function MatrixInput({
  label,
  values,
  onChange,
  invalid,
}: {
  label: string;
  values: Matrix<string>;
  onChange: (values: Matrix<string>) => void;
  invalid?: Matrix<boolean>;
}) {
  const update = (r: number, c: number, text: string) =>
    onChange(
      values.map((row, i) =>
        i === r ? row.map((cell, j) => (j === c ? text : cell)) : row,
      ),
    );
  return (
    <Brackets columns={values[0].length} label={label}>
      {cells(values).map(({ value, r, c }) => (
        <input
          key={`${r}-${c}`}
          className="matrix-cell"
          aria-label={`${label} row ${r + 1} column ${c + 1}`}
          aria-invalid={invalid?.[r][c] || undefined}
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(event) => update(r, c, event.target.value)}
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

export function MatrixView({
  label,
  values,
  flagged,
}: {
  label: string;
  values: Matrix<number | Fraction>;
  flagged?: Matrix<boolean>;
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

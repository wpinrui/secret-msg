import { useState } from "react";
import {
  decodeSymbols,
  MAX_MESSAGE_LENGTH,
  MAX_SYMBOL,
} from "../cipher/alphabet";
import {
  detExact,
  fromTextMatrix,
  type Matrix,
  multiplyExact,
} from "../cipher/matrix";
import { type Fraction, isInteger } from "../cipher/rational";
import { ClearButton } from "./ClearButton";
import { CrackResults } from "./CrackResults";
import { MathSymbol, MatrixInput, MatrixView } from "./Matrix";
import { blankCells, isBlank, parseCipher, parseDecryptionKey } from "./parse";
import { useCrack } from "./useCrack";

const MAX_COLUMNS = MAX_MESSAGE_LENGTH / 2;
const DEFAULT_COLUMNS = 3;

function resize(cells: Matrix<string>, columns: number): Matrix<string> {
  return cells.map((row) =>
    Array.from({ length: columns }, (_, j) => row[j] ?? ""),
  );
}

function CipherEditor({
  cells,
  onChange,
  invalid,
}: {
  cells: Matrix<string>;
  onChange: (cells: Matrix<string>) => void;
  invalid: Matrix<boolean>;
}) {
  const columns = cells[0].length;
  return (
    <div className="equation">
      <MathSymbol name="C" />
      <MatrixInput
        label="C"
        values={cells}
        onChange={onChange}
        invalid={invalid}
        maxColumns={MAX_COLUMNS}
      />
      <button
        type="button"
        className="icon-button"
        aria-label="Remove column"
        title="Remove column"
        disabled={columns <= 1}
        onClick={() => onChange(resize(cells, columns - 1))}
      >
        −
      </button>
      <button
        type="button"
        className="icon-button"
        aria-label="Add column"
        title="Add column"
        disabled={columns >= MAX_COLUMNS}
        onClick={() => onChange(resize(cells, columns + 1))}
      >
        +
      </button>
      <ClearButton
        label="Clear C"
        disabled={isBlank(cells)}
        onClear={() => onChange(blankCells(2, DEFAULT_COLUMNS))}
      />
    </div>
  );
}

function CrackPanel({
  cipher,
  crack,
}: {
  cipher: Matrix<number> | null;
  crack: ReturnType<typeof useCrack>;
}) {
  const { state } = crack;
  return (
    <>
      <div className="equation">
        {state.status === "running" ? (
          <>
            <progress value={state.done} aria-label="Crack progress" />
            <button type="button" onClick={crack.cancel}>
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={!cipher}
            onClick={() => cipher && crack.start(cipher)}
          >
            Crack
          </button>
        )}
      </div>
      {state.status === "done" && <CrackResults result={state.result} />}
    </>
  );
}

export function DecryptTab({
  initialCipher,
}: {
  initialCipher: Matrix<string> | null;
}) {
  const [cipherCells, setCipherCellsState] = useState(
    () => initialCipher ?? blankCells(2, DEFAULT_COLUMNS),
  );
  const [keyCells, setKeyCells] = useState(() => blankCells(2, 2));
  const crack = useCrack();

  const setCipherCells = (cells: Matrix<string>) => {
    crack.cancel();
    setCipherCellsState(cells);
  };

  const cipher = parseCipher(cipherCells);
  const cracking = isBlank(keyCells);
  const key = parseDecryptionKey(keyCells, !cracking);

  return (
    <div className="stage">
      <CipherEditor
        cells={cipherCells}
        onChange={setCipherCells}
        invalid={cipher.invalid}
      />

      <div className="equation">
        <MathSymbol name="D" />
        <MatrixInput
          label="D"
          inputMode="text"
          values={keyCells}
          onChange={setKeyCells}
          invalid={key.invalid}
        />
        <ClearButton
          label="Clear D"
          disabled={cracking}
          onClear={() => setKeyCells(blankCells(2, 2))}
        />
      </div>

      {cipher.value && key.value && (
        <Decryption cipher={cipher.value} keyMatrix={key.value} />
      )}

      {cracking && <CrackPanel cipher={cipher.value} crack={crack} />}
    </div>
  );
}

function Decryption({
  cipher,
  keyMatrix,
}: {
  cipher: Matrix<number>;
  keyMatrix: Matrix<Fraction>;
}) {
  if (detExact(keyMatrix).num === 0) {
    return <p className="error">det D = 0</p>;
  }
  const t = multiplyExact(keyMatrix, cipher);
  const flagged = t.map((row) =>
    row.map((x) => !isInteger(x) || x.num < 0 || x.num > MAX_SYMBOL),
  );
  const valid = flagged.every((row) => row.every((bad) => !bad));
  return (
    <>
      <div className="equation">
        <MathSymbol name="T" />
        <MathSymbol name="DC" />
        <MatrixView label="T" values={t} flagged={flagged} letters />
      </div>
      {valid ? (
        <div className="equation">
          <MathSymbol name="M" />
          <span className="message-text">
            “
            {decodeSymbols(
              fromTextMatrix(t.map((row) => row.map((x) => x.num))),
            )}
            ”
          </span>
        </div>
      ) : (
        <p className="error">T must be whole numbers from 0 to {MAX_SYMBOL}</p>
      )}
    </>
  );
}

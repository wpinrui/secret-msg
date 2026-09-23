import { useState } from "react";
import {
  encodeMessage,
  MAX_MESSAGE_LENGTH,
  sanitizeMessage,
} from "../cipher/alphabet";
import { randomUnimodularKey } from "../cipher/keys";
import {
  det2,
  inverse,
  type Matrix,
  multiply,
  toTextMatrix,
} from "../cipher/matrix";
import { MathSymbol, MatrixInput, MatrixView } from "./Matrix";
import { parseKey, toCells } from "./parse";

function KeyEditor({
  cells,
  onChange,
  invalid,
  singular,
}: {
  cells: Matrix<string>;
  onChange: (cells: Matrix<string>) => void;
  invalid: Matrix<boolean>;
  singular: boolean;
}) {
  return (
    <div className="equation">
      <MathSymbol name="E" />
      <MatrixInput
        label="E"
        values={cells}
        onChange={onChange}
        invalid={invalid}
      />
      <button
        type="button"
        className="icon-button"
        aria-label="Random key"
        title="Random key"
        onClick={() => onChange(toCells(randomUnimodularKey()))}
      >
        ⟳
      </button>
      {singular && <span className="error">det E = 0</span>}
    </div>
  );
}

export function EncryptTab({
  onDecrypt,
}: {
  onDecrypt: (cipher: Matrix<number>) => void;
}) {
  const [message, setMessage] = useState("");
  const [keyCells, setKeyCells] = useState(() =>
    toCells(randomUnimodularKey()),
  );

  const key = parseKey(keyCells);
  const singular = key.value !== null && det2(key.value) === 0;
  const e = singular ? null : key.value;
  const t = message === "" ? null : toTextMatrix(encodeMessage(message));
  const c = e && t ? multiply(e, t) : null;

  return (
    <div className="stage">
      <div className="equation">
        <MathSymbol name="M" />
        <input
          className="message"
          aria-label="Message"
          autoComplete="off"
          spellCheck={false}
          maxLength={MAX_MESSAGE_LENGTH}
          value={message}
          onChange={(event) => setMessage(sanitizeMessage(event.target.value))}
        />
      </div>

      {t && (
        <div className="equation">
          <MathSymbol name="T" />
          <MatrixView label="T" values={t} />
        </div>
      )}

      <KeyEditor
        cells={keyCells}
        onChange={setKeyCells}
        invalid={key.invalid}
        singular={singular}
      />

      {e && (
        <div className="equation">
          <MathSymbol name="D" />
          <MathSymbol
            name={
              <>
                E<sup>−1</sup>
              </>
            }
          />
          <MatrixView label="D" values={inverse(e)} />
        </div>
      )}

      {c && (
        <div className="equation">
          <MathSymbol name="C" />
          <MathSymbol name="ET" />
          <MatrixView label="C" values={c} />
          <button type="button" onClick={() => onDecrypt(c)}>
            Decrypt →
          </button>
        </div>
      )}
    </div>
  );
}

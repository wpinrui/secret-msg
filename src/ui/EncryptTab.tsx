import { useEffect, useRef, useState } from "react";
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
import { ClearButton } from "./ClearButton";
import { CopyButton } from "./CopyButton";
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

  const messageInput = useRef<HTMLInputElement>(null);
  useEffect(() => messageInput.current?.focus(), []);

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
          ref={messageInput}
          className="message"
          aria-label="Message"
          autoComplete="off"
          spellCheck={false}
          maxLength={MAX_MESSAGE_LENGTH}
          value={message}
          onChange={(event) => setMessage(sanitizeMessage(event.target.value))}
        />
        <ClearButton
          label="Clear message"
          disabled={message === ""}
          onClear={() => {
            setMessage("");
            messageInput.current?.focus();
          }}
        />
      </div>

      {t && (
        <div className="equation">
          <MathSymbol name="T" />
          <MatrixView label="T" values={t} letters />
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
          {/* Rows on lines, tab-separated: the format a paste into C reads. */}
          <CopyButton
            label="Copy C"
            text={c.map((row) => row.join("\t")).join("\n")}
          />
          <button type="button" onClick={() => onDecrypt(c)}>
            Decrypt →
          </button>
        </div>
      )}
    </div>
  );
}

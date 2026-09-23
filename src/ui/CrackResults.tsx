import type { Candidate, CrackResult } from "../cipher/crack";
import { inverse, type Key } from "../cipher/matrix";
import { MathSymbol, MatrixView } from "./Matrix";

function KeyPair({ keyMatrix }: { keyMatrix: Key }) {
  return (
    <div className="equation">
      <MathSymbol name="E" />
      <MatrixView label="E" values={keyMatrix} />
      <MathSymbol name="D" />
      <MatrixView label="D" values={inverse(keyMatrix)} />
    </div>
  );
}

function CandidateRow({ candidate }: { candidate: Candidate }) {
  const [first, ...rest] = candidate.keys;
  const unlisted = candidate.keyCount - candidate.keys.length;
  return (
    <li className="candidate">
      <div className="equation">
        <MathSymbol name="M" />
        <span className="message-text">“{candidate.message}”</span>
        <span className="caption">
          {Math.round(candidate.score.coverage * 100)}%
        </span>
      </div>
      <div className="equation">
        <MathSymbol name="T" />
        <MatrixView label="T" values={candidate.t} />
      </div>
      <KeyPair keyMatrix={first} />
      {candidate.keyCount > 1 && (
        <details>
          <summary>+{candidate.keyCount - 1}</summary>
          {rest.map((k) => (
            <KeyPair key={k.flat().join(",")} keyMatrix={k} />
          ))}
          {unlisted > 0 && <p className="caption">+{unlisted}</p>}
        </details>
      )}
    </li>
  );
}

export function CrackResults({ result }: { result: CrackResult }) {
  if (result.candidates.length === 0) {
    return <p className="error">No key fits</p>;
  }
  return (
    <ol className="candidates">
      {result.candidates.map((candidate) => (
        <CandidateRow key={candidate.t.join(";")} candidate={candidate} />
      ))}
    </ol>
  );
}

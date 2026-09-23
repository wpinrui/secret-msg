import { useCallback, useEffect, useRef, useState } from "react";
import type { CrackResult } from "../cipher/crack";
import type { CrackMessage } from "../cipher/crack.worker";
import type { Matrix } from "../cipher/matrix";

export type CrackState =
  | { status: "idle" }
  | { status: "running"; done: number }
  | { status: "done"; result: CrackResult };

/** Runs the brute-force crack in a Web Worker so the page stays responsive. */
export function useCrack() {
  const [state, setState] = useState<CrackState>({ status: "idle" });
  const worker = useRef<Worker | null>(null);

  const stop = useCallback(() => {
    worker.current?.terminate();
    worker.current = null;
  }, []);

  const cancel = useCallback(() => {
    stop();
    setState({ status: "idle" });
  }, [stop]);

  const start = useCallback(
    (cipher: Matrix<number>) => {
      stop();
      const next = new Worker(
        new URL("../cipher/crack.worker.ts", import.meta.url),
        {
          type: "module",
        },
      );
      next.onmessage = (event: MessageEvent<CrackMessage>) => {
        const message = event.data;
        if (message.type === "progress") {
          setState({ status: "running", done: message.done });
        } else {
          stop();
          setState({ status: "done", result: message.result });
        }
      };
      worker.current = next;
      setState({ status: "running", done: 0 });
      next.postMessage(cipher);
    },
    [stop],
  );

  useEffect(() => stop, [stop]);

  return { state, start, cancel };
}

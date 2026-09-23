import { crack } from "./crack";
import type { Matrix } from "./matrix";

export type CrackMessage =
  | { type: "progress"; done: number }
  | { type: "done"; result: ReturnType<typeof crack> };

// The project compiles against the DOM lib, so the worker scope is typed here.
const scope = self as unknown as {
  onmessage: (event: MessageEvent<Matrix<number>>) => void;
  postMessage: (message: CrackMessage) => void;
};

let lastReported = -1;
scope.onmessage = (event) => {
  const result = crack(event.data, (done) => {
    const percent = Math.floor(done * 100);
    if (percent === lastReported) return;
    lastReported = percent;
    scope.postMessage({ type: "progress", done });
  });
  scope.postMessage({ type: "done", result });
};

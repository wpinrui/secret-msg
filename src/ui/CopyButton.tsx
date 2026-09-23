import { useEffect, useState } from "react";

const CONFIRM_MS = 1500;

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      className="icon-button"
      aria-label={label}
      title={label}
      onClick={() =>
        navigator.clipboard.writeText(text).then(() => setCopied(true))
      }
    >
      {copied ? "✓" : "⧉"}
    </button>
  );
}

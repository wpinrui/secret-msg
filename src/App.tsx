import { useState } from "react";
import type { Matrix } from "./cipher/matrix";
import { DecryptTab } from "./ui/DecryptTab";
import { EncryptTab } from "./ui/EncryptTab";
import { toCells } from "./ui/parse";

const TABS = ["Encrypt", "Decrypt"] as const;
type Tab = (typeof TABS)[number];

export function App() {
  const [tab, setTab] = useState<Tab>("Encrypt");
  const [handoff, setHandoff] = useState<{
    id: number;
    cipher: Matrix<string>;
  } | null>(null);

  const decrypt = (cipher: Matrix<number>) => {
    setHandoff((prev) => ({
      id: (prev?.id ?? 0) + 1,
      cipher: toCells(cipher),
    }));
    setTab("Decrypt");
  };

  return (
    <main>
      <div className="tabs" role="tablist">
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            id={`tab-${name}`}
            aria-selected={tab === name}
            aria-controls={`panel-${name}`}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <section
        role="tabpanel"
        id="panel-Encrypt"
        aria-labelledby="tab-Encrypt"
        hidden={tab !== "Encrypt"}
      >
        <EncryptTab onDecrypt={decrypt} />
      </section>
      <section
        role="tabpanel"
        id="panel-Decrypt"
        aria-labelledby="tab-Decrypt"
        hidden={tab !== "Decrypt"}
      >
        <DecryptTab
          key={handoff?.id ?? 0}
          initialCipher={handoff?.cipher ?? null}
        />
      </section>
    </main>
  );
}

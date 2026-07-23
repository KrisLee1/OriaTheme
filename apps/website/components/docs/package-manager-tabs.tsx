"use client";

import { useId, useRef, useState } from "react";
import { CodeBlock } from "@/components/docs/code-block";

const managers = ["pnpm", "npm", "yarn", "bun"] as const;
type PackageManager = (typeof managers)[number];
const managerAt = (index: number): PackageManager => managers[index] ?? "pnpm";

export function PackageManagerTabs({ commands, label }: { readonly commands: Readonly<Record<PackageManager, string>>; readonly label: string }) {
  const [active, setActive] = useState<PackageManager>("pnpm");
  const id = useId();
  const buttonRefs = useRef<Partial<Record<PackageManager, HTMLButtonElement | null>>>({});
  const select = (manager: PackageManager) => {
    setActive(manager);
    buttonRefs.current[manager]?.focus();
  };
  const move = (current: PackageManager, direction: number) => select(managerAt((managers.indexOf(current) + direction + managers.length) % managers.length));

  return <div className="docs-package-manager-tabs">
    <div role="tablist" aria-label={label} className="docs-package-manager-tablist">
      {managers.map(manager => <button
        key={manager}
        id={`${id}-${manager}-tab`}
        type="button"
        role="tab"
        aria-selected={active === manager}
        aria-controls={`${id}-${manager}-panel`}
        tabIndex={active === manager ? 0 : -1}
        onClick={() => setActive(manager)}
        ref={button => { buttonRefs.current[manager] = button; }}
        onKeyDown={event => {
          if (event.key === "ArrowRight") { event.preventDefault(); move(manager, 1); }
          if (event.key === "ArrowLeft") { event.preventDefault(); move(manager, -1); }
          if (event.key === "Home") { event.preventDefault(); select(managerAt(0)); }
          if (event.key === "End") { event.preventDefault(); select(managerAt(managers.length - 1)); }
        }}
      >{manager}</button>)}
    </div>
    {managers.map(manager => <div key={manager} id={`${id}-${manager}-panel`} role="tabpanel" aria-labelledby={`${id}-${manager}-tab`} hidden={active !== manager}>
      <CodeBlock language="bash">{commands[manager]}</CodeBlock>
    </div>)}
  </div>;
}

import { useRef } from "react";
import type { ReactElement } from "react";
import type { ContrastDiagnostic, ValidationIssue } from "@oriatheme/core";
import { useDetailsDismiss } from "../hooks/use-details-dismiss";

type ValidationHealth = "ready" | "warning" | "error";

const plural = (count: number, label: string): string => `${count} ${label}${count === 1 ? "" : "s"}`;

export function IssuesPopover({ issues, warnings }: { readonly issues: readonly ValidationIssue[]; readonly warnings: readonly ContrastDiagnostic[] }): ReactElement {
  const menu = useRef<HTMLDetailsElement>(null);
  useDetailsDismiss(menu);
  const health: ValidationHealth = issues.length > 0 ? "error" : warnings.length > 0 ? "warning" : "ready";
  const label = health === "error"
    ? `${plural(issues.length, "error")}${warnings.length > 0 ? ` · ${plural(warnings.length, "warning")}` : ""}`
    : health === "warning" ? plural(warnings.length, "warning") : "No issues";
  const accessibleLabel = health === "ready" ? "No theme issues" : `Theme validation: ${label}`;

  return <details ref={menu} data-oria-editor-menu data-oria-editor-health={health}>
    <summary aria-label={accessibleLabel} title={label}>
      <svg data-oria-editor-action-icon viewBox="0 0 24 24" aria-hidden="true">
        {health === "ready" ? <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>
          : health === "warning" ? <><path d="M12 3 2.8 20h18.4z" /><path d="M12 9v5m0 3h.01" /></>
          : <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v6m0 3h.01" /></>}
      </svg>
      <span data-oria-editor-action-label>{label}</span>
    </summary>
    <div data-oria-editor-issues>{health !== "ready" ? <>
      {issues.map((issue, index) => <p key={`e-${index}`}><strong>Error</strong> {issue.path}<br />{issue.message}</p>)}
      {warnings.map((warning, index) => <p key={`w-${index}`}><strong>Warning</strong> {warning.pair}<br />{warning.message}</p>)}
    </> : <p>The current draft passes validation.</p>}</div>
  </details>;
}

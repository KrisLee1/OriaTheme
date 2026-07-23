import { useRef } from "react";
import type { ReactElement } from "react";
import type { ContrastDiagnostic, ValidationIssue } from "@oriatheme/core";
import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";
import { useDetailsDismiss } from "../hooks/use-details-dismiss";
import { interpolate, useEditorCopy } from "@/components/editor-page/editor-i18n";

type ValidationHealth = "ready" | "warning" | "error";

export function IssuesPopover({ issues, warnings }: { readonly issues: readonly ValidationIssue[]; readonly warnings: readonly ContrastDiagnostic[] }): ReactElement {
  const copy = useEditorCopy().chrome;
  const menu = useRef<HTMLDetailsElement>(null);
  useDetailsDismiss(menu);
  const health: ValidationHealth = issues.length > 0 ? "error" : warnings.length > 0 ? "warning" : "ready";
  const count = (value: number, label: string): string => `${value} ${label}`;
  const label = health === "error"
    ? `${count(issues.length, copy.validation.error)}${warnings.length > 0 ? ` · ${count(warnings.length, copy.validation.warning)}` : ""}`
    : health === "warning" ? count(warnings.length, copy.validation.warning) : copy.validation.noIssues;
  const accessibleLabel = health === "ready" ? copy.validation.noThemeIssues : interpolate(copy.validation.validation, { label });
  const HealthIcon = health === "ready" ? CircleCheck : health === "warning" ? TriangleAlert : CircleAlert;

  return <details ref={menu} data-oria-editor-menu data-oria-editor-health={health}>
    <summary aria-label={accessibleLabel} title={label}>
      <HealthIcon data-oria-editor-action-icon aria-hidden="true" />
      <span data-oria-editor-action-label>{label}</span>
    </summary>
    <div data-oria-editor-issues>{health !== "ready" ? <>
      {issues.map((issue, index) => <p key={`e-${index}`}><strong>{copy.validation.error}</strong> {issue.path}<br />{issue.message}</p>)}
      {warnings.map((warning, index) => <p key={`w-${index}`}><strong>{copy.validation.warning}</strong> {warning.pair}<br />{warning.message}</p>)}
    </> : <p>{copy.validation.passes}</p>}</div>
  </details>;
}

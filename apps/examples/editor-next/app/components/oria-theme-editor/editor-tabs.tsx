import type { KeyboardEvent, ReactElement } from "react";
import type { ValidationIssue } from "@oriatheme/core";
import type { EditorTabId, EditorTabLayout } from "./editor-layout";

export function EditorTabs({ tabs, active, onChange, issues }: { readonly tabs: readonly EditorTabLayout[]; readonly active: EditorTabId; readonly onChange: (tab: EditorTabId) => void; readonly issues: readonly ValidationIssue[] }): ReactElement {
  const move = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    let next = index; if (event.key === "ArrowRight") next = (index + 1) % tabs.length; else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length; else if (event.key === "Home") next = 0; else if (event.key === "End") next = tabs.length - 1; else return;
    event.preventDefault(); const candidate = tabs[next]!; onChange(candidate.id); event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  };
  return <nav data-oria-editor-tabs role="tablist" aria-label="Theme categories">{tabs.map((tab, index) => {
    const count = issues.filter(issue => tab.panels.some(panel => panel.prefixes?.some(prefix => issue.path?.includes(prefix)) || panel.paths?.some(path => issue.path?.endsWith(path)))).length;
    return <button type="button" role="tab" id={`oria-tab-${tab.id}`} aria-selected={active === tab.id} tabIndex={active === tab.id ? 0 : -1} key={tab.id} onClick={() => onChange(tab.id)} onKeyDown={event => move(event, index)}>{tab.title}{count ? <span aria-label={`${count} issues`}>{count}</span> : null}</button>;
  })}</nav>;
}

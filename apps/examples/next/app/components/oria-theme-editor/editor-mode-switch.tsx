import type { ReactElement } from "react";
import type { ResolvedMode } from "@oriatheme/core";
export function EditorModeSwitch({ value, onChange }: { readonly value: ResolvedMode; readonly onChange: (value: ResolvedMode, origin: HTMLElement) => void }): ReactElement {
  return <div data-oria-editor-mode role="group" aria-label="Editing mode"><span aria-hidden="true" data-mode={value} />{(["light", "dark"] as const).map(mode => <button type="button" key={mode} aria-label={mode === "light" ? "Light mode" : "Dark mode"} title={mode === "light" ? "Light mode" : "Dark mode"} aria-pressed={value === mode} onClick={event => onChange(mode, event.currentTarget)}><svg viewBox="0 0 24 24" aria-hidden="true">{mode === "light" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></> : <path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z" />}</svg></button>)}</div>;
}

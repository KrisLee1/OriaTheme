import type { ReactElement } from "react";
import type { ResolvedMode } from "@oriatheme/core";
import { Moon, Sun } from "lucide-react";
import { useEditorCopy } from "@/components/editor-page/editor-i18n";
export function EditorModeSwitch({ value, onChange }: { readonly value: ResolvedMode; readonly onChange: (value: ResolvedMode, origin: HTMLElement) => void }): ReactElement {
  const copy = useEditorCopy().chrome;
  return <div data-oria-editor-mode role="group" aria-label={copy.editingMode}><span aria-hidden="true" data-mode={value} />{(["light", "dark"] as const).map(mode => <button type="button" key={mode} aria-label={mode === "light" ? copy.lightMode : copy.darkMode} title={mode === "light" ? copy.lightMode : copy.darkMode} aria-pressed={value === mode} onClick={event => onChange(mode, event.currentTarget)}>{mode === "light" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}</button>)}</div>;
}

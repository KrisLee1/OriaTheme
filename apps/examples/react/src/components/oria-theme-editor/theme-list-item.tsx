import { useEffect, useState } from "react";
import type { FormEvent, ReactElement } from "react";
import type { ResolvedMode, ThemeDefinition } from "@oriatheme/core";

const icon = (name: "apply" | "edit" | "copy" | "rename" | "delete"): ReactElement => {
  const paths = {
    apply: <><path d="M5 12.5 9.2 17 19 7" /></>,
    edit: <><path d="m4 20 4.2-1 10.6-10.6-3.2-3.2L5 15.8 4 20Z" /><path d="m13.8 7 3.2 3.2" /></>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    rename: <><path d="M4 7h10M9 7v10M5.5 17h7" /><path d="m15 16 4-4 2 2-4 4-3 1 1-3Z" /></>,
    delete: <><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" /><path d="M10 11v5M14 11v5" /></>
  } as const;
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
};

const swatch = (theme: ThemeDefinition, mode: ResolvedMode, path: string): string => {
  const value = (theme.modes[mode] as Readonly<Record<string, unknown>>)[path];
  return typeof value === "string" ? value : "transparent";
};

export function ThemeListItem({ theme, mode, active, displayName = theme.name, onApply, onEdit, onCopy, onDelete, onRename }: { readonly theme: ThemeDefinition; readonly mode: ResolvedMode; readonly active: boolean; readonly displayName?: string; readonly onApply: (element: HTMLElement) => void; readonly onEdit?: ((element: HTMLElement) => void) | undefined; readonly onCopy: (element: HTMLElement) => void; readonly onDelete?: ((element: HTMLElement) => void) | undefined; readonly onRename?: ((name: string) => void) | undefined }): ReactElement {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(displayName);
  useEffect(() => { if (!renaming) setName(displayName); }, [displayName, renaming]);
  const submitRename = (event: FormEvent): void => {
    event.preventDefault();
    const next = name.trim();
    if (!next || next.length > 120) return;
    onRename?.(next);
    setRenaming(false);
  };
  return <article data-oria-editor-theme-item data-active={active}>
    <div data-oria-editor-theme-preview aria-hidden="true">
      <span data-oria-editor-palette-icon>
        {(["color.primary", "color.secondary", "color.accent", "color.selection", "color.info"] as const).map(path => <i key={path} style={{ backgroundColor: swatch(theme, mode, path) }} />)}
      </span>
    </div>
    <div data-oria-editor-theme-body>
      {renaming ? <form data-oria-editor-theme-rename onSubmit={submitRename}>
        <label><span className="oria-editor-visually-hidden">Theme name</span><input value={name} maxLength={120} autoFocus onChange={event => setName(event.currentTarget.value)} onKeyDown={event => { if (event.key === "Escape") { setName(displayName); setRenaming(false); } }} /></label>
        <button type="submit" data-compact-action disabled={!name.trim()}>Save</button><button type="button" data-compact-action onClick={() => { setName(displayName); setRenaming(false); }}>Cancel</button>
      </form> : <div data-oria-editor-theme-name><strong>{displayName}</strong><small>{theme.kind === "custom" ? "Custom theme" : "Preset"}</small></div>}
      {!renaming ? <div data-oria-editor-theme-actions>
        <button type="button" data-theme-action="apply" aria-label={active ? `${displayName} is active` : `Apply ${displayName}`} title={active ? "Active theme" : "Apply"} disabled={active} onClick={event => onApply(event.currentTarget)}>{icon("apply")}<span>{active ? "Active" : "Apply"}</span></button>
        {onRename ? <button type="button" aria-label={`Rename ${displayName}`} title="Rename" onClick={() => setRenaming(true)}>{icon("rename")}</button> : null}
        {onEdit ? <button type="button" aria-label={`Edit ${displayName}`} title="Edit" onClick={event => onEdit(event.currentTarget)}>{icon("edit")}</button> : null}
        <button type="button" aria-label={`Copy and edit ${displayName}`} title="Copy and edit" onClick={event => onCopy(event.currentTarget)}>{icon("copy")}</button>
        {onDelete ? <button type="button" data-theme-action="delete" aria-label={`Delete ${displayName}`} title="Delete" onClick={event => onDelete(event.currentTarget)}>{icon("delete")}</button> : null}
      </div> : null}
    </div>
  </article>;
}

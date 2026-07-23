import { useEffect, useState } from "react";
import type { FormEvent, ReactElement } from "react";
import type { ResolvedMode, ThemeDefinition } from "@oriatheme/core";
import { Check, Copy, PencilLine, PencilSparkles, Trash2 } from "lucide-react";
import { useEditorCopy } from "@/components/editor-page/editor-i18n";

const icon = (name: "apply" | "edit" | "copy" | "rename" | "delete"): ReactElement => {
  const Icon = name === "apply" ? Check : name === "edit" ? PencilSparkles : name === "rename" ? PencilLine : name === "copy" ? Copy : Trash2;
  return <Icon aria-hidden="true" />;
};

const swatch = (theme: ThemeDefinition, mode: ResolvedMode, path: string): string => {
  const value = (theme.modes[mode] as Readonly<Record<string, unknown>>)[path];
  return typeof value === "string" ? value : "transparent";
};

export function ThemeListItem({ theme, mode, active, displayName = theme.name, onApply, onEdit, onCopy, onDelete, onRename }: { readonly theme: ThemeDefinition; readonly mode: ResolvedMode; readonly active: boolean; readonly displayName?: string; readonly onApply: (element: HTMLElement) => void; readonly onEdit?: ((element: HTMLElement) => void) | undefined; readonly onCopy: (element: HTMLElement) => void; readonly onDelete?: ((element: HTMLElement) => void) | undefined; readonly onRename?: ((name: string) => void) | undefined }): ReactElement {
  const copy = useEditorCopy().chrome;
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
        <label><span className="oria-editor-visually-hidden">{copy.themeName}</span><input value={name} maxLength={120} autoFocus onChange={event => setName(event.currentTarget.value)} onKeyDown={event => { if (event.key === "Escape") { setName(displayName); setRenaming(false); } }} /></label>
        <button type="submit" data-compact-action disabled={!name.trim()}>{copy.save}</button><button type="button" data-compact-action onClick={() => { setName(displayName); setRenaming(false); }}>{copy.cancel}</button>
      </form> : <div data-oria-editor-theme-name><strong>{displayName}</strong><small>{theme.kind === "custom" ? copy.customTheme : copy.preset}</small></div>}
      {!renaming ? <div data-oria-editor-theme-actions>
        <button type="button" data-theme-action="apply" aria-label={active ? `${displayName} ${copy.active}` : `${copy.apply} ${displayName}`} title={active ? copy.active : copy.apply} disabled={active} onClick={event => onApply(event.currentTarget)}>{icon("apply")}<span>{active ? copy.active : copy.apply}</span></button>
        {onRename ? <button type="button" aria-label={`${copy.themeActions.rename} ${displayName}`} title={copy.themeActions.rename} onClick={() => setRenaming(true)}>{icon("rename")}</button> : null}
        {onEdit ? <button type="button" aria-label={`${copy.themeActions.edit} ${displayName}`} title={copy.themeActions.edit} onClick={event => onEdit(event.currentTarget)}>{icon("edit")}</button> : null}
        <button type="button" aria-label={`${copy.themeActions.copyAndEdit} ${displayName}`} title={copy.themeActions.copyAndEdit} onClick={event => onCopy(event.currentTarget)}>{icon("copy")}</button>
        {onDelete ? <button type="button" data-theme-action="delete" aria-label={`${copy.themeActions.delete} ${displayName}`} title={copy.themeActions.delete} onClick={event => onDelete(event.currentTarget)}>{icon("delete")}</button> : null}
      </div> : null}
    </div>
  </article>;
}

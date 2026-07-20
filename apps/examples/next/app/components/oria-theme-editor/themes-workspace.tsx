import { useCallback, useState, useSyncExternalStore } from "react";
import type { ReactElement } from "react";
import type { ResolvedMode, ThemeDefinition } from "@oriatheme/core";
import type { ThemeEditorSession, ThemeEditorSnapshot } from "@oriatheme/editor-core";
import type { OriaThemeRuntime, ThemeSnapshot } from "@oriatheme/runtime-dom";
import { ConfirmationDialog } from "./overlays/confirmation-dialog";
import { ThemeAccordion } from "./theme-accordion";
import { ThemeListItem } from "./theme-list-item";

type ThemeAction = "apply" | "edit" | "copy" | "delete";
interface PendingAction { readonly action: ThemeAction; readonly themeId: string; readonly origin?: { readonly x: number; readonly y: number } }

const centerOf = (element: HTMLElement): { readonly x: number; readonly y: number } => {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

function copyIdentity(theme: ThemeDefinition, themes: readonly ThemeDefinition[]): { readonly id: string; readonly name: string } {
  const occupied = new Set(themes.map(item => item.id));
  let number = 1;
  let id = "";
  while (!id || occupied.has(id)) {
    const suffix = number === 1 ? "-copy" : `-copy-${number}`;
    const base = theme.id.slice(0, 64 - suffix.length).replace(/-+$/u, "") || "theme";
    id = `${base}${suffix}`;
    number += 1;
  }
  const label = number === 2 ? `${theme.name} Copy` : `${theme.name} Copy ${number - 1}`;
  return { id, name: label.slice(0, 120) };
}

export function ThemesWorkspace({ runtime, mode, snapshot, session, onEdit }: { readonly runtime?: OriaThemeRuntime | undefined; readonly mode: ResolvedMode; readonly snapshot: ThemeEditorSnapshot; readonly session: ThemeEditorSession; readonly onEdit: () => void }): ReactElement {
  const subscribe = useCallback((listener: () => void) => runtime?.subscribe(listener) ?? (() => undefined), [runtime]);
  const getSnapshot = useCallback((): ThemeSnapshot | null => runtime?.getSnapshot() ?? null, [runtime]);
  const runtimeSnapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [pending, setPending] = useState<PendingAction>();
  const [error, setError] = useState("");

  if (!runtime || !runtimeSnapshot) return <main data-oria-editor-workspace role="tabpanel" aria-labelledby="oria-tab-themes"><p data-oria-editor-empty>Theme management requires a runtime.</p></main>;

  const customThemes = [...runtimeSnapshot.customThemes].sort((left, right) => (right.updatedAt ?? right.createdAt ?? 0) - (left.updatedAt ?? left.createdAt ?? 0));
  const allThemes = [...runtimeSnapshot.presets, ...runtimeSnapshot.customThemes];
  const findTheme = (id: string): ThemeDefinition | undefined => allThemes.find(theme => theme.id === id);
  const perform = (action: ThemeAction, theme: ThemeDefinition, origin?: { readonly x: number; readonly y: number }): void => {
    setError("");
    try {
      if (action === "apply") {
        runtime.setTheme(theme.id, { animate: true, ...(origin ? { origin } : {}) });
        return;
      }
      if (action === "edit") {
        if (snapshot.draft.id !== theme.id) session.reload(theme);
        onEdit();
        return;
      }
      if (action === "copy") {
        const duplicate = runtime.duplicateTheme(theme.id, copyIdentity(theme, allThemes));
        session.reload(duplicate);
        onEdit();
        return;
      }
      runtime.removeCustomTheme(theme.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The theme action could not be completed.");
    }
  };
  const request = (action: ThemeAction, theme: ThemeDefinition, element: HTMLElement): void => {
    const origin = centerOf(element);
    const discardsDraft = action === "copy" || (action === "edit" && snapshot.draft.id !== theme.id) || (action === "apply" && runtimeSnapshot.preference.activeThemeId !== theme.id);
    if (action === "delete" || (snapshot.dirty && discardsDraft)) {
      setPending({ action, themeId: theme.id, origin });
      return;
    }
    perform(action, theme, origin);
  };
  const rename = (theme: ThemeDefinition, name: string): void => {
    setError("");
    try {
      if (snapshot.draft.id === theme.id) session.setName(name);
      else runtime.updateCustomTheme(theme.id, { name });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The theme could not be renamed.");
    }
  };
  const pendingTheme = pending ? findTheme(pending.themeId) : undefined;
  const deleting = pending?.action === "delete";

  return <main data-oria-editor-workspace data-oria-editor-themes role="tabpanel" aria-labelledby="oria-tab-themes">
    {error ? <p data-oria-editor-theme-error role="alert">{error}</p> : null}
    <ThemeAccordion title="My themes" count={customThemes.length} empty="Custom themes you save or copy will appear here.">
      {customThemes.map(theme => <ThemeListItem key={theme.id} theme={theme} mode={mode} active={runtimeSnapshot.preference.activeThemeId === theme.id} displayName={snapshot.draft.id === theme.id ? snapshot.draft.name : theme.name} onApply={element => request("apply", theme, element)} onEdit={element => request("edit", theme, element)} onCopy={element => request("copy", theme, element)} onDelete={element => request("delete", theme, element)} onRename={name => rename(theme, name)} />)}
    </ThemeAccordion>
    <ThemeAccordion title="Presets" count={runtimeSnapshot.presets.length} empty="No preset themes are available.">
      {runtimeSnapshot.presets.map(theme => <ThemeListItem key={theme.id} theme={theme} mode={mode} active={runtimeSnapshot.preference.activeThemeId === theme.id} onApply={element => request("apply", theme, element)} onCopy={element => request("copy", theme, element)} />)}
    </ThemeAccordion>
    <ConfirmationDialog open={pendingTheme !== undefined} title={deleting ? `Delete ${pendingTheme?.name ?? "theme"}?` : `${pending?.action === "copy" ? "Copy" : pending?.action === "edit" ? "Edit" : "Apply"} ${pendingTheme?.name ?? "theme"}?`} description={deleting ? "This custom theme will be permanently removed. If it is active, OriaTheme will return to the default theme." : "Continuing will discard the unsaved edits in the current draft."} confirmLabel={deleting ? "Delete theme" : "Discard and continue"} destructive={deleting} onConfirm={() => { if (pending && pendingTheme) perform(pending.action, pendingTheme, pending.origin); setPending(undefined); }} onCancel={() => setPending(undefined)} />
  </main>;
}

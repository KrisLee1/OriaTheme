import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { describeTokenContract } from "@oriatheme/editor-core";
import type { ResolvedMode } from "@oriatheme/core";
import type { ThemeEditorSaveResult } from "@oriatheme/editor-core";
import type { OriaThemeRuntime } from "@oriatheme/runtime-dom";
import { useThemeEditor, useThemeEditorAutoPreview } from "@oriatheme/react-editor";
import { editorTabs, resolveEditorLayout } from "./editor-layout";
import type { EditorTabId } from "./editor-layout";
import { EditorToolbar } from "./editor-toolbar";
import { EditorTabs } from "./editor-tabs";
import { EditorSearch } from "./editor-search";
import { EditorModeSwitch } from "./editor-mode-switch";
import { EditorWorkspace } from "./editor-workspace";
import { ThemesWorkspace } from "./themes-workspace";
import { ConfirmationDialog } from "./overlays/confirmation-dialog";
import type { ThemeEditorDiscardRequest } from "./theme-editor";

export function EditorShell({ runtime, mode: controlledMode, onModeChange, previewFollowsAppearance, onSave, onClose, onDirtyChange, discardRequest }: { readonly runtime?: OriaThemeRuntime | undefined; readonly mode?: ResolvedMode | undefined; readonly onModeChange?: ((mode: ResolvedMode, origin: HTMLElement) => void) | undefined; readonly previewFollowsAppearance: boolean; readonly onSave?: ((result: ThemeEditorSaveResult) => void) | undefined; readonly onClose?: (() => void) | undefined; readonly onDirtyChange?: ((dirty: boolean) => void) | undefined; readonly discardRequest?: ThemeEditorDiscardRequest | undefined }): ReactElement {
  const { session, snapshot } = useThemeEditor();
  const [localMode, setLocalMode] = useState<ResolvedMode>("light");
  const mode = controlledMode ?? localMode;
  const setMode = (next: ResolvedMode, origin: HTMLElement): void => {
    if (controlledMode === undefined) setLocalMode(next);
    onModeChange?.(next, origin);
  };
  const [tab, setTab] = useState<EditorTabId>("themes");
  const [query, setQuery] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);
  const preview = useThemeEditorAutoPreview(runtime, previewFollowsAppearance ? undefined : mode);
  const fields = useMemo(() => describeTokenContract(), []);
  const layout = useMemo(() => resolveEditorLayout(fields), [fields]);
  const status = preview.status === "paused" ? `Preview paused · ${preview.issueCount} issues` : preview.status === "unavailable" ? "Preview unavailable" : snapshot.dirty ? "Previewing · Unsaved" : "Previewing · Saved";
  useEffect(() => { onDirtyChange?.(snapshot.dirty); }, [onDirtyChange, snapshot.dirty]);
  useEffect(() => {
    if (!snapshot.dirty) return;
    const guard = (event: BeforeUnloadEvent): void => { event.preventDefault(); event.returnValue = ""; };
    globalThis.addEventListener("beforeunload", guard);
    return () => globalThis.removeEventListener("beforeunload", guard);
  }, [snapshot.dirty]);
  const requestClose = (assumeDirty = false): void => { if (snapshot.dirty || assumeDirty) setConfirmClose(true); else onClose?.(); };
  return <section data-oria-editor-root data-mode={mode} data-tab={tab} aria-label="Theme editor">
    <EditorToolbar session={session} snapshot={snapshot} mode={mode} runtime={runtime} status={status} onSave={onSave} onClose={onClose ? requestClose : undefined} />
    <EditorTabs tabs={editorTabs} active={tab} onChange={setTab} issues={snapshot.issues} />
    {tab === "themes" ? null : <div data-oria-editor-controls><EditorSearch value={query} onChange={setQuery} /><div data-oria-editor-control-end><EditorModeSwitch value={mode} onChange={setMode} /></div></div>}
    <div data-oria-editor-split>{tab === "themes"
      ? <ThemesWorkspace runtime={runtime} mode={mode} snapshot={snapshot} session={session} onEdit={() => setTab("colors")} />
      : <EditorWorkspace tab={tab} query={query} mode={mode} layout={layout} snapshot={snapshot} session={session} />}</div>
    <ConfirmationDialog open={confirmClose} title="Close editor and discard changes?" description="Your unsaved theme edits will be lost. The last saved theme will remain available." confirmLabel="Discard and close" onConfirm={() => { setConfirmClose(false); onClose?.(); }} onCancel={() => setConfirmClose(false)} />
    <ConfirmationDialog open={discardRequest !== undefined} title={discardRequest?.title ?? "Discard unsaved changes?"} description={discardRequest?.description ?? "Your unsaved theme edits will be lost."} confirmLabel={discardRequest?.confirmLabel ?? "Discard changes"} onConfirm={() => discardRequest?.onConfirm()} onCancel={() => discardRequest?.onCancel()} />
  </section>;
}

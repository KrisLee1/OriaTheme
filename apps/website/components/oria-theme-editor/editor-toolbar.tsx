import { useEffect, useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";
import type { ResolvedMode } from "@oriatheme/core";
import type { ThemeEditorSaveResult, ThemeEditorSession, ThemeEditorSnapshot } from "@oriatheme/editor-core";
import type { OriaThemeRuntime } from "@oriatheme/runtime-dom";
import { Save, X } from "lucide-react";
import { ResetMenu } from "./overlays/reset-menu";
import { ImportDialog } from "./overlays/import-dialog";
import { ExportMenu } from "./overlays/export-menu";
import { IssuesPopover } from "./overlays/issues-popover";
import { useEditorCopy } from "@/components/editor-page/editor-i18n";

export function EditorToolbar({ session, snapshot, mode, runtime, status, onSave, onClose }: { readonly session: ThemeEditorSession; readonly snapshot: ThemeEditorSnapshot; readonly mode: ResolvedMode; readonly runtime?: OriaThemeRuntime | undefined; readonly status: string; readonly onSave?: ((result: ThemeEditorSaveResult) => void) | undefined; readonly onClose?: ((assumeDirty?: boolean) => void) | undefined }): ReactElement {
  const copy = useEditorCopy().chrome;
  const [name, setName] = useState(snapshot.draft.name); const [message, setMessage] = useState("");
  useEffect(() => { setName(snapshot.draft.name); }, [snapshot.draft.name]);
  const commitName = (): void => { if (name !== snapshot.draft.name) session.setName(name); };
  const onNameKey = (event: KeyboardEvent<HTMLInputElement>): void => { if (event.key === "Enter") event.currentTarget.blur(); if (event.key === "Escape") { setName(snapshot.draft.name); event.currentTarget.blur(); } };
  const save = (): void => { if (!runtime) return; const result = session.save(runtime); onSave?.(result); setMessage(result.ok ? copy.status.saved : result.reason === "conflict" ? copy.status.conflict : copy.status.validation); };
  return <header data-oria-editor-toolbar>
    <div data-oria-editor-toolbar-top>
      <div data-oria-editor-identity><label><span className="oria-editor-visually-hidden">{copy.themeName}</span><input value={name} onChange={event => setName(event.target.value)} onBlur={commitName} onKeyDown={onNameKey} /></label><span data-oria-editor-status>{status}</span></div>
      {onClose ? <button data-oria-editor-close type="button" aria-label={copy.close} title={copy.close} onClick={() => { const hasBufferedName = name !== snapshot.draft.name; if (hasBufferedName) session.setName(name); onClose(snapshot.dirty || hasBufferedName); }}><X data-oria-editor-action-icon aria-hidden="true" /></button> : null}
    </div>
    <div data-oria-editor-actions>
      <div data-oria-editor-utility-actions role="group" aria-label={copy.draftTools}>
        <ResetMenu session={session} mode={mode} />
        <ImportDialog session={session} />
        <ExportMenu session={session} disabled={snapshot.issues.length > 0} />
      </div>
      <div data-oria-editor-commit-actions>
        <IssuesPopover issues={snapshot.issues} warnings={snapshot.diagnostics.warnings} />
        <button data-oria-editor-primary data-oria-editor-save type="button" disabled={!runtime || !snapshot.dirty || snapshot.issues.length > 0} onClick={save}><Save data-oria-editor-action-icon aria-hidden="true" /><span>{copy.save}</span></button>
      </div>
    </div>
    <span className="oria-editor-visually-hidden" aria-live="polite">{message}</span>
  </header>;
}

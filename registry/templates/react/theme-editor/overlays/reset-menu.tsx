import { useRef, useState } from "react";
import type { ReactElement } from "react";
import type { ResolvedMode } from "@oriatheme/core";
import type { ThemeEditorSession } from "@oriatheme/editor-core";
import { useDetailsDismiss } from "../hooks/use-details-dismiss";
import { ConfirmationDialog } from "./confirmation-dialog";

type ResetRequest = { readonly label: string; readonly action: () => void };

export function ResetMenu({ session, mode }: { readonly session: ThemeEditorSession; readonly mode: ResolvedMode }): ReactElement {
  const menu = useRef<HTMLDetailsElement>(null);
  useDetailsDismiss(menu);
  const [request, setRequest] = useState<ResetRequest>();
  const askToReset = (label: string, action: () => void): void => { menu.current?.removeAttribute("open"); setRequest({ label, action }); };
  const confirmReset = (): void => { request?.action(); setRequest(undefined); };

  return <>
    <details ref={menu} data-oria-editor-menu><summary aria-label="Reset theme draft" title="Reset"><svg data-oria-editor-action-icon viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4v6h6M5.5 15a7 7 0 1 0 .8-7.8L4 10" /></svg><span data-oria-editor-action-label>Reset</span></summary><div role="menu"><button role="menuitem" type="button" onClick={() => askToReset(`${mode} mode`, () => session.resetMode(mode))}>Reset {mode} mode</button><button role="menuitem" type="button" onClick={() => askToReset("the entire draft", () => session.resetAll())}>Reset entire draft</button></div></details>
    <ConfirmationDialog open={request !== undefined} title={`Reset ${request?.label ?? "draft"}?`} description={`This restores ${request?.label ?? "the selected scope"} to its saved baseline. Any unsaved edits in that scope will be lost.`} confirmLabel="Reset" onConfirm={confirmReset} onCancel={() => setRequest(undefined)} />
  </>;
}

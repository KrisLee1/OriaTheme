import { useRef, useState } from "react";
import type { ReactElement } from "react";
import type { ResolvedMode } from "@oriatheme/core";
import type { ThemeEditorSession } from "@oriatheme/editor-core";
import { RotateCcw } from "lucide-react";
import { useDetailsDismiss } from "../hooks/use-details-dismiss";
import { ConfirmationDialog } from "./confirmation-dialog";
import { interpolate, useEditorCopy } from "@/components/editor-page/editor-i18n";

type ResetRequest = { readonly label: string; readonly action: () => void };

export function ResetMenu({ session, mode }: { readonly session: ThemeEditorSession; readonly mode: ResolvedMode }): ReactElement {
  const copy = useEditorCopy().chrome;
  const menu = useRef<HTMLDetailsElement>(null);
  useDetailsDismiss(menu);
  const [request, setRequest] = useState<ResetRequest>();
  const askToReset = (label: string, action: () => void): void => { menu.current?.removeAttribute("open"); setRequest({ label, action }); };
  const confirmReset = (): void => { request?.action(); setRequest(undefined); };

  return <>
    <details ref={menu} data-oria-editor-menu><summary aria-label={copy.reset} title={copy.reset}><RotateCcw data-oria-editor-action-icon aria-hidden="true" /><span data-oria-editor-action-label>{copy.reset}</span></summary><div role="menu"><button role="menuitem" type="button" onClick={() => askToReset(interpolate(copy.modeScope, { mode }), () => session.resetMode(mode))}>{interpolate(copy.resetMode, { mode })}</button><button role="menuitem" type="button" onClick={() => askToReset(copy.draftScope, () => session.resetAll())}>{copy.resetDraft}</button></div></details>
    <ConfirmationDialog open={request !== undefined} title={interpolate(copy.resetTitle, { scope: request?.label ?? copy.draftScope })} description={interpolate(copy.resetDescription, { scope: request?.label ?? copy.selectedScope })} confirmLabel={copy.reset} onConfirm={confirmReset} onCancel={() => setRequest(undefined)} />
  </>;
}

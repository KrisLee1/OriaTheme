import { useRef, useState } from "react";
import type { ReactElement } from "react";
import type { ThemeEditorSession } from "@oriatheme/editor-core";
import { useDetailsDismiss } from "../hooks/use-details-dismiss";

const themeFileName = (id: string): string => `${id}.oria-theme.json`;

export function ExportMenu({ session, disabled }: { readonly session: ThemeEditorSession; readonly disabled: boolean }): ReactElement {
  const menu = useRef<HTMLDetailsElement>(null);
  useDetailsDismiss(menu);
  const [copied, setCopied] = useState(false);
  const copy = async (): Promise<void> => {
    await navigator.clipboard.writeText(session.exportJson());
    setCopied(true);
    globalThis.setTimeout(() => setCopied(false), 1500);
  };
  const download = (): void => {
    const url = URL.createObjectURL(new Blob([session.exportJson()], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = themeFileName(session.getSnapshot().draft.id);
    link.click();
    URL.revokeObjectURL(url);
  };
  return <details ref={menu} data-oria-editor-menu>
    <summary aria-disabled={disabled} aria-label={copied ? "Theme JSON copied" : "Export theme JSON"} title={copied ? "Copied" : "Export"}><svg data-oria-editor-action-icon viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m-4 4 4-4 4 4M5 20h14" /></svg><span data-oria-editor-action-label>{copied ? "Copied" : "Export"}</span></summary>
    <div role="menu"><button role="menuitem" type="button" disabled={disabled} onClick={() => void copy()}>Copy JSON</button><button role="menuitem" type="button" disabled={disabled} onClick={download}>Download JSON</button></div>
  </details>;
}

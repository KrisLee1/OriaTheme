import { useRef, useState } from "react";
import type { ReactElement } from "react";
import type { ThemeEditorSession } from "@oriatheme/editor-core";
import { Download } from "lucide-react";
import { useDetailsDismiss } from "../hooks/use-details-dismiss";
import { useEditorCopy } from "@/components/editor-page/editor-i18n";

const themeFileName = (id: string): string => `${id}.oria-theme.json`;

export function ExportMenu({ session, disabled }: { readonly session: ThemeEditorSession; readonly disabled: boolean }): ReactElement {
  const copyText = useEditorCopy().chrome;
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
    <summary aria-disabled={disabled} aria-label={copied ? copyText.exportCopied : copyText.export} title={copied ? copyText.exportCopied : copyText.export}><Download data-oria-editor-action-icon aria-hidden="true" /><span data-oria-editor-action-label>{copied ? copyText.exportCopied : copyText.export}</span></summary>
    <div role="menu"><button role="menuitem" type="button" disabled={disabled} onClick={() => void copy()}>{copyText.copyJson}</button><button role="menuitem" type="button" disabled={disabled} onClick={download}>{copyText.downloadJson}</button></div>
  </details>;
}

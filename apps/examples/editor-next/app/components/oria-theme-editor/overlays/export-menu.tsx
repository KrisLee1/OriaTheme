import { useRef, useState } from "react";
import type { ReactElement } from "react";
import type { ThemeEditorSession } from "@oriatheme/editor-core";
import { exportThemeCode } from "../export-theme-code";
import { useDetailsDismiss } from "../hooks/use-details-dismiss";

type ExportFormat = "typescript" | "json";
const themeFileName = (id: string, format: ExportFormat): string => `${id}.oria-theme.${format === "typescript" ? "ts" : "json"}`;

export function ExportMenu({ session, disabled }: { readonly session: ThemeEditorSession; readonly disabled: boolean }): ReactElement {
  const menu = useRef<HTMLDetailsElement>(null);
  useDetailsDismiss(menu);
  const [copied, setCopied] = useState<"typescript" | "json" | null>(null);
  const copy = async (format: ExportFormat): Promise<void> => {
    const draft = session.getSnapshot().draft;
    await navigator.clipboard.writeText(format === "typescript" ? exportThemeCode(draft) : session.exportJson());
    setCopied(format);
    globalThis.setTimeout(() => setCopied(null), 1500);
  };
  const download = (format: ExportFormat): void => {
    const draft = session.getSnapshot().draft;
    const content = format === "typescript" ? exportThemeCode(draft) : session.exportJson();
    const type = format === "typescript" ? "text/typescript;charset=utf-8" : "application/json";
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = themeFileName(draft.id, format);
    link.click();
    URL.revokeObjectURL(url);
  };
  return <details ref={menu} data-oria-editor-menu>
    <summary aria-disabled={disabled} aria-label={copied ? `Theme ${copied === "typescript" ? "TypeScript" : "JSON"} copied` : "Export theme"} title={copied ? "Copied" : "Export"}><svg data-oria-editor-action-icon viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M5 19h14" /></svg><span data-oria-editor-action-label>{copied ? "Copied" : "Export"}</span></summary>
    <div role="menu"><button role="menuitem" type="button" disabled={disabled} onClick={() => void copy("typescript")}>Copy TypeScript</button><button role="menuitem" type="button" disabled={disabled} onClick={() => download("typescript")}>Download TypeScript</button><button role="menuitem" type="button" disabled={disabled} onClick={() => void copy("json")}>Copy JSON</button><button role="menuitem" type="button" disabled={disabled} onClick={() => download("json")}>Download JSON</button></div>
  </details>;
}

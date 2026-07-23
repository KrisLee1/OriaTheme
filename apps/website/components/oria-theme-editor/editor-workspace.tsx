import type { ReactElement } from "react";
import type { ResolvedMode } from "@oriatheme/core";
import type { ThemeEditorSession, ThemeEditorSnapshot, TokenFieldDescriptor } from "@oriatheme/editor-core";
import { editorTabs } from "./editor-layout";
import type { EditorTabId } from "./editor-layout";
import { TokenAccordion } from "./token-accordion";
import { useEditorCopy } from "@/components/editor-page/editor-i18n";

export function EditorWorkspace({ tab, query, mode, layout, snapshot, session }: { readonly tab: EditorTabId; readonly query: string; readonly mode: ResolvedMode; readonly layout: ReadonlyMap<string, readonly TokenFieldDescriptor[]>; readonly snapshot: ThemeEditorSnapshot; readonly session: ThemeEditorSession }): ReactElement {
  const copy = useEditorCopy().chrome;
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const active = editorTabs.find(item => item.id === tab)!;
  const panels = active.panels.map(panel => ({ panel, fields: (layout.get(panel.id) ?? []).filter(field => { const haystack = `${field.label} ${field.path} ${field.description} ${(panel.aliases ?? []).join(" ")}`.toLowerCase(); return terms.every(term => haystack.includes(term)); }) })).filter(item => item.fields.length > 0);
  return <main data-oria-editor-workspace role="tabpanel" aria-labelledby={`oria-tab-${tab}`}>{panels.length ? panels.map(({ panel, fields }) => <TokenAccordion key={panel.id} panel={panel} fields={fields} mode={mode} snapshot={snapshot} session={session} reveal={terms.length > 0} />) : <p data-oria-editor-empty>{copy.noTokens.replace("{query}", query)}</p>}</main>;
}

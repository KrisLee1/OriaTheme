import type { ReactElement } from "react";
import { Search } from "lucide-react";
import { useEditorCopy } from "@/components/editor-page/editor-i18n";

export function EditorSearch({ value, onChange }: { readonly value: string; readonly onChange: (value: string) => void }): ReactElement {
  const copy = useEditorCopy().chrome;
  return <label data-oria-editor-search data-has-value={Boolean(value) || undefined}>
    <Search aria-hidden="true" />
    <span className="oria-editor-visually-hidden">{copy.search}</span>
    <input type="search" placeholder={copy.searchPlaceholder} value={value} onChange={event => onChange(event.target.value)} onKeyDown={event => { if (event.key === "Escape" && value) { event.preventDefault(); onChange(""); } }} />
  </label>;
}

import { useId, useState } from "react";
import type { ReactElement, ReactNode } from "react";

export function ThemeAccordion({ title, count, empty, children }: { readonly title: string; readonly count: number; readonly empty: string; readonly children: ReactNode }): ReactElement {
  const [open, setOpen] = useState(true);
  const panelId = useId();
  return <section data-oria-editor-accordion data-oria-editor-theme-accordion data-open={open} data-compact>
    <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(value => !value)}>
      <span><strong>{title}</strong></span>
      <span><small>{count}</small><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9 5 5 5-5" /></svg></span>
    </button>
    <div id={panelId} hidden={!open}>{count > 0 ? children : <p data-oria-editor-theme-empty>{empty}</p>}</div>
  </section>;
}

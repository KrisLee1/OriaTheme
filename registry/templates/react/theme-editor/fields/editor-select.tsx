import type { ReactElement, SelectHTMLAttributes } from "react";

/** Shared native select chrome with a stable size, chevron, and keyboard behavior. */
export function EditorSelect({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>): ReactElement {
  return <span data-oria-editor-select>
    <select {...props}>{children}</select>
    <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6.5 8 3.5 3.5L13.5 8" /></svg>
  </span>;
}

import type { ReactElement, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

/** Shared native select chrome with a stable size, chevron, and keyboard behavior. */
export function EditorSelect({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>): ReactElement {
  return <span data-oria-editor-select>
    <select {...props}>{children}</select>
    <ChevronDown aria-hidden="true" />
  </span>;
}

import { useMemo } from "react";
import type { TokenFieldDescriptor } from "@oriatheme/editor-core";
export function useTokenSearch(fields: readonly TokenFieldDescriptor[], query: string): readonly TokenFieldDescriptor[] {
  return useMemo(() => { const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean); return terms.length ? fields.filter(field => { const haystack = `${field.label} ${field.path} ${field.description}`.toLowerCase(); return terms.every(term => haystack.includes(term)); }) : fields; }, [fields, query]);
}

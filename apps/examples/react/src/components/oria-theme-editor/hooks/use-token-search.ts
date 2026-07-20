import { useMemo } from "react";
import type { TokenFieldDescriptor } from "@oriatheme/editor-core";
export function useTokenSearch(fields: readonly TokenFieldDescriptor[], query: string): readonly TokenFieldDescriptor[] {
  return useMemo(() => { const normalized = query.trim().toLowerCase(); return normalized ? fields.filter(field => `${field.label} ${field.path} ${field.description}`.toLowerCase().includes(normalized)) : fields; }, [fields, query]);
}


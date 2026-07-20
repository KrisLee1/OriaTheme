import { useMemo } from "react";
import { describeTokenContract } from "@oriatheme/editor-core";
import { resolveEditorLayout } from "../editor-layout";
export function useEditorLayout() { const fields = useMemo(() => describeTokenContract(), []); return useMemo(() => resolveEditorLayout(fields), [fields]); }

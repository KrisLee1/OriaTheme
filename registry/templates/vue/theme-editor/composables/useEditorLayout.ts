import { describeTokenContract } from "@oriatheme/editor-core"; import { resolveEditorLayout } from "../editor-layout";
export function useEditorLayout() { return resolveEditorLayout(describeTokenContract()); }

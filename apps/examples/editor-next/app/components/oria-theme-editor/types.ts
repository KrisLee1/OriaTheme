import type { ResolvedMode, ThemeTokenInput } from "@oriatheme/core";
import type { ThemeEditorSession, ThemeEditorSnapshot, TokenFieldDescriptor } from "@oriatheme/editor-core";

export interface TokenFieldProps {
  readonly field: TokenFieldDescriptor;
  readonly mode: ResolvedMode;
  readonly value: ThemeTokenInput | undefined;
  readonly issue?: string | undefined;
  readonly modified: boolean;
  readonly session: ThemeEditorSession;
}
export interface EditorViewProps { readonly mode: ResolvedMode; readonly snapshot: ThemeEditorSnapshot }

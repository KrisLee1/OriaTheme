"use client";
import type { ReactElement } from "react";
import { ThemeEditorProvider } from "@oriatheme/react-editor";
import type { ThemeEditorOptions, ThemeEditorSaveResult, ThemeEditorSession } from "@oriatheme/editor-core";
import type { ResolvedMode } from "@oriatheme/core";
import type { OriaThemeRuntime } from "@oriatheme/runtime-dom";
import { EditorShell } from "./editor-shell";
import "./theme-editor.css";

export interface ThemeEditorProps {
  readonly session?: ThemeEditorSession;
  readonly options?: ThemeEditorOptions;
  readonly runtime?: OriaThemeRuntime;
  readonly mode?: ResolvedMode;
  readonly onModeChange?: (mode: ResolvedMode, origin: HTMLElement) => void;
  readonly previewFollowsAppearance?: boolean;
  readonly onSave?: (result: ThemeEditorSaveResult) => void;
  readonly onClose?: () => void;
  readonly onDirtyChange?: (dirty: boolean) => void;
  readonly discardRequest?: ThemeEditorDiscardRequest;
}
export interface ThemeEditorDiscardRequest {
  readonly title: string;
  readonly description: string;
  readonly confirmLabel?: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}
export function ThemeEditor(props: ThemeEditorProps): ReactElement {
  if (!props.session && !props.options) throw new Error("ThemeEditor requires a session or options.");
  return <ThemeEditorProvider {...(props.session ? { session: props.session } : { options: props.options! })}>
    <EditorShell {...(props.runtime ? { runtime: props.runtime } : {})} {...(props.mode ? { mode: props.mode } : {})} {...(props.onModeChange ? { onModeChange: props.onModeChange } : {})} previewFollowsAppearance={props.previewFollowsAppearance ?? false} {...(props.onSave ? { onSave: props.onSave } : {})} {...(props.onClose ? { onClose: props.onClose } : {})} {...(props.onDirtyChange ? { onDirtyChange: props.onDirtyChange } : {})} {...(props.discardRequest ? { discardRequest: props.discardRequest } : {})} />
  </ThemeEditorProvider>;
}

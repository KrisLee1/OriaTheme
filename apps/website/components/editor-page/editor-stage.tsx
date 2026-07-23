"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useEditorPanel } from "@/components/editor-panel-provider";

export function EditorStage({ children }: { readonly children: ReactNode }) {
  const { editorVisibility, openEditor } = useEditorPanel();
  const openedOnEntry = useRef(false);

  useEffect(() => {
    if (openedOnEntry.current) return;
    openedOnEntry.current = true;
    openEditor();
  }, [openEditor]);

  return <div className="demo-stage" data-editor-state={editorVisibility}>{children}</div>;
}

"use client";

import dynamic from "next/dynamic";
import { useOriaTheme } from "@oriatheme/react";
import { useEditorPanel } from "@/components/editor-panel-provider";

const ThemeEditor = dynamic(
  () => import("@/components/oria-theme-editor").then(module => module.ThemeEditor),
  { ssr: false },
);

export function EditorPanel() {
  const { runtime, snapshot, setTheme } = useOriaTheme();
  const { activeTheme, changeAppearance, closeEditor, discardRequest, editorOptions, editorShown, editorVisibility, finishClosing, setEditorDirty } = useEditorPanel();

  if (!editorShown) return null;

  return <aside
    className="editor-panel"
    data-state={editorVisibility}
    id="theme-editor-panel"
    onTransitionEnd={event => {
      if (editorVisibility === "closing" && event.target === event.currentTarget && event.propertyName === "transform") finishClosing();
    }}
  >
    <ThemeEditor
      key={activeTheme.id}
      options={editorOptions}
      runtime={runtime}
      mode={snapshot.resolvedMode}
      onModeChange={(mode, origin) => changeAppearance(mode, origin)}
      previewFollowsAppearance
      onDirtyChange={setEditorDirty}
      {...(discardRequest ? { discardRequest } : {})}
      onClose={closeEditor}
      onSave={result => { if (result.ok) setTheme(result.theme.id); }}
    />
  </aside>;
}

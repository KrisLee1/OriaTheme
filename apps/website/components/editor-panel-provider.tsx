"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useOriaTheme } from "@oriatheme/react";
import { createThemeEditorIdentity } from "@oriatheme/editor-core";
import { oriaPresetCatalog } from "@oriatheme/presets";
import type { AppearanceMode, ThemeDefinition } from "@oriatheme/core";
import { getCopy, type Locale } from "@/lib/i18n";

type EditorVisibility = "closed" | "opening" | "open" | "closing";
type PendingDiscard =
  | { readonly kind: "close" }
  | { readonly kind: "theme"; readonly id: string; readonly name: string; readonly origin: { readonly x: number; readonly y: number } };

type EditorPanelContextValue = {
  readonly activeTheme: ThemeDefinition;
  readonly customThemes: readonly ThemeDefinition[];
  readonly editorVisibility: EditorVisibility;
  readonly editorShown: boolean;
  readonly editorOptions: { readonly source: ThemeDefinition; readonly identity?: ReturnType<typeof createThemeEditorIdentity> };
  readonly discardRequest: { readonly title: string; readonly description: string; readonly confirmLabel: string; readonly onConfirm: () => void; readonly onCancel: () => void } | undefined;
  readonly changeAppearance: (appearance: AppearanceMode, origin?: HTMLElement) => void;
  readonly closeEditor: () => void;
  readonly finishClosing: () => void;
  readonly requestThemeChange: (themeId: string, origin: HTMLElement) => void;
  readonly setEditorDirty: (dirty: boolean) => void;
  readonly toggleEditor: () => void;
  readonly openEditor: () => void;
};

const EditorPanelContext = createContext<EditorPanelContextValue | null>(null);

function originFor(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export function EditorPanelProvider({ children, locale }: { readonly children: ReactNode; readonly locale: Locale }) {
  const { snapshot, setAppearance, setTheme } = useOriaTheme();
  const [editorVisibility, setEditorVisibility] = useState<EditorVisibility>("closed");
  const [editorDirty, setEditorDirty] = useState(false);
  const [pendingDiscard, setPendingDiscard] = useState<PendingDiscard>();
  const copy = getCopy(locale);
  const editorShown = editorVisibility !== "closed";
  const activeTheme = snapshot.customThemes.find(theme => theme.id === snapshot.preference.activeThemeId)
    ?? oriaPresetCatalog.find(({ theme }) => theme.id === snapshot.preference.activeThemeId)?.theme
    ?? oriaPresetCatalog[0]!.theme;
  const customThemes = [...snapshot.customThemes].sort((left, right) => (right.updatedAt ?? right.createdAt ?? 0) - (left.updatedAt ?? left.createdAt ?? 0));
  const editorOptions = activeTheme.kind === "preset"
    ? { source: activeTheme, identity: createThemeEditorIdentity(activeTheme, [...snapshot.presets, ...snapshot.customThemes]) }
    : { source: activeTheme };
  const closeEditor = (): void => setEditorVisibility(visibility => visibility === "opening" ? "closed" : "closing");
  const finishClosing = (): void => setEditorVisibility("closed");
  const toggleEditor = (): void => {
    if (editorVisibility === "open" || editorVisibility === "opening") {
      if (editorDirty) setPendingDiscard({ kind: "close" }); else closeEditor();
      return;
    }
    setEditorVisibility("opening");
  };
  const openEditor = (): void => setEditorVisibility(visibility => visibility === "closed" ? "opening" : visibility);
  const changeAppearance = (appearance: AppearanceMode, origin?: HTMLElement): void => {
    setAppearance(appearance, origin ? { animate: true, origin: originFor(origin), preservePreview: editorShown } : { preservePreview: editorShown });
  };
  const requestThemeChange = (themeId: string, origin: HTMLElement): void => {
    if (themeId === snapshot.preference.activeThemeId) return;
    const name = customThemes.find(theme => theme.id === themeId)?.name ?? oriaPresetCatalog.find(({ theme }) => theme.id === themeId)?.theme.name ?? themeId;
    if (editorShown && editorDirty) { setPendingDiscard({ kind: "theme", id: themeId, name, origin: originFor(origin) }); return; }
    setTheme(themeId, { animate: true, origin: originFor(origin) });
  };
  const confirmDiscard = (): void => {
    if (pendingDiscard?.kind === "theme") setTheme(pendingDiscard.id, { animate: true, origin: pendingDiscard.origin });
    else if (pendingDiscard?.kind === "close") closeEditor();
    setPendingDiscard(undefined);
  };

  useEffect(() => {
    if (editorVisibility !== "opening") return;
    let nextFrame: number | undefined;
    const frame = requestAnimationFrame(() => {
      nextFrame = requestAnimationFrame(() => setEditorVisibility("open"));
    });
    return () => {
      cancelAnimationFrame(frame);
      if (nextFrame !== undefined) cancelAnimationFrame(nextFrame);
    };
  }, [editorVisibility]);
  useEffect(() => {
    if (editorVisibility !== "closing" || !globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const frame = requestAnimationFrame(() => setEditorVisibility("closed"));
    return () => cancelAnimationFrame(frame);
  }, [editorVisibility]);

  const value = useMemo<EditorPanelContextValue>(() => ({
    activeTheme,
    customThemes,
    editorVisibility,
    editorShown,
    editorOptions,
    discardRequest: pendingDiscard ? {
      title: pendingDiscard.kind === "theme" ? `Switch to ${pendingDiscard.name}?` : copy.editor.chrome.close,
      description: pendingDiscard.kind === "theme" ? "Switching themes will discard the unsaved edits in the current draft." : "Your unsaved theme edits will be lost. The last saved theme will remain available.",
      confirmLabel: pendingDiscard.kind === "theme" ? "Discard and switch" : copy.editor.chrome.close,
      onConfirm: confirmDiscard,
      onCancel: () => setPendingDiscard(undefined),
    } : undefined,
    changeAppearance,
    closeEditor,
    finishClosing,
    requestThemeChange,
    setEditorDirty,
    toggleEditor,
    openEditor,
  }), [activeTheme, copy, customThemes, editorVisibility, editorShown, editorOptions, pendingDiscard]);

  return <EditorPanelContext.Provider value={value}>{children}</EditorPanelContext.Provider>;
}

export function useEditorPanel() {
  const context = useContext(EditorPanelContext);
  if (!context) throw new Error("useEditorPanel must be used within EditorPanelProvider");
  return context;
}

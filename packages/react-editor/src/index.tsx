"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactElement, ReactNode } from "react";
import { createThemeEditorSession } from "@oriatheme/editor-core";
import type { ThemeEditorOptions, ThemeEditorSession, ThemeEditorSnapshot } from "@oriatheme/editor-core";
import type { ResolvedMode } from "@oriatheme/core";
import type { OriaThemeRuntime, PreviewHandle } from "@oriatheme/runtime-dom";

export type {
  DerivedTokenValue,
  SmartScaleInput,
  ThemeEditorOptions,
  ThemeEditorPreviewResult,
  ThemeEditorSaveResult,
  ThemeEditorSession,
  ThemeEditorSnapshot,
  TokenFieldDescriptor
} from "@oriatheme/editor-core";

const EditorContext = createContext<ThemeEditorSession | null>(null);

export interface ThemeEditorProviderProps {
  readonly session?: ThemeEditorSession;
  readonly options?: ThemeEditorOptions;
  readonly children: ReactNode;
}

/** Provides a caller-owned session or creates one whose lifetime matches the subtree. */
export function ThemeEditorProvider({ session: externalSession, options, children }: ThemeEditorProviderProps): ReactElement {
  const created = useRef<ThemeEditorSession | null>(null);
  const cleanupGenerations = useRef(new WeakMap<ThemeEditorSession, number>());
  if (!externalSession && !created.current) {
    if (!options) throw new Error("ThemeEditorProvider requires a session or options.");
    created.current = createThemeEditorSession(options);
  }
  const session = externalSession ?? created.current!;
  const owned = externalSession === undefined;
  useEffect(() => {
    const generation = (cleanupGenerations.current.get(session) ?? 0) + 1;
    cleanupGenerations.current.set(session, generation);
    return (): void => {
      if (!owned) return;
      queueMicrotask(() => {
        if (cleanupGenerations.current.get(session) === generation) session.destroy();
      });
    };
  }, [owned, session]);
  return <EditorContext.Provider value={session}>{children}</EditorContext.Provider>;
}

function requireSession(): ThemeEditorSession {
  const session = useContext(EditorContext);
  if (!session) throw new Error("useThemeEditor() requires ThemeEditorProvider.");
  return session;
}

/** Subscribes directly to editor-core's immutable snapshot; no React draft state is created. */
export function useThemeEditor(): { readonly session: ThemeEditorSession; readonly snapshot: ThemeEditorSnapshot } {
  const session = requireSession();
  const subscribe = useCallback((listener: () => void): (() => void) => session.subscribe(listener), [session]);
  const getSnapshot = useCallback((): ThemeEditorSnapshot => session.getSnapshot(), [session]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { session, snapshot };
}

export type ThemeEditorAutoPreviewState =
  | { readonly status: "unavailable" }
  | { readonly status: "scheduled"; readonly revision: number }
  | { readonly status: "previewing"; readonly revision: number }
  | { readonly status: "paused"; readonly revision: number; readonly issueCount: number };

/**
 * Coalesces valid revisions to one preview per animation frame. Invalid drafts keep
 * the last valid preview on screen, and every preview remains interruptible.
 */
export function useThemeEditorAutoPreview(runtime: OriaThemeRuntime | undefined, mode?: ResolvedMode): ThemeEditorAutoPreviewState {
  const { session, snapshot } = useThemeEditor();
  const handle = useRef<PreviewHandle | undefined>(undefined);
  const latestRevision = useRef(snapshot.revision);
  const previewGeneration = useRef(0);
  const [state, setState] = useState<ThemeEditorAutoPreviewState>(runtime ? { status: "scheduled", revision: snapshot.revision } : { status: "unavailable" });
  latestRevision.current = snapshot.revision;

  useEffect(() => (): void => { handle.current?.dispose(); handle.current = undefined; }, [runtime, session]);

  useEffect(() => {
    if (!runtime) return;
    let activeThemeId = runtime.getSnapshot().preference.activeThemeId;
    return runtime.subscribe(() => {
      const nextThemeId = runtime.getSnapshot().preference.activeThemeId;
      if (nextThemeId === activeThemeId) return;
      activeThemeId = nextThemeId;
      previewGeneration.current += 1;
      handle.current?.dispose(); handle.current = undefined;
      setState({ status: "scheduled", revision: latestRevision.current });
    });
  }, [runtime]);

  useEffect(() => {
    if (!runtime) { setState({ status: "unavailable" }); return; }
    if (snapshot.issues.length > 0) {
      setState({ status: "paused", revision: snapshot.revision, issueCount: snapshot.issues.length });
      return;
    }
    const revision = snapshot.revision;
    const generation = previewGeneration.current;
    let cancelled = false;
    let frame: number | undefined;
    setState({ status: "scheduled", revision });
    const commit = (): void => {
      if (cancelled || latestRevision.current !== revision || previewGeneration.current !== generation) return;
      const result = session.preview(runtime, mode);
      if (result.ok) {
        handle.current = result.handle;
        setState({ status: "previewing", revision });
      } else {
        setState({ status: "paused", revision, issueCount: result.issues.length });
      }
    };
    if (typeof requestAnimationFrame === "function") frame = requestAnimationFrame(commit);
    else queueMicrotask(commit);
    return (): void => {
      cancelled = true;
      if (frame !== undefined && typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
    };
  }, [mode, runtime, session, snapshot.revision, snapshot.issues]);

  return state;
}

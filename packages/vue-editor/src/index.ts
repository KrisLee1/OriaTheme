import { inject, onUnmounted, provide, readonly, shallowRef, toValue, watch } from "vue";
import type { DeepReadonly, MaybeRefOrGetter, ShallowRef } from "vue";
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

const ORIA_EDITOR_KEY = Symbol("OriaThemeEditor");
const isSession = (value: ThemeEditorOptions | ThemeEditorSession): value is ThemeEditorSession => "getSnapshot" in value;

/** Provides a caller-owned session or creates an owned one for the current Vue subtree. */
export function provideThemeEditor(optionsOrSession: ThemeEditorOptions | ThemeEditorSession): ThemeEditorSession {
  const owned = !isSession(optionsOrSession);
  const session = owned ? createThemeEditorSession(optionsOrSession) : optionsOrSession;
  provide(ORIA_EDITOR_KEY, session);
  if (owned) onUnmounted(() => session.destroy());
  return session;
}

function requireSession(): ThemeEditorSession {
  const session = inject<ThemeEditorSession | undefined>(ORIA_EDITOR_KEY, undefined);
  if (!session) throw new Error("useThemeEditor() requires provideThemeEditor().");
  return session;
}

/** Exposes editor-core's immutable snapshot without creating another draft state machine. */
export function useThemeEditor(): { readonly session: ThemeEditorSession; readonly snapshot: DeepReadonly<ShallowRef<ThemeEditorSnapshot>> } {
  const session = requireSession();
  const snapshot = shallowRef(session.getSnapshot());
  const unsubscribe = session.subscribe(() => { snapshot.value = session.getSnapshot(); });
  onUnmounted(unsubscribe);
  return { session, snapshot: readonly(snapshot) as DeepReadonly<ShallowRef<ThemeEditorSnapshot>> };
}

export type ThemeEditorAutoPreviewState =
  | { readonly status: "unavailable" }
  | { readonly status: "scheduled"; readonly revision: number }
  | { readonly status: "previewing"; readonly revision: number }
  | { readonly status: "paused"; readonly revision: number; readonly issueCount: number };

/** Coalesces valid session revisions and preserves the last valid atomic preview. */
export function useThemeEditorAutoPreview(runtime: MaybeRefOrGetter<OriaThemeRuntime | undefined>, mode?: MaybeRefOrGetter<ResolvedMode | undefined>): DeepReadonly<ShallowRef<ThemeEditorAutoPreviewState>> {
  const session = requireSession();
  const state = shallowRef<ThemeEditorAutoPreviewState>({ status: "unavailable" });
  const revision = shallowRef(session.getSnapshot().revision);
  const unsubscribe = session.subscribe(() => { revision.value = session.getSnapshot().revision; });
  let handle: PreviewHandle | undefined;
  let frame: number | undefined;
  let generation = 0;
  let activeThemeId: string | undefined;
  let unsubscribeRuntime = (): void => {};

  const stopRuntime = watch(() => toValue(runtime), currentRuntime => {
    unsubscribeRuntime();
    if (!currentRuntime) { activeThemeId = undefined; return; }
    activeThemeId = currentRuntime.getSnapshot().preference.activeThemeId;
    unsubscribeRuntime = currentRuntime.subscribe(() => {
      const nextThemeId = currentRuntime.getSnapshot().preference.activeThemeId;
      if (nextThemeId === activeThemeId) return;
      activeThemeId = nextThemeId;
      generation += 1;
      if (frame !== undefined && typeof globalThis.cancelAnimationFrame === "function") globalThis.cancelAnimationFrame(frame);
      handle?.dispose(); handle = undefined;
      state.value = { status: "scheduled", revision: revision.value };
    });
  }, { immediate: true });

  const stop = watch([revision, () => toValue(runtime), () => mode === undefined ? undefined : toValue(mode)], ([currentRevision, currentRuntime, currentMode]) => {
    generation += 1; const currentGeneration = generation;
    if (frame !== undefined && typeof globalThis.cancelAnimationFrame === "function") globalThis.cancelAnimationFrame(frame);
    if (!currentRuntime) { state.value = { status: "unavailable" }; return; }
    const snapshot = session.getSnapshot();
    if (snapshot.issues.length > 0) {
      state.value = { status: "paused", revision: currentRevision, issueCount: snapshot.issues.length };
      return;
    }
    state.value = { status: "scheduled", revision: currentRevision };
    const commit = (): void => {
      if (currentGeneration !== generation || session.getSnapshot().revision !== currentRevision) return;
      const result = session.preview(currentRuntime, currentMode);
      if (result.ok) { handle = result.handle; state.value = { status: "previewing", revision: currentRevision }; }
      else state.value = { status: "paused", revision: currentRevision, issueCount: result.issues.length };
    };
    if (typeof globalThis.requestAnimationFrame === "function") frame = globalThis.requestAnimationFrame(commit);
    else globalThis.queueMicrotask(commit);
  }, { immediate: true });

  onUnmounted(() => {
    generation += 1; stop(); stopRuntime(); unsubscribeRuntime(); unsubscribe();
    if (frame !== undefined && typeof globalThis.cancelAnimationFrame === "function") globalThis.cancelAnimationFrame(frame);
    handle?.dispose();
  });
  return readonly(state) as DeepReadonly<ShallowRef<ThemeEditorAutoPreviewState>>;
}

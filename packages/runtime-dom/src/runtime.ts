import { cloneTheme, exportTheme as serializeTheme, importTheme as parseTheme, OriaThemeError, oriaStandardContract, resolveTheme, validateTheme } from "@oriatheme/core";
import type { AppearanceMode, CloneIdentity, ResolvedMode, ResolvedTheme, ThemeDefinition, TokenContract } from "@oriatheme/core";
import { createLocalStorageThemeStorage, writeActiveSnapshot } from "./storage.js";
import type { CustomThemePatch, ImportOptions, NewCustomTheme, OriaThemeConfig, OriaThemeRuntime, PreviewHandle, ThemeChangeOptions, ThemePreference, ThemeSnapshot, ThemeStorage } from "./types.js";
import { createDomWriter } from "./writer.js";
import type { DomWriter } from "./writer.js";

type MediaQuery = { matches: boolean; addEventListener?(name: "change", listener: () => void): void; removeEventListener?(name: "change", listener: () => void): void; addListener?(listener: () => void): void; removeListener?(listener: () => void): void };
type Preview = { readonly theme: ThemeDefinition; readonly mode?: ResolvedMode };
type ViewTransition = { skipTransition?(): void; finished?: Promise<unknown> };
type ViewTransitionDocument = { startViewTransition?(callback: () => void): ViewTransition };
const isAppearance = (value: unknown): value is AppearanceMode => value === "light" || value === "dark" || value === "system";
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);

/** Creates an SSR-safe external store and client-only DOM runtime. */
export function createOriaThemeRuntime(config: OriaThemeConfig): OriaThemeRuntime {
  const contract = config.contract ?? oriaStandardContract;
  const defaultAppearance = config.defaultAppearance ?? "system";
  const defaultTheme = config.presets.find(theme => theme.id === config.defaultThemeId);
  if (!defaultTheme) throw new OriaThemeError("THEME_NOT_FOUND", `Default theme ${config.defaultThemeId} was not found.`, { path: "defaultThemeId" });
  const fallbackTheme: ThemeDefinition = defaultTheme;
  const presets = Object.freeze([...config.presets]);
  const variablePrefix = config.variablePrefix ?? "oria";
  const storageKey = config.storageKey ?? "oria-theme";
  const listeners = new Set<() => void>();
  let preference: ThemePreference = Object.freeze({ activeThemeId: fallbackTheme.id, appearance: defaultAppearance });
  let customThemes: readonly ThemeDefinition[] = Object.freeze([]);
  let preview: Preview | undefined;
  let started = false;
  let writer: DomWriter | undefined;
  let storage: ThemeStorage | false | undefined;
  let usesDefaultStorage = false;
  let stopStorage: (() => void) | undefined;
  let stopMedia: (() => void) | undefined;
  let adapterCleanup: (() => void) | undefined;
  let media: MediaQuery | undefined;
  let activeTransition: ViewTransition | undefined;
  let snapshot = makeSnapshot("idle", null, fallbackTheme, "light");

  function getTheme(id: string): ThemeDefinition | undefined { return presets.find(theme => theme.id === id) ?? customThemes.find(theme => theme.id === id); }
  function modeFor(appearance: AppearanceMode): ResolvedMode { return appearance === "system" ? media?.matches ? "dark" : "light" : appearance; }
  function resolve(theme: ThemeDefinition, mode: ResolvedMode): ResolvedTheme { return resolveTheme(theme, mode, { contract, variablePrefix }); }
  function makeSnapshot(status: ThemeSnapshot["status"], error: OriaThemeError | null, theme = getTheme(preference.activeThemeId) ?? fallbackTheme, mode = modeFor(preference.appearance)): ThemeSnapshot {
    return Object.freeze({ status, preference, resolvedMode: mode, resolvedTheme: resolve(theme, mode), presets, customThemes, error });
  }
  function notify(): void { for (const listener of [...listeners]) listener(); }
  function emitError(error: OriaThemeError): void {
    snapshot = Object.freeze({ ...snapshot, status: "error", error });
    try { config.onError?.(error); } catch { /* Consumer callbacks must not destabilize runtime. */ }
    notify();
  }
  function runAdapter(theme: ThemeDefinition, mode: ResolvedMode): void {
    adapterCleanup?.(); adapterCleanup = undefined;
    const root = writer?.getRoot();
    if (!root) return;
    root.setAttribute("data-oria-theme", theme.id);
    root.setAttribute("data-oria-mode", mode);
    root.style.colorScheme = mode;
    const cleanup = config.attributeAdapter?.({ root, themeId: theme.id, resolvedMode: mode });
    if (typeof cleanup === "function") adapterCleanup = cleanup;
  }
  function save(theme: ThemeDefinition): OriaThemeError | null {
    if (!storage) return null;
    try {
      storage.write({ schemaVersion: 1, preference, customThemes });
      if (usesDefaultStorage) {
        const lightVariables = resolve(theme, "light").variables;
        const darkVariables = resolve(theme, "dark").variables;
        writeActiveSnapshot(storageKey, { schemaVersion: 1, contract: theme.contract, themeId: theme.id, appearance: preference.appearance, variablePrefix, lightVariables, darkVariables });
      }
      return null;
    } catch (cause) { return new OriaThemeError("STORAGE_WRITE_FAILED", "Theme state could not be persisted.", { details: { cause: String(cause) } }); }
  }
  function transitionRoot(): HTMLElement | undefined {
    const root = writer?.getRoot();
    return root?.ownerDocument?.documentElement ?? root;
  }
  function transitionDocument(): ViewTransitionDocument | undefined { return transitionRoot()?.ownerDocument as unknown as ViewTransitionDocument | undefined; }
  function clearTransition(transition?: ViewTransition): void {
    if (transition && activeTransition !== transition) return;
    const root = transitionRoot();
    root?.removeAttribute("data-oria-transition");
    root?.style.removeProperty("--oria-transition-x");
    root?.style.removeProperty("--oria-transition-y");
    root?.style.removeProperty("--oria-transition-radius");
    root?.style.removeProperty("--oria-transition-duration");
    if (!transition || activeTransition === transition) activeTransition = undefined;
  }
  function normalizedDuration(): number {
    const duration = config.transition && config.transition.type === "view-transition" ? config.transition.duration : undefined;
    return typeof duration === "number" && Number.isFinite(duration) ? Math.min(Math.max(duration, 1), 2_000) : 420;
  }
  function configureCircle(origin: ThemeChangeOptions["origin"]): void {
    const root = transitionRoot();
    if (!root) return;
    const view = root.ownerDocument?.defaultView;
    const width = Math.max(view?.innerWidth ?? root.ownerDocument?.documentElement.clientWidth ?? 0, 1);
    const height = Math.max(view?.innerHeight ?? root.ownerDocument?.documentElement.clientHeight ?? 0, 1);
    const coordinate = (value: number | undefined, size: number): number => typeof value === "number" && Number.isFinite(value) ? Math.min(Math.max(value, 0), size) : size / 2;
    const x = coordinate(origin?.x, width);
    const y = coordinate(origin?.y, height);
    const radius = Math.max(Math.hypot(x, y), Math.hypot(width - x, y), Math.hypot(x, height - y), Math.hypot(width - x, height - y));
    root.style.setProperty("--oria-transition-x", `${x}px`);
    root.style.setProperty("--oria-transition-y", `${y}px`);
    root.style.setProperty("--oria-transition-radius", `${radius}px`);
    root.style.setProperty("--oria-transition-duration", `${normalizedDuration()}ms`);
    root.setAttribute("data-oria-transition", "circle");
  }
  function commit(persist: boolean, force = false, priorError: OriaThemeError | null = null, options?: ThemeChangeOptions): boolean {
    const display = preview?.theme ?? getTheme(preference.activeThemeId) ?? fallbackTheme;
    const mode = preview?.mode ?? modeFor(preference.appearance);
    let resolved: ResolvedTheme;
    try { resolved = resolve(display, mode); }
    catch (cause) { emitError(asOriaError(cause, "INVALID_THEME", "Theme could not be resolved.")); return false; }
    if (started && writer) {
      try {
        const apply = (): void => { const wrote = writer!.apply(resolved); if (wrote || force) runAdapter(display, mode); };
        if (shouldAnimate(options?.animate === true)) {
          activeTransition?.skipTransition?.();
          configureCircle(options?.origin);
          const documentForTransition = transitionDocument();
          if (documentForTransition?.startViewTransition) {
            const transition = documentForTransition.startViewTransition(apply);
            activeTransition = transition;
            if (transition.finished) void transition.finished.catch(() => undefined).then(() => { clearTransition(transition); });
            else clearTransition(transition);
          } else { clearTransition(); apply(); }
        } else apply();
      } catch (cause) { clearTransition(); emitError(asOriaError(cause, "DOM_APPLY_FAILED", "Theme DOM application failed.")); return false; }
    }
    const official = getTheme(preference.activeThemeId) ?? fallbackTheme;
    const storageError = persist ? save(official) : null;
    const failure = storageError ?? priorError;
    snapshot = Object.freeze({ status: failure ? "error" : started ? "ready" : "idle", preference, resolvedMode: mode, resolvedTheme: resolved, presets, customThemes, error: failure });
    if (failure) try { config.onError?.(failure); } catch { /* no-op */ }
    notify();
    return true;
  }
  function attachMedia(): void {
    const matchMedia = (globalThis as { matchMedia?: (query: string) => MediaQuery }).matchMedia;
    if (!matchMedia) return;
    media = matchMedia("(prefers-color-scheme: dark)");
    const change = (): void => { if (preference.appearance === "system") commit(false); };
    if (media.addEventListener && media.removeEventListener) { media.addEventListener("change", change); stopMedia = (): void => media?.removeEventListener?.("change", change); }
    else if (media.addListener && media.removeListener) { media.addListener(change); stopMedia = (): void => media?.removeListener?.(change); }
  }
  function shouldAnimate(requested: boolean): boolean {
    const transition = config.transition;
    if (!requested || !transition || transition.type !== "view-transition") return false;
    if (transition.respectReducedMotion !== false) {
      const reduce = (globalThis as { matchMedia?: (query: string) => { matches: boolean } }).matchMedia?.("(prefers-reduced-motion: reduce)");
      if (reduce?.matches) return false;
    }
    return typeof transitionDocument()?.startViewTransition === "function";
  }
  function readPersisted(): OriaThemeError | null {
    if (!storage) return null;
    try {
      const raw = storage.read(); if (raw === null) return null;
      const restored = validatePersisted(raw, contract, presets);
      if (!restored) throw new OriaThemeError("INVALID_THEME", "Persisted theme state is invalid.");
      preference = restored.preference; customThemes = Object.freeze([...restored.customThemes]); return null;
    } catch (cause) { preference = Object.freeze({ activeThemeId: fallbackTheme.id, appearance: defaultAppearance }); customThemes = Object.freeze([]); return asOriaError(cause, "STORAGE_READ_FAILED", "Theme state could not be restored."); }
  }
  function clearPreview(): void { if (preview) preview = undefined; }
  function applyOfficialChange(change: () => void, options: ThemeChangeOptions | undefined): void { if (!options?.preservePreview) clearPreview(); change(); commit(started, false, null, options); }

  return Object.freeze({
    start(): void {
      if (started) return;
      const target = config.target ?? (globalThis as { document?: Document }).document;
      if (!target) { emitError(new OriaThemeError("DOM_APPLY_FAILED", "OriaTheme runtime start() requires a browser Document or ShadowRoot target.")); return; }
      try { writer = createDomWriter(target); } catch (cause) { emitError(asOriaError(cause, "DOM_APPLY_FAILED", "Theme target could not be initialized.")); return; }
      storage = config.storage === false ? false : config.storage ?? createLocalStorageThemeStorage(storageKey);
      usesDefaultStorage = config.storage === undefined;
      const rehydrateError = readPersisted();
      if (storage && storage.subscribe) stopStorage = storage.subscribe((): void => { const activePreview = preview; const restoreError = readPersisted(); preview = activePreview; commit(false, false, restoreError); });
      attachMedia(); started = true; commit(false, true, rehydrateError);
    },
    destroy(): void {
      if (!started && snapshot.status === "idle") return;
      stopMedia?.(); stopMedia = undefined; media = undefined;
      stopStorage?.(); stopStorage = undefined;
      activeTransition?.skipTransition?.(); clearTransition();
      adapterCleanup?.(); adapterCleanup = undefined;
      writer?.destroy(); writer = undefined; storage = undefined;
      started = false; preview = undefined;
      snapshot = makeSnapshot("idle", null); notify(); listeners.clear();
    },
    getSnapshot(): ThemeSnapshot { return snapshot; },
    subscribe(listener: () => void): () => void { listeners.add(listener); return (): void => { listeners.delete(listener); }; },
    setTheme(themeId: string, options?: ThemeChangeOptions): void {
      if (!getTheme(themeId)) { emitError(new OriaThemeError("THEME_NOT_FOUND", `Theme ${themeId} was not found.`, { path: "themeId" })); return; }
      applyOfficialChange(() => { preference = Object.freeze({ ...preference, activeThemeId: themeId }); }, options);
    },
    setAppearance(mode: AppearanceMode, options?: ThemeChangeOptions): void {
      if (!isAppearance(mode)) { emitError(new OriaThemeError("INVALID_THEME", "Appearance must be light, dark, or system.", { path: "appearance" })); return; }
      applyOfficialChange(() => { preference = Object.freeze({ ...preference, appearance: mode }); }, options);
    },
    createCustomTheme(input: NewCustomTheme): ThemeDefinition {
      const checked = validateTheme(input.theme, contract);
      if (!checked.ok || input.theme.kind !== "custom") throw new OriaThemeError("INVALID_THEME", "Custom theme input is invalid.", { details: { issues: checked.ok ? [] : checked.issues } });
      if (getTheme(input.theme.id)) throw new OriaThemeError("THEME_ID_CONFLICT", `Theme ${input.theme.id} already exists.`, { path: "id" });
      customThemes = Object.freeze([...customThemes, checked.value]); commit(started); return checked.value;
    },
    updateCustomTheme(id: string, patch: CustomThemePatch, options?: ThemeChangeOptions): ThemeDefinition {
      const current = customThemes.find(theme => theme.id === id);
      if (!current) throw new OriaThemeError(getTheme(id) ? "PRESET_IMMUTABLE" : "THEME_NOT_FOUND", `Custom theme ${id} was not found.`, { path: "id" });
      const candidate: ThemeDefinition = { ...current, ...(patch.name === undefined ? {} : { name: patch.name }), modes: { light: patch.modes?.light ?? current.modes.light, dark: patch.modes?.dark ?? current.modes.dark }, ...(patch.metadata === undefined ? {} : { metadata: patch.metadata }), updatedAt: Date.now() };
      const checked = validateTheme(candidate, contract); if (!checked.ok) throw new OriaThemeError("INVALID_THEME", "Custom theme patch is invalid.", { details: { issues: checked.issues } });
      customThemes = Object.freeze(customThemes.map(theme => theme.id === id ? checked.value : theme)); commit(started, false, null, options); return checked.value;
    },
    duplicateTheme(id: string, identity: CloneIdentity): ThemeDefinition {
      const current = getTheme(id); if (!current) throw new OriaThemeError("THEME_NOT_FOUND", `Theme ${id} was not found.`, { path: "id" });
      if (getTheme(identity.id)) throw new OriaThemeError("THEME_ID_CONFLICT", `Theme ${identity.id} already exists.`, { path: "id" });
      const duplicate = cloneTheme(current, identity); customThemes = Object.freeze([...customThemes, duplicate]); commit(started); return duplicate;
    },
    removeCustomTheme(id: string): void {
      const current = customThemes.find(theme => theme.id === id);
      if (!current) { emitError(new OriaThemeError(getTheme(id) ? "PRESET_IMMUTABLE" : "THEME_NOT_FOUND", `Custom theme ${id} cannot be removed.`, { path: "id" })); return; }
      customThemes = Object.freeze(customThemes.filter(theme => theme.id !== id));
      if (preference.activeThemeId === id) preference = Object.freeze({ ...preference, activeThemeId: fallbackTheme.id });
      clearPreview(); commit(started);
    },
    previewTheme(theme: ThemeDefinition, mode?: ResolvedMode): PreviewHandle {
      const checked = validateTheme(theme, contract); if (!checked.ok) throw new OriaThemeError("INVALID_THEME", "Preview theme is invalid.", { details: { issues: checked.issues } });
      preview = { theme: checked.value, ...(mode === undefined ? {} : { mode }) }; commit(false);
      let disposed = false;
      return Object.freeze({ dispose(): void { if (disposed) return; disposed = true; if (preview?.theme === checked.value) { preview = undefined; commit(false); } } });
    },
    exportTheme(id: string): string { const theme = getTheme(id); if (!theme) throw new OriaThemeError("THEME_NOT_FOUND", `Theme ${id} was not found.`, { path: "id" }); return serializeTheme(theme); },
    importTheme(json: string, options: ImportOptions = {}): ThemeDefinition {
      const result = parseTheme(json, { contract, existingThemes: [...presets, ...customThemes], ...(options.conflict === undefined ? {} : { conflict: options.conflict }), ...(options.migrate === undefined ? {} : { migrate: options.migrate }) });
      if (!result.ok) throw new OriaThemeError(result.issues[0]?.code as OriaThemeError["code"] ?? "INVALID_THEME", result.issues[0]?.message ?? "Theme import failed.", { ...(result.issues[0]?.path === undefined ? {} : { path: result.issues[0].path }) });
      customThemes = Object.freeze(result.replaced ? customThemes.map(theme => theme.id === result.theme.id ? result.theme : theme) : [...customThemes, result.theme]); commit(started); return result.theme;
    },
    reset(): void {
      customThemes = Object.freeze([]); preference = Object.freeze({ activeThemeId: fallbackTheme.id, appearance: defaultAppearance }); clearPreview();
      try { if (storage) storage.clear(); } catch (cause) { emitError(new OriaThemeError("STORAGE_WRITE_FAILED", "Theme state could not be cleared.", { details: { cause: String(cause) } })); }
      commit(started);
    }
  });
}

function asOriaError(cause: unknown, code: OriaThemeError["code"], message: string): OriaThemeError { return cause instanceof OriaThemeError ? cause : new OriaThemeError(code, message, { details: { cause: String(cause) } }); }
function validatePersisted(input: unknown, contract: TokenContract, presets: readonly ThemeDefinition[]): { preference: ThemePreference; customThemes: readonly ThemeDefinition[] } | undefined {
  if (!object(input) || input.schemaVersion !== 1 || !Array.isArray(input.customThemes) || input.customThemes.length > 50) return undefined;
  const persistedPreference = input.preference;
  if (!object(persistedPreference) || typeof persistedPreference.activeThemeId !== "string" || !isAppearance(persistedPreference.appearance)) return undefined;
  const customThemes: ThemeDefinition[] = [];
  for (const theme of input.customThemes) { const checked = validateTheme(theme, contract); if (!checked.ok || checked.value.kind !== "custom") return undefined; customThemes.push(checked.value); }
  const exists = presets.some(theme => theme.id === persistedPreference.activeThemeId) || customThemes.some(theme => theme.id === persistedPreference.activeThemeId);
  if (!exists) return undefined;
  return { preference: Object.freeze({ activeThemeId: persistedPreference.activeThemeId, appearance: persistedPreference.appearance }), customThemes: Object.freeze(customThemes) };
}

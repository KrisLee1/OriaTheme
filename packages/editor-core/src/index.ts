import { analyzeTheme, cloneTheme, exportTheme, importTheme, normalizeTheme, oriaStandardContract, validateTheme } from "@oriatheme/core";
import type { CloneIdentity, ImportResult, ResolvedMode, ThemeDefinition, ThemeDiagnostics, ThemeTokenInput, TokenContract, TokenPath, ValidationIssue } from "@oriatheme/core";
import type { OriaThemeRuntime, PreviewHandle } from "@oriatheme/runtime-dom";

import { getTokenModeScope } from "./fields.js";

export { describeToken, describeTokenContract, getTokenModeScope } from "./fields.js";
export type { TokenFieldDescriptor, TokenModeScope } from "./fields.js";
export { deriveSmartScale, preserveScaleOverrides } from "./scales.js";
export type { DerivedTokenValue, SmartScaleInput } from "./scales.js";

export interface ThemeEditorOptions {
  readonly source: ThemeDefinition;
  /** Required when a preset is materialized as a new custom draft. */
  readonly identity?: CloneIdentity;
  readonly contract?: TokenContract;
}

/** Creates a stable, available custom identity when a preset is opened for editing. */
export function createThemeEditorIdentity(source: Pick<ThemeDefinition, "id" | "name">, existingThemes: readonly Pick<ThemeDefinition, "id">[]): CloneIdentity {
  const occupied = new Set(existingThemes.map(theme => theme.id));
  let number = 1;
  while (true) {
    const idSuffix = number === 1 ? "-editor" : `-editor-${number}`;
    const idBase = source.id.slice(0, 64 - idSuffix.length).replace(/-+$/u, "") || "theme";
    const id = `${idBase}${idSuffix}`;
    if (!occupied.has(id)) {
      const nameSuffix = number === 1 ? " custom" : ` custom ${number}`;
      const nameBase = source.name.slice(0, 120 - nameSuffix.length).trimEnd() || "Theme";
      return { id, name: `${nameBase}${nameSuffix}` };
    }
    number += 1;
  }
}

export interface ThemeEditorSnapshot {
  readonly draft: ThemeDefinition;
  readonly dirty: boolean;
  readonly revision: number;
  readonly issues: readonly ValidationIssue[];
  readonly diagnostics: ThemeDiagnostics;
}

export type ThemeEditorSaveResult =
  | { readonly ok: true; readonly theme: ThemeDefinition }
  | { readonly ok: false; readonly reason: "validation"; readonly issues: readonly ValidationIssue[] }
  | { readonly ok: false; readonly reason: "conflict"; readonly currentTheme: ThemeDefinition };

export type ThemeEditorPreviewResult =
  | { readonly ok: true; readonly handle: PreviewHandle }
  | { readonly ok: false; readonly issues: readonly ValidationIssue[] };

export interface ThemeEditorSession {
  getSnapshot(): ThemeEditorSnapshot;
  subscribe(listener: () => void): () => void;
  setName(name: string): void;
  setToken(mode: ResolvedMode, path: TokenPath, value: ThemeTokenInput): void;
  setTokens(mode: ResolvedMode, values: Readonly<Record<TokenPath, ThemeTokenInput>> | readonly { readonly path: TokenPath; readonly value: ThemeTokenInput }[]): void;
  removeToken(mode: ResolvedMode, path: TokenPath): void;
  resetToken(mode: ResolvedMode, path: TokenPath): void;
  resetMode(mode: ResolvedMode): void;
  resetAll(): void;
  replaceFromJson(json: string): ImportResult;
  exportJson(): string;
  preview(runtime: OriaThemeRuntime, mode?: ResolvedMode): ThemeEditorPreviewResult;
  save(runtime: OriaThemeRuntime): ThemeEditorSaveResult;
  reload(theme: ThemeDefinition): void;
  destroy(): void;
}

function copyTheme(theme: ThemeDefinition): ThemeDefinition {
  return Object.freeze({
    ...theme,
    contract: Object.freeze({ ...theme.contract }),
    modes: Object.freeze({ light: Object.freeze({ ...theme.modes.light }), dark: Object.freeze({ ...theme.modes.dark }) }),
    ...(theme.metadata === undefined ? {} : { metadata: Object.freeze({ ...theme.metadata }) })
  });
}

function materializeSharedTokens(theme: ThemeDefinition, contract: TokenContract): ThemeDefinition {
  const light = { ...theme.modes.light } as Record<TokenPath, ThemeTokenInput>;
  const dark = { ...theme.modes.dark } as Record<TokenPath, ThemeTokenInput>;
  for (const path of Object.keys(contract.tokens) as TokenPath[]) {
    if (getTokenModeScope(path) !== "shared") continue;
    const canonical = light[path] ?? dark[path];
    if (canonical === undefined) { delete light[path]; delete dark[path]; } else { light[path] = canonical; dark[path] = canonical; }
  }
  return copyTheme({ ...theme, modes: { light, dark } });
}

function diagnosticsFor(validation: ReturnType<typeof validateTheme>, contract: TokenContract): { readonly issues: readonly ValidationIssue[]; readonly diagnostics: ThemeDiagnostics } {
  if (!validation.ok) return { issues: validation.issues, diagnostics: { errors: validation.issues, warnings: [] } };
  const diagnostics = analyzeTheme(validation.value, contract);
  return { issues: diagnostics.errors, diagnostics };
}

/** Creates a framework- and environment-independent draft session. */
export function createThemeEditorSession(options: ThemeEditorOptions): ThemeEditorSession {
  const contract = options.contract ?? oriaStandardContract;
  const fromPreset = options.source.kind === "preset";
  if (fromPreset && !options.identity) throw new Error("ThemeEditorOptions.identity is required when editing a preset.");
  let initial = materializeSharedTokens(fromPreset ? cloneTheme(options.source, options.identity!) : options.source, contract);
  let draft = copyTheme(initial);
  let baselineUpdatedAt = fromPreset ? undefined : initial.updatedAt;
  const initialSaveIntent = fromPreset ? "create" : "update";
  let saveIntent: "create" | "update" = initialSaveIntent;
  let imported = false;
  let dirty = false;
  let revision = 0;
  let activePreview: PreviewHandle | undefined;
  let destroyed = false;
  const listeners = new Set<() => void>();

  // validateTheme is a pure function of the immutable draft; cache it per draft
  // reference so snapshot diagnostics, preview and save do not re-validate the
  // same draft several times per revision.
  let validationCache: { readonly draft: ThemeDefinition; readonly result: ReturnType<typeof validateTheme> } | undefined;
  const validateDraft = (): ReturnType<typeof validateTheme> => {
    if (validationCache?.draft !== draft) validationCache = { draft, result: validateTheme(draft, contract) };
    return validationCache.result;
  };

  const buildSnapshot = (): ThemeEditorSnapshot => {
    const { issues, diagnostics } = diagnosticsFor(validateDraft(), contract);
    return Object.freeze({ draft, dirty, revision, issues, diagnostics });
  };
  let snapshot = buildSnapshot();
  const refresh = (): void => { snapshot = buildSnapshot(); };
  const emit = (): void => { if (!destroyed) for (const listener of [...listeners]) listener(); };
  const revise = (): void => { revision += 1; dirty = true; refresh(); emit(); };
  const replaceDraft = (next: ThemeDefinition): void => { draft = copyTheme(next); revise(); };
  const clearPreview = (): void => { activePreview?.dispose(); activePreview = undefined; };
  const updateTokens = (mode: ResolvedMode, entries: readonly (readonly [TokenPath, ThemeTokenInput])[]): void => {
    const light = { ...draft.modes.light } as Record<TokenPath, ThemeTokenInput>;
    const dark = { ...draft.modes.dark } as Record<TokenPath, ThemeTokenInput>;
    let accepted = false;
    for (const [path, value] of entries) {
      if (!contract.tokens[path]) continue;
      if (getTokenModeScope(path) === "shared") {
        light[path] = value;
        dark[path] = value;
      } else {
        (mode === "light" ? light : dark)[path] = value;
      }
      accepted = true;
    }
    if (accepted) replaceDraft({ ...draft, modes: { light, dark } });
  };

  return Object.freeze({
    getSnapshot(): ThemeEditorSnapshot { return snapshot; },
    subscribe(listener: () => void): () => void {
      if (!destroyed) listeners.add(listener);
      return (): void => { listeners.delete(listener); };
    },
    setName(name: string): void { if (!destroyed) replaceDraft({ ...draft, name }); },
    setToken(mode: ResolvedMode, path: TokenPath, value: ThemeTokenInput): void {
      if (!destroyed) updateTokens(mode, [[path, value]]);
    },
    setTokens(mode: ResolvedMode, values: Readonly<Record<TokenPath, ThemeTokenInput>> | readonly { readonly path: TokenPath; readonly value: ThemeTokenInput }[]): void {
      if (destroyed) return;
      const entries: readonly (readonly [TokenPath, ThemeTokenInput])[] = Array.isArray(values)
        ? (values as readonly { readonly path: TokenPath; readonly value: ThemeTokenInput }[]).map(entry => [entry.path, entry.value] as const)
        : Object.entries(values as Readonly<Record<TokenPath, ThemeTokenInput>>).map(([tokenPath, value]) => [tokenPath as TokenPath, value] as const);
      updateTokens(mode, entries);
    },
    removeToken(mode: ResolvedMode, path: TokenPath): void {
      if (destroyed || !contract.tokens[path] || contract.tokens[path].required) return;
      const light = { ...draft.modes.light } as Record<TokenPath, ThemeTokenInput>;
      const dark = { ...draft.modes.dark } as Record<TokenPath, ThemeTokenInput>;
      if (getTokenModeScope(path) === "shared") {
        if (light[path] === undefined && dark[path] === undefined) return;
        delete light[path];
        delete dark[path];
      } else {
        const target = mode === "light" ? light : dark;
        if (target[path] === undefined) return;
        delete target[path];
      }
      replaceDraft({ ...draft, modes: { light, dark } });
    },
    resetToken(mode: ResolvedMode, path: TokenPath): void {
      if (destroyed || !contract.tokens[path]) return;
      if (getTokenModeScope(path) === "shared") {
        const light = { ...draft.modes.light } as Record<TokenPath, ThemeTokenInput>;
        const dark = { ...draft.modes.dark } as Record<TokenPath, ThemeTokenInput>;
        const original = initial.modes.light[path];
        if (original === undefined) { delete light[path]; delete dark[path]; } else { light[path] = original; dark[path] = original; }
        replaceDraft({ ...draft, modes: { light, dark } });
        return;
      }
      const next = { ...draft.modes[mode] } as Record<TokenPath, ThemeTokenInput>;
      const original = initial.modes[mode][path];
      if (original === undefined) delete next[path]; else next[path] = original;
      replaceDraft({ ...draft, modes: { ...draft.modes, [mode]: next } });
    },
    resetMode(mode: ResolvedMode): void {
      if (destroyed) return;
      const next = { ...draft.modes[mode] } as Record<TokenPath, ThemeTokenInput>;
      for (const path of Object.keys(contract.tokens) as TokenPath[]) {
        if (getTokenModeScope(path) === "shared") continue;
        const original = initial.modes[mode][path];
        if (original === undefined) delete next[path]; else next[path] = original;
      }
      replaceDraft({ ...draft, modes: { ...draft.modes, [mode]: next } });
    },
    resetAll(): void {
      if (destroyed) return;
      clearPreview(); draft = copyTheme(initial); saveIntent = initialSaveIntent; imported = false; dirty = false; revision += 1; refresh(); emit();
    },
    replaceFromJson(json: string): ImportResult {
      const result = importTheme(json, { contract, existingThemes: [] });
      if (!result.ok) return result;
      const theme = materializeSharedTokens(result.theme, contract);
      if (!destroyed) { saveIntent = "create"; imported = true; replaceDraft(theme); }
      return { ...result, theme };
    },
    exportJson(): string { return exportTheme(draft); },
    preview(runtime: OriaThemeRuntime, mode?: ResolvedMode): ThemeEditorPreviewResult {
      const validation = validateDraft();
      if (!validation.ok) return { ok: false, issues: validation.issues };
      clearPreview();
      activePreview = runtime.previewTheme(validation.value, mode);
      return { ok: true, handle: activePreview };
    },
    save(runtime: OriaThemeRuntime): ThemeEditorSaveResult {
      const validation = validateDraft();
      if (!validation.ok) return { ok: false, reason: "validation", issues: validation.issues };
      const normalized = normalizeTheme(validation.value, contract);
      const runtimeSnapshot = runtime.getSnapshot();
      const current = runtimeSnapshot.customThemes.find(theme => theme.id === normalized.id);
      const occupied = [...runtimeSnapshot.presets, ...runtimeSnapshot.customThemes];
      const matchingTheme = occupied.find(theme => theme.id === normalized.id);
      if (saveIntent === "update" && (!current || current.updatedAt !== baselineUpdatedAt)) {
        return { ok: false, reason: "conflict", currentTheme: current ?? initial };
      }
      if (saveIntent === "create" && matchingTheme && !imported) return { ok: false, reason: "conflict", currentTheme: matchingTheme };
      const theme = saveIntent === "create" && matchingTheme
        ? cloneTheme(normalized, createThemeEditorIdentity(normalized, occupied))
        : normalized;
      const saved = saveIntent === "create"
        ? runtime.createCustomTheme({ theme })
        : runtime.updateCustomTheme(theme.id, { name: theme.name, modes: theme.modes, ...(theme.metadata === undefined ? {} : { metadata: theme.metadata }) });
      clearPreview(); initial = copyTheme(saved); draft = copyTheme(saved); baselineUpdatedAt = saved.updatedAt; saveIntent = "update"; imported = false; dirty = false; revision += 1; refresh(); emit();
      return { ok: true, theme: saved };
    },
    reload(theme: ThemeDefinition): void {
      if (destroyed) return;
      clearPreview(); initial = materializeSharedTokens(theme, contract); draft = copyTheme(initial); baselineUpdatedAt = theme.updatedAt; saveIntent = theme.kind === "custom" ? "update" : "create"; imported = false; dirty = false; revision += 1; refresh(); emit();
    },
    destroy(): void {
      if (destroyed) return;
      destroyed = true; clearPreview(); listeners.clear();
    }
  });
}

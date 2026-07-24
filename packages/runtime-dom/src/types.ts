import type { AppearanceMode, CloneIdentity, ImportThemeOptions, OriaThemeError, ResolvedMode, ResolvedTheme, ThemeDefinition, ThemeMetadata, ThemeMigration, ThemeTokenSet, TokenContract } from "@oriatheme/core";

export interface ThemePreference { readonly activeThemeId: string; readonly appearance: AppearanceMode }
export interface PersistedThemeStateV1 { readonly schemaVersion: 1; readonly preference: ThemePreference; readonly customThemes: readonly ThemeDefinition[] }
export interface ActiveThemeSnapshotV1 {
  readonly schemaVersion: 1;
  readonly contract: { readonly name: string; readonly version: number };
  readonly themeId: string;
  readonly appearance: AppearanceMode;
  readonly variablePrefix: string;
  readonly lightVariables: Readonly<Record<string, string>>;
  readonly darkVariables: Readonly<Record<string, string>>;
}
/** A persistence adapter. It may throw; runtime recovers without losing in-memory state. */
export interface ThemeStorage {
  read(): unknown | null;
  write(state: PersistedThemeStateV1): void;
  clear(): void;
  subscribe?(listener: () => void): () => void;
}
export type AttributeAdapter = (context: { readonly root: HTMLElement; readonly themeId: string; readonly resolvedMode: ResolvedMode }) => void | (() => void);
export interface TransitionConfig { readonly type: "view-transition"; readonly duration?: number; readonly respectReducedMotion?: boolean }

/** Public configuration for the client-only DOM runtime. */
export interface OriaThemeConfig {
  readonly contract?: TokenContract;
  readonly presets: readonly ThemeDefinition[];
  readonly defaultThemeId: string;
  readonly defaultAppearance?: AppearanceMode;
  readonly variablePrefix?: string;
  /** Explicitly registered persisted-theme migrations. No v1 data is accepted without one. */
  readonly migrations?: readonly ThemeMigration[];
  readonly storage?: ThemeStorage | false;
  readonly storageKey?: string;
  readonly target?: Document | ShadowRoot;
  readonly transition?: TransitionConfig | false;
  readonly attributeAdapter?: AttributeAdapter;
  readonly onError?: (error: OriaThemeError) => void;
}

/** The stable external-store shape. It is available before browser start. */
export interface ThemeSnapshot {
  readonly status: "idle" | "ready" | "error";
  readonly preference: ThemePreference;
  readonly resolvedMode: ResolvedMode;
  readonly resolvedTheme: ResolvedTheme;
  readonly presets: readonly ThemeDefinition[];
  readonly customThemes: readonly ThemeDefinition[];
  readonly error: OriaThemeError | null;
}
export interface ThemeChangeOptions { readonly preservePreview?: boolean; readonly animate?: boolean; readonly origin?: { readonly x: number; readonly y: number } }
export interface NewCustomTheme { readonly theme: ThemeDefinition }
export interface CustomThemePatch { readonly name?: string; readonly modes?: { readonly light?: ThemeTokenSet; readonly dark?: ThemeTokenSet }; readonly metadata?: ThemeMetadata }
export interface ImportOptions { readonly conflict?: ImportThemeOptions["conflict"]; readonly migrate?: ImportThemeOptions["migrate"] }
export interface PreviewHandle { dispose(): void }

/** Input for the no-preset, first-paint active-snapshot bootstrap path. */
export interface BootstrapOptions {
  readonly snapshot?: unknown;
  readonly storageKey?: string;
  readonly contract?: { readonly name: string; readonly version: number };
  readonly variablePrefix?: string;
  readonly target?: Document | ShadowRoot;
}

/** The browser runtime state source shared by framework adapters. */
export interface OriaThemeRuntime {
  start(): void;
  destroy(): void;
  getSnapshot(): ThemeSnapshot;
  subscribe(listener: () => void): () => void;
  setTheme(themeId: string, options?: ThemeChangeOptions): void;
  setAppearance(mode: AppearanceMode, options?: ThemeChangeOptions): void;
  createCustomTheme(input: NewCustomTheme): ThemeDefinition;
  updateCustomTheme(id: string, patch: CustomThemePatch, options?: ThemeChangeOptions): ThemeDefinition;
  duplicateTheme(id: string, identity: CloneIdentity): ThemeDefinition;
  removeCustomTheme(id: string): void;
  previewTheme(theme: ThemeDefinition, mode?: ResolvedMode): PreviewHandle;
  exportTheme(id: string): string;
  importTheme(json: string, options?: ImportOptions): ThemeDefinition;
  reset(): void;
}

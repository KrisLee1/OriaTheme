/** A user-selected color preference. */
export type AppearanceMode = "light" | "dark" | "system";
/** A concrete mode after resolving an appearance preference. */
export type ResolvedMode = "light" | "dark";
export type ThemeKind = "preset" | "custom";
export type TokenType =
  | "color"
  | "dimension"
  | "number"
  | "fontFamily"
  | "fontWeight"
  | "duration"
  | "cubicBezier"
  | "shadow"
  | "gradient";

/** A dotted token path validated by a TokenContract. */
export type TokenPath = string & { readonly __tokenPath: unique symbol };
export interface TokenReference { readonly $ref: TokenPath }
export interface ShadowLayer {
  readonly x: string;
  readonly y: string;
  readonly blur: string;
  readonly spread: string;
  readonly color: string;
  readonly inset?: boolean;
}
export interface GradientStop { readonly color: string | TokenReference; readonly position?: number }
export type GradientPosition =
  | "top left"
  | "top"
  | "top right"
  | "left"
  | "center"
  | "right"
  | "bottom left"
  | "bottom"
  | "bottom right"
  | { readonly x: number; readonly y: number };
export type GradientDefinition =
  | { readonly type: "linear"; readonly angle: number; readonly stops: readonly GradientStop[] }
  | { readonly type: "repeating-linear"; readonly angle: number; readonly stops: readonly GradientStop[] }
  | { readonly type: "radial"; readonly position?: GradientPosition; readonly stops: readonly GradientStop[] }
  | { readonly type: "repeating-radial"; readonly position?: GradientPosition; readonly stops: readonly GradientStop[] }
  | { readonly type: "conic"; readonly angle: number; readonly position?: GradientPosition; readonly stops: readonly GradientStop[] };
export type TokenValue = string | number | readonly string[] | readonly [number, number, number, number] | readonly ShadowLayer[] | GradientDefinition;
export type ThemeTokenInput = TokenValue | TokenReference;

export type TokenValueFor<T extends TokenType> =
  T extends "number" ? number :
  T extends "fontFamily" ? readonly string[] :
  T extends "cubicBezier" ? readonly [number, number, number, number] :
  T extends "shadow" ? readonly ShadowLayer[] :
  T extends "gradient" ? GradientDefinition : string;

export interface TokenDefinition<T extends TokenType = TokenType> {
  readonly type: T;
  readonly required: boolean;
  readonly description: string;
  readonly default?: TokenValueFor<T>;
  readonly minimum?: number;
  readonly maximum?: number;
}
export interface TokenContract { readonly name: string; readonly version: number; readonly tokens: Readonly<Record<TokenPath, TokenDefinition>> }
export interface TokenContractInput { readonly name: string; readonly version: number; readonly extends?: readonly TokenContract[]; readonly tokens: Readonly<Record<string, TokenDefinition>> }
export interface ThemeContractRef { readonly name: string; readonly version: number }
export type ThemeTokenSet = Readonly<Record<TokenPath, ThemeTokenInput>>;
export interface ThemeMetadata { readonly [key: string]: string | number | boolean | null }
export interface ThemeDefinition {
  readonly schemaVersion: 1;
  readonly contract: ThemeContractRef;
  readonly id: string;
  readonly name: string;
  readonly kind: ThemeKind;
  readonly modes: { readonly light: ThemeTokenSet; readonly dark: ThemeTokenSet };
  readonly metadata?: ThemeMetadata;
  readonly createdAt?: number;
  readonly updatedAt?: number;
}
export interface ResolvedTheme {
  readonly themeId: string;
  readonly contract: ThemeContractRef;
  readonly mode: ResolvedMode;
  readonly variables: Readonly<Record<`--${string}`, string>>;
  readonly colorScheme: ResolvedMode;
}
export interface ValidationIssue { readonly code: string; readonly path?: string; readonly message: string; readonly details?: Readonly<Record<string, unknown>> }
export type ValidationResult<T> = { readonly ok: true; readonly value: T; readonly issues: readonly [] } | { readonly ok: false; readonly issues: readonly ValidationIssue[] };
export interface ResolveOptions { readonly variablePrefix?: string; readonly contract?: TokenContract }
export interface Clock { now(): number }
export interface CloneIdentity { readonly id: string; readonly name: string }
/** Minimal deterministic input for generating a complete custom theme. */
export interface ThemeSeed { readonly color: string }
export interface CreateThemeOptions { readonly id: string; readonly name: string; readonly clock?: Clock }
export interface ImportThemeOptions {
  readonly contract: TokenContract;
  readonly existingThemes?: readonly ThemeDefinition[];
  readonly conflict?: "rename" | "replace";
  readonly maxBytes?: number;
  readonly migrate?: (theme: unknown, source: ThemeContractRef) => unknown;
}
export type ImportResult = { readonly ok: true; readonly theme: ThemeDefinition; readonly replaced: boolean } | { readonly ok: false; readonly issues: readonly ValidationIssue[] };
export interface ContrastDiagnostic { readonly pair: string; readonly ratio: number; readonly level: "warning" | "error"; readonly message: string }
export interface ThemeDiagnostics { readonly errors: readonly ValidationIssue[]; readonly warnings: readonly ContrastDiagnostic[] }

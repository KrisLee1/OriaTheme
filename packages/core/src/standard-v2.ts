import { defineTokenContract, token } from "./contract.js";
import { OriaThemeError } from "./errors.js";
import { oriaDefaultThemeV1, oriaStandardContractV1 } from "./standard.js";
import { resolveThemeWithContract, validateTheme } from "./theme.js";
import type { MigrationWarning, ThemeDefinition, ThemeMigrationResult, ThemeTokenInput, TokenDefinition, TokenPath } from "./types.js";

const definitions: Record<string, TokenDefinition> = {};
const add = (path: string, definition: TokenDefinition): void => { definitions[path] = definition; };
const required = (type: TokenDefinition["type"], path: string, description: string, options: Omit<TokenDefinition, "type" | "required" | "description"> = {}): void => add(path, token(type, { required: true, description, ...options }));
const optional = (type: TokenDefinition["type"], path: string, description: string): void => add(path, token(type, { required: false, description }));

for (const path of ["bg", "fg", "surface", "surface.fg", "surface.raised", "surface.raised.fg", "overlay", "overlay.fg", "primary", "primary.fg", "primary.hover", "primary.active", "secondary", "secondary.fg", "secondary.hover", "secondary.active", "muted", "muted.fg", "accent", "accent.fg", "danger", "danger.fg", "success", "success.fg", "warning", "warning.fg", "info", "info.fg", "border", "border.strong", "input", "ring", "selection", "selection.fg", "scrim", ...Array.from({ length: 8 }, (_, index) => `chart.${index + 1}`)]) required("color", `color.${path}`, "Semantic color token.");
for (const path of ["sans", "serif", "mono", "display"]) required("fontFamily", `font.${path}`, "Font family list.");
for (const path of ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"]) required("fontWeight", `font.weight.${path}`, "Font weight.");
for (const path of ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl"]) required("dimension", `text.${path}`, "Text size.");
for (const path of ["tight", "snug", "normal", "relaxed", "loose"]) required("number", `leading.${path}`, "Unitless line height.");
for (const path of ["tighter", "tight", "normal", "wide", "wider", "widest"]) required("dimension", `tracking.${path}`, "Letter spacing.");
required("dimension", "space", "Base spacing unit.");
required("dimension", "radius", "Base radius unit.");
for (const path of ["sm", "md", "lg"]) {
  required("number", `control.height.${path}`, "Control height multiplier.", { minimum: 1, maximum: 24, integer: true, output: false });
  required("number", `control.padding.x.${path}`, "Control horizontal padding multiplier.", { minimum: 1, maximum: 24, integer: true, output: false });
}
for (const path of ["hairline", "default", "strong"]) required("dimension", `border.width.${path}`, "Border width.");
required("dimension", "ring.width", "Focus ring width."); required("dimension", "ring.offset", "Focus ring offset.");
for (const path of ["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "inner", "highlight"]) required("shadow", `shadow.${path}`, "Structured elevation shadow.");
for (const path of ["disabled", "muted", "overlay"]) required("number", `opacity.${path}`, "Opacity.", { minimum: 0, maximum: 1 });
for (const path of ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"]) required("dimension", `blur.${path}`, "Blur radius.");
for (const path of ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"]) required("dimension", `backdrop.blur.${path}`, "Backdrop blur radius.");
required("number", "backdrop.saturate", "Backdrop saturation.", { minimum: 0, maximum: 3 });
for (const path of ["bg", "surface", "accent"]) optional("gradient", `gradient.${path}`, "Optional structured gradient.");
for (const path of ["bg", "surface"]) optional("pattern", `pattern.${path}`, "Optional ordered pattern layers.");
for (const path of ["instant", "fast", "normal", "slow"]) required("duration", `duration.${path}`, "Motion duration.");
for (const path of ["standard", "enter", "exit", "emphasized"]) required("cubicBezier", `ease.${path}`, "Motion curve.");

/** The standard token contract (version 2, kebab-case CSS output). */
export const oriaStandardContract = defineTokenContract({
  name: "oria-standard", version: 2, cssNameStyle: "kebab", tokens: definitions,
  derivedVariables: [
    ...([ ["radius-xs", 0.5], ["radius-sm", 1], ["radius-md", 1.5], ["radius-lg", 2], ["radius-xl", 3], ["radius-2xl", 4], ["radius-3xl", 6], ["radius-4xl", 8] ] as const).map(([name, factor]) => ({ name, type: "dimension" as const, derive: { kind: "scale" as const, source: "radius" as TokenPath, factor } })),
    ...(["sm", "md", "lg"] as const).flatMap(size => [
      { name: `control-height-${size}`, type: "dimension" as const, derive: { kind: "product" as const, dimension: "space" as TokenPath, factor: `control.height.${size}` as TokenPath } },
      { name: `control-padding-x-${size}`, type: "dimension" as const, derive: { kind: "product" as const, dimension: "space" as TokenPath, factor: `control.padding.x.${size}` as TokenPath } }
    ])
  ]
});

const directMappings: Record<string, string> = {
  "color.background": "color.bg", "color.foreground": "color.fg", "color.surface": "color.surface", "color.surfaceForeground": "color.surface.fg", "color.surfaceRaised": "color.surface.raised", "color.surfaceRaisedForeground": "color.surface.raised.fg", "color.overlay": "color.overlay", "color.overlayForeground": "color.overlay.fg", "color.primary": "color.primary", "color.primaryForeground": "color.primary.fg", "color.primaryHover": "color.primary.hover", "color.primaryActive": "color.primary.active", "color.secondary": "color.secondary", "color.secondaryForeground": "color.secondary.fg", "color.secondaryHover": "color.secondary.hover", "color.secondaryActive": "color.secondary.active", "color.muted": "color.muted", "color.mutedForeground": "color.muted.fg", "color.accent": "color.accent", "color.accentForeground": "color.accent.fg", "color.destructive": "color.danger", "color.destructiveForeground": "color.danger.fg", "color.success": "color.success", "color.successForeground": "color.success.fg", "color.warning": "color.warning", "color.warningForeground": "color.warning.fg", "color.info": "color.info", "color.infoForeground": "color.info.fg", "color.border": "color.border", "color.borderStrong": "color.border.strong", "color.input": "color.input", "color.ring": "color.ring", "color.selection": "color.selection", "color.selectionForeground": "color.selection.fg", "color.scrim": "color.scrim",
  "typography.font.sans": "font.sans", "typography.font.serif": "font.serif", "typography.font.mono": "font.mono", "typography.font.display": "font.display",
  "typography.weight.thin": "font.weight.thin", "typography.weight.extraLight": "font.weight.extralight", "typography.weight.light": "font.weight.light", "typography.weight.normal": "font.weight.normal", "typography.weight.medium": "font.weight.medium", "typography.weight.semibold": "font.weight.semibold", "typography.weight.bold": "font.weight.bold", "typography.weight.extraBold": "font.weight.extrabold", "typography.weight.black": "font.weight.black",
  "shape.borderWidth.hairline": "border.width.hairline", "shape.borderWidth.default": "border.width.default", "shape.borderWidth.strong": "border.width.strong", "shape.focusRingWidth": "ring.width", "shape.focusRingOffset": "ring.offset",
  "effect.opacity.disabled": "opacity.disabled", "effect.opacity.muted": "opacity.muted", "effect.opacity.overlay": "opacity.overlay", "effect.backdropSaturation": "backdrop.saturate",
  "gradient.background": "gradient.bg", "gradient.surface": "gradient.surface", "gradient.accent": "gradient.accent", "pattern.background": "pattern.bg", "pattern.surface": "pattern.surface",
  "motion.duration.instant": "duration.instant", "motion.duration.fast": "duration.fast", "motion.duration.normal": "duration.normal", "motion.duration.slow": "duration.slow", "motion.easing.standard": "ease.standard", "motion.easing.entrance": "ease.enter", "motion.easing.exit": "ease.exit", "motion.easing.emphasized": "ease.emphasized"
};
for (const step of ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl"]) directMappings[`typography.size.${step}`] = `text.${step}`;
for (const step of ["tight", "snug", "normal", "relaxed", "loose"]) directMappings[`typography.lineHeight.${step}`] = `leading.${step}`;
for (const step of ["tighter", "tight", "normal", "wide", "wider", "widest"]) directMappings[`typography.letterSpacing.${step}`] = `tracking.${step}`;
for (const step of ["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "inner", "highlight"]) directMappings[`elevation.shadow.${step}`] = `shadow.${step}`;
for (const step of ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"]) { directMappings[`effect.blur.${step}`] = `blur.${step}`; directMappings[`effect.backdropBlur.${step}`] = `backdrop.blur.${step}`; }
for (let index = 1; index <= 8; index += 1) directMappings[`color.chart${index}`] = `color.chart.${index}`;

function valueFor(theme: ThemeDefinition, mode: "light" | "dark", path: string): ThemeTokenInput | undefined { return theme.modes[mode][path as TokenPath] ?? oriaStandardContractV1.tokens[path as TokenPath]?.default; }
function resolvedDimensions(theme: ThemeDefinition, mode: "light" | "dark"): (path: string) => string | undefined {
  const variables = resolveThemeWithContract(theme, oriaStandardContractV1, mode, { variablePrefix: "migration" }).variables;
  return (path) => variables[`--migration-${path.replace(/\./g, "-")}`];
}
function factor(value: string | undefined, base: string | undefined, warningPath: string, warnings: MigrationWarning[]): number {
  const match = /^([-+]?(?:\d+|\d*\.\d+))(px|rem|em|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/.exec(value ?? "");
  const unit = /^([-+]?(?:\d+|\d*\.\d+))(px|rem|em|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/.exec(base ?? "");
  if (!match || !unit || match[2] !== unit[2] || Number(unit[1]) === 0) { warnings.push({ path: warningPath, message: "Cannot preserve the v1 dimension as a v2 space multiplier; used the nearest default multiplier." }); return 1; }
  const exact = Number(match[1]) / Number(unit[1]); const rounded = Math.min(24, Math.max(1, Math.round(exact)));
  if (Math.abs(exact - rounded) > 0.0001) warnings.push({ path: warningPath, message: `v1 value is ${exact.toFixed(3)} space units; v2 requires an integer multiplier and uses ${rounded}.` });
  return rounded;
}
function remapReferences(value: ThemeTokenInput): ThemeTokenInput {
  if (value !== null && typeof value === "object" && !Array.isArray(value) && "$ref" in value) return { $ref: (directMappings[(value as { $ref: string }).$ref] ?? (value as { $ref: string }).$ref) as TokenPath };
  if (Array.isArray(value)) return value.map(item => remapReferences(item as ThemeTokenInput)) as ThemeTokenInput;
  if (value !== null && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, remapReferences(item as ThemeTokenInput)])) as unknown as ThemeTokenInput;
  return value;
}

function convertModeTokens(theme: ThemeDefinition, mode: "light" | "dark", warnings: MigrationWarning[], dimension: (path: string) => string | undefined): Readonly<Record<TokenPath, ThemeTokenInput>> {
  const next: Record<string, ThemeTokenInput> = {};
  for (const [from, to] of Object.entries(directMappings)) { const value = valueFor(theme, mode, from); if (value !== undefined) next[to] = remapReferences(value); }
  const space = dimension("spacing.1") ?? "0.25rem";
  next.space = space; next.radius = dimension("shape.radius.sm") ?? "0.25rem";
  for (const size of ["sm", "md", "lg"] as const) {
    next[`control.height.${size}`] = factor(dimension(`control.height.${size}`), space, `control.height.${size}`, warnings);
    next[`control.padding.x.${size}`] = factor(dimension(`control.paddingInline.${size}`), space, `control.paddingInline.${size}`, warnings);
  }
  const radius = dimension("shape.radius.sm");
  for (const [oldStep, multiple] of [["xs", 0.5], ["sm", 1], ["md", 1.5], ["lg", 2], ["xl", 3], ["2xl", 4], ["3xl", 6], ["4xl", 8]] as const) {
    const old = dimension(`shape.radius.${oldStep}`); const expected = factor(old, radius, `shape.radius.${oldStep}`, warnings);
    if (oldStep !== "sm" && Math.abs(expected - multiple) > 0.0001) warnings.push({ path: `shape.radius.${oldStep}`, message: `v1 radius scale cannot be represented exactly by v2's fixed ${multiple}× radius scale.` });
  }
  return Object.freeze(next as Record<TokenPath, ThemeTokenInput>);
}

/** Converts a complete v1 standard theme to v2 without silently hiding geometry changes. */
export function migrateOriaStandardV1ToV2(input: unknown): ThemeMigrationResult {
  const checked = validateTheme(input, oriaStandardContractV1);
  if (!checked.ok) throw new OriaThemeError("INVALID_THEME", "A v1 standard theme is required for migration.", { details: { issues: checked.issues } });
  const warnings: MigrationWarning[] = [];
  const migrated: ThemeDefinition = { schemaVersion: 1, contract: { name: "oria-standard", version: 2 }, id: checked.value.id, name: checked.value.name, kind: checked.value.kind, modes: { light: convertModeTokens(checked.value, "light", warnings, resolvedDimensions(checked.value, "light")), dark: convertModeTokens(checked.value, "dark", warnings, resolvedDimensions(checked.value, "dark")) }, ...(checked.value.metadata === undefined ? {} : { metadata: checked.value.metadata }), ...(checked.value.createdAt === undefined ? {} : { createdAt: checked.value.createdAt }), ...(checked.value.updatedAt === undefined ? {} : { updatedAt: checked.value.updatedAt }) };
  const output = validateTheme(migrated, oriaStandardContract);
  if (!output.ok) throw new OriaThemeError("INVALID_THEME", "v1 migration did not produce a valid v2 theme.", { details: { issues: output.issues } });
  return Object.freeze({ theme: output.value, warnings: Object.freeze(warnings), requiresReview: warnings.length > 0 });
}

/**
 * The v1 default theme's geometry values are all literal, so the default v2 theme is
 * derived with pure token reads instead of the full validating migration. This keeps
 * module evaluation free of any resolution work.
 */
const literalDimension = (mode: "light" | "dark") => (path: string): string | undefined => valueFor(oriaDefaultThemeV1, mode, path) as string | undefined;
const migratedDefault: ThemeDefinition = { schemaVersion: 1, contract: { name: "oria-standard", version: 2 }, id: oriaDefaultThemeV1.id, name: oriaDefaultThemeV1.name, kind: oriaDefaultThemeV1.kind, modes: { light: convertModeTokens(oriaDefaultThemeV1, "light", [], literalDimension("light")), dark: convertModeTokens(oriaDefaultThemeV1, "dark", [], literalDimension("dark")) } };
const v2DefaultShared = (tokens: Readonly<Record<TokenPath, ThemeTokenInput>>): Readonly<Record<TokenPath, ThemeTokenInput>> => Object.freeze({ ...tokens,
  space: "0.25rem", radius: "0.25rem", "control.height.sm": 9, "control.height.md": 11, "control.height.lg": 13, "control.padding.x.sm": 3, "control.padding.x.md": 4, "control.padding.x.lg": 5,
  "leading.tight": 1.25, "leading.snug": 1.375, "leading.normal": 1.5, "leading.relaxed": 1.625, "leading.loose": 2,
  "tracking.tighter": "-0.05em", "tracking.tight": "-0.025em", "tracking.normal": "0em", "tracking.wide": "0.025em", "tracking.wider": "0.05em", "tracking.widest": "0.1em",
  "blur.xs": "4px", "blur.sm": "8px", "blur.md": "12px", "blur.lg": "16px", "blur.xl": "24px", "blur.2xl": "40px", "blur.3xl": "64px"
} as Record<TokenPath, ThemeTokenInput>);
/** The default preset using the published Tailwind-aligned geometry baseline. */
export const oriaDefaultTheme: ThemeDefinition = Object.freeze({ ...migratedDefault, modes: Object.freeze({ light: v2DefaultShared(migratedDefault.modes.light), dark: v2DefaultShared(migratedDefault.modes.dark) }) });

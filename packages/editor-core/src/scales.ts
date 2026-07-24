import type { ShadowLayer, ThemeTokenInput, TokenPath } from "@oriatheme/core";

const round = (value: number, precision = 3): number => Number(value.toFixed(precision));
const path = (value: string): TokenPath => value as TokenPath;

interface UnitValue { readonly value: number; readonly unit: string }
function unitValue(input: string, expected?: "duration"): UnitValue {
  if (input === "0") return { value: 0, unit: expected === "duration" ? "ms" : "rem" };
  const match = /^([-+]?(?:\d+|\d*\.\d+))(ms|s|px|rem|em|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/.exec(input.trim());
  if (!match) throw new Error(`Cannot derive a scale from ${input}.`);
  let value = Number(match[1]);
  let unit = match[2]!;
  if (expected === "duration" && unit === "s") { value *= 1000; unit = "ms"; }
  return { value, unit };
}
const formatted = (value: number, unit: string, precision = 3): string => `${round(value, precision)}${unit}`;

export type SmartScaleInput =
  | { readonly kind: "typeScale"; readonly base: string; readonly ratio?: number }
  | { readonly kind: "fontWeight"; readonly base: number }
  | { readonly kind: "spacing"; readonly unit: string }
  | { readonly kind: "v2Space"; readonly unit: string }
  | { readonly kind: "controlSize"; readonly height: string; readonly paddingInline: string }
  | { readonly kind: "v2ControlMultipliers"; readonly height: { readonly sm: number; readonly md: number; readonly lg: number }; readonly paddingX: { readonly sm: number; readonly md: number; readonly lg: number } }
  | { readonly kind: "radius"; readonly base: string }
  | { readonly kind: "v2Radius"; readonly base: string }
  | { readonly kind: "elevation"; readonly strength: number; readonly color?: string }
  | { readonly kind: "blur"; readonly base: string }
  | { readonly kind: "duration"; readonly base: string };

export interface DerivedTokenValue { readonly path: TokenPath; readonly value: ThemeTokenInput }
const values = (entries: readonly (readonly [string, ThemeTokenInput])[]): readonly DerivedTokenValue[] => Object.freeze(entries.map(([tokenPath, value]) => Object.freeze({ path: path(tokenPath), value })));

/** Deterministically expands a designer-facing master value into concrete contract token values. */
export function deriveSmartScale(input: SmartScaleInput): readonly DerivedTokenValue[] {
  if (input.kind === "v2Space") {
    const base = unitValue(input.unit);
    return values([["space", formatted(base.value, base.unit)]]);
  }
  if (input.kind === "v2Radius") {
    const base = unitValue(input.base);
    return values([["radius", formatted(base.value, base.unit)]]);
  }
  if (input.kind === "v2ControlMultipliers") {
    const multiplier = (value: number, path: string): number => {
      if (!Number.isInteger(value) || value < 1 || value > 24) throw new Error(`${path} must be an integer from 1 through 24.`);
      return value;
    };
    return values((["sm", "md", "lg"] as const).flatMap(size => [
      [`control.height.${size}`, multiplier(input.height[size], `control.height.${size}`)] as const,
      [`control.padding.x.${size}`, multiplier(input.paddingX[size], `control.padding.x.${size}`)] as const
    ]));
  }
  if (input.kind === "typeScale") {
    const base = unitValue(input.base); const ratio = input.ratio ?? 1.2;
    if (!(ratio > 1 && ratio <= 2)) throw new Error("Type scale ratio must be greater than 1 and at most 2.");
    const exponents = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return values(["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl"].map((step, index) => [`typography.size.${step}`, formatted(base.value * ratio ** exponents[index]!, base.unit)]));
  }
  if (input.kind === "fontWeight") {
    const base = Math.min(1000, Math.max(1, Math.round(input.base)));
    const weight = (offset: number): string => String(Math.min(1000, Math.max(1, Math.round((base + offset) / 10) * 10)));
    return values([["typography.weight.thin", weight(-300)], ["typography.weight.extraLight", weight(-200)], ["typography.weight.light", weight(-100)], ["typography.weight.normal", weight(0)], ["typography.weight.medium", weight(100)], ["typography.weight.semibold", weight(200)], ["typography.weight.bold", weight(300)], ["typography.weight.extraBold", weight(400)], ["typography.weight.black", weight(500)]]);
  }
  if (input.kind === "spacing") {
    const base = unitValue(input.unit); const steps = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
    return values([["spacing.unit", formatted(base.value, base.unit)], ...steps.map(step => [`spacing.${step}`, formatted(base.value * step, base.unit)] as const)]);
  }
  if (input.kind === "controlSize") {
    const height = unitValue(input.height); const padding = unitValue(input.paddingInline);
    if (height.unit !== padding.unit) throw new Error("Control height and padding must use the same unit.");
    return values([
      ["control.height.sm", formatted(height.value * 0.82, height.unit)], ["control.height.md", formatted(height.value, height.unit)], ["control.height.lg", formatted(height.value * 1.18, height.unit)],
      ["control.paddingInline.sm", formatted(padding.value * 0.75, padding.unit)], ["control.paddingInline.md", formatted(padding.value, padding.unit)], ["control.paddingInline.lg", formatted(padding.value * 1.25, padding.unit)]
    ]);
  }
  if (input.kind === "radius") {
    const base = unitValue(input.base);
    return values([["shape.radius.none", "0"], ["shape.radius.xs", formatted(base.value * 0.25, base.unit)], ["shape.radius.sm", formatted(base.value * 0.5, base.unit)], ["shape.radius.md", formatted(base.value, base.unit)], ["shape.radius.lg", formatted(base.value * 1.5, base.unit)], ["shape.radius.xl", formatted(base.value * 2, base.unit)], ["shape.radius.2xl", formatted(base.value * 3, base.unit)], ["shape.radius.3xl", formatted(base.value * 4, base.unit)], ["shape.radius.4xl", formatted(base.value * 5, base.unit)], ["shape.radius.full", "9999px"]]);
  }
  if (input.kind === "blur") {
    const base = unitValue(input.base);
    return values([["effect.blur.xs", formatted(base.value * 0.25, base.unit)], ["effect.blur.sm", formatted(base.value * 0.5, base.unit)], ["effect.blur.md", formatted(base.value, base.unit)], ["effect.blur.lg", formatted(base.value * 1.5, base.unit)], ["effect.blur.xl", formatted(base.value * 2.5, base.unit)], ["effect.blur.2xl", formatted(base.value * 4, base.unit)], ["effect.blur.3xl", formatted(base.value * 6.4, base.unit)], ["effect.backdropBlur.xs", formatted(base.value * 0.5, base.unit)], ["effect.backdropBlur.sm", formatted(base.value, base.unit)], ["effect.backdropBlur.md", formatted(base.value * 1.75, base.unit)], ["effect.backdropBlur.lg", formatted(base.value * 2.5, base.unit)], ["effect.backdropBlur.xl", formatted(base.value * 3.5, base.unit)], ["effect.backdropBlur.2xl", formatted(base.value * 5, base.unit)], ["effect.backdropBlur.3xl", formatted(base.value * 8, base.unit)]]);
  }
  if (input.kind === "duration") {
    const base = unitValue(input.base, "duration");
    return values([["motion.duration.instant", "0"], ["motion.duration.fast", formatted(base.value * 0.55, "ms", 0)], ["motion.duration.normal", formatted(base.value, "ms", 0)], ["motion.duration.slow", formatted(base.value * 1.65, "ms", 0)]]);
  }
  const strength = Math.min(2, Math.max(0, input.strength)); const color = input.color ?? "#00000026";
  const elevationSteps = [["none", 0], ["2xs", 0.5], ["xs", 1], ["sm", 2], ["md", 4], ["lg", 10], ["xl", 20], ["2xl", 28]] as const;
  return values(elevationSteps.map(([step, level]) => {
    const layers: readonly ShadowLayer[] = level === 0 ? [] : [{ x: "0", y: `${round(level * strength)}px`, blur: `${round((level * 1.8 + 2) * strength)}px`, spread: `${round(-level * 0.25 * strength)}px`, color }];
    return [`elevation.shadow.${step}`, layers] as const;
  }));
}

/** Preserves explicitly customized leaves when a master value is changed. */
export function preserveScaleOverrides(derived: readonly DerivedTokenValue[], current: Readonly<Record<TokenPath, ThemeTokenInput>>, customized: ReadonlySet<TokenPath>): readonly DerivedTokenValue[] {
  return Object.freeze(derived.map(entry => customized.has(entry.path) && current[entry.path] !== undefined ? Object.freeze({ path: entry.path, value: current[entry.path]! }) : entry));
}

import { oriaDefaultTheme } from "@oriatheme/core";
import type { ShadowLayer, ThemeDefinition, ThemeTokenInput, ThemeTokenSet, TokenPath } from "@oriatheme/core";
import type { PresetSpec, TokenOverrides } from "./preset-designs.js";
import { normalizePresetColors } from "./oklch.js";

function withOverrides(base: ThemeTokenSet, ...layers: readonly TokenOverrides[]): ThemeTokenSet {
  return Object.freeze(Object.assign({}, base, ...layers) as Record<TokenPath, ThemeTokenInput>);
}

const elevationSteps = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] as const;
const elevationFactors = [0.2, 0.34, 0.58, 1, 1.48, 2.02, 2.7] as const;

function scalePixelDimension(value: string, factor: number): string {
  const match = /^(-?(?:\d+|\d*\.\d+))px$/.exec(value);
  if (!match) return value;
  const scaled = Number((Number(match[1]) * factor).toFixed(2));
  return scaled === 0 ? "0" : `${scaled}px`;
}

function scaleShadow(layers: readonly ShadowLayer[], factor: number): readonly ShadowLayer[] {
  return layers.map(layer => layer.inset ? layer : {
    ...layer,
    x: scalePixelDimension(layer.x, factor),
    y: scalePixelDimension(layer.y, factor),
    blur: scalePixelDimension(layer.blur, factor),
    spread: scalePixelDimension(layer.spread, factor)
  });
}

/**
 * Presets own their complete elevation language. Missing sizes are derived from
 * the nearest explicit shadow instead of leaking Default's unrelated scale into
 * the theme. Inner shadows and highlights are material effects, so presets must
 * opt in to them explicitly.
 */
function completeElevationScale(...layers: readonly TokenOverrides[]): TokenOverrides {
  const tokens = Object.assign({}, ...layers) as Record<string, ThemeTokenInput>;
  const explicit = elevationSteps.map(step => tokens[`shadow.${step}`]);
  const anchors = explicit
    .map((value, index) => ({ value, index }))
    .filter((entry): entry is { value: readonly ShadowLayer[]; index: number } => Array.isArray(entry.value) && entry.value.length > 0);

  for (let index = 0; index < elevationSteps.length; index += 1) {
    const path = `shadow.${elevationSteps[index]}`;
    if (explicit[index] !== undefined) continue;
    const anchor = anchors.reduce<{ value: readonly ShadowLayer[]; index: number } | undefined>((nearest, candidate) => {
      if (!nearest) return candidate;
      return Math.abs(candidate.index - index) < Math.abs(nearest.index - index) ? candidate : nearest;
    }, undefined);
    tokens[path] = anchor
      ? scaleShadow(anchor.value, elevationFactors[index]! / elevationFactors[anchor.index]!)
      : [];
  }

  tokens["shadow.inner"] ??= [];
  tokens["shadow.highlight"] ??= [];
  return tokens;
}

function rgb(color: string): readonly [number, number, number] {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color);
  if (!match) throw new Error(`Preset feedback colors must be opaque six-digit hex values: ${color}.`);
  return [Number.parseInt(match[1]!, 16), Number.parseInt(match[2]!, 16), Number.parseInt(match[3]!, 16)];
}

function luminance(color: string): number {
  const channels = rgb(color).map(channel => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}

function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter! + 0.05) / (darker! + 0.05);
}

type ChartProfile = "cool" | "green" | "violet" | "warm" | "rose";
type AppearancePalette = Readonly<Record<ChartProfile, readonly string[]>>;

const chartPalettes: Readonly<Record<"light" | "dark", AppearancePalette>> = Object.freeze({
  light: Object.freeze({
    cool: ["#1488a4", "#1c8c85", "#1982bd", "#3675e2", "#626bdc", "#1f9058", "#d53740"],
    green: ["#1a8f6b", "#1c8c85", "#1982bd", "#5e8a0a", "#3675e2", "#c15701", "#d53740"],
    violet: ["#626bdc", "#7d60db", "#9756cc", "#bc3cae", "#3675e2", "#d53740", "#c15701"],
    warm: ["#c15701", "#a36e09", "#b49a24", "#cc415d", "#d53740", "#3675e2", "#1c8c85"],
    rose: ["#cc415d", "#cb397e", "#bc3cae", "#7d60db", "#3675e2", "#c15701", "#1f9058"]
  }),
  dark: Object.freeze({
    cool: ["#48a9c7", "#4caea6", "#52a4db", "#5f99fe", "#8390f8", "#56b17c", "#f46767"],
    green: ["#4bb18c", "#4caea6", "#52a4db", "#a3ca75", "#5f99fe", "#fba171", "#f46767"],
    violet: ["#8390f8", "#baaefd", "#d1a3fd", "#f394e5", "#5f99fe", "#f46767", "#fba171"],
    warm: ["#fba171", "#e5b064", "#d1ba5e", "#fc9aa6", "#f46767", "#5f99fe", "#4caea6"],
    rose: ["#eb6c80", "#fb97bd", "#f394e5", "#baaefd", "#5f99fe", "#fba171", "#56b17c"]
  })
});

const lightFeedback = Object.freeze(["#d53740", "#1f9058", "#c15701", "#1982bd"] as const);
const darkFeedback = Object.freeze(["#f46767", "#56b17c", "#fba171", "#52a4db"] as const);

function isMonochrome(colors: readonly string[]): boolean {
  return colors.every(color => {
    const [red, green, blue] = rgb(color);
    return red === green && green === blue;
  });
}

const oklchChannels = (color: string): readonly [number, number] | null => {
  const match = /^oklch\(\s*[\d.]+%\s+([\d.]+)\s+(-?[\d.]+)/i.exec(color);
  return match ? [Number.parseFloat(match[1]!), Number.parseFloat(match[2]!)] : null;
};

function isGrayscale(color: string): boolean {
  const oklch = oklchChannels(color);
  if (oklch) return oklch[0] < 0.000004;
  const [red, green, blue] = rgb(color);
  return red === green && green === blue;
}

function isDarkSurface(color: string): boolean {
  return luminance(color) < 0.2;
}

function hue(color: string): number | null {
  const oklch = oklchChannels(color);
  if (oklch) return (oklch[1] % 360 + 360) % 360;
  const [rawRed, rawGreen, rawBlue] = rgb(color);
  const red = rawRed! / 255;
  const green = rawGreen! / 255;
  const blue = rawBlue! / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const delta = maximum - minimum;
  if (delta < 0.08) return null;
  const raw = maximum === red ? (green - blue) / delta : maximum === green ? (blue - red) / delta + 2 : (red - green) / delta + 4;
  return (raw * 60 + 360) % 360;
}

function chartProfile(primary: string): ChartProfile {
  const value = hue(primary);
  if (value === null) return "cool";
  if (value >= 70 && value < 170) return "green";
  if (value >= 245 && value < 345) return "violet";
  if (value >= 15 && value < 70) return "warm";
  if (value >= 345 || value < 15) return "rose";
  return "cool";
}

function chartColors(colors: PresetSpec["modes"]["light"]["colors"]): readonly string[] {
  if (isMonochrome(colors.charts)) return colors.charts;
  const primary = colors.primary[0];
  const palette = chartPalettes[isDarkSurface(colors.background) ? "dark" : "light"][chartProfile(primary)];
  const candidates = [...palette, ...chartPalettes[isDarkSurface(colors.background) ? "dark" : "light"].cool];
  const distinct = candidates.filter((color, index) => color !== primary && candidates.indexOf(color) === index);
  return [primary, ...distinct.slice(0, 7)];
}

function feedbackOverrides(colors: PresetSpec["modes"]["light"]["colors"]): TokenOverrides {
  const foregroundFor = (background: string): string => {
    const candidates = [colors.foreground, colors.background, "#000000", "#ffffff"];
    return candidates.reduce((best, candidate) => contrastRatio(background, candidate) > contrastRatio(background, best) ? candidate : best);
  };
  const [destructive, success, warning, info] = isMonochrome(colors.charts)
    ? [colors.charts[0]!, colors.charts[2]!, colors.charts[4]!, colors.charts[6]!]
    : isGrayscale(colors.primary[0])
      ? [colors.charts[0]!, colors.charts[1]!, colors.charts[2]!, colors.charts[3]!]
      : isDarkSurface(colors.background) ? darkFeedback : lightFeedback;
  return {
    "color.danger": destructive,
    "color.danger.fg": foregroundFor(destructive),
    "color.success": success,
    "color.success.fg": foregroundFor(success),
    "color.warning": warning,
    "color.warning.fg": foregroundFor(warning),
    "color.info": info,
    "color.info.fg": foregroundFor(info)
  };
}

function colorOverrides(colors: PresetSpec["modes"]["light"]["colors"]): TokenOverrides {
  return {
    "color.bg": colors.background,
    "color.fg": colors.foreground,
    "color.surface": colors.surface,
    "color.surface.fg": colors.foreground,
    "color.surface.raised": colors.raised,
    "color.surface.raised.fg": colors.foreground,
    "color.overlay": colors.overlay ?? colors.raised,
    "color.overlay.fg": colors.foreground,
    "color.primary": colors.primary[0],
    "color.primary.hover": colors.primary[1],
    "color.primary.active": colors.primary[2],
    "color.primary.fg": colors.primary[3],
    "color.secondary": colors.secondary[0],
    "color.secondary.hover": colors.secondary[1],
    "color.secondary.active": colors.secondary[2],
    "color.secondary.fg": colors.secondary[3],
    "color.muted": colors.muted[0],
    "color.muted.fg": colors.muted[1],
    "color.accent": colors.accent[0],
    "color.accent.fg": colors.accent[1],
    "color.border": colors.border[0],
    "color.border.strong": colors.border[1],
    "color.input": colors.input ?? colors.raised,
    "color.ring": colors.ring,
    "color.selection": colors.selection[0],
    "color.selection.fg": colors.selection[1],
    "color.scrim": colors.scrim ?? "#00000080",
    ...Object.fromEntries(chartColors(colors).map((color, index) => [`color.chart.${index + 1}`, color])),
    ...feedbackOverrides(colors)
  };
}

export function createPreset(spec: PresetSpec): ThemeDefinition {
  const modeTokens = (mode: "light" | "dark"): ThemeTokenSet => {
    const design = spec.modes[mode];
    return normalizePresetColors(withOverrides(
      oriaDefaultTheme.modes[mode],
      colorOverrides(design.colors),
      completeElevationScale(spec.tokens, design.tokens ?? {})
    ));
  };
  return Object.freeze({
    ...oriaDefaultTheme,
    id: spec.id,
    name: spec.name,
    kind: "preset",
    modes: Object.freeze({
      light: modeTokens("light"),
      dark: modeTokens("dark")
    })
  });
}

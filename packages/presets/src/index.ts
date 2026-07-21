import { oriaDefaultTheme } from "@oriatheme/core";
import type { ThemeDefinition, ThemeTokenInput, ThemeTokenSet, TokenPath } from "@oriatheme/core";
import { presetSpecs } from "./preset-designs.js";
import type { PresetCategory, PresetSpec, TokenOverrides } from "./preset-designs.js";

export type { PresetCategory } from "./preset-designs.js";

export interface PresetCatalogEntry {
  readonly theme: ThemeDefinition;
  readonly category: PresetCategory;
}

function withOverrides(base: ThemeTokenSet, ...layers: readonly TokenOverrides[]): ThemeTokenSet {
  return Object.freeze(Object.assign({}, base, ...layers) as Record<TokenPath, ThemeTokenInput>);
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

function isGrayscale(color: string): boolean {
  const [red, green, blue] = rgb(color);
  return red === green && green === blue;
}

function isDarkSurface(color: string): boolean {
  return luminance(color) < 0.2;
}

function hue(color: string): number | null {
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
    "color.destructive": destructive,
    "color.destructiveForeground": foregroundFor(destructive),
    "color.success": success,
    "color.successForeground": foregroundFor(success),
    "color.warning": warning,
    "color.warningForeground": foregroundFor(warning),
    "color.info": info,
    "color.infoForeground": foregroundFor(info)
  };
}

function colorOverrides(colors: PresetSpec["modes"]["light"]["colors"]): TokenOverrides {
  return {
    "color.background": colors.background,
    "color.foreground": colors.foreground,
    "color.surface": colors.surface,
    "color.surfaceForeground": colors.foreground,
    "color.surfaceRaised": colors.raised,
    "color.surfaceRaisedForeground": colors.foreground,
    "color.overlay": colors.overlay ?? colors.raised,
    "color.overlayForeground": colors.foreground,
    "color.primary": colors.primary[0],
    "color.primaryHover": colors.primary[1],
    "color.primaryActive": colors.primary[2],
    "color.primaryForeground": colors.primary[3],
    "color.secondary": colors.secondary[0],
    "color.secondaryHover": colors.secondary[1],
    "color.secondaryActive": colors.secondary[2],
    "color.secondaryForeground": colors.secondary[3],
    "color.muted": colors.muted[0],
    "color.mutedForeground": colors.muted[1],
    "color.accent": colors.accent[0],
    "color.accentForeground": colors.accent[1],
    "color.border": colors.border[0],
    "color.borderStrong": colors.border[1],
    "color.input": colors.input ?? colors.raised,
    "color.ring": colors.ring,
    "color.selection": colors.selection[0],
    "color.selectionForeground": colors.selection[1],
    "color.scrim": colors.scrim ?? "#00000080",
    ...Object.fromEntries(chartColors(colors).map((color, index) => [`color.chart${index + 1}`, color])),
    ...feedbackOverrides(colors)
  };
}

function createPreset(spec: PresetSpec): ThemeDefinition {
  return Object.freeze({
    ...oriaDefaultTheme,
    id: spec.id,
    name: spec.name,
    kind: "preset",
    modes: Object.freeze({
      light: withOverrides(oriaDefaultTheme.modes.light, spec.tokens, colorOverrides(spec.modes.light.colors), spec.modes.light.tokens ?? {}),
      dark: withOverrides(oriaDefaultTheme.modes.dark, spec.tokens, colorOverrides(spec.modes.dark.colors), spec.modes.dark.tokens ?? {})
    })
  });
}

const themes = presetSpecs.map(createPreset);
const themeById = new Map(themes.map(theme => [theme.id, theme]));

function theme(id: string): ThemeDefinition {
  const value = themeById.get(id);
  if (!value) throw new Error(`Missing official preset ${id}.`);
  return value;
}

/** Cool aquatic depth, cyan highlights, and flowing geometry. */
export const oriaOceanTheme = theme("oria-ocean");
/** Botanical greens, warm natural surfaces, and organic geometry. */
export const oriaForestTheme = theme("oria-forest");
/** Existing stable aurora preset, redesigned around real auroral green, cyan, violet, and red. */
export const oriaAuroraTheme = theme("oria-aurora");
export const oriaWarmReadingTheme = theme("oria-warm-reading");
export const oriaMonochromeDeployTheme = theme("oria-monochrome-deploy");
export const oriaPrecisionFlowTheme = theme("oria-precision-flow");
export const oriaManuscriptTheme = theme("oria-manuscript");
export const oriaElevatedSurfaceTheme = theme("oria-elevated-surface");
export const oriaBentoUiTheme = theme("oria-bento-ui");
export const oriaDashboardTheme = theme("oria-dashboard");
export const oriaEditorialTheme = theme("oria-editorial");
export const oriaAiNativeTheme = theme("oria-ai-native");
export const oriaCommandCenterTheme = theme("oria-command-center");
export const oriaSpatialUiTheme = theme("oria-spatial-ui");
export const oriaMonoTheme = theme("oria-mono");
export const oriaMinimalismTheme = theme("oria-minimalism");
export const oriaLineArtTheme = theme("oria-line-art");
export const oriaGlassTheme = theme("oria-glass");
export const oriaNeoBrutalismTheme = theme("oria-neo-brutalism");
/** Warm paper dashboards, ink outlines, and high-contrast stat cards. */
export const oriaPunchcardTheme = theme("oria-punchcard");
/** Inked paper, hand-drawn type, and pastel studio-note accents. */
export const oriaSketchbookTheme = theme("oria-sketchbook");
/** Thick, rounded cream surfaces with directional clay highlights and shadows. */
export const oriaSoftClayTheme = theme("oria-soft-clay");
/** Sunlit gold, coral, and indigo storefront surfaces with generous soft corners. */
export const oriaGoldenBazaarTheme = theme("oria-golden-bazaar");
/** Quiet mathematical paper, charcoal serif typography, and wine-red annotation accents. */
export const oriaTheoremTheme = theme("oria-theorem");
export const oriaNeumorphismTheme = theme("oria-neumorphism");
export const oriaMemphisTheme = theme("oria-memphis");
export const oriaSoftUiTheme = theme("oria-soft-ui");
export const oriaCyberpunkTheme = theme("oria-cyberpunk");
export const oriaY2kTheme = theme("oria-y2k");
export const oriaRetroTerminalTheme = theme("oria-retro-terminal");
export const oriaPaperTheme = theme("oria-paper");
export const oriaCalmTheme = theme("oria-calm");
export const oriaPlayfulTheme = theme("oria-playful");
export const oriaPremiumTheme = theme("oria-premium");
export const oriaOrganicTheme = theme("oria-organic");
export const oriaCottagecoreTheme = theme("oria-cottagecore");
export const oriaNatureTheme = theme("oria-nature");
export const oriaRetroTheme = theme("oria-retro");
export const oriaKawaiiTheme = theme("oria-kawaii");
export const oriaSunsetTheme = theme("oria-sunset");

/** The complete collection for direct use as runtime presets. */
export const oriaPresetThemes: readonly ThemeDefinition[] = Object.freeze([oriaDefaultTheme, ...themes]);

/** Minimal runtime catalog; descriptive and workflow metadata lives in documentation. */
export const oriaPresetCatalog: readonly PresetCatalogEntry[] = Object.freeze([
  Object.freeze({ theme: oriaDefaultTheme, category: "oria" }),
  ...presetSpecs.map(spec => Object.freeze({ theme: theme(spec.id), category: spec.category }))
]);

export { oriaDefaultTheme };

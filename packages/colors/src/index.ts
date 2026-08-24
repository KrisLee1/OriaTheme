/** Stable family names supported by Tailwind CSS's default color utilities. */
export const oriaColorFamilies = Object.freeze([
  "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue",
  "indigo", "violet", "purple", "fuchsia", "pink", "rose", "slate", "gray", "zinc", "neutral", "stone",
  "mauve", "olive", "mist", "taupe"
] as const);

/** Stable shade names supported by Tailwind CSS's default color utilities. */
export const oriaColorSteps = Object.freeze([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const);

export type OriaColorFamily = typeof oriaColorFamilies[number];
export type OriaColorStep = typeof oriaColorSteps[number];
export type OriaOklchColor = `oklch(${string})`;
export type OriaColorScale = Readonly<Record<OriaColorStep, OriaOklchColor>>;
export type OriaColors = Readonly<Record<OriaColorFamily, OriaColorScale>> & Readonly<{
  black: "oklch(0% 0 0)";
  white: "oklch(100% 0 0)";
  inherit: "inherit";
  transparent: "transparent";
  current: "currentColor";
}>;

const seeds: Readonly<Record<OriaColorFamily, string>> = Object.freeze({
  red: "#e5484d", orange: "#f27a2e", amber: "#e59d15", yellow: "#d4b300", lime: "#82b536",
  green: "#2e9b62", emerald: "#159c74", teal: "#14978f", cyan: "#1697b7", sky: "#278bc7",
  blue: "#3978e6", indigo: "#5b63d3", violet: "#795bd6", purple: "#9251c7", fuchsia: "#c343b5",
  pink: "#d9478a", rose: "#dc506a", slate: "#64748b", gray: "#6b7280", zinc: "#71717a",
  neutral: "#737373", stone: "#78716c", mauve: "#786e78", olive: "#747765", mist: "#66777b", taupe: "#786e69"
});

interface Oklch { readonly l: number; readonly c: number; readonly h: number }
const targetLightness = Object.freeze([0.97, 0.935, 0.875, 0.79, 0.69, 0.58, 0.52, 0.47, 0.41, 0.35, 0.29]);
const chromaFactors = Object.freeze([0.2, 0.34, 0.53, 0.73, 0.9, 1, 0.98, 0.94, 0.88, 0.82, 0.72]);

const linear = (value: number): number => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
const gamma = (value: number): number => value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;

function toOklch(hex: string): Oklch {
  const channels = [1, 3, 5].map(index => Number.parseInt(hex.slice(index, index + 2), 16) / 255).map(linear);
  const red = channels[0]!; const green = channels[1]!; const blue = channels[2]!;
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const b = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: lightness, c: Math.sqrt(a * a + b * b), h: Math.atan2(b, a) };
}

function toLinearRgb({ l, c, h }: Oklch): readonly [number, number, number] {
  const a = c * Math.cos(h); const b = c * Math.sin(h);
  const ll = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const ss = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss,
    -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss,
    -0.0041960863 * ll - 0.7034186147 * mm + 1.707614701 * ss
  ];
}

const numberString = (value: number, precision: number): string => String(Number(value.toFixed(precision)));

function gamutMappedOklch(color: Oklch): OriaOklchColor {
  let chroma = color.c;
  let rgb = toLinearRgb(color);
  for (let attempt = 0; attempt < 32 && rgb.some(channel => channel < 0 || channel > 1); attempt += 1) {
    chroma *= 0.92;
    rgb = toLinearRgb({ ...color, c: chroma });
  }
  const previousHex = `#${rgb.map(channel => Math.round(Math.min(1, Math.max(0, gamma(channel))) * 255).toString(16).padStart(2, "0")).join("")}`;
  const quantized = toOklch(previousHex);
  const hue = ((quantized.h * 180 / Math.PI) % 360 + 360) % 360;
  return `oklch(${numberString(quantized.l * 100, 5)}% ${numberString(quantized.c, 6)} ${numberString(quantized.c < 0.000004 ? 0 : hue, 4)})`;
}

function scale(seed: string): OriaColorScale {
  const source = toOklch(seed);
  const neutralChroma = source.c < 0.05 ? Math.min(source.c, 0.025) : source.c;
  return Object.freeze(Object.fromEntries(oriaColorSteps.map((step, index) => [
    step,
    gamutMappedOklch({ l: targetLightness[index]!, c: neutralChroma * chromaFactors[index]!, h: source.h })
  ])) as Record<OriaColorStep, OriaOklchColor>);
}

const scales = Object.fromEntries(oriaColorFamilies.map(family => [family, scale(seeds[family])])) as Record<OriaColorFamily, OriaColorScale>;

/**
 * The complete Oria base library. Values are independent from Tailwind; only
 * family/step topology is compatible with Tailwind's standard color classes.
 */
export const oriaColors: OriaColors = Object.freeze({
  ...scales,
  black: "oklch(0% 0 0)",
  white: "oklch(100% 0 0)",
  inherit: "inherit",
  transparent: "transparent",
  current: "currentColor"
});

/** Returns the stable CSS custom-property name for a base-library color. */
export function toOriaColorVariable(family: OriaColorFamily, step: OriaColorStep): `--oria-palette-${OriaColorFamily}-${OriaColorStep}` {
  return `--oria-palette-${family}-${step}`;
}

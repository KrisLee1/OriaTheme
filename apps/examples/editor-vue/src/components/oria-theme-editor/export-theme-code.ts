import type { ThemeDefinition } from "@oriatheme/core";

const HEX = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;
const linear = (value: number): number => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
const numberString = (value: number, precision: number): string => String(Number((Math.abs(value) < 10 ** -precision ? 0 : value).toFixed(precision)));

function hexToOklch(value: string): string {
  if (!HEX.test(value)) return value;
  const source = value.slice(1);
  const expanded = source.length === 3 || source.length === 4 ? [...source].map(character => character.repeat(2)).join("") : source;
  const channels = [0, 2, 4].map(index => linear(Number.parseInt(expanded.slice(index, index + 2), 16) / 255));
  const red = channels[0]!; const green = channels[1]!; const blue = channels[2]!;
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const b = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.sqrt(a * a + b * b);
  const hue = chroma < 0.000004 ? 0 : ((Math.atan2(b, a) * 180 / Math.PI) % 360 + 360) % 360;
  const alpha = expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1;
  return `oklch(${numberString(lightness * 100, 5)}% ${numberString(chroma, 6)} ${numberString(hue, 4)}${alpha < 0.999999 ? ` / ${numberString(alpha, 5)}` : ""})`;
}

function normalizeHexColors(value: unknown): unknown {
  if (typeof value === "string") return hexToOklch(value);
  if (Array.isArray(value)) return value.map(normalizeHexColors);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeHexColors(item)]));
  }
  return value;
}

function normalizeThemeColors(theme: ThemeDefinition): ThemeDefinition {
  const normalizeMode = (mode: ThemeDefinition["modes"]["light"]): ThemeDefinition["modes"]["light"] => Object.fromEntries(
    Object.entries(mode).map(([path, value]) => [
      path,
      path.startsWith("color.") || path.startsWith("shadow.") || path.startsWith("elevation.shadow.") || path.startsWith("gradient.") || path.startsWith("pattern.")
        ? normalizeHexColors(value)
        : value,
    ]),
  ) as ThemeDefinition["modes"]["light"];
  return { ...theme, modes: { light: normalizeMode(theme.modes.light), dark: normalizeMode(theme.modes.dark) } };
}

function themeExportName(id: string): string {
  const parts = id.split(/[^a-z0-9]+/iu).filter(Boolean);
  const base = parts.map((part, index) => index === 0 ? part.toLowerCase() : `${part[0]?.toUpperCase() ?? ""}${part.slice(1).toLowerCase()}`).join("") || "custom";
  return base.endsWith("Theme") ? base : `${base}Theme`;
}

/** Formats an editor draft as paste-ready TypeScript with OKLCH color literals. */
export function exportThemeCode(theme: ThemeDefinition): string {
  return `import type { ThemeDefinition } from "@oriatheme/core";\n\nexport const ${themeExportName(theme.id)} = ${JSON.stringify(normalizeThemeColors(theme), null, 2)} satisfies ThemeDefinition;\n`;
}

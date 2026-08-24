import type { ThemeTokenInput, ThemeTokenSet, TokenPath } from "@oriatheme/core";

const HEX = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;
const linear = (value: number): number => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
const numberString = (value: number, precision: number): string => String(Number((Math.abs(value) < 10 ** -precision ? 0 : value).toFixed(precision)));

export function hexToOklch(value: string): string {
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

function convertValue(value: ThemeTokenInput): ThemeTokenInput {
  if (typeof value === "string") return hexToOklch(value);
  if (Array.isArray(value)) return value.map(item => convertValue(item as ThemeTokenInput)) as ThemeTokenInput;
  if (value !== null && typeof value === "object") {
    if ("$ref" in value) return value;
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, convertValue(item as ThemeTokenInput)])) as unknown as ThemeTokenInput;
  }
  return value;
}

export function normalizePresetColors(tokens: ThemeTokenSet): ThemeTokenSet {
  return Object.freeze(Object.fromEntries(Object.entries(tokens).map(([path, value]) => [path, convertValue(value)])) as Record<TokenPath, ThemeTokenInput>);
}

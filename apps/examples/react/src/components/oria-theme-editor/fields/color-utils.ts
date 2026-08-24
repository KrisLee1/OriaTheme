const HEX = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;
const RGB = /^rgba?\(\s*(?:\d{1,3}%?\s*,\s*){2}\d{1,3}%?(?:\s*[,/]\s*(?:0|1|0?\.\d+|\d{1,3}%))?\s*\)$/i;
const HSL = /^hsla?\(\s*[-+]?\d+(?:\.\d+)?(?:deg|rad|turn)?\s*(?:,|\s)\s*\d+(?:\.\d+)?%\s*(?:,|\s)\s*\d+(?:\.\d+)?%(?:\s*[,/]\s*(?:0|1|0?\.\d+|\d{1,3}%))?\s*\)$/i;
const OKLCH = /^oklch\(\s*([^\s/]+)\s+([^\s/]+)\s+([^\s/]+)(?:\s*\/\s*([^\s/]+))?\s*\)$/i;
const NAMED = new Set(["transparent", "currentcolor", "black", "white", "red", "green", "blue", "gray", "grey", "yellow", "purple", "orange", "pink", "brown"]);

interface OklchColor { readonly lightness: number; readonly chroma: number; readonly hue: number }
const clamp = (value: number): number => Math.min(1, Math.max(0, value));
const component = (value: string, percentageScale: number): number | undefined => {
  if (!/^[-+]?(?:\d+|\d*\.\d+)%?$/u.test(value)) return undefined;
  const percentage = value.endsWith("%");
  const number = Number.parseFloat(percentage ? value.slice(0, -1) : value);
  return Number.isFinite(number) ? (percentage ? number / 100 * percentageScale : number) : undefined;
};
const hueDegrees = (value: string): number | undefined => {
  const match = /^([-+]?(?:\d+|\d*\.\d+))(deg|grad|rad|turn)?$/i.exec(value);
  if (!match) return undefined;
  const number = Number(match[1]);
  if (!Number.isFinite(number)) return undefined;
  const degrees = match[2]?.toLowerCase() === "grad" ? number * 0.9 : match[2]?.toLowerCase() === "rad" ? number * 180 / Math.PI : match[2]?.toLowerCase() === "turn" ? number * 360 : number;
  return ((degrees % 360) + 360) % 360;
};
function parseOklch(value: string): OklchColor | undefined {
  const match = OKLCH.exec(value);
  if (!match) return undefined;
  const lightness = component(match[1]!, 1); const chroma = component(match[2]!, 0.4); const hue = hueDegrees(match[3]!); const alpha = match[4] === undefined ? 1 : component(match[4], 1);
  return lightness !== undefined && lightness >= 0 && lightness <= 1 && chroma !== undefined && chroma >= 0 && hue !== undefined && alpha !== undefined && alpha >= 0 && alpha <= 1 ? { lightness, chroma, hue } : undefined;
}

export const safeColor = (value: string): boolean => value.length > 0
  && value.length < 512
  && !/[;{}<>]/.test(value)
  && !/\b(?:url|var|expression)\s*\(/i.test(value)
  && (HEX.test(value) || RGB.test(value) || HSL.test(value) || parseOklch(value) !== undefined || NAMED.has(value.toLowerCase()));

export const previewColor = (value: unknown, fallback = "transparent"): string => typeof value === "string" && safeColor(value) ? value : fallback;

export function nativeColor(value: string, fallback = "#000000"): string {
  if (HEX.test(value)) {
    const hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) return `#${hex.slice(0, 3).split("").map(character => character.repeat(2)).join("")}`;
    return `#${hex.slice(0, 6)}`;
  }
  const color = parseOklch(value);
  if (!color) return fallback;
  const angle = color.hue * Math.PI / 180;
  const a = color.chroma * Math.cos(angle); const b = color.chroma * Math.sin(angle);
  const l = (color.lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (color.lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (color.lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const gamma = (channel: number): number => channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
  const channel = (linear: number): string => Math.round(clamp(gamma(linear)) * 255).toString(16).padStart(2, "0");
  return `#${channel(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)}${channel(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)}${channel(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)}`;
}

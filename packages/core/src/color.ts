interface StaticColor {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
  readonly alpha: number;
}

interface OklchColor {
  readonly lightness: number;
  readonly chroma: number;
  readonly hue: number;
  readonly alpha: number;
}

const HEX = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;
const RGB = /^rgba?\(\s*(?:\d{1,3}%?\s*,\s*){2}\d{1,3}%?(?:\s*[,/]\s*(?:0|1|0?\.\d+|\d{1,3}%))?\s*\)$/i;
const HSL = /^hsla?\(\s*[-+]?\d+(?:\.\d+)?(?:deg|rad|turn)?\s*(?:,|\s)\s*\d+(?:\.\d+)?%\s*(?:,|\s)\s*\d+(?:\.\d+)?%(?:\s*[,/]\s*(?:0|1|0?\.\d+|\d{1,3}%))?\s*\)$/i;
const OKLCH = /^oklch\(\s*([^\s/]+)\s+([^\s/]+)\s+([^\s/]+)(?:\s*\/\s*([^\s/]+))?\s*\)$/i;
const NAMED = new Set(["transparent", "currentcolor", "black", "white", "red", "green", "blue", "gray", "grey", "yellow", "purple", "orange", "pink", "brown"]);
const NAMED_RGB: Readonly<Record<string, readonly [number, number, number]>> = Object.freeze({
  black: [0, 0, 0], white: [1, 1, 1], red: [1, 0, 0], green: [0, 128 / 255, 0], blue: [0, 0, 1],
  gray: [128 / 255, 128 / 255, 128 / 255], grey: [128 / 255, 128 / 255, 128 / 255], yellow: [1, 1, 0],
  purple: [128 / 255, 0, 128 / 255], orange: [1, 165 / 255, 0], pink: [1, 192 / 255, 203 / 255], brown: [165 / 255, 42 / 255, 42 / 255]
});

const clamp = (value: number, minimum = 0, maximum = 1): number => Math.min(maximum, Math.max(minimum, value));
const linear = (value: number): number => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
const gamma = (value: number): number => value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
const finite = (value: number): boolean => Number.isFinite(value);

function percentageOrNumber(value: string, percentageScale: number): number | undefined {
  if (!/^[-+]?(?:\d+|\d*\.\d+)%?$/u.test(value)) return undefined;
  const percentage = value.endsWith("%");
  const number = Number.parseFloat(percentage ? value.slice(0, -1) : value);
  if (!finite(number)) return undefined;
  return percentage ? number / 100 * percentageScale : number;
}

function alphaValue(value: string | undefined): number | undefined {
  if (value === undefined) return 1;
  const alpha = percentageOrNumber(value, 1);
  return alpha !== undefined && alpha >= 0 && alpha <= 1 ? alpha : undefined;
}

function hueDegrees(value: string): number | undefined {
  const match = /^([-+]?(?:\d+|\d*\.\d+))(deg|grad|rad|turn)?$/i.exec(value);
  if (!match) return undefined;
  const number = Number(match[1]);
  if (!finite(number)) return undefined;
  const degrees = match[2]?.toLowerCase() === "grad" ? number * 0.9
    : match[2]?.toLowerCase() === "rad" ? number * 180 / Math.PI
      : match[2]?.toLowerCase() === "turn" ? number * 360
        : number;
  return ((degrees % 360) + 360) % 360;
}

function parseOklch(value: string): OklchColor | undefined {
  const match = OKLCH.exec(value);
  if (!match) return undefined;
  const lightness = percentageOrNumber(match[1]!, 1);
  const chroma = percentageOrNumber(match[2]!, 0.4);
  const hue = hueDegrees(match[3]!);
  const alpha = alphaValue(match[4]);
  if (lightness === undefined || lightness < 0 || lightness > 1 || chroma === undefined || chroma < 0 || hue === undefined || alpha === undefined) return undefined;
  return { lightness, chroma, hue, alpha };
}

function oklchToSrgb(color: OklchColor): StaticColor {
  const angle = color.hue * Math.PI / 180;
  const a = color.chroma * Math.cos(angle);
  const b = color.chroma * Math.sin(angle);
  const l = (color.lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (color.lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (color.lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    red: clamp(gamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)),
    green: clamp(gamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)),
    blue: clamp(gamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)),
    alpha: color.alpha
  };
}

function srgbToOklch(color: StaticColor): OklchColor {
  const red = linear(color.red); const green = linear(color.green); const blue = linear(color.blue);
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const b = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.sqrt(a * a + b * b);
  const hue = chroma < 0.000004 ? 0 : ((Math.atan2(b, a) * 180 / Math.PI) % 360 + 360) % 360;
  return { lightness, chroma, hue, alpha: color.alpha };
}

function parseHex(value: string): StaticColor | undefined {
  if (!HEX.test(value)) return undefined;
  const source = value.slice(1);
  const expanded = source.length === 3 || source.length === 4 ? [...source].map(character => character.repeat(2)).join("") : source;
  return {
    red: Number.parseInt(expanded.slice(0, 2), 16) / 255,
    green: Number.parseInt(expanded.slice(2, 4), 16) / 255,
    blue: Number.parseInt(expanded.slice(4, 6), 16) / 255,
    alpha: expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1
  };
}

function parseRgb(value: string): StaticColor | undefined {
  if (!RGB.test(value)) return undefined;
  const parts = value.slice(value.indexOf("(") + 1, -1).split(/\s*[,/]\s*/u);
  const channel = (part: string): number => clamp(part.endsWith("%") ? Number.parseFloat(part) / 100 : Number.parseFloat(part) / 255);
  const alpha = alphaValue(parts[3]);
  if (parts.length < 3 || alpha === undefined) return undefined;
  return { red: channel(parts[0]!), green: channel(parts[1]!), blue: channel(parts[2]!), alpha };
}

function parseHsl(value: string): StaticColor | undefined {
  if (!HSL.test(value)) return undefined;
  const parts = value.slice(value.indexOf("(") + 1, -1).trim().split(/\s*(?:,|\/)\s*|\s+/u).filter(Boolean);
  const hue = hueDegrees(parts[0]!);
  const saturation = percentageOrNumber(parts[1]!, 1);
  const lightness = percentageOrNumber(parts[2]!, 1);
  const alpha = alphaValue(parts[3]);
  if (hue === undefined || saturation === undefined || lightness === undefined || alpha === undefined) return undefined;
  const chroma = (1 - Math.abs(2 * clamp(lightness) - 1)) * clamp(saturation);
  const section = hue / 60;
  const x = chroma * (1 - Math.abs(section % 2 - 1));
  const [red, green, blue] = section < 1 ? [chroma, x, 0] : section < 2 ? [x, chroma, 0] : section < 3 ? [0, chroma, x] : section < 4 ? [0, x, chroma] : section < 5 ? [x, 0, chroma] : [chroma, 0, x];
  const offset = clamp(lightness) - chroma / 2;
  return { red: red + offset, green: green + offset, blue: blue + offset, alpha };
}

export function isColorValue(value: string): boolean {
  const lower = value.toLowerCase();
  return HEX.test(value) || RGB.test(value) || HSL.test(value) || parseOklch(value) !== undefined || NAMED.has(lower);
}

export function parseStaticColor(value: string): StaticColor | undefined {
  const lower = value.trim().toLowerCase();
  if (lower === "currentcolor") return undefined;
  if (lower === "transparent") return { red: 0, green: 0, blue: 0, alpha: 0 };
  const named = NAMED_RGB[lower];
  if (named) return { red: named[0], green: named[1], blue: named[2], alpha: 1 };
  return parseHex(value) ?? parseRgb(value) ?? parseHsl(value) ?? (parseOklch(value) ? oklchToSrgb(parseOklch(value)!) : undefined);
}

function numberString(value: number, precision: number): string {
  const rounded = Math.abs(value) < 10 ** -precision ? 0 : Number(value.toFixed(precision));
  return String(rounded);
}

export function formatOklch(color: OklchColor): string {
  const lightness = numberString(clamp(color.lightness) * 100, 5);
  const chroma = numberString(Math.max(0, color.chroma), 6);
  const hue = numberString(color.chroma < 0.000004 ? 0 : ((color.hue % 360) + 360) % 360, 4);
  const alpha = clamp(color.alpha);
  return `oklch(${lightness}% ${chroma} ${hue}${alpha < 0.999999 ? ` / ${numberString(alpha, 5)}` : ""})`;
}

export function toOklchColor(value: string): string | undefined {
  const parsed = parseStaticColor(value);
  return parsed ? formatOklch(srgbToOklch(parsed)) : undefined;
}

export function shiftOklchLightness(value: string, amount: number): string | undefined {
  const parsed = parseStaticColor(value);
  if (!parsed) return undefined;
  const color = srgbToOklch(parsed);
  return formatOklch({ ...color, lightness: clamp(color.lightness + amount) });
}

export function staticContrastRatio(foreground: string, background: string): number {
  const foregroundColor = parseStaticColor(foreground); const backgroundColor = parseStaticColor(background);
  if (!foregroundColor || !backgroundColor || foregroundColor.alpha < 0.999999 || backgroundColor.alpha < 0.999999) return Number.NaN;
  const luminance = (color: StaticColor): number => 0.2126 * linear(color.red) + 0.7152 * linear(color.green) + 0.0722 * linear(color.blue);
  const [bright, dark] = [luminance(foregroundColor), luminance(backgroundColor)].sort((left, right) => right - left);
  return (bright! + 0.05) / (dark! + 0.05);
}

const HEX = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;
const RGB = /^rgba?\(\s*(?:\d{1,3}%?\s*,\s*){2}\d{1,3}%?(?:\s*[,/]\s*(?:0|1|0?\.\d+|\d{1,3}%))?\s*\)$/i;
const HSL = /^hsla?\(\s*[-+]?\d+(?:\.\d+)?(?:deg|rad|turn)?\s*(?:,|\s)\s*\d+(?:\.\d+)?%\s*(?:,|\s)\s*\d+(?:\.\d+)?%(?:\s*[,/]\s*(?:0|1|0?\.\d+|\d{1,3}%))?\s*\)$/i;
const NAMED = new Set(["transparent", "currentcolor", "black", "white", "red", "green", "blue", "gray", "grey", "yellow", "purple", "orange", "pink", "brown"]);

export const safeColor = (value: string): boolean => value.length > 0
  && value.length < 512
  && !/[;{}<>]/.test(value)
  && !/\b(?:url|var|expression)\s*\(/i.test(value)
  && (HEX.test(value) || RGB.test(value) || HSL.test(value) || NAMED.has(value.toLowerCase()));

export const previewColor = (value: unknown, fallback = "transparent"): string => typeof value === "string" && safeColor(value) ? value : fallback;

export function nativeColor(value: string, fallback = "#000000"): string {
  if (!HEX.test(value)) return fallback;
  const hex = value.slice(1);
  if (hex.length === 3 || hex.length === 4) return `#${hex.slice(0, 3).split("").map(character => character.repeat(2)).join("")}`;
  return `#${hex.slice(0, 6)}`;
}

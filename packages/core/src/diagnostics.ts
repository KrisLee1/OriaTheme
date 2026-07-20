import { issue } from "./errors.js";
import { resolveThemeWithContract, validateTheme } from "./theme.js";
import type { ThemeDefinition, ThemeDiagnostics, TokenContract, ValidationIssue } from "./types.js";

const pairs = [
  ["color.background", "color.foreground"], ["color.surface", "color.surfaceForeground"], ["color.surfaceRaised", "color.surfaceRaisedForeground"], ["color.overlay", "color.overlayForeground"], ["color.primary", "color.primaryForeground"], ["color.secondary", "color.secondaryForeground"], ["color.destructive", "color.destructiveForeground"], ["color.success", "color.successForeground"], ["color.warning", "color.warningForeground"], ["color.info", "color.infoForeground"], ["color.selection", "color.selectionForeground"]
] as const;

/** Computes WCAG relative-luminance contrast for static hex colors. */
export function contrastRatio(foreground: string, background: string): number {
  const foregroundRgb = parseHex(foreground); const backgroundRgb = parseHex(background);
  if (!foregroundRgb || !backgroundRgb) return Number.NaN;
  const lum = ([red, green, blue]: readonly number[]): number => {
    const linear = [red, green, blue].map(channel => { const unit = channel! / 255; return unit <= 0.04045 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
  };
  const [bright, dark] = [lum(foregroundRgb), lum(backgroundRgb)].sort((left, right) => right - left);
  return (bright! + 0.05) / (dark! + 0.05);
}

/** Returns blocking validation errors and non-blocking WCAG contrast warnings for both modes. */
export function analyzeTheme(theme: ThemeDefinition, contract: TokenContract): ThemeDiagnostics {
  const checked = validateTheme(theme, contract);
  if (!checked.ok) return { errors: checked.issues, warnings: [] };
  const errors: ValidationIssue[] = []; const warnings: Array<ThemeDiagnostics["warnings"][number]> = [];
  for (const mode of ["light", "dark"] as const) {
    let variables: Readonly<Record<`--${string}`, string>>;
    try { variables = resolveThemeWithContract(theme, contract, mode).variables; }
    catch (error) { errors.push(error instanceof Error && "toIssue" in error ? (error as { toIssue(): ValidationIssue }).toIssue() : issue("INVALID_THEME", "Theme resolution failed.")); continue; }
    for (const [background, foreground] of pairs) {
      const ratio = contrastRatio(variables[`--oria-${foreground.replace(/\./g, "-")}`]!, variables[`--oria-${background.replace(/\./g, "-")}`]!);
      if (!Number.isFinite(ratio)) warnings.push({ pair: `${background}/${foreground} (${mode})`, ratio, level: "warning", message: "Contrast could not be calculated from a non-hex color." });
      else if (ratio < 4.5) warnings.push({ pair: `${background}/${foreground} (${mode})`, ratio, level: "warning", message: `Contrast ratio ${ratio.toFixed(2)} is below WCAG AA body text guidance.` });
    }
  }
  return { errors, warnings };
}

function parseHex(value: string): readonly [number, number, number] | undefined {
  const source = value.trim().replace(/^#/, "");
  if (!/^(?:[\da-f]{3}|[\da-f]{6})$/i.test(source)) return undefined;
  const expanded = source.length === 3 ? [...source].map(char => char + char).join("") : source;
  return [Number.parseInt(expanded.slice(0, 2), 16), Number.parseInt(expanded.slice(2, 4), 16), Number.parseInt(expanded.slice(4, 6), 16)];
}

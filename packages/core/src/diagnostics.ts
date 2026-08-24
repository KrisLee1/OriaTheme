import { issue } from "./errors.js";
import { staticContrastRatio } from "./color.js";
import { resolveThemeWithContract, validateTheme } from "./theme.js";
import type { ThemeDefinition, ThemeDiagnostics, TokenContract, TokenPath, ValidationIssue } from "./types.js";

const pairsV1 = [
  ["color.background", "color.foreground"], ["color.surface", "color.surfaceForeground"], ["color.surfaceRaised", "color.surfaceRaisedForeground"], ["color.overlay", "color.overlayForeground"], ["color.primary", "color.primaryForeground"], ["color.secondary", "color.secondaryForeground"], ["color.destructive", "color.destructiveForeground"], ["color.success", "color.successForeground"], ["color.warning", "color.warningForeground"], ["color.info", "color.infoForeground"], ["color.selection", "color.selectionForeground"]
] as const;

const pairsV2 = [
  ["color.bg", "color.fg"], ["color.surface", "color.surface.fg"], ["color.surface.raised", "color.surface.raised.fg"], ["color.overlay", "color.overlay.fg"], ["color.primary", "color.primary.fg"], ["color.secondary", "color.secondary.fg"], ["color.danger", "color.danger.fg"], ["color.success", "color.success.fg"], ["color.warning", "color.warning.fg"], ["color.info", "color.info.fg"], ["color.selection", "color.selection.fg"]
] as const;

function contrastPairs(contract: TokenContract): readonly (readonly [string, string])[] {
  const pairs = contract.name === "oria-standard" && contract.version >= 2 ? pairsV2 : pairsV1;
  return pairs.filter(([background, foreground]) => Boolean(contract.tokens[background as TokenPath] && contract.tokens[foreground as TokenPath]));
}

/** Computes WCAG relative-luminance contrast for supported opaque static colors. */
export function contrastRatio(foreground: string, background: string): number {
  return staticContrastRatio(foreground, background);
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
    for (const [background, foreground] of contrastPairs(contract)) {
      const ratio = contrastRatio(variables[`--oria-${foreground.replace(/\./g, "-")}`]!, variables[`--oria-${background.replace(/\./g, "-")}`]!);
      if (!Number.isFinite(ratio)) warnings.push({ pair: `${background}/${foreground} (${mode})`, ratio, level: "warning", message: "Contrast could not be calculated from a non-static or translucent color." });
      else if (ratio < 4.5) warnings.push({ pair: `${background}/${foreground} (${mode})`, ratio, level: "warning", message: `Contrast ratio ${ratio.toFixed(2)} is below WCAG AA body text guidance.` });
    }
  }
  return { errors, warnings };
}

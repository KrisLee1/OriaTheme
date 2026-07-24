/**
 * Static Tailwind CSS v4 bridge for `oria-standard@2` runtime variables.
 *
 * Oria stays the canonical source: the runtime never emits Tailwind's
 * unprefixed theme namespace. This package only maps known
 * `--<prefix>-*` variables into `@theme inline` at build time, so custom
 * prefixes must be generated ahead of time instead of being concatenated
 * at runtime.
 */

export interface OriaTailwindBridgeOptions {
  /**
   * Runtime CSS variable prefix. Must be non-empty, start with a letter and
   * contain only letters, digits and hyphens. Defaults to `oria`.
   */
  readonly prefix?: string;
}

export const oriaTailwindBridgeDefaultPrefix = "oria";

const prefixPattern = /^[A-Za-z][A-Za-z0-9-]*$/;

const colorMappings: ReadonlyArray<readonly [string, string]> = [
  ["background", "color-bg"],
  ["foreground", "color-fg"],
  ["surface", "color-surface"],
  ["surface-foreground", "color-surface-fg"],
  ["surface-raised", "color-surface-raised"],
  ["surface-raised-foreground", "color-surface-raised-fg"],
  ["overlay", "color-overlay"],
  ["overlay-foreground", "color-overlay-fg"],
  ["primary", "color-primary"],
  ["primary-foreground", "color-primary-fg"],
  ["primary-hover", "color-primary-hover"],
  ["primary-active", "color-primary-active"],
  ["secondary", "color-secondary"],
  ["secondary-foreground", "color-secondary-fg"],
  ["secondary-hover", "color-secondary-hover"],
  ["secondary-active", "color-secondary-active"],
  ["muted", "color-muted"],
  ["muted-foreground", "color-muted-fg"],
  ["accent", "color-accent"],
  ["accent-foreground", "color-accent-fg"],
  ["danger", "color-danger"],
  ["danger-foreground", "color-danger-fg"],
  ["success", "color-success"],
  ["success-foreground", "color-success-fg"],
  ["warning", "color-warning"],
  ["warning-foreground", "color-warning-fg"],
  ["info", "color-info"],
  ["info-foreground", "color-info-fg"],
  ["border", "color-border"],
  ["border-strong", "color-border-strong"],
  ["input", "color-input"],
  ["ring", "color-ring"],
  ["selection", "color-selection"],
  ["selection-foreground", "color-selection-fg"],
  ["scrim", "color-scrim"],
  ...Array.from({ length: 8 }, (_, index) => [`chart-${index + 1}`, `color-chart-${index + 1}`] as const)
];

const fontFamilies = ["sans", "serif", "mono", "display"] as const;
const fontWeights = ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"] as const;

/** [Tailwind step, Oria text step, Oria leading step] — `text.md` maps to Tailwind's `--text-base`. */
const textScale: ReadonlyArray<readonly [string, string, string]> = [
  ["xs", "xs", "snug"],
  ["sm", "sm", "snug"],
  ["base", "md", "normal"],
  ["lg", "lg", "normal"],
  ["xl", "xl", "snug"],
  ["2xl", "2xl", "snug"],
  ["3xl", "3xl", "tight"],
  ["4xl", "4xl", "tight"],
  ["5xl", "5xl", "tight"],
  ["6xl", "6xl", "tight"],
  ["7xl", "7xl", "tight"],
  ["8xl", "8xl", "tight"],
  ["9xl", "9xl", "tight"]
];

const leadingSteps = ["tight", "snug", "normal", "relaxed", "loose"] as const;
const trackingSteps = ["tighter", "tight", "normal", "wide", "wider", "widest"] as const;
const radiusSteps = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const;
const shadowSteps = ["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl"] as const;
const blurSteps = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;
const easeSteps = ["standard", "enter", "exit", "emphasized"] as const;
const durationSteps = ["fast", "normal", "slow"] as const;

/** Generates a static `@theme inline` bridge for the given runtime CSS variable prefix. */
export function generateOriaTailwindBridge(options: OriaTailwindBridgeOptions = {}): string {
  const prefix = options.prefix ?? oriaTailwindBridgeDefaultPrefix;
  if (!prefixPattern.test(prefix)) {
    throw new TypeError(`Invalid Oria CSS variable prefix "${prefix}". Use a non-empty value that starts with a letter and contains only letters, digits and hyphens.`);
  }
  const v = (name: string): string => `var(--${prefix}-${name})`;

  const themeLines: string[] = [];
  themeLines.push("  /* Semantic colors */");
  for (const [tailwindName, oriaName] of colorMappings) themeLines.push(`  --color-${tailwindName}: ${v(oriaName)};`);
  themeLines.push("", "  /* Font families and weights */");
  for (const family of fontFamilies) themeLines.push(`  --font-${family}: ${v(`font-${family}`)};`);
  for (const weight of fontWeights) themeLines.push(`  --font-weight-${weight}: ${v(`font-weight-${weight}`)};`);
  themeLines.push("", "  /* Text scale with paired line heights */");
  for (const [step, oriaStep, leading] of textScale) {
    themeLines.push(`  --text-${step}: ${v(`text-${oriaStep}`)};`);
    themeLines.push(`  --text-${step}--line-height: ${v(`leading-${leading}`)};`);
  }
  themeLines.push("", "  /* Leading and tracking */");
  for (const step of leadingSteps) themeLines.push(`  --leading-${step}: ${v(`leading-${step}`)};`);
  for (const step of trackingSteps) themeLines.push(`  --tracking-${step}: ${v(`tracking-${step}`)};`);
  themeLines.push("", "  /* Spacing and radius */");
  themeLines.push(`  --spacing: ${v("space")};`);
  for (const step of radiusSteps) themeLines.push(`  --radius-${step}: ${v(`radius-${step}`)};`);
  themeLines.push("", "  /* Shadow and blur */");
  for (const step of shadowSteps) themeLines.push(`  --shadow-${step}: ${v(`shadow-${step}`)};`);
  for (const step of blurSteps) themeLines.push(`  --blur-${step}: ${v(`blur-${step}`)};`);
  themeLines.push("", "  /* Motion curves (prefixed to avoid collisions) */");
  for (const step of easeSteps) themeLines.push(`  --ease-oria-${step}: ${v(`ease-${step}`)};`);

  const utilities: string[] = [];
  for (const step of blurSteps) {
    utilities.push(`@utility backdrop-oria-${step} {\n  backdrop-filter: blur(${v(`backdrop-blur-${step}`)}) saturate(${v("backdrop-saturate")});\n}`);
  }
  for (const step of durationSteps) {
    utilities.push(`@utility duration-oria-${step} {\n  transition-duration: ${v(`duration-${step}`)};\n}`);
  }
  utilities.push(`@utility inset-shadow-oria {\n  box-shadow: ${v("shadow-inner")};\n}`);
  utilities.push(`@utility shadow-highlight {\n  box-shadow: ${v("shadow-highlight")};\n}`);
  utilities.push(`@utility bg-oria-canvas {\n  background-image: var(--${prefix}-pattern-bg, none), var(--${prefix}-gradient-bg, none);\n  background-color: ${v("color-bg")};\n}`);
  utilities.push(`@utility bg-oria-surface {\n  background-image: var(--${prefix}-pattern-surface, none), var(--${prefix}-gradient-surface, none);\n  background-color: ${v("color-surface")};\n}`);

  return `/* Tailwind CSS v4 bridge for oria-standard@2. Generated by @oriatheme/tailwind. */\n@theme inline {\n${themeLines.join("\n")}\n}\n\n${utilities.join("\n\n")}\n`;
}

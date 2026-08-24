import type { ThemeTokenInput } from "@oriatheme/core";

export type TokenOverrides = Readonly<Record<string, ThemeTokenInput>>;
export type PresetCategory = "oria" | "brand-product" | "design-language" | "visual-style" | "mood-context";

type ActionColors = readonly [base: string, hover: string, active: string, foreground: string];
type Pair = readonly [background: string, foreground: string];
type Charts = readonly [string, string, string, string, string, string, string, string];

interface ModeColors {
  readonly background: string;
  readonly foreground: string;
  readonly surface: string;
  readonly raised: string;
  readonly overlay?: string;
  readonly primary: ActionColors;
  readonly secondary: ActionColors;
  readonly muted: Pair;
  readonly accent: Pair;
  readonly border: readonly [defaultColor: string, strong: string];
  readonly input?: string;
  readonly ring: string;
  readonly selection: Pair;
  readonly scrim?: string;
  readonly charts: Charts;
}

interface ModeDesign {
  readonly colors: ModeColors;
  readonly tokens?: TokenOverrides;
}

export interface PresetSpec {
  readonly id: string;
  readonly name: string;
  readonly category: PresetCategory;
  readonly tokens: TokenOverrides;
  readonly modes: { readonly light: ModeDesign; readonly dark: ModeDesign };
}

export const systemSans = ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"] as const;
export const humanistSans = ["Avenir Next", "Avenir", "Segoe UI", "sans-serif"] as const;
export const editorialSerif = ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Georgia", "serif"] as const;
export const readingSerif = ["Charter", "Bitstream Charter", "Sitka Text", "Georgia", "serif"] as const;
export const geometricSans = ["Avenir Next", "Futura", "Century Gothic", "sans-serif"] as const;
export const roundedSans = ["ui-rounded", "SF Pro Rounded", "Nunito", "system-ui", "sans-serif"] as const;
export const developerSans = ["Geist", "Inter", "ui-sans-serif", "system-ui", "sans-serif"] as const;
export const mono = ["SFMono-Regular", "Cascadia Code", "Consolas", "monospace"] as const;
export const handwrittenSans = ["Chalkboard SE", "Bradley Hand", "Comic Sans MS", "cursive"] as const;

export function backdropBlurScale(lg: number): TokenOverrides {
  const px = (value: number): string => `${Number(value.toFixed(2))}px`;
  return { "backdrop.blur.xs": px(lg * 0.2), "backdrop.blur.sm": px(lg * 0.4), "backdrop.blur.md": px(lg * 0.7), "backdrop.blur.lg": px(lg), "backdrop.blur.xl": px(lg * 1.4), "backdrop.blur.2xl": px(lg * 2), "backdrop.blur.3xl": px(lg * 3.2) };
}

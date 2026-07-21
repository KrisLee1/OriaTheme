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

const systemSans = ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"] as const;
const humanistSans = ["Avenir Next", "Avenir", "Segoe UI", "sans-serif"] as const;
const editorialSerif = ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Georgia", "serif"] as const;
const readingSerif = ["Charter", "Bitstream Charter", "Sitka Text", "Georgia", "serif"] as const;
const geometricSans = ["Avenir Next", "Futura", "Century Gothic", "sans-serif"] as const;
const roundedSans = ["ui-rounded", "SF Pro Rounded", "Nunito", "system-ui", "sans-serif"] as const;
const developerSans = ["Geist", "Inter", "ui-sans-serif", "system-ui", "sans-serif"] as const;
const mono = ["SFMono-Regular", "Cascadia Code", "Consolas", "monospace"] as const;
const handwrittenSans = ["Chalkboard SE", "Bradley Hand", "Comic Sans MS", "cursive"] as const;

function scaledDimension(value: string, factor: number): string {
  if (value === "0") return "0";
  const match = /^(\d+(?:\.\d+)?)([a-z%]+)$/.exec(value);
  if (!match) throw new Error(`Cannot extend dimension scale from ${value}.`);
  return `${Number((Number(match[1]) * factor).toFixed(4))}${match[2]}`;
}

function radiusScale(xs: string, sm: string, md: string, lg: string, xl: string, xxl: string): TokenOverrides {
  return { "shape.radius.xs": xs, "shape.radius.sm": sm, "shape.radius.md": md, "shape.radius.lg": lg, "shape.radius.xl": xl, "shape.radius.2xl": xxl, "shape.radius.3xl": scaledDimension(xxl, 1.5), "shape.radius.4xl": scaledDimension(xxl, 2) };
}

function backdropBlurScale(lg: number): TokenOverrides {
  const px = (value: number): string => `${Number(value.toFixed(2))}px`;
  return { "effect.backdropBlur.xs": px(lg * 0.2), "effect.backdropBlur.sm": px(lg * 0.4), "effect.backdropBlur.md": px(lg * 0.7), "effect.backdropBlur.lg": px(lg), "effect.backdropBlur.xl": px(lg * 1.4), "effect.backdropBlur.2xl": px(lg * 2), "effect.backdropBlur.3xl": px(lg * 3.2) };
}

const unorderedPresetSpecs: readonly PresetSpec[] = [
  {
    id: "oria-ocean", name: "Ocean", category: "oria",
    tokens: {
      "typography.font.sans": humanistSans, "typography.font.display": humanistSans,
      ...radiusScale("0.375rem", "0.625rem", "1rem", "1.5rem", "2.25rem", "3rem"),
      "elevation.shadow.sm": [{ x: "0", y: "3px", blur: "10px", spread: "-4px", color: "#0369a126" }],
      "elevation.shadow.md": [{ x: "0", y: "10px", blur: "28px", spread: "-12px", color: "#07598540" }],
      ...backdropBlurScale(18), "motion.duration.normal": "220ms", "motion.easing.standard": [0.22, 1, 0.36, 1]
    },
    modes: {
      light: { colors: { background: "#f2fbff", foreground: "#092f45", surface: "#e3f6fd", raised: "#ffffff", overlay: "#f8fdff", primary: ["#0879a6", "#06688f", "#055677", "#ffffff"], secondary: ["#c9eef8", "#b5e6f4", "#9cd9eb", "#123d52"], muted: ["#e8f4f7", "#426777"], accent: ["#cff7f1", "#155d58"], border: ["#b8dde9", "#72b7cc"], input: "#f9fdff", ring: "#0879a6", selection: ["#a8e5f2", "#0b3448"], charts: ["#0879a6", "#0f9f9a", "#2456a6", "#53a6d8", "#5d8c50", "#c77724", "#7d55b5", "#d45c75"] }, tokens: { "gradient.background": { type: "linear", angle: 160, stops: [{ color: "#f7fdff" }, { color: "#dff5fb", position: 62 }, { color: "#c9f1ed", position: 100 }] }, "gradient.accent": { type: "linear", angle: 120, stops: [{ color: "#1ea7d4" }, { color: "#35c7b6", position: 100 }] } } },
      dark: { colors: { background: "#061d2a", foreground: "#e9f8fd", surface: "#0a2b3a", raised: "#103b4c", overlay: "#0d3343", primary: ["#6fd2ef", "#96dff4", "#42bddf", "#073042"], secondary: ["#17495a", "#1d596c", "#24697d", "#e5f8fc"], muted: ["#0d3442", "#a5c8d3"], accent: ["#124b49", "#bff5ec"], border: ["#245466", "#438097"], input: "#0b3141", ring: "#73d8f3", selection: ["#176c83", "#f1fbfe"], charts: ["#6fd2ef", "#49d3c2", "#7fa7ff", "#87c8f0", "#9acb84", "#f1ad62", "#b69ae6", "#f08ba0"] }, tokens: { "gradient.background": { type: "radial", position: "top", stops: [{ color: "#0c4051" }, { color: "#061d2a", position: 66 }, { color: "#04141e", position: 100 }] }, "gradient.accent": { type: "linear", angle: 120, stops: [{ color: "#36bfe8" }, { color: "#39d6bd", position: 100 }] }, "elevation.shadow.md": [{ x: "0", y: "12px", blur: "34px", spread: "-14px", color: "#00000099" }] } }
    }
  },
  {
    id: "oria-calm", name: "Calm", category: "mood-context",
    tokens: {
      "typography.font.sans": humanistSans, "typography.font.display": humanistSans, "typography.lineHeight.relaxed": 1.76, "spacing.density": 1.12,
      ...radiusScale("0.375rem", "0.625rem", "0.875rem", "1.25rem", "1.75rem", "2.25rem"),
      "elevation.shadow.sm": [{ x: "0", y: "5px", blur: "16px", spread: "-10px", color: "#56747b2b" }], "elevation.shadow.md": [{ x: "0", y: "14px", blur: "34px", spread: "-20px", color: "#56747b3d" }],
      "motion.duration.fast": "180ms", "motion.duration.normal": "300ms", "motion.duration.slow": "460ms", "motion.easing.standard": [0.25, 0.8, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#f4f8f7", foreground: "#263b3d", surface: "#e7f0ee", raised: "#fcfefd", primary: ["#47777a", "#3c686b", "#32595c", "#ffffff"], secondary: ["#d8e6e2", "#cadcd7", "#b8cec8", "#2d4544"], muted: ["#e6edeb", "#5f7272"], accent: ["#e4ead8", "#4c5d32"], border: ["#d0deda", "#98aaa7"], input: "#f9fcfb", ring: "#528589", selection: ["#c7dfdc", "#2c4c4c"], charts: ["#47777a", "#5e8062", "#94764a", "#70658d", "#9c6370", "#557c90", "#77814b", "#8e6887"] } },
      dark: { colors: { background: "#162224", foreground: "#edf4f2", surface: "#202f31", raised: "#293a3d", overlay: "#253538", primary: ["#8fc4c3", "#a5d0cf", "#79b3b2", "#193a3b"], secondary: ["#35484a", "#405456", "#4b6163", "#f0f6f4"], muted: ["#28383a", "#b7c6c3"], accent: ["#37412b", "#e0e9c8"], border: ["#3d4e50", "#687a7b"], input: "#202f31", ring: "#98c9c8", selection: ["#466a6a", "#f5fbf9"], charts: ["#8fc4c3", "#97bd99", "#c6a67b", "#a99dc0", "#c796a0", "#91b3c3", "#acb680", "#bd9bb7"] }, tokens: { "elevation.shadow.md": [{ x: "0", y: "16px", blur: "38px", spread: "-20px", color: "#000000a6" }] } }
    }
  },
  {
    id: "oria-playful", name: "Playful", category: "mood-context",
    tokens: {
      "typography.font.sans": roundedSans, "typography.font.display": roundedSans, "typography.weight.semibold": "700", "typography.weight.bold": "800",
      ...radiusScale("0.5rem", "0.875rem", "1.375rem", "2rem", "3rem", "4rem"),
      "elevation.shadow.sm": [{ x: "0", y: "4px", blur: "0", spread: "0", color: "#493c8f38" }], "elevation.shadow.md": [{ x: "0", y: "8px", blur: "0", spread: "0", color: "#493c8f4d" }],
      "motion.duration.normal": "240ms", "motion.easing.emphasized": [0.34, 1.56, 0.64, 1]
    },
    modes: {
      light: { colors: { background: "#fff9ef", foreground: "#302744", surface: "#f4eafa", raised: "#ffffff", primary: ["#6551b8", "#5745a1", "#493a8a", "#ffffff"], secondary: ["#ffe081", "#f5cf62", "#e8bc42", "#443500"], muted: ["#f2ece8", "#6a6170"], accent: ["#f9c9dc", "#6d2443"], border: ["#d8cce0", "#9d89b0"], ring: "#715dc6", selection: ["#cce9e6", "#244d4a"], charts: ["#6551b8", "#2f947f", "#d17c1e", "#d44d7f", "#347db2", "#819523", "#9b5bc2", "#c65f4b"] }, tokens: { "gradient.accent": { type: "linear", angle: 105, stops: [{ color: "#ffe081" }, { color: "#f48db5", position: 50 }, { color: "#72d6c5", position: 100 }] } } },
      dark: { colors: { background: "#1d1829", foreground: "#faf4ff", surface: "#2a223c", raised: "#352b4b", overlay: "#302744", primary: ["#a99aef", "#bbb0f3", "#9482e3", "#281d5d"], secondary: ["#7b611d", "#947622", "#ab8928", "#fff5ce"], muted: ["#302840", "#c2b7cc"], accent: ["#71314c", "#ffe1ed"], border: ["#4b3d61", "#76658d"], ring: "#b2a5f1", selection: ["#2e6962", "#effffc"], charts: ["#a99aef", "#6fd2bd", "#efad5f", "#ec86ae", "#73b4df", "#b8c967", "#cf95e7", "#e69382"] }, tokens: { "gradient.accent": { type: "linear", angle: 105, stops: [{ color: "#f2cb57" }, { color: "#e979a5", position: 50 }, { color: "#56cdb7", position: 100 }] }, "elevation.shadow.sm": [{ x: "0", y: "4px", blur: "0", spread: "0", color: "#a99aef52" }], "elevation.shadow.md": [{ x: "0", y: "8px", blur: "0", spread: "0", color: "#a99aef66" }] } }
    }
  },
  {
    id: "oria-premium", name: "Premium", category: "mood-context",
    tokens: {
      "typography.font.serif": editorialSerif, "typography.font.display": editorialSerif, "typography.letterSpacing.tight": "-0.03em", "typography.letterSpacing.wide": "0.08em", "typography.letterSpacing.wider": "0.1em", "typography.letterSpacing.widest": "0.14em",
      "spacing.density": 1.14, ...radiusScale("0", "0.125rem", "0.25rem", "0.375rem", "0.5rem", "0.75rem"),
      "shape.borderWidth.strong": "1px", "elevation.shadow.sm": [{ x: "0", y: "5px", blur: "16px", spread: "-9px", color: "#1c130b4d" }], "elevation.shadow.md": [{ x: "0", y: "18px", blur: "44px", spread: "-22px", color: "#1c130b73" }], "elevation.shadow.lg": [{ x: "0", y: "28px", blur: "64px", spread: "-28px", color: "#0000008c" }],
      "motion.duration.normal": "260ms", "motion.duration.slow": "440ms", "motion.easing.standard": [0.25, 0.1, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#f7f3eb", foreground: "#2c241b", surface: "#eee7dc", raised: "#fffdf9", primary: ["#76591e", "#654b18", "#533e14", "#ffffff"], secondary: ["#e3d7c4", "#d6c7ae", "#c5b28f", "#342b20"], muted: ["#ebe5dc", "#685f54"], accent: ["#ead8ad", "#5f4816"], border: ["#d5c8b4", "#95836a"], input: "#fffdf9", ring: "#846526", selection: ["#e3cf9d", "#443411"], charts: ["#76591e", "#486d5a", "#874c58", "#63517b", "#9b6431", "#466c7e", "#66703a", "#7b526d"] } },
      dark: { colors: { background: "#100d0a", foreground: "#f2eadc", surface: "#1b1712", raised: "#262018", overlay: "#211b15", primary: ["#d7bd7a", "#e1cc96", "#c8aa61", "#3a2c0d"], secondary: ["#352c21", "#413629", "#4d4031", "#f5eddf"], muted: ["#241e18", "#bfb3a2"], accent: ["#49391d", "#f1dca6"], border: ["#3f3428", "#72614b"], input: "#18130f", ring: "#ddc586", selection: ["#5f4c24", "#fff9e9"], charts: ["#d7bd7a", "#87b49d", "#ce8c98", "#aa98c2", "#d4a06d", "#83afbf", "#a7b476", "#bd91ad"] }, tokens: { "gradient.background": { type: "radial", position: "top", stops: [{ color: "#2a2115" }, { color: "#100d0a", position: 72 }] }, "gradient.accent": { type: "linear", angle: 110, stops: [{ color: "#f0dda2" }, { color: "#a77b2f", position: 100 }] }, "elevation.shadow.md": [{ x: "0", y: "20px", blur: "48px", spread: "-22px", color: "#000000d9" }] } }
    }
  },
  {
    id: "oria-organic", name: "Organic", category: "mood-context",
    tokens: {
      "typography.font.sans": humanistSans, "typography.font.serif": editorialSerif, "typography.font.display": editorialSerif, "typography.lineHeight.relaxed": 1.76,
      ...radiusScale("0.25rem", "0.5rem", "0.875rem", "1.375rem", "2rem", "2.75rem"),
      "elevation.shadow.sm": [{ x: "0", y: "4px", blur: "12px", spread: "-7px", color: "#51463233" }], "elevation.shadow.md": [{ x: "0", y: "14px", blur: "30px", spread: "-18px", color: "#51463245" }],
      "motion.duration.normal": "240ms", "motion.easing.standard": [0.25, 0.8, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#f3efe3", foreground: "#30342a", surface: "#e5e4d4", raised: "#fbf8ef", primary: ["#526a43", "#465b39", "#3a4c30", "#ffffff"], secondary: ["#d6d9c4", "#c7ccb2", "#b5bc9d", "#343b2d"], muted: ["#e4e3d8", "#62695c"], accent: ["#ead2bd", "#6b3e25"], border: ["#cecbb9", "#96927d"], input: "#f9f6ec", ring: "#60784f", selection: ["#c8d3b5", "#34402c"], charts: ["#526a43", "#9a613d", "#4d7b72", "#776187", "#a35260", "#8a7636", "#467084", "#875f76"] } },
      dark: { colors: { background: "#1c2019", foreground: "#eff0e8", surface: "#282d23", raised: "#34392d", overlay: "#2f3429", primary: ["#a4c093", "#b6cca8", "#91b17e", "#26351f"], secondary: ["#3d4536", "#48523f", "#555f49", "#f2f3ec"], muted: ["#2d3328", "#bdc2b4"], accent: ["#523626", "#f1d3bc"], border: ["#42493a", "#707764"], input: "#252a21", ring: "#adc79e", selection: ["#526449", "#f8fbf3"], charts: ["#a4c093", "#d09a78", "#89bbb0", "#ae9bc0", "#d18e9b", "#c0ad70", "#83b0c0", "#bd99b0"] }, tokens: { "elevation.shadow.md": [{ x: "0", y: "16px", blur: "34px", spread: "-18px", color: "#000000a6" }] } }
    }
  },
  {
    id: "oria-cottagecore", name: "Cottagecore", category: "mood-context",
    tokens: {
      "typography.font.serif": readingSerif, "typography.font.display": readingSerif, "typography.lineHeight.relaxed": 1.8, "typography.letterSpacing.wide": "0.045em", "typography.letterSpacing.wider": "0.065em", "typography.letterSpacing.widest": "0.1em",
      ...radiusScale("0.125rem", "0.25rem", "0.5rem", "0.75rem", "1rem", "1.25rem"),
      "elevation.shadow.sm": [{ x: "0", y: "3px", blur: "8px", spread: "-5px", color: "#6b50342b" }], "elevation.shadow.md": [{ x: "0", y: "10px", blur: "24px", spread: "-14px", color: "#6b50343d" }], "elevation.shadow.inner": [{ x: "0", y: "1px", blur: "2px", spread: "0", color: "#8b6f4d24", inset: true }],
      "motion.duration.normal": "230ms", "motion.easing.standard": [0.25, 0.1, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#f5efe3", foreground: "#393329", surface: "#e9dfcf", raised: "#fdf9f0", primary: ["#5b704b", "#4e6040", "#415035", "#ffffff"], secondary: ["#d8ddc8", "#cbd2b8", "#bbc5a4", "#39412f"], muted: ["#e7e0d5", "#6c6357"], accent: ["#ecd1d0", "#6c3738"], border: ["#d3c5b2", "#9c896f"], input: "#fbf7ee", ring: "#687d57", selection: ["#d5dfc4", "#3c4932"], charts: ["#5b704b", "#a65f54", "#597d78", "#7c6088", "#9e7435", "#526f8a", "#7d803c", "#965f78"] } },
      dark: { colors: { background: "#211d18", foreground: "#f1e9dc", surface: "#2d2821", raised: "#383128", overlay: "#332c24", primary: ["#a9c096", "#bacdab", "#96b282", "#293820"], secondary: ["#414735", "#4c533e", "#59604a", "#f3f1e8"], muted: ["#312c25", "#c1b6a8"], accent: ["#563637", "#f3d3d4"], border: ["#4a4135", "#796d5b"], input: "#29241e", ring: "#b1c79f", selection: ["#566248", "#f9fbf4"], charts: ["#a9c096", "#d29389", "#8fbab4", "#b19dc0", "#cbaa70", "#8dacC4", "#afb979", "#c497ab"] }, tokens: { "elevation.shadow.md": [{ x: "0", y: "12px", blur: "28px", spread: "-14px", color: "#000000a6" }] } }
    }
  },
  {
    id: "oria-nature", name: "Nature", category: "mood-context",
    tokens: {
      "typography.font.sans": humanistSans, "typography.font.display": humanistSans, "typography.weight.semibold": "600",
      ...radiusScale("0.25rem", "0.375rem", "0.625rem", "0.875rem", "1.25rem", "1.75rem"),
      "elevation.shadow.sm": [{ x: "0", y: "4px", blur: "12px", spread: "-7px", color: "#2f51423d" }], "elevation.shadow.md": [{ x: "0", y: "14px", blur: "30px", spread: "-18px", color: "#2f514252" }],
      "motion.duration.normal": "210ms", "motion.easing.standard": [0.22, 1, 0.36, 1]
    },
    modes: {
      light: { colors: { background: "#f1f6f1", foreground: "#20362e", surface: "#e2ece3", raised: "#fbfdf9", primary: ["#397052", "#305f46", "#284f3b", "#ffffff"], secondary: ["#d1e1d3", "#c0d6c3", "#acc8b0", "#294234"], muted: ["#e4ebe4", "#5a7067"], accent: ["#dceaf0", "#315566"], border: ["#c7d7ca", "#8ca592"], input: "#f8fcf8", ring: "#46805f", selection: ["#bdd8c5", "#284738"], charts: ["#397052", "#377b91", "#a17038", "#6f628e", "#a34f60", "#567941", "#44788b", "#8c5e7f"] }, tokens: { "gradient.background": { type: "linear", angle: 165, stops: [{ color: "#edf6f5" }, { color: "#edf4e6", position: 58 }, { color: "#f3ead9", position: 100 }] } } },
      dark: { colors: { background: "#101d19", foreground: "#edf5ef", surface: "#192b24", raised: "#22382f", overlay: "#1e332a", primary: ["#8fc6a5", "#a5d2b7", "#7bb793", "#173827"], secondary: ["#2e4739", "#385545", "#436351", "#eff7f1"], muted: ["#21352d", "#adc2b6"], accent: ["#233f4b", "#d2edf7"], border: ["#354d41", "#607769"], input: "#192b24", ring: "#98cbaa", selection: ["#3f684f", "#f5fbf7"], charts: ["#8fc6a5", "#75b6ca", "#d1a16d", "#a99bc2", "#d18b99", "#a6bd7d", "#80aebe", "#bf97b4"] }, tokens: { "gradient.background": { type: "linear", angle: 165, stops: [{ color: "#102b32" }, { color: "#172b20", position: 58 }, { color: "#2a2117", position: 100 }] }, "elevation.shadow.md": [{ x: "0", y: "16px", blur: "34px", spread: "-18px", color: "#000000b3" }] } }
    }
  },
  {
    id: "oria-retro", name: "Retro", category: "mood-context",
    tokens: {
      "typography.font.sans": geometricSans, "typography.font.display": ["Rockwell", "Roboto Slab", "Georgia", "serif"], "typography.weight.bold": "800", "typography.letterSpacing.wide": "0.075em", "typography.letterSpacing.wider": "0.095em", "typography.letterSpacing.widest": "0.13em",
      ...radiusScale("0", "0.125rem", "0.25rem", "0.375rem", "0.5rem", "0.75rem"), "shape.borderWidth.strong": "2px",
      "elevation.shadow.sm": [{ x: "3px", y: "3px", blur: "0", spread: "0", color: "#483320" }], "elevation.shadow.md": [{ x: "5px", y: "5px", blur: "0", spread: "0", color: "#483320" }],
      "motion.duration.normal": "180ms", "motion.easing.standard": [0.25, 0.1, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#f4e7c4", foreground: "#342b22", surface: "#ead8aa", raised: "#fff4d6", primary: ["#9b3f2f", "#853528", "#6e2c22", "#ffffff"], secondary: ["#d9b64b", "#c7a43c", "#b18e2f", "#3f3000"], muted: ["#e7d9b7", "#675b48"], accent: ["#9fc5b4", "#244b3d"], border: ["#6a5037", "#3f2e20"], input: "#faedcd", ring: "#a54a38", selection: ["#d9bca9", "#492a20"], charts: ["#9b3f2f", "#377565", "#a67b1e", "#66528d", "#a6536b", "#3c7088", "#63732f", "#855575"] } },
      dark: { colors: { background: "#241d17", foreground: "#f5e8c7", surface: "#33291f", raised: "#403327", overlay: "#3a2e23", primary: ["#e58e7a", "#eda493", "#d67866", "#421b14"], secondary: ["#80661d", "#987a23", "#ae8d2a", "#fff2bd"], muted: ["#392f25", "#c8b99e"], accent: ["#315948", "#d2efe3"], border: ["#7b6246", "#b99a6f"], input: "#2e251d", ring: "#e99582", selection: ["#704637", "#fff7f0"], charts: ["#e58e7a", "#80b8a6", "#d5b469", "#aa97ce", "#d092a1", "#82b3c4", "#a7b673", "#c494b5"] }, tokens: { "elevation.shadow.sm": [{ x: "3px", y: "3px", blur: "0", spread: "0", color: "#c6a976" }], "elevation.shadow.md": [{ x: "5px", y: "5px", blur: "0", spread: "0", color: "#c6a976" }] } }
    }
  },
  {
    id: "oria-kawaii", name: "Kawaii", category: "mood-context",
    tokens: {
      "typography.font.sans": roundedSans, "typography.font.display": roundedSans, "typography.weight.semibold": "700", "typography.weight.bold": "800",
      ...radiusScale("0.75rem", "1rem", "1.5rem", "2.25rem", "3.5rem", "5rem"),
      "elevation.shadow.sm": [{ x: "0", y: "7px", blur: "18px", spread: "-10px", color: "#b66f9b3d" }], "elevation.shadow.md": [{ x: "0", y: "18px", blur: "40px", spread: "-22px", color: "#9e75b852" }],
      "motion.duration.normal": "260ms", "motion.easing.emphasized": [0.34, 1.56, 0.64, 1]
    },
    modes: {
      light: { colors: { background: "#fff7fb", foreground: "#493448", surface: "#f9e8f1", raised: "#ffffff", primary: ["#a44d7a", "#8f426a", "#783858", "#ffffff"], secondary: ["#dce9fa", "#cadcf4", "#b5cce9", "#30465f"], muted: ["#f2eaf0", "#745f72"], accent: ["#daf2e8", "#315e50"], border: ["#ebcfe0", "#c28daa"], ring: "#b05c86", selection: ["#edd5eb", "#56364f"], charts: ["#a44d7a", "#4d8c79", "#b77a2d", "#775fab", "#ba6175", "#4e83a2", "#718844", "#995d94"] }, tokens: { "gradient.background": { type: "radial", position: "top", stops: [{ color: "#f9ddea" }, { color: "#e4e3fb", position: 48 }, { color: "#ddf3eb", position: 78 }, { color: "#fff7fb", position: 100 }] }, "gradient.accent": { type: "linear", angle: 115, stops: [{ color: "#f49fc3" }, { color: "#aaa0ef", position: 50 }, { color: "#91ddc8", position: 100 }] } } },
      dark: { colors: { background: "#241923", foreground: "#fff2fa", surface: "#352332", raised: "#422b3e", overlay: "#3b2737", primary: ["#e69bc2", "#edaecc", "#da83b0", "#4b1733"], secondary: ["#35465f", "#405571", "#4b6483", "#f0f6ff"], muted: ["#332432", "#cbb6c8"], accent: ["#294c43", "#d8f5ec"], border: ["#593b52", "#89637d"], ring: "#eaa3c7", selection: ["#67455f", "#fff8fc"], charts: ["#e69bc2", "#8ac8b6", "#dfb06f", "#b3a0e2", "#db91a0", "#8bb8cd", "#acbd79", "#d29acb"] }, tokens: { "gradient.background": { type: "radial", position: "top", stops: [{ color: "#512943" }, { color: "#302950", position: 48 }, { color: "#23433d", position: 78 }, { color: "#241923", position: 100 }] }, "gradient.accent": { type: "linear", angle: 115, stops: [{ color: "#f09ac0" }, { color: "#aa9cf1", position: 50 }, { color: "#83d9c2", position: 100 }] }, "elevation.shadow.md": [{ x: "0", y: "20px", blur: "46px", spread: "-22px", color: "#000000b3" }] } }
    }
  },
  {
    id: "oria-sunset", name: "Sunset", category: "mood-context",
    tokens: {
      "typography.font.sans": humanistSans, "typography.font.display": editorialSerif, "typography.letterSpacing.tight": "-0.025em",
      ...radiusScale("0.375rem", "0.625rem", "1rem", "1.5rem", "2.25rem", "3rem"),
      "elevation.shadow.sm": [{ x: "0", y: "6px", blur: "18px", spread: "-10px", color: "#c65f493d" }], "elevation.shadow.md": [{ x: "0", y: "18px", blur: "42px", spread: "-22px", color: "#a7475c59" }],
      "motion.duration.normal": "270ms", "motion.duration.slow": "440ms", "motion.easing.standard": [0.25, 0.8, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#fff7ef", foreground: "#442a2b", surface: "#fde8dc", raised: "#fffdf9", primary: ["#b6493e", "#9d3e35", "#84342d", "#ffffff"], secondary: ["#f3d1bd", "#eabfa7", "#ddaa8d", "#4a2d26"], muted: ["#f4e9e2", "#765e5c"], accent: ["#eddaed", "#633d63"], border: ["#eccbbe", "#c18f82"], ring: "#c15347", selection: ["#f0c5b3", "#552d25"], charts: ["#b6493e", "#a66b24", "#6c5a9b", "#b44f7a", "#367d83", "#777f30", "#426e9a", "#8f557f"] }, tokens: { "gradient.background": { type: "linear", angle: 165, stops: [{ color: "#fff4d8" }, { color: "#ffd8c7", position: 44 }, { color: "#f2d8eb", position: 78 }, { color: "#fff7ef", position: 100 }] }, "gradient.accent": { type: "linear", angle: 110, stops: [{ color: "#f4b24f" }, { color: "#e46f61", position: 52 }, { color: "#b65b9a", position: 100 }] } } },
      dark: { colors: { background: "#21131d", foreground: "#fff1eb", surface: "#321c29", raised: "#402434", overlay: "#39202f", primary: ["#f29a7f", "#f6ad96", "#eb8268", "#4b1c13"], secondary: ["#5c382d", "#6d4538", "#7f5344", "#fff0e8"], muted: ["#36212d", "#cdb4bd"], accent: ["#4f2c52", "#f6ddf5"], border: ["#573347", "#835b70"], ring: "#f4a087", selection: ["#704238", "#fff7f3"], charts: ["#f29a7f", "#e5b066", "#ad97e0", "#e58eb6", "#76bcc2", "#b4bf6d", "#7ba9da", "#d093c4"] }, tokens: { "gradient.background": { type: "linear", angle: 165, stops: [{ color: "#4a2b1b" }, { color: "#542334", position: 44 }, { color: "#35234f", position: 78 }, { color: "#21131d", position: 100 }] }, "gradient.accent": { type: "linear", angle: 110, stops: [{ color: "#f3b55f" }, { color: "#ef7d6d", position: 52 }, { color: "#ca70ad", position: 100 }] }, "elevation.shadow.md": [{ x: "0", y: "20px", blur: "48px", spread: "-22px", color: "#000000b8" }] } }
    }
  },
  {
    id: "oria-neo-brutalism", name: "Neo Brutalism", category: "visual-style",
    tokens: {
      "typography.font.sans": geometricSans, "typography.font.display": geometricSans, "typography.weight.normal": "500", "typography.weight.semibold": "700", "typography.weight.bold": "900",
      "typography.letterSpacing.tight": "-0.04em", ...radiusScale("0", "0", "0", "0", "0", "0"),
      "shape.borderWidth.hairline": "2px", "shape.borderWidth.default": "2px", "shape.borderWidth.strong": "3px", "shape.focusRingWidth": "3px", "shape.focusRingOffset": "3px",
      "elevation.shadow.xs": [{ x: "2px", y: "2px", blur: "0", spread: "0", color: "#171717" }], "elevation.shadow.sm": [{ x: "4px", y: "4px", blur: "0", spread: "0", color: "#171717" }], "elevation.shadow.md": [{ x: "7px", y: "7px", blur: "0", spread: "0", color: "#171717" }], "elevation.shadow.lg": [{ x: "10px", y: "10px", blur: "0", spread: "0", color: "#171717" }],
      "motion.duration.fast": "80ms", "motion.duration.normal": "130ms", "motion.easing.standard": [0, 0, 1, 1]
    },
    modes: {
      light: { colors: { background: "#fff7dc", foreground: "#171717", surface: "#ffe55c", raised: "#ffffff", primary: ["#165dff", "#0d4ee6", "#073dba", "#ffffff"], secondary: ["#ffcf3f", "#f2bc24", "#dfa70d", "#211900"], muted: ["#eee6ca", "#554f3c"], accent: ["#ff6f91", "#4d0d1d"], border: ["#171717", "#000000"], input: "#ffffff", ring: "#165dff", selection: ["#7eddf2", "#102d34"], charts: ["#165dff", "#00a878", "#f04444", "#7a3ff2", "#ff8a00", "#00a7c4", "#759400", "#dd2f8c"] } },
      dark: { colors: { background: "#141414", foreground: "#fff7dc", surface: "#252525", raised: "#303030", overlay: "#292929", primary: ["#74a0ff", "#91b4ff", "#5a8cf5", "#10214a"], secondary: ["#7d6314", "#967817", "#ad8b1c", "#fff4c4"], muted: ["#2b2b2b", "#c6bea3"], accent: ["#7a2940", "#ffdce5"], border: ["#fff7dc", "#ffffff"], input: "#1d1d1d", ring: "#82a9ff", selection: ["#257389", "#f4fdff"], charts: ["#74a0ff", "#51d0ad", "#ff8181", "#b28cf7", "#ffb35f", "#55c9de", "#b4cc5f", "#f184bd"] }, tokens: { "elevation.shadow.xs": [{ x: "2px", y: "2px", blur: "0", spread: "0", color: "#fff7dc" }], "elevation.shadow.sm": [{ x: "4px", y: "4px", blur: "0", spread: "0", color: "#fff7dc" }], "elevation.shadow.md": [{ x: "7px", y: "7px", blur: "0", spread: "0", color: "#fff7dc" }], "elevation.shadow.lg": [{ x: "10px", y: "10px", blur: "0", spread: "0", color: "#fff7dc" }] } }
    }
  },
  {
    id: "oria-punchcard", name: "Punchcard", category: "visual-style",
    tokens: {
      "typography.font.sans": roundedSans, "typography.font.display": roundedSans, "typography.weight.normal": "500", "typography.weight.semibold": "700", "typography.weight.bold": "900",
      "typography.size.4xl": "3.75rem", "typography.size.5xl": "4.5rem", "typography.size.6xl": "5.5rem", "typography.size.7xl": "6.75rem", "typography.size.8xl": "9rem", "typography.size.9xl": "12rem", "typography.letterSpacing.tight": "-0.04em", "typography.letterSpacing.wide": "0.075em", "typography.letterSpacing.wider": "0.1em", "typography.letterSpacing.widest": "0.14em",
      ...radiusScale("0.25rem", "0.5rem", "0.75rem", "1rem", "1.25rem", "1.5rem"),
      "shape.borderWidth.hairline": "1px", "shape.borderWidth.default": "2px", "shape.borderWidth.strong": "2px", "shape.focusRingWidth": "3px", "shape.focusRingOffset": "3px",
      "elevation.shadow.xs": [{ x: "2px", y: "2px", blur: "0", spread: "0", color: "#2a2520" }], "elevation.shadow.sm": [{ x: "4px", y: "4px", blur: "0", spread: "0", color: "#2a2520" }], "elevation.shadow.md": [{ x: "6px", y: "6px", blur: "0", spread: "0", color: "#2a2520" }], "elevation.shadow.lg": [{ x: "8px", y: "8px", blur: "0", spread: "0", color: "#2a2520" }],
      "motion.duration.fast": "90ms", "motion.duration.normal": "160ms", "motion.easing.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#fff2da", foreground: "#27211c", surface: "#fffaf0", raised: "#fffdf8", overlay: "#fffdf8", primary: ["#ffd84d", "#f4c935", "#e6b91e", "#2d2517"], secondary: ["#f4a4bd", "#e98ea8", "#dd7d9a", "#3c1f29"], muted: ["#f0e1c5", "#6e6254"], accent: ["#9ed4f2", "#153d54"], border: ["#2a2520", "#171411"], input: "#fffaf0", ring: "#ff8a2b", selection: ["#ffddb3", "#3a2412"], charts: ["#ffd84d", "#f4a4bd", "#9ed4f2", "#ff6a3d", "#5fbd84", "#7a72db", "#d89020", "#bd5f8b"] }, tokens: { "gradient.background": { type: "linear", angle: 180, stops: [{ color: "#fff4e1" }, { color: "#fff2da", position: 100 }] }, "gradient.surface": { type: "linear", angle: 180, stops: [{ color: "#fffdf8" }, { color: "#fff8ed", position: 100 }] }, "gradient.accent": { type: "linear", angle: 100, stops: [{ color: "#ffd84d" }, { color: "#ffbd56", position: 100 }] }, "pattern.surface": [{ type: "dot", color: "#2a25201f", radius: "1.5px", spacing: "1.5rem" }] } },
      dark: { colors: { background: "#211b17", foreground: "#fff1d9", surface: "#2c251f", raised: "#3a3028", overlay: "#322a23", primary: ["#ffe073", "#ffea9a", "#f8ce4a", "#3a2910"], secondary: ["#a54868", "#c15c7f", "#d06a90", "#fff2f6"], muted: ["#342c25", "#d0c0a6"], accent: ["#265f80", "#e0f5ff"], border: ["#f3ddba", "#fff4dc"], input: "#29221d", ring: "#ffe073", selection: ["#7b4c1f", "#fff9ee"], charts: ["#ffe073", "#e57899", "#75c7ef", "#ff9a62", "#77c99c", "#aaa1f2", "#efbd67", "#eb8cba"] }, tokens: { "gradient.background": { type: "linear", angle: 180, stops: [{ color: "#2c2118" }, { color: "#211b17", position: 100 }] }, "gradient.surface": { type: "linear", angle: 180, stops: [{ color: "#3a3028" }, { color: "#2c251f", position: 100 }] }, "gradient.accent": { type: "linear", angle: 100, stops: [{ color: "#ffe073" }, { color: "#f59f5a", position: 100 }] }, "pattern.surface": [{ type: "dot", color: "#fff1d91f", radius: "1.5px", spacing: "1.5rem" }], "elevation.shadow.xs": [{ x: "2px", y: "2px", blur: "0", spread: "0", color: "#080604" }], "elevation.shadow.sm": [{ x: "4px", y: "4px", blur: "0", spread: "0", color: "#080604" }], "elevation.shadow.md": [{ x: "6px", y: "6px", blur: "0", spread: "0", color: "#080604" }], "elevation.shadow.lg": [{ x: "8px", y: "8px", blur: "0", spread: "0", color: "#080604" }] } }
    }
  },
  {
    id: "oria-sketchbook", name: "Sketchbook", category: "visual-style",
    tokens: {
      "typography.font.sans": handwrittenSans, "typography.font.display": handwrittenSans, "typography.font.mono": mono,
      "typography.weight.normal": "500", "typography.weight.medium": "600", "typography.weight.semibold": "700", "typography.weight.bold": "800",
      "typography.lineHeight.normal": 1.6, "typography.lineHeight.relaxed": 1.82, "typography.letterSpacing.wide": "0.04em", "spacing.density": 1.06,
      ...radiusScale("0.375rem", "0.625rem", "0.875rem", "1.125rem", "1.5rem", "2rem"),
      "shape.borderWidth.hairline": "1px", "shape.borderWidth.default": "2px", "shape.borderWidth.strong": "2px", "shape.focusRingWidth": "3px", "shape.focusRingOffset": "3px",
      "elevation.shadow.xs": [{ x: "0", y: "1px", blur: "2px", spread: "0", color: "#2d292714" }],
      "elevation.shadow.sm": [{ x: "0", y: "3px", blur: "7px", spread: "-4px", color: "#2d29272e" }],
      "elevation.shadow.md": [{ x: "0", y: "8px", blur: "18px", spread: "-12px", color: "#2d292733" }],
      "elevation.shadow.inner": [{ x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffffbf", inset: true }],
      "motion.duration.fast": "110ms", "motion.duration.normal": "190ms", "motion.easing.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#fffefa", foreground: "#2d2927", surface: "#faf8f1", raised: "#fffefb", overlay: "#fffefb", primary: ["#2d2927", "#171513", "#000000", "#fffefa"], secondary: ["#b7f3c5", "#9ce8af", "#82dc9c", "#183d24"], muted: ["#f1eee5", "#716c66"], accent: ["#ffe49c", "#4d3c16"], border: ["#393431", "#171513"], input: "#fffefb", ring: "#4f9fd0", selection: ["#b8e2f8", "#17394f"], charts: ["#2d2927", "#9ce8af", "#f39ca3", "#69c7ee", "#ffe49c", "#9b8adc", "#e59a54", "#d97eac"] }, tokens: { "gradient.background": { type: "linear", angle: 180, stops: [{ color: "#fffefa" }, { color: "#fbfaf4", position: 100 }] }, "gradient.surface": { type: "linear", angle: 180, stops: [{ color: "#fffefc" }, { color: "#f8f5ec", position: 100 }] }, "gradient.accent": { type: "linear", angle: 110, stops: [{ color: "#b7f3c5" }, { color: "#69c7ee", position: 100 }] }, "pattern.background": [{ type: "dot", color: "#2a25200f", radius: "1.5px", spacing: "2rem", angle: 0 }], "pattern.surface": [{ type: "grid", color: "#2a25200f", lineWidth: "1px", spacing: "1.5rem", angle: 0 }] } },
      dark: { colors: { background: "#211f1c", foreground: "#f6f1e7", surface: "#2a2723", raised: "#332f2a", overlay: "#302c27", primary: ["#f6f1e7", "#ffffff", "#dfd7c8", "#26221e"], secondary: ["#2f7250", "#39815c", "#438f68", "#eaffef"], muted: ["#302d28", "#c7c0b4"], accent: ["#785e27", "#fff0b8"], border: ["#d9d0c1", "#fff8e8"], input: "#2c2924", ring: "#81cef1", selection: ["#315b71", "#effaff"], charts: ["#f6f1e7", "#83d99c", "#f58f9a", "#74ccef", "#f7d77c", "#b5a5ed", "#efa76e", "#ee95bd"] }, tokens: { "gradient.background": { type: "linear", angle: 180, stops: [{ color: "#2b2823" }, { color: "#211f1c", position: 100 }] }, "gradient.surface": { type: "linear", angle: 180, stops: [{ color: "#38332d" }, { color: "#292620", position: 100 }] }, "gradient.accent": { type: "linear", angle: 110, stops: [{ color: "#397d58" }, { color: "#31769d", position: 100 }] }, "pattern.background": [{ type: "dot", color: "#6060601f", radius: "1.5px", spacing: "2rem", angle: 0 }], "pattern.surface": [{ type: "grid", color: "#f6f1e710", lineWidth: "1px", spacing: "1.5rem", angle: 0 }], "elevation.shadow.xs": [{ x: "0", y: "1px", blur: "2px", spread: "0", color: "#07060599" }], "elevation.shadow.sm": [{ x: "0", y: "3px", blur: "7px", spread: "-4px", color: "#070605a6" }], "elevation.shadow.md": [{ x: "0", y: "8px", blur: "18px", spread: "-12px", color: "#070605b3" }], "elevation.shadow.inner": [{ x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffff1f", inset: true }] } }
    }
  },
  {
    id: "oria-soft-clay", name: "Soft Clay", category: "visual-style",
    tokens: {
      "typography.font.sans": roundedSans, "typography.font.display": roundedSans, "typography.weight.normal": "500", "typography.weight.semibold": "700", "spacing.density": 1.12,
      ...radiusScale("0.875rem", "1.25rem", "1.875rem", "2.75rem", "3.75rem", "4.75rem"), "shape.borderWidth.hairline": "1px", "shape.borderWidth.default": "1px", "shape.borderWidth.strong": "1px", "shape.focusRingWidth": "3px", "shape.focusRingOffset": "4px",
      "elevation.shadow.sm": [{ x: "0", y: "6px", blur: "12px", spread: "-7px", color: "#a99c9140" }, { x: "5px", y: "5px", blur: "12px", spread: "0", color: "#c9beb452" }, { x: "-6px", y: "-6px", blur: "12px", spread: "0", color: "#ffffffed" }],
      "elevation.shadow.md": [{ x: "0", y: "14px", blur: "28px", spread: "-13px", color: "#a99c9145" }, { x: "10px", y: "10px", blur: "22px", spread: "0", color: "#c9beb459" }, { x: "-12px", y: "-12px", blur: "22px", spread: "0", color: "#ffffff" }],
      "elevation.shadow.lg": [{ x: "0", y: "24px", blur: "48px", spread: "-20px", color: "#a99c9147" }, { x: "20px", y: "20px", blur: "38px", spread: "0", color: "#c9beb452" }, { x: "-22px", y: "-22px", blur: "38px", spread: "0", color: "#ffffff" }],
      "elevation.shadow.inner": [{ x: "0", y: "3px", blur: "7px", spread: "0", color: "#b9ada34d", inset: true }, { x: "4px", y: "4px", blur: "9px", spread: "0", color: "#c9beb459", inset: true }, { x: "-5px", y: "-5px", blur: "9px", spread: "0", color: "#ffffffed", inset: true }],
      "effect.opacity.overlay": 0.9, "motion.duration.normal": "280ms", "motion.easing.standard": [0.18, 0.88, 0.28, 1]
    },
    modes: {
      light: { colors: { background: "#f3f0eb", foreground: "#584842", surface: "#eae4dc", raised: "#fbf9f5", overlay: "#fcfaf7", primary: ["#e9781c", "#d66410", "#bd520c", "#382015"], secondary: ["#f0ebe4", "#e4dcd3", "#d8cec3", "#5a4b43"], muted: ["#e8e2db", "#8b7d75"], accent: ["#f0decc", "#684225"], border: ["#ffffffd9", "#d8cec4"], input: "#f6f2ed", ring: "#e9781c", selection: ["#f4cfaa", "#532f15"], charts: ["#e9781c", "#c96f68", "#789bb6", "#927bb3", "#7f9b73", "#c19358", "#75a0a7", "#b97894"] }, tokens: { "gradient.background": { type: "radial", position: "top left", stops: [{ color: "#ffffff" }, { color: "#f3f0eb", position: 58 }, { color: "#e7e0d7", position: 100 }] }, "gradient.surface": { type: "linear", angle: 145, stops: [{ color: "#ffffff" }, { color: "#f3eee8", position: 48 }, { color: "#e5ddd4", position: 100 }] }, "gradient.accent": { type: "linear", angle: 135, stops: [{ color: "#f8b06d" }, { color: "#e9781c", position: 100 }] } } },
      dark: { colors: { background: "#28221d", foreground: "#f8f0e7", surface: "#302923", raised: "#3a312a", overlay: "#342c26", primary: ["#f3a362", "#f7b87f", "#de8742", "#3b2010"], secondary: ["#443a32", "#51453a", "#5f5145", "#f8f0e7"], muted: ["#382f29", "#cbbcaf"], accent: ["#553a28", "#f5d6bb"], border: ["#4d4137", "#706154"], input: "#302923", ring: "#f3a362", selection: ["#744728", "#fff3e5"], charts: ["#f3a362", "#df8e88", "#91b6ce", "#ae9acf", "#9ab58e", "#d3ad78", "#91b9bd", "#cd96ac"] }, tokens: { "gradient.background": { type: "radial", position: "top left", stops: [{ color: "#3c322a" }, { color: "#28221d", position: 70 }] }, "gradient.surface": { type: "linear", angle: 145, stops: [{ color: "#473c33" }, { color: "#302923", position: 100 }] }, "gradient.accent": { type: "linear", angle: 135, stops: [{ color: "#f6b678" }, { color: "#dc7f3b", position: 100 }] }, "elevation.shadow.sm": [{ x: "0", y: "6px", blur: "12px", spread: "-7px", color: "#0c0806a6" }, { x: "5px", y: "5px", blur: "12px", spread: "0", color: "#120d0abf" }, { x: "-6px", y: "-6px", blur: "12px", spread: "0", color: "#51453a99" }], "elevation.shadow.md": [{ x: "0", y: "14px", blur: "28px", spread: "-13px", color: "#0c0806b3" }, { x: "10px", y: "10px", blur: "22px", spread: "0", color: "#120d0acc" }, { x: "-12px", y: "-12px", blur: "22px", spread: "0", color: "#51453ab3" }], "elevation.shadow.lg": [{ x: "0", y: "24px", blur: "48px", spread: "-20px", color: "#0c0806b3" }, { x: "20px", y: "20px", blur: "38px", spread: "0", color: "#120d0acc" }, { x: "-22px", y: "-22px", blur: "38px", spread: "0", color: "#51453aa6" }], "elevation.shadow.inner": [{ x: "0", y: "3px", blur: "7px", spread: "0", color: "#120d0aa6", inset: true }, { x: "4px", y: "4px", blur: "9px", spread: "0", color: "#120d0ab3", inset: true }, { x: "-5px", y: "-5px", blur: "9px", spread: "0", color: "#51453a99", inset: true }] } }
    }
  },
  {
    id: "oria-golden-bazaar", name: "Golden Bazaar", category: "visual-style",
    tokens: {
      "typography.font.sans": roundedSans, "typography.font.display": geometricSans, "typography.weight.semibold": "700", "typography.weight.bold": "800", "typography.letterSpacing.tight": "-0.025em", "spacing.density": 1.06,
      ...radiusScale("0.75rem", "1.125rem", "1.75rem", "2.625rem", "3.875rem", "5.25rem"),
      "shape.borderWidth.hairline": "1px", "shape.borderWidth.default": "1px", "shape.borderWidth.strong": "1px", "shape.focusRingWidth": "3px", "shape.focusRingOffset": "4px",
      "elevation.shadow.sm": [{ x: "0", y: "5px", blur: "16px", spread: "-9px", color: "#bb63342e" }, { x: "0", y: "1px", blur: "0", spread: "1px", color: "#ffffffb8", inset: true }],
      "elevation.shadow.md": [{ x: "0", y: "16px", blur: "34px", spread: "-18px", color: "#bb633447" }, { x: "0", y: "1px", blur: "0", spread: "1px", color: "#ffffffd9", inset: true }],
      "elevation.shadow.lg": [{ x: "0", y: "28px", blur: "58px", spread: "-28px", color: "#bb63345c" }, { x: "0", y: "1px", blur: "0", spread: "1px", color: "#ffffffe6", inset: true }],
      "elevation.shadow.highlight": [{ x: "0", y: "1px", blur: "0", spread: "1px", color: "#ffffffcc", inset: true }],
      "effect.opacity.overlay": 0.9, "motion.duration.fast": "160ms", "motion.duration.normal": "260ms", "motion.duration.slow": "420ms", "motion.easing.standard": [0.22, 1, 0.36, 1]
    },
    modes: {
      light: { colors: { background: "#fff0d8", foreground: "#2f241d", surface: "#ffe5b7", raised: "#fffaf2", overlay: "#fff8eb", primary: ["#f4b522", "#df9b12", "#c88209", "#3b2903"], secondary: ["#f06d36", "#db5b28", "#bf491c", "#3b1b10"], muted: ["#f8dfbd", "#765e50"], accent: ["#413896", "#fff8eb"], border: ["#ffffffc7", "#f2cb89"], input: "#fffdf8", ring: "#f4b522", selection: ["#f6c95e", "#3a2805"], charts: ["#f4b522", "#f06d36", "#413896", "#2faa75", "#2786d7", "#de4e79", "#d28b18", "#7984d1"] }, tokens: { "gradient.background": { type: "radial", position: "top", stops: [{ color: "#fff8d4" }, { color: "#ffd16a", position: 38 }, { color: "#f3a861", position: 74 }, { color: "#ffe7c6", position: 100 }] }, "gradient.surface": { type: "linear", angle: 145, stops: [{ color: "#fffdf9" }, { color: "#fff4e6", position: 100 }] }, "gradient.accent": { type: "linear", angle: 120, stops: [{ color: "#ffd965" }, { color: "#f4b522", position: 52 }, { color: "#ee8b24", position: 100 }] } } },
      dark: { colors: { background: "#2b1c16", foreground: "#fff4df", surface: "#38241c", raised: "#492f23", overlay: "#41291f", primary: ["#ffd66c", "#ffe08e", "#efbd43", "#4a3100"], secondary: ["#ff9566", "#ffad87", "#ed7750", "#43180d"], muted: ["#3a271f", "#d4bdac"], accent: ["#aaa6ff", "#211b59"], border: ["#ffffff24", "#a86d46"], input: "#342119", ring: "#ffda79", selection: ["#704d18", "#fff6dc"], charts: ["#ffd66c", "#ff9566", "#aaa6ff", "#6dd5a0", "#6eb8ff", "#ff8eae", "#e6b75f", "#aab4f5"] }, tokens: { "gradient.background": { type: "radial", position: "top", stops: [{ color: "#70421d" }, { color: "#422719", position: 46 }, { color: "#2b1c16", position: 100 }] }, "gradient.surface": { type: "linear", angle: 145, stops: [{ color: "#573827" }, { color: "#38241c", position: 100 }] }, "gradient.accent": { type: "linear", angle: 120, stops: [{ color: "#ffe08b" }, { color: "#f8bb45", position: 55 }, { color: "#e98131", position: 100 }] }, "elevation.shadow.sm": [{ x: "0", y: "5px", blur: "16px", spread: "-9px", color: "#08040399" }, { x: "0", y: "1px", blur: "0", spread: "1px", color: "#ffffff1f", inset: true }], "elevation.shadow.md": [{ x: "0", y: "16px", blur: "34px", spread: "-18px", color: "#080403b3" }, { x: "0", y: "1px", blur: "0", spread: "1px", color: "#ffffff2b", inset: true }], "elevation.shadow.lg": [{ x: "0", y: "28px", blur: "58px", spread: "-28px", color: "#080403cc" }, { x: "0", y: "1px", blur: "0", spread: "1px", color: "#ffffff33", inset: true }], "elevation.shadow.highlight": [{ x: "0", y: "1px", blur: "0", spread: "1px", color: "#ffffff24", inset: true }] } }
    }
  },
  {
    id: "oria-theorem", name: "Theorem", category: "visual-style",
    tokens: {
      "typography.font.sans": readingSerif, "typography.font.display": editorialSerif, "typography.font.mono": mono,
      "typography.weight.normal": "400", "typography.weight.medium": "500", "typography.weight.semibold": "600", "typography.weight.bold": "700",
      "typography.lineHeight.normal": 1.48, "typography.lineHeight.relaxed": 1.72, "typography.letterSpacing.tight": "-0.025em", "typography.letterSpacing.wide": "0.025em", "spacing.density": 1.04,
      ...radiusScale("0", "0", "0", "0", "0", "0"),
      "shape.borderWidth.hairline": "1px", "shape.borderWidth.default": "1px", "shape.borderWidth.strong": "1px", "shape.focusRingWidth": "2px", "shape.focusRingOffset": "3px",
      "elevation.shadow.2xs": [], "elevation.shadow.xs": [], "elevation.shadow.sm": [], "elevation.shadow.md": [], "elevation.shadow.inner": [], "elevation.shadow.highlight": [],
      "elevation.shadow.lg": [{ x: "8px", y: "10px", blur: "0", spread: "0", color: "#6b675f91" }, { x: "0", y: "18px", blur: "36px", spread: "-18px", color: "#24221d59" }],
      "elevation.shadow.xl": [{ x: "10px", y: "12px", blur: "0", spread: "0", color: "#6b675f99" }, { x: "0", y: "24px", blur: "46px", spread: "-22px", color: "#24221d66" }],
      "elevation.shadow.2xl": [{ x: "12px", y: "14px", blur: "0", spread: "0", color: "#6b675fa3" }, { x: "0", y: "30px", blur: "58px", spread: "-28px", color: "#24221d73" }],
      "motion.duration.fast": "100ms", "motion.duration.normal": "180ms", "motion.easing.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#f0ede5", foreground: "#25231f", surface: "#ebe8df", raised: "#fffdf5", overlay: "#fffef9", primary: ["#27231e", "#15130f", "#000000", "#fffdf5"], secondary: ["#e6e0d4", "#d8d0c1", "#c8bead", "#322e28"], muted: ["#e4e0d7", "#59554e"], accent: ["#8d3029", "#fff8f1"], border: ["#d6d0c4", "#8a8479"], input: "#fffdf5", ring: "#8d3029", selection: ["#d8b6ae", "#321411"], scrim: "#25231f59", charts: ["#27231e", "#8d3029", "#756848", "#5d6972", "#62735e", "#806075", "#9a633c", "#46616c"] }, tokens: { "gradient.background": { type: "linear", angle: 180, stops: [{ color: "#f3f0e8" }, { color: "#f0ede5", position: 100 }] }, "gradient.surface": { type: "linear", angle: 180, stops: [{ color: "#fffef9" }, { color: "#f8f3e8", position: 100 }] }, "gradient.accent": { type: "linear", angle: 100, stops: [{ color: "#a5463d" }, { color: "#8d3029", position: 100 }] }, "pattern.background": [{ type: "noise", variant: "paper", color: "#2a25205f", tileSize: "80px", intensity: 0.5 }] } },
      dark: { colors: { background: "#292824", foreground: "#f4eee1", surface: "#34332e", raised: "#45423a", overlay: "#403d36", primary: ["#f5eee2", "#ffffff", "#ded5c5", "#27241f"], secondary: ["#514d43", "#625d52", "#716a5d", "#f4eee1"], muted: ["#393731", "#ccc4b6"], accent: ["#c76b5d", "#28110e"], border: ["#716c61", "#aaa294"], input: "#3a3832", ring: "#d27a6b", selection: ["#704039", "#fff6ef"], scrim: "#00000080", charts: ["#f5eee2", "#dc8173", "#c9b783", "#9eb3be", "#9bb58f", "#c59bb8", "#e1a979", "#87aab8"] }, tokens: { "gradient.background": { type: "linear", angle: 180, stops: [{ color: "#32312b" }, { color: "#292824", position: 100 }] }, "gradient.surface": { type: "linear", angle: 180, stops: [{ color: "#4c483f" }, { color: "#403d36", position: 100 }] }, "gradient.accent": { type: "linear", angle: 100, stops: [{ color: "#db8879" }, { color: "#c76b5d", position: 100 }] }, "pattern.background": [{ type: "noise", variant: "paper", color: "#9292925f", tileSize: "80px", intensity: 0.5 }], "elevation.shadow.lg": [{ x: "8px", y: "10px", blur: "0", spread: "0", color: "#0c0b0acc" }, { x: "0", y: "18px", blur: "36px", spread: "-18px", color: "#00000099" }], "elevation.shadow.xl": [{ x: "10px", y: "12px", blur: "0", spread: "0", color: "#0c0b0ad9" }, { x: "0", y: "24px", blur: "46px", spread: "-22px", color: "#000000a6" }], "elevation.shadow.2xl": [{ x: "12px", y: "14px", blur: "0", spread: "0", color: "#0c0b0ae6" }, { x: "0", y: "30px", blur: "58px", spread: "-28px", color: "#000000b3" }] } }
    }
  },
  {
    id: "oria-neumorphism", name: "Neumorphism", category: "visual-style",
    tokens: {
      "typography.font.sans": humanistSans, "typography.font.display": humanistSans,
      ...radiusScale("0.5rem", "0.75rem", "1.125rem", "1.5rem", "2rem", "2.5rem"), "shape.borderWidth.strong": "1px",
      "elevation.shadow.sm": [{ x: "5px", y: "5px", blur: "12px", spread: "0", color: "#9caab759" }, { x: "-5px", y: "-5px", blur: "12px", spread: "0", color: "#ffffffd9" }],
      "elevation.shadow.md": [{ x: "10px", y: "10px", blur: "24px", spread: "0", color: "#9caab766" }, { x: "-10px", y: "-10px", blur: "24px", spread: "0", color: "#ffffffeb" }],
      "elevation.shadow.inner": [{ x: "4px", y: "4px", blur: "10px", spread: "0", color: "#9caab759", inset: true }, { x: "-4px", y: "-4px", blur: "10px", spread: "0", color: "#ffffffd9", inset: true }],
      "motion.duration.normal": "220ms", "motion.easing.standard": [0.22, 1, 0.36, 1]
    },
    modes: {
      light: { colors: { background: "#e7edf1", foreground: "#26343e", surface: "#e7edf1", raised: "#edf2f5", primary: ["#3d6f91", "#345f7d", "#2b506a", "#ffffff"], secondary: ["#d9e1e6", "#cdd7de", "#bdcbd3", "#2b3a44"], muted: ["#dfe6ea", "#596a75"], accent: ["#d9e8e2", "#31584b"], border: ["#d4dde3", "#8fa1ad"], input: "#e7edf1", ring: "#477d9f", selection: ["#bfd5e2", "#2b4657"], charts: ["#3d6f91", "#4a7b67", "#9a703a", "#745d91", "#a65c6d", "#4f7d8d", "#718044", "#8e5f86"] } },
      dark: { colors: { background: "#242b31", foreground: "#edf2f5", surface: "#242b31", raised: "#2b333a", overlay: "#293037", primary: ["#82b1d0", "#9ac0d9", "#6da1c5", "#173246"], secondary: ["#343d44", "#3e484f", "#49545c", "#f1f5f7"], muted: ["#2d353c", "#b8c3ca"], accent: ["#30463f", "#d2eee4"], border: ["#3a444c", "#687985"], input: "#242b31", ring: "#8bb8d4", selection: ["#3d6278", "#f6fbfd"], charts: ["#82b1d0", "#83b9a1", "#d0aa73", "#ac99c5", "#d08f9e", "#83b1c0", "#aab77a", "#c397bb"] }, tokens: { "elevation.shadow.sm": [{ x: "5px", y: "5px", blur: "12px", spread: "0", color: "#11161ab3" }, { x: "-5px", y: "-5px", blur: "12px", spread: "0", color: "#3b464f8f" }], "elevation.shadow.md": [{ x: "10px", y: "10px", blur: "24px", spread: "0", color: "#11161acc" }, { x: "-10px", y: "-10px", blur: "24px", spread: "0", color: "#3b464fa6" }], "elevation.shadow.inner": [{ x: "4px", y: "4px", blur: "10px", spread: "0", color: "#11161ab3", inset: true }, { x: "-4px", y: "-4px", blur: "10px", spread: "0", color: "#3b464f8f", inset: true }] } }
    }
  },
  {
    id: "oria-memphis", name: "Memphis", category: "visual-style",
    tokens: {
      "typography.font.sans": geometricSans, "typography.font.display": geometricSans, "typography.weight.semibold": "700", "typography.weight.bold": "800", "typography.letterSpacing.tight": "-0.035em",
      ...radiusScale("0", "0.125rem", "0.25rem", "0.5rem", "0.75rem", "1rem"), "shape.borderWidth.strong": "2px",
      "elevation.shadow.sm": [{ x: "3px", y: "3px", blur: "0", spread: "0", color: "#181818" }], "elevation.shadow.md": [{ x: "6px", y: "6px", blur: "0", spread: "0", color: "#2f65d9" }], "elevation.shadow.lg": [{ x: "9px", y: "9px", blur: "0", spread: "0", color: "#ea5685" }],
      "motion.duration.normal": "210ms", "motion.easing.emphasized": [0.34, 1.56, 0.64, 1]
    },
    modes: {
      light: { colors: { background: "#fff8dd", foreground: "#202020", surface: "#ffe361", raised: "#ffffff", primary: ["#2f65d9", "#2856bd", "#20479f", "#ffffff"], secondary: ["#43bfa7", "#34a993", "#288f7d", "#123d35"], muted: ["#eee6cd", "#595342"], accent: ["#f7a8c0", "#6b1731"], border: ["#202020", "#000000"], ring: "#2f65d9", selection: ["#f6cb4e", "#312800"], charts: ["#2f65d9", "#43bfa7", "#ea5685", "#e29b21", "#7546bb", "#2a9bbb", "#7f9b24", "#c6408d"] }, tokens: { "gradient.accent": { type: "linear", angle: 135, stops: [{ color: "#ffe361" }, { color: "#f77da3", position: 50 }, { color: "#4ccbb1", position: 100 }] } } },
      dark: { colors: { background: "#181722", foreground: "#fff8dd", surface: "#29273a", raised: "#343148", overlay: "#2f2c42", primary: ["#7ea3ff", "#99b7ff", "#638cf5", "#16264d"], secondary: ["#54d2b9", "#71dcc7", "#3bc4aa", "#123c34"], muted: ["#2d2a3d", "#c5bdd0"], accent: ["#8a3450", "#ffe1ea"], border: ["#fff2b8", "#ffffff"], ring: "#8aabff", selection: ["#7d621d", "#fffbee"], charts: ["#7ea3ff", "#54d2b9", "#f384a5", "#efb653", "#ac84e8", "#6ac8df", "#b5cb55", "#eb7ac0"] }, tokens: { "gradient.accent": { type: "linear", angle: 135, stops: [{ color: "#f6c94f" }, { color: "#e96895", position: 50 }, { color: "#48cbb2", position: 100 }] }, "elevation.shadow.sm": [{ x: "3px", y: "3px", blur: "0", spread: "0", color: "#fff8dd" }], "elevation.shadow.md": [{ x: "6px", y: "6px", blur: "0", spread: "0", color: "#7ea3ff" }], "elevation.shadow.lg": [{ x: "9px", y: "9px", blur: "0", spread: "0", color: "#f384a5" }] } }
    }
  },
  {
    id: "oria-soft-ui", name: "Soft UI", category: "visual-style",
    tokens: {
      "typography.font.sans": roundedSans, "typography.font.display": roundedSans, "spacing.density": 1.1,
      ...radiusScale("0.5rem", "0.75rem", "1.125rem", "1.5rem", "2rem", "2.5rem"),
      "elevation.shadow.sm": [{ x: "0", y: "6px", blur: "18px", spread: "-10px", color: "#66758f38" }], "elevation.shadow.md": [{ x: "0", y: "16px", blur: "38px", spread: "-20px", color: "#66758f4d" }],
      "effect.opacity.muted": 0.72, "motion.duration.normal": "240ms", "motion.easing.standard": [0.22, 1, 0.36, 1]
    },
    modes: {
      light: { colors: { background: "#f1f4f8", foreground: "#2a3546", surface: "#e7ebf3", raised: "#fbfcff", primary: ["#526fa6", "#465f91", "#3b507b", "#ffffff"], secondary: ["#dfe4ee", "#d3dae7", "#c3ccdc", "#303d4e"], muted: ["#e8ecf2", "#647083"], accent: ["#e7def2", "#584773"], border: ["#d9dfE9", "#a4afc1"], input: "#f8faff", ring: "#607eb5", selection: ["#cedaee", "#334765"], charts: ["#526fa6", "#57816f", "#9a7444", "#79649e", "#a66176", "#5b7f93", "#74834a", "#90658a"] } },
      dark: { colors: { background: "#1a202b", foreground: "#eff2f8", surface: "#242c39", raised: "#2e3846", overlay: "#2a3340", primary: ["#91abda", "#a7bbe2", "#7c99cc", "#1b2b49"], secondary: ["#364150", "#414d5d", "#4c5a6b", "#f2f5fa"], muted: ["#2a3340", "#bac3d0"], accent: ["#40344f", "#eadcf8"], border: ["#3d4858", "#6b788b"], input: "#232b37", ring: "#9ab2df", selection: ["#465e86", "#f7f9ff"], charts: ["#91abda", "#8cbaa5", "#d1ad7d", "#ad9bc8", "#d09baa", "#8eb3c3", "#adb981", "#c79fbe"] }, tokens: { "elevation.shadow.md": [{ x: "0", y: "18px", blur: "42px", spread: "-20px", color: "#000000b3" }] } }
    }
  },
  {
    id: "oria-cyberpunk", name: "Cyberpunk", category: "visual-style",
    tokens: {
      "typography.font.sans": developerSans, "typography.font.display": mono, "typography.font.mono": mono, "typography.weight.bold": "800", "typography.letterSpacing.wide": "0.075em", "typography.letterSpacing.wider": "0.095em", "typography.letterSpacing.widest": "0.13em",
      ...radiusScale("0", "0", "0", "0", "0", "0"), "shape.borderWidth.strong": "2px",
      "elevation.shadow.sm": [{ x: "0", y: "0", blur: "14px", spread: "-5px", color: "#00e5ff80" }], "elevation.shadow.md": [{ x: "0", y: "0", blur: "28px", spread: "-10px", color: "#ff3ca699" }],
      "motion.duration.fast": "70ms", "motion.duration.normal": "130ms", "motion.easing.standard": [0.1, 0.9, 0.2, 1]
    },
    modes: {
      light: { colors: { background: "#f3f5ec", foreground: "#161b20", surface: "#e5e9de", raised: "#ffffff", primary: ["#394d00", "#2f4000", "#263400", "#ffffff"], secondary: ["#bceaf0", "#a8dfe7", "#8ed1dc", "#153f46"], muted: ["#e4e7df", "#59615e"], accent: ["#ffd5e9", "#70163f"], border: ["#22282d", "#000000"], ring: "#506900", selection: ["#d7e870", "#293000"], charts: ["#506900", "#007b88", "#b61f68", "#5b45a0", "#ae5c00", "#27709c", "#4b7826", "#9e317d"] }, tokens: { "gradient.accent": { type: "linear", angle: 110, stops: [{ color: "#bedb00" }, { color: "#00b4c7", position: 50 }, { color: "#e5328c", position: 100 }] } } },
      dark: { colors: { background: "#07090c", foreground: "#edf6f2", surface: "#10151b", raised: "#171e25", overlay: "#131a21", primary: ["#d5f24a", "#e1f66d", "#c3e12b", "#253000"], secondary: ["#123840", "#174750", "#1c5660", "#d9fbff"], muted: ["#121920", "#a9bbb8"], accent: ["#4a1731", "#ffd8ea"], border: ["#2b4449", "#5fb5bd"], input: "#0d151a", ring: "#d9f454", selection: ["#536214", "#fbffe7"], charts: ["#d5f24a", "#39d9e6", "#ff62ad", "#9e88ff", "#ff9d42", "#63bfff", "#7ee268", "#df70d0"] }, tokens: { "gradient.background": { type: "linear", angle: 155, stops: [{ color: "#071117" }, { color: "#100a1d", position: 58 }, { color: "#07090c", position: 100 }] }, "gradient.accent": { type: "linear", angle: 110, stops: [{ color: "#d5f24a" }, { color: "#39d9e6", position: 50 }, { color: "#ff62ad", position: 100 }] }, "elevation.shadow.sm": [{ x: "0", y: "0", blur: "16px", spread: "-5px", color: "#39d9e6a6" }], "elevation.shadow.md": [{ x: "0", y: "0", blur: "32px", spread: "-10px", color: "#ff62ada6" }] } }
    }
  },
  {
    id: "oria-y2k", name: "Y2K", category: "visual-style",
    tokens: {
      "typography.font.sans": geometricSans, "typography.font.display": geometricSans, "typography.letterSpacing.wide": "0.04em",
      ...radiusScale("0.5rem", "1rem", "1.5rem", "2.25rem", "3.25rem", "4rem"),
      ...backdropBlurScale(20), "effect.backdropSaturation": 1.6,
      "elevation.shadow.highlight": [{ x: "0", y: "2px", blur: "2px", spread: "0", color: "#ffffffd9", inset: true }],
      "elevation.shadow.md": [{ x: "0", y: "16px", blur: "36px", spread: "-18px", color: "#5968a64d" }, { x: "0", y: "2px", blur: "2px", spread: "0", color: "#ffffffd9", inset: true }],
      "motion.duration.normal": "260ms", "motion.easing.emphasized": [0.34, 1.56, 0.64, 1]
    },
    modes: {
      light: { colors: { background: "#f2f5fa", foreground: "#262c40", surface: "#e4e9f3", raised: "#ffffff", primary: ["#526ab8", "#465ba2", "#3a4c89", "#ffffff"], secondary: ["#d8e7f2", "#c8dce9", "#b5cddd", "#293e50"], muted: ["#e7ebf2", "#626b7d"], accent: ["#f2d8eb", "#6c3357"], border: ["#ffffffd9", "#9da9bd"], input: "#fafdff", ring: "#6079c7", selection: ["#d1d7f0", "#344064"], charts: ["#526ab8", "#3a8c87", "#ba5c8f", "#7d57ad", "#bd7b31", "#4183a4", "#718b46", "#a95e9d"] }, tokens: { "gradient.background": { type: "linear", angle: 135, stops: [{ color: "#d7e7f5" }, { color: "#e7ddfa", position: 48 }, { color: "#f6dcea", position: 100 }] }, "gradient.surface": { type: "linear", angle: 150, stops: [{ color: "#ffffff" }, { color: "#d9e0eb", position: 42 }, { color: "#ffffff", position: 70 }, { color: "#d9d5ef", position: 100 }] }, "gradient.accent": { type: "linear", angle: 120, stops: [{ color: "#8ee8f0" }, { color: "#9a8ceb", position: 50 }, { color: "#f08bc1", position: 100 }] } } },
      dark: { colors: { background: "#111421", foreground: "#f3f5ff", surface: "#1d2234", raised: "#292f44", overlay: "#242a3d", primary: ["#99aff5", "#afc0f7", "#8299e8", "#1d2853"], secondary: ["#324353", "#3d5061", "#485e70", "#f1f8ff"], muted: ["#252b3d", "#b7bed2"], accent: ["#503147", "#ffe0f2"], border: ["#ffffff2e", "#68738f"], input: "#1c2335", ring: "#a2b6f6", selection: ["#4c5687", "#fafaff"], charts: ["#99aff5", "#7dd1ca", "#ed91bd", "#b99be9", "#e8b270", "#84c0d9", "#acbd75", "#df96d3"] }, tokens: { "gradient.background": { type: "linear", angle: 135, stops: [{ color: "#172f42" }, { color: "#302653", position: 48 }, { color: "#4a233d", position: 100 }] }, "gradient.surface": { type: "linear", angle: 150, stops: [{ color: "#414b61" }, { color: "#22293b", position: 42 }, { color: "#4b5366", position: 70 }, { color: "#2e294c", position: 100 }] }, "gradient.accent": { type: "linear", angle: 120, stops: [{ color: "#7ce8ef" }, { color: "#a493f4", position: 50 }, { color: "#f390c3", position: 100 }] }, "elevation.shadow.highlight": [{ x: "0", y: "2px", blur: "2px", spread: "0", color: "#ffffff59", inset: true }], "elevation.shadow.md": [{ x: "0", y: "18px", blur: "42px", spread: "-18px", color: "#000000bf" }, { x: "0", y: "2px", blur: "2px", spread: "0", color: "#ffffff4d", inset: true }] } }
    }
  },
  {
    id: "oria-retro-terminal", name: "Retro Terminal", category: "visual-style",
    tokens: {
      "typography.font.sans": mono, "typography.font.mono": mono, "typography.font.display": mono, "typography.letterSpacing.normal": "0.02em", "typography.letterSpacing.wide": "0.08em", "typography.letterSpacing.wider": "0.1em", "typography.letterSpacing.widest": "0.14em",
      ...radiusScale("0", "0", "0", "0", "0", "0"), "shape.borderWidth.strong": "1px",
      "elevation.shadow.2xs": [], "elevation.shadow.xs": [], "elevation.shadow.sm": [], "elevation.shadow.md": [{ x: "0", y: "0", blur: "18px", spread: "-8px", color: "#2ee66f73" }],
      "motion.duration.fast": "50ms", "motion.duration.normal": "90ms", "motion.duration.slow": "150ms", "motion.easing.standard": [0, 0, 1, 1]
    },
    modes: {
      light: { colors: { background: "#eef4e9", foreground: "#17351e", surface: "#dfead8", raised: "#f7fbf4", primary: ["#1c6a36", "#175a2e", "#124a26", "#ffffff"], secondary: ["#ceddc6", "#bed2b5", "#abc5a0", "#1b3b21"], muted: ["#dce7d5", "#526b55"], accent: ["#efe0b7", "#634a14"], border: ["#97af91", "#496a4d"], input: "#edf5e8", ring: "#227b40", selection: ["#b7d6ae", "#1b3f23"], charts: ["#1c6a36", "#8a6a20", "#29737b", "#674f87", "#98465b", "#38735b", "#64752a", "#825476"] } },
      dark: { colors: { background: "#041008", foreground: "#b9f5c8", surface: "#081a0e", raised: "#0d2514", overlay: "#0a2011", primary: ["#5de67f", "#79ec95", "#43d76a", "#073518"], secondary: ["#123a20", "#184a29", "#1e5a32", "#d8fbe0"], muted: ["#0b2413", "#91c99d"], accent: ["#4a3610", "#ffe39a"], border: ["#1b5730", "#41945b"], input: "#06180c", ring: "#65e986", selection: ["#246b39", "#effff3"], charts: ["#5de67f", "#f1c35f", "#55ced2", "#b091e0", "#e57f96", "#67c79d", "#b4cf5d", "#d28bc1"] }, tokens: { "elevation.shadow.md": [{ x: "0", y: "0", blur: "20px", spread: "-8px", color: "#5de67f8f" }] } }
    }
  },
  {
    id: "oria-paper", name: "Paper", category: "visual-style",
    tokens: {
      "typography.font.serif": readingSerif, "typography.font.display": readingSerif, "typography.lineHeight.normal": 1.58, "typography.lineHeight.relaxed": 1.78,
      ...radiusScale("0", "0.125rem", "0.25rem", "0.375rem", "0.5rem", "0.75rem"),
      "elevation.shadow.sm": [{ x: "0", y: "2px", blur: "3px", spread: "-1px", color: "#3d2e1c24" }], "elevation.shadow.md": [{ x: "1px", y: "4px", blur: "8px", spread: "-4px", color: "#3d2e1c38" }], "elevation.shadow.inner": [{ x: "0", y: "1px", blur: "2px", spread: "0", color: "#7a624126", inset: true }],
      "motion.duration.normal": "190ms", "motion.easing.standard": [0.25, 0.1, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#f7f1e3", foreground: "#302a22", surface: "#eee5d3", raised: "#fffaf0", primary: ["#3f4e78", "#354267", "#2c3756", "#ffffff"], secondary: ["#e1d5bf", "#d4c5ab", "#c4b294", "#362f25"], muted: ["#eae2d3", "#6a6052"], accent: ["#ead8b1", "#5c4517"], border: ["#d3c3a8", "#9b8768"], input: "#fcf7ed", ring: "#4a5c88", selection: ["#ccd1e2", "#303956"], charts: ["#3f4e78", "#4e7258", "#9a6b33", "#795883", "#9f5561", "#4f7580", "#747638", "#8c5a78"] }, tokens: { "gradient.surface": { type: "linear", angle: 170, stops: [{ color: "#fffaf0" }, { color: "#f5ecd9", position: 100 }] } } },
      dark: { colors: { background: "#201c17", foreground: "#f2eadc", surface: "#2c261f", raised: "#373028", overlay: "#322b24", primary: ["#a6b3dd", "#b9c4e4", "#929fd0", "#202a4a"], secondary: ["#463c31", "#54483b", "#625548", "#f6eee1"], muted: ["#322c25", "#c2b6a5"], accent: ["#4b3c20", "#f0dbab"], border: ["#4c4135", "#796a57"], input: "#28221c", ring: "#aebae0", selection: ["#515b7d", "#fbf9ff"], charts: ["#a6b3dd", "#8fba99", "#d0a36f", "#b79bc0", "#d0929a", "#8db5bc", "#acb476", "#c69ab8"] }, tokens: { "gradient.surface": { type: "linear", angle: 170, stops: [{ color: "#393129" }, { color: "#2b251f", position: 100 }] }, "elevation.shadow.md": [{ x: "1px", y: "5px", blur: "10px", spread: "-4px", color: "#00000099" }] } }
    }
  },
  {
    id: "oria-dashboard", name: "Dashboard", category: "design-language",
    tokens: {
      "typography.font.sans": developerSans, "typography.font.display": developerSans, "typography.font.mono": mono,
      "typography.size.xs": "0.6875rem", "typography.size.sm": "0.8125rem", "spacing.density": 0.76,
      "control.height.sm": "1.625rem", "control.height.md": "2rem", "control.height.lg": "2.5rem", "control.paddingInline.sm": "0.5rem", "control.paddingInline.md": "0.75rem",
      ...radiusScale("0.125rem", "0.25rem", "0.375rem", "0.5rem", "0.625rem", "0.75rem"),
      "elevation.shadow.sm": [{ x: "0", y: "1px", blur: "3px", spread: "0", color: "#1322351f" }], "elevation.shadow.md": [{ x: "0", y: "6px", blur: "16px", spread: "-8px", color: "#13223533" }],
      "motion.duration.fast": "90ms", "motion.duration.normal": "140ms", "motion.easing.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#f4f6f8", foreground: "#1b2733", surface: "#e9edf1", raised: "#ffffff", primary: ["#315f92", "#28527f", "#21456b", "#ffffff"], secondary: ["#dce3e9", "#ced8e0", "#bdcad5", "#243541"], muted: ["#e7ebef", "#5d6b77"], accent: ["#e7e2f4", "#514675"], border: ["#d5dce2", "#99a7b2"], input: "#fbfcfd", ring: "#3b6fa5", selection: ["#c5d9ec", "#263e57"], charts: ["#315f92", "#24806b", "#b06b22", "#7556a5", "#bd536b", "#3b7f99", "#71822c", "#9c5d8e"] } },
      dark: { colors: { background: "#0e151c", foreground: "#eaf0f4", surface: "#161f28", raised: "#1e2a35", overlay: "#1a252f", primary: ["#72a8db", "#8ab8e2", "#5896cc", "#0d2a42"], secondary: ["#283642", "#334350", "#3e5060", "#eef4f7"], muted: ["#1c2730", "#aab9c4"], accent: ["#302948", "#e1d9fa"], border: ["#2d3a45", "#596a77"], input: "#17232c", ring: "#7baedf", selection: ["#2c5578", "#f2f8fd"], charts: ["#72a8db", "#5bc3a8", "#e7a45e", "#aa8be0", "#e68196", "#69b3ce", "#a9b966", "#d18dc1"] }, tokens: { "elevation.shadow.md": [{ x: "0", y: "7px", blur: "20px", spread: "-9px", color: "#000000b3" }] } }
    }
  },
  {
    id: "oria-editorial", name: "Editorial", category: "design-language",
    tokens: {
      "typography.font.serif": editorialSerif, "typography.font.display": editorialSerif,
      "typography.size.xl": "1.375rem", "typography.size.2xl": "1.875rem", "typography.size.3xl": "2.75rem", "typography.size.4xl": "4.5rem", "typography.size.5xl": "6rem", "typography.size.6xl": "7.5rem", "typography.size.7xl": "9rem", "typography.size.8xl": "12rem", "typography.size.9xl": "16rem",
      "typography.lineHeight.tight": 0.98, "typography.lineHeight.normal": 1.58, "typography.lineHeight.relaxed": 1.84, "typography.letterSpacing.tight": "-0.045em",
      "spacing.density": 1.16, ...radiusScale("0", "0", "0.125rem", "0.25rem", "0.375rem", "0.5rem"),
      "elevation.shadow.2xs": [], "elevation.shadow.xs": [], "elevation.shadow.sm": [], "elevation.shadow.md": [], "elevation.shadow.lg": [],
      "motion.duration.normal": "180ms", "motion.easing.standard": [0.25, 0.1, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#faf8f3", foreground: "#191815", surface: "#f0ede6", raised: "#fffefb", primary: ["#9b3028", "#862820", "#70211b", "#ffffff"], secondary: ["#e5e0d5", "#d9d2c5", "#c8bead", "#25221d"], muted: ["#eeebe4", "#625f58"], accent: ["#efe0bc", "#5d4616"], border: ["#d8d1c4", "#777169"], input: "#fffefb", ring: "#9b3028", selection: ["#e8c1b8", "#3f211d"], charts: ["#9b3028", "#1e5e75", "#61723b", "#8a5b2f", "#5c4f82", "#b06a3d", "#3e7063", "#8f5263"] } },
      dark: { colors: { background: "#171614", foreground: "#f3efe7", surface: "#22201d", raised: "#2b2824", overlay: "#26231f", primary: ["#e78d80", "#efa397", "#da7568", "#3b1511"], secondary: ["#39352f", "#454039", "#514b43", "#f6f1e8"], muted: ["#292622", "#c0bab0"], accent: ["#4a3d20", "#f2dfaa"], border: ["#413c35", "#746d63"], input: "#211f1c", ring: "#eb9589", selection: ["#6f3b34", "#fff8f3"], charts: ["#e78d80", "#72acc0", "#a9ba78", "#c99a66", "#a99bcd", "#dc9d75", "#7fb7aa", "#cc8fa0"] } }
    }
  },
  {
    id: "oria-ai-native", name: "AI Native", category: "design-language",
    tokens: {
      "typography.font.sans": humanistSans, "typography.font.display": humanistSans,
      ...radiusScale("0.375rem", "0.625rem", "1rem", "1.5rem", "2rem", "2.5rem"),
      ...backdropBlurScale(18), "effect.backdropSaturation": 1.2,
      "elevation.shadow.sm": [{ x: "0", y: "4px", blur: "14px", spread: "-8px", color: "#5147992b" }], "elevation.shadow.md": [{ x: "0", y: "14px", blur: "34px", spread: "-18px", color: "#51479947" }],
      "motion.duration.normal": "240ms", "motion.duration.slow": "380ms", "motion.easing.emphasized": [0.16, 1, 0.3, 1]
    },
    modes: {
      light: { colors: { background: "#f8f8fc", foreground: "#242336", surface: "#eeeefa", raised: "#ffffff", overlay: "#fafaff", primary: ["#5c53a7", "#4e4696", "#423b82", "#ffffff"], secondary: ["#e2e1f3", "#d4d2eb", "#c4c1e0", "#302d4d"], muted: ["#ececf3", "#626178"], accent: ["#dff3ed", "#235c50"], border: ["#dad9e8", "#a6a3bc"], ring: "#6b62b8", selection: ["#d5d1ef", "#35305d"], charts: ["#5c53a7", "#318375", "#b26b3e", "#3c75a5", "#a74f78", "#79893e", "#8d5aad", "#b58a2e"] }, tokens: { "gradient.background": { type: "radial", position: "top", stops: [{ color: "#ebe7ff" }, { color: "#e7f6f2", position: 52 }, { color: "#f8f8fc", position: 100 }] }, "gradient.accent": { type: "linear", angle: 120, stops: [{ color: "#7669d6" }, { color: "#45a995", position: 100 }] } } },
      dark: { colors: { background: "#101018", foreground: "#f1f0fa", surface: "#1a1927", raised: "#242237", overlay: "#201e30", primary: ["#a9a1ed", "#bbb5f3", "#958bdf", "#211c4d"], secondary: ["#312e48", "#3b3756", "#464164", "#f4f2fc"], muted: ["#211f30", "#b4b0c8"], accent: ["#193d39", "#c9f3e9"], border: ["#343145", "#5e5974"], ring: "#b1aaf0", selection: ["#4b4579", "#f8f6ff"], charts: ["#a9a1ed", "#72c7b6", "#e3a078", "#78aed6", "#dc86aa", "#a9ba70", "#c596df", "#ddbb6b"] }, tokens: { "gradient.background": { type: "radial", position: "top", stops: [{ color: "#29234f" }, { color: "#163d3b", position: 55 }, { color: "#101018", position: 100 }] }, "gradient.accent": { type: "linear", angle: 120, stops: [{ color: "#9c8ff0" }, { color: "#54c7ae", position: 100 }] }, "elevation.shadow.md": [{ x: "0", y: "16px", blur: "38px", spread: "-18px", color: "#000000b8" }] } }
    }
  },
  {
    id: "oria-command-center", name: "Command Center", category: "design-language",
    tokens: {
      "typography.font.sans": mono, "typography.font.mono": mono, "typography.font.display": mono,
      "typography.size.xs": "0.6875rem", "typography.size.sm": "0.8125rem", "typography.letterSpacing.normal": "0.01em", "spacing.density": 0.75,
      "control.height.sm": "1.5rem", "control.height.md": "1.875rem", "control.height.lg": "2.25rem", "control.paddingInline.sm": "0.5rem", "control.paddingInline.md": "0.625rem", "control.paddingInline.lg": "0.75rem",
      ...radiusScale("0", "0", "0.125rem", "0.125rem", "0.25rem", "0.25rem"),
      "elevation.shadow.2xs": [], "elevation.shadow.xs": [], "elevation.shadow.sm": [], "elevation.shadow.md": [{ x: "0", y: "0", blur: "0", spread: "1px", color: "#0f6f754d" }],
      "motion.duration.fast": "70ms", "motion.duration.normal": "110ms", "motion.duration.slow": "180ms", "motion.easing.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#f2f5f4", foreground: "#142426", surface: "#e5ecea", raised: "#fbfdfc", primary: ["#126b70", "#0e5c61", "#0b4d51", "#ffffff"], secondary: ["#d4dfdc", "#c5d4d0", "#b3c6c1", "#1a2d2f"], muted: ["#e1e8e6", "#536b6c"], accent: ["#dce9cd", "#405b24"], border: ["#c4d0cd", "#728b89"], ring: "#167b80", selection: ["#b9dddd", "#183d40"], charts: ["#126b70", "#4f7628", "#9b651f", "#6c568d", "#a24557", "#2d6f9b", "#66742b", "#8b4f78"] } },
      dark: { colors: { background: "#060a0b", foreground: "#dce9e7", surface: "#0c1214", raised: "#121a1d", overlay: "#0f1719", primary: ["#62d7d8", "#82e1e1", "#43c4c6", "#073537"], secondary: ["#172225", "#1f2d30", "#28383c", "#e5efed"], muted: ["#111a1c", "#9cb4b2"], accent: ["#25351b", "#d8efb7"], border: ["#203034", "#426064"], input: "#0b1416", ring: "#69dddd", selection: ["#195457", "#efffff"], charts: ["#62d7d8", "#9dcc68", "#e1ad62", "#ac91d6", "#e48193", "#6db4df", "#b6c966", "#d38ebc"] }, tokens: { "elevation.shadow.md": [{ x: "0", y: "0", blur: "18px", spread: "-8px", color: "#57e2e673" }] } }
    }
  },
  {
    id: "oria-spatial-ui", name: "Spatial UI", category: "design-language",
    tokens: {
      "typography.font.sans": systemSans, "typography.font.display": systemSans,
      ...radiusScale("0.5rem", "0.75rem", "1.25rem", "1.75rem", "2.5rem", "3.5rem"),
      ...backdropBlurScale(36), "effect.backdropSaturation": 1.35, "effect.opacity.overlay": 0.82,
      "elevation.shadow.sm": [{ x: "0", y: "8px", blur: "24px", spread: "-12px", color: "#14213d52" }, { x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffff73", inset: true }],
      "elevation.shadow.md": [{ x: "0", y: "28px", blur: "64px", spread: "-28px", color: "#0c153880" }, { x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffff80", inset: true }],
      "motion.duration.normal": "280ms", "motion.duration.slow": "460ms", "motion.easing.emphasized": [0.16, 1, 0.3, 1]
    },
    modes: {
      light: { colors: { background: "#eef3f8", foreground: "#18283d", surface: "#e1eaf3", raised: "#ffffff", overlay: "#f7fbff", primary: ["#3569a7", "#2c5b93", "#244d7e", "#ffffff"], secondary: ["#d8e2ec", "#c9d7e3", "#b7c8d7", "#24384b"], muted: ["#e5ebf1", "#566a7b"], accent: ["#e5dff5", "#544375"], border: ["#d4e0ea", "#9fb3c4"], input: "#f9fcff", ring: "#427ab6", selection: ["#c7dff2", "#233f58"], charts: ["#3569a7", "#2e887d", "#765eb0", "#b85e78", "#b8782e", "#477e9f", "#6b843e", "#9b6099"] }, tokens: { "gradient.background": { type: "radial", position: "top", stops: [{ color: "#d8e7f7" }, { color: "#e9e3f6", position: 52 }, { color: "#eef3f8", position: 100 }] }, "gradient.surface": { type: "linear", angle: 135, stops: [{ color: "#ffffffeb" }, { color: "#dbe9f6a3", position: 100 }] } } },
      dark: { colors: { background: "#070b16", foreground: "#eef3ff", surface: "#121a2b", raised: "#1b263b", overlay: "#172136", primary: ["#82b7f2", "#9bc6f5", "#69a5e8", "#0d2947"], secondary: ["#26334a", "#30405a", "#3a4d6a", "#f1f5ff"], muted: ["#19243a", "#aebcd1"], accent: ["#352b55", "#e9dcff"], border: ["#31405a", "#5d708d"], input: "#111c30", ring: "#8bbef4", selection: ["#315b8a", "#f6faff"], charts: ["#82b7f2", "#70d0c1", "#a995eb", "#ed8ca9", "#e7b370", "#75bddb", "#a9bf70", "#d597d0"] }, tokens: { "gradient.background": { type: "radial", position: "top", stops: [{ color: "#172e58" }, { color: "#2b1d4c", position: 48 }, { color: "#070b16", position: 100 }] }, "gradient.surface": { type: "linear", angle: 135, stops: [{ color: "#2c3c5bc7" }, { color: "#171c35a3", position: 100 }] }, "elevation.shadow.md": [{ x: "0", y: "32px", blur: "72px", spread: "-30px", color: "#000000d9" }, { x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffff33", inset: true }] } }
    }
  },
  {
    id: "oria-mono", name: "Mono", category: "visual-style",
    tokens: {
      "typography.font.sans": systemSans, "typography.font.display": systemSans, "typography.letterSpacing.tight": "-0.03em",
      ...radiusScale("0", "0.125rem", "0.25rem", "0.375rem", "0.5rem", "0.75rem"),
      "elevation.shadow.sm": [{ x: "0", y: "2px", blur: "6px", spread: "-3px", color: "#0000001f" }], "elevation.shadow.md": [{ x: "0", y: "10px", blur: "24px", spread: "-14px", color: "#0000003d" }],
      "motion.duration.normal": "180ms", "motion.easing.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#f7f7f7", foreground: "#161616", surface: "#ededed", raised: "#ffffff", primary: ["#242424", "#353535", "#101010", "#ffffff"], secondary: ["#dedede", "#d2d2d2", "#c3c3c3", "#1f1f1f"], muted: ["#e9e9e9", "#626262"], accent: ["#d9d9d9", "#292929"], border: ["#d2d2d2", "#888888"], input: "#ffffff", ring: "#404040", selection: ["#c8c8c8", "#171717"], charts: ["#171717", "#343434", "#505050", "#6c6c6c", "#878787", "#a1a1a1", "#b9b9b9", "#d0d0d0"] } },
      dark: { colors: { background: "#121212", foreground: "#eeeeee", surface: "#1c1c1c", raised: "#272727", overlay: "#222222", primary: ["#e5e5e5", "#ffffff", "#cccccc", "#171717"], secondary: ["#303030", "#3a3a3a", "#464646", "#f2f2f2"], muted: ["#242424", "#b8b8b8"], accent: ["#373737", "#f0f0f0"], border: ["#383838", "#707070"], input: "#1d1d1d", ring: "#d9d9d9", selection: ["#545454", "#ffffff"], charts: ["#eeeeee", "#d5d5d5", "#bbbbbb", "#a2a2a2", "#898989", "#707070", "#585858", "#414141"] }, tokens: { "elevation.shadow.md": [{ x: "0", y: "12px", blur: "28px", spread: "-14px", color: "#000000cc" }] } }
    }
  },
  {
    id: "oria-minimalism", name: "Minimalism", category: "visual-style",
    tokens: {
      "typography.font.sans": humanistSans, "typography.font.display": humanistSans, "typography.letterSpacing.tight": "-0.025em",
      "spacing.density": 1.2, ...radiusScale("0", "0.125rem", "0.25rem", "0.375rem", "0.5rem", "0.75rem"),
      "shape.borderWidth.strong": "1px", "elevation.shadow.2xs": [], "elevation.shadow.xs": [], "elevation.shadow.sm": [], "elevation.shadow.md": [], "elevation.shadow.lg": [],
      "elevation.shadow.xl": [], "elevation.shadow.2xl": [], "elevation.shadow.inner": [], "elevation.shadow.highlight": [],
      "motion.duration.normal": "160ms", "motion.easing.standard": [0.25, 0.1, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#fafafa", foreground: "#171717", surface: "#f3f3f3", raised: "#ffffff", primary: ["#202020", "#303030", "#0a0a0a", "#ffffff"], secondary: ["#e8e8e8", "#dedede", "#cecece", "#202020"], muted: ["#f0f0f0", "#686868"], accent: ["#e2e2e2", "#242424"], border: ["#dedede", "#8a8a8a"], input: "#ffffff", ring: "#2b2b2b", selection: ["#d3d3d3", "#161616"], charts: ["#171717", "#303030", "#494949", "#626262", "#7b7b7b", "#949494", "#adadad", "#c6c6c6"] }, tokens: { "color.destructive": "#202020", "color.destructiveForeground": "#ffffff", "color.success": "#3d3d3d", "color.successForeground": "#ffffff", "color.warning": "#565656", "color.warningForeground": "#ffffff", "color.info": "#6f6f6f", "color.infoForeground": "#ffffff" } },
      dark: { colors: { background: "#101010", foreground: "#f0f0f0", surface: "#181818", raised: "#222222", overlay: "#1e1e1e", primary: ["#d4d4d4", "#eeeeee", "#b8b8b8", "#151515"], secondary: ["#2b2b2b", "#363636", "#444444", "#f2f2f2"], muted: ["#212121", "#b8b8b8"], accent: ["#333333", "#f1f1f1"], border: ["#343434", "#717171"], input: "#171717", ring: "#d4d4d4", selection: ["#4c4c4c", "#ffffff"], charts: ["#eeeeee", "#d3d3d3", "#b9b9b9", "#9f9f9f", "#858585", "#6b6b6b", "#515151", "#373737"] }, tokens: { "color.destructive": "#eeeeee", "color.destructiveForeground": "#101010", "color.success": "#d0d0d0", "color.successForeground": "#101010", "color.warning": "#b2b2b2", "color.warningForeground": "#101010", "color.info": "#949494", "color.infoForeground": "#101010" } }
    }
  },
  {
    id: "oria-line-art", name: "Line Art", category: "visual-style",
    tokens: {
      "typography.font.sans": geometricSans, "typography.font.display": geometricSans,
      "typography.weight.medium": "500", "typography.weight.semibold": "500", "typography.weight.bold": "600",
      "typography.letterSpacing.wide": "0.04em", "typography.lineHeight.relaxed": 1.7, "spacing.density": 1.12,
      ...radiusScale("0", "0", "0", "0.125rem", "0.125rem", "0.25rem"),
      "shape.borderWidth.hairline": "1px", "shape.borderWidth.default": "1px", "shape.borderWidth.strong": "1px",
      "elevation.shadow.2xs": [], "elevation.shadow.xs": [], "elevation.shadow.sm": [], "elevation.shadow.md": [], "elevation.shadow.lg": [],
      "elevation.shadow.xl": [], "elevation.shadow.2xl": [], "elevation.shadow.inner": [], "elevation.shadow.highlight": [],
      ...backdropBlurScale(0), "effect.backdropSaturation": 1,
      "motion.duration.fast": "90ms", "motion.duration.normal": "150ms", "motion.duration.slow": "220ms", "motion.easing.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#ffffff", foreground: "#111111", surface: "#ffffff", raised: "#ffffff", overlay: "#ffffff", primary: ["#111111", "#2b2b2b", "#000000", "#ffffff"], secondary: ["#ffffff", "#f5f5f5", "#e8e8e8", "#111111"], muted: ["#fafafa", "#606060"], accent: ["#ffffff", "#111111"], border: ["#1f1f1f", "#000000"], input: "#ffffff", ring: "#111111", selection: ["#dcdcdc", "#111111"], charts: ["#111111", "#303030", "#4f4f4f", "#6e6e6e", "#8d8d8d", "#aaaaaa", "#c7c7c7", "#e2e2e2"] }, tokens: { "color.destructive": "#111111", "color.destructiveForeground": "#ffffff", "color.success": "#303030", "color.successForeground": "#ffffff", "color.warning": "#4f4f4f", "color.warningForeground": "#ffffff", "color.info": "#686868", "color.infoForeground": "#ffffff" } },
      dark: { colors: { background: "#0a0a0a", foreground: "#f5f5f5", surface: "#0a0a0a", raised: "#0a0a0a", overlay: "#0a0a0a", primary: ["#f5f5f5", "#ffffff", "#d8d8d8", "#0a0a0a"], secondary: ["#0a0a0a", "#151515", "#202020", "#f5f5f5"], muted: ["#111111", "#bdbdbd"], accent: ["#0a0a0a", "#f5f5f5"], border: ["#e5e5e5", "#ffffff"], input: "#0a0a0a", ring: "#f5f5f5", selection: ["#444444", "#ffffff"], charts: ["#f5f5f5", "#d7d7d7", "#b9b9b9", "#9b9b9b", "#7d7d7d", "#5f5f5f", "#414141", "#232323"] }, tokens: { "color.destructive": "#f5f5f5", "color.destructiveForeground": "#0a0a0a", "color.success": "#d7d7d7", "color.successForeground": "#0a0a0a", "color.warning": "#b9b9b9", "color.warningForeground": "#0a0a0a", "color.info": "#9b9b9b", "color.infoForeground": "#0a0a0a" } }
    }
  },
  {
    id: "oria-glass", name: "Glass", category: "visual-style",
    tokens: {
      "typography.font.sans": systemSans, "typography.font.display": systemSans,
      "typography.weight.medium": "500", "typography.weight.semibold": "600",
      ...radiusScale("0.25rem", "0.5rem", "0.75rem", "0.9rem", "1.25rem", "1.75rem"),
      "shape.borderWidth.hairline": "1px", "shape.borderWidth.default": "1px", "shape.borderWidth.strong": "1px",
      ...backdropBlurScale(30), "effect.backdropSaturation": 1.38, "effect.opacity.overlay": 0.78,
      "elevation.shadow.xs": [{ x: "0", y: "1px", blur: "4px", spread: "0", color: "#102c3d0d" }, { x: "0", y: "-1px", blur: "0", spread: "0", color: "#ffffffc7", inset: true }],
      "elevation.shadow.sm": [{ x: "0", y: "4px", blur: "12px", spread: "-6px", color: "#102c3d1a" }, { x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffffd1", inset: true }],
      "elevation.shadow.md": [{ x: "0", y: "12px", blur: "32px", spread: "-16px", color: "#102c3d2e" }, { x: "0", y: "-1px", blur: "0", spread: "0", color: "#ffffffeb" }, { x: "-1px", y: "0", blur: "0", spread: "0", color: "#ffffffb8" }, { x: "0", y: "1px", blur: "0", spread: "0", color: "#78909e42" }, { x: "1px", y: "0", blur: "0", spread: "0", color: "#78909e33" }, { x: "0", y: "-10px", blur: "10px", spread: "-5px", color: "#ffffffb3", inset: true }, { x: "0", y: "10px", blur: "10px", spread: "-5px", color: "#ffffff8f", inset: true }],
      "elevation.shadow.lg": [{ x: "0", y: "18px", blur: "42px", spread: "-20px", color: "#102c3d38" }, { x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffffd9", inset: true }, { x: "0", y: "-12px", blur: "14px", spread: "-7px", color: "#ffffff99", inset: true }],
      "elevation.shadow.xl": [{ x: "0", y: "24px", blur: "56px", spread: "-24px", color: "#102c3d42" }, { x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffffd9", inset: true }],
      "elevation.shadow.2xl": [{ x: "0", y: "32px", blur: "72px", spread: "-30px", color: "#102c3d4d" }, { x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffffd9", inset: true }],
      "elevation.shadow.inner": [{ x: "0", y: "-10px", blur: "10px", spread: "-5px", color: "#ffffff99", inset: true }, { x: "0", y: "10px", blur: "10px", spread: "-5px", color: "#ffffffb3", inset: true }],
      "elevation.shadow.highlight": [{ x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffff", inset: true }, { x: "-1px", y: "0", blur: "0", spread: "0", color: "#ffffffb8", inset: true }, { x: "0", y: "-1px", blur: "0", spread: "0", color: "#ffffff", inset: true }, { x: "1px", y: "0", blur: "0", spread: "0", color: "#78909e33", inset: true }, { x: "0", y: "-10px", blur: "10px", spread: "-5px", color: "#ffffff99", inset: true }, { x: "0", y: "10px", blur: "10px", spread: "-5px", color: "#ffffffb3", inset: true }],
      "motion.duration.fast": "130ms", "motion.duration.normal": "210ms", "motion.duration.slow": "340ms", "motion.easing.standard": [0.2, 0, 0, 1], "motion.easing.emphasized": [0.16, 1, 0.3, 1]
    },
    modes: {
      light: { colors: { background: "#e9eef2", foreground: "#17222b", surface: "#eef4f7", raised: "#f8f8f880", overlay: "#f3f8fa", primary: ["#20aeea", "#149cd5", "#087eaf", "#071a22"], secondary: ["#f7fafb", "#edf3f6", "#dee8ed", "#192832"], muted: ["#e3ebef", "#52646f"], accent: ["#cfeffc", "#16465c"], border: ["#ffffff10", "#9fb1bd"], input: "#f5f9fb", ring: "#148fc4", selection: ["#b8e8fa", "#103749"], scrim: "#08131bb8", charts: ["#0e748e", "#157872", "#137b5b", "#507705", "#8d5e05", "#a24d15", "#b4256c", "#6c4ec5"] }, tokens: { "gradient.surface": { type: "linear", angle: 135, stops: [{ color: "#ffffffd6" }, { color: "#ffffff50", position: 55 }, { color: "#ffffff10", position: 100 }] }, "gradient.accent": { type: "linear", angle: 115, stops: [{ color: "#4ac5ff" }, { color: "#82dcff", position: 58 }] } } },
      dark: { colors: { background: "#121315", foreground: "#eef6fb", surface: "#181818", raised: "#101010a0", overlay: "#181818", primary: ["#4bc5ff", "#72d2ff", "#2ab5eb", "#06202c"], secondary: ["#1e2a32", "#26343e", "#30414d", "#eef7fb"], muted: ["#121212", "#aebdc6"], accent: ["#252525", "#c9efff"], border: ["#ffffff10", "#ffffff10"], input: "#121212", ring: "#5bd0ff", selection: ["#5bd0ff", "#f2fbff"], scrim: "#000000a0", charts: ["#7dc7df", "#80cbc3", "#80cdad", "#a3ca75", "#e5b064", "#fba171", "#fb97bd", "#baaefd"] }, tokens: { "gradient.surface": { type: "linear", angle: 94, stops: [{ color: "#1e1d24" }, { color: "#181818", position: 33 }, { color: "#0a0a0a", position: 100 }] }, "gradient.accent": { type: "linear", angle: 115, stops: [{ color: "#4ac5ff" }, { color: "#77dcff", position: 58 }] }, "elevation.shadow.xs": [{ x: "0", y: "1px", blur: "4px", spread: "0", color: "#00000033" }, { x: "0", y: "-1px", blur: "0", spread: "0", color: "#ffffff26", inset: true }], "elevation.shadow.sm": [{ x: "0", y: "4px", blur: "12px", spread: "-6px", color: "#00000066" }, { x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffff2e", inset: true }], "elevation.shadow.md": [{ x: "0", y: "14px", blur: "36px", spread: "-16px", color: "#000000a3" }, { x: "0", y: "-1px", blur: "0", spread: "0", color: "#ffffff40" }, { x: "-1px", y: "0", blur: "0", spread: "0", color: "#ffffff2e" }, { x: "0", y: "1px", blur: "0", spread: "0", color: "#00000073" }, { x: "1px", y: "0", blur: "0", spread: "0", color: "#0000005c" }, { x: "0", y: "-10px", blur: "10px", spread: "-5px", color: "#ffffff0d", inset: true }, { x: "0", y: "10px", blur: "10px", spread: "-5px", color: "#ffffff08", inset: true }], "elevation.shadow.lg": [{ x: "0", y: "18px", blur: "42px", spread: "-20px", color: "#000000ad" }, { x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffff33", inset: true }, { x: "0", y: "-12px", blur: "14px", spread: "-7px", color: "#ffffff0d", inset: true }], "elevation.shadow.xl": [{ x: "0", y: "24px", blur: "56px", spread: "-24px", color: "#000000b8" }, { x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffff33", inset: true }], "elevation.shadow.2xl": [{ x: "0", y: "32px", blur: "72px", spread: "-30px", color: "#000000c2" }, { x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffff33", inset: true }], "elevation.shadow.inner": [{ x: "0", y: "-10px", blur: "10px", spread: "-5px", color: "#ffffff0d", inset: true }, { x: "0", y: "10px", blur: "10px", spread: "-5px", color: "#ffffff08", inset: true }], "elevation.shadow.highlight": [{ x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffff40", inset: true }, { x: "-1px", y: "0", blur: "0", spread: "0", color: "#ffffff2e", inset: true }, { x: "0", y: "-1px", blur: "0", spread: "0", color: "#ffffff33", inset: true }, { x: "1px", y: "0", blur: "0", spread: "0", color: "#0000004d", inset: true }, { x: "0", y: "-10px", blur: "10px", spread: "-5px", color: "#ffffff0d", inset: true }, { x: "0", y: "10px", blur: "10px", spread: "-5px", color: "#ffffff08", inset: true }] } }
    }
  },
  {
    id: "oria-forest", name: "Forest", category: "oria",
    tokens: {
      "typography.font.sans": humanistSans, "typography.font.display": editorialSerif,
      "typography.lineHeight.relaxed": 1.74, ...radiusScale("0.25rem", "0.5rem", "0.875rem", "1.375rem", "2rem", "2.75rem"),
      "elevation.shadow.sm": [{ x: "0", y: "3px", blur: "9px", spread: "-4px", color: "#31462b2e" }],
      "elevation.shadow.md": [{ x: "0", y: "12px", blur: "26px", spread: "-12px", color: "#273d2445" }],
      "motion.duration.normal": "240ms", "motion.easing.standard": [0.25, 0.8, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#f5f7ef", foreground: "#20311f", surface: "#e9efe1", raised: "#fcfdf8", primary: ["#376b42", "#2d5a36", "#24492c", "#ffffff"], secondary: ["#d7e3cb", "#c8d9ba", "#b6cca7", "#263b24"], muted: ["#e8ece1", "#5b6e56"], accent: ["#ede2c7", "#624c25"], border: ["#c9d3bd", "#91a685"], input: "#fbfcf7", ring: "#477c50", selection: ["#bfd8b5", "#203a23"], charts: ["#376b42", "#688c45", "#9a7b38", "#4f8174", "#a65f3e", "#6f6594", "#b38a54", "#507642"] }, tokens: { "gradient.background": { type: "linear", angle: 145, stops: [{ color: "#fafbf6" }, { color: "#edf2e5", position: 68 }, { color: "#e3ead8", position: 100 }] }, "gradient.accent": { type: "linear", angle: 115, stops: [{ color: "#426f45" }, { color: "#9b8445", position: 100 }] } } },
      dark: { colors: { background: "#111c13", foreground: "#edf4e8", surface: "#1a291c", raised: "#243625", overlay: "#1d2e1f", primary: ["#98c79b", "#b0d6b1", "#7caf82", "#142417"], secondary: ["#2c442e", "#365238", "#425f43", "#eef6ea"], muted: ["#213323", "#aec0aa"], accent: ["#4b4028", "#f1dfb5"], border: ["#39513a", "#5f775f"], input: "#1b2c1d", ring: "#9fd0a2", selection: ["#3b6540", "#f4f8f0"], charts: ["#98c79b", "#b2ce78", "#d7b66b", "#79b4a6", "#dc8e6c", "#a99bd2", "#c6a170", "#73a77b"] }, tokens: { "gradient.background": { type: "radial", position: "top", stops: [{ color: "#263d29" }, { color: "#111c13", position: 72 }] }, "gradient.accent": { type: "linear", angle: 115, stops: [{ color: "#7eae83" }, { color: "#c0a85f", position: 100 }] }, "elevation.shadow.md": [{ x: "0", y: "12px", blur: "30px", spread: "-12px", color: "#000000a3" }] } }
    }
  },
  {
    id: "oria-aurora", name: "Aurora", category: "visual-style",
    tokens: {
      "typography.font.sans": geometricSans, "typography.font.display": geometricSans,
      "typography.letterSpacing.tight": "-0.03em", ...radiusScale("0.375rem", "0.625rem", "1rem", "1.5rem", "2.25rem", "3rem"),
      ...backdropBlurScale(24), "effect.backdropSaturation": 1.35,
      "elevation.shadow.md": [{ x: "0", y: "12px", blur: "34px", spread: "-15px", color: "#4d7c5f59" }],
      "motion.duration.normal": "260ms", "motion.duration.slow": "420ms", "motion.easing.emphasized": [0.16, 1, 0.3, 1]
    },
    modes: {
      light: { colors: { background: "#f8fbf8", foreground: "#172b2a", surface: "#eef5f1", raised: "#ffffff", overlay: "#f8fbfa", primary: ["#326b63", "#285b54", "#204b46", "#ffffff"], secondary: ["#d7eddf", "#c5e4d1", "#afd8bf", "#213b31"], muted: ["#edf2ef", "#536c67"], accent: ["#e9ddf8", "#543b75"], border: ["#cbded6", "#92b9aa"], ring: "#4b8f7e", selection: ["#c4e7d3", "#1d3b31"], charts: ["#4b8f63", "#4b9b9a", "#635db0", "#9a57a8", "#bd596e", "#7ca640", "#c58c3c", "#397aa0"] }, tokens: { "gradient.background": { type: "radial", position: "top", stops: [{ color: "#c8f4ba" }, { color: "#d9edf7", position: 42 }, { color: "#eee3fa", position: 72 }, { color: "#f8fbf8", position: 100 }] }, "gradient.surface": { type: "linear", angle: 135, stops: [{ color: "#ffffffcc" }, { color: "#ecf7f199", position: 100 }] }, "gradient.accent": { type: "linear", angle: 115, stops: [{ color: "#70cf83" }, { color: "#48b9c7", position: 34 }, { color: "#826ad8", position: 68 }, { color: "#d8739d", position: 100 }] } } },
      dark: { colors: { background: "#071314", foreground: "#ecfaf6", surface: "#102426", raised: "#173033", overlay: "#12282b", primary: ["#8de3ad", "#a9edc0", "#69d192", "#0b2a1a"], secondary: ["#21433a", "#295248", "#336257", "#eaf8f2"], muted: ["#142e2f", "#a4c4be"], accent: ["#33284f", "#e7d9ff"], border: ["#2c4a49", "#4e7270"], ring: "#91e7b1", selection: ["#27654e", "#f2fbf6"], charts: ["#8de3ad", "#6dd7da", "#9d91ed", "#d487e1", "#ef8eaa", "#b9db68", "#efbb69", "#69b6df"] }, tokens: { "gradient.background": { type: "radial", position: "top", stops: [{ color: "#1b573a" }, { color: "#17305a", position: 38 }, { color: "#311d4f", position: 68 }, { color: "#071314", position: 100 }] }, "gradient.surface": { type: "linear", angle: 135, stops: [{ color: "#1d3b3dcc" }, { color: "#18233f99", position: 100 }] }, "gradient.accent": { type: "linear", angle: 115, stops: [{ color: "#86ee9f" }, { color: "#56d7df", position: 34 }, { color: "#9b83ef", position: 68 }, { color: "#ef86ab", position: 100 }] }, "elevation.shadow.md": [{ x: "0", y: "0", blur: "34px", spread: "-10px", color: "#77e7aa73" }] } }
    }
  },
  {
    id: "oria-warm-reading", name: "Warm Reading", category: "brand-product",
    tokens: {
      "typography.font.serif": readingSerif, "typography.font.display": readingSerif,
      "typography.size.md": "1.0625rem", "typography.size.4xl": "3.25rem", "typography.size.5xl": "4.3333rem", "typography.size.6xl": "5.4167rem", "typography.size.7xl": "6.5rem", "typography.size.8xl": "8.6667rem", "typography.size.9xl": "11.5556rem", "typography.lineHeight.normal": 1.62, "typography.lineHeight.relaxed": 1.82,
      "typography.letterSpacing.tight": "-0.018em", "spacing.density": 1.08,
      ...radiusScale("0.125rem", "0.25rem", "0.375rem", "0.5rem", "0.75rem", "1rem"),
      "elevation.shadow.sm": [{ x: "0", y: "2px", blur: "8px", spread: "-4px", color: "#5f3b221f" }],
      "elevation.shadow.md": [{ x: "0", y: "8px", blur: "22px", spread: "-12px", color: "#5f3b2238" }],
      "motion.duration.normal": "180ms", "motion.easing.standard": [0.25, 0.1, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#faf7f0", foreground: "#362c25", surface: "#f2eadf", raised: "#fffdf8", primary: ["#9b4f2f", "#854128", "#6f3522", "#ffffff"], secondary: ["#ead8c6", "#dfc9b5", "#d1b69e", "#3d3028"], muted: ["#efe8de", "#6c5c50"], accent: ["#f1dfc8", "#66451f"], border: ["#ddcdbd", "#b9a18b"], ring: "#a45737", selection: ["#e8c5aa", "#40291d"], charts: ["#9b4f2f", "#7c6d3c", "#467065", "#9b735f", "#6e6282", "#b77832", "#526f46", "#9a5661"] } },
      dark: { colors: { background: "#211a16", foreground: "#f5ede3", surface: "#2f2520", raised: "#3a2d26", overlay: "#342923", primary: ["#e6a17d", "#efb497", "#d88c68", "#3a1c10"], secondary: ["#4b3a31", "#59453a", "#685044", "#f8eee5"], muted: ["#342a24", "#c6b5a8"], accent: ["#4b3823", "#f0d6ac"], border: ["#534238", "#796154"], ring: "#e6a17d", selection: ["#784a36", "#fff8f1"], charts: ["#e6a17d", "#c2b170", "#81b3a5", "#c99b83", "#a99ac2", "#dda565", "#8fad7e", "#d18a96"] }, tokens: { "elevation.shadow.md": [{ x: "0", y: "10px", blur: "24px", spread: "-12px", color: "#0000008c" }] } }
    }
  },
  {
    id: "oria-monochrome-deploy", name: "Monochrome Deploy", category: "brand-product",
    tokens: {
      "typography.font.sans": developerSans, "typography.font.display": developerSans, "typography.font.mono": mono,
      "typography.letterSpacing.tight": "-0.035em", "spacing.density": 0.9,
      ...radiusScale("0.125rem", "0.25rem", "0.375rem", "0.5rem", "0.75rem", "1rem"),
      "shape.borderWidth.strong": "1px", "elevation.shadow.sm": [{ x: "0", y: "1px", blur: "2px", spread: "0", color: "#00000012" }], "elevation.shadow.md": [{ x: "0", y: "6px", blur: "16px", spread: "-8px", color: "#0000002b" }],
      "motion.duration.fast": "100ms", "motion.duration.normal": "150ms", "motion.easing.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#ffffff", foreground: "#171717", surface: "#fafafa", raised: "#ffffff", primary: ["#171717", "#2d2d2d", "#000000", "#ffffff"], secondary: ["#eeeeee", "#e5e5e5", "#d4d4d4", "#1c1c1c"], muted: ["#f2f2f2", "#666666"], accent: ["#e8f2ff", "#174b7a"], border: ["#e5e5e5", "#a3a3a3"], input: "#ffffff", ring: "#404040", selection: ["#d4d4d4", "#171717"], charts: ["#171717", "#4a4a4a", "#737373", "#a3a3a3", "#2563a8", "#3f7c64", "#a46330", "#76518f"] } },
      dark: { colors: { background: "#0a0a0a", foreground: "#ededed", surface: "#141414", raised: "#1f1f1f", overlay: "#1a1a1a", primary: ["#ededed", "#ffffff", "#d4d4d4", "#171717"], secondary: ["#262626", "#303030", "#3d3d3d", "#f5f5f5"], muted: ["#1f1f1f", "#b3b3b3"], accent: ["#152b42", "#c6e1ff"], border: ["#2e2e2e", "#666666"], input: "#171717", ring: "#d4d4d4", selection: ["#525252", "#ffffff"], charts: ["#ededed", "#c7c7c7", "#9b9b9b", "#737373", "#70aee8", "#7ec8aa", "#e0a56f", "#be97d4"] }, tokens: { "elevation.shadow.md": [{ x: "0", y: "8px", blur: "24px", spread: "-10px", color: "#000000cc" }] } }
    }
  },
  {
    id: "oria-precision-flow", name: "Precision Flow", category: "brand-product",
    tokens: {
      "typography.font.sans": developerSans, "typography.font.display": developerSans, "typography.letterSpacing.tight": "-0.025em",
      "spacing.density": 0.82, "control.height.sm": "1.75rem", "control.height.md": "2.25rem", "control.height.lg": "2.75rem",
      ...radiusScale("0.125rem", "0.25rem", "0.375rem", "0.5rem", "0.625rem", "0.75rem"),
      "elevation.shadow.sm": [{ x: "0", y: "1px", blur: "3px", spread: "0", color: "#1714291f" }], "elevation.shadow.md": [{ x: "0", y: "8px", blur: "20px", spread: "-10px", color: "#211a3d45" }],
      "motion.duration.fast": "100ms", "motion.duration.normal": "160ms", "motion.easing.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#f7f8fb", foreground: "#232326", surface: "#eef0f5", raised: "#ffffff", primary: ["#4c5fb3", "#3f50a0", "#34438a", "#ffffff"], secondary: ["#e4e6ed", "#d9dce5", "#cbd0dc", "#292a30"], muted: ["#eceef3", "#626774"], accent: ["#e7e5f6", "#4c467b"], border: ["#d9dce3", "#a7acb8"], ring: "#5b6fc2", selection: ["#cfd5ef", "#2d3560"], charts: ["#4c5fb3", "#477a73", "#7d5da8", "#b46176", "#a97833", "#3f769a", "#687941", "#9a5b8f"] } },
      dark: { colors: { background: "#111114", foreground: "#f4f4f5", surface: "#18181c", raised: "#202026", overlay: "#1c1c21", primary: ["#8996e8", "#a0aaf0", "#717fda", "#17192e"], secondary: ["#292930", "#33333b", "#3e3e48", "#f2f2f5"], muted: ["#202026", "#afb0bb"], accent: ["#2d2946", "#ded8ff"], border: ["#303038", "#585a66"], input: "#1b1b20", ring: "#96a2ed", selection: ["#394579", "#f7f7ff"], charts: ["#8996e8", "#78b2a9", "#b293dc", "#dc8da1", "#d0a366", "#75acd0", "#a1b178", "#cf90c4"] }, tokens: { "elevation.shadow.md": [{ x: "0", y: "10px", blur: "26px", spread: "-12px", color: "#000000b8" }] } }
    }
  },
  {
    id: "oria-manuscript", name: "Manuscript", category: "brand-product",
    tokens: {
      "typography.font.sans": systemSans, "typography.font.display": mono, "typography.font.mono": mono, "typography.font.serif": readingSerif,
      "typography.weight.medium": "500", "typography.weight.semibold": "600", "typography.lineHeight.normal": 1.55, "typography.lineHeight.relaxed": 1.75, "typography.letterSpacing.wide": "0.04em", "spacing.density": 1.04,
      ...radiusScale("0", "0", "0", "0", "0", "0"),
      "shape.borderWidth.hairline": "1px", "shape.borderWidth.default": "1px", "shape.borderWidth.strong": "1px", "elevation.shadow.xs": [{ x: "0", y: "1px", blur: "2px", spread: "-1px", color: "#191a1e12" }], "elevation.shadow.sm": [{ x: "0", y: "3px", blur: "8px", spread: "-6px", color: "#191a1e1c" }], "elevation.shadow.md": [{ x: "0", y: "8px", blur: "24px", spread: "-18px", color: "#191a1e29" }], "elevation.shadow.highlight": [{ x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffffd9", inset: true }],
      "motion.duration.fast": "120ms", "motion.duration.normal": "180ms", "motion.easing.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#eeeeef", foreground: "#26262b", surface: "#e6e6e8", raised: "#fbfbfc", overlay: "#f9f9fa", primary: ["#292a31", "#202127", "#18191e", "#ffffff"], secondary: ["#dedee1", "#d4d4d8", "#c8c8cd", "#303037"], muted: ["#e3e3e6", "#707077"], accent: ["#d8dce1", "#3a444d"], border: ["#ffffffcc", "#d0d0d4"], input: "#fafafb", ring: "#5a6470", selection: ["#d7dce1", "#2b3640"], charts: ["#292a31", "#536c7a", "#3e7e82", "#6d85a3", "#526b91", "#7e9a6c", "#b07d4f", "#977089"] }, tokens: { "gradient.background": { type: "linear", angle: 180, stops: [{ color: "#f3f3f4" }, { color: "#e9e9eb", position: 100 }] }, "gradient.surface": { type: "linear", angle: 180, stops: [{ color: "#fdfdfe" }, { color: "#f5f5f6", position: 100 }] }, "pattern.surface": [{ type: "noise", variant: "paper", color: "#24262b", tileSize: "48px", intensity: 0.03 }] } },
      dark: { colors: { background: "#1b1c21", foreground: "#f0f0f1", surface: "#24252b", raised: "#2d2e35", overlay: "#292a30", primary: ["#e0e1e5", "#f0f0f2", "#c8c9cf", "#202126"], secondary: ["#36373f", "#40414a", "#4a4b55", "#f0f0f2"], muted: ["#2b2c32", "#b8b8c0"], accent: ["#343940", "#e2e6ea"], border: ["#ffffff1f", "#ffffff3b"], input: "#26272d", ring: "#b2c2ce", selection: ["#4b5663", "#f7f8fa"], charts: ["#e0e1e5", "#8aa7b7", "#70b1b3", "#9aafd2", "#8298be", "#a5be91", "#d0a172", "#bb94ae"] }, tokens: { "gradient.background": { type: "linear", angle: 180, stops: [{ color: "#23242a" }, { color: "#1a1b20", position: 100 }] }, "gradient.surface": { type: "linear", angle: 180, stops: [{ color: "#303138" }, { color: "#24252b", position: 100 }] }, "pattern.surface": [{ type: "noise", variant: "paper", color: "#f3f3f5", tileSize: "48px", intensity: 0.025 }], "elevation.shadow.md": [{ x: "0", y: "10px", blur: "28px", spread: "-18px", color: "#0000008f" }], "elevation.shadow.highlight": [{ x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffff1f", inset: true }] } }
    }
  },
  {
    id: "oria-elevated-surface", name: "Elevated Surface", category: "brand-product",
    tokens: {
      "typography.font.sans": ["Roboto", "Noto Sans", "system-ui", "sans-serif"], "typography.font.display": ["Roboto", "Noto Sans", "system-ui", "sans-serif"],
      ...radiusScale("0.25rem", "0.5rem", "0.75rem", "1rem", "1.5rem", "2rem"),
      "elevation.shadow.xs": [{ x: "0", y: "1px", blur: "2px", spread: "0", color: "#1d1b201f" }],
      "elevation.shadow.sm": [{ x: "0", y: "2px", blur: "6px", spread: "-1px", color: "#1d1b2029" }],
      "elevation.shadow.md": [{ x: "0", y: "6px", blur: "16px", spread: "-4px", color: "#1d1b2033" }],
      "elevation.shadow.lg": [{ x: "0", y: "12px", blur: "28px", spread: "-8px", color: "#1d1b203d" }],
      "motion.duration.normal": "220ms", "motion.easing.standard": [0.2, 0, 0, 1], "motion.easing.emphasized": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#fffbfe", foreground: "#1d1b20", surface: "#f7f2fa", raised: "#ffffff", overlay: "#fff7ff", primary: ["#6750a4", "#5b4696", "#4f3c86", "#ffffff"], secondary: ["#e8def8", "#ddd0f2", "#cebee8", "#332d41"], muted: ["#f0eaf2", "#625b66"], accent: ["#f2dfea", "#633b4b"], border: ["#d4cdd6", "#79747e"], ring: "#6750a4", selection: ["#ded0f3", "#31264a"], charts: ["#6750a4", "#006b5f", "#9a4524", "#78536a", "#416277", "#6a5d00", "#8c4a60", "#366a50"] } },
      dark: { colors: { background: "#141218", foreground: "#e6e0e9", surface: "#211f26", raised: "#2b2930", overlay: "#27242d", primary: ["#d0bcff", "#dccaff", "#bda6ef", "#381e72"], secondary: ["#4a4458", "#554f63", "#625b70", "#f2ecfa"], muted: ["#2b2930", "#cac4d0"], accent: ["#523541", "#ffd8e4"], border: ["#49454f", "#938f99"], ring: "#d0bcff", selection: ["#4f3d78", "#f9f4ff"], charts: ["#d0bcff", "#4fd8c4", "#ffb59b", "#e0a8c3", "#98cbea", "#d9c95e", "#f1a6bc", "#87d3aa"] }, tokens: { "elevation.shadow.md": [{ x: "0", y: "7px", blur: "20px", spread: "-5px", color: "#00000099" }] } }
    }
  },
  {
    id: "oria-bento-ui", name: "Bento UI", category: "design-language",
    tokens: {
      "typography.font.sans": systemSans, "typography.font.display": systemSans, "typography.weight.semibold": "600",
      "spacing.density": 1.04, ...radiusScale("0.5rem", "0.75rem", "1rem", "1.5rem", "2rem", "2.5rem"),
      "elevation.shadow.sm": [{ x: "0", y: "4px", blur: "14px", spread: "-8px", color: "#24364a2b" }], "elevation.shadow.md": [{ x: "0", y: "16px", blur: "38px", spread: "-20px", color: "#24364a40" }],
      "motion.duration.normal": "210ms", "motion.easing.standard": [0.22, 1, 0.36, 1]
    },
    modes: {
      light: { colors: { background: "#f3f5f7", foreground: "#1d2935", surface: "#e8edf1", raised: "#ffffff", primary: ["#255f8f", "#1f527c", "#19466b", "#ffffff"], secondary: ["#dce5ec", "#cfdae4", "#becdd9", "#263643"], muted: ["#e8ecef", "#5c6b77"], accent: ["#e3e2fb", "#474478"], border: ["#d5dde3", "#9cabb6"], ring: "#3174a8", selection: ["#c5dfef", "#203f52"], charts: ["#255f8f", "#2f806d", "#7a5eb0", "#c06472", "#b77a2e", "#3e7e9c", "#6b823e", "#9d5f91"] }, tokens: { "gradient.accent": { type: "linear", angle: 125, stops: [{ color: "#6eb8eb" }, { color: "#8f83e9", position: 100 }] } } },
      dark: { colors: { background: "#0e141a", foreground: "#eef3f6", surface: "#172029", raised: "#202b35", overlay: "#1c2630", primary: ["#73b3e1", "#8bc2e8", "#5aa3d6", "#0b2b40"], secondary: ["#2a3743", "#344452", "#3e5160", "#f0f5f8"], muted: ["#1d2831", "#adbdc8"], accent: ["#302d55", "#e1ddff"], border: ["#2d3a45", "#596b78"], ring: "#7bbbe6", selection: ["#295b79", "#f4faff"], charts: ["#73b3e1", "#6dc3aa", "#a793e6", "#e08d9b", "#ddad69", "#74b5cd", "#a4bb71", "#d091c4"] }, tokens: { "gradient.accent": { type: "linear", angle: 125, stops: [{ color: "#58aee8" }, { color: "#8e7ce8", position: 100 }] }, "elevation.shadow.md": [{ x: "0", y: "18px", blur: "42px", spread: "-20px", color: "#000000b3" }] } }
    }
  }
];

const presetOrder = [
  "oria-manuscript",
  "oria-mono", "oria-minimalism", "oria-line-art", "oria-glass", "oria-neo-brutalism", "oria-punchcard", "oria-sketchbook", "oria-soft-clay", "oria-golden-bazaar", "oria-theorem", "oria-neumorphism", "oria-memphis",
  "oria-ocean", "oria-forest", "oria-aurora",
  "oria-warm-reading", "oria-monochrome-deploy", "oria-precision-flow", "oria-elevated-surface",
  "oria-bento-ui", "oria-dashboard", "oria-editorial", "oria-ai-native", "oria-command-center", "oria-spatial-ui",
  "oria-soft-ui", "oria-cyberpunk", "oria-y2k", "oria-retro-terminal", "oria-paper",
  "oria-calm", "oria-playful", "oria-premium", "oria-organic", "oria-cottagecore", "oria-nature", "oria-retro", "oria-kawaii", "oria-sunset"
] as const;

const specsById = new Map(unorderedPresetSpecs.map(spec => [spec.id, spec]));
export const presetSpecs: readonly PresetSpec[] = Object.freeze(presetOrder.map(id => {
  const spec = specsById.get(id);
  if (!spec) throw new Error(`Missing preset design ${id}.`);
  return spec;
}));

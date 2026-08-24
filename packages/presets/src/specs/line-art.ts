import { geometricSans, backdropBlurScale } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const lineArtPreset: PresetSpec = {
    id: "oria-line-art", name: "Line Art", category: "visual-style",
    tokens: {
      "font.sans": geometricSans, "font.display": geometricSans,
      "font.weight.medium": "500", "font.weight.semibold": "500", "font.weight.bold": "600",
      "tracking.wide": "0.04em", "leading.relaxed": 1.7, "radius": "0", "border.width.hairline": "1px", "border.width.default": "1px", "border.width.strong": "1px",
      "shadow.2xs": [], "shadow.xs": [], "shadow.sm": [], "shadow.md": [], "shadow.lg": [],
      "shadow.xl": [], "shadow.2xl": [], "shadow.inner": [], "shadow.highlight": [],
      ...backdropBlurScale(0), "backdrop.saturate": 1,
      "opacity.disabled": 1, "opacity.muted": 1, "opacity.overlay": 1,
      "duration.fast": "90ms", "duration.normal": "150ms", "duration.slow": "220ms", "ease.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#ffffff", foreground: "#111111", surface: "#ffffff", raised: "#ffffff", overlay: "#ffffff", primary: ["#111111", "#2b2b2b", "#000000", "#ffffff"], secondary: ["#ffffff", "#f5f5f5", "#e8e8e8", "#111111"], muted: ["#fafafa", "#606060"], accent: ["#ffffff", "#111111"], border: ["#1f1f1f", "#000000"], input: "#ffffff", ring: "#111111", selection: ["#dcdcdc", "#111111"], charts: ["#111111", "#303030", "#4f4f4f", "#6e6e6e", "#8d8d8d", "#aaaaaa", "#c7c7c7", "#e2e2e2"] }, tokens: { "color.danger": "#111111", "color.danger.fg": "#ffffff", "color.success": "#303030", "color.success.fg": "#ffffff", "color.warning": "#4f4f4f", "color.warning.fg": "#ffffff", "color.info": "#686868", "color.info.fg": "#ffffff" } },
      dark: { colors: { background: "#0a0a0a", foreground: "#f5f5f5", surface: "#0a0a0a", raised: "#0a0a0a", overlay: "#0a0a0a", primary: ["#f5f5f5", "#ffffff", "#d8d8d8", "#0a0a0a"], secondary: ["#0a0a0a", "#151515", "#202020", "#f5f5f5"], muted: ["#111111", "#bdbdbd"], accent: ["#0a0a0a", "#f5f5f5"], border: ["#e5e5e5", "#ffffff"], input: "#0a0a0a", ring: "#f5f5f5", selection: ["#444444", "#ffffff"], charts: ["#f5f5f5", "#d7d7d7", "#b9b9b9", "#9b9b9b", "#7d7d7d", "#5f5f5f", "#414141", "#232323"] }, tokens: { "color.danger": "#f5f5f5", "color.danger.fg": "#0a0a0a", "color.success": "#d7d7d7", "color.success.fg": "#0a0a0a", "color.warning": "#b9b9b9", "color.warning.fg": "#0a0a0a", "color.info": "#9b9b9b", "color.info.fg": "#0a0a0a" } }
    }
  };

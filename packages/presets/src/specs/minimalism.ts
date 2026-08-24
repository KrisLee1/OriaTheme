import { humanistSans } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const minimalismPreset: PresetSpec = {
    id: "oria-minimalism", name: "Minimalism", category: "visual-style",
    tokens: {
      "font.sans": humanistSans, "font.display": humanistSans, "tracking.tight": "-0.025em",
      "radius": "0.125rem", "border.width.strong": "1px", "shadow.2xs": [], "shadow.xs": [], "shadow.sm": [], "shadow.md": [], "shadow.lg": [],
      "shadow.xl": [], "shadow.2xl": [], "shadow.inner": [], "shadow.highlight": [],
      "duration.normal": "160ms", "ease.standard": [0.25, 0.1, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#fafafa", foreground: "#171717", surface: "#f3f3f3", raised: "#ffffff", primary: ["#202020", "#303030", "#0a0a0a", "#ffffff"], secondary: ["#e8e8e8", "#dedede", "#cecece", "#202020"], muted: ["#f0f0f0", "#686868"], accent: ["#e2e2e2", "#242424"], border: ["#dedede", "#8a8a8a"], input: "#ffffff", ring: "#2b2b2b", selection: ["#d3d3d3", "#161616"], charts: ["#171717", "#303030", "#494949", "#626262", "#7b7b7b", "#949494", "#adadad", "#c6c6c6"] }, tokens: { "color.danger": "#202020", "color.danger.fg": "#ffffff", "color.success": "#3d3d3d", "color.success.fg": "#ffffff", "color.warning": "#565656", "color.warning.fg": "#ffffff", "color.info": "#6f6f6f", "color.info.fg": "#ffffff" } },
      dark: { colors: { background: "#101010", foreground: "#f0f0f0", surface: "#181818", raised: "#222222", overlay: "#1e1e1e", primary: ["#d4d4d4", "#eeeeee", "#b8b8b8", "#151515"], secondary: ["#2b2b2b", "#363636", "#444444", "#f2f2f2"], muted: ["#212121", "#b8b8b8"], accent: ["#333333", "#f1f1f1"], border: ["#343434", "#717171"], input: "#171717", ring: "#d4d4d4", selection: ["#4c4c4c", "#ffffff"], charts: ["#eeeeee", "#d3d3d3", "#b9b9b9", "#9f9f9f", "#858585", "#6b6b6b", "#515151", "#373737"] }, tokens: { "color.danger": "#eeeeee", "color.danger.fg": "#101010", "color.success": "#d0d0d0", "color.success.fg": "#101010", "color.warning": "#b2b2b2", "color.warning.fg": "#101010", "color.info": "#949494", "color.info.fg": "#101010" } }
    }
  };

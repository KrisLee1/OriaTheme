import { mono } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const commandCenterPreset: PresetSpec = {
    id: "oria-command-center", name: "Command Center", category: "design-language",
    tokens: {
      "font.sans": mono, "font.mono": mono, "font.display": mono,
      "text.xs": "0.6875rem", "text.sm": "0.8125rem", "tracking.normal": "0.01em", "control.height.sm": 6, "control.height.md": 8, "control.height.lg": 9, "control.padding.x.sm": 2, "control.padding.x.md": 3, "control.padding.x.lg": 3,
      "radius": "0", "shadow.2xs": [], "shadow.xs": [], "shadow.sm": [], "shadow.md": [{ x: "0", y: "0", blur: "0", spread: "1px", color: "#0f6f754d" }],
      "duration.fast": "70ms", "duration.normal": "110ms", "duration.slow": "180ms", "ease.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#f2f5f4", foreground: "#142426", surface: "#e5ecea", raised: "#fbfdfc", primary: ["#126b70", "#0e5c61", "#0b4d51", "#ffffff"], secondary: ["#d4dfdc", "#c5d4d0", "#b3c6c1", "#1a2d2f"], muted: ["#e1e8e6", "#536b6c"], accent: ["#dce9cd", "#405b24"], border: ["#c4d0cd", "#728b89"], ring: "#167b80", selection: ["#b9dddd", "#183d40"], charts: ["#126b70", "#4f7628", "#9b651f", "#6c568d", "#a24557", "#2d6f9b", "#66742b", "#8b4f78"] } },
      dark: { colors: { background: "#060a0b", foreground: "#dce9e7", surface: "#0c1214", raised: "#121a1d", overlay: "#0f1719", primary: ["#62d7d8", "#82e1e1", "#43c4c6", "#073537"], secondary: ["#172225", "#1f2d30", "#28383c", "#e5efed"], muted: ["#111a1c", "#9cb4b2"], accent: ["#25351b", "#d8efb7"], border: ["#203034", "#426064"], input: "#0b1416", ring: "#69dddd", selection: ["#195457", "#efffff"], charts: ["#62d7d8", "#9dcc68", "#e1ad62", "#ac91d6", "#e48193", "#6db4df", "#b6c966", "#d38ebc"] }, tokens: { "shadow.md": [{ x: "0", y: "0", blur: "18px", spread: "-8px", color: "#57e2e673" }] } }
    }
  };

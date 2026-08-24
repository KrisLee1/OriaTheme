import { developerSans, mono } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const monochromeDeployPreset: PresetSpec = {
    id: "oria-monochrome-deploy", name: "Monochrome Deploy", category: "brand-product",
    tokens: {
      "font.sans": developerSans, "font.display": developerSans, "font.mono": mono,
      "tracking.tight": "-0.035em", "radius": "0.25rem", "border.width.strong": "1px", "shadow.sm": [{ x: "0", y: "1px", blur: "2px", spread: "0", color: "#00000012" }], "shadow.md": [{ x: "0", y: "6px", blur: "16px", spread: "-8px", color: "#0000002b" }],
      "duration.fast": "100ms", "duration.normal": "150ms", "ease.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#ffffff", foreground: "#171717", surface: "#fafafa", raised: "#ffffff", primary: ["#171717", "#2d2d2d", "#000000", "#ffffff"], secondary: ["#eeeeee", "#e5e5e5", "#d4d4d4", "#1c1c1c"], muted: ["#f2f2f2", "#666666"], accent: ["#e8f2ff", "#174b7a"], border: ["#e5e5e5", "#a3a3a3"], input: "#ffffff", ring: "#404040", selection: ["#d4d4d4", "#171717"], charts: ["#171717", "#4a4a4a", "#737373", "#a3a3a3", "#2563a8", "#3f7c64", "#a46330", "#76518f"] } },
      dark: { colors: { background: "#0a0a0a", foreground: "#ededed", surface: "#141414", raised: "#1f1f1f", overlay: "#1a1a1a", primary: ["#ededed", "#ffffff", "#d4d4d4", "#171717"], secondary: ["#262626", "#303030", "#3d3d3d", "#f5f5f5"], muted: ["#1f1f1f", "#b3b3b3"], accent: ["#152b42", "#c6e1ff"], border: ["#2e2e2e", "#666666"], input: "#171717", ring: "#d4d4d4", selection: ["#525252", "#ffffff"], charts: ["#ededed", "#c7c7c7", "#9b9b9b", "#737373", "#70aee8", "#7ec8aa", "#e0a56f", "#be97d4"] }, tokens: { "shadow.md": [{ x: "0", y: "8px", blur: "24px", spread: "-10px", color: "#000000cc" }] } }
    }
  };

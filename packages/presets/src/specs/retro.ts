import { geometricSans } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const retroPreset: PresetSpec = {
    id: "oria-retro", name: "Retro", category: "mood-context",
    tokens: {
      "font.sans": geometricSans, "font.display": ["Rockwell", "Roboto Slab", "Georgia", "serif"], "font.weight.bold": "800", "tracking.wide": "0.075em", "tracking.wider": "0.095em", "tracking.widest": "0.13em",
      "radius": "0.125rem", "border.width.strong": "2px",
      "shadow.sm": [{ x: "3px", y: "3px", blur: "0", spread: "0", color: "#483320" }], "shadow.md": [{ x: "5px", y: "5px", blur: "0", spread: "0", color: "#483320" }],
      "duration.normal": "180ms", "ease.standard": [0.25, 0.1, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#f4e7c4", foreground: "#342b22", surface: "#ead8aa", raised: "#fff4d6", primary: ["#9b3f2f", "#853528", "#6e2c22", "#ffffff"], secondary: ["#d9b64b", "#c7a43c", "#b18e2f", "#3f3000"], muted: ["#e7d9b7", "#675b48"], accent: ["#9fc5b4", "#244b3d"], border: ["#6a5037", "#3f2e20"], input: "#faedcd", ring: "#a54a38", selection: ["#d9bca9", "#492a20"], charts: ["#9b3f2f", "#377565", "#a67b1e", "#66528d", "#a6536b", "#3c7088", "#63732f", "#855575"] } },
      dark: { colors: { background: "#241d17", foreground: "#f5e8c7", surface: "#33291f", raised: "#403327", overlay: "#3a2e23", primary: ["#e58e7a", "#eda493", "#d67866", "#421b14"], secondary: ["#80661d", "#987a23", "#ae8d2a", "#fff2bd"], muted: ["#392f25", "#c8b99e"], accent: ["#315948", "#d2efe3"], border: ["#7b6246", "#b99a6f"], input: "#2e251d", ring: "#e99582", selection: ["#704637", "#fff7f0"], charts: ["#e58e7a", "#80b8a6", "#d5b469", "#aa97ce", "#d092a1", "#82b3c4", "#a7b673", "#c494b5"] }, tokens: { "shadow.sm": [{ x: "3px", y: "3px", blur: "0", spread: "0", color: "#c6a976" }], "shadow.md": [{ x: "5px", y: "5px", blur: "0", spread: "0", color: "#c6a976" }] } }
    }
  };

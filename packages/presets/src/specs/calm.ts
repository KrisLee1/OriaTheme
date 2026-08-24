import { humanistSans } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const calmPreset: PresetSpec = {
    id: "oria-calm", name: "Calm", category: "mood-context",
    tokens: {
      "font.sans": humanistSans, "font.display": humanistSans, "leading.relaxed": 1.76, "radius": "0.5rem", "shadow.sm": [{ x: "0", y: "5px", blur: "16px", spread: "-10px", color: "#56747b2b" }], "shadow.md": [{ x: "0", y: "14px", blur: "34px", spread: "-20px", color: "#56747b3d" }],
      "duration.fast": "180ms", "duration.normal": "300ms", "duration.slow": "460ms", "ease.standard": [0.25, 0.8, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#f4f8f7", foreground: "#263b3d", surface: "#e7f0ee", raised: "#fcfefd", primary: ["#47777a", "#3c686b", "#32595c", "#ffffff"], secondary: ["#d8e6e2", "#cadcd7", "#b8cec8", "#2d4544"], muted: ["#e6edeb", "#5f7272"], accent: ["#e4ead8", "#4c5d32"], border: ["#d0deda", "#98aaa7"], input: "#f9fcfb", ring: "#528589", selection: ["#c7dfdc", "#2c4c4c"], charts: ["#47777a", "#5e8062", "#94764a", "#70658d", "#9c6370", "#557c90", "#77814b", "#8e6887"] } },
      dark: { colors: { background: "#162224", foreground: "#edf4f2", surface: "#202f31", raised: "#293a3d", overlay: "#253538", primary: ["#8fc4c3", "#a5d0cf", "#79b3b2", "#193a3b"], secondary: ["#35484a", "#405456", "#4b6163", "#f0f6f4"], muted: ["#28383a", "#b7c6c3"], accent: ["#37412b", "#e0e9c8"], border: ["#3d4e50", "#687a7b"], input: "#202f31", ring: "#98c9c8", selection: ["#466a6a", "#f5fbf9"], charts: ["#8fc4c3", "#97bd99", "#c6a67b", "#a99dc0", "#c796a0", "#91b3c3", "#acb680", "#bd9bb7"] }, tokens: { "shadow.md": [{ x: "0", y: "16px", blur: "38px", spread: "-20px", color: "#000000a6" }] } }
    }
  };

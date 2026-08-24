import { roundedSans } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const playfulPreset: PresetSpec = {
    id: "oria-playful", name: "Playful", category: "mood-context",
    tokens: {
      "font.sans": roundedSans, "font.display": roundedSans, "font.weight.semibold": "700", "font.weight.bold": "800",
      "radius": "0.625rem", "shadow.sm": [{ x: "0", y: "4px", blur: "0", spread: "0", color: "#493c8f38" }], "shadow.md": [{ x: "0", y: "8px", blur: "0", spread: "0", color: "#493c8f4d" }],
      "duration.normal": "240ms", "ease.emphasized": [0.34, 1.56, 0.64, 1]
    },
    modes: {
      light: { colors: { background: "#fff9ef", foreground: "#302744", surface: "#f4eafa", raised: "#ffffff", primary: ["#6551b8", "#5745a1", "#493a8a", "#ffffff"], secondary: ["#ffe081", "#f5cf62", "#e8bc42", "#443500"], muted: ["#f2ece8", "#6a6170"], accent: ["#f9c9dc", "#6d2443"], border: ["#d8cce0", "#9d89b0"], ring: "#715dc6", selection: ["#cce9e6", "#244d4a"], charts: ["#6551b8", "#2f947f", "#d17c1e", "#d44d7f", "#347db2", "#819523", "#9b5bc2", "#c65f4b"] }, tokens: { "gradient.accent": { type: "linear", angle: 105, stops: [{ color: "#ffe081" }, { color: "#f48db5", position: 50 }, { color: "#72d6c5", position: 100 }] } } },
      dark: { colors: { background: "#1d1829", foreground: "#faf4ff", surface: "#2a223c", raised: "#352b4b", overlay: "#302744", primary: ["#a99aef", "#bbb0f3", "#9482e3", "#281d5d"], secondary: ["#7b611d", "#947622", "#ab8928", "#fff5ce"], muted: ["#302840", "#c2b7cc"], accent: ["#71314c", "#ffe1ed"], border: ["#4b3d61", "#76658d"], ring: "#b2a5f1", selection: ["#2e6962", "#effffc"], charts: ["#a99aef", "#6fd2bd", "#efad5f", "#ec86ae", "#73b4df", "#b8c967", "#cf95e7", "#e69382"] }, tokens: { "gradient.accent": { type: "linear", angle: 105, stops: [{ color: "#f2cb57" }, { color: "#e979a5", position: 50 }, { color: "#56cdb7", position: 100 }] }, "shadow.sm": [{ x: "0", y: "4px", blur: "0", spread: "0", color: "#a99aef52" }], "shadow.md": [{ x: "0", y: "8px", blur: "0", spread: "0", color: "#a99aef66" }] } }
    }
  };

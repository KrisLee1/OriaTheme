import { humanistSans, editorialSerif } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const forestPreset: PresetSpec = {
    id: "oria-forest", name: "Forest", category: "oria",
    tokens: {
      "font.sans": humanistSans, "font.display": editorialSerif,
      "leading.relaxed": 1.74, "radius": "0.5rem", "shadow.sm": [{ x: "0", y: "3px", blur: "9px", spread: "-4px", color: "#31462b2e" }],
      "shadow.md": [{ x: "0", y: "12px", blur: "26px", spread: "-12px", color: "#273d2445" }],
      "duration.normal": "240ms", "ease.standard": [0.25, 0.8, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#f5f7ef", foreground: "#20311f", surface: "#e9efe1", raised: "#fcfdf8", primary: ["#376b42", "#2d5a36", "#24492c", "#ffffff"], secondary: ["#d7e3cb", "#c8d9ba", "#b6cca7", "#263b24"], muted: ["#e8ece1", "#5b6e56"], accent: ["#ede2c7", "#624c25"], border: ["#c9d3bd", "#91a685"], input: "#fbfcf7", ring: "#477c50", selection: ["#bfd8b5", "#203a23"], charts: ["#376b42", "#688c45", "#9a7b38", "#4f8174", "#a65f3e", "#6f6594", "#b38a54", "#507642"] }, tokens: { "gradient.bg": { type: "linear", angle: 145, stops: [{ color: "#fafbf6" }, { color: "#edf2e5", position: 68 }, { color: "#e3ead8", position: 100 }] }, "gradient.accent": { type: "linear", angle: 115, stops: [{ color: "#426f45" }, { color: "#9b8445", position: 100 }] } } },
      dark: { colors: { background: "#111c13", foreground: "#edf4e8", surface: "#1a291c", raised: "#243625", overlay: "#1d2e1f", primary: ["#98c79b", "#b0d6b1", "#7caf82", "#142417"], secondary: ["#2c442e", "#365238", "#425f43", "#eef6ea"], muted: ["#213323", "#aec0aa"], accent: ["#4b4028", "#f1dfb5"], border: ["#39513a", "#5f775f"], input: "#1b2c1d", ring: "#9fd0a2", selection: ["#3b6540", "#f4f8f0"], charts: ["#98c79b", "#b2ce78", "#d7b66b", "#79b4a6", "#dc8e6c", "#a99bd2", "#c6a170", "#73a77b"] }, tokens: { "gradient.bg": { type: "radial", position: "top", stops: [{ color: "#263d29" }, { color: "#111c13", position: 72 }] }, "gradient.accent": { type: "linear", angle: 115, stops: [{ color: "#7eae83" }, { color: "#c0a85f", position: 100 }] }, "shadow.md": [{ x: "0", y: "12px", blur: "30px", spread: "-12px", color: "#000000a3" }] } }
    }
  };

import { humanistSans } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const naturePreset: PresetSpec = {
    id: "oria-nature", name: "Nature", category: "mood-context",
    tokens: {
      "font.sans": humanistSans, "font.display": humanistSans, "font.weight.semibold": "600",
      "radius": "0.375rem", "shadow.sm": [{ x: "0", y: "4px", blur: "12px", spread: "-7px", color: "#2f51423d" }], "shadow.md": [{ x: "0", y: "14px", blur: "30px", spread: "-18px", color: "#2f514252" }],
      "duration.normal": "210ms", "ease.standard": [0.22, 1, 0.36, 1]
    },
    modes: {
      light: { colors: { background: "#f1f6f1", foreground: "#20362e", surface: "#e2ece3", raised: "#fbfdf9", primary: ["#397052", "#305f46", "#284f3b", "#ffffff"], secondary: ["#d1e1d3", "#c0d6c3", "#acc8b0", "#294234"], muted: ["#e4ebe4", "#5a7067"], accent: ["#dceaf0", "#315566"], border: ["#c7d7ca", "#8ca592"], input: "#f8fcf8", ring: "#46805f", selection: ["#bdd8c5", "#284738"], charts: ["#397052", "#377b91", "#a17038", "#6f628e", "#a34f60", "#567941", "#44788b", "#8c5e7f"] }, tokens: { "gradient.bg": { type: "linear", angle: 165, stops: [{ color: "#edf6f5" }, { color: "#edf4e6", position: 58 }, { color: "#f3ead9", position: 100 }] } } },
      dark: { colors: { background: "#101d19", foreground: "#edf5ef", surface: "#192b24", raised: "#22382f", overlay: "#1e332a", primary: ["#8fc6a5", "#a5d2b7", "#7bb793", "#173827"], secondary: ["#2e4739", "#385545", "#436351", "#eff7f1"], muted: ["#21352d", "#adc2b6"], accent: ["#233f4b", "#d2edf7"], border: ["#354d41", "#607769"], input: "#192b24", ring: "#98cbaa", selection: ["#3f684f", "#f5fbf7"], charts: ["#8fc6a5", "#75b6ca", "#d1a16d", "#a99bc2", "#d18b99", "#a6bd7d", "#80aebe", "#bf97b4"] }, tokens: { "gradient.bg": { type: "linear", angle: 165, stops: [{ color: "#102b32" }, { color: "#172b20", position: 58 }, { color: "#2a2117", position: 100 }] }, "shadow.md": [{ x: "0", y: "16px", blur: "34px", spread: "-18px", color: "#000000b3" }] } }
    }
  };

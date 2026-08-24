import { editorialSerif } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const premiumPreset: PresetSpec = {
    id: "oria-premium", name: "Premium", category: "mood-context",
    tokens: {
      "font.serif": editorialSerif, "font.display": editorialSerif, "tracking.tight": "-0.03em", "tracking.wide": "0.08em", "tracking.wider": "0.1em", "tracking.widest": "0.14em",
      "radius": "0.125rem", "border.width.strong": "1px", "shadow.sm": [{ x: "0", y: "5px", blur: "16px", spread: "-9px", color: "#1c130b4d" }], "shadow.md": [{ x: "0", y: "18px", blur: "44px", spread: "-22px", color: "#1c130b73" }], "shadow.lg": [{ x: "0", y: "28px", blur: "64px", spread: "-28px", color: "#0000008c" }],
      "duration.normal": "260ms", "duration.slow": "440ms", "ease.standard": [0.25, 0.1, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#f7f3eb", foreground: "#2c241b", surface: "#eee7dc", raised: "#fffdf9", primary: ["#76591e", "#654b18", "#533e14", "#ffffff"], secondary: ["#e3d7c4", "#d6c7ae", "#c5b28f", "#342b20"], muted: ["#ebe5dc", "#685f54"], accent: ["#ead8ad", "#5f4816"], border: ["#d5c8b4", "#95836a"], input: "#fffdf9", ring: "#846526", selection: ["#e3cf9d", "#443411"], charts: ["#76591e", "#486d5a", "#874c58", "#63517b", "#9b6431", "#466c7e", "#66703a", "#7b526d"] } },
      dark: { colors: { background: "#100d0a", foreground: "#f2eadc", surface: "#1b1712", raised: "#262018", overlay: "#211b15", primary: ["#d7bd7a", "#e1cc96", "#c8aa61", "#3a2c0d"], secondary: ["#352c21", "#413629", "#4d4031", "#f5eddf"], muted: ["#241e18", "#bfb3a2"], accent: ["#49391d", "#f1dca6"], border: ["#3f3428", "#72614b"], input: "#18130f", ring: "#ddc586", selection: ["#5f4c24", "#fff9e9"], charts: ["#d7bd7a", "#87b49d", "#ce8c98", "#aa98c2", "#d4a06d", "#83afbf", "#a7b476", "#bd91ad"] }, tokens: { "gradient.bg": { type: "radial", position: "top", stops: [{ color: "#2a2115" }, { color: "#100d0a", position: 72 }] }, "gradient.accent": { type: "linear", angle: 110, stops: [{ color: "#f0dda2" }, { color: "#a77b2f", position: 100 }] }, "shadow.md": [{ x: "0", y: "20px", blur: "48px", spread: "-22px", color: "#000000d9" }] } }
    }
  };

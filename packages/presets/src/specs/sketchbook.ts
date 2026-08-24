import { mono, handwrittenSans } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const sketchbookPreset: PresetSpec = {
    id: "oria-sketchbook", name: "Sketchbook", category: "visual-style",
    tokens: {
      "font.sans": handwrittenSans, "font.display": handwrittenSans, "font.mono": mono,
      "font.weight.normal": "500", "font.weight.medium": "600", "font.weight.semibold": "700", "font.weight.bold": "800",
      "leading.normal": 1.6, "leading.relaxed": 1.82, "tracking.wide": "0.04em", "radius": "0.25rem", "border.width.hairline": "1px", "border.width.default": "2px", "border.width.strong": "2px", "ring.width": "3px", "ring.offset": "3px",
      "shadow.xs": [{ x: "0", y: "1px", blur: "2px", spread: "0", color: "#2d292714" }],
      "shadow.sm": [{ x: "0", y: "3px", blur: "7px", spread: "-4px", color: "#2d29272e" }],
      "shadow.md": [{ x: "0", y: "8px", blur: "18px", spread: "-12px", color: "#2d292733" }],
      "shadow.inner": [{ x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffffbf", inset: true }],
      "duration.fast": "110ms", "duration.normal": "190ms", "ease.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#fffefa", foreground: "#2d2927", surface: "#faf8f1", raised: "#fffefb", overlay: "#fffefb", primary: ["#2d2927", "#171513", "#000000", "#fffefa"], secondary: ["#b7f3c5", "#9ce8af", "#82dc9c", "#183d24"], muted: ["#f1eee5", "#716c66"], accent: ["#ffe49c", "#4d3c16"], border: ["#393431", "#171513"], input: "#fffefb", ring: "#4f9fd0", selection: ["#b8e2f8", "#17394f"], charts: ["#2d2927", "#9ce8af", "#f39ca3", "#69c7ee", "#ffe49c", "#9b8adc", "#e59a54", "#d97eac"] }, tokens: { "gradient.bg": { type: "linear", angle: 180, stops: [{ color: "#fffefa" }, { color: "#fbfaf4", position: 100 }] }, "gradient.surface": { type: "linear", angle: 180, stops: [{ color: "#fffefc" }, { color: "#f8f5ec", position: 100 }] }, "gradient.accent": { type: "linear", angle: 110, stops: [{ color: "#b7f3c5" }, { color: "#69c7ee", position: 100 }] }, "pattern.bg": [{ type: "dot", color: "#2a25200f", radius: "1.5px", spacing: "2rem", angle: 0 }], "pattern.surface": [{ type: "grid", color: "#2a25200f", lineWidth: "1px", spacing: "1.5rem", angle: 0 }] } },
      dark: { colors: { background: "#211f1c", foreground: "#f6f1e7", surface: "#2a2723", raised: "#332f2a", overlay: "#302c27", primary: ["#f6f1e7", "#ffffff", "#dfd7c8", "#26221e"], secondary: ["#2f7250", "#39815c", "#438f68", "#eaffef"], muted: ["#302d28", "#c7c0b4"], accent: ["#785e27", "#fff0b8"], border: ["#d9d0c1", "#fff8e8"], input: "#2c2924", ring: "#81cef1", selection: ["#315b71", "#effaff"], charts: ["#f6f1e7", "#83d99c", "#f58f9a", "#74ccef", "#f7d77c", "#b5a5ed", "#efa76e", "#ee95bd"] }, tokens: { "gradient.bg": { type: "linear", angle: 180, stops: [{ color: "#2b2823" }, { color: "#211f1c", position: 100 }] }, "gradient.surface": { type: "linear", angle: 180, stops: [{ color: "#38332d" }, { color: "#292620", position: 100 }] }, "gradient.accent": { type: "linear", angle: 110, stops: [{ color: "#397d58" }, { color: "#31769d", position: 100 }] }, "pattern.bg": [{ type: "dot", color: "#6060601f", radius: "1.5px", spacing: "2rem", angle: 0 }], "pattern.surface": [{ type: "grid", color: "#f6f1e710", lineWidth: "1px", spacing: "1.5rem", angle: 0 }], "shadow.xs": [{ x: "0", y: "1px", blur: "2px", spread: "0", color: "#07060599" }], "shadow.sm": [{ x: "0", y: "3px", blur: "7px", spread: "-4px", color: "#070605a6" }], "shadow.md": [{ x: "0", y: "8px", blur: "18px", spread: "-12px", color: "#070605b3" }], "shadow.inner": [{ x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffff1f", inset: true }] } }
    }
  };

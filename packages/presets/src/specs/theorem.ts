import { editorialSerif, readingSerif, mono } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const theoremPreset: PresetSpec = {
    id: "oria-theorem", name: "Theorem", category: "visual-style",
    tokens: {
      "font.sans": readingSerif, "font.display": editorialSerif, "font.mono": mono,
      "font.weight.normal": "400", "font.weight.medium": "500", "font.weight.semibold": "600", "font.weight.bold": "700",
      "leading.normal": 1.48, "leading.relaxed": 1.72, "tracking.tight": "-0.025em", "tracking.wide": "0.025em", "radius": "0", "border.width.hairline": "1px", "border.width.default": "1px", "border.width.strong": "1px", "ring.width": "2px", "ring.offset": "3px",
      "shadow.2xs": [], "shadow.xs": [], "shadow.sm": [], "shadow.md": [], "shadow.inner": [], "shadow.highlight": [],
      "shadow.lg": [{ x: "8px", y: "10px", blur: "0", spread: "0", color: "#6b675f91" }, { x: "0", y: "18px", blur: "36px", spread: "-18px", color: "#24221d59" }],
      "shadow.xl": [{ x: "10px", y: "12px", blur: "0", spread: "0", color: "#6b675f99" }, { x: "0", y: "24px", blur: "46px", spread: "-22px", color: "#24221d66" }],
      "shadow.2xl": [{ x: "12px", y: "14px", blur: "0", spread: "0", color: "#6b675fa3" }, { x: "0", y: "30px", blur: "58px", spread: "-28px", color: "#24221d73" }],
      "duration.fast": "100ms", "duration.normal": "180ms", "ease.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#f0ede5", foreground: "#25231f", surface: "#ebe8df", raised: "#fffdf5", overlay: "#fffef9", primary: ["#27231e", "#15130f", "#000000", "#fffdf5"], secondary: ["#e6e0d4", "#d8d0c1", "#c8bead", "#322e28"], muted: ["#e4e0d7", "#59554e"], accent: ["#8d3029", "#fff8f1"], border: ["#d6d0c4", "#8a8479"], input: "#fffdf5", ring: "#8d3029", selection: ["#d8b6ae", "#321411"], scrim: "#25231f59", charts: ["#27231e", "#8d3029", "#756848", "#5d6972", "#62735e", "#806075", "#9a633c", "#46616c"] }, tokens: { "gradient.bg": { type: "linear", angle: 180, stops: [{ color: "#f3f0e8" }, { color: "#f0ede5", position: 100 }] }, "gradient.surface": { type: "linear", angle: 180, stops: [{ color: "#fffef9" }, { color: "#f8f3e8", position: 100 }] }, "gradient.accent": { type: "linear", angle: 100, stops: [{ color: "#a5463d" }, { color: "#8d3029", position: 100 }] }, "pattern.bg": [{ type: "noise", variant: "paper", color: "#2a25205f", tileSize: "80px", intensity: 0.5 }] } },
      dark: { colors: { background: "#292824", foreground: "#f4eee1", surface: "#34332e", raised: "#45423a", overlay: "#403d36", primary: ["#f5eee2", "#ffffff", "#ded5c5", "#27241f"], secondary: ["#514d43", "#625d52", "#716a5d", "#f4eee1"], muted: ["#393731", "#ccc4b6"], accent: ["#c76b5d", "#28110e"], border: ["#716c61", "#aaa294"], input: "#3a3832", ring: "#d27a6b", selection: ["#704039", "#fff6ef"], scrim: "#00000080", charts: ["#f5eee2", "#dc8173", "#c9b783", "#9eb3be", "#9bb58f", "#c59bb8", "#e1a979", "#87aab8"] }, tokens: { "gradient.bg": { type: "linear", angle: 180, stops: [{ color: "#32312b" }, { color: "#292824", position: 100 }] }, "gradient.surface": { type: "linear", angle: 180, stops: [{ color: "#4c483f" }, { color: "#403d36", position: 100 }] }, "gradient.accent": { type: "linear", angle: 100, stops: [{ color: "#db8879" }, { color: "#c76b5d", position: 100 }] }, "pattern.bg": [{ type: "noise", variant: "paper", color: "#9292925f", tileSize: "80px", intensity: 0.5 }], "shadow.lg": [{ x: "8px", y: "10px", blur: "0", spread: "0", color: "#0c0b0acc" }, { x: "0", y: "18px", blur: "36px", spread: "-18px", color: "#00000099" }], "shadow.xl": [{ x: "10px", y: "12px", blur: "0", spread: "0", color: "#0c0b0ad9" }, { x: "0", y: "24px", blur: "46px", spread: "-22px", color: "#000000a6" }], "shadow.2xl": [{ x: "12px", y: "14px", blur: "0", spread: "0", color: "#0c0b0ae6" }, { x: "0", y: "30px", blur: "58px", spread: "-28px", color: "#000000b3" }] } }
    }
  };

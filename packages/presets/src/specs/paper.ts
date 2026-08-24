import { readingSerif } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const paperPreset: PresetSpec = {
    id: "oria-paper", name: "Paper", category: "visual-style",
    tokens: {
      "font.serif": readingSerif, "font.display": readingSerif, "leading.normal": 1.58, "leading.relaxed": 1.78,
      "radius": "0.125rem", "shadow.sm": [{ x: "0", y: "2px", blur: "3px", spread: "-1px", color: "#3d2e1c24" }], "shadow.md": [{ x: "1px", y: "4px", blur: "8px", spread: "-4px", color: "#3d2e1c38" }], "shadow.inner": [{ x: "0", y: "1px", blur: "2px", spread: "0", color: "#7a624126", inset: true }],
      "duration.normal": "190ms", "ease.standard": [0.25, 0.1, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#f7f1e3", foreground: "#302a22", surface: "#eee5d3", raised: "#fffaf0", primary: ["#3f4e78", "#354267", "#2c3756", "#ffffff"], secondary: ["#e1d5bf", "#d4c5ab", "#c4b294", "#362f25"], muted: ["#eae2d3", "#6a6052"], accent: ["#ead8b1", "#5c4517"], border: ["#d3c3a8", "#9b8768"], input: "#fcf7ed", ring: "#4a5c88", selection: ["#ccd1e2", "#303956"], charts: ["#3f4e78", "#4e7258", "#9a6b33", "#795883", "#9f5561", "#4f7580", "#747638", "#8c5a78"] }, tokens: { "gradient.surface": { type: "linear", angle: 170, stops: [{ color: "#fffaf0" }, { color: "#f5ecd9", position: 100 }] } } },
      dark: { colors: { background: "#201c17", foreground: "#f2eadc", surface: "#2c261f", raised: "#373028", overlay: "#322b24", primary: ["#a6b3dd", "#b9c4e4", "#929fd0", "#202a4a"], secondary: ["#463c31", "#54483b", "#625548", "#f6eee1"], muted: ["#322c25", "#c2b6a5"], accent: ["#4b3c20", "#f0dbab"], border: ["#4c4135", "#796a57"], input: "#28221c", ring: "#aebae0", selection: ["#515b7d", "#fbf9ff"], charts: ["#a6b3dd", "#8fba99", "#d0a36f", "#b79bc0", "#d0929a", "#8db5bc", "#acb476", "#c69ab8"] }, tokens: { "gradient.surface": { type: "linear", angle: 170, stops: [{ color: "#393129" }, { color: "#2b251f", position: 100 }] }, "shadow.md": [{ x: "1px", y: "5px", blur: "10px", spread: "-4px", color: "#00000099" }] } }
    }
  };

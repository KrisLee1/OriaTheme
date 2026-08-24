import { systemSans } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const bentoUiPreset: PresetSpec = {
    id: "oria-bento-ui", name: "Bento UI", category: "design-language",
    tokens: {
      "font.sans": systemSans, "font.display": systemSans, "font.weight.semibold": "600",
      "radius": "0.5rem", "shadow.sm": [{ x: "0", y: "4px", blur: "14px", spread: "-8px", color: "#24364a2b" }], "shadow.md": [{ x: "0", y: "16px", blur: "38px", spread: "-20px", color: "#24364a40" }],
      "duration.normal": "210ms", "ease.standard": [0.22, 1, 0.36, 1]
    },
    modes: {
      light: { colors: { background: "#f3f5f7", foreground: "#1d2935", surface: "#e8edf1", raised: "#ffffff", primary: ["#255f8f", "#1f527c", "#19466b", "#ffffff"], secondary: ["#dce5ec", "#cfdae4", "#becdd9", "#263643"], muted: ["#e8ecef", "#5c6b77"], accent: ["#e3e2fb", "#474478"], border: ["#d5dde3", "#9cabb6"], ring: "#3174a8", selection: ["#c5dfef", "#203f52"], charts: ["#255f8f", "#2f806d", "#7a5eb0", "#c06472", "#b77a2e", "#3e7e9c", "#6b823e", "#9d5f91"] }, tokens: { "gradient.accent": { type: "linear", angle: 125, stops: [{ color: "#6eb8eb" }, { color: "#8f83e9", position: 100 }] } } },
      dark: { colors: { background: "#0e141a", foreground: "#eef3f6", surface: "#172029", raised: "#202b35", overlay: "#1c2630", primary: ["#73b3e1", "#8bc2e8", "#5aa3d6", "#0b2b40"], secondary: ["#2a3743", "#344452", "#3e5160", "#f0f5f8"], muted: ["#1d2831", "#adbdc8"], accent: ["#302d55", "#e1ddff"], border: ["#2d3a45", "#596b78"], ring: "#7bbbe6", selection: ["#295b79", "#f4faff"], charts: ["#73b3e1", "#6dc3aa", "#a793e6", "#e08d9b", "#ddad69", "#74b5cd", "#a4bb71", "#d091c4"] }, tokens: { "gradient.accent": { type: "linear", angle: 125, stops: [{ color: "#58aee8" }, { color: "#8e7ce8", position: 100 }] }, "shadow.md": [{ x: "0", y: "18px", blur: "42px", spread: "-20px", color: "#000000b3" }] } }
    }
  };

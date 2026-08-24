import { geometricSans, backdropBlurScale } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const y2kPreset: PresetSpec = {
    id: "oria-y2k", name: "Y2K", category: "visual-style",
    tokens: {
      "font.sans": geometricSans, "font.display": geometricSans, "tracking.wide": "0.04em",
      "radius": "0.75rem", ...backdropBlurScale(20), "backdrop.saturate": 1.6,
      "shadow.highlight": [{ x: "0", y: "2px", blur: "2px", spread: "0", color: "#ffffffd9", inset: true }],
      "shadow.md": [{ x: "0", y: "16px", blur: "36px", spread: "-18px", color: "#5968a64d" }, { x: "0", y: "2px", blur: "2px", spread: "0", color: "#ffffffd9", inset: true }],
      "duration.normal": "260ms", "ease.emphasized": [0.34, 1.56, 0.64, 1]
    },
    modes: {
      light: { colors: { background: "#f2f5fa", foreground: "#262c40", surface: "#e4e9f3", raised: "#ffffff", primary: ["#526ab8", "#465ba2", "#3a4c89", "#ffffff"], secondary: ["#d8e7f2", "#c8dce9", "#b5cddd", "#293e50"], muted: ["#e7ebf2", "#626b7d"], accent: ["#f2d8eb", "#6c3357"], border: ["#ffffffd9", "#9da9bd"], input: "#fafdff", ring: "#6079c7", selection: ["#d1d7f0", "#344064"], charts: ["#526ab8", "#3a8c87", "#ba5c8f", "#7d57ad", "#bd7b31", "#4183a4", "#718b46", "#a95e9d"] }, tokens: { "gradient.bg": { type: "linear", angle: 135, stops: [{ color: "#d7e7f5" }, { color: "#e7ddfa", position: 48 }, { color: "#f6dcea", position: 100 }] }, "gradient.surface": { type: "linear", angle: 150, stops: [{ color: "#ffffff" }, { color: "#d9e0eb", position: 42 }, { color: "#ffffff", position: 70 }, { color: "#d9d5ef", position: 100 }] }, "gradient.accent": { type: "linear", angle: 120, stops: [{ color: "#8ee8f0" }, { color: "#9a8ceb", position: 50 }, { color: "#f08bc1", position: 100 }] } } },
      dark: { colors: { background: "#111421", foreground: "#f3f5ff", surface: "#1d2234", raised: "#292f44", overlay: "#242a3d", primary: ["#99aff5", "#afc0f7", "#8299e8", "#1d2853"], secondary: ["#324353", "#3d5061", "#485e70", "#f1f8ff"], muted: ["#252b3d", "#b7bed2"], accent: ["#503147", "#ffe0f2"], border: ["#ffffff2e", "#68738f"], input: "#1c2335", ring: "#a2b6f6", selection: ["#4c5687", "#fafaff"], charts: ["#99aff5", "#7dd1ca", "#ed91bd", "#b99be9", "#e8b270", "#84c0d9", "#acbd75", "#df96d3"] }, tokens: { "gradient.bg": { type: "linear", angle: 135, stops: [{ color: "#172f42" }, { color: "#302653", position: 48 }, { color: "#4a233d", position: 100 }] }, "gradient.surface": { type: "linear", angle: 150, stops: [{ color: "#414b61" }, { color: "#22293b", position: 42 }, { color: "#4b5366", position: 70 }, { color: "#2e294c", position: 100 }] }, "gradient.accent": { type: "linear", angle: 120, stops: [{ color: "#7ce8ef" }, { color: "#a493f4", position: 50 }, { color: "#f390c3", position: 100 }] }, "shadow.highlight": [{ x: "0", y: "2px", blur: "2px", spread: "0", color: "#ffffff59", inset: true }], "shadow.md": [{ x: "0", y: "18px", blur: "42px", spread: "-18px", color: "#000000bf" }, { x: "0", y: "2px", blur: "2px", spread: "0", color: "#ffffff4d", inset: true }] } }
    }
  };

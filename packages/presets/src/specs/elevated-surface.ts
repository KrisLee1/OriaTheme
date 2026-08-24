import {  } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const elevatedSurfacePreset: PresetSpec = {
    id: "oria-elevated-surface", name: "Elevated Surface", category: "brand-product",
    tokens: {
      "font.sans": ["Roboto", "Noto Sans", "system-ui", "sans-serif"], "font.display": ["Roboto", "Noto Sans", "system-ui", "sans-serif"],
      "radius": "0.375rem", "shadow.xs": [{ x: "0", y: "1px", blur: "2px", spread: "0", color: "#1d1b201f" }],
      "shadow.sm": [{ x: "0", y: "2px", blur: "6px", spread: "-1px", color: "#1d1b2029" }],
      "shadow.md": [{ x: "0", y: "6px", blur: "16px", spread: "-4px", color: "#1d1b2033" }],
      "shadow.lg": [{ x: "0", y: "12px", blur: "28px", spread: "-8px", color: "#1d1b203d" }],
      "duration.normal": "220ms", "ease.standard": [0.2, 0, 0, 1], "ease.emphasized": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#fffbfe", foreground: "#1d1b20", surface: "#f7f2fa", raised: "#ffffff", overlay: "#fff7ff", primary: ["#6750a4", "#5b4696", "#4f3c86", "#ffffff"], secondary: ["#e8def8", "#ddd0f2", "#cebee8", "#332d41"], muted: ["#f0eaf2", "#625b66"], accent: ["#f2dfea", "#633b4b"], border: ["#d4cdd6", "#79747e"], ring: "#6750a4", selection: ["#ded0f3", "#31264a"], charts: ["#6750a4", "#006b5f", "#9a4524", "#78536a", "#416277", "#6a5d00", "#8c4a60", "#366a50"] } },
      dark: { colors: { background: "#141218", foreground: "#e6e0e9", surface: "#211f26", raised: "#2b2930", overlay: "#27242d", primary: ["#d0bcff", "#dccaff", "#bda6ef", "#381e72"], secondary: ["#4a4458", "#554f63", "#625b70", "#f2ecfa"], muted: ["#2b2930", "#cac4d0"], accent: ["#523541", "#ffd8e4"], border: ["#49454f", "#938f99"], ring: "#d0bcff", selection: ["#4f3d78", "#f9f4ff"], charts: ["#d0bcff", "#4fd8c4", "#ffb59b", "#e0a8c3", "#98cbea", "#d9c95e", "#f1a6bc", "#87d3aa"] }, tokens: { "shadow.md": [{ x: "0", y: "7px", blur: "20px", spread: "-5px", color: "#00000099" }] } }
    }
  };

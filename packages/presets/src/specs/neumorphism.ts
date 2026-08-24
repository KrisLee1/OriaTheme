import { humanistSans } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const neumorphismPreset: PresetSpec = {
    id: "oria-neumorphism", name: "Neumorphism", category: "visual-style",
    tokens: {
      "font.sans": humanistSans, "font.display": humanistSans,
      "radius": "0.625rem", "border.width.strong": "1px",
      "shadow.sm": [{ x: "5px", y: "5px", blur: "12px", spread: "0", color: "#9caab759" }, { x: "-5px", y: "-5px", blur: "12px", spread: "0", color: "#ffffffd9" }],
      "shadow.md": [{ x: "10px", y: "10px", blur: "24px", spread: "0", color: "#9caab766" }, { x: "-10px", y: "-10px", blur: "24px", spread: "0", color: "#ffffffeb" }],
      "shadow.inner": [{ x: "4px", y: "4px", blur: "10px", spread: "0", color: "#9caab759", inset: true }, { x: "-4px", y: "-4px", blur: "10px", spread: "0", color: "#ffffffd9", inset: true }],
      "duration.normal": "220ms", "ease.standard": [0.22, 1, 0.36, 1]
    },
    modes: {
      light: { colors: { background: "#e7edf1", foreground: "#26343e", surface: "#e7edf1", raised: "#edf2f5", primary: ["#3d6f91", "#345f7d", "#2b506a", "#ffffff"], secondary: ["#d9e1e6", "#cdd7de", "#bdcbd3", "#2b3a44"], muted: ["#dfe6ea", "#596a75"], accent: ["#d9e8e2", "#31584b"], border: ["#d4dde3", "#8fa1ad"], input: "#e7edf1", ring: "#477d9f", selection: ["#bfd5e2", "#2b4657"], charts: ["#3d6f91", "#4a7b67", "#9a703a", "#745d91", "#a65c6d", "#4f7d8d", "#718044", "#8e5f86"] } },
      dark: { colors: { background: "#242b31", foreground: "#edf2f5", surface: "#242b31", raised: "#2b333a", overlay: "#293037", primary: ["#82b1d0", "#9ac0d9", "#6da1c5", "#173246"], secondary: ["#343d44", "#3e484f", "#49545c", "#f1f5f7"], muted: ["#2d353c", "#b8c3ca"], accent: ["#30463f", "#d2eee4"], border: ["#3a444c", "#687985"], input: "#242b31", ring: "#8bb8d4", selection: ["#3d6278", "#f6fbfd"], charts: ["#82b1d0", "#83b9a1", "#d0aa73", "#ac99c5", "#d08f9e", "#83b1c0", "#aab77a", "#c397bb"] }, tokens: { "shadow.sm": [{ x: "5px", y: "5px", blur: "12px", spread: "0", color: "#11161ab3" }, { x: "-5px", y: "-5px", blur: "12px", spread: "0", color: "#3b464f8f" }], "shadow.md": [{ x: "10px", y: "10px", blur: "24px", spread: "0", color: "#11161acc" }, { x: "-10px", y: "-10px", blur: "24px", spread: "0", color: "#3b464fa6" }], "shadow.inner": [{ x: "4px", y: "4px", blur: "10px", spread: "0", color: "#11161ab3", inset: true }, { x: "-4px", y: "-4px", blur: "10px", spread: "0", color: "#3b464f8f", inset: true }] } }
    }
  };

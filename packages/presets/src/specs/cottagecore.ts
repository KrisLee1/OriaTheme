import { readingSerif } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const cottagecorePreset: PresetSpec = {
    id: "oria-cottagecore", name: "Cottagecore", category: "mood-context",
    tokens: {
      "font.serif": readingSerif, "font.display": readingSerif, "leading.relaxed": 1.8, "tracking.wide": "0.045em", "tracking.wider": "0.065em", "tracking.widest": "0.1em",
      "radius": "0.25rem", "shadow.sm": [{ x: "0", y: "3px", blur: "8px", spread: "-5px", color: "#6b50342b" }], "shadow.md": [{ x: "0", y: "10px", blur: "24px", spread: "-14px", color: "#6b50343d" }], "shadow.inner": [{ x: "0", y: "1px", blur: "2px", spread: "0", color: "#8b6f4d24", inset: true }],
      "duration.normal": "230ms", "ease.standard": [0.25, 0.1, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#f5efe3", foreground: "#393329", surface: "#e9dfcf", raised: "#fdf9f0", primary: ["#5b704b", "#4e6040", "#415035", "#ffffff"], secondary: ["#d8ddc8", "#cbd2b8", "#bbc5a4", "#39412f"], muted: ["#e7e0d5", "#6c6357"], accent: ["#ecd1d0", "#6c3738"], border: ["#d3c5b2", "#9c896f"], input: "#fbf7ee", ring: "#687d57", selection: ["#d5dfc4", "#3c4932"], charts: ["#5b704b", "#a65f54", "#597d78", "#7c6088", "#9e7435", "#526f8a", "#7d803c", "#965f78"] } },
      dark: { colors: { background: "#211d18", foreground: "#f1e9dc", surface: "#2d2821", raised: "#383128", overlay: "#332c24", primary: ["#a9c096", "#bacdab", "#96b282", "#293820"], secondary: ["#414735", "#4c533e", "#59604a", "#f3f1e8"], muted: ["#312c25", "#c1b6a8"], accent: ["#563637", "#f3d3d4"], border: ["#4a4135", "#796d5b"], input: "#29241e", ring: "#b1c79f", selection: ["#566248", "#f9fbf4"], charts: ["#a9c096", "#d29389", "#8fbab4", "#b19dc0", "#cbaa70", "#8dacC4", "#afb979", "#c497ab"] }, tokens: { "shadow.md": [{ x: "0", y: "12px", blur: "28px", spread: "-14px", color: "#000000a6" }] } }
    }
  };

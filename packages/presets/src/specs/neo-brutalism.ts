import { geometricSans } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const neoBrutalismPreset: PresetSpec = {
    id: "oria-neo-brutalism", name: "Neo Brutalism", category: "visual-style",
    tokens: {
      "font.sans": geometricSans, "font.display": geometricSans, "font.weight.normal": "500", "font.weight.semibold": "700", "font.weight.bold": "900",
      "tracking.tight": "-0.04em", "radius": "0", "border.width.hairline": "2px", "border.width.default": "2px", "border.width.strong": "3px", "ring.width": "3px", "ring.offset": "3px",
      "shadow.xs": [{ x: "2px", y: "2px", blur: "0", spread: "0", color: "#171717" }], "shadow.sm": [{ x: "4px", y: "4px", blur: "0", spread: "0", color: "#171717" }], "shadow.md": [{ x: "7px", y: "7px", blur: "0", spread: "0", color: "#171717" }], "shadow.lg": [{ x: "10px", y: "10px", blur: "0", spread: "0", color: "#171717" }],
      "duration.fast": "80ms", "duration.normal": "130ms", "ease.standard": [0, 0, 1, 1]
    },
    modes: {
      light: { colors: { background: "#fff7dc", foreground: "#171717", surface: "#ffe55c", raised: "#ffffff", primary: ["#165dff", "#0d4ee6", "#073dba", "#ffffff"], secondary: ["#ffcf3f", "#f2bc24", "#dfa70d", "#211900"], muted: ["#eee6ca", "#554f3c"], accent: ["#ff6f91", "#4d0d1d"], border: ["#171717", "#000000"], input: "#ffffff", ring: "#165dff", selection: ["#7eddf2", "#102d34"], charts: ["#165dff", "#00a878", "#f04444", "#7a3ff2", "#ff8a00", "#00a7c4", "#759400", "#dd2f8c"] } },
      dark: { colors: { background: "#141414", foreground: "#fff7dc", surface: "#252525", raised: "#303030", overlay: "#292929", primary: ["#74a0ff", "#91b4ff", "#5a8cf5", "#10214a"], secondary: ["#7d6314", "#967817", "#ad8b1c", "#fff4c4"], muted: ["#2b2b2b", "#c6bea3"], accent: ["#7a2940", "#ffdce5"], border: ["#fff7dc", "#ffffff"], input: "#1d1d1d", ring: "#82a9ff", selection: ["#257389", "#f4fdff"], charts: ["#74a0ff", "#51d0ad", "#ff8181", "#b28cf7", "#ffb35f", "#55c9de", "#b4cc5f", "#f184bd"] }, tokens: { "shadow.xs": [{ x: "2px", y: "2px", blur: "0", spread: "0", color: "#fff7dc" }], "shadow.sm": [{ x: "4px", y: "4px", blur: "0", spread: "0", color: "#fff7dc" }], "shadow.md": [{ x: "7px", y: "7px", blur: "0", spread: "0", color: "#fff7dc" }], "shadow.lg": [{ x: "10px", y: "10px", blur: "0", spread: "0", color: "#fff7dc" }] } }
    }
  };

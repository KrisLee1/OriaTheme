import { geometricSans } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const memphisPreset: PresetSpec = {
    id: "oria-memphis", name: "Memphis", category: "visual-style",
    tokens: {
      "font.sans": geometricSans, "font.display": geometricSans, "font.weight.semibold": "700", "font.weight.bold": "800", "tracking.tight": "-0.035em",
      "radius": "0.125rem", "border.width.strong": "2px",
      "shadow.sm": [{ x: "3px", y: "3px", blur: "0", spread: "0", color: "#181818" }], "shadow.md": [{ x: "6px", y: "6px", blur: "0", spread: "0", color: "#2f65d9" }], "shadow.lg": [{ x: "9px", y: "9px", blur: "0", spread: "0", color: "#ea5685" }],
      "duration.normal": "210ms", "ease.emphasized": [0.34, 1.56, 0.64, 1]
    },
    modes: {
      light: { colors: { background: "#fff8dd", foreground: "#202020", surface: "#ffe361", raised: "#ffffff", primary: ["#2f65d9", "#2856bd", "#20479f", "#ffffff"], secondary: ["#43bfa7", "#34a993", "#288f7d", "#123d35"], muted: ["#eee6cd", "#595342"], accent: ["#f7a8c0", "#6b1731"], border: ["#202020", "#000000"], ring: "#2f65d9", selection: ["#f6cb4e", "#312800"], charts: ["#2f65d9", "#43bfa7", "#ea5685", "#e29b21", "#7546bb", "#2a9bbb", "#7f9b24", "#c6408d"] }, tokens: { "gradient.accent": { type: "linear", angle: 135, stops: [{ color: "#ffe361" }, { color: "#f77da3", position: 50 }, { color: "#4ccbb1", position: 100 }] } } },
      dark: { colors: { background: "#181722", foreground: "#fff8dd", surface: "#29273a", raised: "#343148", overlay: "#2f2c42", primary: ["#7ea3ff", "#99b7ff", "#638cf5", "#16264d"], secondary: ["#54d2b9", "#71dcc7", "#3bc4aa", "#123c34"], muted: ["#2d2a3d", "#c5bdd0"], accent: ["#8a3450", "#ffe1ea"], border: ["#fff2b8", "#ffffff"], ring: "#8aabff", selection: ["#7d621d", "#fffbee"], charts: ["#7ea3ff", "#54d2b9", "#f384a5", "#efb653", "#ac84e8", "#6ac8df", "#b5cb55", "#eb7ac0"] }, tokens: { "gradient.accent": { type: "linear", angle: 135, stops: [{ color: "#f6c94f" }, { color: "#e96895", position: 50 }, { color: "#48cbb2", position: 100 }] }, "shadow.sm": [{ x: "3px", y: "3px", blur: "0", spread: "0", color: "#fff8dd" }], "shadow.md": [{ x: "6px", y: "6px", blur: "0", spread: "0", color: "#7ea3ff" }], "shadow.lg": [{ x: "9px", y: "9px", blur: "0", spread: "0", color: "#f384a5" }] } }
    }
  };

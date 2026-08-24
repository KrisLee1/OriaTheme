import { developerSans, mono } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const cyberpunkPreset: PresetSpec = {
    id: "oria-cyberpunk", name: "Cyberpunk", category: "visual-style",
    tokens: {
      "font.sans": developerSans, "font.display": mono, "font.mono": mono, "font.weight.bold": "800", "tracking.wide": "0.075em", "tracking.wider": "0.095em", "tracking.widest": "0.13em",
      "radius": "0", "border.width.strong": "2px",
      "shadow.sm": [{ x: "0", y: "0", blur: "14px", spread: "-5px", color: "#00e5ff80" }], "shadow.md": [{ x: "0", y: "0", blur: "28px", spread: "-10px", color: "#ff3ca699" }],
      "duration.fast": "70ms", "duration.normal": "130ms", "ease.standard": [0.1, 0.9, 0.2, 1]
    },
    modes: {
      light: { colors: { background: "#f3f5ec", foreground: "#161b20", surface: "#e5e9de", raised: "#ffffff", primary: ["#394d00", "#2f4000", "#263400", "#ffffff"], secondary: ["#bceaf0", "#a8dfe7", "#8ed1dc", "#153f46"], muted: ["#e4e7df", "#59615e"], accent: ["#ffd5e9", "#70163f"], border: ["#22282d", "#000000"], ring: "#506900", selection: ["#d7e870", "#293000"], charts: ["#506900", "#007b88", "#b61f68", "#5b45a0", "#ae5c00", "#27709c", "#4b7826", "#9e317d"] }, tokens: { "gradient.accent": { type: "linear", angle: 110, stops: [{ color: "#bedb00" }, { color: "#00b4c7", position: 50 }, { color: "#e5328c", position: 100 }] } } },
      dark: { colors: { background: "#07090c", foreground: "#edf6f2", surface: "#10151b", raised: "#171e25", overlay: "#131a21", primary: ["#d5f24a", "#e1f66d", "#c3e12b", "#253000"], secondary: ["#123840", "#174750", "#1c5660", "#d9fbff"], muted: ["#121920", "#a9bbb8"], accent: ["#4a1731", "#ffd8ea"], border: ["#2b4449", "#5fb5bd"], input: "#0d151a", ring: "#d9f454", selection: ["#536214", "#fbffe7"], charts: ["#d5f24a", "#39d9e6", "#ff62ad", "#9e88ff", "#ff9d42", "#63bfff", "#7ee268", "#df70d0"] }, tokens: { "gradient.bg": { type: "linear", angle: 155, stops: [{ color: "#071117" }, { color: "#100a1d", position: 58 }, { color: "#07090c", position: 100 }] }, "gradient.accent": { type: "linear", angle: 110, stops: [{ color: "#d5f24a" }, { color: "#39d9e6", position: 50 }, { color: "#ff62ad", position: 100 }] }, "shadow.sm": [{ x: "0", y: "0", blur: "16px", spread: "-5px", color: "#39d9e6a6" }], "shadow.md": [{ x: "0", y: "0", blur: "32px", spread: "-10px", color: "#ff62ada6" }] } }
    }
  };

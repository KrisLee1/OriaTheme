import { humanistSans, editorialSerif } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const organicPreset: PresetSpec = {
    id: "oria-organic", name: "Organic", category: "mood-context",
    tokens: {
      "font.sans": humanistSans, "font.serif": editorialSerif, "font.display": editorialSerif, "leading.relaxed": 1.76,
      "radius": "0.375rem", "shadow.sm": [{ x: "0", y: "4px", blur: "12px", spread: "-7px", color: "#51463233" }], "shadow.md": [{ x: "0", y: "14px", blur: "30px", spread: "-18px", color: "#51463245" }],
      "duration.normal": "240ms", "ease.standard": [0.25, 0.8, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#f3efe3", foreground: "#30342a", surface: "#e5e4d4", raised: "#fbf8ef", primary: ["#526a43", "#465b39", "#3a4c30", "#ffffff"], secondary: ["#d6d9c4", "#c7ccb2", "#b5bc9d", "#343b2d"], muted: ["#e4e3d8", "#62695c"], accent: ["#ead2bd", "#6b3e25"], border: ["#cecbb9", "#96927d"], input: "#f9f6ec", ring: "#60784f", selection: ["#c8d3b5", "#34402c"], charts: ["#526a43", "#9a613d", "#4d7b72", "#776187", "#a35260", "#8a7636", "#467084", "#875f76"] } },
      dark: { colors: { background: "#1c2019", foreground: "#eff0e8", surface: "#282d23", raised: "#34392d", overlay: "#2f3429", primary: ["#a4c093", "#b6cca8", "#91b17e", "#26351f"], secondary: ["#3d4536", "#48523f", "#555f49", "#f2f3ec"], muted: ["#2d3328", "#bdc2b4"], accent: ["#523626", "#f1d3bc"], border: ["#42493a", "#707764"], input: "#252a21", ring: "#adc79e", selection: ["#526449", "#f8fbf3"], charts: ["#a4c093", "#d09a78", "#89bbb0", "#ae9bc0", "#d18e9b", "#c0ad70", "#83b0c0", "#bd99b0"] }, tokens: { "shadow.md": [{ x: "0", y: "16px", blur: "34px", spread: "-18px", color: "#000000a6" }] } }
    }
  };

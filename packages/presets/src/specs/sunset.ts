import { humanistSans, editorialSerif } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const sunsetPreset: PresetSpec = {
    id: "oria-sunset", name: "Sunset", category: "mood-context",
    tokens: {
      "font.sans": humanistSans, "font.display": editorialSerif, "tracking.tight": "-0.025em",
      "radius": "0.5rem", "shadow.sm": [{ x: "0", y: "6px", blur: "18px", spread: "-10px", color: "#c65f493d" }], "shadow.md": [{ x: "0", y: "18px", blur: "42px", spread: "-22px", color: "#a7475c59" }],
      "duration.normal": "270ms", "duration.slow": "440ms", "ease.standard": [0.25, 0.8, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#fff7ef", foreground: "#442a2b", surface: "#fde8dc", raised: "#fffdf9", primary: ["#b6493e", "#9d3e35", "#84342d", "#ffffff"], secondary: ["#f3d1bd", "#eabfa7", "#ddaa8d", "#4a2d26"], muted: ["#f4e9e2", "#765e5c"], accent: ["#eddaed", "#633d63"], border: ["#eccbbe", "#c18f82"], ring: "#c15347", selection: ["#f0c5b3", "#552d25"], charts: ["#b6493e", "#a66b24", "#6c5a9b", "#b44f7a", "#367d83", "#777f30", "#426e9a", "#8f557f"] }, tokens: { "gradient.bg": { type: "linear", angle: 165, stops: [{ color: "#fff4d8" }, { color: "#ffd8c7", position: 44 }, { color: "#f2d8eb", position: 78 }, { color: "#fff7ef", position: 100 }] }, "gradient.accent": { type: "linear", angle: 110, stops: [{ color: "#f4b24f" }, { color: "#e46f61", position: 52 }, { color: "#b65b9a", position: 100 }] } } },
      dark: { colors: { background: "#21131d", foreground: "#fff1eb", surface: "#321c29", raised: "#402434", overlay: "#39202f", primary: ["#f29a7f", "#f6ad96", "#eb8268", "#4b1c13"], secondary: ["#5c382d", "#6d4538", "#7f5344", "#fff0e8"], muted: ["#36212d", "#cdb4bd"], accent: ["#4f2c52", "#f6ddf5"], border: ["#573347", "#835b70"], ring: "#f4a087", selection: ["#704238", "#fff7f3"], charts: ["#f29a7f", "#e5b066", "#ad97e0", "#e58eb6", "#76bcc2", "#b4bf6d", "#7ba9da", "#d093c4"] }, tokens: { "gradient.bg": { type: "linear", angle: 165, stops: [{ color: "#4a2b1b" }, { color: "#542334", position: 44 }, { color: "#35234f", position: 78 }, { color: "#21131d", position: 100 }] }, "gradient.accent": { type: "linear", angle: 110, stops: [{ color: "#f3b55f" }, { color: "#ef7d6d", position: 52 }, { color: "#ca70ad", position: 100 }] }, "shadow.md": [{ x: "0", y: "20px", blur: "48px", spread: "-22px", color: "#000000b8" }] } }
    }
  };

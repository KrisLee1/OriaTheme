import { readingSerif } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const warmReadingPreset: PresetSpec = {
    id: "oria-warm-reading", name: "Warm Reading", category: "brand-product",
    tokens: {
      "font.serif": readingSerif, "font.display": readingSerif,
      "text.md": "1.0625rem", "text.4xl": "3.25rem", "text.5xl": "4.3333rem", "text.6xl": "5.4167rem", "text.7xl": "6.5rem", "text.8xl": "8.6667rem", "text.9xl": "11.5556rem", "leading.normal": 1.62, "leading.relaxed": 1.82,
      "tracking.tight": "-0.018em", "radius": "0.25rem", "shadow.sm": [{ x: "0", y: "2px", blur: "8px", spread: "-4px", color: "#5f3b221f" }],
      "shadow.md": [{ x: "0", y: "8px", blur: "22px", spread: "-12px", color: "#5f3b2238" }],
      "duration.normal": "180ms", "ease.standard": [0.25, 0.1, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#faf7f0", foreground: "#362c25", surface: "#f2eadf", raised: "#fffdf8", primary: ["#9b4f2f", "#854128", "#6f3522", "#ffffff"], secondary: ["#ead8c6", "#dfc9b5", "#d1b69e", "#3d3028"], muted: ["#efe8de", "#6c5c50"], accent: ["#f1dfc8", "#66451f"], border: ["#ddcdbd", "#b9a18b"], ring: "#a45737", selection: ["#e8c5aa", "#40291d"], charts: ["#9b4f2f", "#7c6d3c", "#467065", "#9b735f", "#6e6282", "#b77832", "#526f46", "#9a5661"] } },
      dark: { colors: { background: "#211a16", foreground: "#f5ede3", surface: "#2f2520", raised: "#3a2d26", overlay: "#342923", primary: ["#e6a17d", "#efb497", "#d88c68", "#3a1c10"], secondary: ["#4b3a31", "#59453a", "#685044", "#f8eee5"], muted: ["#342a24", "#c6b5a8"], accent: ["#4b3823", "#f0d6ac"], border: ["#534238", "#796154"], ring: "#e6a17d", selection: ["#784a36", "#fff8f1"], charts: ["#e6a17d", "#c2b170", "#81b3a5", "#c99b83", "#a99ac2", "#dda565", "#8fad7e", "#d18a96"] }, tokens: { "shadow.md": [{ x: "0", y: "10px", blur: "24px", spread: "-12px", color: "#0000008c" }] } }
    }
  };

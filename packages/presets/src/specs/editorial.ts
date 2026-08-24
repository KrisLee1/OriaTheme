import { editorialSerif } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const editorialPreset: PresetSpec = {
    id: "oria-editorial", name: "Editorial", category: "design-language",
    tokens: {
      "font.serif": editorialSerif, "font.display": editorialSerif,
      "text.xl": "1.375rem", "text.2xl": "1.875rem", "text.3xl": "2.75rem", "text.4xl": "4.5rem", "text.5xl": "6rem", "text.6xl": "7.5rem", "text.7xl": "9rem", "text.8xl": "12rem", "text.9xl": "16rem",
      "leading.tight": 0.98, "leading.normal": 1.58, "leading.relaxed": 1.84, "tracking.tight": "-0.045em",
      "radius": "0", "shadow.2xs": [], "shadow.xs": [], "shadow.sm": [], "shadow.md": [], "shadow.lg": [],
      "duration.normal": "180ms", "ease.standard": [0.25, 0.1, 0.25, 1]
    },
    modes: {
      light: { colors: { background: "#faf8f3", foreground: "#191815", surface: "#f0ede6", raised: "#fffefb", primary: ["#9b3028", "#862820", "#70211b", "#ffffff"], secondary: ["#e5e0d5", "#d9d2c5", "#c8bead", "#25221d"], muted: ["#eeebe4", "#625f58"], accent: ["#efe0bc", "#5d4616"], border: ["#d8d1c4", "#777169"], input: "#fffefb", ring: "#9b3028", selection: ["#e8c1b8", "#3f211d"], charts: ["#9b3028", "#1e5e75", "#61723b", "#8a5b2f", "#5c4f82", "#b06a3d", "#3e7063", "#8f5263"] } },
      dark: { colors: { background: "#171614", foreground: "#f3efe7", surface: "#22201d", raised: "#2b2824", overlay: "#26231f", primary: ["#e78d80", "#efa397", "#da7568", "#3b1511"], secondary: ["#39352f", "#454039", "#514b43", "#f6f1e8"], muted: ["#292622", "#c0bab0"], accent: ["#4a3d20", "#f2dfaa"], border: ["#413c35", "#746d63"], input: "#211f1c", ring: "#eb9589", selection: ["#6f3b34", "#fff8f3"], charts: ["#e78d80", "#72acc0", "#a9ba78", "#c99a66", "#a99bcd", "#dc9d75", "#7fb7aa", "#cc8fa0"] } }
    }
  };

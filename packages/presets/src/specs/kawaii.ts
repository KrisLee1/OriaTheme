import { roundedSans } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const kawaiiPreset: PresetSpec = {
    id: "oria-kawaii", name: "Kawaii", category: "mood-context",
    tokens: {
      "font.sans": roundedSans, "font.display": roundedSans, "font.weight.semibold": "700", "font.weight.bold": "800",
      "radius": "0.75rem", "shadow.sm": [{ x: "0", y: "7px", blur: "18px", spread: "-10px", color: "#b66f9b3d" }], "shadow.md": [{ x: "0", y: "18px", blur: "40px", spread: "-22px", color: "#9e75b852" }],
      "duration.normal": "260ms", "ease.emphasized": [0.34, 1.56, 0.64, 1]
    },
    modes: {
      light: { colors: { background: "#fff7fb", foreground: "#493448", surface: "#f9e8f1", raised: "#ffffff", primary: ["#a44d7a", "#8f426a", "#783858", "#ffffff"], secondary: ["#dce9fa", "#cadcf4", "#b5cce9", "#30465f"], muted: ["#f2eaf0", "#745f72"], accent: ["#daf2e8", "#315e50"], border: ["#ebcfe0", "#c28daa"], ring: "#b05c86", selection: ["#edd5eb", "#56364f"], charts: ["#a44d7a", "#4d8c79", "#b77a2d", "#775fab", "#ba6175", "#4e83a2", "#718844", "#995d94"] }, tokens: { "gradient.bg": { type: "radial", position: "top", stops: [{ color: "#f9ddea" }, { color: "#e4e3fb", position: 48 }, { color: "#ddf3eb", position: 78 }, { color: "#fff7fb", position: 100 }] }, "gradient.accent": { type: "linear", angle: 115, stops: [{ color: "#f49fc3" }, { color: "#aaa0ef", position: 50 }, { color: "#91ddc8", position: 100 }] } } },
      dark: { colors: { background: "#241923", foreground: "#fff2fa", surface: "#352332", raised: "#422b3e", overlay: "#3b2737", primary: ["#e69bc2", "#edaecc", "#da83b0", "#4b1733"], secondary: ["#35465f", "#405571", "#4b6483", "#f0f6ff"], muted: ["#332432", "#cbb6c8"], accent: ["#294c43", "#d8f5ec"], border: ["#593b52", "#89637d"], ring: "#eaa3c7", selection: ["#67455f", "#fff8fc"], charts: ["#e69bc2", "#8ac8b6", "#dfb06f", "#b3a0e2", "#db91a0", "#8bb8cd", "#acbd79", "#d29acb"] }, tokens: { "gradient.bg": { type: "radial", position: "top", stops: [{ color: "#512943" }, { color: "#302950", position: 48 }, { color: "#23433d", position: 78 }, { color: "#241923", position: 100 }] }, "gradient.accent": { type: "linear", angle: 115, stops: [{ color: "#f09ac0" }, { color: "#aa9cf1", position: 50 }, { color: "#83d9c2", position: 100 }] }, "shadow.md": [{ x: "0", y: "20px", blur: "46px", spread: "-22px", color: "#000000b3" }] } }
    }
  };

import { humanistSans, backdropBlurScale } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const aiNativePreset: PresetSpec = {
    id: "oria-ai-native", name: "AI Native", category: "design-language",
    tokens: {
      "font.sans": humanistSans, "font.display": humanistSans,
      "radius": "0.5rem", ...backdropBlurScale(18), "backdrop.saturate": 1.2,
      "shadow.sm": [{ x: "0", y: "4px", blur: "14px", spread: "-8px", color: "#5147992b" }], "shadow.md": [{ x: "0", y: "14px", blur: "34px", spread: "-18px", color: "#51479947" }],
      "duration.normal": "240ms", "duration.slow": "380ms", "ease.emphasized": [0.16, 1, 0.3, 1]
    },
    modes: {
      light: { colors: { background: "#f8f8fc", foreground: "#242336", surface: "#eeeefa", raised: "#ffffff", overlay: "#fafaff", primary: ["#5c53a7", "#4e4696", "#423b82", "#ffffff"], secondary: ["#e2e1f3", "#d4d2eb", "#c4c1e0", "#302d4d"], muted: ["#ececf3", "#626178"], accent: ["#dff3ed", "#235c50"], border: ["#dad9e8", "#a6a3bc"], ring: "#6b62b8", selection: ["#d5d1ef", "#35305d"], charts: ["#5c53a7", "#318375", "#b26b3e", "#3c75a5", "#a74f78", "#79893e", "#8d5aad", "#b58a2e"] }, tokens: { "gradient.bg": { type: "radial", position: "top", stops: [{ color: "#ebe7ff" }, { color: "#e7f6f2", position: 52 }, { color: "#f8f8fc", position: 100 }] }, "gradient.accent": { type: "linear", angle: 120, stops: [{ color: "#7669d6" }, { color: "#45a995", position: 100 }] } } },
      dark: { colors: { background: "#101018", foreground: "#f1f0fa", surface: "#1a1927", raised: "#242237", overlay: "#201e30", primary: ["#a9a1ed", "#bbb5f3", "#958bdf", "#211c4d"], secondary: ["#312e48", "#3b3756", "#464164", "#f4f2fc"], muted: ["#211f30", "#b4b0c8"], accent: ["#193d39", "#c9f3e9"], border: ["#343145", "#5e5974"], ring: "#b1aaf0", selection: ["#4b4579", "#f8f6ff"], charts: ["#a9a1ed", "#72c7b6", "#e3a078", "#78aed6", "#dc86aa", "#a9ba70", "#c596df", "#ddbb6b"] }, tokens: { "gradient.bg": { type: "radial", position: "top", stops: [{ color: "#29234f" }, { color: "#163d3b", position: 55 }, { color: "#101018", position: 100 }] }, "gradient.accent": { type: "linear", angle: 120, stops: [{ color: "#9c8ff0" }, { color: "#54c7ae", position: 100 }] }, "shadow.md": [{ x: "0", y: "16px", blur: "38px", spread: "-18px", color: "#000000b8" }] } }
    }
  };

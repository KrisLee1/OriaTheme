import { humanistSans, backdropBlurScale } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const oceanPreset: PresetSpec = {
    id: "oria-ocean", name: "Ocean", category: "oria",
    tokens: {
      "font.sans": humanistSans, "font.display": humanistSans,
      "radius": "0.5rem", "shadow.sm": [{ x: "0", y: "3px", blur: "10px", spread: "-4px", color: "#0369a126" }],
      "shadow.md": [{ x: "0", y: "10px", blur: "28px", spread: "-12px", color: "#07598540" }],
      ...backdropBlurScale(18), "duration.normal": "220ms", "ease.standard": [0.22, 1, 0.36, 1]
    },
    modes: {
      light: { colors: { background: "#f2fbff", foreground: "#092f45", surface: "#e3f6fd", raised: "#ffffff", overlay: "#f8fdff", primary: ["#0879a6", "#06688f", "#055677", "#ffffff"], secondary: ["#c9eef8", "#b5e6f4", "#9cd9eb", "#123d52"], muted: ["#e8f4f7", "#426777"], accent: ["#cff7f1", "#155d58"], border: ["#b8dde9", "#72b7cc"], input: "#f9fdff", ring: "#0879a6", selection: ["#a8e5f2", "#0b3448"], charts: ["#0879a6", "#0f9f9a", "#2456a6", "#53a6d8", "#5d8c50", "#c77724", "#7d55b5", "#d45c75"] }, tokens: { "gradient.bg": { type: "linear", angle: 160, stops: [{ color: "#f7fdff" }, { color: "#dff5fb", position: 62 }, { color: "#c9f1ed", position: 100 }] }, "gradient.accent": { type: "linear", angle: 120, stops: [{ color: "#1ea7d4" }, { color: "#35c7b6", position: 100 }] } } },
      dark: { colors: { background: "#061d2a", foreground: "#e9f8fd", surface: "#0a2b3a", raised: "#103b4c", overlay: "#0d3343", primary: ["#6fd2ef", "#96dff4", "#42bddf", "#073042"], secondary: ["#17495a", "#1d596c", "#24697d", "#e5f8fc"], muted: ["#0d3442", "#a5c8d3"], accent: ["#124b49", "#bff5ec"], border: ["#245466", "#438097"], input: "#0b3141", ring: "#73d8f3", selection: ["#176c83", "#f1fbfe"], charts: ["#6fd2ef", "#49d3c2", "#7fa7ff", "#87c8f0", "#9acb84", "#f1ad62", "#b69ae6", "#f08ba0"] }, tokens: { "gradient.bg": { type: "radial", position: "top", stops: [{ color: "#0c4051" }, { color: "#061d2a", position: 66 }, { color: "#04141e", position: 100 }] }, "gradient.accent": { type: "linear", angle: 120, stops: [{ color: "#36bfe8" }, { color: "#39d6bd", position: 100 }] }, "shadow.md": [{ x: "0", y: "12px", blur: "34px", spread: "-14px", color: "#00000099" }] } }
    }
  };

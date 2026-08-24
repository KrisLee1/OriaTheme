import { developerSans } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const precisionFlowPreset: PresetSpec = {
    id: "oria-precision-flow", name: "Precision Flow", category: "brand-product",
    tokens: {
      "font.sans": developerSans, "font.display": developerSans, "tracking.tight": "-0.025em",
      "control.height.sm": 7, "control.height.md": 9, "control.height.lg": 11,
      "radius": "0.25rem", "shadow.sm": [{ x: "0", y: "1px", blur: "3px", spread: "0", color: "#1714291f" }], "shadow.md": [{ x: "0", y: "8px", blur: "20px", spread: "-10px", color: "#211a3d45" }],
      "duration.fast": "100ms", "duration.normal": "160ms", "ease.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#f7f8fb", foreground: "#232326", surface: "#eef0f5", raised: "#ffffff", primary: ["#4c5fb3", "#3f50a0", "#34438a", "#ffffff"], secondary: ["#e4e6ed", "#d9dce5", "#cbd0dc", "#292a30"], muted: ["#eceef3", "#626774"], accent: ["#e7e5f6", "#4c467b"], border: ["#d9dce3", "#a7acb8"], ring: "#5b6fc2", selection: ["#cfd5ef", "#2d3560"], charts: ["#4c5fb3", "#477a73", "#7d5da8", "#b46176", "#a97833", "#3f769a", "#687941", "#9a5b8f"] } },
      dark: { colors: { background: "#111114", foreground: "#f4f4f5", surface: "#18181c", raised: "#202026", overlay: "#1c1c21", primary: ["#8996e8", "#a0aaf0", "#717fda", "#17192e"], secondary: ["#292930", "#33333b", "#3e3e48", "#f2f2f5"], muted: ["#202026", "#afb0bb"], accent: ["#2d2946", "#ded8ff"], border: ["#303038", "#585a66"], input: "#1b1b20", ring: "#96a2ed", selection: ["#394579", "#f7f7ff"], charts: ["#8996e8", "#78b2a9", "#b293dc", "#dc8da1", "#d0a366", "#75acd0", "#a1b178", "#cf90c4"] }, tokens: { "shadow.md": [{ x: "0", y: "10px", blur: "26px", spread: "-12px", color: "#000000b8" }] } }
    }
  };

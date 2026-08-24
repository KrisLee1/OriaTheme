import { systemSans } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const monoPreset: PresetSpec = {
    id: "oria-mono", name: "Mono", category: "visual-style",
    tokens: {
      "font.sans": systemSans, "font.display": systemSans, "tracking.tight": "-0.03em",
      "radius": "0.125rem", "shadow.sm": [{ x: "0", y: "2px", blur: "6px", spread: "-3px", color: "#0000001f" }], "shadow.md": [{ x: "0", y: "10px", blur: "24px", spread: "-14px", color: "#0000003d" }],
      "duration.normal": "180ms", "ease.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#f7f7f7", foreground: "#161616", surface: "#ededed", raised: "#ffffff", primary: ["#242424", "#353535", "#101010", "#ffffff"], secondary: ["#dedede", "#d2d2d2", "#c3c3c3", "#1f1f1f"], muted: ["#e9e9e9", "#626262"], accent: ["#d9d9d9", "#292929"], border: ["#d2d2d2", "#888888"], input: "#ffffff", ring: "#404040", selection: ["#c8c8c8", "#171717"], charts: ["#171717", "#343434", "#505050", "#6c6c6c", "#878787", "#a1a1a1", "#b9b9b9", "#d0d0d0"] } },
      dark: { colors: { background: "#121212", foreground: "#eeeeee", surface: "#1c1c1c", raised: "#272727", overlay: "#222222", primary: ["#e5e5e5", "#ffffff", "#cccccc", "#171717"], secondary: ["#303030", "#3a3a3a", "#464646", "#f2f2f2"], muted: ["#242424", "#b8b8b8"], accent: ["#373737", "#f0f0f0"], border: ["#383838", "#707070"], input: "#1d1d1d", ring: "#d9d9d9", selection: ["#545454", "#ffffff"], charts: ["#eeeeee", "#d5d5d5", "#bbbbbb", "#a2a2a2", "#898989", "#707070", "#585858", "#414141"] }, tokens: { "shadow.md": [{ x: "0", y: "12px", blur: "28px", spread: "-14px", color: "#000000cc" }] } }
    }
  };

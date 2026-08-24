import { roundedSans } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const softUiPreset: PresetSpec = {
    id: "oria-soft-ui", name: "Soft UI", category: "visual-style",
    tokens: {
      "font.sans": roundedSans, "font.display": roundedSans, "radius": "0.5rem", "shadow.sm": [{ x: "0", y: "6px", blur: "18px", spread: "-10px", color: "#66758f38" }], "shadow.md": [{ x: "0", y: "16px", blur: "38px", spread: "-20px", color: "#66758f4d" }],
      "opacity.muted": 0.72, "duration.normal": "240ms", "ease.standard": [0.22, 1, 0.36, 1]
    },
    modes: {
      light: { colors: { background: "#f1f4f8", foreground: "#2a3546", surface: "#e7ebf3", raised: "#fbfcff", primary: ["#526fa6", "#465f91", "#3b507b", "#ffffff"], secondary: ["#dfe4ee", "#d3dae7", "#c3ccdc", "#303d4e"], muted: ["#e8ecf2", "#647083"], accent: ["#e7def2", "#584773"], border: ["#d9dfE9", "#a4afc1"], input: "#f8faff", ring: "#607eb5", selection: ["#cedaee", "#334765"], charts: ["#526fa6", "#57816f", "#9a7444", "#79649e", "#a66176", "#5b7f93", "#74834a", "#90658a"] } },
      dark: { colors: { background: "#1a202b", foreground: "#eff2f8", surface: "#242c39", raised: "#2e3846", overlay: "#2a3340", primary: ["#91abda", "#a7bbe2", "#7c99cc", "#1b2b49"], secondary: ["#364150", "#414d5d", "#4c5a6b", "#f2f5fa"], muted: ["#2a3340", "#bac3d0"], accent: ["#40344f", "#eadcf8"], border: ["#3d4858", "#6b788b"], input: "#232b37", ring: "#9ab2df", selection: ["#465e86", "#f7f9ff"], charts: ["#91abda", "#8cbaa5", "#d1ad7d", "#ad9bc8", "#d09baa", "#8eb3c3", "#adb981", "#c79fbe"] }, tokens: { "shadow.md": [{ x: "0", y: "18px", blur: "42px", spread: "-20px", color: "#000000b3" }] } }
    }
  };

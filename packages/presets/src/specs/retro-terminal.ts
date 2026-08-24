import { mono } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const retroTerminalPreset: PresetSpec = {
    id: "oria-retro-terminal", name: "Retro Terminal", category: "visual-style",
    tokens: {
      "font.sans": mono, "font.mono": mono, "font.display": mono, "tracking.normal": "0.02em", "tracking.wide": "0.08em", "tracking.wider": "0.1em", "tracking.widest": "0.14em",
      "radius": "0", "border.width.strong": "1px",
      "shadow.2xs": [], "shadow.xs": [], "shadow.sm": [], "shadow.md": [{ x: "0", y: "0", blur: "18px", spread: "-8px", color: "#2ee66f73" }],
      "duration.fast": "50ms", "duration.normal": "90ms", "duration.slow": "150ms", "ease.standard": [0, 0, 1, 1]
    },
    modes: {
      light: { colors: { background: "#eef4e9", foreground: "#17351e", surface: "#dfead8", raised: "#f7fbf4", primary: ["#1c6a36", "#175a2e", "#124a26", "#ffffff"], secondary: ["#ceddc6", "#bed2b5", "#abc5a0", "#1b3b21"], muted: ["#dce7d5", "#526b55"], accent: ["#efe0b7", "#634a14"], border: ["#97af91", "#496a4d"], input: "#edf5e8", ring: "#227b40", selection: ["#b7d6ae", "#1b3f23"], charts: ["#1c6a36", "#8a6a20", "#29737b", "#674f87", "#98465b", "#38735b", "#64752a", "#825476"] } },
      dark: { colors: { background: "#041008", foreground: "#b9f5c8", surface: "#081a0e", raised: "#0d2514", overlay: "#0a2011", primary: ["#5de67f", "#79ec95", "#43d76a", "#073518"], secondary: ["#123a20", "#184a29", "#1e5a32", "#d8fbe0"], muted: ["#0b2413", "#91c99d"], accent: ["#4a3610", "#ffe39a"], border: ["#1b5730", "#41945b"], input: "#06180c", ring: "#65e986", selection: ["#246b39", "#effff3"], charts: ["#5de67f", "#f1c35f", "#55ced2", "#b091e0", "#e57f96", "#67c79d", "#b4cf5d", "#d28bc1"] }, tokens: { "shadow.md": [{ x: "0", y: "0", blur: "20px", spread: "-8px", color: "#5de67f8f" }] } }
    }
  };

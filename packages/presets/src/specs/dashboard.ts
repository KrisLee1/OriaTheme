import { developerSans, mono } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const dashboardPreset: PresetSpec = {
    id: "oria-dashboard", name: "Dashboard", category: "design-language",
    tokens: {
      "font.sans": developerSans, "font.display": developerSans, "font.mono": mono,
      "text.xs": "0.6875rem", "text.sm": "0.8125rem", "control.height.sm": 7, "control.height.md": 8, "control.height.lg": 10, "control.padding.x.sm": 2, "control.padding.x.md": 3,
      "radius": "0.25rem", "shadow.sm": [{ x: "0", y: "1px", blur: "3px", spread: "0", color: "#1322351f" }], "shadow.md": [{ x: "0", y: "6px", blur: "16px", spread: "-8px", color: "#13223533" }],
      "duration.fast": "90ms", "duration.normal": "140ms", "ease.standard": [0.2, 0, 0, 1]
    },
    modes: {
      light: { colors: { background: "#f4f6f8", foreground: "#1b2733", surface: "#e9edf1", raised: "#ffffff", primary: ["#315f92", "#28527f", "#21456b", "#ffffff"], secondary: ["#dce3e9", "#ced8e0", "#bdcad5", "#243541"], muted: ["#e7ebef", "#5d6b77"], accent: ["#e7e2f4", "#514675"], border: ["#d5dce2", "#99a7b2"], input: "#fbfcfd", ring: "#3b6fa5", selection: ["#c5d9ec", "#263e57"], charts: ["#315f92", "#24806b", "#b06b22", "#7556a5", "#bd536b", "#3b7f99", "#71822c", "#9c5d8e"] } },
      dark: { colors: { background: "#0e151c", foreground: "#eaf0f4", surface: "#161f28", raised: "#1e2a35", overlay: "#1a252f", primary: ["#72a8db", "#8ab8e2", "#5896cc", "#0d2a42"], secondary: ["#283642", "#334350", "#3e5060", "#eef4f7"], muted: ["#1c2730", "#aab9c4"], accent: ["#302948", "#e1d9fa"], border: ["#2d3a45", "#596a77"], input: "#17232c", ring: "#7baedf", selection: ["#2c5578", "#f2f8fd"], charts: ["#72a8db", "#5bc3a8", "#e7a45e", "#aa8be0", "#e68196", "#69b3ce", "#a9b966", "#d18dc1"] }, tokens: { "shadow.md": [{ x: "0", y: "7px", blur: "20px", spread: "-9px", color: "#000000b3" }] } }
    }
  };

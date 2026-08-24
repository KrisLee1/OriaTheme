import { geometricSans, mono } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const redlinePreset: PresetSpec = {
  id: "oria-redline",
  name: "Redline",
  category: "visual-style",
  tokens: {
    "font.sans": geometricSans,
    "font.display": geometricSans,
    "font.mono": mono,
    "font.weight.thin": "200",
    "font.weight.extralight": "300",
    "font.weight.light": "300",
    "font.weight.normal": "400",
    "font.weight.medium": "500",
    "font.weight.semibold": "600",
    "font.weight.bold": "700",
    "font.weight.extrabold": "700",
    "font.weight.black": "700",
    "leading.normal": 1.55,
    "leading.relaxed": 1.8,
    "tracking.tight": "-0.015em",
    "tracking.wide": "0.04em",
    "radius": "0",
    "border.width.hairline": "1px",
    "border.width.default": "1px",
    "border.width.strong": "1px",
    "ring.width": "2px",
    "ring.offset": "3px",
    "shadow.2xs": [],
    "shadow.xs": [],
    "shadow.sm": [],
    "shadow.md": [],
    "shadow.lg": [],
    "shadow.xl": [],
    "shadow.2xl": [],
    "shadow.inner": [],
    "shadow.highlight": [],
    "duration.fast": "120ms",
    "duration.normal": "210ms",
    "ease.standard": [0.2, 0, 0, 1]
  },
  modes: {
    light: {
      colors: {
        background: "#fbfaf7",
        foreground: "#171211",
        surface: "#f3f1ec",
        raised: "#fffefa",
        overlay: "#fffefa",
        primary: ["#d5534b", "#c84942", "#b93f39", "#171211"],
        secondary: ["#a1a3a2", "#8b8d8c", "#737574", "#242424"],
        muted: ["#eceae4", "#171211"],
        accent: ["#f0d6d2", "#6f201d"],
        border: ["#9b9d9c", "#626462"],
        input: "#fffefa",
        ring: "#d5534b",
        selection: ["#e8bbb5", "#5d1716"],
        charts: ["#d5534b", "#8f7772", "#a1a3a2", "#7c6260", "#cf8179", "#6f7473", "#d3a099", "#8d4541"]
      },
      tokens: {
        "gradient.bg": { type: "linear", angle: 180, stops: [{ color: "#fbfaf7" }, { color: "#fbfaf7", position: 100 }] },
        "gradient.surface": { type: "linear", angle: 180, stops: [{ color: "#d5534b" }, { color: "#d5534b", position: 100 }] },
        "gradient.accent": { type: "linear", angle: 180, stops: [{ color: "#fffefa" }, { color: "#fffefa", position: 100 }] },
        "pattern.bg": [{ type: "noise", variant: "paper", color: "#4b4b4952", tileSize: "64px", intensity: 0.035 }],
        "pattern.surface": [{ type: "noise", variant: "film", color: "#ffffff", tileSize: "100px", intensity: 0.2 }]
      }
    },
    dark: {
      colors: {
        background: "#1d1918",
        foreground: "#f3eee6",
        surface: "#272221",
        raised: "#342c2a",
        overlay: "#302826",
        primary: ["#e36e67", "#ef8179", "#ca5751", "#2a1211"],
        secondary: ["#717270", "#858683", "#5e5f5d", "#fffaf2"],
        muted: ["#302a28", "#e7ded5"],
        accent: ["#542b28", "#ffb9b1"],
        border: ["#565451", "#8c8984"],
        input: "#292321",
        ring: "#e36e67",
        selection: ["#703630", "#fff5ef"],
        charts: ["#e36e67", "#c59690", "#aeb0ad", "#d3a09a", "#f29a91", "#929895", "#e2b0aa", "#bd6761"]
      },
      tokens: {
        "gradient.bg": { type: "linear", angle: 180, stops: [{ color: "#1d1918" }, { color: "#1d1918", position: 100 }] },
        "gradient.surface": { type: "linear", angle: 180, stops: [{ color: "#ad3c36" }, { color: "#ad3c36", position: 100 }] },
        "gradient.accent": { type: "linear", angle: 180, stops: [{ color: "#f3eee6" }, { color: "#f3eee6", position: 100 }] },
        "pattern.bg": [{ type: "noise", variant: "paper", color: "#f3eee652", tileSize: "64px", intensity: 0.03 }],
        "pattern.surface": [{ type: "noise", variant: "film", color: "#ffffff", tileSize: "100px", intensity: 0.2 }]
      }
    }
  }
};

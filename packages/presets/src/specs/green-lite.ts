import { backdropBlurScale, developerSans, mono } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const greenLitePreset: PresetSpec = {
  id: "oria-green-lite",
  name: "Green Lite",
  category: "visual-style",
  tokens: {
    "font.sans": developerSans,
    "font.display": developerSans,
    "font.mono": mono,
    "font.weight.light": "300",
    "font.weight.normal": "400",
    "font.weight.medium": "400",
    "font.weight.semibold": "500",
    "font.weight.bold": "600",
    "tracking.tight": "-0.015em",
    "tracking.normal": "0.005em",
    "tracking.wide": "0.045em",
    "radius": "0.625rem",
    "border.width.hairline": "1px",
    "border.width.default": "1px",
    "border.width.strong": "1px",
    "ring.width": "2px",
    "ring.offset": "2px",
    ...backdropBlurScale(20),
    "backdrop.saturate": 1.12,
    "opacity.overlay": 0.72,
    "shadow.sm": [{ x: "0", y: "3px", blur: "10px", spread: "-8px", color: "#20303829" }],
    "shadow.md": [{ x: "0", y: "12px", blur: "26px", spread: "-22px", color: "#2030383d" }],
    "shadow.inner": [],
    "shadow.highlight": [{ x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffffa3", inset: true }],
    "duration.fast": "110ms",
    "duration.normal": "190ms",
    "duration.slow": "300ms",
    "ease.standard": [0.2, 0, 0, 1],
    "ease.emphasized": [0.16, 1, 0.3, 1]
  },
  modes: {
    light: {
      colors: {
        background: "#ffffff",
        foreground: "#172634",
        surface: "#e9f0f7",
        raised: "#ffffff",
        overlay: "#f8fbff",
        primary: ["#4fd97d", "#3ccc6e", "#2dbd62", "#073418"],
        secondary: ["#e8eef5", "#dde6ef", "#cbd8e4", "#283845"],
        muted: ["#edf2f7", "#586b7a"],
        accent: ["#d9f8e4", "#17623a"],
        border: ["#ffffffc7", "#c5d3e0"],
        input: "#f7faff",
        ring: "#52da81",
        selection: ["#c8f4d7", "#104d2c"],
        scrim: "#182b3c66",
        charts: ["#4fd97d", "#47a983", "#4a9c9e", "#5792b4", "#839d4b", "#6488c8", "#bf7d4a", "#c66a72"]
      },
      tokens: {
        "gradient.bg": {
          type: "radial",
          position: "top left",
          stops: [{ color: "#ffffff" }, { color: "#ffffff", position: 48 }, { color: "#ffffff", position: 100 }]
        },
        "gradient.surface": {
          type: "linear",
          angle: 145,
          stops: [{ color: "#ffffffc2" }, { color: "#f5f9ffa8", position: 58 }, { color: "#eaf2fa80", position: 100 }]
        },
        "gradient.accent": {
          type: "linear",
          angle: 115,
          stops: [{ color: "#c2f7d3" }, { color: "#69e597", position: 55 }, { color: "#3ccc72", position: 100 }]
        },
        "pattern.bg": [{ type: "dot", color: "#31424914", radius: "0.65px", spacing: "1.25rem", angle: 0 }]
      }
    },
    dark: {
      colors: {
        background: "#050606",
        foreground: "#f0f3f1",
        surface: "#0a0c0b",
        raised: "#101311",
        overlay: "#0d100e",
        primary: ["#71ee99", "#82f2a6", "#5cdc86", "#06150a"],
        secondary: ["#171a18", "#202421", "#292e2a", "#eef2ef"],
        muted: ["#111412", "#a8b0aa"],
        accent: ["#15311d", "#a3f7ba"],
        border: ["#2a302c", "#4b554e"],
        input: "#0b0d0c",
        ring: "#71ee99",
        selection: ["#1d6135", "#f1fff5"],
        scrim: "#000000d6",
        charts: ["#71ee99", "#5fbc96", "#5cb5ad", "#66aadf", "#acd481", "#74a4ff", "#f5ae83", "#f17c7c"]
      },
      tokens: {
        "gradient.bg": {
          type: "radial",
          position: "top left",
          stops: [{ color: "#0e110f" }, { color: "#080a09", position: 48 }, { color: "#050606", position: 100 }]
        },
        "gradient.surface": {
          type: "linear",
          angle: 145,
          stops: [{ color: "#ffffff17" }, { color: "#ffffff0d", position: 52 }, { color: "#ffffff08", position: 100 }]
        },
        "gradient.accent": {
          type: "linear",
          angle: 115,
          stops: [{ color: "#b6f8ca" }, { color: "#71ee99", position: 52 }, { color: "#45cf73", position: 100 }]
        },
        "pattern.bg": [{ type: "dot", color: "#dbe1dd1f", radius: "0.7px", spacing: "1.25rem", angle: 0 }],
        "shadow.sm": [{ x: "0", y: "4px", blur: "14px", spread: "-11px", color: "#0000008f" }],
        "shadow.md": [{ x: "0", y: "14px", blur: "30px", spread: "-24px", color: "#000000b8" }],
        "shadow.inner": [],
        "shadow.highlight": [{ x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffff2e", inset: true }]
      }
    }
  }
};

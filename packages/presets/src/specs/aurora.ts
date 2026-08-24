import { geometricSans, backdropBlurScale } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const auroraPreset: PresetSpec = {
    id: "oria-aurora", name: "Aurora", category: "visual-style",
    tokens: {
      "font.sans": geometricSans, "font.display": geometricSans,
      "tracking.tight": "-0.03em", "radius": "0.5rem", ...backdropBlurScale(24), "backdrop.saturate": 1.35,
      "shadow.md": [{ x: "0", y: "12px", blur: "34px", spread: "-15px", color: "#4d7c5f59" }],
      "duration.normal": "260ms", "duration.slow": "420ms", "ease.emphasized": [0.16, 1, 0.3, 1]
    },
    modes: {
      light: { colors: { background: "#f8fbf8", foreground: "#172b2a", surface: "#eef5f1", raised: "#ffffff", overlay: "#f8fbfa", primary: ["#326b63", "#285b54", "#204b46", "#ffffff"], secondary: ["#d7eddf", "#c5e4d1", "#afd8bf", "#213b31"], muted: ["#edf2ef", "#536c67"], accent: ["#e9ddf8", "#543b75"], border: ["#cbded6", "#92b9aa"], ring: "#4b8f7e", selection: ["#c4e7d3", "#1d3b31"], charts: ["#4b8f63", "#4b9b9a", "#635db0", "#9a57a8", "#bd596e", "#7ca640", "#c58c3c", "#397aa0"] }, tokens: { "gradient.bg": { type: "radial", position: "top", stops: [{ color: "#c8f4ba" }, { color: "#d9edf7", position: 42 }, { color: "#eee3fa", position: 72 }, { color: "#f8fbf8", position: 100 }] }, "gradient.surface": { type: "linear", angle: 135, stops: [{ color: "#ffffffcc" }, { color: "#ecf7f199", position: 100 }] }, "gradient.accent": { type: "linear", angle: 115, stops: [{ color: "#70cf83" }, { color: "#48b9c7", position: 34 }, { color: "#826ad8", position: 68 }, { color: "#d8739d", position: 100 }] } } },
      dark: { colors: { background: "#071314", foreground: "#ecfaf6", surface: "#102426", raised: "#173033", overlay: "#12282b", primary: ["#8de3ad", "#a9edc0", "#69d192", "#0b2a1a"], secondary: ["#21433a", "#295248", "#336257", "#eaf8f2"], muted: ["#142e2f", "#a4c4be"], accent: ["#33284f", "#e7d9ff"], border: ["#2c4a49", "#4e7270"], ring: "#91e7b1", selection: ["#27654e", "#f2fbf6"], charts: ["#8de3ad", "#6dd7da", "#9d91ed", "#d487e1", "#ef8eaa", "#b9db68", "#efbb69", "#69b6df"] }, tokens: { "gradient.bg": { type: "radial", position: "top", stops: [{ color: "#1b573a" }, { color: "#17305a", position: 38 }, { color: "#311d4f", position: 68 }, { color: "#071314", position: 100 }] }, "gradient.surface": { type: "linear", angle: 135, stops: [{ color: "#1d3b3dcc" }, { color: "#18233f99", position: 100 }] }, "gradient.accent": { type: "linear", angle: 115, stops: [{ color: "#86ee9f" }, { color: "#56d7df", position: 34 }, { color: "#9b83ef", position: 68 }, { color: "#ef86ab", position: 100 }] }, "shadow.md": [{ x: "0", y: "0", blur: "34px", spread: "-10px", color: "#77e7aa73" }] } }
    }
  };

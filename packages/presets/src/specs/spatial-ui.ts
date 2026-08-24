import { systemSans, backdropBlurScale } from "../preset-designs.js";
import type { PresetSpec } from "../preset-designs.js";

export const spatialUiPreset: PresetSpec = {
    id: "oria-spatial-ui", name: "Spatial UI", category: "design-language",
    tokens: {
      "font.sans": systemSans, "font.display": systemSans,
      "radius": "0.625rem", ...backdropBlurScale(36), "backdrop.saturate": 1.35, "opacity.overlay": 0.82,
      "shadow.sm": [{ x: "0", y: "8px", blur: "24px", spread: "-12px", color: "#14213d52" }, { x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffff73", inset: true }],
      "shadow.md": [{ x: "0", y: "28px", blur: "64px", spread: "-28px", color: "#0c153880" }, { x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffff80", inset: true }],
      "duration.normal": "280ms", "duration.slow": "460ms", "ease.emphasized": [0.16, 1, 0.3, 1]
    },
    modes: {
      light: { colors: { background: "#eef3f8", foreground: "#18283d", surface: "#e1eaf3", raised: "#ffffff", overlay: "#f7fbff", primary: ["#3569a7", "#2c5b93", "#244d7e", "#ffffff"], secondary: ["#d8e2ec", "#c9d7e3", "#b7c8d7", "#24384b"], muted: ["#e5ebf1", "#566a7b"], accent: ["#e5dff5", "#544375"], border: ["#d4e0ea", "#9fb3c4"], input: "#f9fcff", ring: "#427ab6", selection: ["#c7dff2", "#233f58"], charts: ["#3569a7", "#2e887d", "#765eb0", "#b85e78", "#b8782e", "#477e9f", "#6b843e", "#9b6099"] }, tokens: { "gradient.bg": { type: "radial", position: "top", stops: [{ color: "#d8e7f7" }, { color: "#e9e3f6", position: 52 }, { color: "#eef3f8", position: 100 }] }, "gradient.surface": { type: "linear", angle: 135, stops: [{ color: "#ffffffeb" }, { color: "#dbe9f6a3", position: 100 }] } } },
      dark: { colors: { background: "#070b16", foreground: "#eef3ff", surface: "#121a2b", raised: "#1b263b", overlay: "#172136", primary: ["#82b7f2", "#9bc6f5", "#69a5e8", "#0d2947"], secondary: ["#26334a", "#30405a", "#3a4d6a", "#f1f5ff"], muted: ["#19243a", "#aebcd1"], accent: ["#352b55", "#e9dcff"], border: ["#31405a", "#5d708d"], input: "#111c30", ring: "#8bbef4", selection: ["#315b8a", "#f6faff"], charts: ["#82b7f2", "#70d0c1", "#a995eb", "#ed8ca9", "#e7b370", "#75bddb", "#a9bf70", "#d597d0"] }, tokens: { "gradient.bg": { type: "radial", position: "top", stops: [{ color: "#172e58" }, { color: "#2b1d4c", position: 48 }, { color: "#070b16", position: 100 }] }, "gradient.surface": { type: "linear", angle: 135, stops: [{ color: "#2c3c5bc7" }, { color: "#171c35a3", position: 100 }] }, "shadow.md": [{ x: "0", y: "32px", blur: "72px", spread: "-30px", color: "#000000d9" }, { x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffff33", inset: true }] } }
    }
  };

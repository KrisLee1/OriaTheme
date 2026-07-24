import { h, type VNode } from "vue";

// pattern.bg is applied to the shared page canvas; this gallery documents pattern.surface specimens.

type TokenSample = { readonly label: string; readonly token: string; readonly value: string };
type ColorPair = { readonly label: string; readonly background: string; readonly foreground: string; readonly tokens: string; readonly ring?: boolean };

const semanticColors: readonly ColorPair[] = [
  { label: "Primary", background: "var(--oria-color-primary)", foreground: "var(--oria-color-primary-fg)", tokens: "color.primary · color.primary.fg" },
  { label: "Secondary", background: "var(--oria-color-secondary)", foreground: "var(--oria-color-secondary-fg)", tokens: "color.secondary · color.secondary.fg" },
  { label: "Muted", background: "var(--oria-color-muted)", foreground: "var(--oria-color-muted-fg)", tokens: "color.muted · color.muted.fg" },
  { label: "Accent", background: "var(--oria-color-accent)", foreground: "var(--oria-color-accent-fg)", tokens: "color.accent · color.accent.fg" },
  { label: "Surface", background: "var(--oria-color-surface-raised)", foreground: "var(--oria-color-surface-raised-fg)", tokens: "color.surface.raised · color.surface.raised.fg" },
  { label: "Selection", background: "var(--oria-color-selection)", foreground: "var(--oria-color-selection-fg)", tokens: "color.selection · color.selection.fg" },
  { label: "Ring", background: "var(--oria-color-surface-raised)", foreground: "var(--oria-color-surface-raised-fg)", tokens: "color.ring · color.surface.raised.fg", ring: true },
];
const feedbackColors: readonly ColorPair[] = [
  { label: "Danger", background: "var(--oria-color-danger)", foreground: "var(--oria-color-danger-fg)", tokens: "color.danger · color.danger.fg" },
  { label: "Success", background: "var(--oria-color-success)", foreground: "var(--oria-color-success-fg)", tokens: "color.success · color.success.fg" },
  { label: "Warning", background: "var(--oria-color-warning)", foreground: "var(--oria-color-warning-fg)", tokens: "color.warning · color.warning.fg" },
  { label: "Info", background: "var(--oria-color-info)", foreground: "var(--oria-color-info-fg)", tokens: "color.info · color.info.fg" },
];
const interactionColors = [
  { label: "Primary", foreground: "var(--oria-color-primary-fg)", tokens: "color.primary · color.primary.hover · color.primary.active", states: [["Base", "var(--oria-color-primary)"], ["Hover", "var(--oria-color-primary-hover)"], ["Active", "var(--oria-color-primary-active)"]] },
  { label: "Secondary", foreground: "var(--oria-color-secondary-fg)", tokens: "color.secondary · color.secondary.hover · color.secondary.active", states: [["Base", "var(--oria-color-secondary)"], ["Hover", "var(--oria-color-secondary-hover)"], ["Active", "var(--oria-color-secondary-active)"]] },
] as const;

const tokenSamples = (prefix: string, cssPrefix: string, keys: readonly string[]): readonly TokenSample[] => keys.map(key => ({
  label: key, token: `${prefix}.${key}`, value: `var(--oria-${cssPrefix}-${key})`,
}));

const fontFamilies: readonly TokenSample[] = [
  { label: "Sans", token: "font.sans", value: "var(--oria-font-sans)" },
  { label: "Serif", token: "font.serif", value: "var(--oria-font-serif)" },
  { label: "Mono", token: "font.mono", value: "var(--oria-font-mono)" },
  { label: "Display", token: "font.display", value: "var(--oria-font-display)" },
];
const fontWeights = tokenSamples("font.weight", "font-weight", ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"]);
const fontSizes = tokenSamples("text", "text", ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl"]);
const lineHeights = tokenSamples("leading", "leading", ["tight", "snug", "normal", "relaxed", "loose"]);
const letterSpacings = tokenSamples("tracking", "tracking", ["tighter", "tight", "normal", "wide", "wider", "widest"]);
const controls = ["sm", "md", "lg"].map(key => ({ label: key.toUpperCase(), height: `var(--oria-control-height-${key})`, padding: `var(--oria-control-padding-x-${key})` }));
const radii = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"].map(key => ({ label: key, token: `--oria-radius-${key}`, value: `var(--oria-radius-${key})` }));
const shadows = tokenSamples("shadow", "shadow", ["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "inner", "highlight"]);
const blurs = tokenSamples("blur", "blur", ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"]);
const backdropBlurs = tokenSamples("backdrop.blur", "backdrop-blur", ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"]);
const gradients: readonly TokenSample[] = [
  { label: "Background", token: "gradient.bg", value: "var(--oria-gradient-bg, linear-gradient(135deg, var(--oria-color-bg), var(--oria-color-accent)))" },
  { label: "Surface", token: "gradient.surface", value: "var(--oria-gradient-surface, linear-gradient(135deg, var(--oria-color-surface-raised), var(--oria-color-secondary)))" },
  { label: "Accent", token: "gradient.accent", value: "var(--oria-gradient-accent, linear-gradient(135deg, var(--oria-color-primary), var(--oria-color-info)))" },
];
const durations = tokenSamples("duration", "duration", ["instant", "fast", "normal", "slow"]);
const easings = tokenSamples("ease", "ease", ["standard", "enter", "exit", "emphasized"]);

const heading = (kicker: string, title: string, path: string): VNode => h("div", { class: "token-card-heading" }, [h("div", [h("p", { class: "card-kicker" }, kicker), h("h3", title)]), h("code", path)]);
const labeledSample = (item: TokenSample): VNode => h("span", [item.label, h("code", item.token)]);

export function renderThemeTokenShowcase(): VNode[] {
  return [
    h("article", { class: "token-card semantic-feedback-card" }, [heading("Applied meaning & system states", "Semantic & Feedback Color", "color.*"), h("div", { class: "color-showcase-columns" }, [h("section", [h("h4", "Semantic surfaces"), h("div", { class: "color-pair-grid" }, semanticColors.map(item => h("div", { class: `color-pair${item.ring ? " color-pair-ring" : ""}`, key: item.label }, [h("i", { style: { background: item.background, color: item.foreground } }, [h("b", "Aa")]), h("span", [item.label, h("code", item.tokens)])]))) ]), h("section", [h("h4", "Feedback states"), h("div", { class: "color-pair-grid" }, feedbackColors.map(item => h("div", { class: "color-pair", key: item.label }, [h("i", { style: { background: item.background, color: item.foreground } }, [h("b", "Aa")]), h("span", [item.label, h("code", item.tokens)])]))) ])]), h("section", { class: "interaction-section" }, [h("h4", "Interaction states"), h("div", { class: "interaction-grid" }, interactionColors.map(group => h("div", { class: "interaction-family", key: group.label }, [h("span", [group.label, h("code", group.tokens)]), h("div", group.states.map(([label, background]) => h("i", { key: label, style: { background, color: group.foreground } }, [h("b", label)]))) ])))])]),
    h("article", { class: "token-card chart-card" }, [heading("Data visualization", "Chart Color", "color.chart.1–8"), h("div", { class: "chart-visuals" }, [h("section", [h("h4", "Bar chart"), h("div", { class: "chart-palette", role: "img", "aria-label": "Bar chart using all eight chart color tokens" }, Array.from({ length: 8 }, (_, index) => h("div", { class: "chart-swatch", key: index }, [h("i", { style: { background: `var(--oria-color-chart-${index + 1})` } }), h("span", [`Chart ${index + 1}`, h("code", `color.chart.${index + 1}`)])])))]), h("section", { class: "chart-donut-panel" }, [h("h4", "Donut chart"), h("div", { class: "chart-donut", role: "img", "aria-label": "Donut chart using all eight chart color tokens" }, [h("span", [h("strong", "8"), h("small", "tokens")])])])])]),
    h("article", { class: "token-card typography-card" }, [heading("Typography system", "Font Families, Weight & Type Scale", "font.* / text.*"), h("div", { class: "typography-overview" }, [h("section", [h("h4", "Font families"), h("div", { class: "font-family-grid" }, fontFamilies.map(item => h("div", { class: "font-family-specimen", style: { fontFamily: item.value } }, [h("strong", "Ag"), labeledSample(item)])))]), h("section", [h("h4", "Font weights"), h("div", { class: "weight-scale" }, fontWeights.map(item => h("div", [h("strong", { style: { fontWeight: item.value } }, "Aa"), labeledSample(item)])))])]), h("section", { class: "type-size-section" }, [h("h4", "Type sizes"), h("div", { class: "font-size-scale", "aria-label": "Font size scale" }, fontSizes.map(item => h("div", [h("strong", { style: { fontSize: item.value } }, "Aa"), labeledSample(item)])))])]),
    h("article", { class: "token-card rhythm-card" }, [heading("Reading rhythm", "Line Height & Letter Spacing", "leading.* / tracking.*"), h("div", { class: "rhythm-columns" }, [h("section", [h("h4", "Line height"), h("div", { class: "line-height-list" }, lineHeights.map(item => h("div", [h("p", { style: { lineHeight: item.value } }, ["Theme rhythm keeps", h("br"), "two lines in step."]), h("code", item.label)])))]), h("section", [h("h4", "Letter spacing"), h("div", { class: "letter-spacing-list" }, letterSpacings.map(item => h("div", [h("strong", { style: { letterSpacing: item.value } }, "ORIA THEME"), h("code", item.label)])))])])]),
    h("article", { class: "token-card control-shape-card" }, [heading("Physical scale", "Controls & Radius", "control.* / radius"), h("div", { class: "control-size-list" }, controls.map(item => h("button", { type: "button", style: { minHeight: item.height, paddingInline: item.padding } }, [item.label, h("code", `control.height.${item.label.toLowerCase()}`)]))), h("div", { class: "radius-scale" }, radii.map(item => h("div", [h("i", { style: { borderRadius: item.value } }), labeledSample(item)])))]),
    h("article", { class: "token-card elevation-card" }, [heading("Layer hierarchy", "Elevation Shadows", "shadow.*"), h("div", { class: "shadow-scale" }, shadows.map(item => h("div", [h("i", { style: { boxShadow: item.value } }), labeledSample(item)])))]),
    h("article", { class: "token-card effects-card" }, [heading("Material depth", "Blur & Backdrop Blur", "blur.* / backdrop.blur.*"), h("div", { class: "effect-columns" }, [h("section", [h("h4", "Foreground blur"), h("div", { class: "blur-scale" }, blurs.map(item => h("div", [h("span", [h("i", { style: { filter: `blur(${item.value})` } })]), h("code", item.label)])))]), h("section", [h("h4", "Backdrop blur"), h("div", { class: "backdrop-scale" }, backdropBlurs.map(item => h("div", [h("span", [h("b", { "aria-hidden": "true" }, "Oria"), h("i", { style: { WebkitBackdropFilter: `blur(${item.value}) saturate(var(--oria-backdrop-saturate))`, backdropFilter: `blur(${item.value}) saturate(var(--oria-backdrop-saturate))` } })]), h("code", item.label)])))])])]),
    h("article", { class: "token-card material-card" }, [heading("Structured material", "Gradients & Surface Patterns", "gradient.* / pattern.surface"), h("div", { class: "material-preview-grid" }, [h("section", [h("h4", "Gradients"), h("div", { class: "gradient-list" }, gradients.map(item => h("div", [h("i", { style: { background: item.value } }), labeledSample(item)])))]), h("section", [h("h4", "Surface Patterns"), h("div", { class: "pattern-preview", role: "img", "aria-label": "Theme surface pattern layer preview" }, [h("div", { class: "pattern-preview-samples", "aria-hidden": "true" }, [h("i", { "data-pattern": "dot" }), h("i", { "data-pattern": "stripe" }), h("i", { "data-pattern": "grid" }), h("i", { "data-pattern": "noise" })]), h("span", "Optional ordered pattern layers: geometry and grain")])])])]),
    h("article", { class: "token-card motion-card" }, [heading("Time & feel", "Duration & Easing", "duration.* / ease.*"), h("section", [h("h4", "Animation speed"), h("div", { class: "motion-list" }, durations.map(item => h("div", [h("i", { style: { animationDuration: item.value } }), labeledSample(item)])))]), h("section", [h("h4", "Animation curve"), h("div", { class: "motion-list easing-list" }, easings.map(item => h("div", [h("div", { class: "easing-curve-preview", style: { "--sample-easing": item.value }, "aria-hidden": "true" }, [h("span", [h("i")])]), labeledSample(item)])))])]),
  ];
}

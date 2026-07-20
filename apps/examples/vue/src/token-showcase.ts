import { h, type VNode } from "vue";

type TokenSample = { readonly label: string; readonly token: string; readonly value: string };
type ColorPair = { readonly label: string; readonly background: string; readonly foreground: string; readonly tokens: string; readonly ring?: boolean };

const semanticColors: readonly ColorPair[] = [
  { label: "Primary", background: "var(--oria-color-primary)", foreground: "var(--oria-color-primaryForeground)", tokens: "color.primary · color.primaryForeground" },
  { label: "Secondary", background: "var(--oria-color-secondary)", foreground: "var(--oria-color-secondaryForeground)", tokens: "color.secondary · color.secondaryForeground" },
  { label: "Muted", background: "var(--oria-color-muted)", foreground: "var(--oria-color-mutedForeground)", tokens: "color.muted · color.mutedForeground" },
  { label: "Accent", background: "var(--oria-color-accent)", foreground: "var(--oria-color-accentForeground)", tokens: "color.accent · color.accentForeground" },
  { label: "Surface", background: "var(--oria-color-surfaceRaised)", foreground: "var(--oria-color-surfaceRaisedForeground)", tokens: "color.surfaceRaised · color.surfaceRaisedForeground" },
  { label: "Selection", background: "var(--oria-color-selection)", foreground: "var(--oria-color-selectionForeground)", tokens: "color.selection · color.selectionForeground" },
  { label: "Ring", background: "var(--oria-color-surfaceRaised)", foreground: "var(--oria-color-surfaceRaisedForeground)", tokens: "color.ring · color.surfaceRaisedForeground", ring: true },
];
const feedbackColors: readonly ColorPair[] = [
  { label: "Destructive", background: "var(--oria-color-destructive)", foreground: "var(--oria-color-destructiveForeground)", tokens: "color.destructive · color.destructiveForeground" },
  { label: "Success", background: "var(--oria-color-success)", foreground: "var(--oria-color-successForeground)", tokens: "color.success · color.successForeground" },
  { label: "Warning", background: "var(--oria-color-warning)", foreground: "var(--oria-color-warningForeground)", tokens: "color.warning · color.warningForeground" },
  { label: "Info", background: "var(--oria-color-info)", foreground: "var(--oria-color-infoForeground)", tokens: "color.info · color.infoForeground" },
];
const interactionColors = [
  { label: "Primary", foreground: "var(--oria-color-primaryForeground)", tokens: "color.primary · color.primaryHover · color.primaryActive", states: [["Base", "var(--oria-color-primary)"], ["Hover", "var(--oria-color-primaryHover)"], ["Active", "var(--oria-color-primaryActive)"]] },
  { label: "Secondary", foreground: "var(--oria-color-secondaryForeground)", tokens: "color.secondary · color.secondaryHover · color.secondaryActive", states: [["Base", "var(--oria-color-secondary)"], ["Hover", "var(--oria-color-secondaryHover)"], ["Active", "var(--oria-color-secondaryActive)"]] },
] as const;

const tokenSamples = (prefix: string, cssPrefix: string, keys: readonly string[]): readonly TokenSample[] => keys.map(key => ({
  label: key, token: `${prefix}.${key}`, value: `var(--oria-${cssPrefix}-${key})`,
}));

const fontFamilies: readonly TokenSample[] = [
  { label: "Sans", token: "typography.font.sans", value: "var(--oria-typography-font-sans)" },
  { label: "Serif", token: "typography.font.serif", value: "var(--oria-typography-font-serif)" },
  { label: "Mono", token: "typography.font.mono", value: "var(--oria-typography-font-mono)" },
  { label: "Display", token: "typography.font.display", value: "var(--oria-typography-font-display)" },
];
const fontWeights = tokenSamples("typography.weight", "typography-weight", ["thin", "extraLight", "light", "normal", "medium", "semibold", "bold", "extraBold", "black"]);
const fontSizes = tokenSamples("typography.size", "typography-size", ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl"]);
const lineHeights = tokenSamples("typography.lineHeight", "typography-lineHeight", ["tight", "snug", "normal", "relaxed", "loose"]);
const letterSpacings = tokenSamples("typography.letterSpacing", "typography-letterSpacing", ["tighter", "tight", "normal", "wide", "wider", "widest"]);
const controls = ["sm", "md", "lg"].map(key => ({ label: key.toUpperCase(), height: `var(--oria-control-height-${key})`, padding: `var(--oria-control-paddingInline-${key})` }));
const radii = tokenSamples("shape.radius", "shape-radius", ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "full"]);
const shadows = tokenSamples("elevation.shadow", "elevation-shadow", ["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "inner", "highlight"]);
const blurs = tokenSamples("effect.blur", "effect-blur", ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"]);
const backdropBlurs = tokenSamples("effect.backdropBlur", "effect-backdropBlur", ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"]);
const gradients: readonly TokenSample[] = [
  { label: "Background", token: "gradient.background", value: "var(--oria-gradient-background, linear-gradient(135deg, var(--oria-color-background), var(--oria-color-accent)))" },
  { label: "Surface", token: "gradient.surface", value: "var(--oria-gradient-surface, linear-gradient(135deg, var(--oria-color-surfaceRaised), var(--oria-color-secondary)))" },
  { label: "Accent", token: "gradient.accent", value: "var(--oria-gradient-accent, linear-gradient(135deg, var(--oria-color-primary), var(--oria-color-info)))" },
];
const durations = tokenSamples("motion.duration", "motion-duration", ["instant", "fast", "normal", "slow"]);
const easings = tokenSamples("motion.easing", "motion-easing", ["standard", "entrance", "exit", "emphasized"]);

const heading = (kicker: string, title: string, path: string): VNode => h("div", { class: "token-card-heading" }, [h("div", [h("p", { class: "card-kicker" }, kicker), h("h3", title)]), h("code", path)]);
const labeledSample = (item: TokenSample): VNode => h("span", [item.label, h("code", item.token)]);

export function renderThemeTokenShowcase(): VNode[] {
  return [
    h("article", { class: "token-card semantic-feedback-card" }, [heading("Applied meaning & system states", "Semantic & Feedback Color", "color.*"), h("div", { class: "color-showcase-columns" }, [h("section", [h("h4", "Semantic surfaces"), h("div", { class: "color-pair-grid" }, semanticColors.map(item => h("div", { class: `color-pair${item.ring ? " color-pair-ring" : ""}`, key: item.label }, [h("i", { style: { background: item.background, color: item.foreground } }, [h("b", "Aa")]), h("span", [item.label, h("code", item.tokens)])]))) ]), h("section", [h("h4", "Feedback states"), h("div", { class: "color-pair-grid" }, feedbackColors.map(item => h("div", { class: "color-pair", key: item.label }, [h("i", { style: { background: item.background, color: item.foreground } }, [h("b", "Aa")]), h("span", [item.label, h("code", item.tokens)])]))) ])]), h("section", { class: "interaction-section" }, [h("h4", "Interaction states"), h("div", { class: "interaction-grid" }, interactionColors.map(group => h("div", { class: "interaction-family", key: group.label }, [h("span", [group.label, h("code", group.tokens)]), h("div", group.states.map(([label, background]) => h("i", { key: label, style: { background, color: group.foreground } }, [h("b", label)]))) ])))])]),
    h("article", { class: "token-card chart-card" }, [heading("Data visualization", "Chart Color", "color.chart1–8"), h("div", { class: "chart-visuals" }, [h("section", [h("h4", "Bar chart"), h("div", { class: "chart-palette", role: "img", "aria-label": "Bar chart using all eight chart color tokens" }, Array.from({ length: 8 }, (_, index) => h("div", { class: "chart-swatch", key: index }, [h("i", { style: { background: `var(--oria-color-chart${index + 1})` } }), h("span", [`Chart ${index + 1}`, h("code", `color.chart${index + 1}`)])])))]), h("section", { class: "chart-donut-panel" }, [h("h4", "Donut chart"), h("div", { class: "chart-donut", role: "img", "aria-label": "Donut chart using all eight chart color tokens" }, [h("span", [h("strong", "8"), h("small", "tokens")])])])])]),
    h("article", { class: "token-card typography-card" }, [heading("Typography system", "Font Families, Weight & Type Scale", "typography.*"), h("div", { class: "typography-overview" }, [h("section", [h("h4", "Font families"), h("div", { class: "font-family-grid" }, fontFamilies.map(item => h("div", { class: "font-family-specimen", style: { fontFamily: item.value } }, [h("strong", "Ag"), labeledSample(item)])))]), h("section", [h("h4", "Font weights"), h("div", { class: "weight-scale" }, fontWeights.map(item => h("div", [h("strong", { style: { fontWeight: item.value } }, "Aa"), labeledSample(item)])))])]), h("section", { class: "type-size-section" }, [h("h4", "Type sizes"), h("div", { class: "font-size-scale", "aria-label": "Font size scale" }, fontSizes.map(item => h("div", [h("strong", { style: { fontSize: item.value } }, "Aa"), labeledSample(item)])))])]),
    h("article", { class: "token-card rhythm-card" }, [heading("Reading rhythm", "Line Height & Letter Spacing", "typography.lineHeight.* / letterSpacing.*"), h("div", { class: "rhythm-columns" }, [h("section", [h("h4", "Line height"), h("div", { class: "line-height-list" }, lineHeights.map(item => h("div", [h("p", { style: { lineHeight: item.value } }, ["Theme rhythm keeps", h("br"), "two lines in step."]), h("code", item.label)])))]), h("section", [h("h4", "Letter spacing"), h("div", { class: "letter-spacing-list" }, letterSpacings.map(item => h("div", [h("strong", { style: { letterSpacing: item.value } }, "ORIA THEME"), h("code", item.label)])))])])]),
    h("article", { class: "token-card control-shape-card" }, [heading("Physical scale", "Controls & Radius", "control.* / shape.radius.*"), h("div", { class: "control-size-list" }, controls.map(item => h("button", { type: "button", style: { minHeight: item.height, paddingInline: item.padding } }, [item.label, h("code", `control.height.${item.label.toLowerCase()}`)]))), h("div", { class: "radius-scale" }, radii.map(item => h("div", [h("i", { style: { borderRadius: item.value } }), labeledSample(item)])))]),
    h("article", { class: "token-card elevation-card" }, [heading("Layer hierarchy", "Elevation Shadows", "elevation.shadow.*"), h("div", { class: "shadow-scale" }, shadows.map(item => h("div", [h("i", { style: { boxShadow: item.value } }), labeledSample(item)])))]),
    h("article", { class: "token-card effects-card" }, [heading("Material depth", "Blur & Backdrop Blur", "effect.blur.* / backdropBlur.*"), h("div", { class: "effect-columns" }, [h("section", [h("h4", "Foreground blur"), h("div", { class: "blur-scale" }, blurs.map(item => h("div", [h("span", [h("i", { style: { filter: `blur(${item.value})` } })]), h("code", item.label)])))]), h("section", [h("h4", "Backdrop blur"), h("div", { class: "backdrop-scale" }, backdropBlurs.map(item => h("div", [h("span", [h("b", { "aria-hidden": "true" }, "Oria"), h("i", { style: { WebkitBackdropFilter: `blur(${item.value}) saturate(var(--oria-effect-backdropSaturation))`, backdropFilter: `blur(${item.value}) saturate(var(--oria-effect-backdropSaturation))` } })]), h("code", item.label)])))])])]),
    h("article", { class: "token-card gradient-card" }, [heading("Structured color", "Gradients", "gradient.*"), h("div", { class: "gradient-list" }, gradients.map(item => h("div", [h("i", { style: { background: item.value } }), labeledSample(item)])))]),
    h("article", { class: "token-card motion-card" }, [heading("Time & feel", "Duration & Easing", "motion.*"), h("section", [h("h4", "Animation speed"), h("div", { class: "motion-list" }, durations.map(item => h("div", [h("i", { style: { animationDuration: item.value } }), labeledSample(item)])))]), h("section", [h("h4", "Animation curve"), h("div", { class: "motion-list easing-list" }, easings.map(item => h("div", [h("div", { class: "easing-curve-preview", style: { "--sample-easing": item.value }, "aria-hidden": "true" }, [h("span", [h("i")])]), labeledSample(item)])))])]),
  ];
}

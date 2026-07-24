import type { CSSProperties, ReactElement } from "react";

// pattern.bg is applied to the shared page canvas; this gallery documents pattern.surface specimens.

type TokenSample = {
  readonly label: string;
  readonly token: string;
  readonly value: string;
};

type ColorPair = {
  readonly label: string;
  readonly background: string;
  readonly foreground: string;
  readonly tokens: string;
  readonly ring?: boolean;
};

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

const fontFamilies: readonly TokenSample[] = [
  { label: "Sans", token: "font.sans", value: "var(--oria-font-sans)" },
  { label: "Serif", token: "font.serif", value: "var(--oria-font-serif)" },
  { label: "Mono", token: "font.mono", value: "var(--oria-font-mono)" },
  { label: "Display", token: "font.display", value: "var(--oria-font-display)" },
];

const fontWeights: readonly TokenSample[] = [
  ["Thin", "thin"], ["Extra light", "extralight"], ["Light", "light"],
  ["Normal", "normal"], ["Medium", "medium"], ["Semibold", "semibold"],
  ["Bold", "bold"], ["Extra bold", "extrabold"], ["Black", "black"],
].map(([label, key]) => ({ label: label!, token: `font.weight.${key}`, value: `var(--oria-font-weight-${key})` }));

const fontSizes: readonly TokenSample[] = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl"].map(key => ({
  label: key.toUpperCase(), token: `text.${key}`, value: `var(--oria-text-${key})`,
}));

const lineHeights: readonly TokenSample[] = ["tight", "snug", "normal", "relaxed", "loose"].map(key => ({
  label: key, token: `leading.${key}`, value: `var(--oria-leading-${key})`,
}));

const letterSpacings: readonly TokenSample[] = ["tighter", "tight", "normal", "wide", "wider", "widest"].map(key => ({
  label: key, token: `tracking.${key}`, value: `var(--oria-tracking-${key})`,
}));

const controls = ["sm", "md", "lg"].map(key => ({
  label: key.toUpperCase(),
  height: `var(--oria-control-height-${key})`,
  padding: `var(--oria-control-padding-x-${key})`,
}));

const radii: readonly TokenSample[] = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"].map(key => ({
  label: key.toUpperCase(), token: `--oria-radius-${key}`, value: `var(--oria-radius-${key})`,
}));

const shadows: readonly TokenSample[] = ["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "inner", "highlight"].map(key => ({
  label: key, token: `shadow.${key}`, value: `var(--oria-shadow-${key})`,
}));

const blurs: readonly TokenSample[] = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"].map(key => ({
  label: key.toUpperCase(), token: `blur.${key}`, value: `var(--oria-blur-${key})`,
}));

const backdropBlurs: readonly TokenSample[] = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"].map(key => ({
  label: key.toUpperCase(), token: `backdrop.blur.${key}`, value: `var(--oria-backdrop-blur-${key})`,
}));

const gradients: readonly TokenSample[] = [
  { label: "Background", token: "gradient.bg", value: "var(--oria-gradient-bg, linear-gradient(135deg, var(--oria-color-bg), var(--oria-color-accent)))" },
  { label: "Surface", token: "gradient.surface", value: "var(--oria-gradient-surface, linear-gradient(135deg, var(--oria-color-surface-raised), var(--oria-color-secondary)))" },
  { label: "Accent", token: "gradient.accent", value: "var(--oria-gradient-accent, linear-gradient(135deg, var(--oria-color-primary), var(--oria-color-info)))" },
];

const durations: readonly TokenSample[] = ["instant", "fast", "normal", "slow"].map(key => ({
  label: key, token: `duration.${key}`, value: `var(--oria-duration-${key})`,
}));

const easings: readonly TokenSample[] = ["standard", "enter", "exit", "emphasized"].map(key => ({
  label: key, token: `ease.${key}`, value: `var(--oria-ease-${key})`,
}));

function CardHeading({ kicker, title, path }: { readonly kicker: string; readonly title: string; readonly path: string }): ReactElement {
  return <div className="token-card-heading"><div><p className="card-kicker">{kicker}</p><h3>{title}</h3></div><code>{path}</code></div>;
}

export function ThemeTokenShowcase(): ReactElement {
  return <>
    <article className="token-card semantic-feedback-card">
      <CardHeading kicker="Applied meaning & system states" title="Semantic & Feedback Color" path="color.*" />
      <div className="color-showcase-columns"><section><h4>Semantic surfaces</h4><div className="color-pair-grid">{semanticColors.map(item => <div className={`color-pair${item.ring ? " color-pair-ring" : ""}`} key={item.label}><i style={{ background: item.background, color: item.foreground }}><b>Aa</b></i><span>{item.label}<code>{item.tokens}</code></span></div>)}</div></section><section><h4>Feedback states</h4><div className="color-pair-grid">{feedbackColors.map(item => <div className="color-pair" key={item.label}><i style={{ background: item.background, color: item.foreground }}><b>Aa</b></i><span>{item.label}<code>{item.tokens}</code></span></div>)}</div></section></div>
      <section className="interaction-section"><h4>Interaction states</h4><div className="interaction-grid">{interactionColors.map(group => <div className="interaction-family" key={group.label}><span>{group.label}<code>{group.tokens}</code></span><div>{group.states.map(([label, background]) => <i key={label} style={{ background, color: group.foreground }}><b>{label}</b></i>)}</div></div>)}</div></section>
    </article>
    <article className="token-card chart-card">
      <CardHeading kicker="Data visualization" title="Chart Color" path="color.chart.1–8" />
      <div className="chart-visuals"><section><h4>Bar chart</h4><div className="chart-palette" role="img" aria-label="Bar chart using all eight chart color tokens">{Array.from({ length: 8 }, (_, index) => <div className="chart-swatch" key={index}><i style={{ background: `var(--oria-color-chart-${index + 1})` }} /><span>Chart {index + 1}<code>color.chart.{index + 1}</code></span></div>)}</div></section><section className="chart-donut-panel"><h4>Donut chart</h4><div className="chart-donut" role="img" aria-label="Donut chart using all eight chart color tokens"><span><strong>8</strong><small>tokens</small></span></div></section></div>
    </article>
    <article className="token-card typography-card">
      <CardHeading kicker="Typography system" title="Font Families, Weight & Type Scale" path="font.* / text.*" />
      <div className="typography-overview"><section><h4>Font families</h4><div className="font-family-grid">{fontFamilies.map(item => <div className="font-family-specimen" key={item.token} style={{ fontFamily: item.value }}><strong>Ag</strong><span>{item.label}<code>{item.token}</code></span></div>)}</div></section><section><h4>Font weights</h4><div className="weight-scale">{fontWeights.map(item => <div key={item.token}><strong style={{ fontWeight: item.value }}>Aa</strong><span>{item.label}<code>{item.token}</code></span></div>)}</div></section></div>
      <section className="type-size-section"><h4>Type sizes</h4><div className="font-size-scale" aria-label="Font size scale">{fontSizes.map(item => <div key={item.token}><strong style={{ fontSize: item.value }}>Aa</strong><span>{item.label}<code>{item.token}</code></span></div>)}</div></section>
    </article>
    <article className="token-card rhythm-card">
      <CardHeading kicker="Reading rhythm" title="Line Height & Letter Spacing" path="leading.* / tracking.*" />
      <div className="rhythm-columns"><section><h4>Line height</h4><div className="line-height-list">{lineHeights.map(item => <div key={item.token}><p style={{ lineHeight: item.value }}>Theme rhythm keeps<br />two lines in step.</p><code>{item.label}</code></div>)}</div></section><section><h4>Letter spacing</h4><div className="letter-spacing-list">{letterSpacings.map(item => <div key={item.token}><strong style={{ letterSpacing: item.value }}>ORIA THEME</strong><code>{item.label}</code></div>)}</div></section></div>
    </article>
    <article className="token-card control-shape-card">
      <CardHeading kicker="Physical scale" title="Controls & Radius" path="control.* / radius" />
      <div className="control-size-list">{controls.map(item => <button key={item.label} type="button" style={{ minHeight: item.height, paddingInline: item.padding }}>{item.label}<code>control.height.{item.label.toLowerCase()}</code></button>)}</div>
      <div className="radius-scale">{radii.map(item => <div key={item.token}><i style={{ borderRadius: item.value }} /><span>{item.label}<code>{item.token}</code></span></div>)}</div>
    </article>
    <article className="token-card elevation-card">
      <CardHeading kicker="Layer hierarchy" title="Elevation Shadows" path="shadow.*" />
      <div className="shadow-scale">{shadows.map(item => <div key={item.token}><i style={{ boxShadow: item.value }} /><span>{item.label}<code>{item.token}</code></span></div>)}</div>
    </article>
    <article className="token-card effects-card">
      <CardHeading kicker="Material depth" title="Blur & Backdrop Blur" path="blur.* / backdrop.blur.*" />
      <div className="effect-columns"><section><h4>Foreground blur</h4><div className="blur-scale">{blurs.map(item => <div key={item.token}><span><i style={{ filter: `blur(${item.value})` }} /></span><code>{item.label}</code></div>)}</div></section><section><h4>Backdrop blur</h4><div className="backdrop-scale">{backdropBlurs.map(item => <div key={item.token}><span><b aria-hidden="true">Oria</b><i style={{ WebkitBackdropFilter: `blur(${item.value}) saturate(var(--oria-backdrop-saturate))`, backdropFilter: `blur(${item.value}) saturate(var(--oria-backdrop-saturate))` } as CSSProperties} /></span><code>{item.label}</code></div>)}</div></section></div>
    </article>
    <article className="token-card material-card">
      <CardHeading kicker="Structured material" title="Gradients & Surface Patterns" path="gradient.* / pattern.surface" />
      <div className="material-preview-grid">
        <section><h4>Gradients</h4><div className="gradient-list">{gradients.map(item => <div key={item.token}><i style={{ background: item.value }} /><span>{item.label}<code>{item.token}</code></span></div>)}</div></section>
        <section><h4>Surface Patterns</h4><div className="pattern-preview" role="img" aria-label="Theme surface pattern layer preview"><div className="pattern-preview-samples" aria-hidden="true"><i data-pattern="dot" /><i data-pattern="stripe" /><i data-pattern="grid" /><i data-pattern="noise" /></div><span>Optional ordered pattern layers: geometry and grain</span></div></section>
      </div>
    </article>
    <article className="token-card motion-card">
      <CardHeading kicker="Time & feel" title="Duration & Easing" path="duration.* / ease.*" />
      <section><h4>Animation speed</h4><div className="motion-list">{durations.map(item => <div key={item.token}><i style={{ animationDuration: item.value }} /><span>{item.label}<code>{item.token}</code></span></div>)}</div></section>
      <section><h4>Animation curve</h4><div className="motion-list easing-list">{easings.map(item => <div key={item.token}><div className="easing-curve-preview" style={{ "--sample-easing": item.value } as CSSProperties} aria-hidden="true"><span><i /></span></div><span>{item.label}<code>{item.token}</code></span></div>)}</div></section>
    </article>
  </>;
}

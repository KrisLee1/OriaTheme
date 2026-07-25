"use client";

import type { CSSProperties, ReactElement } from "react";
import { interpolate, useEditorCopy } from "@/components/editor-page/editor-i18n";

type TokenSample = { readonly label: string; readonly token: string; readonly value: string };

const fontSizeKeys = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl"] as const;
const radiusKeys = ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "full"] as const;
const shadowKeys = ["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "inner", "highlight"] as const;
const blurKeys = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;
const gradientFallbacks = {
  bg: "linear-gradient(135deg, var(--oria-color-bg), var(--oria-color-accent))",
  surface: "linear-gradient(135deg, var(--oria-color-surface-raised), var(--oria-color-secondary))",
  accent: "linear-gradient(135deg, var(--oria-color-primary), var(--oria-color-info))",
} as const;

function radiusValue(key: (typeof radiusKeys)[number]): string {
  if (key === "none") return "0";
  if (key === "full") return "9999px";
  return `var(--oria-radius-${key})`;
}

function CardHeading({ kicker, title, path }: { readonly kicker: string; readonly title: string; readonly path: string }): ReactElement {
  return <div className="token-card-heading"><div><p className="card-kicker">{kicker}</p><h3>{title}</h3></div><code>{path}</code></div>;
}

export function ThemeTokenShowcase(): ReactElement {
  const copy = useEditorCopy().gallery.showcase;
  const semanticColors = [
    ["primary", "var(--oria-color-primary)", "var(--oria-color-primary-fg)", "color.primary · color.primary.fg"],
    ["secondary", "var(--oria-color-secondary)", "var(--oria-color-secondary-fg)", "color.secondary · color.secondary.fg"],
    ["muted", "var(--oria-color-muted)", "var(--oria-color-muted-fg)", "color.muted · color.muted.fg"],
    ["accent", "var(--oria-color-accent)", "var(--oria-color-accent-fg)", "color.accent · color.accent.fg"],
    ["surface", "var(--oria-color-surface-raised)", "var(--oria-color-surface-raised-fg)", "color.surface.raised · color.surface.raised.fg"],
    ["selection", "var(--oria-color-selection)", "var(--oria-color-selection-fg)", "color.selection · color.selection.fg"],
    ["ring", "var(--oria-color-surface-raised)", "var(--oria-color-surface-raised-fg)", "color.ring · color.surface.raised.fg"],
  ] as const;
  const feedbackColors = [
    ["destructive", "var(--oria-color-danger)", "var(--oria-color-danger-fg)", "color.danger · color.danger.fg"],
    ["success", "var(--oria-color-success)", "var(--oria-color-success-fg)", "color.success · color.success.fg"],
    ["warning", "var(--oria-color-warning)", "var(--oria-color-warning-fg)", "color.warning · color.warning.fg"],
    ["info", "var(--oria-color-info)", "var(--oria-color-info-fg)", "color.info · color.info.fg"],
  ] as const;
  const fontFamilies: readonly TokenSample[] = (["sans", "serif", "mono", "display"] as const).map(key => ({ label: copy.labels.fontFamilies[key], token: `font.${key}`, value: `var(--oria-font-${key})` }));
  const fontWeights: readonly TokenSample[] = (["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"] as const).map(key => ({ label: copy.labels.fontWeights[key], token: `font.weight.${key}`, value: `var(--oria-font-weight-${key})` }));
  const lineHeights: readonly TokenSample[] = (["tight", "snug", "normal", "relaxed", "loose"] as const).map(key => ({ label: copy.labels.lineHeights[key], token: `leading.${key}`, value: `var(--oria-leading-${key})` }));
  const letterSpacings: readonly TokenSample[] = (["tighter", "tight", "normal", "wide", "wider", "widest"] as const).map(key => ({ label: copy.labels.letterSpacings[key], token: `tracking.${key}`, value: `var(--oria-tracking-${key})` }));
  const gradients: readonly TokenSample[] = (["bg", "surface", "accent"] as const).map(key => ({ label: copy.labels.gradients[key], token: `gradient.${key}`, value: `var(--oria-gradient-${key}, ${gradientFallbacks[key]})` }));
  const durations: readonly TokenSample[] = (["instant", "fast", "normal", "slow"] as const).map(key => ({ label: copy.labels.durations[key], token: `duration.${key}`, value: `var(--oria-duration-${key})` }));
  const easings: readonly TokenSample[] = (["standard", "enter", "exit", "emphasized"] as const).map(key => ({ label: copy.labels.easings[key], token: `ease.${key}`, value: `var(--oria-ease-${key})` }));

  return <>
    <article className="token-card semantic-feedback-card"><CardHeading {...copy.cards.semantic} path="color.*" /><div className="color-showcase-columns"><section><h4>{copy.cards.semantic.semanticSurfaces}</h4><div className="color-pair-grid">{semanticColors.map(([key, background, foreground, tokens]) => <div className={`color-pair${key === "ring" ? " color-pair-ring" : ""}`} key={key}><i style={{ background, color: foreground }}><b>Aa</b></i><span>{copy.labels.semantic[key]}<code>{tokens}</code></span></div>)}</div></section><section><h4>{copy.cards.semantic.feedbackStates}</h4><div className="color-pair-grid">{feedbackColors.map(([key, background, foreground, tokens]) => <div className="color-pair" key={key}><i style={{ background, color: foreground }}><b>Aa</b></i><span>{copy.labels.feedback[key]}<code>{tokens}</code></span></div>)}</div></section></div><section className="interaction-section"><h4>{copy.cards.semantic.interactionStates}</h4><div className="interaction-grid">{(["primary", "secondary"] as const).map(key => <div className="interaction-family" key={key}><span>{copy.labels.semantic[key]}<code>{`color.${key} · color.${key}.hover · color.${key}.active`}</code></span><div>{(["base", "hover", "active"] as const).map(state => <i key={state} style={{ background: `var(--oria-color-${key}${state === "base" ? "" : `-${state}`})`, color: `var(--oria-color-${key}-fg)` }}><b>{copy.labels.interaction[state]}</b></i>)}</div></div>)}</div></section></article>
    <article className="token-card chart-card"><CardHeading {...copy.cards.chart} path="color.chart.1–8" /><div className="chart-visuals"><section><h4>{copy.cards.chart.barChart}</h4><div className="chart-palette" role="img" aria-label={copy.cards.chart.barAria}>{Array.from({ length: 8 }, (_, index) => <div className="chart-swatch" key={index}><i style={{ background: `var(--oria-color-chart-${index + 1})` }} /><span>{interpolate(copy.cards.chart.chartLabel, { index: index + 1 })}<code>color.chart.{index + 1}</code></span></div>)}</div></section><section className="chart-donut-panel"><h4>{copy.cards.chart.donutChart}</h4><div className="chart-donut" role="img" aria-label={copy.cards.chart.donutAria}><span><strong>8</strong><small>{copy.cards.chart.tokens}</small></span></div></section></div></article>
    <article className="token-card typography-card"><CardHeading {...copy.cards.typography} path="font.* / text.*" /><div className="typography-overview"><section><h4>{copy.cards.typography.fontFamilies}</h4><div className="font-family-grid">{fontFamilies.map(item => <div className="font-family-specimen" key={item.token} style={{ fontFamily: item.value }}><strong>Ag</strong><span>{item.label}<code>{item.token}</code></span></div>)}</div></section><section><h4>{copy.cards.typography.fontWeights}</h4><div className="weight-scale">{fontWeights.map(item => <div key={item.token}><strong style={{ fontWeight: item.value }}>Aa</strong><span>{item.label}<code>{item.token}</code></span></div>)}</div></section></div><section className="type-size-section"><h4>{copy.cards.typography.typeSizes}</h4><div className="font-size-scale" aria-label={copy.cards.typography.fontSizeScale}>{fontSizeKeys.map(key => <div key={key}><strong style={{ fontSize: `var(--oria-text-${key})` }}>{key.toUpperCase()}</strong><span>{key.toUpperCase()}<code>text.{key}</code></span></div>)}</div></section></article>
    <article className="token-card rhythm-card"><CardHeading {...copy.cards.rhythm} path="leading.* / tracking.*" /><div className="rhythm-columns"><section><h4>{copy.cards.rhythm.lineHeight}</h4><div className="line-height-list">{lineHeights.map(item => <div key={item.token}><p style={{ lineHeight: item.value }}>{copy.cards.rhythm.sample.split("\n").map(line => <span key={line}>{line}<br /></span>)}</p><code>{item.label}</code></div>)}</div></section><section><h4>{copy.cards.rhythm.letterSpacing}</h4><div className="letter-spacing-list">{letterSpacings.map(item => <div key={item.token}><strong style={{ letterSpacing: item.value }}>ORIA THEME</strong><code>{item.label}</code></div>)}</div></section></div></article>
    <article className="token-card control-shape-card"><CardHeading {...copy.cards.shape} path="control.* / radius.*" /><div className="control-size-list">{(["sm", "md", "lg"] as const).map(key => <button key={key} type="button" style={{ minHeight: `var(--oria-control-height-${key})`, paddingInline: `var(--oria-control-padding-x-${key})` }}>{key.toUpperCase()}<code>control.height.{key}</code></button>)}</div><div className="radius-scale">{radiusKeys.map(key => <div key={key}><i style={{ borderRadius: radiusValue(key) }} /><span>{key.toUpperCase()}<code>{key === "none" || key === "full" ? radiusValue(key) : `--oria-radius-${key}`}</code></span></div>)}</div></article>
    <article className="token-card elevation-card"><CardHeading {...copy.cards.elevation} path="shadow.*" /><div className="shadow-scale">{shadowKeys.map(key => <div key={key}><i style={{ boxShadow: `var(--oria-shadow-${key})` }} /><span>{key}<code>shadow.{key}</code></span></div>)}</div></article>
    <article className="token-card effects-card"><CardHeading {...copy.cards.effects} path="blur.* / backdrop.blur.*" /><div className="effect-columns"><section><h4>{copy.cards.effects.foregroundBlur}</h4><div className="blur-scale">{blurKeys.map(key => <div key={key}><span><i style={{ filter: `blur(var(--oria-blur-${key}))` }} /></span><code>{key.toUpperCase()}</code></div>)}</div></section><section><h4>{copy.cards.effects.backdropBlur}</h4><div className="backdrop-scale">{blurKeys.map(key => <div key={key}><span><b aria-hidden="true">Oria</b><i style={{ WebkitBackdropFilter: `blur(var(--oria-backdrop-blur-${key})) saturate(var(--oria-backdrop-saturate))`, backdropFilter: `blur(var(--oria-backdrop-blur-${key})) saturate(var(--oria-backdrop-saturate))` } as CSSProperties} /></span><code>{key.toUpperCase()}</code></div>)}</div></section></div></article>
    <article className="token-card material-card"><CardHeading {...copy.cards.material} path="gradient.* / pattern.surface" /><div className="material-preview-grid"><section><h4>{copy.cards.material.gradients}</h4><div className="gradient-list">{gradients.map(item => <div key={item.token}><i style={{ background: item.value }} /><span>{item.label}<code>{item.token}</code></span></div>)}</div></section><section><h4>{copy.cards.material.surfacePatterns}</h4><div className="pattern-preview" role="img" aria-label={copy.cards.material.patternAria}><div className="pattern-preview-samples" aria-hidden="true"><i data-pattern="dot" /><i data-pattern="stripe" /><i data-pattern="grid" /><i data-pattern="noise" /></div><span>{copy.cards.material.patternDescription}</span></div></section></div></article>
    <article className="token-card motion-card"><CardHeading {...copy.cards.motion} path="duration.* / ease.*" /><section><h4>{copy.cards.motion.animationSpeed}</h4><div className="motion-list">{durations.map(item => <div key={item.token}><i style={{ animationDuration: item.value }} /><span>{item.label}<code>{item.token}</code></span></div>)}</div></section><section><h4>{copy.cards.motion.animationCurve}</h4><div className="motion-list easing-list">{easings.map(item => <div key={item.token}><div className="easing-curve-preview" style={{ "--sample-easing": item.value } as CSSProperties} aria-hidden="true"><span><i /></span></div><span>{item.label}<code>{item.token}</code></span></div>)}</div></section></article>
  </>;
}

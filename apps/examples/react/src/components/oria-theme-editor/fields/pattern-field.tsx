import type { CSSProperties, ReactElement } from "react";
import type { PatternLayer, PatternLayers, ThemeTokenInput } from "@oriatheme/core";
import type { TokenFieldProps } from "../types";
import { useFieldBuffer } from "../hooks/use-field-buffer";
import { BaseColorPalette } from "./base-color-palette";
import { nativeColor, previewColor, safeColor } from "./color-utils";
import { EditorSelect } from "./editor-select";
import { FieldFrame, fieldId } from "./field-frame";

type PatternType = PatternLayer["type"];
type NoiseVariant = Extract<PatternLayer, { readonly type: "noise" }>["variant"];
const types: readonly PatternType[] = ["dot", "stripe", "grid", "noise"];
const labels: Readonly<Record<PatternType, string>> = { dot: "Dot", stripe: "Stripe", grid: "Grid", noise: "Noise" };
const noiseVariants: readonly NoiseVariant[] = ["paper", "film", "frosted"];
const noiseLabels: Readonly<Record<NoiseVariant, string>> = { paper: "Paper", film: "Film", frosted: "Frosted" };
const noiseProfiles: Readonly<Record<Exclude<NoiseVariant, "paper">, readonly [frequency: string, octaves: number, seed: number]>> = { film: ["0.92", 2, 29], frosted: ["0.38", 3, 41] };
const positiveDimension = (value: string): boolean => /^(?:\d+|\d*\.\d+)(?:px|rem|em|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/.test(value.trim()) && Number.parseFloat(value) > 0;
const validAngle = (value: number): boolean => Number.isFinite(value) && value >= 0 && value <= 360;
const validIntensity = (value: number): boolean => Number.isFinite(value) && value >= 0 && value <= 1;
const defaults = (type: PatternType): PatternLayer => type === "dot"
  ? { type, color: "#2a25201f", radius: "0.9px", spacing: "1rem", angle: 0 }
  : type === "stripe"
    ? { type, color: "#2a25201f", stripeWidth: "1px", spacing: "0.75rem", angle: 45 }
    : type === "grid"
      ? { type, color: "#2a25201f", lineWidth: "1px", spacing: "1rem", angle: 0 }
      : { type, color: "#2a25201f", variant: "paper", tileSize: "48px", intensity: 0.12 };

function patternLayers(value: ThemeTokenInput | undefined): PatternLayers | undefined {
  return Array.isArray(value) && value.length > 0 && value.every(layer => typeof layer === "object" && layer !== null && "type" in layer && types.includes(layer.type as PatternType)) ? value as PatternLayers : undefined;
}
function noisePreview(color: string, variant: NoiseVariant, tileSize: string, intensity: number): string {
  if (variant === "paper") {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><filter id="oria-paper-preview-base" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.18" numOctaves="2" seed="17" stitchTiles="stitch" result="noise"/><feColorMatrix in="noise" type="luminanceToAlpha" result="alpha"/><feFlood flood-color="${color}" result="tint"/><feComposite in="tint" in2="alpha" operator="in"/></filter></defs><g opacity="${intensity}"><rect width="96" height="96" filter="url(#oria-paper-preview-base)" opacity="0.18"/><g data-oria-paper="specks" fill="${color}" opacity="0.85"><circle cx="8.5" cy="11.75" r="0.78"/><circle cx="28" cy="7" r="0.45"/><circle cx="50.5" cy="21.5" r="0.9"/><ellipse cx="77" cy="14" rx="1.2" ry="0.45" transform="rotate(24 77 14)"/><circle cx="15" cy="48" r="0.38"/><ellipse cx="38" cy="43" rx="0.5" ry="1.1" transform="rotate(70 38 43)"/><circle cx="64" cy="52" r="0.65"/><circle cx="87" cy="40" r="0.36"/><ellipse cx="23" cy="76" rx="0.75" ry="0.32" transform="rotate(-32 23 76)"/><circle cx="56" cy="86" r="0.46"/><circle cx="80" cy="72" r="1"/></g><g data-oria-paper="fibers" fill="none" stroke="${color}" stroke-width="0.7" stroke-linecap="round" opacity="0.65"><path d="m8.5 29.5 6.5 2.1"/><path d="m34 64 3.2-4.8"/><path d="m68.5 31 7.5-1.8"/><path d="m5 89 4.2-4.1"/><path d="m47 9.2 2.5 5"/><path d="m83 92-4.6-3.4"/></g></g></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 0 / ${tileSize} ${tileSize} repeat`;
  }
  const [frequency, octaves, seed] = noiseProfiles[variant];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><filter id="oria-noise-preview" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="${octaves}" seed="${seed}" stitchTiles="stitch" result="noise"/><feColorMatrix in="noise" type="luminanceToAlpha" result="alpha"/><feFlood flood-color="${color}" result="tint"/><feComposite in="tint" in2="alpha" operator="in"/></filter><rect width="64" height="64" filter="url(#oria-noise-preview)" opacity="${intensity}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 0 / ${tileSize} ${tileSize} repeat`;
}
function previewLayer(layer: PatternLayer, color: string): string {
  if (layer.type === "dot") {
    if (layer.angle === undefined || layer.angle === 0) return `radial-gradient(circle at center, ${color} 0 ${layer.radius}, transparent ${layer.radius}) 0 0 / ${layer.spacing} ${layer.spacing} repeat`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><defs><pattern id="oria-dot-preview" width="${layer.spacing}" height="${layer.spacing}" patternUnits="userSpaceOnUse" patternTransform="rotate(${layer.angle})"><circle cx="0" cy="0" r="${layer.radius}" fill="${color}"/></pattern></defs><rect width="100%" height="100%" fill="url(#oria-dot-preview)"/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 0 / 256px 256px repeat`;
  }
  if (layer.type === "noise") return noisePreview(color, layer.variant, layer.tileSize, layer.intensity);
  if (layer.type === "stripe") return `repeating-linear-gradient(${layer.angle}deg, ${color} 0 ${layer.stripeWidth}, transparent ${layer.stripeWidth} ${layer.spacing})`;
  return `repeating-linear-gradient(${layer.angle}deg, ${color} 0 ${layer.lineWidth}, transparent ${layer.lineWidth} ${layer.spacing}), repeating-linear-gradient(${(layer.angle + 90) % 360}deg, ${color} 0 ${layer.lineWidth}, transparent ${layer.lineWidth} ${layer.spacing})`;
}
function preview(layers: PatternLayers): string { return layers.map(layer => previewLayer(layer, previewColor(layer.color))).join(", "); }
function layerColor(layer: PatternLayer): string { return typeof layer.color === "string" ? layer.color : `ref: ${layer.color.$ref}`; }
function layerSummary(layer: PatternLayer): string { return layer.type === "noise" ? `${noiseLabels[layer.variant]} grain · ${Math.round(layer.intensity * 100)}%` : `${labels[layer.type]} · ${layer.type === "dot" ? layer.angle ?? 0 : layer.angle}°`; }
function validLayer(layer: PatternLayer): boolean {
  const colorIsSafe = typeof layer.color !== "string" || safeColor(layer.color);
  if (layer.type === "noise") return colorIsSafe && positiveDimension(layer.tileSize) && validIntensity(layer.intensity);
  const width = layer.type === "dot" ? layer.radius : layer.type === "stripe" ? layer.stripeWidth : layer.lineWidth;
  return colorIsSafe && positiveDimension(layer.spacing) && positiveDimension(width) && (layer.type === "dot" ? layer.angle === undefined || validAngle(layer.angle) : validAngle(layer.angle));
}
function Icon({ kind }: { readonly kind: "up" | "down" | "delete" | "unset" }): ReactElement {
  return <svg viewBox="0 0 20 20" aria-hidden="true">{kind === "up" ? <path d="m5 11 5-5 5 5M10 6v9" /> : kind === "down" ? <path d="m5 9 5 5 5-5M10 14V5" /> : kind === "delete" ? <path d="M4 6h12M8 3.5h4M6.5 6l.6 10h5.8l.6-10M8.5 8.5v5M11.5 8.5v5" /> : <><circle cx="10" cy="10" r="6.5" /><path d="m6.5 13.5 7-7" /></>}</svg>;
}
function patternNumber(text: string, valid: (value: number) => boolean): number | undefined {
  const trimmed = text.trim();
  if (!trimmed || !/\d$/.test(trimmed)) return undefined;
  const next = Number(trimmed);
  return Number.isFinite(next) && valid(next) ? next : undefined;
}
function DimensionParam({ label, ariaLabel, value, onCommit }: { readonly label: string; readonly ariaLabel: string; readonly value: string; readonly onCommit: (next: string) => void }): ReactElement {
  const buffer = useFieldBuffer(value, item => item, item => positiveDimension(item) ? item : undefined, onCommit);
  return <label><span>{label}</span><input value={buffer.text} aria-label={ariaLabel} aria-invalid={!positiveDimension(buffer.text) || undefined} inputMode="decimal" spellCheck={false} onChange={event => buffer.setText(event.target.value)} /></label>;
}
function NumberParam({ label, ariaLabel, value, minimum, maximum, step, valid, onCommit }: { readonly label: string; readonly ariaLabel: string; readonly value: number; readonly minimum: number; readonly maximum: number; readonly step: number; readonly valid: (value: number) => boolean; readonly onCommit: (next: number) => void }): ReactElement {
  const buffer = useFieldBuffer(value, item => String(item), item => patternNumber(item, valid), onCommit);
  return <label><span>{label}</span><input type="number" min={minimum} max={maximum} step={step} value={buffer.text} aria-label={ariaLabel} aria-invalid={patternNumber(buffer.text, valid) === undefined || undefined} onChange={event => buffer.setText(event.target.value)} /></label>;
}
function PatternLayerEditor({ id, layer, index, count, onChange, onMove, onDelete }: {
  readonly id: string;
  readonly layer: PatternLayer;
  readonly index: number;
  readonly count: number;
  readonly onChange: (layer: PatternLayer) => void;
  readonly onMove: (direction: -1 | 1) => void;
  readonly onDelete: () => void;
}): ReactElement {
  const color = layerColor(layer);
  const commit = (next: PatternLayer): void => { if (validLayer(next)) onChange(next); };
  const setColor = (next: string): void => commit({ ...layer, color: next });
  const colorBuffer = useFieldBuffer(color, item => item, item => safeColor(item) ? item : undefined, setColor);
  const changeType = (next: PatternType): void => onChange({ ...defaults(next), ...(safeColor(color) ? { color } : {}) });

  return <fieldset data-oria-editor-pattern-layer>
    <legend className="oria-editor-visually-hidden">Pattern layer {index + 1}</legend>
    <header>
      <span><strong>Layer {index + 1}</strong><small>{layerSummary(layer)}</small></span>
      <label data-oria-editor-pattern-type><span className="oria-editor-visually-hidden">Layer {index + 1} type</span><EditorSelect aria-label={`Pattern layer ${index + 1} type`} value={layer.type} onChange={event => changeType(event.target.value as PatternType)}>{types.map(type => <option key={type} value={type}>{labels[type]}</option>)}</EditorSelect></label>
      <div data-oria-editor-pattern-layer-actions>
        <button type="button" aria-label={`Move pattern layer ${index + 1} up`} title="Move layer up" disabled={index === 0} onClick={() => onMove(-1)}><Icon kind="up" /></button>
        <button type="button" aria-label={`Move pattern layer ${index + 1} down`} title="Move layer down" disabled={index === count - 1} onClick={() => onMove(1)}><Icon kind="down" /></button>
        <button type="button" aria-label={`Delete pattern layer ${index + 1}`} title="Delete layer" onClick={onDelete}><Icon kind="delete" /></button>
      </div>
    </header>
    <div data-oria-editor-pattern-layer-fields>
      <div data-oria-editor-color>
        <button type="button" data-oria-editor-color-swatch aria-label={`Choose pattern layer ${index + 1} color`} style={{ "--oria-editor-color-preview": previewColor(colorBuffer.text) } as CSSProperties}><input tabIndex={-1} type="color" value={nativeColor(colorBuffer.text)} onChange={event => colorBuffer.setText(event.target.value)} /></button>
        <input value={colorBuffer.text} aria-label={`Pattern layer ${index + 1} color`} aria-invalid={!safeColor(colorBuffer.text) || undefined} onChange={event => colorBuffer.setText(event.target.value)} spellCheck={false} />
        <BaseColorPalette id={`${id}-layer-${index}-base-colors`} label={`pattern layer ${index + 1} color`} value={colorBuffer.text} onSelect={colorBuffer.setText} />
      </div>
      {layer.type === "noise" ? <>
        <label><span>Style</span><EditorSelect aria-label={`Pattern layer ${index + 1} noise style`} value={layer.variant} onChange={event => commit({ ...layer, variant: event.target.value as NoiseVariant })}>{noiseVariants.map(variant => <option key={variant} value={variant}>{noiseLabels[variant]}</option>)}</EditorSelect></label>
        <DimensionParam label="Grain size" ariaLabel={`Pattern layer ${index + 1} grain size`} value={layer.tileSize} onCommit={next => commit({ ...layer, tileSize: next })} />
        <NumberParam label="Intensity" ariaLabel={`Pattern layer ${index + 1} grain intensity`} value={layer.intensity} minimum={0} maximum={1} step={0.01} valid={validIntensity} onCommit={next => commit({ ...layer, intensity: next })} />
      </> : <>
        <DimensionParam label={layer.type === "dot" ? "Radius" : layer.type === "stripe" ? "Stripe width" : "Line width"} ariaLabel={`Pattern layer ${index + 1} width`} value={layer.type === "dot" ? layer.radius : layer.type === "stripe" ? layer.stripeWidth : layer.lineWidth} onCommit={next => commit(layer.type === "dot" ? { ...layer, radius: next } : layer.type === "stripe" ? { ...layer, stripeWidth: next } : { ...layer, lineWidth: next })} />
        <DimensionParam label="Spacing" ariaLabel={`Pattern layer ${index + 1} spacing`} value={layer.spacing} onCommit={next => commit({ ...layer, spacing: next })} />
        <NumberParam label="Angle" ariaLabel={`Pattern layer ${index + 1} angle`} value={layer.type === "dot" ? layer.angle ?? 0 : layer.angle} minimum={0} maximum={360} step={1} valid={validAngle} onCommit={next => commit({ ...layer, angle: next })} />
      </>}
    </div>
  </fieldset>;
}

export function PatternField(props: TokenFieldProps): ReactElement {
  const layers = patternLayers(props.value);
  const id = fieldId(props);
  const patternName = `${props.field.label} pattern`;
  const commit = (next: readonly PatternLayer[]): void => { if (next.length === 0) props.session.removeToken(props.mode, props.field.path); else props.session.setToken(props.mode, props.field.path, next); };
  if (!layers) return <FieldFrame props={props}><div data-oria-editor-pattern data-empty><div data-oria-editor-pattern-preview style={{ background: preview([defaults("dot")]) }}><span>{patternName} not set</span></div><button type="button" data-oria-editor-pattern-create onClick={() => commit([defaults("dot")])}>Create {patternName.toLowerCase()}</button></div></FieldFrame>;
  const update = (index: number, next: PatternLayer): void => commit(layers.map((layer, current) => current === index ? next : layer));
  const move = (index: number, direction: -1 | 1): void => { const target = index + direction; if (target < 0 || target >= layers.length) return; const next = [...layers]; [next[index], next[target]] = [next[target]!, next[index]!]; commit(next); };
  return <FieldFrame props={props}><div data-oria-editor-pattern>
    <div data-oria-editor-pattern-preview style={{ background: preview(layers) }} role="img" aria-label={`${layers.length} ${patternName.toLowerCase()} layers preview`}><span>{layers.length} {layers.length === 1 ? "layer" : "layers"} · first is on top</span></div>
    <div data-oria-editor-pattern-layers>{layers.map((layer, index) => <PatternLayerEditor key={index} id={id} layer={layer} index={index} count={layers.length} onChange={next => update(index, next)} onMove={direction => move(index, direction)} onDelete={() => commit(layers.filter((_, current) => current !== index))} />)}</div>
    <div data-oria-editor-pattern-footer><label data-oria-editor-pattern-add><span>Add layer</span><EditorSelect aria-label="Add a pattern layer" value="" disabled={layers.length >= 8} onChange={event => { const type = event.target.value as PatternType; if (types.includes(type)) commit([...layers, defaults(type)]); }}><option value="">{layers.length >= 8 ? "Maximum 8 layers" : "Choose a pattern"}</option>{types.map(type => <option key={type} value={type}>{labels[type]}</option>)}</EditorSelect></label><button type="button" data-oria-editor-pattern-unset aria-label={`Unset ${props.field.label}`} title={`Unset ${patternName.toLowerCase()}`} onClick={() => props.session.removeToken(props.mode, props.field.path)}><Icon kind="unset" />Unset</button></div>
  </div></FieldFrame>;
}

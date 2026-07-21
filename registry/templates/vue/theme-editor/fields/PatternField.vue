<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { PatternLayer, PatternLayers, ThemeTokenInput } from "@oriatheme/core";
import type { TokenFieldProps } from "../types";
import BaseColorPalette from "./BaseColorPalette.vue";
import { nativeColor, previewColor, safeColor } from "./color-utils";
import EditorSelect from "./EditorSelect.vue";
import FieldFrame from "./FieldFrame.vue";

type PatternType = PatternLayer["type"];
type NoiseVariant = Extract<PatternLayer, { readonly type: "noise" }>["variant"];
const props = defineProps<TokenFieldProps>();
const types: readonly PatternType[] = ["dot", "stripe", "grid", "noise"];
const labels: Readonly<Record<PatternType, string>> = { dot: "Dot", stripe: "Stripe", grid: "Grid", noise: "Noise" };
const noiseVariants: readonly NoiseVariant[] = ["paper", "film", "frosted"];
const noiseLabels: Readonly<Record<NoiseVariant, string>> = { paper: "Paper", film: "Film", frosted: "Frosted" };
const noiseProfiles: Readonly<Record<Exclude<NoiseVariant, "paper">, readonly [string, number, number]>> = { film: ["0.92", 2, 29], frosted: ["0.38", 3, 41] };
const positiveDimension = (value: string): boolean => /^(?:\d+|\d*\.\d+)(?:px|rem|em|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/.test(value.trim()) && Number.parseFloat(value) > 0;
const validAngle = (value: number): boolean => Number.isFinite(value) && value >= 0 && value <= 360;
const validIntensity = (value: number): boolean => Number.isFinite(value) && value >= 0 && value <= 1;
const patternNumber = (text: string, valid: (value: number) => boolean): number | undefined => {
  const trimmed = text.trim();
  if (!trimmed || !/\d$/.test(trimmed)) return undefined;
  const next = Number(trimmed);
  return Number.isFinite(next) && valid(next) ? next : undefined;
};
const defaults = (type: PatternType): PatternLayer => type === "dot" ? { type, color: "#2a25201f", radius: "0.9px", spacing: "1rem", angle: 0 } : type === "stripe" ? { type, color: "#2a25201f", stripeWidth: "1px", spacing: "0.75rem", angle: 45 } : type === "grid" ? { type, color: "#2a25201f", lineWidth: "1px", spacing: "1rem", angle: 0 } : { type, color: "#2a25201f", variant: "paper", tileSize: "48px", intensity: 0.12 };
const patternLayers = (value: ThemeTokenInput | undefined): PatternLayers | undefined => Array.isArray(value) && value.length > 0 && value.every(layer => typeof layer === "object" && layer !== null && "type" in layer && types.includes(layer.type as PatternType)) ? value as PatternLayers : undefined;
const layers = computed(() => patternLayers(props.value));
const id = computed(() => `oria-${props.mode}-${props.field.path.replaceAll(".", "-")}`);
const layerColor = (layer: PatternLayer): string => typeof layer.color === "string" ? layer.color : `ref: ${layer.color.$ref}`;
const layerWidth = (layer: PatternLayer): string => layer.type === "noise" ? "" : layer.type === "dot" ? layer.radius : layer.type === "stripe" ? layer.stripeWidth : layer.lineWidth;
const layerAngle = (layer: PatternLayer): number => layer.type === "noise" ? 0 : layer.type === "dot" ? layer.angle ?? 0 : layer.angle;
const layerParams = (layer: PatternLayer): string[] => layer.type === "noise" ? ["", "", "", layer.tileSize, String(layer.intensity)] : [layerWidth(layer), layer.spacing, String(layerAngle(layer)), "", ""];
const colorBuffers = ref<string[]>([]);
const committedColors = ref<string[]>([]);
const paramBuffers = ref<string[][]>([]);
const committedParams = ref<string[][]>([]);
watch(layers, next => {
  const colors = next?.map(layerColor) ?? [];
  colors.forEach((color, index) => {
    if (committedColors.value[index] !== color) colorBuffers.value[index] = color;
  });
  colorBuffers.value.length = colors.length;
  committedColors.value = colors;
  const params = next?.map(layerParams) ?? [];
  params.forEach((values, index) => {
    const committed = committedParams.value[index];
    values.forEach((value, slot) => {
      if (committed?.[slot] !== value) (paramBuffers.value[index] ??= ["", "", "", "", ""])[slot] = value;
    });
  });
  paramBuffers.value.length = params.length;
  committedParams.value = params;
}, { immediate: true });
const colorBuffer = (index: number, layer: PatternLayer): string => colorBuffers.value[index] ?? layerColor(layer);
const paramBuffer = (index: number, slot: number, fallback: string): string => paramBuffers.value[index]?.[slot] ?? fallback;
const validLayer = (layer: PatternLayer): boolean => {
  if (layer.type === "noise") return (typeof layer.color !== "string" || safeColor(layer.color)) && positiveDimension(layer.tileSize) && validIntensity(layer.intensity);
  const width = layer.type === "dot" ? layer.radius : layer.type === "stripe" ? layer.stripeWidth : layer.lineWidth;
  return (typeof layer.color !== "string" || safeColor(layer.color)) && positiveDimension(layer.spacing) && positiveDimension(width) && (layer.type === "dot" ? layer.angle === undefined || validAngle(layer.angle) : validAngle(layer.angle));
};
const noisePreview = (color: string, variant: NoiseVariant, tileSize: string, intensity: number): string => {
  if (variant === "paper") {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><filter id="oria-paper-preview-base" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.18" numOctaves="2" seed="17" stitchTiles="stitch" result="noise"/><feColorMatrix in="noise" type="luminanceToAlpha" result="alpha"/><feFlood flood-color="${color}" result="tint"/><feComposite in="tint" in2="alpha" operator="in"/></filter></defs><g opacity="${intensity}"><rect width="96" height="96" filter="url(#oria-paper-preview-base)" opacity="0.18"/><g data-oria-paper="specks" fill="${color}" opacity="0.85"><circle cx="8.5" cy="11.75" r="0.78"/><circle cx="28" cy="7" r="0.45"/><circle cx="50.5" cy="21.5" r="0.9"/><ellipse cx="77" cy="14" rx="1.2" ry="0.45" transform="rotate(24 77 14)"/><circle cx="15" cy="48" r="0.38"/><ellipse cx="38" cy="43" rx="0.5" ry="1.1" transform="rotate(70 38 43)"/><circle cx="64" cy="52" r="0.65"/><circle cx="87" cy="40" r="0.36"/><ellipse cx="23" cy="76" rx="0.75" ry="0.32" transform="rotate(-32 23 76)"/><circle cx="56" cy="86" r="0.46"/><circle cx="80" cy="72" r="1"/></g><g data-oria-paper="fibers" fill="none" stroke="${color}" stroke-width="0.7" stroke-linecap="round" opacity="0.65"><path d="m8.5 29.5 6.5 2.1"/><path d="m34 64 3.2-4.8"/><path d="m68.5 31 7.5-1.8"/><path d="m5 89 4.2-4.1"/><path d="m47 9.2 2.5 5"/><path d="m83 92-4.6-3.4"/></g></g></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 0 / ${tileSize} ${tileSize} repeat`;
  }
  const [frequency, octaves, seed] = noiseProfiles[variant];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><filter id="oria-noise-preview" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="${octaves}" seed="${seed}" stitchTiles="stitch" result="noise"/><feColorMatrix in="noise" type="luminanceToAlpha" result="alpha"/><feFlood flood-color="${color}" result="tint"/><feComposite in="tint" in2="alpha" operator="in"/></filter><rect width="64" height="64" filter="url(#oria-noise-preview)" opacity="${intensity}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 0 / ${tileSize} ${tileSize} repeat`;
};
const previewLayer = (layer: PatternLayer, color: string): string => {
  if (layer.type === "dot") { if (layer.angle === undefined || layer.angle === 0) return `radial-gradient(circle at center, ${color} 0 ${layer.radius}, transparent ${layer.radius}) 0 0 / ${layer.spacing} ${layer.spacing} repeat`; const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><defs><pattern id="oria-dot-preview" width="${layer.spacing}" height="${layer.spacing}" patternUnits="userSpaceOnUse" patternTransform="rotate(${layer.angle})"><circle cx="0" cy="0" r="${layer.radius}" fill="${color}"/></pattern></defs><rect width="100%" height="100%" fill="url(#oria-dot-preview)"/></svg>`; return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 0 / 256px 256px repeat`; }
  if (layer.type === "noise") return noisePreview(color, layer.variant, layer.tileSize, layer.intensity);
  if (layer.type === "stripe") return `repeating-linear-gradient(${layer.angle}deg, ${color} 0 ${layer.stripeWidth}, transparent ${layer.stripeWidth} ${layer.spacing})`;
  return `repeating-linear-gradient(${layer.angle}deg, ${color} 0 ${layer.lineWidth}, transparent ${layer.lineWidth} ${layer.spacing}), repeating-linear-gradient(${(layer.angle + 90) % 360}deg, ${color} 0 ${layer.lineWidth}, transparent ${layer.lineWidth} ${layer.spacing})`;
};
const preview = (value: PatternLayers): string => value.map(layer => previewLayer(layer, previewColor(layer.color))).join(", ");
const layerSummary = (layer: PatternLayer): string => layer.type === "noise" ? `${noiseLabels[layer.variant]} grain · ${Math.round(layer.intensity * 100)}%` : `${labels[layer.type]} · ${layer.type === "dot" ? layer.angle ?? 0 : layer.angle}°`;
const commit = (next: readonly PatternLayer[]): void => { if (next.length === 0) props.session.removeToken(props.mode, props.field.path); else props.session.setToken(props.mode, props.field.path, next); };
const update = (index: number, next: PatternLayer): void => { if (layers.value) commit(layers.value.map((layer, current) => current === index ? next : layer)); };
const setColor = (index: number, color: string): void => { const layer = layers.value?.[index]; if (layer && validLayer({ ...layer, color })) update(index, { ...layer, color }); };
const updateColorBuffer = (index: number, color: string): void => { colorBuffers.value[index] = color; if (safeColor(color)) setColor(index, color); };
const updateWidthBuffer = (index: number, layer: PatternLayer, text: string): void => { (paramBuffers.value[index] ??= ["", "", "", "", ""])[0] = text; if (layer.type !== "noise" && positiveDimension(text)) updateGeometry(index, layer.type === "dot" ? { radius: text } : layer.type === "stripe" ? { stripeWidth: text } : { lineWidth: text }); };
const updateSpacingBuffer = (index: number, text: string): void => { (paramBuffers.value[index] ??= ["", "", "", "", ""])[1] = text; if (positiveDimension(text)) updateGeometry(index, { spacing: text }); };
const updateAngleBuffer = (index: number, text: string): void => { (paramBuffers.value[index] ??= ["", "", "", "", ""])[2] = text; const angle = patternNumber(text, validAngle); if (angle !== undefined) updateGeometry(index, { angle }); };
const updateTileSizeBuffer = (index: number, text: string): void => { (paramBuffers.value[index] ??= ["", "", "", "", ""])[3] = text; if (positiveDimension(text)) updateNoise(index, { tileSize: text }); };
const updateIntensityBuffer = (index: number, text: string): void => { (paramBuffers.value[index] ??= ["", "", "", "", ""])[4] = text; const intensity = patternNumber(text, validIntensity); if (intensity !== undefined) updateNoise(index, { intensity }); };
const updateNoise = (index: number, patch: Partial<Extract<PatternLayer, { readonly type: "noise" }>>): void => { const layer = layers.value?.[index]; if (layer?.type !== "noise") return; const next = { ...layer, ...patch }; if (validLayer(next)) update(index, next); };
const updateGeometry = (index: number, patch: Record<string, string | number>): void => { const layer = layers.value?.[index]; if (!layer || layer.type === "noise") return; const next = { ...layer, ...patch } as PatternLayer; if (validLayer(next)) update(index, next); };
const changeType = (index: number, type: PatternType): void => { const color = layers.value?.[index] && layerColor(layers.value[index]!); update(index, { ...defaults(type), ...(color && safeColor(color) ? { color } : {}) }); };
const move = (index: number, direction: -1 | 1): void => { const current = layers.value; const target = index + direction; if (!current || target < 0 || target >= current.length) return; const next = [...current]; [next[index], next[target]] = [next[target]!, next[index]!]; commit(next); };
</script>

<template><FieldFrame v-bind="props"><div v-if="!layers" data-oria-editor-pattern data-empty><div data-oria-editor-pattern-preview :style="{ background: preview([defaults('dot')]) }"><span>Surface pattern not set</span></div><button type="button" data-oria-editor-pattern-create @click="commit([defaults('dot')])">Create surface pattern</button></div><div v-else data-oria-editor-pattern><div data-oria-editor-pattern-preview :style="{ background: preview(layers) }" role="img" :aria-label="`${layers.length} surface pattern layers preview`"><span>{{ layers.length }} {{ layers.length === 1 ? "layer" : "layers" }} · first is on top</span></div><div data-oria-editor-pattern-layers><fieldset v-for="(layer,index) in layers" :key="index" data-oria-editor-pattern-layer><legend class="oria-editor-visually-hidden">Pattern layer {{ index + 1 }}</legend><header><span><strong>Layer {{ index + 1 }}</strong><small>{{ layerSummary(layer) }}</small></span><label data-oria-editor-pattern-type><span class="oria-editor-visually-hidden">Layer {{ index + 1 }} type</span><EditorSelect :aria-label="`Pattern layer ${index + 1} type`" :model-value="layer.type" @update:model-value="changeType(index,$event as PatternType)"><option v-for="type in types" :key="type" :value="type">{{ labels[type] }}</option></EditorSelect></label><div data-oria-editor-pattern-layer-actions><button type="button" :aria-label="`Move pattern layer ${index + 1} up`" title="Move layer up" :disabled="index === 0" @click="move(index,-1)"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 11 5-5 5 5M10 6v9" /></svg></button><button type="button" :aria-label="`Move pattern layer ${index + 1} down`" title="Move layer down" :disabled="index === layers.length - 1" @click="move(index,1)"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 9 5 5 5-5M10 14V5" /></svg></button><button type="button" :aria-label="`Delete pattern layer ${index + 1}`" title="Delete layer" @click="commit(layers.filter((_,current) => current !== index))"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12M8 3.5h4M6.5 6l.6 10h5.8l.6-10M8.5 8.5v5M11.5 8.5v5" /></svg></button></div></header><div data-oria-editor-pattern-layer-fields><div data-oria-editor-color><button type="button" data-oria-editor-color-swatch :aria-label="`Choose pattern layer ${index + 1} color`" :style="{ '--oria-editor-color-preview': previewColor(colorBuffer(index,layer)) }"><input tabindex="-1" type="color" :value="nativeColor(colorBuffer(index,layer))" @input="updateColorBuffer(index,($event.target as HTMLInputElement).value)" /></button><input :value="colorBuffer(index,layer)" :aria-label="`Pattern layer ${index + 1} color`" :aria-invalid="!safeColor(colorBuffer(index,layer)) || undefined" spellcheck="false" @input="updateColorBuffer(index,($event.target as HTMLInputElement).value)" /><BaseColorPalette :id="`${id}-layer-${index}-base-colors`" :label="`pattern layer ${index + 1} color`" :value="colorBuffer(index,layer)" @select="color => updateColorBuffer(index,color)" /></div><template v-if="layer.type === 'noise'"><label><span>Style</span><EditorSelect :aria-label="`Pattern layer ${index + 1} noise style`" :model-value="layer.variant" @update:model-value="updateNoise(index,{ variant: $event as NoiseVariant })"><option v-for="variant in noiseVariants" :key="variant" :value="variant">{{ noiseLabels[variant] }}</option></EditorSelect></label><label><span>Grain size</span><input :value="paramBuffer(index,3,layer.tileSize)" :aria-label="`Pattern layer ${index + 1} grain size`" :aria-invalid="!positiveDimension(paramBuffer(index,3,layer.tileSize)) || undefined" inputmode="decimal" spellcheck="false" @input="updateTileSizeBuffer(index,($event.target as HTMLInputElement).value)" /></label><label><span>Intensity</span><input type="number" min="0" max="1" step="0.01" :value="paramBuffer(index,4,String(layer.intensity))" :aria-label="`Pattern layer ${index + 1} grain intensity`" :aria-invalid="patternNumber(paramBuffer(index,4,String(layer.intensity)),validIntensity) === undefined || undefined" @input="updateIntensityBuffer(index,($event.target as HTMLInputElement).value)" /></label></template><template v-else><label><span>{{ layer.type === 'dot' ? 'Radius' : layer.type === 'stripe' ? 'Stripe width' : 'Line width' }}</span><input :value="paramBuffer(index,0,layerWidth(layer))" :aria-label="`Pattern layer ${index + 1} width`" :aria-invalid="!positiveDimension(paramBuffer(index,0,layerWidth(layer))) || undefined" inputmode="decimal" spellcheck="false" @input="updateWidthBuffer(index,layer,($event.target as HTMLInputElement).value)" /></label><label><span>Spacing</span><input :value="paramBuffer(index,1,layer.spacing)" :aria-label="`Pattern layer ${index + 1} spacing`" :aria-invalid="!positiveDimension(paramBuffer(index,1,layer.spacing)) || undefined" inputmode="decimal" spellcheck="false" @input="updateSpacingBuffer(index,($event.target as HTMLInputElement).value)" /></label><label><span>Angle</span><input type="number" min="0" max="360" step="1" :value="paramBuffer(index,2,String(layerAngle(layer)))" :aria-label="`Pattern layer ${index + 1} angle`" :aria-invalid="patternNumber(paramBuffer(index,2,String(layerAngle(layer))),validAngle) === undefined || undefined" @input="updateAngleBuffer(index,($event.target as HTMLInputElement).value)" /></label></template></div></fieldset></div><div data-oria-editor-pattern-footer><label data-oria-editor-pattern-add><span>Add layer</span><EditorSelect aria-label="Add a pattern layer" model-value="" :disabled="layers.length >= 8" @update:model-value="types.includes($event as PatternType) && commit([...layers,defaults($event as PatternType)])"><option value="">{{ layers.length >= 8 ? "Maximum 8 layers" : "Choose a pattern" }}</option><option v-for="type in types" :key="type" :value="type">{{ labels[type] }}</option></EditorSelect></label><button type="button" data-oria-editor-pattern-unset :aria-label="`Unset ${field.label}`" title="Unset surface pattern" @click="session.removeToken(mode,field.path)"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6.5" /><path d="m6.5 13.5 7-7" /></svg>Unset</button></div></div></FieldFrame></template>

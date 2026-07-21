<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { GradientDefinition, GradientPosition, GradientStop, ThemeTokenInput } from "@oriatheme/core";
import type { TokenFieldProps } from "../types";
import BaseColorPalette from "./BaseColorPalette.vue";
import { nativeColor, previewColor, safeColor } from "./color-utils";
import EditorSelect from "./EditorSelect.vue";
import FieldFrame from "./FieldFrame.vue";
import LinearSlider from "./LinearSlider.vue";

const props = defineProps<TokenFieldProps>();
const origins = [
  { value: "top left", label: "Top left", x: 0, y: 0 }, { value: "top", label: "Top", x: 50, y: 0 }, { value: "top right", label: "Top right", x: 100, y: 0 },
  { value: "left", label: "Left", x: 0, y: 50 }, { value: "center", label: "Center", x: 50, y: 50 }, { value: "right", label: "Right", x: 100, y: 50 },
  { value: "bottom left", label: "Bottom left", x: 0, y: 100 }, { value: "bottom", label: "Bottom", x: 50, y: 100 }, { value: "bottom right", label: "Bottom right", x: 100, y: 100 },
] as const satisfies readonly { readonly value: Extract<GradientPosition, string>; readonly label: string; readonly x: number; readonly y: number }[];
const types = ["linear", "repeating-linear", "radial", "repeating-radial", "conic"] as const;
const typeLabels: Readonly<Record<GradientDefinition["type"], string>> = { linear: "Linear", "repeating-linear": "Repeating linear", radial: "Radial", "repeating-radial": "Repeating radial", conic: "Conic" };
const emptyGradient: GradientDefinition = { type: "linear", angle: 135, stops: [{ color: "#4ac5ff", position: 0 }, { color: "#a79cf4", position: 100 }] };
const clamp = (value: number, minimum: number, maximum: number): number => Math.min(maximum, Math.max(minimum, value));
const stopPosition = (stop: GradientStop, index: number, count: number): number => clamp(stop.position ?? (count <= 1 ? 0 : index / (count - 1) * 100), 0, 100);
const usesAngle = (value: GradientDefinition): value is Extract<GradientDefinition, { readonly angle: number }> => value.type === "linear" || value.type === "repeating-linear" || value.type === "conic";
const usesPosition = (value: GradientDefinition): value is Extract<GradientDefinition, { readonly position?: GradientPosition }> => value.type === "radial" || value.type === "repeating-radial" || value.type === "conic";
const gradientValue = (value: ThemeTokenInput | undefined): GradientDefinition | undefined => {
  if (!value || typeof value !== "object" || !("type" in value) || !("stops" in value) || !Array.isArray(value.stops) || value.stops.length < 2) return undefined;
  return types.includes(value.type as GradientDefinition["type"]) ? value as GradientDefinition : undefined;
};
const gradient = computed(() => gradientValue(props.value));
const stopColors = ref<string[]>([]);
watch(gradient, value => { stopColors.value = value?.stops.map(stop => typeof stop.color === "string" ? stop.color : `ref: ${stop.color.$ref}`) ?? []; }, { immediate: true });
const id = computed(() => `oria-${props.mode}-${props.field.path.replaceAll(".", "-")}`);
const commit = (next: GradientDefinition): void => props.session.setToken(props.mode, props.field.path, next);
const positionCss = (position: GradientPosition | undefined): string => position === undefined ? "center" : typeof position === "string" ? position : `${position.x}% ${position.y}%`;
const coordinates = computed(() => {
  const position = gradient.value && usesPosition(gradient.value) ? gradient.value.position : undefined;
  if (position && typeof position === "object") return position;
  const preset = origins.find(origin => origin.value === (position ?? "center")) ?? origins[4];
  return { x: preset.x, y: preset.y };
});
const customOrigin = computed(() => Boolean(gradient.value && usesPosition(gradient.value) && typeof gradient.value.position === "object"));
const previewBackground = (value: GradientDefinition): string => {
  const stops = value.stops.map((stop, index) => `${previewColor(stop.color, "#94a3b8")} ${stopPosition(stop, index, value.stops.length)}%`).join(", ");
  if (value.type === "linear") return `linear-gradient(${clamp(value.angle, 0, 360)}deg, ${stops})`;
  if (value.type === "repeating-linear") return `repeating-linear-gradient(${clamp(value.angle, 0, 360)}deg, ${stops})`;
  if (value.type === "radial") return `radial-gradient(circle at ${positionCss(value.position)}, ${stops})`;
  if (value.type === "repeating-radial") return `repeating-radial-gradient(circle at ${positionCss(value.position)}, ${stops})`;
  return `conic-gradient(from ${clamp(value.angle, 0, 360)}deg at ${positionCss(value.position)}, ${stops})`;
};
const previewBadge = (value: GradientDefinition): string => {
  const repeat = value.type.startsWith("repeating-") ? "Repeat · " : "";
  if (value.type === "linear" || value.type === "repeating-linear") return `${repeat}${Math.round(value.angle)}°`;
  const position = typeof value.position === "object" ? `${value.position.x}% · ${value.position.y}%` : value.position ?? "center";
  return value.type === "conic" ? `${Math.round(value.angle)}° · ${position}` : `${repeat}${position}`;
};
const changeType = (type: GradientDefinition["type"]): void => {
  const current = gradient.value;
  if (!current || current.type === type) return;
  const angle = usesAngle(current) ? current.angle : type === "conic" ? 0 : 135;
  const position = usesPosition(current) ? current.position ?? "center" : "center";
  if (type === "linear" || type === "repeating-linear") commit({ type, angle, stops: current.stops });
  else if (type === "radial" || type === "repeating-radial") commit({ type, position, stops: current.stops });
  else commit({ type, angle, position, stops: current.stops });
};
const updateStop = (index: number, patch: Partial<GradientStop>): void => { const current = gradient.value; if (current) commit({ ...current, stops: current.stops.map((stop, currentIndex) => currentIndex === index ? { ...stop, ...patch } : stop) }); };
const chooseColor = (index: number, color: string): void => { stopColors.value[index] = color; if (safeColor(color)) updateStop(index, { color }); };
const removeStop = (index: number): void => { const current = gradient.value; if (current && current.stops.length > 2) commit({ ...current, stops: current.stops.filter((_, currentIndex) => currentIndex !== index) }); };
const addStop = (): void => {
  const current = gradient.value; if (!current) return;
  const normalized = current.stops.map((stop, index) => ({ ...stop, position: stopPosition(stop, index, current.stops.length) })).sort((left, right) => left.position - right.position);
  let start = 0; let end = 100; let largest = -1;
  for (let index = 0; index < normalized.length - 1; index += 1) { const gap = normalized[index + 1]!.position - normalized[index]!.position; if (gap > largest) { largest = gap; start = normalized[index]!.position; end = normalized[index + 1]!.position; } }
  commit({ ...current, stops: [...normalized, { color: "#ffffff", position: Math.round((start + end) / 2) }].sort((left, right) => (left.position ?? 0) - (right.position ?? 0)) });
};
const setAngle = (angle: number): void => { const current = gradient.value; if (current && usesAngle(current) && Number.isFinite(angle)) commit({ ...current, angle: clamp(angle, 0, 360) }); };
const setOrigin = (position: GradientPosition): void => { const current = gradient.value; if (current && usesPosition(current)) commit({ ...current, position }); };
const setCoordinate = (axis: "x" | "y", value: number): void => setOrigin({ ...coordinates.value, [axis]: clamp(value, 0, 100) });
</script>

<template><FieldFrame v-bind="props"><div v-if="!gradient" data-oria-editor-gradient data-empty><div data-oria-editor-gradient-preview :style="{ background: previewBackground(emptyGradient) }"><span>Gradient not set</span></div><button type="button" data-oria-editor-gradient-create @click="commit(emptyGradient)">Create gradient</button></div><div v-else data-oria-editor-gradient><div data-oria-editor-gradient-preview :style="{ background: previewBackground(gradient) }" role="img" :aria-label="`${gradient.type} gradient preview`"><span>{{ previewBadge(gradient) }}</span><div data-oria-editor-gradient-markers aria-hidden="true"><i v-for="(stop,index) in gradient.stops" :key="index" :style="{ '--oria-editor-gradient-stop-position': `${stopPosition(stop,index,gradient.stops.length)}%`, backgroundColor: previewColor(stop.color,'#94a3b8') }" /></div></div><div data-oria-editor-gradient-toolbar><label data-oria-editor-gradient-type><span>Type</span><EditorSelect aria-label="Gradient type" :model-value="gradient.type" @update:model-value="changeType($event as GradientDefinition['type'])"><option v-for="type in types" :key="type" :value="type">{{ typeLabels[type] }}</option></EditorSelect></label><button type="button" data-oria-editor-gradient-unset :aria-label="`Unset ${field.label} gradient`" title="Unset gradient" @click="session.removeToken(mode,field.path)"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6.5" /><path d="M6.5 13.5l7-7" /></svg>Unset</button><div data-oria-editor-gradient-geometry><label v-if="usesAngle(gradient)" data-oria-editor-gradient-angle><span>{{ gradient.type === 'conic' ? 'Start' : 'Angle' }}</span><LinearSlider :label="gradient.type === 'conic' ? 'Gradient start angle' : 'Gradient angle'" :value="gradient.angle" :minimum="0" :maximum="360" :step="1" @value-change="setAngle" /><input type="number" min="0" max="360" step="1" :value="Math.round(gradient.angle)" :aria-label="gradient.type === 'conic' ? 'Gradient start angle value' : 'Gradient angle value'" @input="setAngle(($event.target as HTMLInputElement).valueAsNumber)" /><small>°</small></label><div v-if="usesPosition(gradient)" data-oria-editor-gradient-origin><div data-oria-editor-gradient-origin-header><span>Origin</span><button type="button" :aria-pressed="customOrigin" :aria-controls="`${id}-origin-custom`" @click="!customOrigin && setOrigin(coordinates)">Custom</button></div><div data-oria-editor-gradient-origin-grid role="group" aria-label="Gradient origin presets"><button v-for="origin in origins" :key="origin.value" type="button" :aria-label="`Set gradient origin to ${origin.label}`" :aria-pressed="!customOrigin && (gradient.position ?? 'center') === origin.value" :title="origin.label" @click="setOrigin(origin.value)"><i aria-hidden="true" /></button></div><div v-if="customOrigin" :id="`${id}-origin-custom`" data-oria-editor-gradient-origin-custom><label v-for="axis in (['x','y'] as const)" :key="axis" data-oria-editor-gradient-coordinate><span>{{ axis.toUpperCase() }}</span><LinearSlider :label="`Gradient origin ${axis.toUpperCase()}`" :value="coordinates[axis]" :minimum="0" :maximum="100" :step="0.1" @value-change="value => setCoordinate(axis,value)" /><input type="number" min="0" max="100" step="0.1" :value="coordinates[axis]" :aria-label="`Gradient origin ${axis.toUpperCase()} value`" @input="setCoordinate(axis,($event.target as HTMLInputElement).valueAsNumber)" /><small>%</small></label></div></div></div></div><div data-oria-editor-gradient-stop-list><header><strong>Color stops</strong><span>{{ gradient.stops.length }}</span></header><div v-for="(stop,index) in gradient.stops" :key="index" data-oria-editor-gradient-stop><button type="button" data-oria-editor-gradient-swatch :aria-label="`Choose stop ${index + 1} color`" :style="{ '--oria-editor-color-preview': previewColor(stop.color,'#94a3b8') }"><input tabindex="-1" type="color" :value="nativeColor(stopColors[index] ?? '', '#94a3b8')" @input="chooseColor(index,($event.target as HTMLInputElement).value)" /></button><label><span class="oria-editor-visually-hidden">Stop {{ index + 1 }} color</span><input :value="stopColors[index]" :aria-label="`Stop ${index + 1} color`" :aria-invalid="!safeColor(stopColors[index] ?? '') || undefined" @input="chooseColor(index,($event.target as HTMLInputElement).value)" /></label><BaseColorPalette :id="`${id}-stop-${index}-base-colors`" :label="`stop ${index + 1} color`" :value="stopColors[index] ?? ''" @select="color => chooseColor(index,color)" /><button type="button" data-oria-editor-gradient-remove :aria-label="`Remove stop ${index + 1}`" title="Remove stop" :disabled="gradient.stops.length <= 2" @click="removeStop(index)"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12M8 3.5h4M6.5 6l.6 10h5.8l.6-10M8.5 8.5v5M11.5 8.5v5" /></svg></button><div data-oria-editor-gradient-position><LinearSlider :label="`Stop ${index + 1} position`" :value="stopPosition(stop,index,gradient.stops.length)" :minimum="index === 0 ? 0 : stopPosition(gradient.stops[index - 1]!,index - 1,gradient.stops.length)" :maximum="index === gradient.stops.length - 1 ? 100 : stopPosition(gradient.stops[index + 1]!,index + 1,gradient.stops.length)" :step="1" @value-change="position => updateStop(index,{ position })" /><output :aria-label="`Stop ${index + 1} position value`">{{ Math.round(stopPosition(stop,index,gradient.stops.length)) }}%</output></div></div><button type="button" data-oria-editor-gradient-add @click="addStop"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>Add color stop</button></div></div></FieldFrame></template>

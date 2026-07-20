<script setup lang="ts">
import type { ShadowLayer } from "@oriatheme/core";
import { previewColor } from "../fields/color-utils";
const props = defineProps<{ layer: ShadowLayer; index: number }>();
const emit = defineEmits<{ change: [layer: ShadowLayer]; delete: [] }>();
type LayerKey = "x" | "y" | "blur" | "spread" | "color";
const labels: Readonly<Record<LayerKey, string>> = { color: "Color", x: "X offset", y: "Y offset", blur: "Blur", spread: "Spread" };
const update = (key: LayerKey | "inset", value: string | boolean): void => emit("change", { ...props.layer, [key]: value });
</script>
<template><fieldset data-oria-editor-shadow-layer><legend class="oria-editor-visually-hidden">Layer {{ index + 1 }}</legend><header><span data-oria-editor-shadow-swatch :style="{ '--oria-editor-color-preview': previewColor(layer.color) }" aria-hidden="true" /><span><strong>Layer {{ index + 1 }}</strong><small>{{ layer.inset ? "Inner shadow" : "Outer shadow" }}</small></span><button type="button" :aria-label="`Delete shadow layer ${index + 1}`" title="Delete layer" @click="emit('delete')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" /></svg></button></header><div data-oria-editor-shadow-layer-fields><label v-for="key in (['color','x','y','blur','spread'] as const)" :key="key" :data-wide="key === 'color' || undefined"><span>{{ labels[key] }}</span><input :aria-label="`Layer ${index + 1} ${labels[key]}`" :value="layer[key]" spellcheck="false" @input="update(key,($event.target as HTMLInputElement).value)" /></label></div><label data-oria-editor-shadow-inset><input type="checkbox" :checked="Boolean(layer.inset)" @change="update('inset',($event.target as HTMLInputElement).checked)" /><span aria-hidden="true" /><strong>Inset shadow</strong></label></fieldset></template>

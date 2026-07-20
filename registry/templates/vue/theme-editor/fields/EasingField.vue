<script setup lang="ts">
import { computed, ref } from "vue";
import type { TokenFieldProps } from "../types";
import FieldFrame from "./FieldFrame.vue";
const props = defineProps<TokenFieldProps>();
const fallback = [0.2, 0, 0, 1] as const;
const labels = ["P1 x", "P1 y", "P2 x", "P2 y"] as const;
const value = computed(() => Array.isArray(props.value) && props.value.length === 4 ? props.value as readonly number[] : fallback);
const revision = ref(0);
const clamp = (number: number, minimum: number, maximum: number): number => Math.min(maximum, Math.max(minimum, number));
const curve = computed(() => [clamp(value.value[0]!, 0, 1), value.value[1]!, clamp(value.value[2]!, 0, 1), value.value[3]!]);
const path = computed(() => `M 0 60 C ${value.value[0]! * 100} ${60 - value.value[1]! * 60}, ${value.value[2]! * 100} ${60 - value.value[3]! * 60}, 100 0`);
const update = (index: number, text: string): void => { const next = [...value.value]; next[index] = Number(text); if (next.every(Number.isFinite)) props.session.setToken(props.mode, props.field.path, next as [number, number, number, number]); };
const id = computed(() => `oria-${props.mode}-${props.field.path.replaceAll(".", "-")}`);
</script>
<template><FieldFrame v-bind="props"><div :id="id" data-oria-editor-bezier><div data-oria-editor-bezier-inputs><label v-for="(part,index) in value" :key="index"><span>{{ labels[index] }}</span><input :aria-label="`${field.label} ${labels[index]}`" type="number" step="0.01" :value="part" @input="update(index, ($event.target as HTMLInputElement).value)" /></label></div><div data-oria-editor-bezier-visuals><svg viewBox="-4 -4 108 68" role="img" :aria-label="`${field.label} curve graph`"><path data-oria-editor-bezier-guide :d="`M 0 60 L ${value[0]! * 100} ${60 - value[1]! * 60} M 100 0 L ${value[2]! * 100} ${60 - value[3]! * 60}`" /><path data-oria-editor-bezier-curve :d="path" /><circle :cx="value[0]! * 100" :cy="60 - value[1]! * 60" r="3" /><circle :cx="value[2]! * 100" :cy="60 - value[3]! * 60" r="3" /></svg><section data-oria-editor-easing-preview :aria-label="`${field.label} effect preview`"><header><span>Effect preview</span><button type="button" :aria-label="`Replay ${field.label} effect preview`" @click="revision += 1"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.35 5.65M20 5v6h-6" /></svg><span>Replay</span></button></header><div data-oria-editor-easing-track><span :key="`${revision}-${value.join('-')}`" data-oria-editor-easing-mover :style="{ '--oria-editor-preview-easing': `cubic-bezier(${curve.join(', ')})` }"><i /></span></div></section></div></div></FieldFrame></template>

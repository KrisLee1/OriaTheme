<script setup lang="ts">
import { computed } from "vue";
import type { TokenFieldProps } from "../types";
import FieldFrame from "./FieldFrame.vue";
import LinearSlider from "./LinearSlider.vue";
import { numberSliderRange } from "./slider-ranges";
const props = defineProps<TokenFieldProps>();
const numericValue = computed(() => typeof props.value === "number" ? props.value : 0);
const range = computed(() => numberSliderRange(props.field.path, props.field.minimum, props.field.maximum));
const id = computed(() => `oria-${props.mode}-${props.field.path.replaceAll(".", "-")}`);
const commit = (next: number): void => { if (Number.isFinite(next)) props.session.setToken(props.mode, props.field.path, next); };
</script>
<template><FieldFrame v-bind="props"><div data-oria-editor-range :data-has-slider="Boolean(range) || undefined"><LinearSlider v-if="range" :label="`${field.label} slider`" :value="numericValue" :minimum="range.minimum" :maximum="range.maximum" :step="range.step" @value-change="commit" /><input :id="id" type="number" :min="range?.minimum" :max="range?.maximum" :step="range?.step ?? 'any'" :value="numericValue" @input="commit(($event.target as HTMLInputElement).valueAsNumber)" /></div></FieldFrame></template>

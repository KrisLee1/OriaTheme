<script setup lang="ts">
import { computed, toRef } from "vue";
import type { TokenFieldProps } from "../types";
import { useFieldBuffer } from "../composables/useFieldBuffer";
import FieldFrame from "./FieldFrame.vue";
import LinearSlider from "./LinearSlider.vue";
import { durationSliderRange } from "./slider-ranges";
const props = defineProps<TokenFieldProps>();
const value = computed(() => typeof props.value === "string" ? props.value : "0");
const buffer = useFieldBuffer(toRef(value), item => item, item => item.trim() ? item : undefined, item => props.session.setToken(props.mode, props.field.path, item));
const match = computed(() => /^(\d+(?:\.\d+)?)(ms|s)$/.exec(buffer.text.value.trim()));
const milliseconds = computed(() => buffer.text.value.trim() === "0" ? 0 : Number(match.value?.[1] ?? Number.NaN) * (match.value?.[2] === "s" ? 1000 : 1));
const canSlide = computed(() => Number.isFinite(milliseconds.value) && milliseconds.value >= durationSliderRange.minimum && milliseconds.value <= durationSliderRange.maximum);
const id = computed(() => `oria-${props.mode}-${props.field.path.replaceAll(".", "-")}`);
</script>
<template><FieldFrame v-bind="props"><div data-oria-editor-duration :data-has-slider="canSlide || undefined" :style="{ '--oria-editor-duration-preview': buffer.text.value }"><div data-oria-editor-duration-controls><LinearSlider v-if="canSlide" :label="`${field.label} slider`" :value="milliseconds" :minimum="durationSliderRange.minimum" :maximum="durationSliderRange.maximum" :step="durationSliderRange.step" @value-change="next => buffer.update(next === 0 ? '0' : `${next}ms`)" /><input :id="id" :value="buffer.text.value" inputmode="numeric" @input="buffer.update(($event.target as HTMLInputElement).value)" /></div><div data-oria-editor-duration-preview role="img" :aria-label="`${field.label} duration preview`"><span><i :key="buffer.text.value" /></span><small>Preview</small></div></div></FieldFrame></template>

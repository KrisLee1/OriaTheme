<script setup lang="ts">
import { computed, toRef } from "vue";
import type { TokenFieldProps } from "../types";
import { useFieldBuffer } from "../composables/useFieldBuffer";
import FieldFrame from "./FieldFrame.vue";
import LinearSlider from "./LinearSlider.vue";
import { fontWeightSliderRange } from "./slider-ranges";
const props = defineProps<TokenFieldProps>();
const value = computed(() => typeof props.value === "string" ? props.value : "400");
const buffer = useFieldBuffer(toRef(value), item => item, item => /^(?:normal|bold|[1-9]00)$/.test(item) ? item : undefined, item => props.session.setToken(props.mode, props.field.path, item));
const weight = computed(() => buffer.text.value === "normal" ? 400 : buffer.text.value === "bold" ? 700 : Number(buffer.text.value));
const id = computed(() => `oria-${props.mode}-${props.field.path.replaceAll(".", "-")}`);
</script>
<template><FieldFrame v-bind="props"><div data-oria-editor-range data-has-slider><LinearSlider :label="`${field.label} slider`" :value="Number.isFinite(weight) ? weight : 400" :minimum="fontWeightSliderRange.minimum" :maximum="fontWeightSliderRange.maximum" :step="fontWeightSliderRange.step" @value-change="next => buffer.update(String(next))" /><input :id="id" :value="buffer.text.value" inputmode="numeric" @input="buffer.update(($event.target as HTMLInputElement).value)" /></div></FieldFrame></template>

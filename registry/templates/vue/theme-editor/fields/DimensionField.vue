<script setup lang="ts">
import { computed, toRef } from "vue";
import type { TokenFieldProps } from "../types";
import { useFieldBuffer } from "../composables/useFieldBuffer";
import FieldFrame from "./FieldFrame.vue";
import LinearSlider from "./LinearSlider.vue";
import { dimensionSliderRange, preferredDimensionUnit } from "./slider-ranges";

const props = defineProps<TokenFieldProps>();
const value = computed(() => typeof props.value === "string" ? props.value : "");
const buffer = useFieldBuffer(toRef(value), item => item, item => item.trim() ? item : undefined, item => props.session.setToken(props.mode, props.field.path, item));
const match = computed(() => /^(-?(?:\d+|\d*\.\d+))(px|rem|em|%)$/.exec(buffer.text.value.trim()));
const amount = computed(() => Number(match.value?.[1] ?? 0));
const unit = computed(() => match.value?.[2] ?? preferredDimensionUnit(props.field.path));
const range = computed(() => dimensionSliderRange(props.field.path, unit.value));
const canSlide = computed(() => Boolean(range.value && Number.isFinite(amount.value) && amount.value >= range.value.minimum && amount.value <= range.value.maximum));
const id = computed(() => `oria-${props.mode}-${props.field.path.replaceAll(".", "-")}`);
</script>

<template>
  <FieldFrame v-bind="props">
    <div data-oria-editor-range :data-has-slider="canSlide || undefined">
      <LinearSlider v-if="range && canSlide" :label="`${field.label} slider`" :value="amount" :minimum="range.minimum" :maximum="range.maximum" :step="range.step" @value-change="next => buffer.update(`${next}${unit}`)" />
      <input :id="id" :value="buffer.text.value" :aria-invalid="Boolean(issue)" inputmode="decimal" @input="buffer.update(($event.target as HTMLInputElement).value)" />
    </div>
  </FieldFrame>
</template>

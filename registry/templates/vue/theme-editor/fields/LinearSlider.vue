<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps<{ label: string; value: number; minimum: number; maximum: number; step: number }>();
const emit = defineEmits<{ valueChange: [value: number] }>();
const clamp = (value: number): number => Math.min(props.maximum, Math.max(props.minimum, value));
const visualValue = ref(clamp(props.value));
const dragging = ref(false);
let frame: number | undefined;
let pending: number | undefined;

watch(() => props.value, value => { if (!dragging.value) visualValue.value = clamp(value); });
const publish = (next: number): void => {
  const value = clamp(next);
  visualValue.value = value;
  pending = value;
  if (frame !== undefined) return;
  frame = globalThis.requestAnimationFrame(() => {
    frame = undefined;
    if (pending !== undefined) emit("valueChange", pending);
    pending = undefined;
  });
};
const flush = (): void => {
  dragging.value = false;
  if (frame !== undefined) globalThis.cancelAnimationFrame(frame);
  frame = undefined;
  if (pending !== undefined) emit("valueChange", pending);
  pending = undefined;
};
const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    publish(event.key === "Home" ? props.minimum : props.maximum);
    return;
  }
  if (!["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"].includes(event.key)) return;
  event.preventDefault();
  const direction = event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 1;
  publish(visualValue.value + direction * props.step * (event.shiftKey ? 10 : 1));
};
const progress = computed(() => props.maximum === props.minimum ? 0 : ((visualValue.value - props.minimum) / (props.maximum - props.minimum)) * 100);
onBeforeUnmount(() => { if (frame !== undefined) globalThis.cancelAnimationFrame(frame); });
</script>

<template>
  <input
    data-oria-editor-linear-slider
    :aria-label="label"
    type="range"
    :min="minimum"
    :max="maximum"
    :step="step"
    :value="visualValue"
    :style="{ '--oria-editor-slider-progress': `${progress}%` }"
    @input="publish(($event.currentTarget as HTMLInputElement).valueAsNumber)"
    @keydown="onKeydown"
    @pointerdown="dragging = true; ($event.currentTarget as HTMLInputElement).setPointerCapture($event.pointerId)"
    @pointerup="flush"
    @pointercancel="flush"
    @blur="flush"
  />
</template>

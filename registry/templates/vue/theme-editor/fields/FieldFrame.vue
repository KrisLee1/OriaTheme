<script setup lang="ts">
import { computed } from "vue";
import type { TokenFieldProps } from "../types";
const props = defineProps<TokenFieldProps>();
const id = computed(() => `oria-${props.mode}-${props.field.path.replaceAll(".", "-")}`);
</script>

<template>
  <div data-oria-editor-field :data-oria-editor-field-kind="field.type" :data-modified="modified || undefined">
    <label :for="id">{{ field.label }}</label>
    <div data-oria-editor-input :id="`${id}-control`"><slot /></div>
    <p v-if="issue" :id="`${id}-error`" data-oria-editor-error role="alert">{{ issue }}</p>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });
const props = defineProps<{ modelValue: string | number }>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
</script>

<template><span data-oria-editor-select><select v-bind="$attrs" :value="props.modelValue" @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"><slot /></select><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6.5 8 3.5 3.5L13.5 8" /></svg></span></template>

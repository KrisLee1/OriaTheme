<script setup lang="ts">
import { computed } from "vue";
import type { TokenFieldProps } from "../types";
import FieldFrame from "./FieldFrame.vue";
const props = defineProps<TokenFieldProps>();
const value = computed(() => Array.isArray(props.value) ? props.value.join(", ") : "");
const id = computed(() => `oria-${props.mode}-${props.field.path.replaceAll(".", "-")}`);
</script>
<template><FieldFrame v-bind="props"><input :id="id" :value="value" @input="session.setToken(mode, field.path, ($event.target as HTMLInputElement).value.split(',').map(item => item.trim()).filter(Boolean))" /></FieldFrame></template>

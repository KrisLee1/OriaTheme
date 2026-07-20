<script setup lang="ts">
import { computed, toRef } from "vue";
import type { TokenFieldProps } from "../types";
import { useFieldBuffer } from "../composables/useFieldBuffer";
import BaseColorPalette from "./BaseColorPalette.vue";
import { nativeColor, previewColor } from "./color-utils";
import FieldFrame from "./FieldFrame.vue";
const props = defineProps<TokenFieldProps>();
const value = computed(() => typeof props.value === "string" ? props.value : "");
const buffer = useFieldBuffer(toRef(value), item => item, item => item.trim() ? item : undefined, item => props.session.setToken(props.mode, props.field.path, item));
const id = computed(() => `oria-${props.mode}-${props.field.path.replaceAll(".", "-")}`);
</script>
<template><FieldFrame v-bind="props"><div data-oria-editor-color><button type="button" data-oria-editor-color-swatch :aria-label="`Choose ${field.label}`" :style="{ '--oria-editor-color-preview': previewColor(buffer.text.value) }"><input tabindex="-1" type="color" :value="nativeColor(buffer.text.value)" @input="buffer.update(($event.target as HTMLInputElement).value)" /></button><input :id="id" :value="buffer.text.value" :aria-invalid="Boolean(issue)" spellcheck="false" @input="buffer.update(($event.target as HTMLInputElement).value)" /><BaseColorPalette :id="`${id}-base-colors`" :label="field.label" :value="buffer.text.value" @select="buffer.update" /></div></FieldFrame></template>

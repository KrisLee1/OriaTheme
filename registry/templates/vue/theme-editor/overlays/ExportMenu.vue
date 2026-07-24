<script setup lang="ts">
import { ref } from "vue";
import type { ThemeEditorSession } from "@oriatheme/editor-core";
import { useDetailsDismiss } from "../composables/useDetailsDismiss";
const props = defineProps<{ session: ThemeEditorSession; disabled: boolean }>();
const menu = ref<HTMLDetailsElement>(); const copied = ref(false); useDetailsDismiss(menu);
const copy = async (): Promise<void> => { await globalThis.navigator.clipboard.writeText(props.session.exportJson()); copied.value = true; globalThis.setTimeout(() => { copied.value = false; }, 1500); };
const download = (): void => { const url = URL.createObjectURL(new Blob([props.session.exportJson()], { type: "application/json" })); const link = globalThis.document.createElement("a"); link.href = url; link.download = `${props.session.getSnapshot().draft.id}.oria-theme.json`; link.click(); URL.revokeObjectURL(url); };
</script>
<template><details ref="menu" data-oria-editor-menu><summary :aria-disabled="disabled" :aria-label="copied ? 'Theme JSON copied' : 'Export theme JSON'" :title="copied ? 'Copied' : 'Export'"><svg data-oria-editor-action-icon viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M5 19h14" /></svg><span data-oria-editor-action-label>{{ copied ? "Copied" : "Export" }}</span></summary><div role="menu"><button role="menuitem" type="button" :disabled="disabled" @click="copy">Copy JSON</button><button role="menuitem" type="button" :disabled="disabled" @click="download">Download JSON</button></div></details></template>

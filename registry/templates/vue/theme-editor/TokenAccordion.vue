<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { ResolvedMode } from "@oriatheme/core";
import type { ThemeEditorSession, ThemeEditorSnapshot, TokenFieldDescriptor } from "@oriatheme/editor-core";
import type { EditorPanelLayout } from "./editor-layout";
import TokenField from "./TokenField.vue";
const props = defineProps<{ panel: EditorPanelLayout; fields: readonly TokenFieldDescriptor[]; mode: ResolvedMode; snapshot: ThemeEditorSnapshot; session: ThemeEditorSession; reveal: boolean }>();
const open = ref(true); watch(() => props.reveal, reveal => { if (reveal) open.value = true; });
const issueCount = computed(() => props.snapshot.issues.filter(issue => props.fields.some(field => issue.path?.endsWith(field.path))).length);
</script>
<template><section data-oria-editor-accordion :data-open="open" data-compact><button type="button" :aria-expanded="open" :aria-controls="`oria-panel-${panel.id}`" @click="open = !open"><span><strong>{{ panel.title }}</strong></span><span>{{ issueCount ? `${issueCount} issues` : "" }}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9 5 5 5-5" /></svg></span></button><div :id="`oria-panel-${panel.id}`" :hidden="!open"><TokenField v-for="field in fields" :key="field.path" :field="field" :mode="mode" :value="snapshot.draft.modes[mode][field.path]" :issue="snapshot.issues.find(issue => issue.path?.endsWith(field.path))?.message" :modified="snapshot.dirty" :session="session" /></div></section></template>

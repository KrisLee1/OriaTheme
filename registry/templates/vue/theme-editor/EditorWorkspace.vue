<script setup lang="ts">
import { computed } from "vue";
import type { ResolvedMode } from "@oriatheme/core";
import type { ThemeEditorSession, ThemeEditorSnapshot, TokenFieldDescriptor } from "@oriatheme/editor-core";
import { editorTabs } from "./editor-layout";
import type { EditorTabId } from "./editor-layout";
import TokenAccordion from "./TokenAccordion.vue";
const props = defineProps<{ tab: EditorTabId; query: string; mode: ResolvedMode; layout: ReadonlyMap<string, readonly TokenFieldDescriptor[]>; snapshot: ThemeEditorSnapshot; session: ThemeEditorSession }>();
const terms = computed(() => props.query.trim().toLowerCase().split(/\s+/).filter(Boolean));
const panels = computed(() => { const active = editorTabs.find(item => item.id === props.tab)!; return active.panels.map(panel => ({ panel, fields: (props.layout.get(panel.id) ?? []).filter(field => { const haystack = `${field.label} ${field.path} ${field.description} ${(panel.aliases ?? []).join(" ")}`.toLowerCase(); return terms.value.every(term => haystack.includes(term)); }) })).filter(item => item.fields.length > 0); });
</script>
<template><main data-oria-editor-workspace role="tabpanel" :aria-labelledby="`oria-tab-${tab}`"><TokenAccordion v-for="item in panels" :key="item.panel.id" :panel="item.panel" :fields="item.fields" :mode="mode" :snapshot="snapshot" :session="session" :reveal="terms.length > 0" /><p v-if="panels.length === 0" data-oria-editor-empty>No tokens match “{{ query }}”.</p></main></template>

<script setup lang="ts">
import type { ValidationIssue } from "@oriatheme/core";
import type { EditorTabId, EditorTabLayout } from "./editor-layout";
const props = defineProps<{ tabs: readonly EditorTabLayout[]; modelValue: EditorTabId; issues: readonly ValidationIssue[] }>();
const emit = defineEmits<{ "update:modelValue": [value: EditorTabId] }>();
const issueCount = (tab: EditorTabLayout): number => props.issues.filter(issue => tab.panels.some(panel => panel.prefixes?.some(prefix => issue.path?.includes(prefix)) || panel.paths?.some(path => issue.path?.endsWith(path)))).length;
const move = (event: KeyboardEvent, index: number): void => { let next = index; if (event.key === "ArrowRight") next = (index + 1) % props.tabs.length; else if (event.key === "ArrowLeft") next = (index - 1 + props.tabs.length) % props.tabs.length; else if (event.key === "Home") next = 0; else if (event.key === "End") next = props.tabs.length - 1; else return; event.preventDefault(); const tab = props.tabs[next]!; emit("update:modelValue",tab.id); (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus(); };
</script>
<template><nav data-oria-editor-tabs role="tablist" aria-label="Theme categories"><button v-for="(tab,index) in tabs" :id="`oria-tab-${tab.id}`" :key="tab.id" type="button" role="tab" :aria-selected="modelValue === tab.id" :tabindex="modelValue === tab.id ? 0 : -1" @click="emit('update:modelValue',tab.id)" @keydown="move($event,index)">{{ tab.title }}<span v-if="issueCount(tab)" :aria-label="`${issueCount(tab)} issues`">{{ issueCount(tab) }}</span></button></nav></template>

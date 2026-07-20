<script setup lang="ts">
import { ref } from "vue";
import type { ResolvedMode } from "@oriatheme/core";
import type { ThemeEditorSession } from "@oriatheme/editor-core";
import { useDetailsDismiss } from "../composables/useDetailsDismiss";
import ConfirmationDialog from "./ConfirmationDialog.vue";
const props = defineProps<{ session: ThemeEditorSession; mode: ResolvedMode }>();
const menu = ref<HTMLDetailsElement>();
const request = ref<{ label: string; action: () => void }>();
useDetailsDismiss(menu);
const ask = (label: string, action: () => void): void => { if (menu.value) menu.value.open = false; request.value = { label, action }; };
const confirm = (): void => { request.value?.action(); request.value = undefined; };
</script>
<template><details ref="menu" data-oria-editor-menu><summary aria-label="Reset theme draft" title="Reset"><svg data-oria-editor-action-icon viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4v6h6M5.5 15a7 7 0 1 0 .8-7.8L4 10" /></svg><span data-oria-editor-action-label>Reset</span></summary><div role="menu"><button role="menuitem" type="button" @click="ask(`${mode} mode`,() => session.resetMode(mode))">Reset {{ mode }} mode</button><button role="menuitem" type="button" @click="ask('the entire draft',() => session.resetAll())">Reset entire draft</button></div></details><ConfirmationDialog :open="request !== undefined" :title="`Reset ${request?.label ?? 'draft'}?`" :description="`This restores ${request?.label ?? 'the selected scope'} to its saved baseline. Any unsaved edits in that scope will be lost.`" confirm-label="Reset" @confirm="confirm" @cancel="request = undefined" /></template>

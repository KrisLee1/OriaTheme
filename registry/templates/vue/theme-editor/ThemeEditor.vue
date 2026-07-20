<script setup lang="ts">
import type { ResolvedMode } from "@oriatheme/core";
import type { ThemeEditorOptions, ThemeEditorSaveResult, ThemeEditorSession } from "@oriatheme/editor-core";
import type { OriaThemeRuntime } from "@oriatheme/runtime-dom";
import { provideThemeEditor } from "@oriatheme/vue-editor";
import EditorShell from "./EditorShell.vue";
import type { ThemeEditorDiscardRequest } from "./types";
import "./theme-editor.css";
const props = withDefaults(defineProps<{ session?: ThemeEditorSession; options?: ThemeEditorOptions; runtime?: OriaThemeRuntime; mode?: ResolvedMode; previewFollowsAppearance?: boolean; discardRequest?: ThemeEditorDiscardRequest; closable?: boolean }>(), { previewFollowsAppearance: false, closable: false });
const emit = defineEmits<{ modeChange: [mode: ResolvedMode, origin: HTMLElement]; save: [result: ThemeEditorSaveResult]; close: []; dirtyChange: [dirty: boolean] }>();
if (!props.session && !props.options) throw new Error("ThemeEditor requires a session or options.");
provideThemeEditor(props.session ?? props.options!);
</script>
<template><EditorShell :runtime="runtime" :mode="mode" :preview-follows-appearance="previewFollowsAppearance" :discard-request="discardRequest" :closable="closable" @mode-change="(mode,origin) => emit('modeChange',mode,origin)" @save="result => emit('save',result)" @close="emit('close')" @dirty-change="dirty => emit('dirtyChange',dirty)" /></template>

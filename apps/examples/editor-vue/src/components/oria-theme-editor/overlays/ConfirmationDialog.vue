<script setup lang="ts">
import { ref, watch } from "vue";
const props = withDefaults(defineProps<{ open: boolean; title: string; description: string; confirmLabel: string; cancelLabel?: string; destructive?: boolean }>(), { cancelLabel: "Cancel", destructive: true });
const emit = defineEmits<{ confirm: []; cancel: [] }>();
const dialog = ref<HTMLDialogElement>();
watch(() => props.open, open => { const element = dialog.value; if (!element) return; if (open && !element.open) element.showModal(); else if (!open && element.open) element.close(); }, { immediate: true, flush: "post" });
</script>
<template><dialog ref="dialog" data-oria-editor-confirmation :aria-label="title" @cancel.prevent="emit('cancel')"><div data-oria-editor-confirmation-panel><div data-oria-editor-confirmation-icon aria-hidden="true">!</div><div data-oria-editor-confirmation-copy><h2>{{ title }}</h2><p>{{ description }}</p></div><div data-oria-editor-confirmation-actions><button type="button" @click="emit('cancel')">{{ cancelLabel }}</button><button type="button" :data-oria-editor-confirm="destructive ? 'destructive' : 'primary'" autofocus @click="emit('confirm')">{{ confirmLabel }}</button></div></div></dialog></template>

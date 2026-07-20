<script setup lang="ts">
import { computed, ref } from "vue";
import type { ContrastDiagnostic, ValidationIssue } from "@oriatheme/core";
import { useDetailsDismiss } from "../composables/useDetailsDismiss";
const props = defineProps<{ issues: readonly ValidationIssue[]; warnings: readonly ContrastDiagnostic[] }>();
const menu = ref<HTMLDetailsElement>(); useDetailsDismiss(menu);
const health = computed<"ready" | "warning" | "error">(() => props.issues.length > 0 ? "error" : props.warnings.length > 0 ? "warning" : "ready");
const plural = (count: number, label: string): string => `${count} ${label}${count === 1 ? "" : "s"}`;
const label = computed(() => health.value === "error" ? `${plural(props.issues.length,"error")}${props.warnings.length ? ` · ${plural(props.warnings.length,"warning")}` : ""}` : health.value === "warning" ? plural(props.warnings.length,"warning") : "No issues");
</script>
<template><details ref="menu" data-oria-editor-menu :data-oria-editor-health="health"><summary :aria-label="health === 'ready' ? 'No theme issues' : `Theme validation: ${label}`" :title="label"><svg data-oria-editor-action-icon viewBox="0 0 24 24" aria-hidden="true"><template v-if="health === 'ready'"><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></template><template v-else-if="health === 'warning'"><path d="M12 3 2.8 20h18.4z" /><path d="M12 9v5m0 3h.01" /></template><template v-else><circle cx="12" cy="12" r="9" /><path d="M12 7.5v6m0 3h.01" /></template></svg><span data-oria-editor-action-label>{{ label }}</span></summary><div data-oria-editor-issues><template v-if="health !== 'ready'"><p v-for="(issue,index) in issues" :key="`e-${index}`"><strong>Error</strong> {{ issue.path }}<br />{{ issue.message }}</p><p v-for="(warning,index) in warnings" :key="`w-${index}`"><strong>Warning</strong> {{ warning.pair }}<br />{{ warning.message }}</p></template><p v-else>The current draft passes validation.</p></div></details></template>

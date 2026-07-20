import { defineComponent, h, ref } from "vue";
import type { PropType } from "vue";
import type { ResolvedMode } from "@oriatheme/core";
import { describeTokenContract } from "@oriatheme/editor-core";
import type { ThemeEditorSaveResult } from "@oriatheme/editor-core";
import type { OriaThemeRuntime } from "@oriatheme/runtime-dom";
import { useThemeEditor, useThemeEditorAutoPreview } from "@oriatheme/vue-editor";
import { editorTabs, resolveEditorLayout } from "./editor-layout.js";
import type { EditorTabId } from "./editor-layout.js";
import { TokenField } from "./token-field.js";

export const EditorShell = defineComponent({
  name: "EditorShell",
  props: { runtime: Object as PropType<OriaThemeRuntime>, onSave: Function as PropType<(result: ThemeEditorSaveResult) => void> },
  setup(props) {
    const { session, snapshot } = useThemeEditor(); const mode = ref<ResolvedMode>("light"); const tab = ref<EditorTabId>("colors"); const query = ref("");
    const preview = useThemeEditorAutoPreview(() => props.runtime, mode); const layout = resolveEditorLayout(describeTokenContract());
    const save = (): void => { if (props.runtime) props.onSave?.(session.save(props.runtime)); };
    return () => {
      const active = editorTabs.find(item => item.id === tab.value)!; const terms = query.value.toLowerCase().split(/\s+/).filter(Boolean);
      const fields = active.panels.flatMap(panel => layout.get(panel.id) ?? []).filter(field => { const haystack = `${field.label} ${field.path} ${field.description}`.toLowerCase(); return terms.every(term => haystack.includes(term)); });
      const status = preview.value.status === "paused" ? `Preview paused · ${preview.value.issueCount} issues` : preview.value.status === "unavailable" ? "Preview unavailable" : snapshot.value.dirty ? "Previewing · Unsaved" : "Previewing · Saved";
      return h("section", { "data-oria-editor-root": "", "aria-label": "Theme editor" }, [
        h("header", { "data-oria-editor-toolbar": "" }, [h("div", { "data-oria-editor-identity": "" }, [h("label", [h("span", { class: "oria-editor-visually-hidden" }, "Theme name"), h("input", { value: snapshot.value.draft.name, onChange: (event: Event) => session.setName((event.target as HTMLInputElement).value) })]), h("span", { "data-oria-editor-status": "" }, status)]), h("div", { "data-oria-editor-actions": "" }, [h("button", { type: "button", onClick: () => session.resetMode(mode.value) }, `Reset ${mode.value}`), h("button", { type: "button", disabled: snapshot.value.issues.length > 0, onClick: () => navigator.clipboard.writeText(session.exportJson()) }, "Copy JSON"), h("button", { type: "button", "data-oria-editor-primary": "", disabled: !props.runtime || !snapshot.value.dirty || snapshot.value.issues.length > 0, onClick: save }, "Save")])]),
        h("nav", { "data-oria-editor-tabs": "", role: "tablist" }, editorTabs.map(item => h("button", { type: "button", role: "tab", "aria-selected": tab.value === item.id, onClick: () => { tab.value = item.id; } }, item.title))),
        h("div", { "data-oria-editor-controls": "" }, [h("label", { "data-oria-editor-search": "" }, [h("span", "⌕"), h("input", { value: query.value, placeholder: "Search names, paths, or roles", onInput: (event: Event) => { query.value = (event.target as HTMLInputElement).value; } })]), h("div", { "data-oria-editor-mode": "", role: "group", "aria-label": "Editing mode" }, [h("span", { "data-mode": mode.value }), ...(["light", "dark"] as const).map(candidate => h("button", { type: "button", "aria-label": candidate === "light" ? "Light mode" : "Dark mode", title: candidate === "light" ? "Light mode" : "Dark mode", "aria-pressed": mode.value === candidate, onClick: () => { mode.value = candidate; } }, [h("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, candidate === "light" ? [h("circle", { cx: "12", cy: "12", r: "4" }), h("path", { d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" })] : [h("path", { d: "M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z" })])]))])]),
        h("div", { "data-oria-editor-split": "" }, [h("main", { "data-oria-editor-workspace": "" }, fields.map(field => {
          const value = snapshot.value.draft.modes[mode.value][field.path]; const issue = snapshot.value.issues.find(candidate => candidate.path?.endsWith(field.path))?.message;
          return h(TokenField, { key: field.path, field, mode: mode.value, session, ...(value === undefined ? {} : { value }), ...(issue === undefined ? {} : { issue }) });
        })), h("aside", { "data-oria-editor-preview": "", "aria-label": `${mode.value} preview` }, [h("div", [h("small", `Live preview · ${mode.value}`), h("h2", "Design that feels at home."), h("p", "Valid changes arrive atomically while the editor remains stable."), h("button", { type: "button" }, "Primary action")])])])
      ]);
    };
  }
});

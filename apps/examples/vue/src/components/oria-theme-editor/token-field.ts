import { defineComponent, h } from "vue";
import type { PropType } from "vue";
import type { ResolvedMode, ThemeTokenInput } from "@oriatheme/core";
import type { ThemeEditorSession, TokenFieldDescriptor } from "@oriatheme/editor-core";

const text = (value: ThemeTokenInput | undefined): string => typeof value === "string" ? value : typeof value === "number" ? String(value) : JSON.stringify(value ?? null);

export const TokenField = defineComponent({
  name: "TokenField",
  props: {
    field: { type: Object as PropType<TokenFieldDescriptor>, required: true },
    mode: { type: String as PropType<ResolvedMode>, required: true },
    value: [String, Number, Array, Object] as PropType<ThemeTokenInput>,
    issue: String,
    session: { type: Object as PropType<ThemeEditorSession>, required: true }
  },
  setup(props) {
    const commit = (raw: string): void => {
      if (props.field.type === "number") {
        const value = Number(raw);
        if (Number.isFinite(value)) props.session.setToken(props.mode, props.field.path, value);
        return;
      }
      if (["shadow", "gradient", "fontFamily", "cubicBezier"].includes(props.field.type)) {
        try { props.session.setToken(props.mode, props.field.path, JSON.parse(raw) as ThemeTokenInput); } catch { /* keep incomplete text visible */ }
        return;
      }
      props.session.setToken(props.mode, props.field.path, raw);
    };
    return () => h("div", { "data-oria-editor-field": "" }, [
      h("div", [h("label", props.field.label), h("button", { type: "button", "aria-label": `Reset ${props.field.label}`, onClick: () => props.session.resetToken(props.mode, props.field.path) }, "↶")]),
      h("small", `${props.field.path} · ${props.field.description}`),
      h("div", { "data-oria-editor-input": "" }, [props.field.type === "color"
        ? h("div", { "data-oria-editor-color": "" }, [h("button", { type: "button", style: { background: text(props.value) } }), h("input", { value: text(props.value), onInput: (event: Event) => commit((event.target as HTMLInputElement).value) })])
        : props.field.type === "duration"
          ? h("div", { "data-oria-editor-duration": "" }, [h("input", { value: text(props.value), onInput: (event: Event) => commit((event.target as HTMLInputElement).value) }), h("div", { "data-oria-editor-duration-preview": "", role: "img", "aria-label": `${props.field.label} duration preview` }, [h("span", [h("i", { key: text(props.value), "aria-hidden": "true", style: { animationDuration: text(props.value) } })]), h("small", "Preview")])])
        : h("textarea", { rows: ["shadow", "gradient"].includes(props.field.type) ? 4 : 1, value: text(props.value), onInput: (event: Event) => commit((event.target as HTMLTextAreaElement).value) })]),
      props.issue ? h("p", { "data-oria-editor-error": "", role: "alert" }, props.issue) : null
    ]);
  }
});

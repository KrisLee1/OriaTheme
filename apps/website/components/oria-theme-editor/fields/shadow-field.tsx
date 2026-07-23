import type { ReactElement } from "react";
import type { ShadowLayer } from "@oriatheme/core";
import { ChevronDown, Plus } from "lucide-react";
import type { TokenFieldProps } from "../types";
import { FieldFrame } from "./field-frame";
import { ShadowPreview } from "../shadows/shadow-preview";
import { ShadowLayerEditor } from "../shadows/shadow-layer-editor";
import { useEditorCopy } from "@/components/editor-page/editor-i18n";

export function ShadowField(props: TokenFieldProps): ReactElement {
  const copy = useEditorCopy().chrome.shadow;
  const layers = Array.isArray(props.value) ? props.value as readonly ShadowLayer[] : [];
  const set = (next: readonly ShadowLayer[]): void => props.session.setToken(props.mode, props.field.path, next);

  return <FieldFrame props={props}>
    <ShadowPreview layers={layers} />
    <details data-oria-editor-shadow-details>
      <summary>
        <span><strong>{copy.layers}</strong><small>{layers.length} {layers.length === 1 ? copy.layer : copy.layersCount}</small></span>
        <ChevronDown aria-hidden="true" />
      </summary>
      <div data-oria-editor-shadow-layer-list>
        {layers.map((layer, index) => <ShadowLayerEditor key={index} layer={layer} index={index} onChange={next => set(layers.map((item, itemIndex) => itemIndex === index ? next : item))} onDelete={() => set(layers.filter((_, itemIndex) => itemIndex !== index))} />)}
      </div>
      <button data-oria-editor-shadow-add type="button" onClick={() => set([...layers, { x: "0", y: "4px", blur: "12px", spread: "0", color: "#00000026" }])}>
        <Plus aria-hidden="true" />{copy.addLayer}
      </button>
    </details>
  </FieldFrame>;
}

import type { CSSProperties, ReactElement } from "react";
import type { ShadowLayer } from "@oriatheme/core";
import { previewColor } from "../fields/color-utils";
import { Trash2 } from "lucide-react";
import { interpolate, useEditorCopy } from "@/components/editor-page/editor-i18n";

type LayerKey = "x" | "y" | "blur" | "spread" | "color";
export function ShadowLayerEditor({ layer, index, onChange, onDelete }: { readonly layer: ShadowLayer; readonly index: number; readonly onChange: (layer: ShadowLayer) => void; readonly onDelete: () => void }): ReactElement {
  const copy = useEditorCopy().chrome.shadow;
  const field = (key: LayerKey, wide = false): ReactElement => <label data-wide={wide || undefined}>
    <span>{copy.fields[key]}</span>
    <input aria-label={`${interpolate(copy.layerName, { index: index + 1 })} ${copy.fields[key]}`} value={layer[key]} onChange={event => onChange({ ...layer, [key]: event.target.value })} spellCheck={false} />
  </label>;
  const swatchStyle = { "--oria-editor-color-preview": previewColor(layer.color) } as CSSProperties;

  return <fieldset data-oria-editor-shadow-layer>
    <legend className="oria-editor-visually-hidden">{interpolate(copy.layerName, { index: index + 1 })}</legend>
    <header>
      <span data-oria-editor-shadow-swatch style={swatchStyle} aria-hidden="true" />
      <span><strong>{interpolate(copy.layerName, { index: index + 1 })}</strong><small>{layer.inset ? copy.inner : copy.outer}</small></span>
      <button type="button" onClick={onDelete} aria-label={interpolate(copy.delete, { index: index + 1 })} title={copy.deleteTitle}>
        <Trash2 aria-hidden="true" />
      </button>
    </header>
    <div data-oria-editor-shadow-layer-fields>
      {field("color", true)}
      {field("x")}
      {field("y")}
      {field("blur")}
      {field("spread")}
    </div>
    <label data-oria-editor-shadow-inset>
      <input type="checkbox" checked={Boolean(layer.inset)} onChange={event => onChange({ ...layer, inset: event.target.checked })} />
      <span aria-hidden="true" />
      <strong>{copy.inset}</strong>
    </label>
  </fieldset>;
}

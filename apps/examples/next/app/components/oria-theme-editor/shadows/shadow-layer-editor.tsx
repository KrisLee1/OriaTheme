import type { CSSProperties, ReactElement } from "react";
import type { ShadowLayer } from "@oriatheme/core";
import { previewColor } from "../fields/color-utils";

type LayerKey = "x" | "y" | "blur" | "spread" | "color";
const fieldLabels: Readonly<Record<LayerKey, string>> = { color: "Color", x: "X offset", y: "Y offset", blur: "Blur", spread: "Spread" };

export function ShadowLayerEditor({ layer, index, onChange, onDelete }: { readonly layer: ShadowLayer; readonly index: number; readonly onChange: (layer: ShadowLayer) => void; readonly onDelete: () => void }): ReactElement {
  const field = (key: LayerKey, wide = false): ReactElement => <label data-wide={wide || undefined}>
    <span>{fieldLabels[key]}</span>
    <input aria-label={`Layer ${index + 1} ${fieldLabels[key]}`} value={layer[key]} onChange={event => onChange({ ...layer, [key]: event.target.value })} spellCheck={false} />
  </label>;
  const swatchStyle = { "--oria-editor-color-preview": previewColor(layer.color) } as CSSProperties;

  return <fieldset data-oria-editor-shadow-layer>
    <legend className="oria-editor-visually-hidden">Layer {index + 1}</legend>
    <header>
      <span data-oria-editor-shadow-swatch style={swatchStyle} aria-hidden="true" />
      <span><strong>Layer {index + 1}</strong><small>{layer.inset ? "Inner shadow" : "Outer shadow"}</small></span>
      <button type="button" onClick={onDelete} aria-label={`Delete shadow layer ${index + 1}`} title="Delete layer">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" /></svg>
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
      <strong>Inset shadow</strong>
    </label>
  </fieldset>;
}

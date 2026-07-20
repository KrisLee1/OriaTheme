import { useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import type { TokenFieldProps } from "../types";
import { FieldFrame, fieldId } from "./field-frame";

const fallback = [0.2, 0, 0, 1] as const;
const labels = ["P1 x", "P1 y", "P2 x", "P2 y"] as const;
const clamp = (value: number, minimum: number, maximum: number): number => Math.min(maximum, Math.max(minimum, value));

export function EasingField(props: TokenFieldProps): ReactElement {
  const value = Array.isArray(props.value) && props.value.length === 4 ? props.value as readonly number[] : fallback;
  const [previewRevision, setPreviewRevision] = useState(0);
  const previewCurve = [clamp(value[0]!, 0, 1), value[1]!, clamp(value[2]!, 0, 1), value[3]!];
  const previewStyle = { "--oria-editor-preview-easing": `cubic-bezier(${previewCurve.join(", ")})` } as CSSProperties;
  const curvePath = `M 0 60 C ${value[0]! * 100} ${60 - value[1]! * 60}, ${value[2]! * 100} ${60 - value[3]! * 60}, 100 0`;

  const update = (index: number, text: string): void => {
    const next = [...value];
    next[index] = Number(text);
    if (next.every(Number.isFinite)) props.session.setToken(props.mode, props.field.path, next as [number, number, number, number]);
  };

  return <FieldFrame props={props}><div id={fieldId(props)} data-oria-editor-bezier>
    <div data-oria-editor-bezier-inputs>
      {value.map((part, index) => <label key={index}><span>{labels[index]}</span><input aria-label={`${props.field.label} ${labels[index]}`} type="number" step="0.01" value={part} onChange={event => update(index, event.target.value)} /></label>)}
    </div>
    <div data-oria-editor-bezier-visuals>
      <svg viewBox="-4 -4 108 68" role="img" aria-label={`${props.field.label} curve graph`}>
        <path data-oria-editor-bezier-guide d={`M 0 60 L ${value[0]! * 100} ${60 - value[1]! * 60} M 100 0 L ${value[2]! * 100} ${60 - value[3]! * 60}`} />
        <path data-oria-editor-bezier-curve d={curvePath} />
        <circle cx={value[0]! * 100} cy={60 - value[1]! * 60} r="3" />
        <circle cx={value[2]! * 100} cy={60 - value[3]! * 60} r="3" />
      </svg>
      <section data-oria-editor-easing-preview aria-label={`${props.field.label} effect preview`}>
        <header><span>Effect preview</span><button type="button" onClick={() => setPreviewRevision(revision => revision + 1)} aria-label={`Replay ${props.field.label} effect preview`}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.35 5.65M20 5v6h-6" /></svg><span>Replay</span>
        </button></header>
        <div data-oria-editor-easing-track>
          <span key={`${previewRevision}-${value.join("-")}`} data-oria-editor-easing-mover style={previewStyle}><i /></span>
        </div>
      </section>
    </div>
  </div></FieldFrame>;
}

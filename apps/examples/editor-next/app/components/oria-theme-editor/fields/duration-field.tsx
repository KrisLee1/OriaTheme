import type { CSSProperties, ReactElement } from "react";
import type { TokenFieldProps } from "../types";
import { useFieldBuffer } from "../hooks/use-field-buffer";
import { FieldFrame, fieldId } from "./field-frame";
import { LinearSlider } from "./linear-slider";
import { durationSliderRange } from "./slider-ranges";

export function DurationField(props: TokenFieldProps): ReactElement {
  const value = typeof props.value === "string" ? props.value : "0";
  const buffer = useFieldBuffer(value, item => item, item => item.trim() ? item : undefined, item => props.session.setToken(props.mode, props.field.path, item));
  const match = /^(\d+(?:\.\d+)?)(ms|s)$/.exec(buffer.text.trim());
  const milliseconds = buffer.text.trim() === "0" ? 0 : Number(match?.[1] ?? Number.NaN) * (match?.[2] === "s" ? 1000 : 1);
  const canSlide = Number.isFinite(milliseconds) && milliseconds >= durationSliderRange.minimum && milliseconds <= durationSliderRange.maximum;
  return <FieldFrame props={props}><div data-oria-editor-duration data-has-slider={canSlide || undefined} style={{ "--oria-editor-duration-preview": buffer.text } as CSSProperties}>
    <div data-oria-editor-duration-controls>
      {canSlide ? <LinearSlider label={`${props.field.label} slider`} value={milliseconds} minimum={durationSliderRange.minimum} maximum={durationSliderRange.maximum} step={durationSliderRange.step} onValueChange={next => buffer.setText(next === 0 ? "0" : `${next}ms`)} /> : null}
      <input id={fieldId(props)} value={buffer.text} onChange={event => buffer.setText(event.target.value)} inputMode="numeric" />
    </div>
    <div data-oria-editor-duration-preview role="img" aria-label={`${props.field.label} duration preview`}><span><i key={buffer.text} /></span><small>Preview</small></div>
  </div></FieldFrame>;
}

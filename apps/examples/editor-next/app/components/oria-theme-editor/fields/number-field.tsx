import type { ReactElement } from "react";
import type { TokenFieldProps } from "../types";
import { FieldFrame, fieldId } from "./field-frame";
import { LinearSlider } from "./linear-slider";
import { numberSliderRange } from "./slider-ranges";

export function NumberField(props: TokenFieldProps): ReactElement {
  const value = typeof props.value === "number" ? props.value : 0;
  const range = numberSliderRange(props.field.path, props.field.minimum, props.field.maximum);
  const commit = (next: number): void => {
    if (Number.isFinite(next)) props.session.setToken(props.mode, props.field.path, next);
  };
  return <FieldFrame props={props}><div data-oria-editor-range data-has-slider={Boolean(range) || undefined}>
    {range ? <LinearSlider label={`${props.field.label} slider`} value={value} minimum={range.minimum} maximum={range.maximum} step={range.step} onValueChange={commit} /> : null}
    <input id={fieldId(props)} type="number" min={range?.minimum} max={range?.maximum} step={range?.step ?? "any"} value={value} onChange={event => commit(event.target.valueAsNumber)} />
  </div></FieldFrame>;
}

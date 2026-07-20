import type { ReactElement } from "react";
import type { TokenFieldProps } from "../types";
import { useFieldBuffer } from "../hooks/use-field-buffer";
import { FieldFrame, fieldId } from "./field-frame";
import { LinearSlider } from "./linear-slider";
import { fontWeightSliderRange } from "./slider-ranges";

const numericWeight = (value: string): number => value === "normal" ? 400 : value === "bold" ? 700 : Number(value);

export function FontWeightField(props: TokenFieldProps): ReactElement {
  const value = typeof props.value === "string" ? props.value : "400";
  const buffer = useFieldBuffer(value, item => item, item => /^(?:normal|bold|[1-9]00)$/.test(item) ? item : undefined, item => props.session.setToken(props.mode, props.field.path, item));
  const weight = numericWeight(buffer.text);
  return <FieldFrame props={props}><div data-oria-editor-range data-has-slider>
    <LinearSlider label={`${props.field.label} slider`} value={Number.isFinite(weight) ? weight : 400} minimum={fontWeightSliderRange.minimum} maximum={fontWeightSliderRange.maximum} step={fontWeightSliderRange.step} onValueChange={next => buffer.setText(String(next))} />
    <input id={fieldId(props)} value={buffer.text} inputMode="numeric" onChange={event => buffer.setText(event.target.value)} />
  </div></FieldFrame>;
}

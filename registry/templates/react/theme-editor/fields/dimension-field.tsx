import type { ReactElement } from "react";
import type { TokenFieldProps } from "../types";
import { useFieldBuffer } from "../hooks/use-field-buffer";
import { FieldFrame, fieldId } from "./field-frame";
import { LinearSlider } from "./linear-slider";
import { dimensionSliderRange, preferredDimensionUnit } from "./slider-ranges";

export function DimensionField(props: TokenFieldProps): ReactElement {
  const value = typeof props.value === "string" ? props.value : "";
  const buffer = useFieldBuffer(value, item => item, item => item.trim() ? item : undefined, item => props.session.setToken(props.mode, props.field.path, item));
  const match = /^(-?(?:\d+|\d*\.\d+))(px|rem|em|%)$/.exec(buffer.text.trim());
  const amount = Number(match?.[1] ?? 0);
  const unit = match?.[2] ?? preferredDimensionUnit(props.field.path);
  const range = dimensionSliderRange(props.field.path, unit);
  const canSlide = Boolean(range && Number.isFinite(amount) && amount >= range.minimum && amount <= range.maximum);
  return <FieldFrame props={props}><div data-oria-editor-range data-has-slider={canSlide || undefined}>
    {range && canSlide ? <LinearSlider label={`${props.field.label} slider`} value={amount} minimum={range.minimum} maximum={range.maximum} step={range.step} onValueChange={next => buffer.setText(`${next}${unit}`)} /> : null}
    <input id={fieldId(props)} value={buffer.text} aria-invalid={Boolean(props.issue)} onChange={event => buffer.setText(event.target.value)} inputMode="decimal" />
  </div></FieldFrame>;
}

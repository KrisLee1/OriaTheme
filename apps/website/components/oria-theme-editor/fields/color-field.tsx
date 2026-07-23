import type { CSSProperties, ReactElement } from "react";
import type { TokenFieldProps } from "../types";
import { useFieldBuffer } from "../hooks/use-field-buffer";
import { BaseColorPalette } from "./base-color-palette";
import { nativeColor, previewColor } from "./color-utils";
import { FieldFrame, fieldId } from "./field-frame";
import { interpolate, useEditorCopy } from "@/components/editor-page/editor-i18n";

export function ColorField(props: TokenFieldProps): ReactElement {
  const copy = useEditorCopy().chrome.palette;
  const value = typeof props.value === "string" ? props.value : "";
  const buffer = useFieldBuffer(value, item => item, item => item.trim() ? item : undefined, item => props.session.setToken(props.mode, props.field.path, item));
  const native = nativeColor(buffer.text);
  const preview = previewColor(buffer.text);
  const id = fieldId(props);
  return <FieldFrame props={props}><div data-oria-editor-color>
    <button type="button" data-oria-editor-color-swatch aria-label={interpolate(copy.chooseColor, { label: props.field.label })} style={{ "--oria-editor-color-preview": preview } as CSSProperties}><input tabIndex={-1} type="color" value={native} onChange={event => buffer.setText(event.target.value)} /></button>
    <input id={id} value={buffer.text} aria-invalid={Boolean(props.issue)} onChange={event => buffer.setText(event.target.value)} spellCheck={false} />
    <BaseColorPalette id={`${id}-base-colors`} label={props.field.label} value={buffer.text} onSelect={buffer.setText} />
  </div></FieldFrame>;
}

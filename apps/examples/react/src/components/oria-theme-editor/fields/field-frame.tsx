import type { ReactElement, ReactNode } from "react";
import type { TokenFieldProps } from "../types";
export function FieldFrame({ props, children }: { readonly props: TokenFieldProps; readonly children: ReactNode }): ReactElement {
  const id = `oria-${props.mode}-${props.field.path.replaceAll(".", "-")}`; const errorId = `${id}-error`;
  return <div data-oria-editor-field data-oria-editor-field-kind={props.field.type} data-modified={props.modified || undefined}><label htmlFor={id}>{props.field.label}</label><div data-oria-editor-input id={`${id}-control`}>{children}</div>{props.issue ? <p id={errorId} data-oria-editor-error role="alert">{props.issue}</p> : null}</div>;
}
export const fieldId = (props: TokenFieldProps): string => `oria-${props.mode}-${props.field.path.replaceAll(".", "-")}`;

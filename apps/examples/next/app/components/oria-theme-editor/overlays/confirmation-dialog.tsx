import { useEffect, useId, useRef } from "react";
import type { ReactElement } from "react";

export interface ConfirmationDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel: string;
  readonly cancelLabel?: string;
  readonly destructive?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function ConfirmationDialog({ open, title, description, confirmLabel, cancelLabel = "Cancel", destructive = true, onConfirm, onCancel }: ConfirmationDialogProps): ReactElement {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return <dialog ref={dialog} data-oria-editor-confirmation aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={event => { event.preventDefault(); onCancel(); }}>
    <div data-oria-editor-confirmation-panel>
      <div data-oria-editor-confirmation-icon aria-hidden="true">!</div>
      <div data-oria-editor-confirmation-copy><h2 id={titleId}>{title}</h2><p id={descriptionId}>{description}</p></div>
      <div data-oria-editor-confirmation-actions>
        <button type="button" onClick={onCancel}>{cancelLabel}</button>
        <button type="button" data-oria-editor-confirm={destructive ? "destructive" : "primary"} autoFocus onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </dialog>;
}

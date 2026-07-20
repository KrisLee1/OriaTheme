import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactElement } from "react";

const clamp = (value: number, minimum: number, maximum: number): number => Math.min(maximum, Math.max(minimum, value));

export function LinearSlider({ label, value, minimum, maximum, step, onValueChange }: {
  readonly label: string;
  readonly value: number;
  readonly minimum: number;
  readonly maximum: number;
  readonly step: number;
  readonly onValueChange: (value: number) => void;
}): ReactElement {
  const externalValue = clamp(value, minimum, maximum);
  const [visualValue, setVisualValue] = useState(externalValue);
  const draggingRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const pendingRef = useRef<number | null>(null);

  useEffect(() => {
    if (!draggingRef.current) setVisualValue(externalValue);
  }, [externalValue]);

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
  }, []);

  const publish = (next: number): void => {
    const clamped = clamp(next, minimum, maximum);
    setVisualValue(clamped);
    pendingRef.current = clamped;
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending !== null) onValueChange(pending);
    });
  };

  const flush = (): void => {
    draggingRef.current = false;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending !== null) onValueChange(pending);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      publish(event.key === "Home" ? minimum : maximum);
      return;
    }
    if (!["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 1;
    publish(visualValue + direction * step * (event.shiftKey ? 10 : 1));
  };

  const progress = maximum === minimum ? 0 : ((visualValue - minimum) / (maximum - minimum)) * 100;
  const style = { "--oria-editor-slider-progress": `${progress}%` } as CSSProperties;

  return <input
    data-oria-editor-linear-slider
    aria-label={label}
    type="range"
    min={minimum}
    max={maximum}
    step={step}
    value={visualValue}
    style={style}
    onInput={event => publish(event.currentTarget.valueAsNumber)}
    onKeyDown={onKeyDown}
    onPointerDown={event => {
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }}
    onPointerUp={flush}
    onPointerCancel={flush}
    onBlur={flush}
  />;
}

import { useEffect, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import type { GradientDefinition, GradientPosition, GradientStop, ThemeTokenInput } from "@oriatheme/core";
import type { TokenFieldProps } from "../types";
import { BaseColorPalette } from "./base-color-palette";
import { nativeColor, previewColor, safeColor } from "./color-utils";
import { FieldFrame, fieldId } from "./field-frame";
import { LinearSlider } from "./linear-slider";

const gradientOrigins = [
  { value: "top left", label: "Top left", x: 0, y: 0 },
  { value: "top", label: "Top", x: 50, y: 0 },
  { value: "top right", label: "Top right", x: 100, y: 0 },
  { value: "left", label: "Left", x: 0, y: 50 },
  { value: "center", label: "Center", x: 50, y: 50 },
  { value: "right", label: "Right", x: 100, y: 50 },
  { value: "bottom left", label: "Bottom left", x: 0, y: 100 },
  { value: "bottom", label: "Bottom", x: 50, y: 100 },
  { value: "bottom right", label: "Bottom right", x: 100, y: 100 }
] as const satisfies readonly { readonly value: Extract<GradientPosition, string>; readonly label: string; readonly x: number; readonly y: number }[];
const gradientTypes = ["linear", "repeating-linear", "radial", "repeating-radial", "conic"] as const;
const gradientTypeLabels: Readonly<Record<GradientDefinition["type"], string>> = {
  linear: "Linear",
  "repeating-linear": "Repeating linear",
  radial: "Radial",
  "repeating-radial": "Repeating radial",
  conic: "Conic"
};
const emptyGradient: GradientDefinition = { type: "linear", angle: 135, stops: [{ color: "#4ac5ff", position: 0 }, { color: "#a79cf4", position: 100 }] };

const clamp = (value: number, minimum: number, maximum: number): number => Math.min(maximum, Math.max(minimum, value));
const stopPosition = (stop: GradientStop, index: number, count: number): number => clamp(stop.position ?? (count <= 1 ? 0 : index / (count - 1) * 100), 0, 100);
const usesAngle = (gradient: GradientDefinition): gradient is Extract<GradientDefinition, { readonly angle: number }> => gradient.type === "linear" || gradient.type === "repeating-linear" || gradient.type === "conic";
const usesPosition = (gradient: GradientDefinition): gradient is Extract<GradientDefinition, { readonly position?: GradientPosition }> => gradient.type === "radial" || gradient.type === "repeating-radial" || gradient.type === "conic";
const positionCss = (position: GradientPosition | undefined): string => position === undefined ? "center" : typeof position === "string" ? position : `${position.x}% ${position.y}%`;
const positionLabel = (position: GradientPosition | undefined): string => position === undefined ? "center" : typeof position === "string" ? position : `${position.x}% · ${position.y}%`;
const positionCoordinates = (position: GradientPosition | undefined): Extract<GradientPosition, object> => {
  if (position && typeof position === "object") return position;
  const preset = gradientOrigins.find(origin => origin.value === (position ?? "center")) ?? gradientOrigins[4];
  return { x: preset.x, y: preset.y };
};

function gradientValue(value: ThemeTokenInput | undefined): GradientDefinition | undefined {
  if (!value || typeof value !== "object" || !("type" in value) || !("stops" in value) || !Array.isArray(value.stops) || value.stops.length < 2) return undefined;
  return gradientTypes.includes(value.type as GradientDefinition["type"]) ? value as GradientDefinition : undefined;
}

function previewBackground(gradient: GradientDefinition): string {
  const stops = gradient.stops.map((stop, index) => `${previewColor(stop.color, "#94a3b8")} ${stopPosition(stop, index, gradient.stops.length)}%`).join(", ");
  if (gradient.type === "linear") return `linear-gradient(${clamp(gradient.angle, 0, 360)}deg, ${stops})`;
  if (gradient.type === "repeating-linear") return `repeating-linear-gradient(${clamp(gradient.angle, 0, 360)}deg, ${stops})`;
  if (gradient.type === "radial") return `radial-gradient(circle at ${positionCss(gradient.position)}, ${stops})`;
  if (gradient.type === "repeating-radial") return `repeating-radial-gradient(circle at ${positionCss(gradient.position)}, ${stops})`;
  return `conic-gradient(from ${clamp(gradient.angle, 0, 360)}deg at ${positionCss(gradient.position)}, ${stops})`;
}

function previewBadge(gradient: GradientDefinition): string {
  const repeat = gradient.type.startsWith("repeating-") ? "Repeat · " : "";
  if (gradient.type === "conic") return `${Math.round(gradient.angle)}° · ${positionLabel(gradient.position)}`;
  if (gradient.type === "linear" || gradient.type === "repeating-linear") return `${repeat}${Math.round(gradient.angle)}°`;
  return `${repeat}${positionLabel(gradient.position)}`;
}

function GradientOriginEditor({ id, position, onChange }: { readonly id: string; readonly position: GradientPosition | undefined; readonly onChange: (position: GradientPosition) => void }): ReactElement {
  const custom = typeof position === "object";
  const coordinates = positionCoordinates(position);
  const setCoordinate = (axis: "x" | "y", value: number): void => onChange({ ...coordinates, [axis]: clamp(value, 0, 100) });

  return <div data-oria-editor-gradient-origin>
    <div data-oria-editor-gradient-origin-header>
      <span>Origin</span>
      <button type="button" aria-pressed={custom} aria-controls={id} onClick={() => !custom && onChange(coordinates)}>Custom</button>
    </div>
    <div data-oria-editor-gradient-origin-grid role="group" aria-label="Gradient origin presets">
      {gradientOrigins.map(origin => <button
        key={origin.value}
        type="button"
        aria-label={`Set gradient origin to ${origin.label}`}
        aria-pressed={!custom && (position ?? "center") === origin.value}
        title={origin.label}
        onClick={() => onChange(origin.value)}
      ><i aria-hidden="true" /></button>)}
    </div>
    {custom ? <div id={id} data-oria-editor-gradient-origin-custom>
      <label data-oria-editor-gradient-coordinate>
        <span>X</span>
        <LinearSlider label="Gradient origin X" value={coordinates.x} minimum={0} maximum={100} step={0.1} onValueChange={value => setCoordinate("x", value)} />
        <input type="number" min={0} max={100} step={0.1} value={coordinates.x} aria-label="Gradient origin X value" onChange={event => Number.isFinite(event.currentTarget.valueAsNumber) && setCoordinate("x", event.currentTarget.valueAsNumber)} />
        <small>%</small>
      </label>
      <label data-oria-editor-gradient-coordinate>
        <span>Y</span>
        <LinearSlider label="Gradient origin Y" value={coordinates.y} minimum={0} maximum={100} step={0.1} onValueChange={value => setCoordinate("y", value)} />
        <input type="number" min={0} max={100} step={0.1} value={coordinates.y} aria-label="Gradient origin Y value" onChange={event => Number.isFinite(event.currentTarget.valueAsNumber) && setCoordinate("y", event.currentTarget.valueAsNumber)} />
        <small>%</small>
      </label>
    </div> : null}
  </div>;
}

function GradientStopEditor({ id, stop, index, count, minimum, maximum, onChange, onRemove }: {
  readonly id: string;
  readonly stop: GradientStop;
  readonly index: number;
  readonly count: number;
  readonly minimum: number;
  readonly maximum: number;
  readonly onChange: (stop: GradientStop) => void;
  readonly onRemove: () => void;
}): ReactElement {
  const externalColor = typeof stop.color === "string" ? stop.color : `ref: ${stop.color.$ref}`;
  const [color, setColor] = useState(externalColor);
  const position = stopPosition(stop, index, count);
  const native = nativeColor(color, "#94a3b8");

  useEffect(() => setColor(externalColor), [externalColor]);

  const chooseColor = (next: string): void => {
    setColor(next);
    if (safeColor(next)) onChange({ ...stop, color: next });
  };

  return <div data-oria-editor-gradient-stop>
    <button type="button" data-oria-editor-gradient-swatch aria-label={`Choose stop ${index + 1} color`} style={{ "--oria-editor-color-preview": previewColor(stop.color, "#94a3b8") } as CSSProperties}>
      <input tabIndex={-1} type="color" value={native} onChange={event => chooseColor(event.target.value)} />
    </button>
    <label>
      <span className="oria-editor-visually-hidden">Stop {index + 1} color</span>
      <input
        value={color}
        aria-label={`Stop ${index + 1} color`}
        aria-invalid={!safeColor(color) || undefined}
        onChange={event => chooseColor(event.target.value)}
      />
    </label>
    <BaseColorPalette id={`${id}-base-colors`} label={`stop ${index + 1} color`} value={color} onSelect={chooseColor} />
    <button type="button" data-oria-editor-gradient-remove aria-label={`Remove stop ${index + 1}`} title="Remove stop" disabled={count <= 2} onClick={onRemove}>
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12M8 3.5h4M6.5 6l.6 10h5.8l.6-10M8.5 8.5v5M11.5 8.5v5" /></svg>
    </button>
    <div data-oria-editor-gradient-position>
      <LinearSlider label={`Stop ${index + 1} position`} value={position} minimum={minimum} maximum={maximum} step={1} onValueChange={next => onChange({ ...stop, position: next })} />
      <output aria-label={`Stop ${index + 1} position value`}>{Math.round(position)}%</output>
    </div>
  </div>;
}

export function GradientField(props: TokenFieldProps): ReactElement {
  const gradient = gradientValue(props.value);
  const commit = (next: GradientDefinition): void => props.session.setToken(props.mode, props.field.path, next);

  if (!gradient) return <FieldFrame props={props}>
    <div data-oria-editor-gradient data-empty>
      <div data-oria-editor-gradient-preview style={{ background: previewBackground(emptyGradient) }}>
        <span>Gradient not set</span>
      </div>
      <button type="button" data-oria-editor-gradient-create onClick={() => commit(emptyGradient)}>Create gradient</button>
    </div>
  </FieldFrame>;

  const updateStop = (index: number, stop: GradientStop): void => commit({ ...gradient, stops: gradient.stops.map((current, currentIndex) => currentIndex === index ? stop : current) });
  const removeStop = (index: number): void => {
    if (gradient.stops.length <= 2) return;
    commit({ ...gradient, stops: gradient.stops.filter((_, currentIndex) => currentIndex !== index) });
  };
  const addStop = (): void => {
    const normalized = gradient.stops.map((stop, index) => ({ ...stop, position: stopPosition(stop, index, gradient.stops.length) })).sort((a, b) => a.position - b.position);
    const positions = normalized.map(stop => stop.position);
    let start = 0;
    let end = 100;
    let largest = -1;
    for (let index = 0; index < positions.length - 1; index += 1) {
      const gap = positions[index + 1]! - positions[index]!;
      if (gap > largest) { largest = gap; start = positions[index]!; end = positions[index + 1]!; }
    }
    commit({ ...gradient, stops: [...normalized, { color: "#ffffff", position: Math.round((start + end) / 2) }].sort((a, b) => a.position - b.position) });
  };
  const changeType = (type: GradientDefinition["type"]): void => {
    if (type === gradient.type) return;
    const angle = usesAngle(gradient) ? gradient.angle : type === "conic" ? 0 : 135;
    const position = usesPosition(gradient) ? gradient.position ?? "center" : "center";
    if (type === "linear" || type === "repeating-linear") commit({ type, angle, stops: gradient.stops });
    else if (type === "radial" || type === "repeating-radial") commit({ type, position, stops: gradient.stops });
    else commit({ type, angle, position, stops: gradient.stops });
  };
  const background = previewBackground(gradient);

  return <FieldFrame props={props}>
    <div data-oria-editor-gradient>
      <div data-oria-editor-gradient-preview style={{ background }} role="img" aria-label={`${gradient.type} gradient preview`}>
        <span>{previewBadge(gradient)}</span>
        <div data-oria-editor-gradient-markers aria-hidden="true">
          {gradient.stops.map((stop, index) => <i key={index} style={{ "--oria-editor-gradient-stop-position": `${stopPosition(stop, index, gradient.stops.length)}%`, backgroundColor: previewColor(stop.color, "#94a3b8") } as CSSProperties} />)}
        </div>
      </div>
      <div data-oria-editor-gradient-toolbar>
        <label data-oria-editor-gradient-type>
          <span>Type</span>
          <select aria-label="Gradient type" value={gradient.type} onChange={event => changeType(event.target.value as GradientDefinition["type"])}>
            {gradientTypes.map(type => <option key={type} value={type}>{gradientTypeLabels[type]}</option>)}
          </select>
        </label>
        <button type="button" data-oria-editor-gradient-unset aria-label={`Unset ${props.field.label} gradient`} title="Unset gradient" onClick={() => props.session.removeToken(props.mode, props.field.path)}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6.5" /><path d="M6.5 13.5l7-7" /></svg>
          Unset
        </button>
        <div data-oria-editor-gradient-geometry>
          {usesAngle(gradient) ? <label data-oria-editor-gradient-angle>
            <span>{gradient.type === "conic" ? "Start" : "Angle"}</span>
            <LinearSlider label={gradient.type === "conic" ? "Gradient start angle" : "Gradient angle"} value={gradient.angle} minimum={0} maximum={360} step={1} onValueChange={angle => commit({ ...gradient, angle })} />
            <input type="number" min={0} max={360} step={1} value={Math.round(gradient.angle)} aria-label={gradient.type === "conic" ? "Gradient start angle value" : "Gradient angle value"} onChange={event => Number.isFinite(event.currentTarget.valueAsNumber) && commit({ ...gradient, angle: clamp(event.currentTarget.valueAsNumber, 0, 360) })} />
            <small>°</small>
          </label> : null}
          {usesPosition(gradient) ? <GradientOriginEditor id={`${fieldId(props)}-origin-custom`} position={gradient.position} onChange={position => commit({ ...gradient, position })} /> : null}
        </div>
      </div>
      <div data-oria-editor-gradient-stop-list>
        <header><strong>Color stops</strong><span>{gradient.stops.length}</span></header>
        {gradient.stops.map((stop, index) => <GradientStopEditor key={index} id={`${fieldId(props)}-stop-${index}`} stop={stop} index={index} count={gradient.stops.length} minimum={index === 0 ? 0 : stopPosition(gradient.stops[index - 1]!, index - 1, gradient.stops.length)} maximum={index === gradient.stops.length - 1 ? 100 : stopPosition(gradient.stops[index + 1]!, index + 1, gradient.stops.length)} onChange={next => updateStop(index, next)} onRemove={() => removeStop(index)} />)}
        <button type="button" data-oria-editor-gradient-add onClick={addStop}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>
          Add color stop
        </button>
      </div>
    </div>
  </FieldFrame>;
}

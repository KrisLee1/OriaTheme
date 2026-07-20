import type { CSSProperties, ReactElement } from "react"; import type { ShadowLayer } from "@oriatheme/core";
const css = (layer: ShadowLayer): string => `${layer.inset ? "inset " : ""}${layer.x} ${layer.y} ${layer.blur} ${layer.spread} ${layer.color}`;
export function ShadowPreview({ layers }: { readonly layers: readonly ShadowLayer[] }): ReactElement { return <div data-oria-editor-shadow-preview style={{ "--oria-shadow-preview": layers.map(css).join(", ") || "none" } as CSSProperties} aria-label={`${layers.length} shadow layers`} />; }

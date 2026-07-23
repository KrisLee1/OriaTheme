import type { CSSProperties, ReactElement } from "react"; import type { ShadowLayer } from "@oriatheme/core";
import { interpolate, useEditorCopy } from "@/components/editor-page/editor-i18n";
const css = (layer: ShadowLayer): string => `${layer.inset ? "inset " : ""}${layer.x} ${layer.y} ${layer.blur} ${layer.spread} ${layer.color}`;
export function ShadowPreview({ layers }: { readonly layers: readonly ShadowLayer[] }): ReactElement { const copy = useEditorCopy().chrome.shadow; return <div data-oria-editor-shadow-preview style={{ "--oria-shadow-preview": layers.map(css).join(", ") || "none" } as CSSProperties} aria-label={interpolate(copy.preview, { count: layers.length })} />; }

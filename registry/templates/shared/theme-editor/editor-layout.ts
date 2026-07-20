import type { TokenFieldDescriptor } from "@oriatheme/editor-core";

export type EditorTabId = "themes" | "colors" | "typography" | "layout" | "depth" | "motion";
export interface EditorPanelLayout {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly prefixes?: readonly string[];
  readonly paths?: readonly string[];
  readonly aliases?: readonly string[];
}
export interface EditorTabLayout { readonly id: EditorTabId; readonly title: string; readonly panels: readonly EditorPanelLayout[] }

export const editorTabs: readonly EditorTabLayout[] = [
  { id: "themes", title: "Themes", panels: [] },
  { id: "colors", title: "Colors", panels: [
    { id: "canvas", title: "Canvas & Surfaces", summary: "Page, surface, raised and overlay pairs.", paths: ["color.background", "color.foreground", "color.surface", "color.surfaceForeground", "color.surfaceRaised", "color.surfaceRaisedForeground", "color.overlay", "color.overlayForeground"] },
    { id: "primary", title: "Primary", summary: "Primary actions and interaction states.", prefixes: ["color.primary"] },
    { id: "secondary", title: "Secondary", summary: "Secondary actions and interaction states.", prefixes: ["color.secondary"] },
    { id: "muted-accent", title: "Muted & Accent", summary: "Quiet and highlighted surfaces.", prefixes: ["color.muted", "color.accent"] },
    { id: "feedback", title: "Feedback", summary: "Destructive, success, warning and information.", prefixes: ["color.destructive", "color.success", "color.warning", "color.info"] },
    { id: "borders", title: "Borders & Selection", summary: "Dividers, inputs, focus and selection.", paths: ["color.border", "color.borderStrong", "color.input", "color.ring", "color.selection", "color.selectionForeground", "color.scrim"] },
    { id: "charts", title: "Charts", summary: "Eight adjacent data colors.", prefixes: ["color.chart"] }
  ] },
  { id: "typography", title: "Typography", panels: [
    { id: "font-families", title: "Font Families", summary: "System-aware font stacks.", prefixes: ["typography.font."] },
    { id: "font-weights", title: "Font Weights", summary: "The text emphasis ladder.", prefixes: ["typography.weight."] },
    { id: "type-scale", title: "Type Scale", summary: "Responsive text sizes.", prefixes: ["typography.size."] },
    { id: "line-height", title: "Line Height", summary: "Compact through relaxed leading.", prefixes: ["typography.lineHeight."] },
    { id: "letter-spacing", title: "Letter Spacing", summary: "Optical tracking by role.", prefixes: ["typography.letterSpacing."] }
  ] },
  { id: "layout", title: "Layout & Shape", panels: [
    { id: "spacing", title: "Spacing & Density", summary: "Base unit, density and spacing scale.", prefixes: ["spacing."] },
    { id: "control", title: "Control Size", summary: "Touch-safe heights and inline padding.", prefixes: ["control."] },
    { id: "radius", title: "Radius Scale", summary: "Corners from square to capsule.", prefixes: ["shape.radius."] },
    { id: "borders-focus", title: "Borders & Focus Ring", summary: "Border weights and focus geometry.", prefixes: ["shape.borderWidth.", "shape.focusRing"] }
  ] },
  { id: "depth", title: "Depth & Material", panels: [
    { id: "elevation", title: "Elevation Scale", summary: "Outer shadow hierarchy.", paths: ["elevation.shadow.none", "elevation.shadow.2xs", "elevation.shadow.xs", "elevation.shadow.sm", "elevation.shadow.md", "elevation.shadow.lg", "elevation.shadow.xl", "elevation.shadow.2xl"] },
    { id: "inner", title: "Inner Shadows & Highlights", summary: "Inset separation and light-catching edges.", paths: ["elevation.shadow.inner", "elevation.shadow.highlight"] },
    { id: "opacity", title: "Opacity", summary: "Disabled, muted and overlay strengths.", prefixes: ["effect.opacity."] },
    { id: "blur", title: "Blur", summary: "Foreground blur scale.", prefixes: ["effect.blur."] },
    { id: "backdrop", title: "Backdrop", summary: "Backdrop blur scale and saturation.", prefixes: ["effect.backdrop"] },
    { id: "gradients", title: "Gradients", summary: "Structured optional gradients.", prefixes: ["gradient."] }
  ] },
  { id: "motion", title: "Motion", panels: [
    { id: "duration", title: "Duration Scale", summary: "Instant through slow response.", prefixes: ["motion.duration."] },
    { id: "easing", title: "Easing Curves", summary: "Standard, enter, exit and emphasized curves.", prefixes: ["motion.easing."] }
  ] }
] as const;

const matches = (field: TokenFieldDescriptor, panel: EditorPanelLayout): boolean =>
  Boolean(panel.paths?.includes(field.path) || panel.prefixes?.some(prefix => field.path.startsWith(prefix)));

/** Resolves every contract field to exactly one user-editable panel configuration. */
export function resolveEditorLayout(fields: readonly TokenFieldDescriptor[]): ReadonlyMap<string, readonly TokenFieldDescriptor[]> {
  const result = new Map<string, readonly TokenFieldDescriptor[]>();
  const assigned = new Set<string>();
  for (const tab of editorTabs) for (const panel of tab.panels) {
    const panelFields = fields.filter(field => matches(field, panel));
    for (const field of panelFields) {
      if (assigned.has(field.path)) throw new Error(`Editor layout assigns ${field.path} more than once.`);
      assigned.add(field.path);
    }
    result.set(panel.id, Object.freeze(panelFields));
  }
  const missing = fields.filter(field => !assigned.has(field.path));
  if (missing.length > 0) throw new Error(`Editor layout is missing: ${missing.map(field => field.path).join(", ")}`);
  return result;
}

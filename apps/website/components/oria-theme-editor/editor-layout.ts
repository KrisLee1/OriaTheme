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
    { id: "canvas", title: "Canvas & Surfaces", summary: "Page, surface, raised and overlay pairs.", paths: ["color.bg", "color.fg", "color.surface", "color.surface.fg", "color.surface.raised", "color.surface.raised.fg", "color.overlay", "color.overlay.fg"] },
    { id: "primary", title: "Primary", summary: "Primary actions and interaction states.", prefixes: ["color.primary"] },
    { id: "secondary", title: "Secondary", summary: "Secondary actions and interaction states.", prefixes: ["color.secondary"] },
    { id: "muted-accent", title: "Muted & Accent", summary: "Quiet and highlighted surfaces.", prefixes: ["color.muted", "color.accent"] },
    { id: "feedback", title: "Feedback", summary: "Danger, success, warning and information.", prefixes: ["color.danger", "color.success", "color.warning", "color.info"] },
    { id: "borders", title: "Borders & Selection", summary: "Dividers, inputs, focus and selection.", paths: ["color.border", "color.border.strong", "color.input", "color.ring", "color.selection", "color.selection.fg", "color.scrim"] },
    { id: "charts", title: "Charts", summary: "Eight adjacent data colors.", prefixes: ["color.chart"] }
  ] },
  { id: "typography", title: "Typography", panels: [
    { id: "font-families", title: "Font Families", summary: "System-aware font stacks.", paths: ["font.sans", "font.serif", "font.mono", "font.display"] },
    { id: "font-weights", title: "Font Weights", summary: "The text emphasis ladder.", prefixes: ["font.weight."] },
    { id: "type-scale", title: "Type Size", summary: "Responsive text sizes.", prefixes: ["text."] },
    { id: "line-height", title: "Line Height", summary: "Compact through relaxed leading.", prefixes: ["leading."] },
    { id: "letter-spacing", title: "Letter Spacing", summary: "Optical tracking by role.", prefixes: ["tracking."] }
  ] },
  { id: "layout", title: "Layout & Shape", panels: [
    { id: "spacing", title: "Spacing", summary: "The base unit behind the spacing scale.", paths: ["space"] },
    { id: "control", title: "Control Size", summary: "Touch-safe heights and inline padding.", prefixes: ["control."] },
    { id: "radius", title: "Radius", summary: "The base unit behind the radius scale.", paths: ["radius"] },
    { id: "border-width", title: "Borders", summary: "Hairline, default and strong border weights.", prefixes: ["border.width."] },
    { id: "focus-ring", title: "Focus Ring", summary: "Focus ring width and offset.", prefixes: ["ring."] }
  ] },
  { id: "depth", title: "Depth & Material", panels: [
    { id: "elevation", title: "Shadow", summary: "Outer shadow hierarchy.", paths: ["shadow.none", "shadow.2xs", "shadow.xs", "shadow.sm", "shadow.md", "shadow.lg", "shadow.xl", "shadow.2xl"] },
    { id: "inner", title: "Inner Shadows & Highlights", summary: "Inset separation and light-catching edges.", paths: ["shadow.inner", "shadow.highlight"] },
    { id: "opacity", title: "Opacity", summary: "Disabled, muted and overlay strengths.", prefixes: ["opacity."] },
    { id: "blur", title: "Blur", summary: "Foreground blur scale.", prefixes: ["blur."] },
    { id: "backdrop", title: "Backdrop", summary: "Backdrop blur scale and saturation.", prefixes: ["backdrop."] },
    { id: "gradients", title: "Gradients", summary: "Structured optional gradients.", prefixes: ["gradient."] },
    { id: "patterns", title: "Patterns", summary: "Structured optional background and surface patterns.", prefixes: ["pattern."] }
  ] },
  { id: "motion", title: "Motion", panels: [
    { id: "duration", title: "Duration", summary: "Instant through slow response.", prefixes: ["duration."] },
    { id: "easing", title: "Easing Curves", summary: "Standard, enter, exit and emphasized curves.", prefixes: ["ease."] }
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

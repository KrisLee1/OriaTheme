import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
interface RegistryManifest { readonly framework: "react" | "vue"; readonly files: readonly { readonly source: string; readonly target: string; readonly sha256: string }[]; readonly dependencies: readonly string[] }
const manifest = (framework: "react" | "vue"): RegistryManifest => JSON.parse(readFileSync(resolve(root, `registry/manifest/theme-editor.${framework}.json`), "utf8")) as RegistryManifest;

describe("theme editor registry", () => {
  it("maps all standard fields to exactly one of five token tabs plus Themes", () => {
    const script = 'import { describeTokenContract } from "@oriatheme/editor-core"; import { editorTabs, resolveEditorLayout } from "../../registry/templates/react/theme-editor/editor-layout.ts"; const fields=describeTokenContract(); const layout=resolveEditorLayout(fields); console.log(JSON.stringify({tabs:editorTabs.length,fields:fields.length,assigned:[...layout.values()].flat().length,unique:new Set([...layout.values()].flat().map(field=>field.path)).size,blur:layout.get("blur")?.map(field=>field.path),backdrop:layout.get("backdrop")?.map(field=>field.path),patterns:layout.get("patterns")?.map(field=>field.path)}));';
    const result = JSON.parse(execFileSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", script], { cwd: resolve(root, "packages/editor-core"), encoding: "utf8" })) as { readonly tabs: number; readonly fields: number; readonly assigned: number; readonly unique: number };
    expect(result).toEqual({
      tabs: 6,
      fields: 154,
      assigned: 154,
      unique: 154,
      blur: ["effect.blur.xs", "effect.blur.sm", "effect.blur.md", "effect.blur.lg", "effect.blur.xl", "effect.blur.2xl", "effect.blur.3xl"],
      backdrop: ["effect.backdropBlur.xs", "effect.backdropBlur.sm", "effect.backdropBlur.md", "effect.backdropBlur.lg", "effect.backdropBlur.xl", "effect.backdropBlur.2xl", "effect.backdropBlur.3xl", "effect.backdropSaturation"],
      patterns: ["pattern.background", "pattern.surface"]
    });
  });

  for (const framework of ["react", "vue"] as const) it(`ships a safe, hashed, multi-file ${framework} item`, () => {
    const item = manifest(framework);
    expect(item.files.length).toBeGreaterThan(25);
    expect(item.dependencies.some(dependency => dependency.includes(framework === "react" ? "vue" : "react"))).toBe(false);
    for (const file of item.files) {
      expect(file.source.startsWith("/") || file.target.startsWith("/") || file.source.split("/").includes("..") || file.target.split("/").includes("..")).toBe(false);
      const bytes = readFileSync(resolve(root, "registry", file.source));
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(file.sha256);
    }
    const targets = item.files.map(file => file.target);
    expect(targets).toContain("editor-layout.ts");
    expect(targets).toContain("theme-editor.css");
    expect(targets.some(target => target.toLowerCase().includes("toolbar"))).toBe(true);
    expect(targets.some(target => target.includes("fields/") && target.toLowerCase().includes("shadow"))).toBe(true);
    if (framework === "react") {
      expect(item.dependencies).toContain("@oriatheme/colors@^0.1.0");
      expect(targets).toContain("fields/base-color-palette.tsx");
      expect(targets).toContain("fields/color-utils.ts");
      expect(targets).toContain("fields/linear-slider.tsx");
      expect(targets).toContain("fields/editor-select.tsx");
      expect(targets).toContain("fields/pattern-field.tsx");
      expect(targets).toContain("fields/slider-ranges.ts");
      expect(targets).toContain("hooks/use-details-dismiss.ts");
      const picker = readFileSync(resolve(root, "registry/templates/react/theme-editor/fields/base-color-palette.tsx"), "utf8");
      expect(picker).toContain("oriaColorFamilies");
      expect(picker).toContain("Search family, shade, or hex");
      expect(picker).toContain("createPortal");
      expect(picker).toContain("getBoundingClientRect");
      expect(picker).toContain("data-oria-editor-palette-popover");
      expect(picker).toContain("Show compact color scales");
      expect(picker).toContain("data-view={view}");
      expect(picker).toContain("data-oria-editor-palette-view data-view={view}");
      expect(picker).toContain('<svg viewBox="0 0 24 24"');
      expect(picker).not.toContain("Close base colors");
      expect(picker).not.toContain("showModal");
      const toolbar = readFileSync(resolve(root, "registry/templates/react/theme-editor/editor-toolbar.tsx"), "utf8");
      const themeEditor = readFileSync(resolve(root, "registry/templates/react/theme-editor/theme-editor.tsx"), "utf8");
      const shell = readFileSync(resolve(root, "registry/templates/react/theme-editor/editor-shell.tsx"), "utf8");
      const reset = readFileSync(resolve(root, "registry/templates/react/theme-editor/overlays/reset-menu.tsx"), "utf8");
      const importDialog = readFileSync(resolve(root, "registry/templates/react/theme-editor/overlays/import-dialog.tsx"), "utf8");
      const exportMenu = readFileSync(resolve(root, "registry/templates/react/theme-editor/overlays/export-menu.tsx"), "utf8");
      const issuesPopover = readFileSync(resolve(root, "registry/templates/react/theme-editor/overlays/issues-popover.tsx"), "utf8");
      const detailsDismiss = readFileSync(resolve(root, "registry/templates/react/theme-editor/hooks/use-details-dismiss.ts"), "utf8");
      const confirmation = readFileSync(resolve(root, "registry/templates/react/theme-editor/overlays/confirmation-dialog.tsx"), "utf8");
      const toolbarStyles = readFileSync(resolve(root, "registry/templates/react/theme-editor/theme-editor.css"), "utf8");
      const colorField = readFileSync(resolve(root, "registry/templates/react/theme-editor/fields/color-field.tsx"), "utf8");
      const colorUtils = readFileSync(resolve(root, "registry/templates/react/theme-editor/fields/color-utils.ts"), "utf8");
      const reactExample = readFileSync(resolve(root, "apps/examples/react/src/page.tsx"), "utf8");
      const nextExample = readFileSync(resolve(root, "apps/examples/next/app/theme-demo.tsx"), "utf8");
      const vueExample = readFileSync(resolve(root, "apps/examples/vue/src/page.ts"), "utf8");
      expect(toolbar).toContain("data-oria-editor-toolbar-top");
      expect(toolbar).toContain("data-oria-editor-utility-actions");
      expect(toolbar).toContain("data-oria-editor-commit-actions");
      expect(toolbar).toContain('aria-label="Close editor"');
      expect(shell).toContain('addEventListener("beforeunload"');
      expect(shell).toContain("discardRequest");
      expect(themeEditor).toContain("previewFollowsAppearance");
      expect(shell).toContain("previewFollowsAppearance ? undefined : mode");
      expect(reset).toContain("ConfirmationDialog");
      expect(reset).not.toContain("globalThis.confirm");
      expect(importDialog).toContain(".oria-theme.json,.json,application/json");
      expect(importDialog).not.toContain(".oria.theme.json");
      expect(importDialog).toContain("data-oria-editor-file-picker");
      expect(importDialog).toContain("Choose file");
      expect(importDialog).toContain('document.documentElement.style.overflow = "hidden"');
      expect(importDialog).toContain('document.body.style.overflow = "hidden"');
      expect(importDialog).toContain("focus({ preventScroll: true })");
      expect(importDialog).toContain("onClose={() => setOpen(false)}");
      expect(exportMenu).toContain('`${id}.oria-theme.json`');
      expect(exportMenu).not.toContain(".oria.theme.json");
      expect(issuesPopover).toContain('"ready" | "warning" | "error"');
      expect(issuesPopover).toContain("data-oria-editor-health={health}");
      expect(reset).toContain("useDetailsDismiss(menu)");
      expect(exportMenu).toContain("useDetailsDismiss(menu)");
      expect(issuesPopover).toContain("useDetailsDismiss(menu)");
      expect(detailsDismiss).toContain('globalThis.document.addEventListener("pointerdown"');
      expect(detailsDismiss).toContain('event.key === "Escape"');
      expect(toolbar.indexOf("<IssuesPopover")).toBeLessThan(toolbar.indexOf("data-oria-editor-save"));
      expect(confirmation).toContain("showModal");
      expect(confirmation).toContain("data-oria-editor-confirmation");
      expect(targets).toContain("overlays/confirmation-dialog.tsx");
      expect(targets).toContain("themes-workspace.tsx");
      expect(targets).toContain("theme-accordion.tsx");
      expect(targets).toContain("theme-list-item.tsx");
      const themes = readFileSync(resolve(root, "registry/templates/react/theme-editor/themes-workspace.tsx"), "utf8");
      const themeItem = readFileSync(resolve(root, "registry/templates/react/theme-editor/theme-list-item.tsx"), "utf8");
      expect(themes).toContain('title="My themes"');
      expect(themes).toContain('title="Presets"');
      expect(themes).toContain("runtime.duplicateTheme");
      expect(themes).toContain("runtime.removeCustomTheme");
      expect(shell).toContain('onEdit={() => setTab("colors")}');
      expect(themeItem).toContain("Copy and edit");
      expect(themeItem).toContain("Rename");
      expect(themeItem).toContain('"color.selection"');
      expect(themeItem).toContain("data-oria-editor-palette-icon");
      for (const example of [reactExample, nextExample]) {
        expect(example).toContain("previewFollowsAppearance");
        expect(example).toContain("mode={snapshot.resolvedMode}");
        expect(example).toContain("onModeChange={(mode, origin) => changeAppearance(mode, origin)}");
        expect(example).not.toContain("setEditorMode");
      }
      expect(toolbarStyles).toContain("[data-oria-editor-save]");
      expect(toolbarStyles).toContain("[data-oria-editor-file-picker]");
      expect(toolbarStyles).toContain("[data-oria-editor-root][data-tab=themes] [data-oria-editor-split] { padding-top: 1rem; }");
      expect(toolbarStyles).toContain("[data-oria-editor-health=ready]");
      expect(toolbarStyles).toContain("--oria-editor-motion-theme: var(--oria-motion-duration-slow)");
      expect(toolbarStyles).toContain("var(--oria-typography-font-sans)");
      expect(toolbarStyles).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|cubic-bezier\(|system-ui|Segoe UI/i);
      expect(toolbarStyles).not.toMatch(/font-size:\s*[0-9.]|line-height:\s*[0-9.]|letter-spacing:\s*-?[0-9.]/);
      expect(toolbarStyles).toContain("[data-oria-editor-health=warning]");
      expect(toolbarStyles).toContain("[data-oria-editor-health=error]");
      expect(toolbarStyles).toContain("[data-oria-editor-palette-popover]");
      expect(toolbarStyles).toContain("[data-oria-editor-palette-view]::before");
      expect(toolbarStyles).toContain("[data-oria-editor-palette-view][data-view=compact]::before");
      expect(toolbarStyles).toContain("[data-oria-editor-palette-popover] { --oria-editor-motion-normal: var(--oria-motion-duration-normal); }");
      expect(toolbarStyles).toContain("--oria-editor-overlay: color-mix(in srgb, var(--oria-color-overlay) calc(var(--oria-effect-opacity-overlay) * 100%), transparent)");
      expect(toolbarStyles).toContain("[data-oria-editor-palette-popover] { --oria-editor-surface: var(--oria-color-surface)");
      expect(toolbarStyles).toContain("--oria-editor-backdrop-lg: var(--oria-effect-backdropBlur-lg)");
      expect(toolbarStyles.match(/--oria-editor-backdrop-lg: var\(--oria-effect-backdropBlur-lg\)/g)).toHaveLength(2);
      expect(toolbarStyles.match(/background: var\(--oria-editor-overlay\)/g)).toHaveLength(5);
      expect(toolbarStyles).toContain("[data-oria-editor-toolbar]:has([data-oria-editor-menu][open])");
      expect(toolbarStyles).toContain("--oria-editor-backdrop-lg: var(--oria-effect-backdropBlur-lg)");
      expect(toolbarStyles).toContain("blur(var(--oria-editor-backdrop-lg))");
      expect(toolbarStyles).toContain("[data-oria-editor-dialog][data-oria-editor-import]");
      expect(toolbarStyles).toContain("--oria-editor-backdrop-xl: var(--oria-effect-backdropBlur-xl)");
      expect(toolbarStyles).toContain("blur(var(--oria-editor-backdrop-xl))");
      expect(toolbarStyles).toContain("font-weight: var(--oria-editor-weight-semibold)");
      expect(toolbarStyles).not.toMatch(/font-weight:\s*(?:620|650|680|760)/);
      expect(toolbarStyles).toContain("min-height: 2.75rem");
      expect(toolbarStyles).toContain("[data-oria-editor-color-swatch]::before");
      expect(toolbarStyles).toContain("background-image: conic-gradient(var(--oria-editor-border) 25%");
      expect(toolbarStyles).toContain("background: var(--oria-editor-color-preview, transparent)");
      expect(colorField).toContain("data-oria-editor-color-swatch");
      expect(colorField).toContain("--oria-editor-color-preview");
      expect(colorUtils).toContain("[\\da-f]{8}");
      expect(colorUtils).toContain("export function nativeColor");
      expect(reactExample).toContain('onSave={result => { if (result.ok) setTheme(result.theme.id); }}');
      expect(nextExample).toContain('onSave={result => { if (result.ok) setTheme(result.theme.id); }}');
      expect(reactExample).toContain("data-active={snapshot.preference.appearance}");
      expect(nextExample).toContain("data-active={snapshot.preference.appearance}");
      expect(vueExample).toContain('"data-active": snapshot.value.preference.appearance');
      expect(reactExample.indexOf('className="topbar-brand"')).toBeLessThan(reactExample.indexOf('className="editor-trigger"'));
      expect(nextExample.indexOf('className="topbar-brand"')).toBeLessThan(nextExample.indexOf('className="editor-trigger"'));
      expect(toolbarStyles).toContain("[data-oria-editor-linear-slider]");
      expect(toolbarStyles).toContain("[data-oria-editor-duration-preview]");
      expect(toolbarStyles).toContain("background: var(--oria-color-selection)");
      expect(toolbarStyles).toContain("grid-template-columns: minmax(5.25rem, .85fr) minmax(0, 1.75fr)");
      expect(toolbarStyles).toContain("[data-oria-editor-field-kind=color] [data-oria-editor-color] { width: max-content");
      expect(toolbarStyles).toContain("[data-oria-editor-field-kind=shadow], [data-oria-editor-field-kind=gradient], [data-oria-editor-field-kind=pattern], [data-oria-editor-field-kind=cubicBezier]");
      expect(toolbarStyles).toContain("[data-oria-editor-pattern-layer-fields] { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr))");
      expect(toolbarStyles).toContain("[data-oria-editor-pattern-layer-fields] > [data-oria-editor-color] { grid-column: 1 / -1");
      expect(toolbarStyles).toContain("@container (max-width: 29rem) { [data-oria-editor-pattern-layer] > header");
      expect(toolbarStyles).toContain("@container (max-width: 21rem) { [data-oria-editor-pattern-layer] > header");
      expect(toolbarStyles).toContain("[data-oria-editor-shadow-details] > summary");
      expect(toolbarStyles).toContain("cursor: pointer; user-select: none");
      expect(toolbarStyles).toContain("@keyframes oria-editor-easing-preview");
      const easing = readFileSync(resolve(root, "registry/templates/react/theme-editor/fields/easing-field.tsx"), "utf8");
      const shadow = readFileSync(resolve(root, "registry/templates/react/theme-editor/shadows/shadow-layer-editor.tsx"), "utf8");
      expect(easing).toContain("data-oria-editor-easing-preview");
      expect(easing).toContain("Replay ${props.field.label} effect preview");
      expect(shadow).toContain("data-oria-editor-shadow-layer-fields");
      expect(shadow).toContain("data-oria-editor-shadow-inset");
      const accordion = readFileSync(resolve(root, "registry/templates/react/theme-editor/token-accordion.tsx"), "utf8");
      const workspace = readFileSync(resolve(root, "registry/templates/react/theme-editor/editor-workspace.tsx"), "utf8");
      const search = readFileSync(resolve(root, "registry/templates/react/theme-editor/editor-search.tsx"), "utf8");
      expect(accordion).toContain("useState(true)");
      expect(accordion).toContain("hidden={!open}");
      expect(workspace).toContain("reveal={terms.length > 0}");
      expect(search).toContain("data-oria-editor-search");
      expect(search).toContain('<svg viewBox="0 0 24 24"');
      expect(toolbarStyles).toContain("[data-oria-editor-accordion] > div[hidden] { display: none !important; }");
      expect(toolbarStyles).toContain("[data-oria-editor-field-kind=color] { grid-template-columns: minmax(0, 1fr) auto");
      expect(toolbarStyles).toContain("[data-oria-editor-search]:focus-within");
      expect(toolbarStyles).toContain("[data-oria-editor-controls] { gap: .75rem");
      expect(toolbarStyles).toContain("[data-oria-editor-palette-search]:focus-within");
      expect(toolbarStyles).toContain("[data-oria-editor-gradient-preview]");
      const gradient = readFileSync(resolve(root, "registry/templates/react/theme-editor/fields/gradient-field.tsx"), "utf8");
      expect(gradient).toContain("data-oria-editor-gradient-preview");
      expect(gradient).toContain("data-oria-editor-gradient-markers");
      expect(gradient).toContain("data-oria-editor-gradient-stop");
      expect(gradient).toContain("Gradient angle");
      expect(gradient).toContain('aria-label="Gradient type"');
      expect(gradient).toContain('"repeating-linear"');
      expect(gradient).toContain('"repeating-radial"');
      expect(gradient).toContain("conic-gradient");
      expect(gradient).toContain("data-oria-editor-gradient-geometry");
      expect(gradient).toContain("data-oria-editor-gradient-origin-grid");
      expect(gradient).toContain("Gradient origin X");
      expect(gradient).toContain('value: "top left"');
      expect(toolbarStyles).toContain("[data-oria-editor-gradient-coordinate]");
      expect(gradient).toContain("BaseColorPalette");
      expect(gradient).toContain('type="color"');
      expect(gradient).toContain("-base-colors");
      expect(gradient).toContain("data-oria-editor-gradient-unset");
      expect(gradient).toContain("session.removeToken");
      expect(gradient).not.toContain("JSON.parse");
      const pattern = readFileSync(resolve(root, "registry/templates/react/theme-editor/fields/pattern-field.tsx"), "utf8");
      expect(pattern).toContain("data-oria-editor-pattern-preview");
      expect(pattern).toContain("BaseColorPalette");
      expect(pattern).toContain("Add a pattern layer");
      expect(pattern).toContain("Move pattern layer");
      expect(pattern).toContain("first is on top");
      expect(pattern).toContain('"stripe"');
      expect(pattern).toContain('"grid"');
      expect(pattern).toContain('"noise"');
      expect(pattern).toContain("Grain size");
      expect(pattern).toContain("EditorSelect");
      expect(pattern).toContain("useFieldBuffer");
      expect(pattern).toContain("colorBuffer.setText");
      expect(toolbarStyles).toContain("[data-oria-editor-select] > select");
      expect(pattern).toContain("session.removeToken");
    } else {
      const vueStyles = readFileSync(resolve(root, "registry/templates/vue/theme-editor/theme-editor.css"), "utf8");
      const vueShell = readFileSync(resolve(root, "registry/templates/vue/theme-editor/EditorShell.vue"), "utf8");
      const vueThemes = readFileSync(resolve(root, "registry/templates/vue/theme-editor/ThemesWorkspace.vue"), "utf8");
      const vueGradient = readFileSync(resolve(root, "registry/templates/vue/theme-editor/fields/GradientField.vue"), "utf8");
      const vuePattern = readFileSync(resolve(root, "registry/templates/vue/theme-editor/fields/PatternField.vue"), "utf8");
      const vuePalette = readFileSync(resolve(root, "registry/templates/vue/theme-editor/fields/BaseColorPalette.vue"), "utf8");
      expect(item.dependencies).toContain("@oriatheme/colors@^0.1.0");
      expect(targets).toContain("ThemesWorkspace.vue");
      expect(targets).toContain("fields/BaseColorPalette.vue");
      expect(targets).toContain("fields/LinearSlider.vue");
      expect(targets).toContain("fields/EditorSelect.vue");
      expect(targets).toContain("fields/PatternField.vue");
      expect(targets).toContain("overlays/ConfirmationDialog.vue");
      expect(vueShell).toContain("previewFollowsAppearance ? undefined : currentMode.value");
      expect(vueShell).toContain('addEventListener("beforeunload"');
      expect(vueThemes).toContain("duplicateTheme");
      expect(vueThemes).toContain("removeCustomTheme");
      expect(vueGradient).toContain('"repeating-linear"');
      expect(vueGradient).toContain("BaseColorPalette");
      expect(vueGradient).not.toContain("JSON.parse");
      expect(vuePattern).toContain("data-oria-editor-pattern-preview");
      expect(vuePattern).toContain('"noise"');
      expect(vuePattern).toContain("Grain size");
      expect(vuePattern).toContain("EditorSelect");
      expect(vuePattern).toContain("colorBuffers");
      expect(vuePattern).toContain("updateColorBuffer");
      expect(vueStyles).toContain("[data-oria-editor-select] > select");
      expect(vuePattern).toContain("session.removeToken");
      expect(vuePalette).toContain("oriaColorFamilies");
      expect(vuePalette).toContain('<Teleport to="body">');
      expect(vueStyles).toContain("--oria-editor-weight-semibold: var(--oria-typography-weight-semibold)");
      expect(vueStyles).toContain("--oria-editor-overlay: color-mix(in srgb, var(--oria-color-overlay) calc(var(--oria-effect-opacity-overlay) * 100%), transparent)");
      expect(vueStyles.match(/background: var\(--oria-editor-overlay\)/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
      expect(vueStyles).toContain("--oria-editor-backdrop-lg: var(--oria-effect-backdropBlur-lg)");
      expect(vueStyles).toContain("blur(var(--oria-editor-backdrop-xl))");
      expect(vueStyles).not.toMatch(/font-weight:\s*(?:620|650|680|760)/);
      expect(vueStyles).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|cubic-bezier\(|system-ui|Segoe UI/i);
      expect(vueStyles).not.toMatch(/font-size:\s*[0-9.]|line-height:\s*[0-9.]|letter-spacing:\s*-?[0-9.]/);
      expect(vueStyles).toContain("[data-oria-editor-duration-preview]");
    }
  });

  it("keeps React and Vue registry chrome styles synchronized", () => {
    const reactStyles = readFileSync(
      resolve(root, "registry/templates/react/theme-editor/theme-editor.css"),
      "utf8",
    );
    const vueStyles = readFileSync(
      resolve(root, "registry/templates/vue/theme-editor/theme-editor.css"),
      "utf8",
    );

    expect(vueStyles).toBe(reactStyles);
  });

  it("keeps installed React and Next pattern editor sources synchronized with the registry", () => {
    const registryStyles = readFileSync(resolve(root, "registry/templates/react/theme-editor/theme-editor.css"), "utf8");
    const registryField = readFileSync(resolve(root, "registry/templates/react/theme-editor/fields/pattern-field.tsx"), "utf8");
    const registryGradient = readFileSync(resolve(root, "registry/templates/react/theme-editor/fields/gradient-field.tsx"), "utf8");
    const registrySelect = readFileSync(resolve(root, "registry/templates/react/theme-editor/fields/editor-select.tsx"), "utf8");
    const reactStyles = readFileSync(resolve(root, "apps/examples/react/src/components/oria-theme-editor/theme-editor.css"), "utf8");
    const nextStyles = readFileSync(resolve(root, "apps/examples/next/app/components/oria-theme-editor/theme-editor.css"), "utf8");
    const reactField = readFileSync(resolve(root, "apps/examples/react/src/components/oria-theme-editor/fields/pattern-field.tsx"), "utf8");
    const nextField = readFileSync(resolve(root, "apps/examples/next/app/components/oria-theme-editor/fields/pattern-field.tsx"), "utf8");
    const reactGradient = readFileSync(resolve(root, "apps/examples/react/src/components/oria-theme-editor/fields/gradient-field.tsx"), "utf8");
    const nextGradient = readFileSync(resolve(root, "apps/examples/next/app/components/oria-theme-editor/fields/gradient-field.tsx"), "utf8");
    const reactSelect = readFileSync(resolve(root, "apps/examples/react/src/components/oria-theme-editor/fields/editor-select.tsx"), "utf8");
    const nextSelect = readFileSync(resolve(root, "apps/examples/next/app/components/oria-theme-editor/fields/editor-select.tsx"), "utf8");

    expect(reactStyles).toBe(registryStyles);
    expect(nextStyles).toBe(registryStyles);
    expect(reactField).toBe(registryField);
    expect(nextField).toBe(registryField);
    expect(reactGradient).toBe(registryGradient);
    expect(nextGradient).toBe(registryGradient);
    expect(reactSelect).toBe(registrySelect);
    expect(nextSelect).toBe(registrySelect);
  });

  it("keeps the example token gallery comprehensive and theme-driven", () => {
    const styles = readFileSync(resolve(root, "apps/examples/styles.css"), "utf8");
    const reactShowcase = readFileSync(resolve(root, "apps/examples/react/src/token-showcase.tsx"), "utf8");
    const nextShowcase = readFileSync(resolve(root, "apps/examples/next/app/token-showcase.tsx"), "utf8");
    const vueShowcase = readFileSync(resolve(root, "apps/examples/vue/src/token-showcase.ts"), "utf8");
    for (const source of [reactShowcase, nextShowcase, vueShowcase]) {
      expect(source).toContain("Font Families, Weight & Type Scale");
      expect(source).toContain("effect.backdropBlur");
      expect(source).toContain("motion.easing");
      expect(source).toContain("elevation.shadow");
      expect(source).toContain("gradient.background");
      expect(source).toContain("pattern.background");
      expect(source).toContain("pattern.surface");
      expect(source).toContain("pattern-preview-samples");
      expect(source).toContain("data-pattern");
      expect(source).toContain("stripe");
      expect(source).toContain("grid");
      expect(source).toContain("noise");
      expect(source).toContain("Semantic & Feedback Color");
      expect(source).toContain("color.secondaryHover");
      expect(source).toContain("color.selectionForeground");
      expect(source).toContain("color.chart1");
      expect(source).toContain("chart-donut");
      expect(source).toContain("ORIA THEME");
      expect(source).not.toContain("ORiA THEME");
      expect(source).toContain("easing-curve-preview");
    }
    expect(styles).toContain("::selection");
    expect(styles).toContain("var(--oria-color-selectionForeground)");
    expect(styles).toContain(".backdrop-scale b");
    expect(styles).toContain("var(--oria-effect-backdropSaturation)");
    expect(styles).toContain(".pattern-preview-samples");
    expect(styles).toContain("var(--oria-pattern-surface, none)");
    expect(styles).toContain("var(--oria-pattern-background, none)");
    expect(styles).toContain("var(--oria-motion-duration-slow)");
    expect(styles).toContain(".color-pair-ring i");
    expect(styles).toContain(".chart-swatch:nth-child(8) i");
    expect(styles).toContain("conic-gradient(var(--oria-color-chart1)");
    expect(styles).toContain("var(--oria-pattern-surface, none), var(--oria-color-surfaceRaised)");
    expect(styles).toContain(".project-card { grid-column: span 7; display: flex; min-height: 21rem; flex-direction: column; justify-content: space-between; background: var(--oria-pattern-surface, none), var(--oria-gradient-surface");
    expect(styles).toContain("var(--oria-gradient-background, var(--oria-color-background))");
    expect(styles).toContain(".actions button { padding: 0 var(--oria-control-paddingInline-md); border: 0; color: var(--oria-color-primaryForeground); background: var(--oria-gradient-accent, var(--oria-color-primary)); }");
    expect(styles).toContain(".font-size-scale > div:nth-child(13)");
    expect(styles).toContain("@keyframes token-easing-value");
    expect(styles).toContain(".people-card .search-control input { padding-inline-start: calc(var(--oria-spacing-3) + var(--oria-typography-size-xl) + var(--oria-spacing-2)); }");
    expect(styles).toContain('.topbar:has(.theme-picker[data-open="true"])');
    expect(styles).toContain('.controls:has(.theme-picker[data-open="true"])');
    expect(styles).toContain("pointer-events: none");
    expect(styles).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|cubic-bezier\(/i);
  });

  it("keeps slider ranges stable, semantic, and contract-valid", () => {
    const script = 'import { dimensionSliderRange, durationSliderRange, fontWeightSliderRange, numberSliderRange } from "../../registry/templates/react/theme-editor/fields/slider-ranges.ts"; console.log(JSON.stringify({lineHeight:numberSliderRange("typography.lineHeight.normal"),density:numberSliderRange("spacing.density",.75,1.25),spacing:dimensionSliderRange("spacing.16","rem"),typeSize:dimensionSliderRange("typography.size.9xl","rem"),letterSpacing:dimensionSliderRange("typography.letterSpacing.tight","em"),radius:dimensionSliderRange("shape.radius.4xl","rem"),blur:dimensionSliderRange("effect.blur.3xl","px"),fullRadius:dimensionSliderRange("shape.radius.full","px") ?? null,duration:durationSliderRange,fontWeight:fontWeightSliderRange}));';
    const ranges = JSON.parse(execFileSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", script], { cwd: resolve(root, "packages/editor-core"), encoding: "utf8" })) as Record<string, unknown>;
    expect(ranges).toEqual({
      lineHeight: { minimum: .8, maximum: 2.4, step: .01 },
      density: { minimum: .75, maximum: 1.25, step: .01 },
      spacing: { minimum: 0, maximum: 8, step: .025 },
      typeSize: { minimum: .5, maximum: 10, step: .025 },
      letterSpacing: { minimum: -.12, maximum: .2, step: .005 },
      radius: { minimum: 0, maximum: 8, step: .025 },
      blur: { minimum: 0, maximum: 128, step: .5 },
      fullRadius: null,
      duration: { minimum: 0, maximum: 1000, step: 10 },
      fontWeight: { minimum: 100, maximum: 900, step: 100 }
    });
    const dimension = readFileSync(resolve(root, "registry/templates/react/theme-editor/fields/dimension-field.tsx"), "utf8");
    const duration = readFileSync(resolve(root, "registry/templates/react/theme-editor/fields/duration-field.tsx"), "utf8");
    expect(dimension).not.toContain("amount * 2");
    expect(duration).not.toContain("milliseconds * 2");
  });

  it("keeps framework packages headless", () => {
    for (const framework of ["react", "vue"] as const) {
      const packageJson = JSON.parse(readFileSync(resolve(root, `packages/${framework}-editor/package.json`), "utf8")) as { readonly exports: Record<string, unknown> };
      const source = readFileSync(resolve(root, `packages/${framework}-editor/src/index.${framework === "react" ? "tsx" : "ts"}`), "utf8");
      expect(packageJson.exports["./styles.css"]).toBeUndefined();
      expect(source).not.toContain("export function OriaThemeEditor");
    }
  });
});

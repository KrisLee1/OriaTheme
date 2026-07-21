import { cloneTheme, oriaDefaultTheme } from "@oriatheme/core";
import type { ThemeDefinition, TokenPath } from "@oriatheme/core";
import { createOriaThemeRuntime } from "@oriatheme/runtime-dom";
import { describe, expect, it } from "vitest";
import { createThemeEditorIdentity, createThemeEditorSession, deriveSmartScale, describeTokenContract, getTokenModeScope, preserveScaleOverrides } from "../src/index.js";

const runtime = (): ReturnType<typeof createOriaThemeRuntime> => createOriaThemeRuntime({ presets: [oriaDefaultTheme], defaultThemeId: "oria-default", storage: false });
const primaryPath = "color.primary" as TokenPath;

describe("ThemeEditorSession", () => {
  it("creates an available custom identity for each preset editing session", () => {
    expect(createThemeEditorIdentity(oriaDefaultTheme, [])).toEqual({ id: "oria-default-editor", name: "Default custom" });
    expect(createThemeEditorIdentity(oriaDefaultTheme, [
      { id: "oria-default-editor" },
      { id: "oria-default-editor-2" }
    ])).toEqual({ id: "oria-default-editor-3", name: "Default custom 3" });
  });

  it("saves a preset draft when an earlier generated custom identity already exists", () => {
    const target = runtime();
    target.createCustomTheme({ theme: cloneTheme(oriaDefaultTheme, { id: "oria-default-editor", name: "Earlier edit" }) });
    const identity = createThemeEditorIdentity(oriaDefaultTheme, [...target.getSnapshot().presets, ...target.getSnapshot().customThemes]);
    const session = createThemeEditorSession({ source: oriaDefaultTheme, identity });
    session.setToken("light", primaryPath, "#7c3aed");

    expect(session.save(target)).toMatchObject({ ok: true, theme: { id: "oria-default-editor-2" } });
  });

  it("materializes a preset as a custom draft and only persists on explicit save", () => {
    const target = runtime();
    const session = createThemeEditorSession({ source: oriaDefaultTheme, identity: { id: "editor-copy", name: "Editor copy" } });
    expect(session.getSnapshot().draft.kind).toBe("custom");
    session.setToken("light", primaryPath, "#7c3aed");
    expect(target.getSnapshot().customThemes).toHaveLength(0);
    const saved = session.save(target);
    expect(saved.ok).toBe(true);
    expect(target.getSnapshot().customThemes.map(theme => theme.id)).toEqual(["editor-copy"]);
  });

  it("keeps invalid drafts in memory, maps issues, and refuses preview or save", () => {
    const target = runtime();
    const session = createThemeEditorSession({ source: oriaDefaultTheme, identity: { id: "invalid-copy", name: "Invalid copy" } });
    session.setToken("dark", primaryPath, "not-a-color");
    expect(session.getSnapshot().issues.some(issue => issue.path === "modes.dark.color.primary")).toBe(true);
    expect(session.preview(target).ok).toBe(false);
    expect(session.save(target)).toMatchObject({ ok: false, reason: "validation" });
  });

  it("resets fields and modes without discarding the other mode", () => {
    const session = createThemeEditorSession({ source: oriaDefaultTheme, identity: { id: "reset-copy", name: "Reset copy" } });
    const radiusPath = "shape.radius.md" as TokenPath;
    session.setToken("light", primaryPath, "#7c3aed");
    session.setToken("dark", primaryPath, "#f59e0b");
    session.setToken("dark", radiusPath, "2rem");
    expect(session.getSnapshot().draft.modes.light[radiusPath]).toBe("2rem");
    session.resetToken("light", primaryPath);
    expect(session.getSnapshot().draft.modes.light[primaryPath]).toBe(oriaDefaultTheme.modes.light[primaryPath]);
    expect(session.getSnapshot().draft.modes.dark[primaryPath]).toBe("#f59e0b");
    session.resetMode("dark");
    expect(session.getSnapshot().draft.modes.dark[primaryPath]).toBe(oriaDefaultTheme.modes.dark[primaryPath]);
    expect(session.getSnapshot().draft.modes.light[radiusPath]).toBe("2rem");
    expect(session.getSnapshot().draft.modes.dark[radiusPath]).toBe("2rem");
    session.resetToken("dark", radiusPath);
    expect(session.getSnapshot().draft.modes.light[radiusPath]).toBe(oriaDefaultTheme.modes.light[radiusPath]);
    expect(session.getSnapshot().draft.modes.dark[radiusPath]).toBe(oriaDefaultTheme.modes.light[radiusPath]);
  });

  it("removes an optional token to its unset state and can restore the session baseline", () => {
    const gradientPath = "gradient.surface" as TokenPath;
    const gradient = { type: "linear", angle: 135, stops: [{ color: "#ffffff", position: 0 }, { color: "#dbeafe", position: 100 }] } as const;
    const source: ThemeDefinition = {
      ...cloneTheme(oriaDefaultTheme, { id: "remove-copy", name: "Remove copy" }),
      modes: {
        light: { ...oriaDefaultTheme.modes.light, [gradientPath]: gradient },
        dark: { ...oriaDefaultTheme.modes.dark, [gradientPath]: gradient }
      }
    };
    const session = createThemeEditorSession({ source });
    const originalLight = session.getSnapshot().draft.modes.light[gradientPath];
    const originalDark = session.getSnapshot().draft.modes.dark[gradientPath];
    expect(originalLight).toBeDefined();

    const originalPrimary = session.getSnapshot().draft.modes.light[primaryPath];
    session.removeToken("light", primaryPath);
    expect(session.getSnapshot().draft.modes.light[primaryPath]).toBe(originalPrimary);
    expect(session.getSnapshot().revision).toBe(0);

    session.removeToken("light", gradientPath);
    expect(session.getSnapshot().draft.modes.light[gradientPath]).toBeUndefined();
    expect(session.getSnapshot().draft.modes.dark[gradientPath]).toEqual(originalDark);
    expect(session.getSnapshot().revision).toBe(1);
    expect(session.getSnapshot().issues).toEqual([]);

    session.resetToken("light", gradientPath);
    expect(session.getSnapshot().draft.modes.light[gradientPath]).toEqual(originalLight);
    expect(session.getSnapshot().revision).toBe(2);
  });

  it("returns a conflict rather than silently overwriting an externally changed custom theme", () => {
    const target = runtime();
    const custom = cloneTheme(oriaDefaultTheme, { id: "conflict-copy", name: "Conflict copy" }, { now: () => 1 });
    target.createCustomTheme({ theme: custom });
    const session = createThemeEditorSession({ source: custom });
    session.setName("Local draft");
    target.updateCustomTheme(custom.id, { name: "External update" });
    expect(session.save(target)).toMatchObject({ ok: false, reason: "conflict", currentTheme: { name: "External update" } });
  });

  it("imports a different theme into a custom session as a new custom theme", () => {
    const target = runtime();
    const existing = cloneTheme(oriaDefaultTheme, { id: "existing-copy", name: "Existing copy" });
    const imported = cloneTheme(oriaDefaultTheme, { id: "imported-copy", name: "Imported copy" });
    target.createCustomTheme({ theme: existing });
    const session = createThemeEditorSession({ source: existing });

    expect(session.replaceFromJson(JSON.stringify(imported)).ok).toBe(true);
    expect(session.save(target)).toMatchObject({ ok: true, theme: { id: "imported-copy", name: "Imported copy" } });
  });

  it("creates a safe custom identity when an imported theme collides with a preset", () => {
    const target = runtime();
    const session = createThemeEditorSession({ source: oriaDefaultTheme, identity: { id: "import-copy", name: "Import copy" } });

    expect(session.replaceFromJson(JSON.stringify(oriaDefaultTheme)).ok).toBe(true);
    expect(session.save(target)).toMatchObject({ ok: true, theme: { id: "oria-default-editor" } });
  });

  it("exports, previews, and releases its active preview when destroyed", () => {
    const target = runtime();
    const session = createThemeEditorSession({ source: oriaDefaultTheme, identity: { id: "import-copy", name: "Import copy" } });
    const replaced = session.replaceFromJson(session.exportJson());
    expect(replaced.ok).toBe(true);
    const preview = session.preview(target, "dark");
    expect(preview.ok).toBe(true);
    session.destroy();
    expect(target.getSnapshot().resolvedTheme.themeId).toBe("oria-default");
  });

  it("describes every contract field once in stable order", () => {
    const fields = describeTokenContract();
    expect(fields).toHaveLength(new Set(fields.map(field => field.path)).size);
    expect(fields.find(field => field.path === primaryPath)).toMatchObject({ type: "color", label: "Primary", modeScope: "mode" });
    expect(fields.find(field => field.path === "control.height.sm")).toMatchObject({ label: "Height Sm", modeScope: "shared" });
    expect(fields.find(field => field.path === "control.paddingInline.sm")).toMatchObject({ label: "Horizontal padding Sm", modeScope: "shared" });
    expect(fields.find(field => field.path === "typography.lineHeight.normal")).toMatchObject({ modeScope: "shared" });
    expect(fields.find(field => field.path === "elevation.shadow.md")).toMatchObject({ modeScope: "mode" });
    expect(fields.find(field => field.path === "pattern.background")).toMatchObject({ label: "Background", modeScope: "mode" });
    expect(getTokenModeScope("app.custom" as TokenPath)).toBe("mode");
    expect(fields.some(field => field.type === "gradient")).toBe(true);
  });

  it("materializes one canonical value when a legacy draft has divergent shared tokens", () => {
    const radiusPath = "shape.radius.md" as TokenPath;
    const legacy = {
      ...cloneTheme(oriaDefaultTheme, { id: "legacy-copy", name: "Legacy copy" }),
      modes: {
        light: { ...oriaDefaultTheme.modes.light, [radiusPath]: "1rem" },
        dark: { ...oriaDefaultTheme.modes.dark, [radiusPath]: "2rem" }
      }
    };
    const session = createThemeEditorSession({ source: legacy });
    expect(session.getSnapshot().draft.modes.light[radiusPath]).toBe("1rem");
    expect(session.getSnapshot().draft.modes.dark[radiusPath]).toBe("1rem");
    expect(session.getSnapshot().dirty).toBe(false);
  });

  it("derives deterministic scales and applies all leaves in one revision", () => {
    const session = createThemeEditorSession({ source: oriaDefaultTheme, identity: { id: "scale-copy", name: "Scale copy" } });
    const scale = deriveSmartScale({ kind: "radius", base: "1rem" });
    session.setTokens("light", scale);
    expect(session.getSnapshot().revision).toBe(1);
    expect(session.getSnapshot().draft.modes.light["shape.radius.2xl" as TokenPath]).toBe("3rem");
    expect(session.getSnapshot().draft.modes.dark["shape.radius.2xl" as TokenPath]).toBe("3rem");
    expect(session.getSnapshot().draft.modes.light["shape.radius.4xl" as TokenPath]).toBe("5rem");
    expect(session.getSnapshot().draft.modes.light["shape.radius.full" as TokenPath]).toBe("9999px");

    const weights = deriveSmartScale({ kind: "fontWeight", base: 400 });
    expect(weights).toHaveLength(9);
    expect(weights.find(entry => entry.path === "typography.weight.thin")?.value).toBe("100");
    expect(weights.find(entry => entry.path === "typography.weight.black")?.value).toBe("900");
  });

  it("keeps customized scale leaves while recomputing linked values", () => {
    const customizedPath = "effect.blur.lg" as TokenPath;
    const current = { [customizedPath]: "40px" } as Readonly<Record<TokenPath, string>>;
    const next = preserveScaleOverrides(deriveSmartScale({ kind: "blur", base: "10px" }), current, new Set([customizedPath]));
    expect(next.find(entry => entry.path === customizedPath)?.value).toBe("40px");
    expect(next.find(entry => entry.path === "effect.blur.xl")?.value).toBe("25px");
    expect(next.find(entry => entry.path === "effect.blur.xs")?.value).toBe("2.5px");
    expect(next.find(entry => entry.path === "effect.blur.3xl")?.value).toBe("64px");
    expect(next.find(entry => entry.path === "effect.backdropBlur.sm")?.value).toBe("10px");
    expect(next.find(entry => entry.path === "effect.backdropBlur.xl")?.value).toBe("35px");
    expect(next.find(entry => entry.path === "effect.backdropBlur.3xl")?.value).toBe("80px");
  });
});

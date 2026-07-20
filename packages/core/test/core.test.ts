import { describe, expect, it } from "vitest";
import { analyzeTheme, cloneTheme, colorToken, createThemeFromSeed, defineTokenContract, exportTheme, importTheme, oriaDefaultTheme, oriaStandardContract, resolveTheme, validateTheme } from "../src/index.js";
import type { GradientDefinition, ThemeDefinition, TokenPath } from "../src/index.js";

describe("standard contract and preset", () => {
  it("covers the required design-language categories and resolves in Node", () => {
    expect(Object.keys(oriaStandardContract.tokens)).toContain("gradient.accent");
    expect(Object.keys(oriaStandardContract.tokens)).toContain("motion.easing.emphasized");
    expect(Object.keys(oriaStandardContract.tokens)).toContain("color.chart8");
    expect(oriaStandardContract.version).toBe(1);
    expect(Object.keys(oriaStandardContract.tokens)).toHaveLength(152);
    expect(Object.keys(oriaStandardContract.tokens).some(path => path.startsWith("palette."))).toBe(false);
    const result = resolveTheme(oriaDefaultTheme, "light");
    expect(result.variables["--oria-color-background"]).toBe("#f1f3f4");
    expect(result.variables["--oria-color-primary"]).toBe("#35bff0");
    expect(result.variables["--oria-shape-radius-2xl"]).toBe("2rem");
    expect(result.variables["--oria-shape-radius-4xl"]).toBe("4rem");
    expect(result.variables["--oria-typography-size-9xl"]).toBe("8rem");
    expect(result.variables["--oria-typography-lineHeight-loose"]).toBe("2");
    expect(result.variables["--oria-typography-letterSpacing-widest"]).toBe("0.1em");
    expect(result.variables["--oria-typography-weight-thin"]).toBe("100");
    expect(result.variables["--oria-typography-weight-black"]).toBe("900");
    expect(result.variables["--oria-effect-backdropBlur-sm"]).toBe("8px");
    expect(result.variables["--oria-effect-backdropBlur-lg"]).toBe("20px");
    expect(result.variables["--oria-effect-backdropBlur-xl"]).toBe("28px");
    expect(result.variables["--oria-effect-blur-xs"]).toBe("2px");
    expect(result.variables["--oria-effect-blur-3xl"]).toBe("64px");
    expect(result.variables["--oria-effect-backdropBlur-xs"]).toBe("4px");
    expect(result.variables["--oria-effect-backdropBlur-3xl"]).toBe("64px");
    expect(result.variables["--oria-elevation-shadow-2xs"]).toContain("0 1px 2px -1px");
    expect(result.variables["--oria-elevation-shadow-md"]).toContain("0 14px 34px");
    expect(result.variables["--oria-elevation-shadow-md"]!.split(",")).toHaveLength(1);
    expect(result.variables["--oria-elevation-shadow-highlight"]!.split(",")).toHaveLength(4);
    expect(Object.keys(result.variables).some(variable => variable.startsWith("--oria-palette-"))).toBe(false);
  });

  it("has no blocking validation errors or AA body-text warnings", () => {
    const diagnostics = analyzeTheme(oriaDefaultTheme, oriaStandardContract);
    expect(diagnostics.errors).toEqual([]);
    expect(diagnostics.warnings).toEqual([]);
  });

  it("uses a coordinated Oria color-library palette for default feedback and charts", () => {
    const feedbackKeys = ["destructive", "success", "warning", "info"] as const;
    const chartKeys = Array.from({ length: 8 }, (_, index) => `--oria-color-chart${index + 1}` as `--${string}`);
    const light = resolveTheme(oriaDefaultTheme, "light").variables;
    const dark = resolveTheme(oriaDefaultTheme, "dark").variables;

    expect(feedbackKeys.map(key => light[`--oria-color-${key}`])).toEqual(["#d53740", "#1f9058", "#c15701", "#1982bd"]);
    expect(feedbackKeys.map(key => dark[`--oria-color-${key}`])).toEqual(["#f46767", "#56b17c", "#fba171", "#52a4db"]);
    expect(chartKeys.map(key => light[key])).toEqual(["#35bff0", "#1982bd", "#1c8c85", "#1f9058", "#3675e2", "#626bdc", "#d53740", "#c15701"]);
    expect(chartKeys.map(key => dark[key])).toEqual(["#4cc8f5", "#52a4db", "#4caea6", "#56b17c", "#5f99fe", "#8390f8", "#f46767", "#fba171"]);
  });

  it("compiles every structured gradient type to browser-valid CSS custom-property values", () => {
    const surfacePath = "gradient.surface" as TokenPath;
    const stops = [{ color: "#ffffff", position: 0 }, { color: "#000000", position: 40 }] as const;
    const cases: readonly (readonly [GradientDefinition, string])[] = [
      [{ type: "linear", angle: 45, stops }, "linear-gradient(45deg, #ffffff 0%, #000000 40%)"],
      [{ type: "repeating-linear", angle: 45, stops }, "repeating-linear-gradient(45deg, #ffffff 0%, #000000 40%)"],
      [{ type: "radial", position: "top left", stops }, "radial-gradient(circle at top left, #ffffff 0%, #000000 40%)"],
      [{ type: "repeating-radial", position: { x: 25, y: 70 }, stops }, "repeating-radial-gradient(circle at 25% 70%, #ffffff 0%, #000000 40%)"],
      [{ type: "conic", angle: 30, position: "bottom right", stops }, "conic-gradient(from 30deg at bottom right, #ffffff 0%, #000000 40%)"]
    ];

    for (const [gradient, expected] of cases) {
      const theme: ThemeDefinition = {
        ...oriaDefaultTheme,
        modes: {
          light: { ...oriaDefaultTheme.modes.light, [surfacePath]: gradient },
          dark: { ...oriaDefaultTheme.modes.dark, [surfacePath]: gradient }
        }
      };
      expect(resolveTheme(theme, "light").variables["--oria-gradient-surface"]).toBe(expected);
    }
  });
});

describe("contracts and validation", () => {
  const contract = defineTokenContract({ name: "test-contract", version: 1, tokens: { "color.base": colorToken({ required: true, description: "base" }), "color.alias": colorToken({ required: true, description: "alias" }) } });
  const base = (tokens: Record<string, unknown>): ThemeDefinition => ({ schemaVersion: 1, contract: { name: "test-contract", version: 1 }, id: "test-theme", name: "Test", kind: "custom", modes: { light: tokens as Record<TokenPath, never>, dark: tokens as Record<TokenPath, never> } });

  it("reports missing values as structured issues without a partial result", () => {
    const result = validateTheme(base({ "color.base": "#ffffff" }), contract);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues.some(problem => problem.path === "modes.light.color.alias")).toBe(true);
  });

  it("rejects a contract default that violates its declared type", () => {
    expect(() => defineTokenContract({ name: "invalid-default", version: 1, tokens: { "spacing.unit": { type: "dimension", required: false, description: "unit", default: "url(https://unsafe.example)" } } })).toThrow(expect.objectContaining({ code: "INVALID_CONTRACT" }));
  });

  it("has stable missing-reference, type, and cycle errors", () => {
    const missing = base({ "color.base": { $ref: "color.unknown" }, "color.alias": "#fff" });
    expect(() => resolveTheme(missing, "light", { contract })).toThrow(expect.objectContaining({ code: "TOKEN_REFERENCE_NOT_FOUND" }));
    const cycle = base({ "color.base": { $ref: "color.alias" }, "color.alias": { $ref: "color.base" } });
    expect(() => resolveTheme(cycle, "light", { contract })).toThrow(expect.objectContaining({ code: "TOKEN_REFERENCE_CYCLE" }));
    const mixed = defineTokenContract({ name: "mixed-contract", version: 1, tokens: { "color.base": colorToken({ required: true, description: "base" }), "spacing.unit": { type: "dimension", required: true, description: "unit" } } });
    const mismatched: ThemeDefinition = { schemaVersion: 1, contract: { name: "mixed-contract", version: 1 }, id: "mixed-theme", name: "Mixed", kind: "custom", modes: { light: { "color.base": { $ref: "spacing.unit" as TokenPath }, "spacing.unit": "1rem" } as never, dark: { "color.base": { $ref: "spacing.unit" as TokenPath }, "spacing.unit": "1rem" } as never } };
    expect(() => resolveTheme(mismatched, "light", { contract: mixed })).toThrow(expect.objectContaining({ code: "TOKEN_REFERENCE_TYPE_MISMATCH" }));
  });

  it("rejects unsafe token strings", () => {
    const result = validateTheme(base({ "color.base": "#ffffff; color:red", "color.alias": "#fff" }), contract);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues[0]?.code).toBe("INVALID_TOKEN_VALUE");
  });

  it("validates invalid inputs for every standard token value type", () => {
    const cases: Array<[string, Record<string, unknown>, unknown]> = [
      ["color", { "color.value": { type: "color", required: true, description: "color" } }, "#fff; bad"],
      ["dimension", { "size.value": { type: "dimension", required: true, description: "dimension" } }, "4banana"],
      ["number", { "number.value": { type: "number", required: true, description: "number" } }, Number.NaN],
      ["fontFamily", { "font.value": { type: "fontFamily", required: true, description: "font" } }, ["bad; family"]],
      ["fontWeight", { "weight.value": { type: "fontWeight", required: true, description: "weight" } }, "450"],
      ["duration", { "motion.value": { type: "duration", required: true, description: "duration" } }, "20minutes"],
      ["cubicBezier", { "curve.value": { type: "cubicBezier", required: true, description: "curve" } }, [0, 0, 1]],
      ["shadow", { "shadow.value": { type: "shadow", required: true, description: "shadow" } }, [{ x: "0", y: "0", blur: "0", spread: "0", color: "bad-color" }]],
      ["gradient", { "gradient.value": { type: "gradient", required: true, description: "gradient" } }, { type: "linear", angle: 0, stops: [{ color: "#fff" }] }]
    ];
    for (const [name, tokens, invalid] of cases) {
      const slug = name.toLowerCase();
      const typeContract = defineTokenContract({ name: `type-${slug}`, version: 1, tokens: tokens as never });
      const path = Object.keys(tokens)[0]! as TokenPath;
      const theme: ThemeDefinition = { schemaVersion: 1, contract: { name: `type-${slug}`, version: 1 }, id: `theme-${slug}`, name, kind: "custom", modes: { light: { [path]: invalid } as never, dark: { [path]: invalid } as never } };
      expect(validateTheme(theme, typeContract).ok, name).toBe(false);
    }
  });

  it("rejects incomplete geometry for extended gradient types", () => {
    const gradientContract = defineTokenContract({ name: "gradient-geometry", version: 1, tokens: { "gradient.value": { type: "gradient", required: true, description: "gradient" } } });
    const invalidGradients = [
      { type: "repeating-linear", stops: [{ color: "#fff" }, { color: "#000" }] },
      { type: "repeating-radial", position: "corner", stops: [{ color: "#fff" }, { color: "#000" }] },
      { type: "conic", position: "center", stops: [{ color: "#fff" }, { color: "#000" }] },
      { type: "radial", position: { x: -1, y: 50 }, stops: [{ color: "#fff" }, { color: "#000" }] }
    ];

    for (const [index, gradient] of invalidGradients.entries()) {
      const path = "gradient.value" as TokenPath;
      const theme: ThemeDefinition = { schemaVersion: 1, contract: { name: "gradient-geometry", version: 1 }, id: `invalid-gradient-${index}`, name: "Invalid gradient", kind: "custom", modes: { light: { [path]: gradient } as never, dark: { [path]: gradient } as never } };
      expect(validateTheme(theme, gradientContract).ok).toBe(false);
    }
  });
});

describe("theme lifecycle", () => {
  it("clones deterministically and preserves round-trip visual semantics", () => {
    const clone = cloneTheme(oriaDefaultTheme, { id: "my-copy", name: "My Copy" }, { now: () => 123 });
    expect(clone.kind).toBe("custom");
    expect(clone.createdAt).toBe(123);
    const imported = importTheme(exportTheme(clone), { contract: oriaStandardContract });
    expect(imported.ok).toBe(true);
    if (imported.ok) expect(resolveTheme(imported.theme, "dark").variables).toEqual(resolveTheme(clone, "dark").variables);
  });

  it("renames conflicts and never replaces presets", () => {
    const conflicted = importTheme(exportTheme(oriaDefaultTheme), { contract: oriaStandardContract, existingThemes: [oriaDefaultTheme] });
    expect(conflicted.ok).toBe(false);
    if (!conflicted.ok) expect(conflicted.issues[0]?.code).toBe("PRESET_IMMUTABLE");
    const custom = cloneTheme(oriaDefaultTheme, { id: "custom-a", name: "Custom" }, { now: () => 1 });
    const renamed = importTheme(exportTheme(custom), { contract: oriaStandardContract, existingThemes: [custom] });
    expect(renamed.ok && renamed.theme.id).toBe("custom-a-2");
  });

  it("generates a complete deterministic theme from a seed", () => {
    const seeded = createThemeFromSeed({ color: "#b91c1c" }, { id: "seeded", name: "Seeded", clock: { now: () => 9 } });
    expect(validateTheme(seeded, oriaStandardContract).ok).toBe(true);
    const resolved = resolveTheme(seeded, "light").variables;
    expect(resolved["--oria-color-primary"]).toBe("#b91c1c");
    expect(resolved["--oria-color-border"]).toBe("#ffffffa8");
    expect(resolved["--oria-elevation-shadow-md"]!.split(",")).toHaveLength(1);
  });
});

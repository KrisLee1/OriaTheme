import { describe, expect, it } from "vitest";
import { analyzeTheme, cloneTheme, colorToken, createThemeFromSeed, defineTokenContract, exportTheme, importTheme, migrateOriaStandardV1ToV2, oriaDefaultTheme, oriaDefaultThemeV1, oriaStandardContract, oriaStandardContractV1, resolveTheme, validateTheme } from "../src/index.js";
import type { DotPatternDefinition, GradientDefinition, GridPatternDefinition, NoisePatternDefinition, StripePatternDefinition, ThemeDefinition, TokenPath } from "../src/index.js";

describe("standard contract and preset", () => {
  it("covers the required design-language categories and resolves in Node", () => {
    expect(Object.keys(oriaStandardContract.tokens)).toContain("gradient.accent");
    expect(Object.keys(oriaStandardContract.tokens)).toContain("pattern.bg");
    expect(Object.keys(oriaStandardContract.tokens)).toContain("pattern.surface");
    expect(Object.keys(oriaStandardContract.tokens)).toContain("ease.emphasized");
    expect(Object.keys(oriaStandardContract.tokens)).toContain("color.chart.8");
    expect(oriaStandardContract.version).toBe(2);
    expect(Object.keys(oriaStandardContract.tokens)).toHaveLength(134);
    expect(oriaStandardContract.tokens["control.height.md" as TokenPath]?.output).toBe(false);
    expect(Object.keys(oriaStandardContract.tokens).some(path => path.startsWith("palette."))).toBe(false);
    const result = resolveTheme(oriaDefaultTheme, "light");
    expect(result.variables["--oria-color-bg"]).toBe("#f1f3f4");
    expect(result.variables["--oria-color-primary"]).toBe("#35bff0");
    expect(result.variables["--oria-radius-2xl"]).toBe("1rem");
    expect(result.variables["--oria-radius-4xl"]).toBe("2rem");
    expect(result.variables["--oria-text-9xl"]).toBe("8rem");
    expect(result.variables["--oria-leading-loose"]).toBe("2");
    expect(result.variables["--oria-tracking-widest"]).toBe("0.1em");
    expect(result.variables["--oria-font-weight-thin"]).toBe("100");
    expect(result.variables["--oria-font-weight-black"]).toBe("900");
    expect(result.variables["--oria-backdrop-blur-sm"]).toBe("8px");
    expect(result.variables["--oria-backdrop-blur-lg"]).toBe("20px");
    expect(result.variables["--oria-backdrop-blur-xl"]).toBe("28px");
    expect(result.variables["--oria-blur-xs"]).toBe("4px");
    expect(result.variables["--oria-blur-3xl"]).toBe("64px");
    expect(result.variables["--oria-backdrop-blur-xs"]).toBe("4px");
    expect(result.variables["--oria-backdrop-blur-3xl"]).toBe("64px");
    expect(result.variables["--oria-shadow-2xs"]).toContain("0 1px 2px -1px");
    expect(result.variables["--oria-shadow-md"]).toContain("0 14px 34px");
    expect(result.variables["--oria-shadow-md"]!.split(",")).toHaveLength(1);
    expect(result.variables["--oria-shadow-highlight"]!.split(",")).toHaveLength(4);
    expect(result.variables["--oria-space"]).toBe("0.25rem");
    expect(result.variables["--oria-control-height-md"]).toBe("2.75rem");
    expect(Object.keys(result.variables).some(variable => variable.startsWith("--oria-palette-"))).toBe(false);
    expect(result.variables["--oria-pattern-surface"]).toBeUndefined();
    expect(result.variables["--oria-pattern-bg"]).toBeUndefined();
  });

  it("has no blocking validation errors or AA body-text warnings", () => {
    const diagnostics = analyzeTheme(oriaDefaultTheme, oriaStandardContract);
    expect(diagnostics.errors).toEqual([]);
    expect(diagnostics.warnings).toEqual([]);
  });

  it("uses a coordinated Oria color-library palette for default feedback and charts", () => {
    const feedbackKeys = ["danger", "success", "warning", "info"] as const;
    const chartKeys = Array.from({ length: 8 }, (_, index) => `--oria-color-chart-${index + 1}` as `--${string}`);
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

  it("compiles a validated dot layer as a repeatable CSS background layer", () => {
    const patternPath = "pattern.bg" as TokenPath;
    const pattern: DotPatternDefinition = { type: "dot", color: { $ref: "color.border.strong" as TokenPath }, radius: "0.9px", spacing: "1rem" };
    const theme: ThemeDefinition = {
      ...oriaDefaultTheme,
      modes: {
        light: { ...oriaDefaultTheme.modes.light, [patternPath]: [pattern] },
        dark: { ...oriaDefaultTheme.modes.dark, [patternPath]: [pattern] }
      }
    };
    expect(resolveTheme(theme, "light").variables["--oria-pattern-bg"]).toBe("radial-gradient(circle at center, #cbd2d7 0 0.9px, transparent 0.9px) 0 0 / 1rem 1rem repeat");
  });

  it("compiles ordered angled dot, stripe, and grid pattern layers", () => {
    const dot: DotPatternDefinition = { type: "dot", color: "#123456", radius: "1px", spacing: "12px", angle: 45 };
    const stripe: StripePatternDefinition = { type: "stripe", color: "#123456", stripeWidth: "1px", spacing: "12px", angle: 30 };
    const grid: GridPatternDefinition = { type: "grid", color: "#123456", lineWidth: "1px", spacing: "12px", angle: 30 };
    const theme: ThemeDefinition = {
      ...oriaDefaultTheme,
      modes: {
        light: { ...oriaDefaultTheme.modes.light, "pattern.surface": [dot, stripe, grid] } as never,
        dark: { ...oriaDefaultTheme.modes.dark, "pattern.surface": [dot, stripe, grid] } as never
      }
    };
    const variables = resolveTheme(theme, "light").variables;
    const surface = variables["--oria-pattern-surface"]!;
    expect(surface).toContain("patternTransform%3D%22rotate(45)%22");
    expect(surface).toContain("repeating-linear-gradient(30deg, #123456 0 1px, transparent 1px 12px)");
    expect(surface).toContain("repeating-linear-gradient(120deg, #123456 0 1px, transparent 1px 12px)");
    expect(surface.indexOf("patternTransform")).toBeLessThan(surface.indexOf("repeating-linear-gradient(30deg"));
  });

  it("compiles deterministic paper fibers and preserves film and frosted grain layers", () => {
    const paper: NoisePatternDefinition = { type: "noise", variant: "paper", color: "#123456", tileSize: "48px", intensity: 0.12 };
    const film: NoisePatternDefinition = { type: "noise", variant: "film", color: "#654321", tileSize: "32px", intensity: 0.18 };
    const frosted: NoisePatternDefinition = { type: "noise", variant: "frosted", color: "#abcdef", tileSize: "64px", intensity: 0.08 };
    const theme: ThemeDefinition = { ...oriaDefaultTheme, modes: { light: { ...oriaDefaultTheme.modes.light, "pattern.surface": [paper, film, frosted] } as never, dark: { ...oriaDefaultTheme.modes.dark, "pattern.surface": [paper, film, frosted] } as never } };
    const surface = resolveTheme(theme, "light").variables["--oria-pattern-surface"]!;
    expect(surface).toContain("feTurbulence");
    expect(surface).toContain("baseFrequency%3D%220.18%22");
    expect(surface).toContain("data-oria-paper%3D%22specks%22");
    expect(surface).toContain("data-oria-paper%3D%22fibers%22");
    expect(surface).toContain("stroke-linecap%3D%22round%22");
    expect(surface).toContain("baseFrequency%3D%220.92%22");
    expect(surface).toContain("baseFrequency%3D%220.38%22");
    expect(surface).toContain('") 0 0 / 48px 48px repeat');
  });
});

describe("legacy v1 contract and migration", () => {
  it("keeps the published v1 contract available for migration inputs", () => {
    expect(oriaStandardContractV1.version).toBe(1);
    expect(Object.keys(oriaStandardContractV1.tokens)).toHaveLength(154);
    expect(oriaDefaultThemeV1.contract).toEqual({ name: "oria-standard", version: 1 });
    const variables = resolveTheme(oriaDefaultThemeV1, "light", { contract: oriaStandardContractV1 }).variables;
    expect(variables["--oria-color-background"]).toBe("#f1f3f4");
    expect(variables["--oria-shape-radius-2xl"]).toBe("2rem");
  });

  it("requires explicit migration before a v1 export imports as v2", () => {
    const v1 = { ...oriaDefaultThemeV1, id: "v1-custom", kind: "custom" as const };
    expect(importTheme(exportTheme(v1), { contract: oriaStandardContract }).ok).toBe(false);
    const result = importTheme(exportTheme(v1), { contract: oriaStandardContract, migrate: migrateOriaStandardV1ToV2 });
    expect(result.ok).toBe(true);
    if (result.ok) { expect(result.theme.contract.version).toBe(2); expect(result.requiresReview).toBe(true); }
  });

  it("migrates a v1 theme into a valid v2 theme without partial output", () => {
    const result = migrateOriaStandardV1ToV2(oriaDefaultThemeV1);
    expect(result.theme.contract).toEqual({ name: "oria-standard", version: 2 });
    expect(validateTheme(result.theme, oriaStandardContract).ok).toBe(true);
    expect(result.requiresReview).toBe(true);
    const variables = resolveTheme(result.theme, "light", { contract: oriaStandardContract }).variables;
    expect(variables["--oria-color-bg"]).toBe("#f1f3f4");
    expect(variables["--oria-text-md"]).toBe("1rem");
    expect(variables["--oria-radius-lg"]).toBeDefined();
  });

  it("persists only source tokens in theme JSON, with integer control multipliers", () => {
    const exported = JSON.parse(exportTheme(oriaDefaultTheme)) as ThemeDefinition;
    const sourcePaths = new Set(Object.keys(oriaStandardContract.tokens));
    for (const mode of ["light", "dark"] as const) {
      const tokens = exported.modes[mode];
      expect(Object.keys(tokens).every(path => sourcePaths.has(path)), mode).toBe(true);
      for (const size of ["sm", "md", "lg"] as const) {
        expect(Number.isInteger(tokens[`control.height.${size}` as TokenPath]), `${mode} control.height.${size}`).toBe(true);
        expect(Number.isInteger(tokens[`control.padding.x.${size}` as TokenPath]), `${mode} control.padding.x.${size}`).toBe(true);
      }
    }
  });

  it("rejects non-integer control multipliers and never emits partial variables", () => {
    const invalid: ThemeDefinition = { ...oriaDefaultTheme, modes: { ...oriaDefaultTheme.modes, light: { ...oriaDefaultTheme.modes.light, ["control.height.md" as TokenPath]: 2.5 } } };
    const checked = validateTheme(invalid, oriaStandardContract);
    expect(checked.ok).toBe(false);
    if (!checked.ok) expect(checked.issues.some(problem => problem.path === "modes.light.control.height.md")).toBe(true);
    expect(() => resolveTheme(invalid, "light")).toThrow(expect.objectContaining({ code: "INVALID_TOKEN_VALUE", message: "Expected an integer value." }));
  });

  it("analyzes v2 contrast pairs with kebab-case variables", () => {
    const poorContrast = { ...oriaDefaultTheme, modes: { ...oriaDefaultTheme.modes, light: { ...oriaDefaultTheme.modes.light, "color.fg": oriaDefaultTheme.modes.light["color.bg" as TokenPath] } } };
    const diagnostics = analyzeTheme(poorContrast, oriaStandardContract);
    expect(diagnostics.errors).toHaveLength(0);
    expect(diagnostics.warnings.some(warning => warning.pair === "color.bg/color.fg (light)" && warning.ratio === 1)).toBe(true);
    expect(diagnostics.warnings.every(warning => Number.isFinite(warning.ratio))).toBe(true);
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
      ["gradient", { "gradient.value": { type: "gradient", required: true, description: "gradient" } }, { type: "linear", angle: 0, stops: [{ color: "#fff" }] }],
      ["pattern", { "pattern.value": { type: "pattern", required: true, description: "pattern" } }, [{ type: "stripe", color: "#fff", stripeWidth: "1px", spacing: "0.5px", angle: 420 }]]
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

  it("rejects unsafe or incompatible pattern-layer color references", () => {
    const patternContract = defineTokenContract({ name: "pattern-references", version: 1, tokens: {
      "color.base": { type: "color", required: true, description: "base" },
      "spacing.unit": { type: "dimension", required: true, description: "unit" },
      "pattern.surface": { type: "pattern", required: true, description: "pattern" }
    } });
    const theme = (color: unknown): ThemeDefinition => ({ schemaVersion: 1, contract: { name: "pattern-references", version: 1 }, id: "pattern-reference", name: "Pattern", kind: "custom", modes: { light: { "color.base": "#fff", "spacing.unit": "1rem", "pattern.surface": [{ type: "dot", color, radius: "1px", spacing: "1rem" }] } as never, dark: { "color.base": "#fff", "spacing.unit": "1rem", "pattern.surface": [{ type: "dot", color, radius: "1px", spacing: "1rem" }] } as never } });
    expect(validateTheme(theme({ $ref: "spacing.unit" as TokenPath }), patternContract).ok).toBe(false);
    expect(validateTheme(theme("url(https://unsafe.example)"), patternContract).ok).toBe(false);
  });

  it("requires one to eight pattern layers", () => {
    const patternContract = defineTokenContract({ name: "pattern-limits", version: 1, tokens: { "pattern.surface": { type: "pattern", required: true, description: "pattern" } } });
    const layer: DotPatternDefinition = { type: "dot", color: "#ffffff", radius: "1px", spacing: "8px" };
    const theme = (layers: unknown): ThemeDefinition => ({ schemaVersion: 1, contract: { name: "pattern-limits", version: 1 }, id: "pattern-limits", name: "Pattern limits", kind: "custom", modes: { light: { "pattern.surface": layers } as never, dark: { "pattern.surface": layers } as never } });
    expect(validateTheme(theme([]), patternContract).ok).toBe(false);
    expect(validateTheme(theme(Array.from({ length: 9 }, () => layer)), patternContract).ok).toBe(false);
  });

  it("rejects invalid noise profiles, sizes, and intensities", () => {
    const patternContract = defineTokenContract({ name: "noise-limits", version: 1, tokens: { "pattern.surface": { type: "pattern", required: true, description: "pattern" } } });
    const theme = (layer: unknown): ThemeDefinition => ({ schemaVersion: 1, contract: { name: "noise-limits", version: 1 }, id: "noise-limits", name: "Noise limits", kind: "custom", modes: { light: { "pattern.surface": [layer] } as never, dark: { "pattern.surface": [layer] } as never } });
    expect(validateTheme(theme({ type: "noise", variant: "canvas", color: "#fff", tileSize: "32px", intensity: 0.1 }), patternContract).ok).toBe(false);
    expect(validateTheme(theme({ type: "noise", variant: "paper", color: "#fff", tileSize: "0px", intensity: 0.1 }), patternContract).ok).toBe(false);
    expect(validateTheme(theme({ type: "noise", variant: "film", color: "#fff", tileSize: "32px", intensity: 1.1 }), patternContract).ok).toBe(false);
  });
});

describe("theme lifecycle", () => {
  it("uses the concise stable display name for the built-in default preset", () => {
    expect(oriaDefaultTheme).toMatchObject({ id: "oria-default", name: "Default" });
  });

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
    expect(resolved["--oria-shadow-md"]!.split(",")).toHaveLength(1);
  });
});

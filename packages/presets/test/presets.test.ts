import { analyzeTheme, oriaStandardContract, resolveTheme, validateTheme } from "@oriatheme/core";
import { describe, expect, it } from "vitest";
import {
  oriaAuroraTheme,
  oriaForestTheme,
  oriaGlassTheme,
  oriaGoldenBazaarTheme,
  oriaLineArtTheme,
  oriaSketchbookTheme,
  oriaSoftClayTheme,
  oriaTheoremTheme,
  oriaMinimalismTheme,
  oriaOceanTheme,
  oriaPunchcardTheme,
  oriaPresetCatalog,
  oriaPresetThemes,
  oriaWarmReadingTheme
} from "../src/index.js";

const expectedThemeIds = [
  "oria-default", "oria-manuscript",
  "oria-mono", "oria-minimalism", "oria-line-art", "oria-glass", "oria-neo-brutalism", "oria-punchcard", "oria-sketchbook", "oria-soft-clay", "oria-golden-bazaar", "oria-theorem", "oria-neumorphism", "oria-memphis",
  "oria-ocean", "oria-forest", "oria-aurora",
  "oria-warm-reading", "oria-monochrome-deploy", "oria-precision-flow", "oria-elevated-surface",
  "oria-bento-ui", "oria-dashboard", "oria-editorial", "oria-ai-native", "oria-command-center", "oria-spatial-ui",
  "oria-soft-ui", "oria-cyberpunk", "oria-y2k", "oria-retro-terminal", "oria-paper",
  "oria-calm", "oria-playful", "oria-premium", "oria-organic", "oria-cottagecore", "oria-nature", "oria-retro", "oria-kawaii", "oria-sunset"
];

const resolveV2 = (theme: (typeof oriaPresetThemes)[number], mode: "light" | "dark") => resolveTheme(theme, mode, { contract: oriaStandardContract }).variables;

describe("Oria preset collection", () => {
  it("exports all 41 stable, unique preset identities as Contract v2 themes", () => {
    expect(oriaPresetThemes.map(theme => theme.id)).toEqual(expectedThemeIds);
    expect(new Set(oriaPresetThemes.map(theme => theme.id)).size).toBe(oriaPresetThemes.length);
    for (const theme of oriaPresetThemes) {
      expect(theme.kind).toBe("preset");
      expect(theme.contract).toEqual({ name: "oria-standard", version: 2 });
      expect(validateTheme(theme, oriaStandardContract).ok, theme.id).toBe(true);
      expect(resolveV2(theme, "light")["--oria-radius-lg"], theme.id).toBeDefined();
    }
  });

  it("fully validates, resolves, compiles safe CSS values, and meets contrast guidance", () => {
    // Glass deliberately ships translucent raised surfaces whose alpha stops static
    // contrast computation, plus a bright dark selection; these three warnings are
    // an intentional, documented exception (see docs/specifications/preset-catalog.md).
    const documentedWarnings = new Map<string, string[]>([
      ["oria-glass", [
        "color.surface.raised/color.surface.raised.fg (light)",
        "color.surface.raised/color.surface.raised.fg (dark)",
        "color.selection/color.selection.fg (dark)"
      ]]
    ]);
    for (const theme of oriaPresetThemes) {
      expect(validateTheme(theme, oriaStandardContract).ok, theme.id).toBe(true);
      const analysis = analyzeTheme(theme, oriaStandardContract);
      expect(analysis.errors, theme.id).toEqual([]);
      const expectedPairs = documentedWarnings.get(theme.id) ?? [];
      expect(analysis.warnings.map(warning => warning.pair).sort(), theme.id).toEqual([...expectedPairs].sort());
      expect(Object.keys(resolveV2(theme, "light"))).not.toHaveLength(0);
      expect(Object.keys(resolveV2(theme, "dark"))).not.toHaveLength(0);
    }
  });

  it("keeps Aurora's stable identity and provides distinct representative palettes", () => {
    expect(oriaAuroraTheme.id).toBe("oria-aurora");
    expect([oriaOceanTheme, oriaForestTheme, oriaAuroraTheme].map(theme => theme.name)).toEqual(["Ocean", "Forest", "Aurora"]);
    const primary = [oriaOceanTheme, oriaForestTheme, oriaAuroraTheme, oriaWarmReadingTheme].map(theme => resolveV2(theme, "light")["--oria-color-primary"]);
    expect(new Set(primary).size).toBe(primary.length);
  });

  it("keeps the static base color library out of preset themes and runtime output", () => {
    for (const theme of oriaPresetThemes) {
      for (const mode of ["light", "dark"] as const) {
        expect(Object.keys(theme.modes[mode]).some(path => path.startsWith("palette.")), `${theme.id} ${mode}`).toBe(false);
        expect(Object.keys(resolveV2(theme, mode)).some(path => path.startsWith("--oria-palette-")), `${theme.id} ${mode}`).toBe(false);
      }
    }
  });

  it("keeps interactive color states and visual systems genuinely distinct", () => {
    const visualKeys = [
      "--oria-font-display",
      "--oria-text-4xl",
      "--oria-leading-relaxed",
      "--oria-tracking-wide",
      "--oria-radius-md",
      "--oria-radius-lg",
      "--oria-radius-xl",
      "--oria-border-width-strong",
      "--oria-shadow-md",
      "--oria-backdrop-blur-lg",
      "--oria-backdrop-saturate",
      "--oria-duration-normal",
      "--oria-ease-emphasized",
      "--oria-gradient-bg",
      "--oria-gradient-surface",
      "--oria-gradient-accent"
    ] as const;
    const signatures = new Set<string>();

    for (const theme of oriaPresetThemes) {
      for (const mode of ["light", "dark"] as const) {
        const variables = resolveV2(theme, mode);
        expect(variables["--oria-color-primary-hover"], `${theme.id} ${mode} primary hover`).not.toBe(variables["--oria-color-primary"]);
        expect(variables["--oria-color-primary-active"], `${theme.id} ${mode} primary active`).not.toBe(variables["--oria-color-primary"]);
        expect(variables["--oria-color-secondary-hover"], `${theme.id} ${mode} secondary hover`).not.toBe(variables["--oria-color-secondary"]);
        expect(variables["--oria-color-secondary-active"], `${theme.id} ${mode} secondary active`).not.toBe(variables["--oria-color-secondary"]);
      }
      const light = resolveV2(theme, "light");
      signatures.add(visualKeys.map(key => light[key] ?? "∅").join("|"));
    }

    expect(signatures.size).toBe(oriaPresetThemes.length);
  });

  it("uses clear red, green, orange, and sky feedback semantics with deliberate monochrome exceptions", () => {
    const feedbackKeys = ["danger", "success", "warning", "info"] as const;
    const monochrome = new Set(["oria-monochrome-deploy", "oria-mono", "oria-minimalism", "oria-line-art"]);
    const standardFeedback = {
      light: ["#d53740", "#1f9058", "#c15701", "#1982bd"],
      dark: ["#f46767", "#56b17c", "#fba171", "#52a4db"]
    } as const;
    const chartSignatures = new Set<string>();

    for (const theme of oriaPresetThemes) {
      for (const mode of ["light", "dark"] as const) {
        const variables = resolveV2(theme, mode);
        const colors = feedbackKeys.map(key => variables[`--oria-color-${key}`]!);
        expect(new Set(colors).size, `${theme.id} ${mode} feedback colors`).toBe(colors.length);
        if (!monochrome.has(theme.id)) {
          expect(colors, `${theme.id} ${mode} feedback palette`).toEqual(standardFeedback[mode]);
          const charts = Array.from({ length: 8 }, (_, index) => variables[`--oria-color-chart-${index + 1}` as `--${string}`]!);
          expect(new Set(charts).size, `${theme.id} ${mode} chart colors`).toBe(charts.length);
          chartSignatures.add(charts.slice(1).join("|"));
          expect(variables["--oria-color-chart-1"], `${theme.id} ${mode} first chart series`).toBe(variables["--oria-color-primary"]);
        }
      }
    }

    const lineArt = resolveV2(oriaLineArtTheme, "light");
    expect(feedbackKeys.map(key => lineArt[`--oria-color-${key}`])).toEqual(["#111111", "#303030", "#4f4f4f", "#686868"]);

    const monochromeDeploy = resolveV2(oriaPresetThemes.find(theme => theme.id === "oria-monochrome-deploy")!, "light");
    expect(feedbackKeys.map(key => monochromeDeploy[`--oria-color-${key}`])).toEqual(["#171717", "#4a4a4a", "#737373", "#a3a3a3"]);
    expect(chartSignatures.size).toBeGreaterThanOrEqual(5);

    const chartsFor = (id: string, mode: "light" | "dark" = "light") => {
      const variables = resolveV2(oriaPresetThemes.find(theme => theme.id === id)!, mode);
      return Array.from({ length: 7 }, (_, index) => variables[`--oria-color-chart-${index + 2}` as `--${string}`]);
    };
    expect(chartsFor("oria-ocean")).toEqual(["#1488a4", "#1c8c85", "#1982bd", "#3675e2", "#626bdc", "#1f9058", "#d53740"]);
    expect(chartsFor("oria-forest")).toEqual(["#1a8f6b", "#1c8c85", "#1982bd", "#5e8a0a", "#3675e2", "#c15701", "#d53740"]);
    expect(chartsFor("oria-elevated-surface")).toEqual(["#626bdc", "#7d60db", "#9756cc", "#bc3cae", "#3675e2", "#d53740", "#c15701"]);
    expect(chartsFor("oria-warm-reading")).toEqual(["#c15701", "#a36e09", "#b49a24", "#cc415d", "#d53740", "#3675e2", "#1c8c85"]);
  });

  it("keeps Glass translucent while using the restrained semantic and data palette", () => {
    const feedbackKeys = ["danger", "success", "warning", "info"] as const;
    const chartKeys = Array.from({ length: 8 }, (_, index) => `--oria-color-chart-${index + 1}` as `--${string}`);
    const light = resolveV2(oriaGlassTheme, "light");
    const dark = resolveV2(oriaGlassTheme, "dark");

    expect(feedbackKeys.map(key => light[`--oria-color-${key}`])).toEqual(["#d53740", "#1f9058", "#c15701", "#1982bd"]);
    expect(feedbackKeys.map(key => dark[`--oria-color-${key}`])).toEqual(["#f46767", "#56b17c", "#fba171", "#52a4db"]);
    expect(chartKeys.map(key => light[key])).toEqual(["#20aeea", "#1488a4", "#1c8c85", "#1982bd", "#3675e2", "#626bdc", "#1f9058", "#d53740"]);
    expect(chartKeys.map(key => dark[key])).toEqual(["#4bc5ff", "#48a9c7", "#4caea6", "#52a4db", "#5f99fe", "#8390f8", "#56b17c", "#f46767"]);
  });

  it("preserves the defining traits of representative style families", () => {
    const variables = (id: string, mode: "light" | "dark" = "light") => resolveV2(oriaPresetThemes.find(theme => theme.id === id)!, mode);

    expect(oriaGlassTheme.id).toBe("oria-glass");
    expect(variables("oria-glass")["--oria-backdrop-blur-sm"]).toBe("12px");
    expect(variables("oria-glass")["--oria-backdrop-blur-md"]).toBe("21px");
    expect(variables("oria-glass")["--oria-backdrop-blur-lg"]).toBe("30px");
    expect(variables("oria-glass")["--oria-backdrop-blur-xl"]).toBe("42px");
    expect(variables("oria-glass")["--oria-font-sans"]).toContain("-apple-system");
    expect(variables("oria-glass")["--oria-shadow-highlight"]!.split(",")).toHaveLength(6);
    expect(variables("oria-glass")["--oria-shadow-md"]!.split(",")).toHaveLength(7);
    expect(variables("oria-glass", "dark")["--oria-color-primary"]).toBe("#4bc5ff");
    expect(variables("oria-glass", "dark")["--oria-color-chart-1"]).toBe("#4bc5ff");
    expect(variables("oria-glass", "dark")["--oria-color-surface"]).toBe("#181818");
    expect(variables("oria-glass")["--oria-color-surface-raised"]).toBe("#f8f8f880");
    expect(variables("oria-glass", "dark")["--oria-color-surface-raised"]).toBe("#101010a0");
    expect(variables("oria-glass")["--oria-gradient-bg"]).toBeUndefined();
    expect(variables("oria-glass", "dark")["--oria-gradient-bg"]).toBeUndefined();
    expect(variables("oria-manuscript")["--oria-color-bg"]).toBe("#eeeeef");
    expect(variables("oria-manuscript")["--oria-color-primary"]).toBe("#292a31");
    expect(variables("oria-manuscript")["--oria-font-display"]).toContain("SFMono-Regular");
    expect(variables("oria-manuscript")["--oria-radius-md"]).toBe("0");
    expect(variables("oria-manuscript")["--oria-color-border"]).toBe("#ffffffcc");
    expect(variables("oria-manuscript")["--oria-shadow-highlight"]).toContain("inset");
    expect(variables("oria-manuscript")["--oria-pattern-surface"]).toContain("data:image/svg+xml");
    expect(variables("oria-manuscript", "dark")["--oria-color-bg"]).toBe("#1b1c21");
    expect(variables("oria-manuscript", "dark")["--oria-color-border"]).toBe("#ffffff1f");
    expect(variables("oria-neo-brutalism")["--oria-border-width-strong"]).toBe("3px");
    expect(variables("oria-neo-brutalism")["--oria-shadow-md"]).toContain("7px 7px 0 0");
    expect(oriaPunchcardTheme.id).toBe("oria-punchcard");
    expect(variables("oria-punchcard")["--oria-color-bg"]).toBe("#fff2da");
    expect(variables("oria-punchcard")["--oria-color-secondary"]).toBe("#f4a4bd");
    expect(variables("oria-punchcard")["--oria-color-accent"]).toBe("#9ed4f2");
    expect(variables("oria-punchcard")["--oria-border-width-strong"]).toBe("2px");
    expect(variables("oria-punchcard")["--oria-shadow-lg"]).toContain("8px 8px 0 0");
    expect(variables("oria-punchcard")["--oria-pattern-surface"]).toBe("radial-gradient(circle at center, #2a25201f 0 1.5px, transparent 1.5px) 0 0 / 1.5rem 1.5rem repeat");
    expect(variables("oria-punchcard", "dark")["--oria-pattern-surface"]).toBe("radial-gradient(circle at center, #fff1d91f 0 1.5px, transparent 1.5px) 0 0 / 1.5rem 1.5rem repeat");
    expect(variables("oria-ocean")["--oria-pattern-surface"]).toBeUndefined();
    expect(oriaSketchbookTheme.id).toBe("oria-sketchbook");
    expect(variables("oria-sketchbook")["--oria-color-bg"]).toBe("#fffefa");
    expect(variables("oria-sketchbook")["--oria-color-primary"]).toBe("#2d2927");
    expect(variables("oria-sketchbook")["--oria-color-secondary"]).toBe("#b7f3c5");
    expect(variables("oria-sketchbook")["--oria-color-accent"]).toBe("#ffe49c");
    expect(variables("oria-sketchbook")["--oria-font-display"]).toContain("Chalkboard SE");
    expect(variables("oria-sketchbook")["--oria-border-width-default"]).toBe("2px");
    expect(variables("oria-sketchbook")["--oria-pattern-bg"]).toBe("radial-gradient(circle at center, #2a25200f 0 1.5px, transparent 1.5px) 0 0 / 2rem 2rem repeat");
    expect(variables("oria-sketchbook")["--oria-pattern-surface"]).toBe("repeating-linear-gradient(0deg, #2a25200f 0 1px, transparent 1px 1.5rem), repeating-linear-gradient(90deg, #2a25200f 0 1px, transparent 1px 1.5rem)");
    expect(variables("oria-sketchbook", "dark")["--oria-pattern-bg"]).toBe("radial-gradient(circle at center, #6060601f 0 1.5px, transparent 1.5px) 0 0 / 2rem 2rem repeat");
    expect(variables("oria-sketchbook", "dark")["--oria-pattern-surface"]).toBe("repeating-linear-gradient(0deg, #f6f1e710 0 1px, transparent 1px 1.5rem), repeating-linear-gradient(90deg, #f6f1e710 0 1px, transparent 1px 1.5rem)");
    expect(variables("oria-sketchbook", "dark")["--oria-color-bg"]).toBe("#211f1c");
    expect(oriaSoftClayTheme.id).toBe("oria-soft-clay");
    expect(variables("oria-soft-clay")["--oria-color-bg"]).toBe("#f3f0eb");
    expect(variables("oria-soft-clay")["--oria-color-primary"]).toBe("#e9781c");
    expect(variables("oria-soft-clay")["--oria-font-sans"]).toContain("ui-rounded");
    expect(variables("oria-soft-clay")["--oria-radius-lg"]).toBe("2.5rem");
    expect(variables("oria-soft-clay")["--oria-shadow-lg"]!.split(",")).toHaveLength(3);
    expect(variables("oria-soft-clay")["--oria-gradient-surface"]).toContain("#ffffff");
    expect(variables("oria-soft-clay", "dark")["--oria-color-bg"]).toBe("#28221d");
    expect(oriaGoldenBazaarTheme.id).toBe("oria-golden-bazaar");
    expect(variables("oria-golden-bazaar")["--oria-color-bg"]).toBe("#fff0d8");
    expect(variables("oria-golden-bazaar")["--oria-color-primary"]).toBe("#f4b522");
    expect(variables("oria-golden-bazaar")["--oria-color-secondary"]).toBe("#f06d36");
    expect(variables("oria-golden-bazaar")["--oria-color-accent"]).toBe("#413896");
    expect(variables("oria-golden-bazaar")["--oria-radius-lg"]).toBe("2.25rem");
    expect(variables("oria-golden-bazaar")["--oria-gradient-bg"]).toContain("radial-gradient");
    expect(variables("oria-golden-bazaar")["--oria-shadow-lg"]!.split(",")).toHaveLength(2);
    expect(variables("oria-golden-bazaar", "dark")["--oria-color-bg"]).toBe("#2b1c16");
    expect(oriaTheoremTheme.id).toBe("oria-theorem");
    expect(variables("oria-theorem")["--oria-color-bg"]).toBe("#f0ede5");
    expect(variables("oria-theorem")["--oria-color-primary"]).toBe("#27231e");
    expect(variables("oria-theorem")["--oria-color-accent"]).toBe("#8d3029");
    expect(variables("oria-theorem")["--oria-font-display"]).toContain("Iowan Old Style");
    expect(variables("oria-theorem")["--oria-radius-lg"]).toBe("0");
    expect(variables("oria-theorem")["--oria-color-scrim"]).toBe("#25231f59");
    expect(variables("oria-theorem")["--oria-shadow-md"]).toBe("");
    expect(variables("oria-theorem")["--oria-shadow-lg"]).toBe("8px 10px 0 0 #6b675f91, 0 18px 36px -18px #24221d59");
    expect(variables("oria-theorem")["--oria-pattern-bg"]).toContain("data:image/svg+xml");
    expect(variables("oria-theorem")["--oria-pattern-bg"]).toContain("80px 80px");
    expect(variables("oria-theorem", "dark")["--oria-pattern-bg"]).toContain("data:image/svg+xml");
    expect(variables("oria-theorem", "dark")["--oria-color-bg"]).toBe("#292824");
    expect(variables("oria-neumorphism")["--oria-shadow-md"]!.split(",")).toHaveLength(2);
    expect(variables("oria-editorial")["--oria-text-4xl"]).toBe("4.5rem");
    expect(variables("oria-retro-terminal")["--oria-radius-md"]).toBe("0");
    expect(variables("oria-retro-terminal")["--oria-font-display"]).toContain("SFMono-Regular");
    expect(variables("oria-aurora", "dark")["--oria-gradient-accent"]).toContain("#86ee9f");
    expect(variables("oria-premium", "dark")["--oria-color-primary"]).toBe("#d7bd7a");
    expect(oriaMinimalismTheme.id).toBe("oria-minimalism");
    expect(variables("oria-minimalism")["--oria-color-primary"]).toBe("#202020");
    expect(variables("oria-minimalism")["--oria-color-success"]).toBe("#3d3d3d");
    expect(variables("oria-minimalism", "dark")["--oria-color-primary"]).toBe("#d4d4d4");
    expect(oriaLineArtTheme.id).toBe("oria-line-art");
    expect(variables("oria-line-art")["--oria-color-bg"]).toBe("#ffffff");
    expect(variables("oria-line-art")["--oria-color-border"]).toBe("#1f1f1f");
    expect(variables("oria-line-art")["--oria-color-success"]).toBe("#303030");
    expect(variables("oria-line-art")["--oria-shadow-md"]).toBe("");
  });

  it("derives every radius scale from the theme's single radius source", () => {
    const radiusKeys = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const;
    const factors = [0.5, 1, 1.5, 2, 3, 4, 6, 8] as const;
    const radii = (id: string) => {
      const variables = resolveV2(oriaPresetThemes.find(theme => theme.id === id)!, "light");
      return radiusKeys.map(key => Number.parseFloat(variables[`--oria-radius-${key}`] ?? "NaN"));
    };

    for (const theme of oriaPresetThemes) {
      const variables = resolveV2(theme, "light");
      const base = Number.parseFloat(variables["--oria-radius-sm"] ?? "NaN");
      const values = radii(theme.id);
      expect(values.every(Number.isFinite), `${theme.id} radius values`).toBe(true);
      expect(values, `${theme.id} radius scale`).toEqual(factors.map(factor => Number((base * factor).toFixed(4))));
      expect(values, `${theme.id} radius monotonic`).toEqual([...values].sort((a, b) => a - b));
    }

    for (const id of ["oria-neo-brutalism", "oria-cyberpunk", "oria-retro-terminal", "oria-editorial", "oria-line-art", "oria-theorem"]) expect(radii(id)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(radii("oria-punchcard")).toEqual([0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4]);
    expect(radii("oria-glass")).toEqual([0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4]);
    expect(radii("oria-y2k")).toEqual([0.5, 1, 1.5, 2, 3, 4, 6, 8]);
    expect(radii("oria-kawaii")).toEqual([0.5, 1, 1.5, 2, 3, 4, 6, 8]);
  });

  it("keeps every control multiplier an integer between 1 and 24", () => {
    for (const theme of oriaPresetThemes) {
      const tokens = theme.modes.light as Record<string, unknown>;
      for (const size of ["sm", "md", "lg"] as const) {
        for (const path of [`control.height.${size}`, `control.padding.x.${size}`]) {
          const value = tokens[path];
          expect(Number.isInteger(value), `${theme.id} ${path}`).toBe(true);
          expect(value, `${theme.id} ${path}`).toBeGreaterThanOrEqual(1);
          expect(value, `${theme.id} ${path}`).toBeLessThanOrEqual(24);
        }
      }
    }
  });

  it("keeps the extended typography and blur scales ordered", () => {
    const sizeKeys = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl"] as const;
    const lineHeightKeys = ["tight", "snug", "normal", "relaxed", "loose"] as const;
    const letterSpacingKeys = ["tighter", "tight", "normal", "wide", "wider", "widest"] as const;
    const blurKeys = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;

    for (const theme of oriaPresetThemes) {
      const variables = resolveV2(theme, "light");
      const ordered = (prefix: `--${string}`, keys: readonly string[]) => keys.map(key => Number.parseFloat(variables[`${prefix}${key}` as `--${string}`] ?? "NaN"));
      for (const [label, values] of [
        ["type size", ordered("--oria-text-", sizeKeys)],
        ["line height", ordered("--oria-leading-", lineHeightKeys)],
        ["letter spacing", ordered("--oria-tracking-", letterSpacingKeys)],
        ["blur", ordered("--oria-blur-", blurKeys)],
        ["backdrop blur", ordered("--oria-backdrop-blur-", blurKeys)]
      ] as const) {
        expect(values.every(Number.isFinite), `${theme.id} ${label} values`).toBe(true);
        expect(values, `${theme.id} ${label} scale`).toEqual([...values].sort((a, b) => a - b));
      }
    }
  });

  it("exposes a minimal, ordered runtime catalog", () => {
    expect(oriaPresetCatalog.map(entry => entry.theme.id)).toEqual(expectedThemeIds);
    expect(oriaPresetCatalog.map(entry => entry.theme)).toEqual(oriaPresetThemes);
    for (const entry of oriaPresetCatalog) {
      expect(Object.keys(entry).sort()).toEqual(["category", "theme"]);
      expect(entry.theme.kind).toBe("preset");
    }
    expect(oriaPresetCatalog.filter(entry => entry.category === "brand-product")).toHaveLength(5);
  });
});

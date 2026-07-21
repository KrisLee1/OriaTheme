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
  "oria-default", "oria-ocean", "oria-forest", "oria-aurora",
  "oria-warm-reading", "oria-monochrome-deploy", "oria-precision-flow", "oria-document-canvas", "oria-elevated-surface",
  "oria-bento-ui", "oria-dashboard", "oria-editorial", "oria-ai-native", "oria-command-center", "oria-spatial-ui",
  "oria-mono", "oria-minimalism", "oria-line-art", "oria-glass", "oria-neo-brutalism", "oria-punchcard", "oria-sketchbook", "oria-soft-clay", "oria-golden-bazaar", "oria-theorem", "oria-neumorphism", "oria-memphis", "oria-soft-ui", "oria-cyberpunk", "oria-y2k", "oria-retro-terminal", "oria-paper",
  "oria-calm", "oria-playful", "oria-premium", "oria-organic", "oria-cottagecore", "oria-nature", "oria-retro", "oria-kawaii", "oria-sunset"
];

describe("Oria preset collection", () => {
  it("exports all 41 stable, unique preset identities", () => {
    expect(oriaPresetThemes.map(theme => theme.id)).toEqual(expectedThemeIds);
    expect(new Set(oriaPresetThemes.map(theme => theme.id)).size).toBe(oriaPresetThemes.length);
    expect(oriaPresetThemes.every(theme => theme.kind === "preset")).toBe(true);
  });

  it("fully validates, resolves, compiles safe CSS values, and meets contrast guidance", () => {
    for (const theme of oriaPresetThemes) {
      expect(validateTheme(theme, oriaStandardContract).ok, theme.id).toBe(true);
      expect(analyzeTheme(theme, oriaStandardContract), theme.id).toEqual({ errors: [], warnings: [] });
      expect(Object.keys(resolveTheme(theme, "light").variables)).not.toHaveLength(0);
      expect(Object.keys(resolveTheme(theme, "dark").variables)).not.toHaveLength(0);
    }
  });

  it("keeps Aurora's stable identity and provides distinct representative palettes", () => {
    expect(oriaAuroraTheme.id).toBe("oria-aurora");
    expect([oriaOceanTheme, oriaForestTheme, oriaAuroraTheme].map(theme => theme.name)).toEqual(["Ocean", "Forest", "Aurora"]);
    const primary = [oriaOceanTheme, oriaForestTheme, oriaAuroraTheme, oriaWarmReadingTheme].map(theme => resolveTheme(theme, "light").variables["--oria-color-primary"]);
    expect(new Set(primary).size).toBe(primary.length);
  });

  it("keeps the static base color library out of preset themes and runtime output", () => {
    for (const theme of oriaPresetThemes) {
      expect(theme.contract).toEqual({ name: "oria-standard", version: 1 });
      for (const mode of ["light", "dark"] as const) {
        expect(Object.keys(theme.modes[mode]).some(path => path.startsWith("palette.")), `${theme.id} ${mode}`).toBe(false);
        expect(Object.keys(resolveTheme(theme, mode).variables).some(path => path.startsWith("--oria-palette-")), `${theme.id} ${mode}`).toBe(false);
      }
    }
  });

  it("keeps interactive color states and visual systems genuinely distinct", () => {
    const visualKeys = [
      "--oria-typography-font-display",
      "--oria-typography-size-4xl",
      "--oria-typography-lineHeight-relaxed",
      "--oria-typography-letterSpacing-wide",
      "--oria-shape-radius-md",
      "--oria-shape-radius-lg",
      "--oria-shape-radius-xl",
      "--oria-shape-borderWidth-strong",
      "--oria-spacing-density",
      "--oria-elevation-shadow-md",
      "--oria-effect-backdropBlur-lg",
      "--oria-effect-backdropSaturation",
      "--oria-motion-duration-normal",
      "--oria-motion-easing-emphasized",
      "--oria-gradient-background",
      "--oria-gradient-surface",
      "--oria-gradient-accent"
    ] as const;
    const signatures = new Set<string>();

    for (const theme of oriaPresetThemes) {
      for (const mode of ["light", "dark"] as const) {
        const variables = resolveTheme(theme, mode).variables;
        expect(variables["--oria-color-primaryHover"], `${theme.id} ${mode} primary hover`).not.toBe(variables["--oria-color-primary"]);
        expect(variables["--oria-color-primaryActive"], `${theme.id} ${mode} primary active`).not.toBe(variables["--oria-color-primary"]);
        expect(variables["--oria-color-secondaryHover"], `${theme.id} ${mode} secondary hover`).not.toBe(variables["--oria-color-secondary"]);
        expect(variables["--oria-color-secondaryActive"], `${theme.id} ${mode} secondary active`).not.toBe(variables["--oria-color-secondary"]);
      }
      const light = resolveTheme(theme, "light").variables;
      signatures.add(visualKeys.map(key => light[key] ?? "∅").join("|"));
    }

    expect(signatures.size).toBe(oriaPresetThemes.length);
  });

  it("uses clear red, green, orange, and sky feedback semantics with deliberate monochrome exceptions", () => {
    const feedbackKeys = ["destructive", "success", "warning", "info"] as const;
    const monochrome = new Set(["oria-monochrome-deploy", "oria-mono", "oria-minimalism", "oria-line-art"]);
    const standardFeedback = {
      light: ["#d53740", "#1f9058", "#c15701", "#1982bd"],
      dark: ["#f46767", "#56b17c", "#fba171", "#52a4db"]
    } as const;
    const chartSignatures = new Set<string>();

    for (const theme of oriaPresetThemes) {
      for (const mode of ["light", "dark"] as const) {
        const variables = resolveTheme(theme, mode).variables;
        const colors = feedbackKeys.map(key => variables[`--oria-color-${key}`]!);
        expect(new Set(colors).size, `${theme.id} ${mode} feedback colors`).toBe(colors.length);
        if (!monochrome.has(theme.id)) {
          expect(colors, `${theme.id} ${mode} feedback palette`).toEqual(standardFeedback[mode]);
          const charts = Array.from({ length: 8 }, (_, index) => variables[`--oria-color-chart${index + 1}` as `--${string}`]!);
          expect(new Set(charts).size, `${theme.id} ${mode} chart colors`).toBe(charts.length);
          chartSignatures.add(charts.slice(1).join("|"));
          expect(variables["--oria-color-chart1"], `${theme.id} ${mode} first chart series`).toBe(variables["--oria-color-primary"]);
        }
      }
    }

    const lineArt = resolveTheme(oriaLineArtTheme, "light").variables;
    expect(feedbackKeys.map(key => lineArt[`--oria-color-${key}`])).toEqual(["#111111", "#303030", "#4f4f4f", "#686868"]);

    const monochromeDeploy = resolveTheme(oriaPresetThemes.find(theme => theme.id === "oria-monochrome-deploy")!, "light").variables;
    expect(feedbackKeys.map(key => monochromeDeploy[`--oria-color-${key}`])).toEqual(["#171717", "#4a4a4a", "#737373", "#a3a3a3"]);
    expect(chartSignatures.size).toBeGreaterThanOrEqual(5);

    const chartsFor = (id: string, mode: "light" | "dark" = "light") => {
      const variables = resolveTheme(oriaPresetThemes.find(theme => theme.id === id)!, mode).variables;
      return Array.from({ length: 7 }, (_, index) => variables[`--oria-color-chart${index + 2}` as `--${string}`]);
    };
    expect(chartsFor("oria-ocean")).toEqual(["#1488a4", "#1c8c85", "#1982bd", "#3675e2", "#626bdc", "#1f9058", "#d53740"]);
    expect(chartsFor("oria-forest")).toEqual(["#1a8f6b", "#1c8c85", "#1982bd", "#5e8a0a", "#3675e2", "#c15701", "#d53740"]);
    expect(chartsFor("oria-elevated-surface")).toEqual(["#626bdc", "#7d60db", "#9756cc", "#bc3cae", "#3675e2", "#d53740", "#c15701"]);
    expect(chartsFor("oria-warm-reading")).toEqual(["#c15701", "#a36e09", "#b49a24", "#cc415d", "#d53740", "#3675e2", "#1c8c85"]);
  });

  it("keeps Glass translucent while using the restrained semantic and data palette", () => {
    const feedbackKeys = ["destructive", "success", "warning", "info"] as const;
    const chartKeys = Array.from({ length: 8 }, (_, index) => `--oria-color-chart${index + 1}` as `--${string}`);
    const light = resolveTheme(oriaGlassTheme, "light").variables;
    const dark = resolveTheme(oriaGlassTheme, "dark").variables;

    expect(feedbackKeys.map(key => light[`--oria-color-${key}`])).toEqual(["#d53740", "#1f9058", "#c15701", "#1982bd"]);
    expect(feedbackKeys.map(key => dark[`--oria-color-${key}`])).toEqual(["#f46767", "#56b17c", "#fba171", "#52a4db"]);
    expect(chartKeys.map(key => light[key])).toEqual(["#20aeea", "#1488a4", "#1c8c85", "#1982bd", "#3675e2", "#626bdc", "#1f9058", "#d53740"]);
    expect(chartKeys.map(key => dark[key])).toEqual(["#4ac5ff", "#48a9c7", "#4caea6", "#52a4db", "#5f99fe", "#8390f8", "#56b17c", "#f46767"]);
  });

  it("preserves the defining traits of representative style families", () => {
    const variables = (id: string, mode: "light" | "dark" = "light") => resolveTheme(oriaPresetThemes.find(theme => theme.id === id)!, mode).variables;

    expect(oriaGlassTheme.id).toBe("oria-glass");
    expect(variables("oria-glass")["--oria-effect-backdropBlur-sm"]).toBe("12px");
    expect(variables("oria-glass")["--oria-effect-backdropBlur-md"]).toBe("21px");
    expect(variables("oria-glass")["--oria-effect-backdropBlur-lg"]).toBe("30px");
    expect(variables("oria-glass")["--oria-effect-backdropBlur-xl"]).toBe("42px");
    expect(variables("oria-glass")["--oria-typography-font-sans"]).toContain("-apple-system");
    expect(variables("oria-glass")["--oria-elevation-shadow-highlight"]!.split(",")).toHaveLength(6);
    expect(variables("oria-glass")["--oria-elevation-shadow-md"]!.split(",")).toHaveLength(7);
    expect(variables("oria-glass", "dark")["--oria-color-primary"]).toBe("#4ac5ff");
    expect(variables("oria-document-canvas")["--oria-color-background"]).toBe("#eeeeef");
    expect(variables("oria-document-canvas")["--oria-color-primary"]).toBe("#292a31");
    expect(variables("oria-document-canvas")["--oria-typography-font-display"]).toContain("SFMono-Regular");
    expect(variables("oria-document-canvas")["--oria-shape-radius-md"]).toBe("0");
    expect(variables("oria-document-canvas")["--oria-color-border"]).toBe("#ffffffcc");
    expect(variables("oria-document-canvas")["--oria-elevation-shadow-highlight"]).toContain("inset");
    expect(variables("oria-document-canvas")["--oria-pattern-surface"]).toContain("data:image/svg+xml");
    expect(variables("oria-document-canvas", "dark")["--oria-color-background"]).toBe("#1b1c21");
    expect(variables("oria-document-canvas", "dark")["--oria-color-border"]).toBe("#ffffff1f");
    expect(variables("oria-neo-brutalism")["--oria-shape-borderWidth-strong"]).toBe("3px");
    expect(variables("oria-neo-brutalism")["--oria-elevation-shadow-md"]).toContain("7px 7px 0 0");
    expect(oriaPunchcardTheme.id).toBe("oria-punchcard");
    expect(variables("oria-punchcard")["--oria-color-background"]).toBe("#fff2da");
    expect(variables("oria-punchcard")["--oria-color-secondary"]).toBe("#f4a4bd");
    expect(variables("oria-punchcard")["--oria-color-accent"]).toBe("#9ed4f2");
    expect(variables("oria-punchcard")["--oria-shape-borderWidth-strong"]).toBe("2px");
    expect(variables("oria-punchcard")["--oria-elevation-shadow-lg"]).toContain("8px 8px 0 0");
    expect(variables("oria-punchcard")["--oria-pattern-surface"]).toBe("radial-gradient(circle at center, #2a25201f 0 0.9px, transparent 0.9px) 0 0 / 1rem 1rem repeat");
    expect(variables("oria-punchcard", "dark")["--oria-pattern-surface"]).toBe("radial-gradient(circle at center, #fff1d926 0 0.9px, transparent 0.9px) 0 0 / 1rem 1rem repeat");
    expect(variables("oria-ocean")["--oria-pattern-surface"]).toBeUndefined();
    expect(oriaSketchbookTheme.id).toBe("oria-sketchbook");
    expect(variables("oria-sketchbook")["--oria-color-background"]).toBe("#fffefa");
    expect(variables("oria-sketchbook")["--oria-color-primary"]).toBe("#2d2927");
    expect(variables("oria-sketchbook")["--oria-color-secondary"]).toBe("#b7f3c5");
    expect(variables("oria-sketchbook")["--oria-color-accent"]).toBe("#ffe49c");
    expect(variables("oria-sketchbook")["--oria-typography-font-display"]).toContain("Chalkboard SE");
    expect(variables("oria-sketchbook")["--oria-shape-borderWidth-default"]).toBe("2px");
    expect(variables("oria-sketchbook")["--oria-pattern-surface"]).toContain("radial-gradient");
    expect(variables("oria-sketchbook")["--oria-pattern-surface"]).toContain("data:image/svg+xml");
    expect(variables("oria-sketchbook", "dark")["--oria-color-background"]).toBe("#211f1c");
    expect(oriaSoftClayTheme.id).toBe("oria-soft-clay");
    expect(variables("oria-soft-clay")["--oria-color-background"]).toBe("#f3f0eb");
    expect(variables("oria-soft-clay")["--oria-color-primary"]).toBe("#e9781c");
    expect(variables("oria-soft-clay")["--oria-typography-font-sans"]).toContain("ui-rounded");
    expect(variables("oria-soft-clay")["--oria-shape-radius-lg"]).toBe("2.75rem");
    expect(variables("oria-soft-clay")["--oria-elevation-shadow-lg"]!.split(",")).toHaveLength(3);
    expect(variables("oria-soft-clay")["--oria-gradient-surface"]).toContain("#ffffff");
    expect(variables("oria-soft-clay", "dark")["--oria-color-background"]).toBe("#28221d");
    expect(oriaGoldenBazaarTheme.id).toBe("oria-golden-bazaar");
    expect(variables("oria-golden-bazaar")["--oria-color-background"]).toBe("#fff0d8");
    expect(variables("oria-golden-bazaar")["--oria-color-primary"]).toBe("#f4b522");
    expect(variables("oria-golden-bazaar")["--oria-color-secondary"]).toBe("#f06d36");
    expect(variables("oria-golden-bazaar")["--oria-color-accent"]).toBe("#413896");
    expect(variables("oria-golden-bazaar")["--oria-shape-radius-lg"]).toBe("2.625rem");
    expect(variables("oria-golden-bazaar")["--oria-gradient-background"]).toContain("radial-gradient");
    expect(variables("oria-golden-bazaar")["--oria-elevation-shadow-lg"]!.split(",")).toHaveLength(2);
    expect(variables("oria-golden-bazaar", "dark")["--oria-color-background"]).toBe("#2b1c16");
    expect(oriaTheoremTheme.id).toBe("oria-theorem");
    expect(variables("oria-theorem")["--oria-color-background"]).toBe("#f0ede5");
    expect(variables("oria-theorem")["--oria-color-primary"]).toBe("#27231e");
    expect(variables("oria-theorem")["--oria-color-accent"]).toBe("#8d3029");
    expect(variables("oria-theorem")["--oria-typography-font-display"]).toContain("Iowan Old Style");
    expect(variables("oria-theorem")["--oria-shape-radius-lg"]).toBe("0");
    expect(variables("oria-theorem")["--oria-color-scrim"]).toBe("#25231f59");
    expect(variables("oria-theorem")["--oria-elevation-shadow-md"]).toBe("");
    expect(variables("oria-theorem")["--oria-elevation-shadow-lg"]).toBe("8px 10px 0 0 #6b675f91, 0 18px 36px -18px #24221d59");
    expect(variables("oria-theorem", "dark")["--oria-color-background"]).toBe("#292824");
    expect(variables("oria-neumorphism")["--oria-elevation-shadow-md"]!.split(",")).toHaveLength(2);
    expect(variables("oria-editorial")["--oria-typography-size-4xl"]).toBe("4.5rem");
    expect(variables("oria-retro-terminal")["--oria-shape-radius-md"]).toBe("0");
    expect(variables("oria-retro-terminal")["--oria-typography-font-display"]).toContain("SFMono-Regular");
    expect(variables("oria-aurora", "dark")["--oria-gradient-accent"]).toContain("#86ee9f");
    expect(variables("oria-premium", "dark")["--oria-color-primary"]).toBe("#d7bd7a");
    expect(oriaMinimalismTheme.id).toBe("oria-minimalism");
    expect(variables("oria-minimalism")["--oria-color-primary"]).toBe("#202020");
    expect(variables("oria-minimalism")["--oria-color-success"]).toBe("#3d3d3d");
    expect(variables("oria-minimalism", "dark")["--oria-color-primary"]).toBe("#d4d4d4");
    expect(oriaLineArtTheme.id).toBe("oria-line-art");
    expect(variables("oria-line-art")["--oria-color-background"]).toBe("#ffffff");
    expect(variables("oria-line-art")["--oria-color-border"]).toBe("#1f1f1f");
    expect(variables("oria-line-art")["--oria-color-success"]).toBe("#303030");
    expect(variables("oria-line-art")["--oria-elevation-shadow-md"]).toBe("");
  });

  it("uses intentional, monotonic radius languages for every theme", () => {
    const radiusKeys = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const;
    const radii = (id: string) => {
      const variables = resolveTheme(oriaPresetThemes.find(theme => theme.id === id)!, "light").variables;
      return radiusKeys.map(key => Number.parseFloat(variables[`--oria-shape-radius-${key}`] ?? "NaN"));
    };

    for (const theme of oriaPresetThemes) {
      const values = radii(theme.id);
      expect(values.every(Number.isFinite), `${theme.id} radius values`).toBe(true);
      expect(values, `${theme.id} radius scale`).toEqual([...values].sort((a, b) => a - b));
    }

    for (const id of ["oria-neo-brutalism", "oria-cyberpunk", "oria-retro-terminal"]) expect(radii(id)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(radii("oria-editorial")).toEqual([0, 0, 0.125, 0.25, 0.375, 0.5, 0.75, 1]);
    expect(radii("oria-line-art")).toEqual([0, 0, 0, 0.125, 0.125, 0.25, 0.375, 0.5]);
    expect(radii("oria-punchcard")).toEqual([0.25, 0.5, 0.75, 1, 1.25, 1.5, 2.25, 3]);
    expect(radii("oria-glass")).toEqual([0.25, 0.5, 0.75, 0.9, 1.25, 1.75, 2.625, 3.5]);
    expect(radii("oria-y2k")).toEqual([0.5, 1, 1.5, 2.25, 3.25, 4, 6, 8]);
    expect(radii("oria-kawaii")).toEqual([0.75, 1, 1.5, 2.25, 3.5, 5, 7.5, 10]);
  });

  it("keeps the extended typography and blur scales ordered", () => {
    const sizeKeys = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl"] as const;
    const lineHeightKeys = ["tight", "snug", "normal", "relaxed", "loose"] as const;
    const letterSpacingKeys = ["tighter", "tight", "normal", "wide", "wider", "widest"] as const;
    const blurKeys = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;

    for (const theme of oriaPresetThemes) {
      const variables = resolveTheme(theme, "light").variables;
      const ordered = (prefix: `--${string}`, keys: readonly string[]) => keys.map(key => Number.parseFloat(variables[`${prefix}${key}` as `--${string}`] ?? "NaN"));
      for (const [label, values] of [
        ["type size", ordered("--oria-typography-size-", sizeKeys)],
        ["line height", ordered("--oria-typography-lineHeight-", lineHeightKeys)],
        ["letter spacing", ordered("--oria-typography-letterSpacing-", letterSpacingKeys)],
        ["blur", ordered("--oria-effect-blur-", blurKeys)],
        ["backdrop blur", ordered("--oria-effect-backdropBlur-", blurKeys)]
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

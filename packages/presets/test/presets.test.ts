import { analyzeTheme, oriaStandardContract, resolveTheme, validateTheme } from "@oriatheme/core";
import { describe, expect, it } from "vitest";
import { hexToOklch } from "../src/oklch.js";
import { oriaOceanTheme as oceanSubpathTheme } from "../src/themes/ocean.js";
import { oriaRedlineTheme as redlineSubpathTheme } from "../src/themes/redline.js";
import { oriaLineBlazeTheme as lineBlazeSubpathTheme } from "../src/themes/line-blaze.js";
import { oriaGreenLiteTheme as greenLiteSubpathTheme } from "../src/themes/green-lite.js";
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
  oriaRedlineTheme,
  oriaLineBlazeTheme,
  oriaGreenLiteTheme,
  oriaPresetCatalog,
  oriaPresetThemes,
  oriaWarmReadingTheme
} from "../src/index.js";

const expectedThemeIds = [
  "oria-default", "oria-manuscript",
  "oria-mono", "oria-minimalism", "oria-line-art", "oria-glass", "oria-neo-brutalism", "oria-punchcard", "oria-sketchbook", "oria-soft-clay", "oria-golden-bazaar", "oria-theorem", "oria-redline", "oria-line-blaze", "oria-green-lite", "oria-neumorphism", "oria-memphis",
  "oria-ocean", "oria-forest", "oria-aurora",
  "oria-warm-reading", "oria-monochrome-deploy", "oria-precision-flow", "oria-elevated-surface",
  "oria-bento-ui", "oria-dashboard", "oria-editorial", "oria-ai-native", "oria-command-center", "oria-spatial-ui",
  "oria-soft-ui", "oria-cyberpunk", "oria-y2k", "oria-retro-terminal", "oria-paper",
  "oria-calm", "oria-playful", "oria-premium", "oria-organic", "oria-cottagecore", "oria-nature", "oria-retro", "oria-kawaii", "oria-sunset"
];

const resolveV2 = (theme: (typeof oriaPresetThemes)[number], mode: "light" | "dark") => resolveTheme(theme, mode, { contract: oriaStandardContract }).variables;
const oklchColors = (colors: readonly string[]): readonly string[] => colors.map(hexToOklch);
const oklchCss = (value: string): string => value.replace(/#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})\b/gi, color => hexToOklch(color));

describe("Oria preset collection", () => {
  it("exports all 44 stable, unique preset identities as Contract v2 themes", () => {
    expect(oriaPresetThemes.map(theme => theme.id)).toEqual(expectedThemeIds);
    expect(new Set(oriaPresetThemes.map(theme => theme.id)).size).toBe(oriaPresetThemes.length);
    for (const theme of oriaPresetThemes) {
      expect(theme.kind).toBe("preset");
      expect(theme.contract).toEqual({ name: "oria-standard", version: 2 });
      expect(validateTheme(theme, oriaStandardContract).ok, theme.id).toBe(true);
      expect(resolveV2(theme, "light")["--oria-radius-lg"], theme.id).toBeDefined();
      expect(JSON.stringify(theme.modes), `${theme.id} contains a legacy HEX value`).not.toMatch(/#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})\b/i);
    }
  });

  it("keeps a granular theme module identical to its root named export", () => {
    expect(oceanSubpathTheme).toBe(oriaOceanTheme);
    expect(oceanSubpathTheme.id).toBe("oria-ocean");
    expect(redlineSubpathTheme).toBe(oriaRedlineTheme);
    expect(redlineSubpathTheme.id).toBe("oria-redline");
    expect(lineBlazeSubpathTheme).toBe(oriaLineBlazeTheme);
    expect(lineBlazeSubpathTheme.id).toBe("oria-line-blaze");
    expect(greenLiteSubpathTheme).toBe(oriaGreenLiteTheme);
    expect(greenLiteSubpathTheme.id).toBe("oria-green-lite");
  });

  it("fully validates, resolves, compiles safe CSS values, and meets contrast guidance", () => {
    // Glass deliberately ships translucent raised surfaces whose alpha stops static
    // contrast computation. These two warnings are an intentional, documented
    // exception (see docs/specifications/preset-catalog.md).
    const documentedWarnings = new Map<string, string[]>([
      ["oria-glass", [
        "color.surface.raised/color.surface.raised.fg (light)",
        "color.surface.raised/color.surface.raised.fg (dark)"
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
      light: oklchColors(["#d53740", "#1f9058", "#c15701", "#1982bd"]),
      dark: oklchColors(["#f46767", "#56b17c", "#fba171", "#52a4db"])
    };
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
    expect(feedbackKeys.map(key => lineArt[`--oria-color-${key}`])).toEqual(oklchColors(["#111111", "#303030", "#4f4f4f", "#686868"]));

    const monochromeDeploy = resolveV2(oriaPresetThemes.find(theme => theme.id === "oria-monochrome-deploy")!, "light");
    expect(feedbackKeys.map(key => monochromeDeploy[`--oria-color-${key}`])).toEqual(oklchColors(["#171717", "#4a4a4a", "#737373", "#a3a3a3"]));
    expect(chartSignatures.size).toBeGreaterThanOrEqual(5);

    const chartsFor = (id: string, mode: "light" | "dark" = "light") => {
      const variables = resolveV2(oriaPresetThemes.find(theme => theme.id === id)!, mode);
      return Array.from({ length: 7 }, (_, index) => variables[`--oria-color-chart-${index + 2}` as `--${string}`]);
    };
    expect(chartsFor("oria-ocean")).toEqual(oklchColors(["#1488a4", "#1c8c85", "#1982bd", "#3675e2", "#626bdc", "#1f9058", "#d53740"]));
    expect(chartsFor("oria-forest")).toEqual(oklchColors(["#1a8f6b", "#1c8c85", "#1982bd", "#5e8a0a", "#3675e2", "#c15701", "#d53740"]));
    expect(chartsFor("oria-elevated-surface")).toEqual(oklchColors(["#626bdc", "#7d60db", "#9756cc", "#bc3cae", "#3675e2", "#d53740", "#c15701"]));
    expect(chartsFor("oria-warm-reading")).toEqual(oklchColors(["#c15701", "#a36e09", "#b49a24", "#cc415d", "#d53740", "#3675e2", "#1c8c85"]));
  });

  it("keeps Glass translucent while using the restrained semantic and data palette", () => {
    const feedbackKeys = ["danger", "success", "warning", "info"] as const;
    const chartKeys = Array.from({ length: 8 }, (_, index) => `--oria-color-chart-${index + 1}` as `--${string}`);
    const light = resolveV2(oriaGlassTheme, "light");
    const dark = resolveV2(oriaGlassTheme, "dark");

    expect(feedbackKeys.map(key => light[`--oria-color-${key}`])).toEqual(oklchColors(["#d53740", "#1f9058", "#c15701", "#1982bd"]));
    expect(feedbackKeys.map(key => dark[`--oria-color-${key}`])).toEqual(oklchColors(["#f46767", "#56b17c", "#fba171", "#52a4db"]));
    expect(chartKeys.map(key => light[key])).toEqual(["oklch(76% 0.12 241.1147)", ...oklchColors(["#1488a4", "#1c8c85", "#1982bd", "#3675e2", "#626bdc", "#1f9058", "#d53740"])]);
    expect(chartKeys.map(key => dark[key])).toEqual(["oklch(87.4159% 0.066631 241.1147)", ...oklchColors(["#48a9c7", "#4caea6", "#52a4db", "#5f99fe", "#8390f8", "#56b17c", "#f46767"])]);
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
    expect(variables("oria-glass")["--oria-color-primary"]).toBe("oklch(76% 0.12 241.1147)");
    expect(variables("oria-glass")["--oria-color-ring"]).toBe("oklch(76% 0.12 241.1147)");
    expect(variables("oria-glass", "dark")["--oria-color-primary"]).toBe("oklch(87.4159% 0.066631 241.1147)");
    expect(variables("oria-glass", "dark")["--oria-color-chart-1"]).toBe("oklch(87.4159% 0.066631 241.1147)");
    expect(variables("oria-glass", "dark")["--oria-color-surface"]).toBe(hexToOklch("#181818"));
    expect(variables("oria-glass", "dark")["--oria-color-muted"]).toBe("oklch(29% 0.014 241.1147)");
    expect(variables("oria-glass")["--oria-color-surface-raised"]).toBe(hexToOklch("#f8f8f880"));
    expect(variables("oria-glass", "dark")["--oria-color-surface-raised"]).toBe(hexToOklch("#101010a0"));
    expect(variables("oria-glass")["--oria-gradient-bg"]).toBeUndefined();
    expect(variables("oria-glass", "dark")["--oria-gradient-bg"]).toBeUndefined();
    expect(variables("oria-manuscript")["--oria-color-bg"]).toBe(hexToOklch("#eeeeef"));
    expect(variables("oria-manuscript")["--oria-color-primary"]).toBe(hexToOklch("#292a31"));
    expect(variables("oria-manuscript")["--oria-font-display"]).toContain("SFMono-Regular");
    expect(variables("oria-manuscript")["--oria-radius-md"]).toBe("0");
    expect(variables("oria-manuscript")["--oria-color-border"]).toBe(hexToOklch("#ffffffcc"));
    expect(variables("oria-manuscript")["--oria-shadow-highlight"]).toContain("inset");
    expect(variables("oria-manuscript")["--oria-pattern-surface"]).toContain("data:image/svg+xml");
    expect(variables("oria-manuscript", "dark")["--oria-color-bg"]).toBe(hexToOklch("#1b1c21"));
    expect(variables("oria-manuscript", "dark")["--oria-color-border"]).toBe(hexToOklch("#ffffff1f"));
    expect(variables("oria-neo-brutalism")["--oria-border-width-strong"]).toBe("3px");
    expect(variables("oria-neo-brutalism")["--oria-shadow-md"]).toContain("7px 7px 0 0");
    expect(oriaPunchcardTheme.id).toBe("oria-punchcard");
    expect(variables("oria-punchcard")["--oria-color-bg"]).toBe(hexToOklch("#fff2da"));
    expect(variables("oria-punchcard")["--oria-color-secondary"]).toBe(hexToOklch("#f4a4bd"));
    expect(variables("oria-punchcard")["--oria-color-accent"]).toBe(hexToOklch("#9ed4f2"));
    expect(variables("oria-punchcard")["--oria-border-width-strong"]).toBe("2px");
    expect(variables("oria-punchcard")["--oria-shadow-lg"]).toContain("8px 8px 0 0");
    expect(variables("oria-punchcard")["--oria-pattern-surface"]).toBe(oklchCss("radial-gradient(circle at center, #2a25201f 0 1.5px, transparent 1.5px) 0 0 / 1.5rem 1.5rem repeat"));
    expect(variables("oria-punchcard", "dark")["--oria-pattern-surface"]).toBe(oklchCss("radial-gradient(circle at center, #fff1d91f 0 1.5px, transparent 1.5px) 0 0 / 1.5rem 1.5rem repeat"));
    expect(variables("oria-ocean")["--oria-pattern-surface"]).toBeUndefined();
    expect(oriaSketchbookTheme.id).toBe("oria-sketchbook");
    expect(variables("oria-sketchbook")["--oria-color-bg"]).toBe(hexToOklch("#fffefa"));
    expect(variables("oria-sketchbook")["--oria-color-primary"]).toBe(hexToOklch("#2d2927"));
    expect(variables("oria-sketchbook")["--oria-color-secondary"]).toBe(hexToOklch("#b7f3c5"));
    expect(variables("oria-sketchbook")["--oria-color-accent"]).toBe(hexToOklch("#ffe49c"));
    expect(variables("oria-sketchbook")["--oria-font-display"]).toContain("Chalkboard SE");
    expect(variables("oria-sketchbook")["--oria-border-width-default"]).toBe("2px");
    expect(variables("oria-sketchbook")["--oria-pattern-bg"]).toBe(oklchCss("radial-gradient(circle at center, #2a25200f 0 1.5px, transparent 1.5px) 0 0 / 2rem 2rem repeat"));
    expect(variables("oria-sketchbook")["--oria-pattern-surface"]).toBe(oklchCss("repeating-linear-gradient(0deg, #2a25200f 0 1px, transparent 1px 1.5rem), repeating-linear-gradient(90deg, #2a25200f 0 1px, transparent 1px 1.5rem)"));
    expect(variables("oria-sketchbook", "dark")["--oria-pattern-bg"]).toBe(oklchCss("radial-gradient(circle at center, #6060601f 0 1.5px, transparent 1.5px) 0 0 / 2rem 2rem repeat"));
    expect(variables("oria-sketchbook", "dark")["--oria-pattern-surface"]).toBe(oklchCss("repeating-linear-gradient(0deg, #f6f1e710 0 1px, transparent 1px 1.5rem), repeating-linear-gradient(90deg, #f6f1e710 0 1px, transparent 1px 1.5rem)"));
    expect(variables("oria-sketchbook", "dark")["--oria-color-bg"]).toBe(hexToOklch("#211f1c"));
    expect(oriaSoftClayTheme.id).toBe("oria-soft-clay");
    expect(variables("oria-soft-clay")["--oria-color-bg"]).toBe(hexToOklch("#f3f0eb"));
    expect(variables("oria-soft-clay")["--oria-color-primary"]).toBe(hexToOklch("#e9781c"));
    expect(variables("oria-soft-clay")["--oria-font-sans"]).toContain("ui-rounded");
    expect(variables("oria-soft-clay")["--oria-radius-lg"]).toBe("1.5rem");
    expect(variables("oria-soft-clay")["--oria-shadow-lg"]!.split(",")).toHaveLength(3);
    expect(variables("oria-soft-clay")["--oria-gradient-surface"]).toContain(hexToOklch("#ffffff"));
    expect(variables("oria-soft-clay", "dark")["--oria-color-bg"]).toBe(hexToOklch("#28221d"));
    expect(oriaGoldenBazaarTheme.id).toBe("oria-golden-bazaar");
    expect(variables("oria-golden-bazaar")["--oria-color-bg"]).toBe(hexToOklch("#fff0d8"));
    expect(variables("oria-golden-bazaar")["--oria-color-primary"]).toBe(hexToOklch("#f4b522"));
    expect(variables("oria-golden-bazaar")["--oria-color-secondary"]).toBe(hexToOklch("#f06d36"));
    expect(variables("oria-golden-bazaar")["--oria-color-accent"]).toBe(hexToOklch("#413896"));
    expect(variables("oria-golden-bazaar")["--oria-radius-lg"]).toBe("1.5rem");
    expect(variables("oria-golden-bazaar")["--oria-gradient-bg"]).toContain("radial-gradient");
    expect(variables("oria-golden-bazaar")["--oria-shadow-lg"]!.split(",")).toHaveLength(2);
    expect(variables("oria-golden-bazaar", "dark")["--oria-color-bg"]).toBe(hexToOklch("#2b1c16"));
    expect(oriaTheoremTheme.id).toBe("oria-theorem");
    expect(variables("oria-theorem")["--oria-color-bg"]).toBe(hexToOklch("#f0ede5"));
    expect(variables("oria-theorem")["--oria-color-primary"]).toBe(hexToOklch("#27231e"));
    expect(variables("oria-theorem")["--oria-color-accent"]).toBe(hexToOklch("#8d3029"));
    expect(variables("oria-theorem")["--oria-font-display"]).toContain("Iowan Old Style");
    expect(variables("oria-theorem")["--oria-radius-lg"]).toBe("0");
    expect(variables("oria-theorem")["--oria-color-scrim"]).toBe(hexToOklch("#25231f59"));
    expect(variables("oria-theorem")["--oria-shadow-md"]).toBe("");
    expect(variables("oria-theorem")["--oria-shadow-lg"]).toBe(oklchCss("8px 10px 0 0 #6b675f91, 0 18px 36px -18px #24221d59"));
    expect(variables("oria-theorem")["--oria-pattern-bg"]).toContain("data:image/svg+xml");
    expect(variables("oria-theorem")["--oria-pattern-bg"]).toContain("80px 80px");
    expect(variables("oria-theorem", "dark")["--oria-pattern-bg"]).toContain("data:image/svg+xml");
    expect(variables("oria-theorem", "dark")["--oria-color-bg"]).toBe(hexToOklch("#292824"));
    expect(oriaRedlineTheme.id).toBe("oria-redline");
    expect(variables("oria-redline")["--oria-color-bg"]).toBe(hexToOklch("#fbfaf7"));
    expect(variables("oria-redline")["--oria-color-primary"]).toBe(hexToOklch("#d5534b"));
    expect(variables("oria-redline")["--oria-color-secondary"]).toBe(hexToOklch("#a1a3a2"));
    expect(variables("oria-redline")["--oria-font-display"]).toContain("Avenir Next");
    expect(variables("oria-redline")["--oria-radius-lg"]).toBe("0");
    expect(variables("oria-redline")["--oria-shadow-md"]).toBe("");
    expect(variables("oria-redline")["--oria-pattern-bg"]).toContain("data:image/svg+xml");
    expect(variables("oria-redline")["--oria-pattern-surface"]).toContain("data:image/svg+xml");
    expect(variables("oria-redline")["--oria-pattern-surface"]).toContain("100px 100px");
    expect(variables("oria-redline", "dark")["--oria-color-bg"]).toBe(hexToOklch("#1d1918"));
    expect(variables("oria-redline", "dark")["--oria-color-primary"]).toBe(hexToOklch("#e36e67"));
    expect(oriaLineBlazeTheme.id).toBe("oria-line-blaze");
    expect(variables("oria-line-blaze")["--oria-color-bg"]).toBe(hexToOklch("#f7f6f2"));
    expect(variables("oria-line-blaze")["--oria-color-primary"]).toBe(hexToOklch("#d33f20"));
    expect(variables("oria-line-blaze")["--oria-color-secondary"]).toBe(hexToOklch("#24282a"));
    expect(variables("oria-line-blaze")["--oria-color-border"]).toBe(hexToOklch("#3a3e40"));
    expect(variables("oria-line-blaze")["--oria-font-display"]).toContain("SFMono-Regular");
    expect(variables("oria-line-blaze")["--oria-text-4xl"]).toBe("1.5rem");
    expect(variables("oria-line-blaze")["--oria-blur-lg"]).toBe("0");
    expect(variables("oria-line-blaze")["--oria-backdrop-blur-lg"]).toBe("0px");
    expect(variables("oria-line-blaze")["--oria-border-width-default"]).toBe("2px");
    expect(variables("oria-line-blaze")["--oria-border-width-strong"]).toBe("2px");
    expect(variables("oria-line-blaze")["--oria-radius-lg"]).toBe("0");
    expect(variables("oria-line-blaze")["--oria-shadow-md"]).toBe("");
    expect(variables("oria-line-blaze")["--oria-pattern-bg"]).toContain("radial-gradient");
    expect(variables("oria-line-blaze")["--oria-pattern-bg"]).toContain("1.5rem 1.5rem");
    expect(variables("oria-line-blaze")["--oria-pattern-surface"]).toContain("1rem 1rem");
    expect(variables("oria-line-blaze", "dark")["--oria-color-bg"]).toBe(hexToOklch("#181a1b"));
    expect(variables("oria-line-blaze", "dark")["--oria-color-primary"]).toBe(hexToOklch("#ff6a42"));
    expect(oriaGreenLiteTheme.id).toBe("oria-green-lite");
    expect(variables("oria-green-lite")["--oria-color-bg"]).toBe(hexToOklch("#ffffff"));
    expect(variables("oria-green-lite")["--oria-gradient-bg"]!.split(hexToOklch("#ffffff"))).toHaveLength(4);
    expect(variables("oria-green-lite")["--oria-color-primary"]).toBe(hexToOklch("#4fd97d"));
    expect(variables("oria-green-lite")["--oria-border-width-default"]).toBe("1px");
    expect(variables("oria-green-lite")["--oria-radius-lg"]).toBe("1.25rem");
    expect(variables("oria-green-lite")["--oria-backdrop-blur-lg"]).toBe("20px");
    expect(variables("oria-green-lite")["--oria-gradient-surface"]).toContain(hexToOklch("#ffffffc2"));
    expect(variables("oria-green-lite")["--oria-pattern-bg"]).toContain("radial-gradient");
    expect(variables("oria-green-lite")["--oria-pattern-bg"]).toContain("1.25rem 1.25rem");
    expect(variables("oria-green-lite")["--oria-pattern-surface"]).toBeUndefined();
    expect(variables("oria-green-lite")["--oria-shadow-inner"]).toBe("");
    expect(variables("oria-green-lite")["--oria-shadow-md"]).not.toContain(hexToOklch("#4fd97d"));
    expect(variables("oria-green-lite", "dark")["--oria-color-bg"]).toBe(hexToOklch("#050606"));
    expect(variables("oria-green-lite", "dark")["--oria-color-primary"]).toBe(hexToOklch("#71ee99"));
    expect(variables("oria-green-lite", "dark")["--oria-pattern-surface"]).toBeUndefined();
    expect(variables("oria-green-lite", "dark")["--oria-shadow-md"]).not.toContain(hexToOklch("#71ee99"));
    expect(variables("oria-neumorphism")["--oria-shadow-md"]!.split(",")).toHaveLength(2);
    expect(variables("oria-editorial")["--oria-text-4xl"]).toBe("4.5rem");
    expect(variables("oria-retro-terminal")["--oria-radius-md"]).toBe("0");
    expect(variables("oria-retro-terminal")["--oria-font-display"]).toContain("SFMono-Regular");
    expect(variables("oria-aurora", "dark")["--oria-gradient-accent"]).toContain(hexToOklch("#86ee9f"));
    expect(variables("oria-premium", "dark")["--oria-color-primary"]).toBe(hexToOklch("#d7bd7a"));
    expect(oriaMinimalismTheme.id).toBe("oria-minimalism");
    expect(variables("oria-minimalism")["--oria-color-primary"]).toBe(hexToOklch("#202020"));
    expect(variables("oria-minimalism")["--oria-color-success"]).toBe(hexToOklch("#3d3d3d"));
    expect(variables("oria-minimalism", "dark")["--oria-color-primary"]).toBe(hexToOklch("#d4d4d4"));
    expect(oriaLineArtTheme.id).toBe("oria-line-art");
    expect(variables("oria-line-art")["--oria-color-bg"]).toBe(hexToOklch("#ffffff"));
    expect(variables("oria-line-art")["--oria-color-border"]).toBe(hexToOklch("#1f1f1f"));
    expect(variables("oria-line-art")["--oria-color-success"]).toBe(hexToOklch("#303030"));
    expect(variables("oria-line-art")["--oria-shadow-md"]).toBe("");
    expect(["disabled", "muted", "overlay"].map(key => variables("oria-line-art")[`--oria-opacity-${key}` as `--${string}`])).toEqual(["1", "1", "1"]);
  });

  it("keeps every elevation scale complete and reserves material effects for themes that need them", () => {
    const materialInner = new Set(["oria-default", "oria-glass", "oria-neumorphism", "oria-soft-clay", "oria-paper", "oria-sketchbook", "oria-cottagecore"]);
    const materialHighlight = new Set(["oria-default", "oria-glass", "oria-green-lite", "oria-golden-bazaar", "oria-manuscript", "oria-y2k"]);

    for (const theme of oriaPresetThemes) {
      for (const mode of ["light", "dark"] as const) {
        const variables = resolveV2(theme, mode);
        const lg = variables["--oria-shadow-lg"]!;
        const xl = variables["--oria-shadow-xl"]!;
        const twoXl = variables["--oria-shadow-2xl"]!;
        if (lg !== "") {
          expect(xl, `${theme.id} ${mode} xl shadow`).not.toBe("");
          expect(twoXl, `${theme.id} ${mode} 2xl shadow`).not.toBe("");
          expect(new Set([lg, xl, twoXl]).size, `${theme.id} ${mode} upper elevation hierarchy`).toBe(3);
        }
        expect(variables["--oria-shadow-inner"] !== "", `${theme.id} ${mode} inner material`).toBe(materialInner.has(theme.id));
        expect(variables["--oria-shadow-highlight"] !== "", `${theme.id} ${mode} highlight material`).toBe(materialHighlight.has(theme.id));
      }
    }
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

    for (const id of ["oria-neo-brutalism", "oria-cyberpunk", "oria-retro-terminal", "oria-editorial", "oria-line-art", "oria-theorem", "oria-redline", "oria-line-blaze"]) expect(radii(id)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    for (const theme of oriaPresetThemes) expect(radii(theme.id)[5], `${theme.id} 2xl radius`).toBeLessThanOrEqual(3);
    expect(radii("oria-punchcard")).toEqual([0.1875, 0.375, 0.5625, 0.75, 1.125, 1.5, 2.25, 3]);
    expect(radii("oria-glass")).toEqual([0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4]);
    expect(radii("oria-y2k")).toEqual([0.375, 0.75, 1.125, 1.5, 2.25, 3, 4.5, 6]);
    expect(radii("oria-kawaii")).toEqual([0.375, 0.75, 1.125, 1.5, 2.25, 3, 4.5, 6]);
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

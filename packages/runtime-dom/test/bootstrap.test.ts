// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { oriaDefaultTheme, oriaStandardContract, resolveTheme } from "@oriatheme/core";
import type { ThemeDefinition, ThemeTokenSet } from "@oriatheme/core";
import { bootstrapTheme, createBootstrapScript, createBootstrapStorageScript, createOriaThemeRuntime } from "../src/index.js";

const domDocument = globalThis.document;
const snapshot = {
  schemaVersion: 1 as const,
  contract: oriaDefaultTheme.contract,
  themeId: "oria-default",
  appearance: "dark" as const,
  variablePrefix: "oria",
  lightVariables: resolveTheme(oriaDefaultTheme, "light", { contract: oriaStandardContract }).variables,
  darkVariables: resolveTheme(oriaDefaultTheme, "dark", { contract: oriaStandardContract }).variables
};
const darkBackground = snapshot.darkVariables["--oria-color-bg"];
afterEach(() => { domDocument.head.innerHTML = ""; domDocument.documentElement.removeAttribute("data-oria-theme"); domDocument.documentElement.removeAttribute("data-oria-mode"); globalThis.localStorage.clear(); });

describe("bootstrap", () => {
  it("applies a validated active snapshot without loading a preset collection", () => {
    bootstrapTheme({ snapshot, target: domDocument, contract: oriaDefaultTheme.contract });
    const style = domDocument.head.querySelector("style[data-oria-theme-bootstrap]");
    expect(style?.textContent).toContain(`--oria-color-bg:${darkBackground}`);
    expect(domDocument.documentElement.dataset.oriaMode).toBe("dark");
    const script = createBootstrapScript({ snapshot });
    expect(script).not.toContain("oriaStandardContract");
    expect(script).not.toContain("createOriaThemeRuntime");
    domDocument.head.innerHTML = "";
    Function(script)();
    expect(domDocument.head.querySelector("style[data-oria-theme-bootstrap]")?.textContent).toContain(`--oria-color-bg:${darkBackground}`);
  });

  it("silently retains static fallback when active snapshot validation fails", () => {
    bootstrapTheme({ snapshot: { ...snapshot, lightVariables: { "--oria-color-background": "#fff; color:red" } }, target: domDocument });
    expect(domDocument.head.querySelector("style[data-oria-theme-bootstrap]")).toBeNull();
    expect(domDocument.documentElement.dataset.oriaTheme).toBeUndefined();
  });

  it("rejects a v1 snapshot when the v2 contract is declared, keeping the static fallback", () => {
    bootstrapTheme({ snapshot: { ...snapshot, contract: { name: "oria-standard", version: 1 } }, target: domDocument, contract: { name: "oria-standard", version: 2 } });
    expect(domDocument.head.querySelector("style[data-oria-theme-bootstrap]")).toBeNull();
    expect(domDocument.documentElement.dataset.oriaTheme).toBeUndefined();
  });

  it("accepts Core-generated inline SVG pattern variables and still rejects arbitrary url() values", () => {
    const noiseTheme: ThemeDefinition = {
      ...oriaDefaultTheme,
      id: "oria-default-noise",
      modes: {
        light: { ...oriaDefaultTheme.modes.light, "pattern.surface": [{ type: "noise", variant: "paper", color: "#2d2927", tileSize: "52px", intensity: 0.055 }] } as ThemeTokenSet,
        dark: { ...oriaDefaultTheme.modes.dark, "pattern.surface": [{ type: "noise", variant: "paper", color: "#f6f1e7", tileSize: "52px", intensity: 0.045 }] } as ThemeTokenSet
      }
    };
    const noisySnapshot = { ...snapshot, themeId: "oria-default-noise", lightVariables: resolveTheme(noiseTheme, "light", { contract: oriaStandardContract }).variables, darkVariables: resolveTheme(noiseTheme, "dark", { contract: oriaStandardContract }).variables };
    expect(noisySnapshot.lightVariables["--oria-pattern-surface"]).toContain('url("data:image/svg+xml,');
    bootstrapTheme({ snapshot: noisySnapshot, target: domDocument });
    expect(domDocument.head.querySelector("style[data-oria-theme-bootstrap]")?.textContent).toContain("--oria-pattern-surface:url(\"data:image/svg+xml,");
    expect(domDocument.documentElement.dataset.oriaTheme).toBe("oria-default-noise");
    domDocument.head.innerHTML = ""; domDocument.documentElement.removeAttribute("data-oria-theme");
    bootstrapTheme({ snapshot: { ...snapshot, lightVariables: { ...snapshot.lightVariables, "--oria-pattern-surface": 'url("https://evil.example/tracker.png")' } }, target: domDocument });
    expect(domDocument.head.querySelector("style[data-oria-theme-bootstrap]")).toBeNull();
    bootstrapTheme({ snapshot: { ...snapshot, lightVariables: { ...snapshot.lightVariables, "--oria-pattern-surface": 'url( "data:image/svg+xml,%3Csvg%20onload=alert(1)%3E")' } }, target: domDocument });
    expect(domDocument.head.querySelector("style[data-oria-theme-bootstrap]")).toBeNull();
  });

  it("generates a head-safe script that validates and restores the stored active snapshot", () => {
    globalThis.localStorage.setItem("oria-theme:active:v1", JSON.stringify(snapshot));
    const script = createBootstrapStorageScript({ contract: oriaDefaultTheme.contract });
    expect(script).not.toContain("oriaPresetThemes");
    expect(script).not.toContain("createOriaThemeRuntime");
    Function(script)();
    expect(domDocument.head.querySelector("style[data-oria-theme-bootstrap]")?.textContent).toContain(`--oria-color-bg:${darkBackground}`);
    expect(domDocument.documentElement.dataset.oriaTheme).toBe("oria-default");
  });

  it("makes the storage script retain static fallback for invalid stored values", () => {
    globalThis.localStorage.setItem("oria-theme:active:v1", JSON.stringify({ ...snapshot, darkVariables: { "--oria-color-background": "#fff; color:red" } }));
    Function(createBootstrapStorageScript())();
    expect(domDocument.head.querySelector("style[data-oria-theme-bootstrap]")).toBeNull();
  });

  it("matches the runtime variable output and removes the one-shot bootstrap stylesheet on takeover", () => {
    bootstrapTheme({ snapshot, target: domDocument });
    const runtime = createOriaThemeRuntime({ presets: [oriaDefaultTheme], defaultThemeId: "oria-default", defaultAppearance: "dark", target: domDocument, storage: false });
    runtime.start();
    const runtimeCss = domDocument.head.querySelector("style[data-oria-theme-runtime]")?.textContent;
    expect(runtimeCss).toContain(`--oria-color-bg:${darkBackground}`);
    expect(domDocument.head.querySelector("style[data-oria-theme-bootstrap]")).toBeNull();
    runtime.destroy();
  });

  it("clears bootstrapped optional patterns and gradients that are absent from the runtime theme", () => {
    const bootstrappedOptionalMaterial = {
      ...snapshot,
      themeId: "oria-optional-material",
      lightVariables: {
        ...snapshot.lightVariables,
        "--oria-pattern-surface": "repeating-linear-gradient(45deg, #123456 0 1px, transparent 1px 8px)",
        "--oria-gradient-surface": "linear-gradient(135deg, #123456, #abcdef)"
      },
      darkVariables: {
        ...snapshot.darkVariables,
        "--oria-pattern-surface": "repeating-linear-gradient(45deg, #abcdef 0 1px, transparent 1px 8px)",
        "--oria-gradient-surface": "linear-gradient(135deg, #abcdef, #123456)"
      }
    };
    bootstrapTheme({ snapshot: bootstrappedOptionalMaterial, target: domDocument });
    expect(domDocument.head.querySelector("style[data-oria-theme-bootstrap]")?.textContent).toContain("--oria-pattern-surface");

    const runtime = createOriaThemeRuntime({ presets: [oriaDefaultTheme], defaultThemeId: "oria-default", defaultAppearance: "dark", target: domDocument, storage: false });
    runtime.start();

    const runtimeCss = domDocument.head.querySelector("style[data-oria-theme-runtime]")?.textContent;
    expect(runtimeCss).not.toContain("--oria-pattern-surface");
    expect(runtimeCss).not.toContain("--oria-gradient-surface");
    expect(domDocument.head.querySelector("style[data-oria-theme-bootstrap]")).toBeNull();
    runtime.destroy();
  });
});

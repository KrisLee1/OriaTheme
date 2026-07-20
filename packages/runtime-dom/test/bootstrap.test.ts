// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { oriaDefaultTheme, oriaStandardContract, resolveTheme } from "@oriatheme/core";
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
afterEach(() => { domDocument.head.innerHTML = ""; domDocument.documentElement.removeAttribute("data-oria-theme"); domDocument.documentElement.removeAttribute("data-oria-mode"); globalThis.localStorage.clear(); });

describe("bootstrap", () => {
  it("applies a validated active snapshot without loading a preset collection", () => {
    bootstrapTheme({ snapshot, target: domDocument, contract: oriaDefaultTheme.contract });
    const style = domDocument.head.querySelector("style[data-oria-theme-bootstrap]");
    expect(style?.textContent).toContain("--oria-color-background:#101418");
    expect(domDocument.documentElement.dataset.oriaMode).toBe("dark");
    const script = createBootstrapScript({ snapshot });
    expect(script).not.toContain("oriaStandardContract");
    expect(script).not.toContain("createOriaThemeRuntime");
    domDocument.head.innerHTML = "";
    Function(script)();
    expect(domDocument.head.querySelector("style[data-oria-theme-bootstrap]")?.textContent).toContain("--oria-color-background:#101418");
  });

  it("silently retains static fallback when active snapshot validation fails", () => {
    bootstrapTheme({ snapshot: { ...snapshot, lightVariables: { "--oria-color-background": "#fff; color:red" } }, target: domDocument });
    expect(domDocument.head.querySelector("style[data-oria-theme-bootstrap]")).toBeNull();
    expect(domDocument.documentElement.dataset.oriaTheme).toBeUndefined();
  });

  it("generates a head-safe script that validates and restores the stored active snapshot", () => {
    globalThis.localStorage.setItem("oria-theme:active:v1", JSON.stringify(snapshot));
    const script = createBootstrapStorageScript({ contract: oriaDefaultTheme.contract });
    expect(script).not.toContain("oriaPresetThemes");
    expect(script).not.toContain("createOriaThemeRuntime");
    Function(script)();
    expect(domDocument.head.querySelector("style[data-oria-theme-bootstrap]")?.textContent).toContain("--oria-color-background:#101418");
    expect(domDocument.documentElement.dataset.oriaTheme).toBe("oria-default");
  });

  it("makes the storage script retain static fallback for invalid stored values", () => {
    globalThis.localStorage.setItem("oria-theme:active:v1", JSON.stringify({ ...snapshot, darkVariables: { "--oria-color-background": "#fff; color:red" } }));
    Function(createBootstrapStorageScript())();
    expect(domDocument.head.querySelector("style[data-oria-theme-bootstrap]")).toBeNull();
  });

  it("matches the runtime variable output and permits formal runtime takeover", () => {
    bootstrapTheme({ snapshot, target: domDocument });
    const runtime = createOriaThemeRuntime({ presets: [oriaDefaultTheme], defaultThemeId: "oria-default", defaultAppearance: "dark", target: domDocument, storage: false });
    runtime.start();
    const bootstrapCss = domDocument.head.querySelector("style[data-oria-theme-bootstrap]")?.textContent;
    const runtimeCss = domDocument.head.querySelector("style[data-oria-theme-runtime]")?.textContent;
    expect(runtimeCss).toBe(bootstrapCss);
    runtime.destroy();
  });
});

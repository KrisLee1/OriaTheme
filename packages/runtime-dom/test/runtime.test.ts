// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cloneTheme, createThemeFromSeed, oriaDefaultTheme } from "@oriatheme/core";
import { createOriaThemeRuntime } from "../src/index.js";
import type { PersistedThemeStateV1, ThemeStorage } from "../src/index.js";

const domDocument = globalThis.document;
const baseConfig = () => ({ presets: [oriaDefaultTheme], defaultThemeId: "oria-default", target: domDocument, storage: false as const });
const originalMatchMedia = globalThis.matchMedia;
const originalViewTransition = (domDocument as Document & { startViewTransition?: unknown }).startViewTransition;
afterEach(() => { Object.defineProperty(globalThis, "matchMedia", { configurable: true, value: originalMatchMedia }); Object.defineProperty(domDocument, "startViewTransition", { configurable: true, value: originalViewTransition }); domDocument.head.innerHTML = ""; domDocument.documentElement.removeAttribute("data-oria-theme"); domDocument.documentElement.removeAttribute("data-oria-mode"); domDocument.documentElement.removeAttribute("data-oria-transition"); ["--oria-transition-x", "--oria-transition-y", "--oria-transition-radius", "--oria-transition-duration"].forEach(name => domDocument.documentElement.style.removeProperty(name)); globalThis.localStorage.clear(); });

describe("runtime DOM lifecycle", () => {
  it("is SSR-safe to construct and exposes an idle snapshot before start", () => {
    const runtime = createOriaThemeRuntime(baseConfig());
    expect(runtime.getSnapshot().status).toBe("idle");
    expect(runtime.getSnapshot().resolvedTheme.themeId).toBe("oria-default");
  });

  it("writes one owned stylesheet, attributes, and cleans them up idempotently", () => {
    const runtime = createOriaThemeRuntime(baseConfig());
    runtime.start(); runtime.start();
    const style = domDocument.head.querySelector("style[data-oria-theme-runtime]");
    expect(style).not.toBeNull();
    expect(domDocument.head.querySelector("style[data-oria-theme-transition]")).not.toBeNull();
    expect(domDocument.documentElement.dataset.oriaTheme).toBe("oria-default");
    expect(domDocument.documentElement.dataset.oriaMode).toBe("light");
    runtime.destroy(); runtime.destroy();
    expect(domDocument.head.querySelector("style[data-oria-theme-runtime]")).toBeNull();
    expect(domDocument.head.querySelector("style[data-oria-theme-transition]")).toBeNull();
  });

  it("writes an isolated fallback stylesheet for a ShadowRoot target", () => {
    const host = domDocument.createElement("div"); const shadow = host.attachShadow({ mode: "open" });
    const runtime = createOriaThemeRuntime({ presets: [oriaDefaultTheme], defaultThemeId: "oria-default", target: shadow, storage: false }); runtime.start();
    expect(shadow.querySelector("style[data-oria-theme-runtime]")).not.toBeNull();
    expect(host.dataset.oriaTheme).toBe("oria-default");
    runtime.destroy();
    expect(shadow.querySelector("style[data-oria-theme-runtime]")).toBeNull();
  });

  it("deduplicates equivalent stylesheet writes and keeps the latest rapid change", () => {
    const runtime = createOriaThemeRuntime(baseConfig()); runtime.start();
    const style = domDocument.head.querySelector("style[data-oria-theme-runtime]")!;
    let writes = 0; let text = style.textContent;
    Object.defineProperty(style, "textContent", { configurable: true, get: () => text, set: value => { writes += 1; text = String(value); } });
    const initial = text;
    runtime.setAppearance("light");
    expect(text).toBe(initial); expect(writes).toBe(0);
    runtime.setAppearance("dark"); runtime.setAppearance("light");
    expect(runtime.getSnapshot().resolvedMode).toBe("light");
    expect(text).toContain("--oria-color-background:#f1f3f4");
    expect(writes).toBe(2);
  });

  it("keeps the previous stylesheet and snapshot if a DOM replacement fails", () => {
    const error = vi.fn(); const runtime = createOriaThemeRuntime({ ...baseConfig(), onError: error }); runtime.start();
    const style = domDocument.head.querySelector("style[data-oria-theme-runtime]")!;
    const initial = style.textContent;
    Object.defineProperty(style, "textContent", { configurable: true, get: () => initial, set: () => { throw new Error("style failure"); } });
    runtime.setAppearance("dark");
    expect(style.textContent).toBe(initial);
    expect(runtime.getSnapshot().resolvedMode).toBe("light");
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ code: "DOM_APPLY_FAILED" }));
  });

  it("reacts to system changes without overwriting user appearance", () => {
    let listener: (() => void) | undefined;
    const query = { matches: false, addEventListener: vi.fn((_name: "change", next: () => void) => { listener = next; }), removeEventListener: vi.fn() };
    Object.defineProperty(globalThis, "matchMedia", { configurable: true, value: vi.fn(() => query) });
    const runtime = createOriaThemeRuntime(baseConfig()); runtime.start();
    query.matches = true; listener?.();
    expect(runtime.getSnapshot().resolvedMode).toBe("dark");
    expect(runtime.getSnapshot().preference.appearance).toBe("system");
    runtime.setAppearance("light"); query.matches = false; listener?.();
    expect(runtime.getSnapshot().resolvedMode).toBe("light");
    expect(runtime.getSnapshot().preference.appearance).toBe("light");
  });

  it("commits every rapid animated change and leaves the last state active", () => {
    const transitions: { skipTransition: ReturnType<typeof vi.fn>; finished: Promise<void> }[] = [];
    const transition = vi.fn((apply: () => void) => {
      apply(); const current = { skipTransition: vi.fn(), finished: new Promise<void>(() => undefined) }; transitions.push(current); return current;
    });
    Object.defineProperty(domDocument, "startViewTransition", { configurable: true, value: transition });
    const runtime = createOriaThemeRuntime({ ...baseConfig(), transition: { type: "view-transition" } }); runtime.start();
    runtime.setAppearance("dark", { animate: true }); runtime.setAppearance("light", { animate: true }); runtime.setAppearance("dark", { animate: true });
    expect(transition).toHaveBeenCalledTimes(3);
    expect(transitions[0]?.skipTransition).toHaveBeenCalledTimes(1);
    expect(transitions[1]?.skipTransition).toHaveBeenCalledTimes(1);
    expect(runtime.getSnapshot().resolvedMode).toBe("dark");
    expect(domDocument.head.querySelector("style[data-oria-theme-runtime]")?.textContent).toContain("--oria-color-background:#101418");
  });

  it("reveals the new theme from the requested circular origin and clears transient state", async () => {
    let finish!: () => void;
    const transition = { skipTransition: vi.fn(), finished: new Promise<void>(resolve => { finish = resolve; }) };
    Object.defineProperty(domDocument, "startViewTransition", { configurable: true, value: function (this: unknown, apply: () => void) { expect(this).toBe(domDocument); apply(); return transition; } });
    const runtime = createOriaThemeRuntime({ ...baseConfig(), transition: { type: "view-transition", duration: 500 } }); runtime.start();
    runtime.setAppearance("dark", { animate: true, origin: { x: 120, y: 80 } });
    const root = domDocument.documentElement;
    expect(root.dataset.oriaTransition).toBe("circle");
    expect(root.style.getPropertyValue("--oria-transition-x")).toBe("120px");
    expect(root.style.getPropertyValue("--oria-transition-y")).toBe("80px");
    expect(root.style.getPropertyValue("--oria-transition-duration")).toBe("500ms");
    expect(Number.parseFloat(root.style.getPropertyValue("--oria-transition-radius"))).toBeGreaterThan(120);
    expect(domDocument.head.querySelector("style[data-oria-theme-transition]")?.textContent).toContain("oria-theme-circle-reveal");
    finish(); await Promise.resolve(); await Promise.resolve();
    expect(root.hasAttribute("data-oria-transition")).toBe(false);
    expect(root.style.getPropertyValue("--oria-transition-radius")).toBe("");
  });

  it("falls back directly for reduced motion or missing View Transition support", () => {
    const transition = vi.fn((apply: () => void) => { apply(); return {}; });
    Object.defineProperty(domDocument, "startViewTransition", { configurable: true, value: transition });
    Object.defineProperty(globalThis, "matchMedia", { configurable: true, value: vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
    const runtime = createOriaThemeRuntime({ ...baseConfig(), transition: { type: "view-transition" } }); runtime.start(); runtime.setAppearance("light", { animate: true });
    expect(transition).not.toHaveBeenCalled(); expect(runtime.getSnapshot().resolvedMode).toBe("light");
    Object.defineProperty(domDocument, "startViewTransition", { configurable: true, value: undefined }); runtime.setAppearance("dark", { animate: true });
    expect(runtime.getSnapshot().resolvedMode).toBe("dark");
  });

  it("cleans an attribute adapter before replacement and destroy", () => {
    const cleanup = vi.fn(); const adapter = vi.fn(() => cleanup);
    const runtime = createOriaThemeRuntime({ ...baseConfig(), attributeAdapter: adapter }); runtime.start();
    runtime.setAppearance("dark"); runtime.destroy();
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledTimes(2);
  });
});

describe("persistence, custom themes, and preview", () => {
  it("rehydrates valid state and recovers from storage failure without losing in-memory updates", () => {
    const custom = cloneTheme(oriaDefaultTheme, { id: "stored-custom", name: "Stored" }, { now: () => 1 });
    const state: PersistedThemeStateV1 = { schemaVersion: 1, preference: { activeThemeId: "stored-custom", appearance: "dark" }, customThemes: [custom] };
    const storage: ThemeStorage = { read: () => state, write: vi.fn(), clear: vi.fn() };
    const runtime = createOriaThemeRuntime({ ...baseConfig(), storage }); runtime.start();
    expect(runtime.getSnapshot().preference.activeThemeId).toBe("stored-custom");
    expect(runtime.getSnapshot().resolvedMode).toBe("dark");
    const error = vi.fn();
    const broken: ThemeStorage = { read: () => null, write: () => { throw new Error("quota"); }, clear: vi.fn() };
    const failing = createOriaThemeRuntime({ ...baseConfig(), storage: broken, onError: error }); failing.start(); failing.setAppearance("dark");
    expect(failing.getSnapshot().preference.appearance).toBe("dark");
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ code: "STORAGE_WRITE_FAILED" }));
  });

  it("persists main state and active snapshot using the default LocalStorage adapter", () => {
    const runtime = createOriaThemeRuntime({ presets: [oriaDefaultTheme], defaultThemeId: "oria-default", target: domDocument, storageKey: "test-oria" }); runtime.start(); runtime.setAppearance("dark");
    expect(JSON.parse(globalThis.localStorage.getItem("test-oria:state:v1") ?? "{}").preference.appearance).toBe("dark");
    expect(JSON.parse(globalThis.localStorage.getItem("test-oria:active:v1") ?? "{}").darkVariables["--oria-color-background"]).toBe("#101418");
  });

  it("accepts external validated state while preserving an active preview", () => {
    let receive: (() => void) | undefined;
    const custom = cloneTheme(oriaDefaultTheme, { id: "external", name: "External" }, { now: () => 4 });
    let state: PersistedThemeStateV1 | null = null;
    const storage: ThemeStorage = { read: () => state, write: vi.fn(), clear: vi.fn(), subscribe: listener => { receive = listener; return () => { receive = undefined; }; } };
    const runtime = createOriaThemeRuntime({ ...baseConfig(), storage }); runtime.start();
    const preview = createThemeFromSeed({ color: "#b91c1c" }, { id: "preview-external", name: "Preview", clock: { now: () => 4 } });
    runtime.previewTheme(preview);
    state = { schemaVersion: 1, preference: { activeThemeId: "external", appearance: "dark" }, customThemes: [custom] };
    receive?.();
    expect(runtime.getSnapshot().resolvedTheme.themeId).toBe("preview-external");
    runtime.setTheme("external");
    expect(runtime.getSnapshot().resolvedTheme.themeId).toBe("external");
  });

  it("handles CRUD, import/export and preset immutability", () => {
    const runtime = createOriaThemeRuntime(baseConfig()); runtime.start();
    const custom = cloneTheme(oriaDefaultTheme, { id: "custom-theme", name: "Custom" }, { now: () => 2 });
    runtime.createCustomTheme({ theme: custom });
    runtime.updateCustomTheme("custom-theme", { name: "Renamed" });
    const duplicate = runtime.duplicateTheme("custom-theme", { id: "custom-copy", name: "Copy" });
    expect(duplicate.kind).toBe("custom");
    expect(runtime.exportTheme("custom-theme")).toContain("Renamed");
    expect(() => runtime.updateCustomTheme("oria-default", { name: "Nope" })).toThrow(expect.objectContaining({ code: "PRESET_IMMUTABLE" }));
    runtime.removeCustomTheme("custom-theme");
    expect(runtime.getSnapshot().customThemes.map(theme => theme.id)).toEqual(["custom-copy"]);
  });

  it("preview never persists preference and disposal restores the latest formal state", () => {
    const storage: ThemeStorage = { read: () => null, write: vi.fn(), clear: vi.fn() };
    const runtime = createOriaThemeRuntime({ ...baseConfig(), storage }); runtime.start();
    const preview = createThemeFromSeed({ color: "#b91c1c" }, { id: "preview", name: "Preview", clock: { now: () => 3 } });
    const handle = runtime.previewTheme(preview, "dark");
    expect(runtime.getSnapshot().resolvedTheme.themeId).toBe("preview");
    runtime.setAppearance("dark", { preservePreview: true });
    handle.dispose(); handle.dispose();
    expect(runtime.getSnapshot().resolvedTheme.themeId).toBe("oria-default");
    expect(runtime.getSnapshot().resolvedMode).toBe("dark");
    expect(storage.write).toHaveBeenCalledTimes(1);
  });
});

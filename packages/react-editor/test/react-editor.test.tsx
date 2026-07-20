// @vitest-environment jsdom
import { act, StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { oriaDefaultTheme } from "@oriatheme/core";
import type { TokenPath } from "@oriatheme/core";
import { createThemeEditorSession } from "@oriatheme/editor-core";
import { createOriaThemeRuntime } from "@oriatheme/runtime-dom";
import { ThemeEditorProvider, useThemeEditor, useThemeEditorAutoPreview } from "../src/index.js";

const domDocument = globalThis.document;
Object.assign(globalThis, {
  IS_REACT_ACT_ENVIRONMENT: true,
  requestAnimationFrame: (callback: FrameRequestCallback): number => { queueMicrotask(() => callback(0)); return 1; },
  cancelAnimationFrame: (): void => {}
});
let container: HTMLDivElement | undefined;
afterEach(() => { container?.remove(); container = undefined; domDocument.head.innerHTML = ""; });
const mount = (): ReturnType<typeof createRoot> => { container = domDocument.createElement("div"); domDocument.body.appendChild(container); return createRoot(container); };
const options = { source: oriaDefaultTheme, identity: { id: "react-editor-copy", name: "React editor copy" } };

describe("React editor bridge", () => {
  it("subscribes through the provider without a second React draft state", async () => {
    let observed = "";
    const Probe = (): null => { observed = useThemeEditor().snapshot.draft.id; return null; };
    const root = mount();
    await act(async () => { root.render(<ThemeEditorProvider options={options}><Probe /></ThemeEditorProvider>); });
    expect(observed).toBe("react-editor-copy");
    await act(async () => { root.unmount(); });
  });

  it("keeps an owned session alive through the Strict Mode effect replay", async () => {
    let session: ReturnType<typeof createThemeEditorSession> | undefined;
    const Probe = (): null => { session = useThemeEditor().session; return null; };
    const root = mount();
    await act(async () => {
      root.render(<StrictMode><ThemeEditorProvider options={options}><Probe /></ThemeEditorProvider></StrictMode>);
      await Promise.resolve();
    });
    const revision = session!.getSnapshot().revision;
    await act(async () => { session!.setName("Strict Mode editor"); });
    expect(session!.getSnapshot().revision).toBe(revision + 1);
    expect(session!.getSnapshot().draft.name).toBe("Strict Mode editor");
    await act(async () => { root.unmount(); await Promise.resolve(); });
    const unmountedRevision = session!.getSnapshot().revision;
    session!.setName("Destroyed editor");
    expect(session!.getSnapshot().revision).toBe(unmountedRevision);
  });

  it("automatically previews the latest valid revision and pauses on invalid input", async () => {
    const runtime = createOriaThemeRuntime({ presets: [oriaDefaultTheme], defaultThemeId: "oria-default", target: domDocument, storage: false });
    const session = createThemeEditorSession(options);
    let status = "";
    const Probe = (): null => { status = useThemeEditorAutoPreview(runtime, "light").status; return null; };
    const root = mount();
    await act(async () => { root.render(<ThemeEditorProvider session={session}><Probe /></ThemeEditorProvider>); await new Promise(resolve => setTimeout(resolve, 20)); });
    expect(status).toBe("previewing");
    await act(async () => { session.setToken("light", "color.primary" as TokenPath, "not-a-color"); });
    expect(status).toBe("paused");
    await act(async () => { root.unmount(); });
    session.destroy(); runtime.destroy();
  });

  it("replays each edited mode when light and dark previews are revisited", async () => {
    const runtime = createOriaThemeRuntime({ presets: [oriaDefaultTheme], defaultThemeId: "oria-default", target: domDocument, storage: false });
    const session = createThemeEditorSession(options);
    session.setToken("light", "color.primary" as TokenPath, "#0284c7");
    session.setToken("dark", "color.primary" as TokenPath, "#7dd3fc");
    let changeMode: ((mode: "light" | "dark") => void) | undefined;
    const Probe = (): null => {
      const [mode, setMode] = useState<"light" | "dark">("light");
      changeMode = setMode;
      useThemeEditorAutoPreview(runtime, mode);
      return null;
    };
    const root = mount();
    await act(async () => { root.render(<ThemeEditorProvider session={session}><Probe /></ThemeEditorProvider>); await new Promise(resolve => setTimeout(resolve, 20)); });
    expect(runtime.getSnapshot().resolvedTheme.mode).toBe("light");
    expect(runtime.getSnapshot().resolvedTheme.variables["--oria-color-primary"]).toBe("#0284c7");
    await act(async () => { changeMode?.("dark"); await new Promise(resolve => setTimeout(resolve, 20)); });
    expect(runtime.getSnapshot().resolvedTheme.mode).toBe("dark");
    expect(runtime.getSnapshot().resolvedTheme.variables["--oria-color-primary"]).toBe("#7dd3fc");
    await act(async () => { changeMode?.("light"); await new Promise(resolve => setTimeout(resolve, 20)); });
    expect(runtime.getSnapshot().resolvedTheme.mode).toBe("light");
    expect(runtime.getSnapshot().resolvedTheme.variables["--oria-color-primary"]).toBe("#0284c7");
    expect(session.getSnapshot().draft.modes.dark["color.primary" as TokenPath]).toBe("#7dd3fc");
    await act(async () => { root.unmount(); });
    session.destroy(); runtime.destroy();
  });

  it("lets an active draft preview follow the runtime appearance when no mode is pinned", async () => {
    const runtime = createOriaThemeRuntime({ presets: [oriaDefaultTheme], defaultThemeId: "oria-default", target: domDocument, storage: false });
    const session = createThemeEditorSession(options);
    session.setToken("light", "color.primary" as TokenPath, "#0284c7");
    session.setToken("dark", "color.primary" as TokenPath, "#7dd3fc");
    const Probe = (): null => { useThemeEditorAutoPreview(runtime); return null; };
    const root = mount();
    await act(async () => { root.render(<ThemeEditorProvider session={session}><Probe /></ThemeEditorProvider>); await new Promise(resolve => setTimeout(resolve, 20)); });
    expect(runtime.getSnapshot().resolvedTheme.mode).toBe("light");
    expect(runtime.getSnapshot().resolvedTheme.variables["--oria-color-primary"]).toBe("#0284c7");
    await act(async () => { runtime.setAppearance("dark", { preservePreview: true }); });
    expect(runtime.getSnapshot().preference.appearance).toBe("dark");
    expect(runtime.getSnapshot().resolvedTheme.themeId).toBe("react-editor-copy");
    expect(runtime.getSnapshot().resolvedTheme.mode).toBe("dark");
    expect(runtime.getSnapshot().resolvedTheme.variables["--oria-color-primary"]).toBe("#7dd3fc");
    await act(async () => { root.unmount(); });
    session.destroy(); runtime.destroy();
  });

  it("cancels a queued draft preview when the formal theme changes", async () => {
    const alternate = { ...oriaDefaultTheme, id: "react-alternate", name: "React alternate" };
    const runtime = createOriaThemeRuntime({ presets: [oriaDefaultTheme, alternate], defaultThemeId: "oria-default", target: domDocument, storage: false }); runtime.start();
    const session = createThemeEditorSession(options);
    session.setToken("light", "gradient.surface" as TokenPath, { type: "linear", angle: 90, stops: [{ color: "#ffffff" }, { color: "#000000", position: 100 }] });
    const frames: FrameRequestCallback[] = [];
    const request = globalThis.requestAnimationFrame;
    const cancel = globalThis.cancelAnimationFrame;
    Object.assign(globalThis, { requestAnimationFrame: (callback: FrameRequestCallback): number => { frames.push(callback); return frames.length; }, cancelAnimationFrame: (): void => {} });
    const Probe = (): null => { useThemeEditorAutoPreview(runtime, "light"); return null; };
    const root = mount();
    try {
      await act(async () => { root.render(<ThemeEditorProvider session={session}><Probe /></ThemeEditorProvider>); });
      await act(async () => {
        runtime.setTheme("react-alternate");
        for (const frame of frames) frame(0);
      });
      expect(runtime.getSnapshot().resolvedTheme.themeId).toBe("react-alternate");
      expect(runtime.getSnapshot().resolvedTheme.variables["--oria-gradient-surface"]).toBeUndefined();
    } finally {
      Object.assign(globalThis, { requestAnimationFrame: request, cancelAnimationFrame: cancel });
      await act(async () => { root.unmount(); });
      session.destroy(); runtime.destroy();
    }
  });
});

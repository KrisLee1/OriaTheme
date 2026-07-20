// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { cloneTheme, oriaDefaultTheme } from "@oriatheme/core";
import { createOriaThemeRuntime } from "@oriatheme/runtime-dom";
import { OriaThemeProvider, useOriaTheme, useThemeSnapshot } from "../src/index.js";

const domDocument = globalThis.document;
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const config = { presets: [oriaDefaultTheme], defaultThemeId: "oria-default", target: domDocument, storage: false as const };
let container: HTMLDivElement | undefined;
afterEach(() => { container?.remove(); container = undefined; domDocument.head.innerHTML = ""; });
const mount = (): ReturnType<typeof createRoot> => { container = domDocument.createElement("div"); domDocument.body.appendChild(container); return createRoot(container); };

describe("React adapter", () => {
  it("starts an owned runtime and destroys it on Provider unmount", async () => {
    const root = mount();
    await act(async () => { root.render(<OriaThemeProvider config={config}><span>content</span></OriaThemeProvider>); });
    expect(domDocument.head.querySelector("style[data-oria-theme-runtime]")).not.toBeNull();
    await act(async () => { root.unmount(); });
    expect(domDocument.head.querySelector("style[data-oria-theme-runtime]")).toBeNull();
  });

  it("does not destroy a caller-owned runtime and selector skips unrelated updates", async () => {
    const runtime = createOriaThemeRuntime(config);
    const custom = cloneTheme(oriaDefaultTheme, { id: "react-custom", name: "React Custom" }, { now: () => 1 }); runtime.createCustomTheme({ theme: custom });
    let selectedRenders = 0; let fullRenders = 0;
    const Selected = (): null => { useThemeSnapshot(snapshot => snapshot.resolvedMode); selectedRenders += 1; return null; };
    const Full = (): null => { useOriaTheme(); fullRenders += 1; return null; };
    const root = mount();
    await act(async () => { root.render(<OriaThemeProvider config={config} runtime={runtime}><Selected /><Full /></OriaThemeProvider>); });
    await act(async () => { runtime.setTheme("react-custom"); });
    expect(selectedRenders).toBe(1);
    expect(fullRenders).toBeGreaterThan(1);
    await act(async () => { root.unmount(); });
    expect(runtime.getSnapshot().status).toBe("ready");
    runtime.destroy();
  });
});

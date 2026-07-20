// @vitest-environment jsdom
import { createApp, defineComponent, h, nextTick, ref } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { oriaDefaultTheme } from "@oriatheme/core";
import type { TokenPath } from "@oriatheme/core";
import { createThemeEditorSession } from "@oriatheme/editor-core";
import { createOriaThemeRuntime } from "@oriatheme/runtime-dom";
import { provideThemeEditor, useThemeEditor, useThemeEditorAutoPreview } from "../src/index.js";

const domDocument = globalThis.document;
Object.assign(globalThis, {
  requestAnimationFrame: (callback: (time: number) => void): number => { globalThis.queueMicrotask(() => callback(0)); return 1; },
  cancelAnimationFrame: (): void => {}
});
let host: HTMLDivElement | undefined;
afterEach(() => { host?.remove(); host = undefined; domDocument.head.innerHTML = ""; });
const options = { source: oriaDefaultTheme, identity: { id: "vue-editor-copy", name: "Vue editor copy" } };

describe("Vue editor bridge", () => {
  it("uses an editor-core snapshot provided by the parent", async () => {
    host = domDocument.createElement("div"); domDocument.body.appendChild(host);
    let observed = "";
    const Child = defineComponent({ setup: () => { const { snapshot } = useThemeEditor(); return () => { observed = snapshot.value.draft.id; return h("span", observed); }; } });
    const Root = defineComponent({ setup: () => { provideThemeEditor(options); return () => h(Child); } });
    const app = createApp(Root); app.mount(host); await nextTick();
    expect(observed).toBe("vue-editor-copy"); app.unmount();
  });

  it("automatically previews valid revisions and reports a paused invalid draft", async () => {
    host = domDocument.createElement("div"); domDocument.body.appendChild(host);
    const runtime = createOriaThemeRuntime({ presets: [oriaDefaultTheme], defaultThemeId: "oria-default", target: domDocument, storage: false });
    const session = createThemeEditorSession(options); let status = "";
    const Child = defineComponent({ setup: () => { const mode = ref<"light" | "dark">("light"); const preview = useThemeEditorAutoPreview(runtime, mode); return () => { status = preview.value.status; return h("span", status); }; } });
    const Root = defineComponent({ setup: () => { provideThemeEditor(session); return () => h(Child); } });
    const app = createApp(Root); app.mount(host); await new Promise(resolve => globalThis.setTimeout(resolve, 20)); await nextTick();
    expect(status).toBe("previewing");
    session.setToken("light", "color.primary" as TokenPath, "not-a-color"); await nextTick();
    expect(status).toBe("paused");
    app.unmount(); session.destroy(); runtime.destroy();
  });

  it("lets an active draft preview follow the runtime appearance when mode is omitted", async () => {
    host = domDocument.createElement("div"); domDocument.body.appendChild(host);
    const runtime = createOriaThemeRuntime({ presets: [oriaDefaultTheme], defaultThemeId: "oria-default", target: domDocument, storage: false });
    runtime.start();
    const session = createThemeEditorSession(options); let status = "";
    const Child = defineComponent({ setup: () => { const preview = useThemeEditorAutoPreview(runtime); return () => { status = preview.value.status; return h("span", status); }; } });
    const Root = defineComponent({ setup: () => { provideThemeEditor(session); return () => h(Child); } });
    const app = createApp(Root); app.mount(host); await new Promise(resolve => globalThis.setTimeout(resolve, 20)); await nextTick();
    runtime.setAppearance("dark", { preservePreview: true }); await new Promise(resolve => globalThis.setTimeout(resolve, 20));
    expect(status).toBe("previewing");
    expect(domDocument.documentElement.dataset.oriaMode).toBe("dark");
    app.unmount(); session.destroy(); runtime.destroy();
  });

  it("cancels a queued draft preview when the formal theme changes", async () => {
    host = domDocument.createElement("div"); domDocument.body.appendChild(host);
    const alternate = { ...oriaDefaultTheme, id: "vue-alternate", name: "Vue alternate" };
    const runtime = createOriaThemeRuntime({ presets: [oriaDefaultTheme, alternate], defaultThemeId: "oria-default", target: domDocument, storage: false }); runtime.start();
    const session = createThemeEditorSession(options);
    session.setToken("light", "gradient.surface" as TokenPath, { type: "linear", angle: 90, stops: [{ color: "#ffffff" }, { color: "#000000", position: 100 }] });
    const frames: ((time: number) => void)[] = [];
    const request = globalThis.requestAnimationFrame;
    const cancel = globalThis.cancelAnimationFrame;
    Object.assign(globalThis, { requestAnimationFrame: (callback: (time: number) => void): number => { frames.push(callback); return frames.length; }, cancelAnimationFrame: (): void => {} });
    const Child = defineComponent({ setup: () => { useThemeEditorAutoPreview(runtime, ref<"light" | "dark">("light")); return () => h("span"); } });
    const Root = defineComponent({ setup: () => { provideThemeEditor(session); return () => h(Child); } });
    const app = createApp(Root);
    try {
      app.mount(host); await nextTick();
      runtime.setTheme("vue-alternate");
      for (const frame of frames) frame(0);
      expect(runtime.getSnapshot().resolvedTheme.themeId).toBe("vue-alternate");
      expect(runtime.getSnapshot().resolvedTheme.variables["--oria-gradient-surface"]).toBeUndefined();
    } finally {
      Object.assign(globalThis, { requestAnimationFrame: request, cancelAnimationFrame: cancel });
      app.unmount(); session.destroy(); runtime.destroy();
    }
  });
});

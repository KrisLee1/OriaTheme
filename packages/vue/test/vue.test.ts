// @vitest-environment jsdom
import { createApp, defineComponent, h, nextTick } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { oriaDefaultTheme } from "@oriatheme/core";
import { createOriaThemeRuntime } from "@oriatheme/runtime-dom";
import { createOriaTheme, provideOriaTheme, useOriaTheme } from "../src/index.js";

const domDocument = globalThis.document;
const config = { presets: [oriaDefaultTheme], defaultThemeId: "oria-default", target: domDocument, storage: false as const };
let host: HTMLDivElement | undefined;
afterEach(() => { host?.remove(); host = undefined; domDocument.head.innerHTML = ""; });

describe("Vue adapter", () => {
  it("plugin owns and destroys its runtime when the app unmounts", async () => {
    host = domDocument.createElement("div"); domDocument.body.appendChild(host);
    const App = defineComponent({ setup: () => () => h("div", "vue") });
    const app = createApp(App).use(createOriaTheme(config)); app.mount(host);
    expect(domDocument.head.querySelector("style[data-oria-theme-runtime]")).not.toBeNull();
    app.unmount(); await nextTick();
    expect(domDocument.head.querySelector("style[data-oria-theme-runtime]")).toBeNull();
  });

  it("uses a shallow snapshot ref and never destroys a provided external runtime", async () => {
    host = domDocument.createElement("div"); domDocument.body.appendChild(host);
    const runtime = createOriaThemeRuntime(config);
    let observed = "";
    const Child = defineComponent({ setup() { const { snapshot } = useOriaTheme(); return () => { observed = snapshot.value.resolvedMode; return h("span", observed); }; } });
    const Root = defineComponent({ setup: () => { provideOriaTheme(runtime); return () => h(Child); } });
    const app = createApp(Root); app.mount(host); runtime.setAppearance("dark"); await nextTick();
    expect(observed).toBe("dark");
    app.unmount(); expect(runtime.getSnapshot().status).toBe("ready"); runtime.destroy();
  });
});

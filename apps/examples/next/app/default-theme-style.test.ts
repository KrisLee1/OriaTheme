import { describe, expect, it } from "vitest";
import { oriaDefaultTheme, resolveTheme } from "@oriatheme/core";
import { defaultThemeCss } from "./default-theme-style";

describe("Next default theme SSR style", () => {
  it("contains complete validated light and dark fallbacks", () => {
    const light = resolveTheme(oriaDefaultTheme, "light").variables;
    const dark = resolveTheme(oriaDefaultTheme, "dark").variables;

    expect(defaultThemeCss).toContain(":root{");
    expect(defaultThemeCss).toContain(`--oria-color-bg:${light["--oria-color-bg"]}`);
    expect(defaultThemeCss).toContain("@media(prefers-color-scheme:dark)");
    expect(defaultThemeCss).toContain(`--oria-color-bg:${dark["--oria-color-bg"]}`);
    expect(defaultThemeCss.match(/--oria-[a-zA-Z0-9-]+:/g)).toHaveLength(Object.keys(light).length + Object.keys(dark).length);
  });

  it("cannot terminate its style element or introduce external CSS", () => {
    expect(defaultThemeCss).not.toMatch(/[<>]/);
    expect(defaultThemeCss).not.toMatch(/\b(?:url|expression)\s*\(/i);
  });
});

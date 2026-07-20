import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { URL } from "node:url";
import { oriaColorFamilies, oriaColorSteps, oriaColors, toOriaColorVariable } from "../src/index.js";

const rgbChannels = (hex: string): readonly number[] => [1, 3, 5].map(index => Number.parseInt(hex.slice(index, index + 2), 16));

describe("@oriatheme/colors", () => {
  it("provides the complete Tailwind-compatible color topology with independent values", () => {
    expect(oriaColorFamilies).toHaveLength(26);
    expect(oriaColorSteps).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
    expect(Object.keys(oriaColors)).toHaveLength(31);
    for (const family of oriaColorFamilies) {
      expect(Object.keys(oriaColors[family])).toHaveLength(11);
      for (const step of oriaColorSteps) expect(oriaColors[family][step]).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(oriaColors.blue[500]).not.toBe("#3b82f6");
    expect(oriaColorFamilies.slice(-4)).toEqual(["mauve", "olive", "mist", "taupe"]);
  });

  it("generates stable CSS variables and a Tailwind v4 bridge", async () => {
    const styles = await readFile(new URL("../dist/colors.css", import.meta.url), "utf8");
    const tailwind = await readFile(new URL("../dist/tailwind.css", import.meta.url), "utf8");
    expect(styles.match(/--oria-palette-/g)).toHaveLength(291);
    expect(tailwind.match(/--color-/g)).toHaveLength(291);
    expect(styles).toContain(`${toOriaColorVariable("red", 500)}: ${oriaColors.red[500]}`);
    expect(tailwind).toContain("--color-sky-300: var(--oria-palette-sky-300)");
    expect(tailwind).toContain("--color-mauve-500: var(--oria-palette-mauve-500)");
    expect(tailwind).toContain("--color-olive-500: var(--oria-palette-olive-500)");
    expect(tailwind).toContain("--color-mist-500: var(--oria-palette-mist-500)");
    expect(tailwind).toContain("--color-taupe-500: var(--oria-palette-taupe-500)");
  });

  it("keeps chromatic 900 and 950 shades visibly colored", () => {
    const chromaticFamilies = oriaColorFamilies.slice(0, 17);
    for (const family of chromaticFamilies) {
      const shade900 = rgbChannels(oriaColors[family][900]);
      const shade950 = rgbChannels(oriaColors[family][950]);
      expect(Math.max(...shade900), `${family}-900 is too close to black`).toBeGreaterThanOrEqual(64);
      expect(Math.max(...shade950), `${family}-950 is too close to black`).toBeGreaterThanOrEqual(48);
      expect(Math.max(...shade950) - Math.min(...shade950), `${family}-950 lost its hue`).toBeGreaterThanOrEqual(24);
    }
  });

  it("compiles standard Tailwind color utility class names", () => {
    const outputDirectory = mkdtempSync(join(tmpdir(), "oriatheme-colors-"));
    const output = join(outputDirectory, "tailwind.css");
    try {
      execFileSync("pnpm", ["exec", "tailwindcss", "-i", "test/tailwind-input.css", "-o", output, "--minify"], { stdio: "pipe" });
      const css = readFileSync(output, "utf8");
      expect(css).toContain(".bg-red-500");
      expect(css).toContain(".bg-inherit");
      expect(css).toContain(".bg-current");
      expect(css).toContain(".bg-transparent");
      expect(css).toContain(".bg-black");
      expect(css).toContain(".bg-white");
      expect(css).toContain("var(--oria-palette-red-500)");
      expect(css).toContain("color-mix(in oklab, var(--oria-palette-red-500) 50%, transparent)");
      expect(css).toContain(".text-sky-300");
      expect(css).toContain(".border-slate-200");
      expect(css).toContain("var(--oria-palette-stone-200)");
      expect(css).toContain("var(--oria-palette-indigo-400)");
      expect(css).toContain("var(--oria-palette-zinc-500)");
      expect(css).toContain("var(--oria-palette-pink-400)");
      expect(css).toContain("var(--oria-palette-gray-400)");
      expect(css).toContain("var(--oria-palette-cyan-500)");
      expect(css).toContain("var(--oria-palette-lime-500)");
      expect(css).toContain("var(--oria-palette-mauve-500)");
      expect(css).toContain("var(--oria-palette-olive-500)");
      expect(css).toContain("var(--oria-palette-mist-500)");
      expect(css).toContain("var(--oria-palette-taupe-500)");
      expect(css).toContain(".fill-emerald-600");
      expect(css).toContain(".stroke-purple-600");
      expect(css).toContain(".from-violet-500");
    } finally {
      rmSync(outputDirectory, { recursive: true, force: true });
    }
  });
});

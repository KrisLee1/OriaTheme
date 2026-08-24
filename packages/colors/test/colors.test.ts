import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { URL } from "node:url";
import { oriaColorFamilies, oriaColorSteps, oriaColors, toOriaColorVariable } from "../src/index.js";

const oklchChannels = (color: string): readonly [number, number, number] => {
  const match = /^oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)$/.exec(color);
  if (!match) throw new Error(`Expected an opaque OKLCH color, received ${color}.`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
};

const oklchToHex = (color: string): string => {
  const [lightness, chroma, hue] = oklchChannels(color);
  const angle = hue * Math.PI / 180; const a = chroma * Math.cos(angle); const b = chroma * Math.sin(angle); const l = lightness / 100;
  const ll = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3; const mm = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3; const ss = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const gamma = (value: number): number => value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
  return `#${[4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss, -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss, -0.0041960863 * ll - 0.7034186147 * mm + 1.707614701 * ss].map(value => Math.round(Math.min(1, Math.max(0, gamma(value))) * 255).toString(16).padStart(2, "0")).join("")}`;
};

describe("@oriatheme/colors", () => {
  it("provides the complete Tailwind-compatible color topology with independent values", () => {
    expect(oriaColorFamilies).toHaveLength(26);
    expect(oriaColorSteps).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
    expect(Object.keys(oriaColors)).toHaveLength(31);
    for (const family of oriaColorFamilies) {
      expect(Object.keys(oriaColors[family])).toHaveLength(11);
      for (const step of oriaColorSteps) expect(oriaColors[family][step]).toMatch(/^oklch\([\d.]+% [\d.]+ [\d.]+\)$/);
    }
    expect(oriaColors.blue[500]).not.toBe("oklch(62.3% 0.214 259.815)");
    expect(oriaColors.black).toBe("oklch(0% 0 0)");
    expect(oriaColors.white).toBe("oklch(100% 0 0)");
    expect(oklchToHex(oriaColors.red[500])).toBe("#d53740");
    expect(oklchToHex(oriaColors.blue[500])).toBe("#3675e2");
    expect(oklchToHex(oriaColors.mauve[950])).toBe("#2f292f");
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
      const shade900 = oklchChannels(oriaColors[family][900]);
      const shade950 = oklchChannels(oriaColors[family][950]);
      expect(shade900[0], `${family}-900 lightness drifted`).toBeCloseTo(35, 0);
      expect(shade950[0], `${family}-950 lightness drifted`).toBeCloseTo(29, 0);
      expect(shade950[1], `${family}-950 lost its hue`).toBeGreaterThan(0.035);
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

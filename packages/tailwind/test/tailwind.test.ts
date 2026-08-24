import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { URL } from "node:url";
import { generateOriaTailwindBridge, oriaTailwindBridgeDefaultPrefix } from "../src/index.js";

const tailwindCliTimeout = 15_000;

describe("@oriatheme/tailwind", () => {
  it("maps the complete v2 vocabulary into the Tailwind theme namespace", () => {
    const css = generateOriaTailwindBridge();

    expect(css.match(/--color-/g)).toHaveLength(43);
    expect(css).toContain("--color-background: var(--oria-color-bg);");
    expect(css).toContain("--color-foreground: var(--oria-color-fg);");
    expect(css).toContain("--color-primary-foreground: var(--oria-color-primary-fg);");
    expect(css).toContain("--color-danger: var(--oria-color-danger);");
    expect(css).toContain("--color-border-strong: var(--oria-color-border-strong);");
    expect(css).toContain("--color-chart-8: var(--oria-color-chart-8);");

    expect(css).toContain("--font-sans: var(--oria-font-sans);");
    expect(css).toContain("--font-display: var(--oria-font-display);");
    expect(css.match(/--font-weight-/g)).toHaveLength(9);
    expect(css).toContain("--font-weight-semibold: var(--oria-font-weight-semibold);");

    expect(css.match(/--text-[a-z0-9]+--line-height/g)).toHaveLength(13);
    expect(css).toContain("--text-base: var(--oria-text-md);");
    expect(css).toContain("--text-base--line-height: var(--oria-leading-normal);");
    expect(css).toContain("--text-sm--line-height: var(--oria-leading-snug);");
    expect(css).toContain("--text-2xl--line-height: var(--oria-leading-snug);");
    expect(css).toContain("--text-9xl: var(--oria-text-9xl);");
    expect(css).toContain("--text-9xl--line-height: var(--oria-leading-tight);");
    expect(css).not.toContain("--text-md");

    expect(css.match(/--leading-/g)).toHaveLength(5);
    expect(css).toContain("--leading-relaxed: var(--oria-leading-relaxed);");
    expect(css.match(/--tracking-/g)).toHaveLength(6);
    expect(css).toContain("--tracking-wide: var(--oria-tracking-wide);");

    expect(css).toContain("--spacing: var(--oria-space);");
    expect(css.match(/--radius-/g)).toHaveLength(8);
    expect(css).toContain("--radius-lg: var(--oria-radius-lg);");

    expect(css.match(/--shadow-/g)).toHaveLength(8);
    expect(css).toContain("--shadow-md: var(--oria-shadow-md);");
    expect(css).toContain("--shadow-none: var(--oria-shadow-none);");
    expect(css.match(/--blur-/g)).toHaveLength(7);
    expect(css).toContain("--blur-lg: var(--oria-blur-lg);");

    expect(css.match(/--ease-oria-/g)).toHaveLength(4);
    expect(css).toContain("--ease-oria-standard: var(--oria-ease-standard);");

    expect(css).toContain("@utility backdrop-oria-lg");
    expect(css).toContain("backdrop-filter: blur(var(--oria-backdrop-blur-lg)) saturate(var(--oria-backdrop-saturate));");
    expect(css).toContain("@utility duration-oria-fast");
    expect(css).toContain("transition-duration: var(--oria-duration-slow);");
    expect(css).not.toContain("duration-oria-instant");
    expect(css).toContain("@utility inset-shadow-oria");
    expect(css).toContain("box-shadow: var(--oria-shadow-inner);");
    expect(css).toContain("@utility shadow-highlight");
    expect(css).toContain("box-shadow: var(--oria-shadow-highlight);");
    expect(css).toContain("@utility bg-oria-canvas");
    expect(css).toContain("background-image: var(--oria-pattern-bg, none), var(--oria-gradient-bg, none);");
    expect(css).toContain("@utility bg-oria-surface");
    expect(css).toContain("background-image: var(--oria-pattern-surface, none), var(--oria-gradient-surface, none);");
  });

  it("keeps the published oria.css artifact identical to the generator output", async () => {
    const artifact = await readFile(new URL("../dist/oria.css", import.meta.url), "utf8");
    expect(artifact).toBe(generateOriaTailwindBridge());
    expect(oriaTailwindBridgeDefaultPrefix).toBe("oria");
  });

  it("generates custom-prefix bridges and rejects invalid prefixes", () => {
    const bridge = generateOriaTailwindBridge({ prefix: "acme" });
    expect(bridge).toContain("--color-background: var(--acme-color-bg);");
    expect(bridge).toContain("--spacing: var(--acme-space);");
    expect(bridge).toContain("blur(var(--acme-backdrop-blur-lg))");
    expect(bridge).not.toContain("--oria-");

    for (const invalid of ["", "-acme", "1acme", "acme corp", "acme_corp", "acme.corp"]) {
      expect(() => generateOriaTailwindBridge({ prefix: invalid })).toThrow(TypeError);
    }
  });

  it("compiles the default bridge with the real Tailwind CLI", () => {
    const outputDirectory = mkdtempSync(join(tmpdir(), "oriatheme-tailwind-"));
    const output = join(outputDirectory, "tailwind.css");
    try {
      execFileSync("pnpm", ["exec", "tailwindcss", "-i", "test/tailwind-input.css", "-o", output, "--minify"], { stdio: "pipe" });
      const css = readFileSync(output, "utf8");
      expect(css).toContain(".bg-background");
      expect(css).toContain("var(--oria-color-bg)");
      expect(css).toContain(".text-primary-foreground");
      expect(css).toContain("var(--oria-color-primary-fg)");
      expect(css).toContain(".text-base");
      expect(css).toContain("var(--oria-text-md)");
      expect(css).toContain(".font-semibold");
      expect(css).toContain("var(--oria-font-weight-semibold)");
      expect(css).toContain(".p-4");
      expect(css).toContain(".gap-6");
      expect(css).toContain(".rounded-lg");
      expect(css).toContain("var(--oria-radius-lg)");
      expect(css).toContain(".shadow-md");
      expect(css).toContain("var(--oria-shadow-md)");
      expect(css).toContain(".blur-lg");
      expect(css).toContain("var(--oria-blur-lg)");
      expect(css).toContain(".backdrop-oria-lg");
      expect(css).toContain("var(--oria-backdrop-blur-lg)");
      expect(css).toContain("var(--oria-backdrop-saturate)");
      expect(css).toContain(".duration-oria-fast");
      expect(css).toContain("var(--oria-duration-fast)");
      expect(css).toContain(".ease-oria-standard");
      expect(css).toContain("var(--oria-ease-standard)");
      expect(css).toContain(".bg-oria-canvas");
      expect(css).toContain("var(--oria-pattern-bg,none)");
      expect(css).toContain(".bg-oria-surface");
      expect(css).toContain(".inset-shadow-oria");
      expect(css).toContain("var(--oria-shadow-inner)");
      expect(css).toContain(".shadow-highlight");
      expect(css).toContain("var(--oria-shadow-highlight)");
    } finally {
      rmSync(outputDirectory, { recursive: true, force: true });
    }
  }, tailwindCliTimeout);

  it("compiles a custom-prefix bridge with the real Tailwind CLI", () => {
    const outputDirectory = mkdtempSync(join(tmpdir(), "oriatheme-tailwind-prefix-"));
    const bridgePath = join(outputDirectory, "acme.css");
    const inputPath = join(outputDirectory, "input.css");
    const output = join(outputDirectory, "tailwind.css");
    try {
      writeFileSync(bridgePath, generateOriaTailwindBridge({ prefix: "acme" }));
      writeFileSync(inputPath, `@import "tailwindcss";\n@import "./acme.css";\n@source inline("bg-background rounded-lg backdrop-oria-sm");\n`);
      execFileSync("pnpm", ["exec", "tailwindcss", "-i", inputPath, "-o", output, "--minify"], { stdio: "pipe" });
      const css = readFileSync(output, "utf8");
      expect(css).toContain(".bg-background");
      expect(css).toContain("var(--acme-color-bg)");
      expect(css).toContain("var(--acme-radius-lg)");
      expect(css).toContain("var(--acme-backdrop-blur-sm)");
    } finally {
      rmSync(outputDirectory, { recursive: true, force: true });
    }
  }, tailwindCliTimeout);
});

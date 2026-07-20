import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { runCli } from "../src/cli.js";

const temporaryRoots: string[] = [];

async function temporaryProject(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "oria-cli-"));
  temporaryRoots.push(root);
  await writeFile(join(root, "package.json"), `${JSON.stringify({ name: "consumer", private: true }, null, 2)}\n`);
  return root;
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function fixtureRegistry(root: string, source = "export const editor = true;\n", options: { readonly hash?: string; readonly target?: string; readonly version?: string } = {}): Promise<string> {
  const registry = join(root, "registry");
  await mkdir(join(registry, "manifest"), { recursive: true });
  await mkdir(join(registry, "templates", "react"), { recursive: true });
  await writeFile(join(registry, "templates", "react", "editor.ts"), source);
  const manifest = {
    schemaVersion: 1,
    name: "theme-editor",
    framework: "react",
    version: options.version ?? "0.1.0",
    compatiblePackages: { "@oriatheme/core": "^0.1.0" },
    dependencies: ["@oriatheme/core@^0.1.0", "react@^19.0.0"],
    files: [{ source: "templates/react/editor.ts", target: options.target ?? "editor.ts", sha256: options.hash ?? hash(source) }]
  };
  await writeFile(join(registry, "manifest", "theme-editor.react.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return registry;
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map(root => rm(root, { recursive: true, force: true })));
});

describe("oria CLI", () => {
  it("prints a dry-run plan without modifying the consumer", async () => {
    const root = await temporaryProject();
    const registry = await fixtureRegistry(root);

    const result = await runCli(["add", "theme-editor", "--framework", "react", "--registry", registry, "--dry-run"], root);

    expect(result.exitCode).toBe(0);
    expect(result.lines.join("\n")).toContain("Dry run: no files");
    await expect(readFile(join(root, "components", "oria-theme-editor", "editor.ts"), "utf8")).rejects.toThrow();
    await expect(readFile(join(root, ".oria", "components.json"), "utf8")).rejects.toThrow();
  });

  it("installs verified source, records a baseline, and adds only the selected framework dependencies", async () => {
    const root = await temporaryProject();
    const registry = await fixtureRegistry(root);

    const result = await runCli(["add", "theme-editor", "--framework", "react", "--registry", registry, "--yes"], root);

    expect(result.exitCode).toBe(0);
    await expect(readFile(join(root, "components", "oria-theme-editor", "editor.ts"), "utf8")).resolves.toBe("export const editor = true;\n");
    const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8")) as { readonly dependencies: Record<string, string> };
    expect(packageJson.dependencies).toMatchObject({ "@oriatheme/core": "^0.1.0", react: "^19.0.0" });
    expect(packageJson.dependencies.vue).toBeUndefined();
    const record = JSON.parse(await readFile(join(root, ".oria", "components.json"), "utf8")) as { readonly components: readonly { readonly targetPath: string; readonly files: Record<string, string> }[] };
    expect(record.components).toHaveLength(1);
    expect(record.components[0]).toMatchObject({ targetPath: "components/oria-theme-editor", files: { "editor.ts": hash("export const editor = true;\n") } });
  });

  it("installs the Apache-2.0 license with bundled editor source", async () => {
    const root = await temporaryProject();

    const result = await runCli(["add", "theme-editor", "--framework", "react", "--yes"], root);

    expect(result.exitCode).toBe(0);
    await expect(readFile(join(root, "components", "oria-theme-editor", "LICENSE"), "utf8")).resolves.toContain("Apache License\n                           Version 2.0");
    const record = JSON.parse(await readFile(join(root, ".oria", "components.json"), "utf8")) as { readonly components: readonly { readonly files: Record<string, string> }[] };
    expect(record.components[0]?.files.LICENSE).toMatch(/^[a-f0-9]{64}$/u);
  });

  it.each([
    "pnpm@10.10.0",
    "npm@11.16.0",
    "yarn@4.9.2",
    "bun@1.2.20"
  ])("preserves %s metadata and leaves lockfile ownership to the consumer", async packageManager => {
    const root = await temporaryProject();
    const registry = await fixtureRegistry(root);
    await writeFile(join(root, "package.json"), `${JSON.stringify({
      name: "consumer",
      private: true,
      packageManager,
      scripts: { build: "consumer-build" },
      dependencies: { existing: "^1.0.0" },
      devDependencies: { typescript: "^5.8.0" }
    }, null, 2)}\n`);

    const result = await runCli(["add", "theme-editor", "--framework", "react", "--registry", registry, "--yes"], root);

    expect(result.exitCode).toBe(0);
    const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8")) as {
      readonly packageManager: string;
      readonly scripts: Record<string, string>;
      readonly dependencies: Record<string, string>;
      readonly devDependencies: Record<string, string>;
    };
    expect(packageJson).toMatchObject({
      packageManager,
      scripts: { build: "consumer-build" },
      dependencies: { existing: "^1.0.0", "@oriatheme/core": "^0.1.0", react: "^19.0.0" },
      devDependencies: { typescript: "^5.8.0" }
    });
    for (const lockfile of ["pnpm-lock.yaml", "package-lock.json", "yarn.lock", "bun.lock", "bun.lockb"]) {
      await expect(readFile(join(root, lockfile), "utf8")).rejects.toThrow();
    }
  });

  it("rejects a hash mismatch before writing any consumer file", async () => {
    const root = await temporaryProject();
    const registry = await fixtureRegistry(root, "export const editor = true;\n", { hash: "0".repeat(64) });

    const result = await runCli(["add", "theme-editor", "--framework", "react", "--registry", registry, "--yes"], root);

    expect(result.exitCode).toBe(1);
    expect(result.lines[0]).toContain("hash verification failed");
    await expect(readFile(join(root, "package.json"), "utf8")).resolves.toContain('"name": "consumer"');
    await expect(readFile(join(root, "components", "oria-theme-editor", "editor.ts"), "utf8")).rejects.toThrow();
  });

  it("rejects traversal and existing files unless overwrite is explicit", async () => {
    const root = await temporaryProject();
    const registry = await fixtureRegistry(root, "export const editor = true;\n", { target: "../escape.ts" });
    const traversal = await runCli(["add", "theme-editor", "--framework", "react", "--registry", registry, "--yes"], root);
    expect(traversal.exitCode).toBe(1);
    expect(traversal.lines[0]).toContain("normalized relative path");

    await fixtureRegistry(root, "export const editor = true;\n");
    await mkdir(join(root, "components", "oria-theme-editor"), { recursive: true });
    await writeFile(join(root, "components", "oria-theme-editor", "editor.ts"), "user change\n");
    const conflict = await runCli(["add", "theme-editor", "--framework", "react", "--registry", registry, "--yes"], root);
    expect(conflict.exitCode).toBe(1);
    expect(conflict.lines[0]).toContain("Refusing to overwrite");
    const overwrite = await runCli(["add", "theme-editor", "--framework", "react", "--registry", registry, "--yes", "--overwrite"], root);
    expect(overwrite.exitCode).toBe(0);
    await expect(readFile(join(root, "components", "oria-theme-editor", "editor.ts"), "utf8")).resolves.toBe("export const editor = true;\n");
  });

  it("reports both local and upstream modifications without writing", async () => {
    const root = await temporaryProject();
    const registry = await fixtureRegistry(root);
    await runCli(["add", "theme-editor", "--framework", "react", "--registry", registry, "--yes"], root);
    await writeFile(join(root, "components", "oria-theme-editor", "editor.ts"), "local change\n");
    await fixtureRegistry(root, "export const editor = 'upstream';\n", { version: "0.2.0" });

    const result = await runCli(["diff", "theme-editor", "--framework", "react", "--registry", registry], root);

    expect(result.exitCode).toBe(0);
    expect(result.lines).toContain("both-modified: editor.ts");
    await expect(readFile(join(root, "components", "oria-theme-editor", "editor.ts"), "utf8")).resolves.toBe("local change\n");
  });
});

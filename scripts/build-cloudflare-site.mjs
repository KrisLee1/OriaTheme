import { execFileSync } from "node:child_process";
import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Assembles the single Cloudflare Pages artifact for https://theme.oria.org.cn:
 * the statically exported website at the root and the verified component
 * registry under /registry/v1. One Pages project serves both, so the registry
 * base URL stays stable.
 */
const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const websiteOut = resolve(workspaceRoot, "apps/website/out");
const registryOut = resolve(workspaceRoot, "dist/registry");
const siteRoot = resolve(workspaceRoot, "dist/site");

function run(command, args) {
  execFileSync(command, args, { cwd: workspaceRoot, stdio: "inherit" });
}

run("pnpm", ["--filter", "@oriatheme/website", "build"]);
run("node", ["scripts/build-public-registry.mjs"]);

await rm(siteRoot, { recursive: true, force: true });
await mkdir(siteRoot, { recursive: true });
await cp(websiteOut, siteRoot, { recursive: true });
await cp(registryOut, resolve(siteRoot, "registry"), { recursive: true });

console.log(`Assembled Cloudflare Pages artifact in ${relative(workspaceRoot, siteRoot)} (website + registry/v1).`);

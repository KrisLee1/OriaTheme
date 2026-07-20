import { cp, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(packageRoot, "../../registry");
const destination = resolve(packageRoot, "registry");

await rm(destination, { recursive: true, force: true });
await cp(source, destination, {
  recursive: true,
  filter: path => !path.endsWith("/.DS_Store") && !path.endsWith("\\.DS_Store") && !path.endsWith("/update-manifests.mjs") && !path.endsWith("\\update-manifests.mjs")
});

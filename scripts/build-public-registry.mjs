import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registryRoot = resolve(workspaceRoot, "registry");
const outputRoot = resolve(workspaceRoot, "dist/registry/v1");
const manifests = ["manifest/theme-editor.react.json", "manifest/theme-editor.vue.json"];

function assertSafeRelative(value, label) {
  if (typeof value !== "string" || value.length === 0 || isAbsolute(value) || value.includes("\\")) {
    throw new Error(`${label} must be a normalized relative path.`);
  }
  const normalized = relative(registryRoot, resolve(registryRoot, value));
  if (normalized === "" || normalized === ".." || normalized.startsWith("..")) {
    throw new Error(`${label} escapes the registry root.`);
  }
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

const outputFiles = new Map();

for (const manifestPath of manifests) {
  assertSafeRelative(manifestPath, "Manifest path");
  const manifestBytes = await readFile(resolve(registryRoot, manifestPath));
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  if (!Array.isArray(manifest.files)) throw new Error(`${manifestPath} does not contain a files array.`);
  outputFiles.set(manifestPath, manifestBytes);

  for (const [index, entry] of manifest.files.entries()) {
    if (entry === null || typeof entry !== "object") throw new Error(`${manifestPath} files[${index}] is invalid.`);
    const { source, sha256: expectedHash } = entry;
    assertSafeRelative(source, `${manifestPath} files[${index}].source`);
    if (typeof expectedHash !== "string" || !/^[a-f0-9]{64}$/u.test(expectedHash)) {
      throw new Error(`${manifestPath} files[${index}] has an invalid SHA-256 hash.`);
    }
    const bytes = await readFile(resolve(registryRoot, source));
    if (sha256(bytes) !== expectedHash) throw new Error(`${manifestPath} hash mismatch for ${source}. Run node registry/update-manifests.mjs first.`);
    outputFiles.set(source, bytes);
  }
}

await rm(outputRoot, { recursive: true, force: true });
for (const [path, bytes] of outputFiles) {
  const destination = resolve(outputRoot, path);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
}

console.log(`Staged ${outputFiles.size} verified registry files in ${relative(workspaceRoot, outputRoot)}.`);

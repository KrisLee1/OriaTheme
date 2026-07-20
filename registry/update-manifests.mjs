import { createHash } from "node:crypto";
import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const registryRoot = dirname(fileURLToPath(import.meta.url));

for (const framework of ["react", "vue"]) {
  const manifestPath = resolve(registryRoot, `manifest/theme-editor.${framework}.json`);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const files = [];
  for (const file of manifest.files) {
    const source = resolve(registryRoot, file.source);
    try { await access(source); } catch { continue; }
    const bytes = await readFile(source);
    files.push({ ...file, sha256: createHash("sha256").update(bytes).digest("hex") });
  }
  await writeFile(manifestPath, `${JSON.stringify({ ...manifest, files }, null, 2)}\n`);
}

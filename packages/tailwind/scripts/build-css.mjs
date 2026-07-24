import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateOriaTailwindBridge } from "../dist/index.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

await mkdir(resolve(packageRoot, "dist"), { recursive: true });
await writeFile(resolve(packageRoot, "dist/oria.css"), generateOriaTailwindBridge());

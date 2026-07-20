import { copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = resolve(process.cwd());

await copyFile(resolve(workspaceRoot, "LICENSE"), resolve(packageRoot, "LICENSE"));

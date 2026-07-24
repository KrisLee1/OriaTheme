import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { access, lstat, mkdir, readFile, realpath, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";
import { generateOriaTailwindBridge, oriaTailwindBridgeDefaultPrefix } from "@oriatheme/tailwind";

export type Framework = "react" | "vue";

interface RegistryFile {
  readonly source: string;
  readonly target: string;
  readonly sha256: string;
}

interface RegistryManifest {
  readonly schemaVersion: 1;
  readonly name: "theme-editor";
  readonly framework: Framework;
  readonly version: string;
  readonly compatiblePackages: Readonly<Record<string, string>>;
  readonly dependencies: readonly string[];
  readonly files: readonly RegistryFile[];
}

interface InstalledComponent {
  readonly name: string;
  readonly framework: Framework;
  readonly version: string;
  readonly targetPath: string;
  readonly registry: string;
  readonly files: Readonly<Record<string, string>>;
}

interface ComponentRecord {
  readonly schemaVersion: 1;
  readonly components: readonly InstalledComponent[];
}

interface EditorOptions {
  readonly command: "add" | "diff";
  readonly name: "theme-editor";
  readonly framework: Framework;
  readonly path?: string;
  readonly registry?: string;
  readonly dryRun: boolean;
  readonly overwrite: boolean;
  readonly yes: boolean;
}

interface BridgeOptions {
  readonly command: "theme";
  readonly name: "tailwind-bridge";
  readonly prefix: string;
  readonly out: string;
  readonly dryRun: boolean;
  readonly overwrite: boolean;
}

type Options = EditorOptions | BridgeOptions;

interface RegistryReader {
  readonly display: string;
  loadManifest(framework: Framework): Promise<RegistryManifest>;
  loadFile(source: string): Promise<Uint8Array>;
}

export interface CliResult {
  readonly exitCode: number;
  readonly lines: readonly string[];
}

const MAX_MANIFEST_BYTES = 1024 * 1024;
const MAX_FILE_BYTES = 512 * 1024;
const MAX_FILES = 100;
const DEFAULT_TARGET = "components/oria-theme-editor";
const bundledRegistryRoot = fileURLToPath(new URL("../registry/", import.meta.url));

class CliError extends Error {}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) throw new CliError(`${label} must be a non-empty string.`);
  return value;
}

function asFramework(value: unknown, label: string): Framework {
  if (value !== "react" && value !== "vue") throw new CliError(`${label} must be react or vue.`);
  return value;
}

function isSafeRelative(value: string): boolean {
  return value.length > 0 && !value.includes("\\") && !value.includes("\0") && !isAbsolute(value)
    && value.split("/").every(segment => segment.length > 0 && segment !== "." && segment !== "..");
}

function assertSafeRelative(value: string, label: string): void {
  if (!isSafeRelative(value)) throw new CliError(`${label} must be a normalized relative path without '..', backslashes, or an absolute prefix.`);
}

function parseManifest(input: string, framework: Framework): RegistryManifest {
  if (Buffer.byteLength(input) > MAX_MANIFEST_BYTES) throw new CliError("Registry manifest exceeds the 1 MiB limit.");
  let value: unknown;
  try { value = JSON.parse(input); } catch { throw new CliError("Registry manifest is not valid JSON."); }
  if (!isPlainRecord(value)) throw new CliError("Registry manifest must be an object.");
  if ("scripts" in value || "postinstall" in value) throw new CliError("Registry manifests cannot declare scripts.");
  if (value.schemaVersion !== 1 || value.name !== "theme-editor" || value.framework !== framework) throw new CliError("Registry manifest schema, item name, or framework is invalid.");
  const version = asString(value.version, "Registry version");
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(version)) throw new CliError("Registry version must be a semver version.");
  if (!isPlainRecord(value.compatiblePackages)) throw new CliError("compatiblePackages must be an object.");
  const compatiblePackages: Record<string, string> = {};
  for (const [name, range] of Object.entries(value.compatiblePackages)) {
    if (!name.startsWith("@oriatheme/") || typeof range !== "string" || range.length === 0 || range.startsWith("workspace:")) {
      throw new CliError("compatiblePackages must only contain published @oriatheme package ranges.");
    }
    compatiblePackages[name] = range;
  }
  if (!Array.isArray(value.dependencies) || value.dependencies.some(dependency => typeof dependency !== "string" || dependency.length === 0)) {
    throw new CliError("dependencies must be a non-empty string array.");
  }
  if (!Array.isArray(value.files) || value.files.length === 0 || value.files.length > MAX_FILES) throw new CliError(`files must contain 1–${MAX_FILES} entries.`);
  const targets = new Set<string>();
  const files = value.files.map((entry, index): RegistryFile => {
    if (!isPlainRecord(entry)) throw new CliError(`files[${index}] must be an object.`);
    const source = asString(entry.source, `files[${index}].source`);
    const target = asString(entry.target, `files[${index}].target`);
    const hash = asString(entry.sha256, `files[${index}].sha256`);
    assertSafeRelative(source, `files[${index}].source`);
    assertSafeRelative(target, `files[${index}].target`);
    if (!/^[a-f0-9]{64}$/u.test(hash)) throw new CliError(`files[${index}].sha256 must be a SHA-256 hash.`);
    if (targets.has(target)) throw new CliError(`Registry manifest contains duplicate target '${target}'.`);
    targets.add(target);
    return { source, target, sha256: hash };
  });
  return { schemaVersion: 1, name: "theme-editor", framework, version, compatiblePackages, dependencies: value.dependencies as string[], files };
}

async function pathExists(path: string): Promise<boolean> {
  try { await access(path); return true; } catch { return false; }
}

async function assertNoSymlinkPath(root: string, destination: string): Promise<void> {
  const inside = relative(root, destination);
  if (inside === "" || inside.startsWith(`..${sep}`) || isAbsolute(inside)) throw new CliError("Target path escapes the project root.");
  let cursor = root;
  for (const segment of inside.split(sep)) {
    cursor = join(cursor, segment);
    try {
      if ((await lstat(cursor)).isSymbolicLink()) throw new CliError(`Refusing symbolic-link path '${relative(root, cursor)}'.`);
    } catch (error) {
      if (error instanceof CliError) throw error;
    }
  }
}

async function readLocalFile(root: string, unsafePath: string): Promise<Uint8Array> {
  assertSafeRelative(unsafePath, "Registry source path");
  const resolvedRoot = await realpath(root);
  const source = resolve(resolvedRoot, unsafePath);
  const resolvedSource = await realpath(source).catch(() => { throw new CliError(`Registry source '${unsafePath}' does not exist.`); });
  const inside = relative(resolvedRoot, resolvedSource);
  if (inside === "" || inside.startsWith(`..${sep}`) || isAbsolute(inside)) throw new CliError("Registry source resolves outside its base directory.");
  const sourceStat = await stat(resolvedSource);
  if (!sourceStat.isFile() || sourceStat.size > MAX_FILE_BYTES) throw new CliError(`Registry source '${unsafePath}' is not a permitted file.`);
  return readFile(resolvedSource);
}

function remoteUrl(base: URL, path: string): URL {
  assertSafeRelative(path, "Registry source path");
  const url = new URL(path, base);
  if (url.protocol !== "https:" || url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) {
    throw new CliError("Registry URL escapes its HTTPS base path.");
  }
  return url;
}

async function readHttps(url: URL, label: string): Promise<Uint8Array> {
  const response = await globalThis.fetch(url, { redirect: "error" }).catch(() => { throw new CliError(`Could not fetch ${label}.`); });
  if (!response.ok) throw new CliError(`Could not fetch ${label}: HTTP ${response.status}.`);
  if (response.url && new URL(response.url).protocol !== "https:") throw new CliError(`${label} redirected outside HTTPS.`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_FILE_BYTES) throw new CliError(`${label} exceeds the 512 KiB limit.`);
  return bytes;
}

async function registryReader(input: string | undefined, cwd: string): Promise<RegistryReader> {
  if (!input) {
    const root = bundledRegistryRoot;
    return {
      display: "bundled registry",
      loadManifest: async framework => parseManifest(Buffer.from(await readLocalFile(root, `manifest/theme-editor.${framework}.json`)).toString("utf8"), framework),
      loadFile: source => readLocalFile(root, source)
    };
  }
  if (input.startsWith("https://")) {
    const base = new URL(input.endsWith("/") ? input : `${input}/`);
    return {
      display: base.toString(),
      loadManifest: async framework => parseManifest(Buffer.from(await readHttps(remoteUrl(base, `manifest/theme-editor.${framework}.json`), "registry manifest")).toString("utf8"), framework),
      loadFile: source => readHttps(remoteUrl(base, source), `registry source '${source}'`)
    };
  }
  if (/^[a-z]+:/iu.test(input)) throw new CliError("Registry URLs must use HTTPS; use a filesystem path for local development.");
  const candidate = resolve(cwd, input);
  const metadata = await stat(candidate).catch(() => { throw new CliError(`Registry path '${input}' does not exist.`); });
  const root = metadata.isDirectory() ? candidate : resolve(dirname(candidate), "..");
  return {
    display: root,
    loadManifest: async framework => {
      const manifestPath = metadata.isDirectory() ? `manifest/theme-editor.${framework}.json` : `manifest/${candidate.split("/").at(-1) ?? ""}`;
      return parseManifest(Buffer.from(await readLocalFile(root, manifestPath)).toString("utf8"), framework);
    },
    loadFile: source => readLocalFile(root, source)
  };
}

async function projectRoot(cwd: string): Promise<string> {
  let cursor = resolve(cwd);
  for (;;) {
    if (await pathExists(join(cursor, "package.json"))) return cursor;
    const parent = dirname(cursor);
    if (parent === cursor) throw new CliError("Could not find a project package.json from the current directory.");
    cursor = parent;
  }
}

function parseDependency(input: string): readonly [string, string] {
  const separator = input.lastIndexOf("@");
  if (separator <= 0 || separator === input.length - 1) throw new CliError(`Registry dependency '${input}' must include an exact package range.`);
  const name = input.slice(0, separator);
  const range = input.slice(separator + 1);
  if (!/^(?:@[-a-z0-9~][-_a-z0-9.~]*\/)?[-a-z0-9~][-_a-z0-9.~]*$/iu.test(name) || range.startsWith("workspace:")) {
    throw new CliError(`Registry dependency '${input}' is not a published package specifier.`);
  }
  return [name, range];
}

async function readComponentRecord(root: string): Promise<ComponentRecord> {
  const recordPath = join(root, ".oria", "components.json");
  if (!await pathExists(recordPath)) return { schemaVersion: 1, components: [] };
  let value: unknown;
  try { value = JSON.parse(await readFile(recordPath, "utf8")); } catch { throw new CliError(".oria/components.json is not valid JSON."); }
  if (!isPlainRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.components)) throw new CliError(".oria/components.json has an unsupported schema.");
  const components = value.components.filter(isPlainRecord).map(component => {
    if (!isPlainRecord(component.files)) throw new CliError("Installed component files are invalid.");
    const files: Record<string, string> = {};
    for (const [target, hash] of Object.entries(component.files)) {
      if (typeof hash !== "string") throw new CliError("Installed component file hashes are invalid.");
      files[target] = hash;
    }
    return {
      name: asString(component.name, "Installed component name"),
      framework: asFramework(component.framework, "Installed component framework"),
      version: asString(component.version, "Installed component version"),
      targetPath: asString(component.targetPath, "Installed component targetPath"),
      registry: asString(component.registry, "Installed component registry"),
      files
    };
  });
  return { schemaVersion: 1, components };
}

const USAGE = "Usage: oria <add|diff> theme-editor --framework <react|vue> [--path <relative-path>] [--registry <url-or-path>] [--dry-run] [--yes] [--overwrite], or oria theme tailwind-bridge --out <relative-path> [--prefix <name>] [--dry-run] [--overwrite].";

function parseBridgeArguments(args: readonly string[]): BridgeOptions {
  let prefix = oriaTailwindBridgeDefaultPrefix;
  let out: string | undefined;
  let dryRun = false;
  let overwrite = false;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--prefix") { const value = args[++index]; if (!value) throw new CliError("--prefix requires a CSS variable prefix."); prefix = value; }
    else if (argument === "--out") { const value = args[++index]; if (!value) throw new CliError("--out requires a relative path."); assertSafeRelative(value, "--out"); out = value; }
    else if (argument === "--dry-run") dryRun = true;
    else if (argument === "--overwrite") overwrite = true;
    else throw new CliError(`Unknown argument '${argument}'.`);
  }
  if (!out) throw new CliError(`--out is required. ${USAGE}`);
  return { command: "theme", name: "tailwind-bridge", prefix, out, dryRun, overwrite };
}

function parseArguments(args: readonly string[]): Options {
  const [command, name, ...rest] = args;
  if (command === "theme" && name === "tailwind-bridge") return parseBridgeArguments(rest);
  if ((command !== "add" && command !== "diff") || name !== "theme-editor") throw new CliError(USAGE);
  let framework: Framework | undefined;
  let path: string | undefined;
  let registry: string | undefined;
  let dryRun = false;
  let overwrite = false;
  let yes = false;
  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];
    if (argument === "--framework") { const value = rest[++index]; if (value === "react" || value === "vue") framework = value; else throw new CliError("--framework must be react or vue."); }
    else if (argument === "--path") { const value = rest[++index]; if (!value) throw new CliError("--path requires a relative path."); assertSafeRelative(value, "--path"); path = value; }
    else if (argument === "--registry") { const value = rest[++index]; if (!value) throw new CliError("--registry requires an HTTPS URL or a local path."); registry = value; }
    else if (argument === "--dry-run") dryRun = true;
    else if (argument === "--overwrite") overwrite = true;
    else if (argument === "--yes") yes = true;
    else throw new CliError(`Unknown argument '${argument}'.`);
  }
  if (!framework) throw new CliError("--framework is required.");
  if (command === "diff" && (dryRun || overwrite || yes)) throw new CliError("diff only accepts --framework, --path, and --registry.");
  return {
    command,
    name,
    framework,
    ...(path ? { path } : {}),
    ...(registry ? { registry } : {}),
    dryRun,
    overwrite,
    yes
  };
}

function planLines(manifest: RegistryManifest, targetPath: string, reader: RegistryReader, dependencyMap: ReadonlyMap<string, string>): string[] {
  return [
    `Plan: install ${manifest.name}@${manifest.version} (${manifest.framework}) from ${reader.display}.`,
    `Target: ${targetPath} (${manifest.files.length} files).`,
    `Dependencies: ${[...dependencyMap.entries()].map(([name, range]) => `${name}@${range}`).join(", ")}.`
  ];
}

async function install(options: EditorOptions, cwd: string): Promise<CliResult> {
  const root = await projectRoot(cwd);
  const reader = await registryReader(options.registry, cwd);
  const manifest = await reader.loadManifest(options.framework);
  const targetPath = options.path ?? DEFAULT_TARGET;
  assertSafeRelative(targetPath, "Target path");
  const targetRoot = resolve(root, targetPath);
  await assertNoSymlinkPath(root, targetRoot);
  const files = await Promise.all(manifest.files.map(async entry => {
    const bytes = await reader.loadFile(entry.source);
    if (bytes.byteLength > MAX_FILE_BYTES || sha256(bytes) !== entry.sha256) throw new CliError(`Registry hash verification failed for '${entry.source}'.`);
    return { ...entry, bytes };
  }));
  const conflicts: string[] = [];
  for (const file of files) {
    const destination = resolve(targetRoot, file.target);
    await assertNoSymlinkPath(root, destination);
    if (await pathExists(destination)) conflicts.push(file.target);
  }
  if (conflicts.length > 0 && !options.overwrite) throw new CliError(`Refusing to overwrite existing files: ${conflicts.join(", ")}. Re-run with --overwrite after reviewing diff.`);
  const dependencyMap = new Map<string, string>(Object.entries(manifest.compatiblePackages));
  for (const dependency of manifest.dependencies) { const [name, range] = parseDependency(dependency); dependencyMap.set(name, range); }
  const lines = planLines(manifest, targetPath, reader, dependencyMap);
  if (conflicts.length > 0) lines.push(`Overwrite: ${conflicts.join(", ")}.`);
  if (options.dryRun) return { exitCode: 0, lines: [...lines, "Dry run: no files or package metadata were written."] };
  if (!options.yes) return { exitCode: 2, lines: [...lines, "No changes written. Re-run with --yes to confirm this plan."] };
  const packagePath = join(root, "package.json");
  let packageJson: unknown;
  try { packageJson = JSON.parse(await readFile(packagePath, "utf8")); } catch { throw new CliError("Project package.json is not valid JSON."); }
  if (!isPlainRecord(packageJson)) throw new CliError("Project package.json must be an object.");
  const existingDependencies = isPlainRecord(packageJson.dependencies) ? packageJson.dependencies : {};
  const nextDependencies = { ...existingDependencies, ...Object.fromEntries(dependencyMap) };
  await mkdir(targetRoot, { recursive: true });
  for (const file of files) {
    const destination = resolve(targetRoot, file.target);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, file.bytes);
  }
  const record = await readComponentRecord(root);
  const component: InstalledComponent = {
    name: manifest.name,
    framework: manifest.framework,
    version: manifest.version,
    targetPath,
    registry: reader.display,
    files: Object.fromEntries(files.map(file => [file.target, file.sha256]))
  };
  const components = [...record.components.filter(entry => !(entry.name === component.name && entry.framework === component.framework)), component];
  await mkdir(join(root, ".oria"), { recursive: true });
  await writeFile(packagePath, `${JSON.stringify({ ...packageJson, dependencies: nextDependencies }, null, 2)}\n`);
  await writeFile(join(root, ".oria", "components.json"), `${JSON.stringify({ schemaVersion: 1, components }, null, 2)}\n`);
  return { exitCode: 0, lines: [...lines, `Installed ${files.length} verified files. Dependencies were added to package.json; run your package manager install to update its lockfile.`] };
}

async function diff(options: EditorOptions, cwd: string): Promise<CliResult> {
  const root = await projectRoot(cwd);
  const record = await readComponentRecord(root);
  const installed = record.components.find(component => component.name === options.name && component.framework === options.framework);
  if (!installed) throw new CliError(`No installed ${options.framework} ${options.name} record was found in .oria/components.json.`);
  const targetPath = options.path ?? installed.targetPath;
  assertSafeRelative(targetPath, "Target path");
  const reader = await registryReader(options.registry, cwd);
  const manifest = await reader.loadManifest(options.framework);
  const lines = [`Diff: ${options.name} (${options.framework}) installed ${installed.version} -> registry ${manifest.version}.`];
  const upstreamTargets = new Set(manifest.files.map(file => file.target));
  for (const file of manifest.files) {
    const destination = resolve(root, targetPath, file.target);
    const baseline = installed.files[file.target];
    const current = await pathExists(destination) ? sha256(await readFile(destination)) : undefined;
    const localChanged = current !== baseline;
    const upstreamChanged = baseline !== file.sha256;
    const status = !current ? "missing" : localChanged && upstreamChanged ? "both-modified" : localChanged ? "local-modified" : upstreamChanged ? "upstream-modified" : "unchanged";
    lines.push(`${status}: ${file.target}`);
  }
  for (const target of Object.keys(installed.files)) if (!upstreamTargets.has(target)) lines.push(`upstream-removed: ${target}`);
  return { exitCode: 0, lines };
}

async function themeBridge(options: BridgeOptions, cwd: string): Promise<CliResult> {
  const root = await projectRoot(cwd);
  let css: string;
  try {
    css = generateOriaTailwindBridge({ prefix: options.prefix });
  } catch (error) {
    throw new CliError(error instanceof Error ? error.message : "Invalid --prefix value.");
  }
  const destination = resolve(root, options.out);
  await assertNoSymlinkPath(root, destination);
  const exists = await pathExists(destination);
  if (exists && !options.overwrite) throw new CliError(`Refusing to overwrite existing file: ${options.out}. Re-run with --overwrite after reviewing it.`);
  const lines = [`Plan: write Tailwind v4 bridge for prefix '${options.prefix}' to ${options.out} (${Buffer.byteLength(css, "utf8")} bytes).`];
  if (exists) lines.push(`Overwrite: ${options.out}.`);
  if (options.dryRun) return { exitCode: 0, lines: [...lines, "Dry run: no files were written."] };
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, css);
  return { exitCode: 0, lines: [...lines, `Wrote ${options.out}. Import it after tailwindcss and the Oria color bridge.`] };
}

export async function runCli(args: readonly string[], cwd = process.cwd()): Promise<CliResult> {
  try {
    const options = parseArguments(args);
    if (options.command === "theme") return await themeBridge(options, cwd);
    return options.command === "add" ? await install(options, cwd) : await diff(options, cwd);
  } catch (error) {
    return { exitCode: 1, lines: [error instanceof Error ? error.message : "Unknown CLI failure."] };
  }
}

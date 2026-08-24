import { issue, OriaThemeError } from "./errors.js";
import type { OriaThemeErrorCode } from "./errors.js";
import { isColorValue, shiftOklchLightness, staticContrastRatio, toOklchColor } from "./color.js";
import { isTokenPath } from "./contract.js";
import { oriaDefaultTheme, oriaStandardContract } from "./standard-v2.js";
import type { Clock, CloneIdentity, CreateThemeOptions, CssNameStyle, GradientDefinition, GradientPosition, GradientStop, ImportResult, ImportThemeOptions, NoisePatternVariant, PatternLayer, PatternLayers, ResolveOptions, ResolvedMode, ResolvedTheme, ShadowLayer, ThemeDefinition, ThemeMigrationResult, ThemeSeed, ThemeTokenInput, TokenContract, TokenDefinition, TokenPath, TokenReference, TokenType, TokenValue, ValidationIssue, ValidationResult } from "./types.js";

const ID = /^[a-z][a-z0-9-]{1,63}$/;
const UNSAFE = /[;{}<>]/;
const DIMENSION = /^(?:0|[-+]?(?:\d+|\d*\.\d+)(?:px|rem|em|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc))$/;
const DURATION = /^(?:0|[-+]?(?:\d+|\d*\.\d+)(?:ms|s))$/;
const GRADIENT_POSITIONS = new Set(["top left", "top", "top right", "left", "center", "right", "bottom left", "bottom", "bottom right"]);
const NOISE_VARIANTS = new Set<NoisePatternVariant>(["paper", "film", "frosted"]);
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);
const reference = (value: unknown): value is TokenReference => object(value) && Object.keys(value).length === 1 && typeof value.$ref === "string" && isTokenPath(value.$ref);
const stableClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Validates a complete serialized theme without throwing for user input. */
export function validateTheme(input: unknown, contract: TokenContract): ValidationResult<ThemeDefinition> {
  const issues: ValidationIssue[] = [];
  if (!object(input)) return { ok: false, issues: [issue("INVALID_THEME", "Theme must be an object.")] };
  if (input.schemaVersion !== 1) issues.push(issue("UNSUPPORTED_SCHEMA_VERSION", "Only theme schema version 1 is supported.", "schemaVersion"));
  if (!object(input.contract) || input.contract.name !== contract.name || input.contract.version !== contract.version) issues.push(issue("UNSUPPORTED_CONTRACT", "Theme contract does not match the supplied contract.", "contract"));
  if (typeof input.id !== "string" || !ID.test(input.id)) issues.push(issue("INVALID_THEME", "Theme id must be a valid slug.", "id"));
  if (typeof input.name !== "string" || input.name.trim().length === 0 || input.name.length > 120) issues.push(issue("INVALID_THEME", "Theme name must be a non-empty string no longer than 120 characters.", "name"));
  if (input.kind !== "preset" && input.kind !== "custom") issues.push(issue("INVALID_THEME", "Theme kind must be preset or custom.", "kind"));
  if (!object(input.modes)) { issues.push(issue("INVALID_THEME", "Theme modes must contain light and dark token sets.", "modes")); }
  else {
    for (const mode of ["light", "dark"] as const) validateTokenSet(input.modes[mode], mode, contract, issues);
  }
  for (const time of ["createdAt", "updatedAt"] as const) if (input[time] !== undefined && (!Number.isSafeInteger(input[time]) || (input[time] as number) < 0)) issues.push(issue("INVALID_THEME", `${time} must be a Unix timestamp.`, time));
  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: freezeTheme(input as unknown as ThemeDefinition), issues: [] };
}

/** Canonicalizes object key order and fills contract defaults without changing rendered output. */
export function normalizeTheme(theme: ThemeDefinition, contract: TokenContract): ThemeDefinition {
  const checked = validateTheme(theme, contract);
  if (!checked.ok) throw new OriaThemeError("INVALID_THEME", "Cannot normalize an invalid theme.", { details: { issues: checked.issues } });
  const normalizeSet = (set: Readonly<Record<TokenPath, ThemeTokenInput>>): Readonly<Record<TokenPath, ThemeTokenInput>> => {
    const output: Record<string, ThemeTokenInput> = {};
    for (const path of Object.keys(contract.tokens).sort()) {
      const definition = contract.tokens[path as TokenPath]!;
      const value = set[path as TokenPath] ?? definition.default;
      if (value !== undefined) output[path] = stableClone(value) as ThemeTokenInput;
    }
    return Object.freeze(output as Record<TokenPath, ThemeTokenInput>);
  };
  return freezeTheme({ ...checked.value, modes: { light: normalizeSet(checked.value.modes.light), dark: normalizeSet(checked.value.modes.dark) } });
}

/** Resolves references and compiles a mode to safe CSS custom-property values. */
export function resolveTheme(theme: ThemeDefinition, mode: ResolvedMode, options: ResolveOptions = {}): ResolvedTheme {
  const contract = options.contract ?? oriaStandardContract;
  return resolveThemeWithContract(theme, contract, mode, options);
}

/** Resolves a validated theme using its explicit contract. This is the safe resolver used by all Core helpers. */
export function resolveThemeWithContract(theme: ThemeDefinition, contract: TokenContract, mode: ResolvedMode, options: ResolveOptions = {}): ResolvedTheme {
  const checked = validateTheme(theme, contract);
  if (!checked.ok) {
    const first = checked.issues[0]!;
    throw new OriaThemeError(first.code as OriaThemeErrorCode, first.message, { ...(first.path === undefined ? {} : { path: first.path }), ...(first.details === undefined ? {} : { details: first.details }) });
  }
  const prefix = options.variablePrefix === undefined ? "oria" : options.variablePrefix;
  const prefixPattern = contract.cssNameStyle === "kebab" ? /^[a-zA-Z][a-zA-Z0-9-]*$/ : /^[a-zA-Z0-9-]*$/;
  if (!prefixPattern.test(prefix)) throw new OriaThemeError("INVALID_CONTRACT", contract.cssNameStyle === "kebab" ? "A v2 variable prefix must start with a letter and contain only letters, numbers, and hyphens." : "Variable prefix may only contain letters, numbers, and hyphens.");
  const tokens = checked.value.modes[mode];
  const resolved = new Map<TokenPath, TokenValue>();
  const visiting: TokenPath[] = [];
  const get = (path: TokenPath): TokenValue => {
    const saved = resolved.get(path); if (saved !== undefined) return saved;
    const definition = contract.tokens[path];
    const input = tokens[path] ?? definition?.default;
    if (!definition || input === undefined) throw new OriaThemeError("TOKEN_REFERENCE_NOT_FOUND", `Token ${path} is not available.`, { path });
    const at = visiting.indexOf(path);
    if (at !== -1) throw new OriaThemeError("TOKEN_REFERENCE_CYCLE", `Token reference cycle: ${[...visiting.slice(at), path].join(" -> ")}.`, { path, details: { cycle: [...visiting.slice(at), path] } });
    visiting.push(path);
    let value: TokenValue;
    if (reference(input)) {
      const target = contract.tokens[input.$ref];
      if (!target) throw new OriaThemeError("TOKEN_REFERENCE_NOT_FOUND", `Referenced token ${input.$ref} does not exist.`, { path, details: { target: input.$ref } });
      if (target.type !== definition.type) throw new OriaThemeError("TOKEN_REFERENCE_TYPE_MISMATCH", `Reference ${path} -> ${input.$ref} has incompatible types.`, { path, details: { target: input.$ref } });
      value = get(input.$ref);
    } else value = input;
    visiting.pop(); resolved.set(path, value); return value;
  };
  const variables: Record<`--${string}`, string> = {};
  for (const path of Object.keys(contract.tokens).sort() as TokenPath[]) {
    const definition = contract.tokens[path]!;
    const hasValue = tokens[path] !== undefined || definition.default !== undefined;
    if (!hasValue) { if (definition.required) throw new OriaThemeError("INVALID_THEME", `Required token ${path} is missing.`, { path }); continue; }
    if (definition.output !== false) variables[toCssVariable(path, prefix, contract.cssNameStyle)] = compileValue(get(path), definition.type, get);
  }
  for (const variable of contract.derivedVariables) {
    const derived = variable.derive.kind === "scale"
      ? scaleDimension(get(variable.derive.source), variable.derive.factor)
      : scaleDimension(get(variable.derive.dimension), numberValue(get(variable.derive.factor), variable.derive.factor));
    variables[`--${prefix}-${variable.name}`] = derived;
  }
  return Object.freeze({ themeId: checked.value.id, contract: checked.value.contract, mode, variables: Object.freeze(variables), colorScheme: mode });
}

/** Creates a custom, timestamped copy while retaining the full visual token set. */
export function cloneTheme(theme: ThemeDefinition, identity: CloneIdentity, clock: Clock = { now: () => Date.now() }): ThemeDefinition {
  if (!ID.test(identity.id) || identity.name.trim().length === 0) throw new OriaThemeError("INVALID_THEME", "Clone identity must contain a valid id and non-empty name.");
  const now = clock.now();
  return freezeTheme({ ...stableClone(theme), id: identity.id, name: identity.name, kind: "custom", createdAt: now, updatedAt: now });
}

/** Generates a complete standard-contract custom theme from a validated brand color. */
export function createThemeFromSeed(seed: ThemeSeed, options: CreateThemeOptions): ThemeDefinition {
  if (!validColor(seed.color) || !ID.test(options.id) || options.name.trim().length === 0) throw new OriaThemeError("INVALID_THEME", "Seed color, id, or name is invalid.");
  const cloned = cloneTheme(oriaDefaultTheme, { id: options.id, name: options.name }, options.clock);
  const primary = toOklchColor(seed.color);
  if (!primary) throw new OriaThemeError("INVALID_THEME", "Seed color must be a static color.");
  const primaryForeground = preferredForeground(primary);
  const update = (set: ThemeDefinition["modes"]["light"]): ThemeDefinition["modes"]["light"] => Object.freeze({ ...set, "color.primary": primary, "color.primary.hover": shiftOklchLightness(primary, -0.06)!, "color.primary.active": shiftOklchLightness(primary, -0.11)!, "color.primary.fg": primaryForeground, "color.ring": primary } as Record<TokenPath, ThemeTokenInput>);
  return freezeTheme({ ...cloned, modes: { light: update(cloned.modes.light), dark: update(cloned.modes.dark) } });
}

/** Serializes the public theme format with a stable, inspectable layout. */
export function exportTheme(theme: ThemeDefinition): string { return `${JSON.stringify({ $schema: "https://oriatheme.dev/schema/theme-v1.json", ...theme }, null, 2)}\n`; }

/** Imports untrusted JSON, forcibly converts it to custom, and handles ID conflict rules. */
export function importTheme(json: string, options: ImportThemeOptions): ImportResult {
  const maxBytes = options.maxBytes ?? 128 * 1024;
  if (new TextEncoder().encode(json).byteLength > maxBytes) return { ok: false, issues: [issue("INVALID_JSON", "Theme file exceeds the maximum size.")] };
  let raw: unknown; try { raw = JSON.parse(json); } catch { return { ok: false, issues: [issue("INVALID_JSON", "Theme file is not valid JSON.")] }; }
  let candidate = raw;
  let migration: ThemeMigrationResult | undefined;
  if (object(raw) && object(raw.contract) && (raw.contract.name !== options.contract.name || raw.contract.version !== options.contract.version)) {
    if (!options.migrate) return { ok: false, issues: [issue("UNSUPPORTED_CONTRACT", "Theme contract does not match the target contract.", "contract")] };
    const migrated = options.migrate(raw, raw.contract as unknown as { name: string; version: number });
    candidate = isMigrationResult(migrated) ? migrated.theme : migrated;
    if (isMigrationResult(migrated)) migration = migrated;
  }
  if (object(candidate)) candidate = { ...candidate, kind: "custom" };
  const checked = validateTheme(candidate, options.contract);
  if (!checked.ok) return checked;
  const same = (options.existingThemes ?? []).find(theme => theme.id === checked.value.id);
  if (!same) return { ok: true, theme: checked.value, replaced: false, ...(migration === undefined ? {} : { warnings: migration.warnings, requiresReview: migration.requiresReview }) };
  if (same.kind === "preset") return { ok: false, issues: [issue("PRESET_IMMUTABLE", "Imported themes cannot replace a preset.", "id")] };
  if (options.conflict === "replace") return { ok: true, theme: checked.value, replaced: true, ...(migration === undefined ? {} : { warnings: migration.warnings, requiresReview: migration.requiresReview }) };
  const newId = uniqueId(checked.value.id, options.existingThemes ?? []);
  return { ok: true, theme: freezeTheme({ ...checked.value, id: newId }), replaced: false, ...(migration === undefined ? {} : { warnings: migration.warnings, requiresReview: migration.requiresReview }) };
}

/** Converts a contract token path to its CSS custom-property name. Legacy remains source-compatible. */
export function toCssVariable(path: TokenPath, prefix = "oria", cssNameStyle: CssNameStyle = "legacy"): `--${string}` {
  const name = cssNameStyle === "kebab" ? path.replace(/\./g, "-") : path.replace(/\./g, "-");
  return `--${prefix ? `${prefix}-` : ""}${name}`;
}

function validateTokenSet(value: unknown, mode: string, contract: TokenContract, issues: ValidationIssue[]): void {
  if (!object(value)) { issues.push(issue("INVALID_THEME", "Token set must be an object.", `modes.${mode}`)); return; }
  for (const [path, input] of Object.entries(value)) {
    const fullPath = `modes.${mode}.${path}`;
    if (!isTokenPath(path)) { issues.push(issue("INVALID_TOKEN_PATH", "Invalid token path.", fullPath)); continue; }
    const definition = contract.tokens[path as TokenPath];
    if (!definition) { issues.push(issue("INVALID_THEME", "Token is not present in this contract.", fullPath)); continue; }
    if (reference(input)) { if (!contract.tokens[input.$ref]) issues.push(issue("TOKEN_REFERENCE_NOT_FOUND", `Unknown reference ${input.$ref}.`, fullPath)); continue; }
    const reason = valueError(input, definition);
    if (reason) issues.push(issue("INVALID_TOKEN_VALUE", reason, fullPath));
    else validatePatternReference(input, definition, contract, fullPath, issues);
  }
  for (const [path, definition] of Object.entries(contract.tokens)) if (definition.required && value[path] === undefined && definition.default === undefined) issues.push(issue("INVALID_THEME", "Required token is missing.", `modes.${mode}.${path}`));
}
function valueError(value: unknown, definition: TokenDefinition): string | undefined {
  if (definition.type === "number") {
    if (typeof value !== "number" || !Number.isFinite(value) || (definition.minimum !== undefined && value < definition.minimum) || (definition.maximum !== undefined && value > definition.maximum)) return "Expected a finite number within its configured range.";
    if (definition.integer === true && !Number.isInteger(value)) return "Expected an integer value.";
    return undefined;
  }
  if (definition.type === "fontFamily") return !Array.isArray(value) || value.length === 0 || value.some(item => typeof item !== "string" || !safeString(item)) ? "Expected a non-empty safe font family list." : undefined;
  if (definition.type === "cubicBezier") return !Array.isArray(value) || value.length !== 4 || value.some(item => typeof item !== "number" || !Number.isFinite(item)) ? "Expected a four-number cubic bezier tuple." : undefined;
  if (definition.type === "shadow") return !Array.isArray(value) || value.some(layer => !validShadow(layer)) ? "Expected structured shadow layers." : undefined;
  if (definition.type === "gradient") return !validGradient(value) ? "Expected a structured gradient with at least two valid stops." : undefined;
  if (definition.type === "pattern") return !validPatternLayers(value) ? "Expected 1–8 ordered dot, stripe, or grid layers with safe colors, positive dimensions, and valid angles." : undefined;
  if (typeof value !== "string" || !safeString(value)) return "Expected a safe CSS string.";
  if (definition.type === "color") return validColor(value) ? undefined : "Expected a statically parseable color.";
  if (definition.type === "dimension") return DIMENSION.test(value) ? undefined : "Expected a dimension with an allowed unit.";
  if (definition.type === "duration") return DURATION.test(value) ? undefined : "Expected a duration in ms or s.";
  if (definition.type === "fontWeight") return /^(?:normal|bold|[1-9]00)$/.test(value) ? undefined : "Expected a CSS font weight.";
  return "Unsupported token type.";
}
function safeString(value: string): boolean { return value.length > 0 && value.length < 512 && !UNSAFE.test(value) && !/\b(?:url|var|expression)\s*\(/i.test(value); }
function validColor(value: string): boolean { return safeString(value) && isColorValue(value); }
function validShadow(value: unknown): value is ShadowLayer {
  return object(value) && typeof value.x === "string" && DIMENSION.test(value.x) && typeof value.y === "string" && DIMENSION.test(value.y) && typeof value.blur === "string" && DIMENSION.test(value.blur) && typeof value.spread === "string" && DIMENSION.test(value.spread) && typeof value.color === "string" && validColor(value.color) && (value.inset === undefined || typeof value.inset === "boolean");
}
function validGradient(value: unknown): value is GradientDefinition {
  if (!object(value) || !Array.isArray(value.stops) || value.stops.length < 2 || value.stops.some(stop => !validStop(stop))) return false;
  const angle = typeof value.angle === "number" && Number.isFinite(value.angle);
  const position = value.position === undefined || validGradientPosition(value.position);
  if (value.type === "linear" || value.type === "repeating-linear") return angle;
  if (value.type === "radial" || value.type === "repeating-radial") return position;
  return value.type === "conic" && angle && position;
}
function validGradientPosition(value: unknown): value is GradientPosition {
  if (typeof value === "string") return GRADIENT_POSITIONS.has(value);
  return object(value) && typeof value.x === "number" && Number.isFinite(value.x) && value.x >= 0 && value.x <= 100 && typeof value.y === "number" && Number.isFinite(value.y) && value.y >= 0 && value.y <= 100;
}
function compileGradientPosition(value: GradientPosition | undefined): string { return value === undefined ? "center" : typeof value === "string" ? value : `${value.x}% ${value.y}%`; }
function validStop(value: unknown): value is GradientStop { return object(value) && (typeof value.color === "string" ? validColor(value.color) : reference(value.color)) && (value.position === undefined || (typeof value.position === "number" && value.position >= 0 && value.position <= 100)); }
function positiveDimension(value: unknown): value is string { return typeof value === "string" && DIMENSION.test(value) && Number.parseFloat(value) > 0; }
function validPatternColor(value: unknown): boolean { return typeof value === "string" ? validColor(value) : reference(value); }
function validPatternAngle(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 360; }
function validPatternIntensity(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1; }
function validPatternLayer(value: unknown): value is PatternLayer {
  if (!object(value) || !validPatternColor(value.color)) return false;
  if (value.type === "noise") return Object.keys(value).length === 5 && typeof value.variant === "string" && NOISE_VARIANTS.has(value.variant as NoisePatternVariant) && positiveDimension(value.tileSize) && validPatternIntensity(value.intensity);
  if (!positiveDimension(value.spacing)) return false;
  if (value.type === "dot") return Object.keys(value).length === (value.angle === undefined ? 4 : 5) && positiveDimension(value.radius) && (value.angle === undefined || validPatternAngle(value.angle));
  if (value.type === "stripe") return Object.keys(value).length === 5 && positiveDimension(value.stripeWidth) && validPatternAngle(value.angle);
  return value.type === "grid" && Object.keys(value).length === 5 && positiveDimension(value.lineWidth) && validPatternAngle(value.angle);
}
function validPatternLayers(value: unknown): value is PatternLayers { return Array.isArray(value) && value.length > 0 && value.length <= 8 && value.every(validPatternLayer); }
function validatePatternReference(input: unknown, definition: TokenDefinition, contract: TokenContract, path: string, issues: ValidationIssue[]): void {
  if (definition.type !== "pattern" || !Array.isArray(input)) return;
  for (const [index, layer] of input.entries()) {
    if (!object(layer) || !reference(layer.color)) continue;
    const target = contract.tokens[layer.color.$ref];
    const layerPath = `${path}.${index}.color`;
    if (!target) issues.push(issue("TOKEN_REFERENCE_NOT_FOUND", `Unknown pattern color reference ${layer.color.$ref}.`, layerPath));
    else if (target.type !== "color") issues.push(issue("TOKEN_REFERENCE_TYPE_MISMATCH", "Pattern color references must target a color token.", layerPath, { target: layer.color.$ref }));
  }
}
function compileValue(value: TokenValue, type: TokenType, get: (path: TokenPath) => TokenValue): string {
  if (type === "fontFamily") return (value as readonly string[]).map(family => /[\s,]/.test(family) ? `"${family.replace(/["\\]/g, "\\$&")}"` : family).join(", ");
  if (type === "cubicBezier") return `cubic-bezier(${(value as readonly number[]).join(", ")})`;
  if (type === "shadow") return (value as readonly ShadowLayer[]).map(layer => `${layer.inset ? "inset " : ""}${layer.x} ${layer.y} ${layer.blur} ${layer.spread} ${layer.color}`).join(", ");
  if (type === "gradient") {
    const gradient = value as GradientDefinition;
    const stops = gradient.stops.map(stop => `${typeof stop.color === "string" ? stop.color : String(get(stop.color.$ref))}${stop.position === undefined ? "" : ` ${stop.position}%`}`).join(", ");
    if (gradient.type === "linear") return `linear-gradient(${gradient.angle}deg, ${stops})`;
    if (gradient.type === "repeating-linear") return `repeating-linear-gradient(${gradient.angle}deg, ${stops})`;
    if (gradient.type === "radial") return `radial-gradient(circle at ${compileGradientPosition(gradient.position)}, ${stops})`;
    if (gradient.type === "repeating-radial") return `repeating-radial-gradient(circle at ${compileGradientPosition(gradient.position)}, ${stops})`;
    return `conic-gradient(from ${gradient.angle}deg at ${compileGradientPosition(gradient.position)}, ${stops})`;
  }
  if (type === "pattern") {
    const patterns = value as PatternLayers;
    return patterns.map(pattern => compilePatternLayer(pattern, get)).join(", ");
  }
  return String(value);
}
function numberValue(value: TokenValue, path: TokenPath): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new OriaThemeError("INVALID_THEME", `Derived variable factor ${path} must resolve to a finite number.`, { path });
  return value;
}
function scaleDimension(value: TokenValue, factor: number): string {
  if (typeof value !== "string") throw new OriaThemeError("INVALID_THEME", "Derived variable source must resolve to a dimension.");
  if (value === "0") return "0";
  const match = /^([-+]?(?:\d+|\d*\.\d+))(px|rem|em|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/.exec(value);
  if (!match) throw new OriaThemeError("INVALID_THEME", "Derived variable source must resolve to a static dimension.");
  const number = Number(match[1]) * factor;
  if (!Number.isFinite(number)) throw new OriaThemeError("INVALID_THEME", "Derived variable calculation is not finite.");
  return `${Number(number.toFixed(6))}${match[2]!}`;
}
function isMigrationResult(value: unknown): value is ThemeMigrationResult { return object(value) && object(value.theme) && Array.isArray(value.warnings) && typeof value.requiresReview === "boolean"; }
function compilePatternLayer(pattern: PatternLayer, get: (path: TokenPath) => TokenValue): string {
  const color = typeof pattern.color === "string" ? pattern.color : String(get(pattern.color.$ref));
  if (pattern.type === "dot") {
    if (pattern.angle === undefined || pattern.angle === 0) return `radial-gradient(circle at center, ${color} 0 ${pattern.radius}, transparent ${pattern.radius}) 0 0 / ${pattern.spacing} ${pattern.spacing} repeat`;
    return rotatedDotPattern(color, pattern.radius, pattern.spacing, pattern.angle);
  }
  if (pattern.type === "noise") return noisePattern(color, pattern.variant, pattern.tileSize, pattern.intensity);
  if (pattern.type === "stripe") return repeatingLinePattern(color, pattern.stripeWidth, pattern.spacing, pattern.angle);
  return `${repeatingLinePattern(color, pattern.lineWidth, pattern.spacing, pattern.angle)}, ${repeatingLinePattern(color, pattern.lineWidth, pattern.spacing, (pattern.angle + 90) % 360)}`;
}
function repeatingLinePattern(color: string, width: string, spacing: string, angle: number): string { return `repeating-linear-gradient(${angle}deg, ${color} 0 ${width}, transparent ${width} ${spacing})`; }
function rotatedDotPattern(color: string, radius: string, spacing: string, angle: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><defs><pattern id="oria-dot" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><circle cx="0" cy="0" r="${radius}" fill="${color}"/></pattern></defs><rect width="100%" height="100%" fill="url(#oria-dot)"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 0 / 256px 256px repeat`;
}
function noisePattern(color: string, variant: NoisePatternVariant, tileSize: string, intensity: number): string {
  if (variant === "paper") {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><filter id="oria-paper-base" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.18" numOctaves="2" seed="17" stitchTiles="stitch" result="noise"/><feColorMatrix in="noise" type="luminanceToAlpha" result="alpha"/><feFlood flood-color="${color}" result="tint"/><feComposite in="tint" in2="alpha" operator="in"/></filter></defs><g opacity="${intensity}"><rect width="96" height="96" filter="url(#oria-paper-base)" opacity="0.18"/><g data-oria-paper="specks" fill="${color}" opacity="0.85"><circle cx="8.5" cy="11.75" r="0.78"/><circle cx="28" cy="7" r="0.45"/><circle cx="50.5" cy="21.5" r="0.9"/><ellipse cx="77" cy="14" rx="1.2" ry="0.45" transform="rotate(24 77 14)"/><circle cx="15" cy="48" r="0.38"/><ellipse cx="38" cy="43" rx="0.5" ry="1.1" transform="rotate(70 38 43)"/><circle cx="64" cy="52" r="0.65"/><circle cx="87" cy="40" r="0.36"/><ellipse cx="23" cy="76" rx="0.75" ry="0.32" transform="rotate(-32 23 76)"/><circle cx="56" cy="86" r="0.46"/><circle cx="80" cy="72" r="1"/></g><g data-oria-paper="fibers" fill="none" stroke="${color}" stroke-width="0.7" stroke-linecap="round" opacity="0.65"><path d="m8.5 29.5 6.5 2.1"/><path d="m34 64 3.2-4.8"/><path d="m68.5 31 7.5-1.8"/><path d="m5 89 4.2-4.1"/><path d="m47 9.2 2.5 5"/><path d="m83 92-4.6-3.4"/></g></g></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 0 / ${tileSize} ${tileSize} repeat`;
  }
  const profile: Readonly<Record<Exclude<NoisePatternVariant, "paper">, readonly [frequency: string, octaves: number, seed: number]>> = { film: ["0.92", 2, 29], frosted: ["0.38", 3, 41] };
  const [frequency, octaves, seed] = profile[variant];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><filter id="oria-noise" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="${octaves}" seed="${seed}" stitchTiles="stitch" result="noise"/><feColorMatrix in="noise" type="luminanceToAlpha" result="alpha"/><feFlood flood-color="${color}" result="tint"/><feComposite in="tint" in2="alpha" operator="in"/></filter><rect width="64" height="64" filter="url(#oria-noise)" opacity="${intensity}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 0 / ${tileSize} ${tileSize} repeat`;
}
function uniqueId(seed: string, themes: readonly ThemeDefinition[]): string { const ids = new Set(themes.map(theme => theme.id)); for (let index = 2; ; index += 1) { const suffix = `-${index}`; const id = `${seed.slice(0, 64 - suffix.length)}${suffix}`; if (!ids.has(id)) return id; } }
function freezeTheme(theme: ThemeDefinition): ThemeDefinition { return Object.freeze({ ...theme, contract: Object.freeze({ ...theme.contract }), modes: Object.freeze({ light: Object.freeze(stableClone(theme.modes.light)), dark: Object.freeze(stableClone(theme.modes.dark)) }), ...(theme.metadata === undefined ? {} : { metadata: Object.freeze({ ...theme.metadata }) }) }); }
function preferredForeground(color: string): string {
  const dark = toOklchColor("#0f172a")!; const light = toOklchColor("#ffffff")!;
  return staticContrastRatio(dark, color) >= staticContrastRatio(light, color) ? dark : light;
}

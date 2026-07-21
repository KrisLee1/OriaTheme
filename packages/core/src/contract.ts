import { OriaThemeError } from "./errors.js";
import type { TokenContract, TokenContractInput, TokenDefinition, TokenPath, TokenType } from "./types.js";

const PATH = /^[a-z][a-zA-Z0-9]*(\.(?:[a-z][a-zA-Z0-9]*|[0-9]+(?:[a-z][a-zA-Z0-9]*)?))+$/;
const TYPES: ReadonlySet<string> = new Set(["color", "dimension", "number", "fontFamily", "fontWeight", "duration", "cubicBezier", "shadow", "gradient", "pattern"]);

export function isTokenPath(value: string): value is TokenPath { return PATH.test(value); }

/** Creates an immutable, fully validated token contract. */
export function defineTokenContract(input: TokenContractInput): TokenContract {
  if (!/^[a-z][a-z0-9-]{1,63}$/.test(input.name) || !Number.isInteger(input.version) || input.version < 1) {
    throw new OriaThemeError("INVALID_CONTRACT", "Contract name must be a valid slug and version must be a positive integer.");
  }
  const tokens: Record<string, TokenDefinition> = {};
  for (const base of input.extends ?? []) {
    for (const [path, definition] of Object.entries(base.tokens)) tokens[path] = definition;
  }
  for (const [path, definition] of Object.entries(input.tokens)) {
    if (!isTokenPath(path)) throw new OriaThemeError("INVALID_TOKEN_PATH", `Invalid token path: ${path}`, { path });
    if (!TYPES.has(definition.type)) throw new OriaThemeError("INVALID_CONTRACT", `Unknown token type for ${path}.`, { path });
    const existing = tokens[path];
    if (existing && existing.type !== definition.type) {
      throw new OriaThemeError("INVALID_CONTRACT", `An extension cannot change the type of ${path}.`, { path });
    }
    if (definition.minimum !== undefined && definition.maximum !== undefined && definition.minimum > definition.maximum) {
      throw new OriaThemeError("INVALID_CONTRACT", `Minimum cannot exceed maximum for ${path}.`, { path });
    }
    if (definition.default !== undefined && !validDefault(definition)) {
      throw new OriaThemeError("INVALID_CONTRACT", `Default value is not valid for ${path}.`, { path });
    }
    tokens[path] = freezeDefinition(definition);
  }
  return Object.freeze({ name: input.name, version: input.version, tokens: Object.freeze(tokens as Record<TokenPath, TokenDefinition>) });
}

/** Extends a contract while retaining all base token definitions. */
export function extendTokenContract(base: TokenContract, extension: TokenContractInput): TokenContract {
  return defineTokenContract({ ...extension, extends: [base, ...(extension.extends ?? [])] });
}

/** Retrieves a definition without exposing a mutable contract implementation. */
export function getTokenDefinition(contract: TokenContract, path: TokenPath): TokenDefinition | undefined { return contract.tokens[path]; }

function freezeDefinition(definition: TokenDefinition): TokenDefinition {
  const result = { ...definition } as TokenDefinition;
  if (definition.default !== undefined) Object.assign(result, { default: freezeValue(definition.default) });
  return Object.freeze(result);
}
function freezeValue(value: unknown): unknown {
  if (Array.isArray(value)) return Object.freeze(value.map(freezeValue));
  if (value !== null && typeof value === "object") return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freezeValue(entry)])));
  return value;
}

export const token = <T extends TokenType>(type: T, options: Omit<TokenDefinition<T>, "type">): TokenDefinition<T> => Object.freeze({ type, ...options });
export const colorToken = (options: Omit<TokenDefinition<"color">, "type">): TokenDefinition<"color"> => token("color", options);

function validDefault(definition: TokenDefinition): boolean {
  const value = definition.default;
  if (value === undefined) return true;
  if (definition.type === "number") return typeof value === "number" && Number.isFinite(value) && (definition.minimum === undefined || value >= definition.minimum) && (definition.maximum === undefined || value <= definition.maximum);
  if (definition.type === "fontFamily") return Array.isArray(value) && value.length > 0 && value.every(item => typeof item === "string" && safeString(item));
  if (definition.type === "cubicBezier") return Array.isArray(value) && value.length === 4 && value.every(item => typeof item === "number" && Number.isFinite(item));
  if (definition.type === "shadow") return Array.isArray(value) && value.every(layer => typeof layer === "object" && layer !== null);
  if (definition.type === "gradient") return typeof value === "object" && value !== null && !Array.isArray(value);
  if (definition.type === "pattern") return Array.isArray(value);
  if (typeof value !== "string" || !safeString(value)) return false;
  if (definition.type === "dimension") return /^(?:0|[-+]?(?:\d+|\d*\.\d+)(?:px|rem|em|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc))$/.test(value);
  if (definition.type === "duration") return /^(?:0|[-+]?(?:\d+|\d*\.\d+)(?:ms|s))$/.test(value);
  if (definition.type === "fontWeight") return /^(?:normal|bold|[1-9]00)$/.test(value);
  return true;
}
function safeString(value: string): boolean { return value.length > 0 && value.length < 512 && !/[;{}<>]/.test(value) && !/\b(?:url|var|expression)\s*\(/i.test(value); }

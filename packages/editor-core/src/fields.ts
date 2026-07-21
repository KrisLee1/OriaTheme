import { oriaStandardContract } from "@oriatheme/core";
import type { TokenContract, TokenDefinition, TokenPath, TokenType } from "@oriatheme/core";

export interface TokenFieldDescriptor {
  readonly path: TokenPath;
  readonly type: TokenType;
  readonly required: boolean;
  readonly description: string;
  readonly minimum?: number;
  readonly maximum?: number;
  readonly segments: readonly string[];
  readonly label: string;
  readonly modeScope: TokenModeScope;
}

export type TokenModeScope = "shared" | "mode";

const MODE_SCOPED_STANDARD_PREFIXES = Object.freeze(["color.", "gradient.", "pattern.", "elevation.shadow."] as const);

const words = (value: string): string => value
  .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  .replace(/[-_]/g, " ")
  .replace(/^./, character => character.toUpperCase());

function fieldLabel(path: TokenPath, segments: readonly string[]): string {
  const size = words(segments.at(-1) ?? path);
  if (path.startsWith("control.height.")) return `Height ${size}`;
  if (path.startsWith("control.paddingInline.")) return `Horizontal padding ${size}`;
  return size;
}

function descriptor(path: TokenPath, definition: TokenDefinition): TokenFieldDescriptor {
  const segments = Object.freeze(path.split("."));
  return Object.freeze({
    path,
    type: definition.type,
    required: definition.required,
    description: definition.description,
    ...(definition.minimum === undefined ? {} : { minimum: definition.minimum }),
    ...(definition.maximum === undefined ? {} : { maximum: definition.maximum }),
    segments,
    label: fieldLabel(path, segments),
    modeScope: getTokenModeScope(path)
  });
}

/** Returns the editor scope for a standard token; unknown extension tokens remain mode-local. */
export function getTokenModeScope(path: TokenPath): TokenModeScope {
  if (!oriaStandardContract.tokens[path]) return "mode";
  return MODE_SCOPED_STANDARD_PREFIXES.some(prefix => path.startsWith(prefix)) ? "mode" : "shared";
}

/** Framework-independent field metadata in stable contract order. */
export function describeTokenContract(contract: TokenContract = oriaStandardContract): readonly TokenFieldDescriptor[] {
  return Object.freeze(Object.entries(contract.tokens).map(([path, definition]) => descriptor(path as TokenPath, definition)));
}

/** Looks up one field without making a framework copy of the contract rules. */
export function describeToken(path: TokenPath, contract: TokenContract = oriaStandardContract): TokenFieldDescriptor | undefined {
  const definition = contract.tokens[path];
  return definition ? descriptor(path, definition) : undefined;
}

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
  readonly group: TokenFieldGroup;
}

export type TokenModeScope = "shared" | "mode";
export type TokenFieldGroup = "color" | "typography" | "geometry" | "shadow" | "effects" | "material" | "motion" | "other";

const words = (value: string): string => value
  .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  .replace(/[-_]/g, " ")
  .replace(/^./, character => character.toUpperCase());

function fieldLabel(path: TokenPath, segments: readonly string[]): string {
  const last = segments.at(-1) ?? path;
  const size = words(last);
  if (path.startsWith("control.height.")) return `Height ${size}`;
  if (path.startsWith("control.paddingInline.")) return `Horizontal padding ${size}`;
  if (path.startsWith("control.padding.x.")) return `Horizontal padding ${size}`;
  const parent = segments.slice(1, -1).map(words).join(" ");
  if (last === "bg") return `${parent} Background`.trim();
  if (last === "fg") return `${parent} Foreground`.trim();
  if (parent && /^\d+$/.test(last)) return `${parent} ${last}`;
  return size;
}
function fieldGroup(path: TokenPath): TokenFieldGroup {
  if (path.startsWith("color.")) return "color";
  if (path.startsWith("typography.") || path.startsWith("font.") || path.startsWith("text.") || path.startsWith("leading.") || path.startsWith("tracking.")) return "typography";
  if (path.startsWith("shape.") || path === "space" || path === "radius" || path.startsWith("control.") || path.startsWith("border.") || path.startsWith("ring.")) return "geometry";
  if (path.startsWith("elevation.shadow.") || path.startsWith("shadow.")) return "shadow";
  if (path.startsWith("effect.") || path.startsWith("opacity.") || path.startsWith("blur.") || path.startsWith("backdrop.")) return "effects";
  if (path.startsWith("gradient.") || path.startsWith("pattern.")) return "material";
  if (path.startsWith("motion.") || path.startsWith("duration.") || path.startsWith("ease.")) return "motion";
  return "other";
}

function descriptor(path: TokenPath, definition: TokenDefinition, contract: TokenContract): TokenFieldDescriptor {
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
    modeScope: getTokenModeScope(path, contract),
    group: fieldGroup(path)
  });
}

/** Returns the editor scope for a standard token; unknown extension tokens remain mode-local. */
export function getTokenModeScope(path: TokenPath, contract: TokenContract = oriaStandardContract): TokenModeScope {
  if (!contract.tokens[path]) return "mode";
  const modeScoped = ["color.", "gradient.", "pattern.", "elevation.shadow.", "shadow."];
  return modeScoped.some(prefix => path.startsWith(prefix)) ? "mode" : "shared";
}

/** Framework-independent field metadata in stable contract order. */
export function describeTokenContract(contract: TokenContract = oriaStandardContract): readonly TokenFieldDescriptor[] {
  return Object.freeze(Object.entries(contract.tokens).map(([path, definition]) => descriptor(path as TokenPath, definition, contract)));
}

/** Looks up one field without making a framework copy of the contract rules. */
export function describeToken(path: TokenPath, contract: TokenContract = oriaStandardContract): TokenFieldDescriptor | undefined {
  const definition = contract.tokens[path];
  return definition ? descriptor(path, definition, contract) : undefined;
}

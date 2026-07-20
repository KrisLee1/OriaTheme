import type { ValidationIssue } from "./types.js";

export type OriaThemeErrorCode =
  | "INVALID_JSON" | "UNSUPPORTED_SCHEMA_VERSION" | "UNSUPPORTED_CONTRACT" | "INVALID_CONTRACT"
  | "INVALID_THEME" | "INVALID_TOKEN_PATH" | "INVALID_TOKEN_VALUE" | "TOKEN_REFERENCE_NOT_FOUND"
  | "TOKEN_REFERENCE_TYPE_MISMATCH" | "TOKEN_REFERENCE_CYCLE" | "THEME_NOT_FOUND" | "THEME_ID_CONFLICT"
  | "PRESET_IMMUTABLE" | "STORAGE_READ_FAILED" | "STORAGE_WRITE_FAILED" | "DOM_APPLY_FAILED";

/** Stable error type. Consumers should branch on code rather than message text. */
export class OriaThemeError extends Error {
  readonly code: OriaThemeErrorCode;
  readonly path?: string;
  readonly details?: Readonly<Record<string, unknown>>;
  constructor(code: OriaThemeErrorCode, message: string, options: { path?: string; details?: Readonly<Record<string, unknown>> } = {}) {
    super(message);
    this.name = "OriaThemeError";
    this.code = code;
    if (options.path !== undefined) this.path = options.path;
    if (options.details !== undefined) this.details = options.details;
  }
  toIssue(): ValidationIssue { return { code: this.code, message: this.message, ...(this.path === undefined ? {} : { path: this.path }), ...(this.details === undefined ? {} : { details: this.details }) }; }
}

export const issue = (code: OriaThemeErrorCode, message: string, path?: string, details?: Readonly<Record<string, unknown>>): ValidationIssue =>
  ({ code, message, ...(path === undefined ? {} : { path }), ...(details === undefined ? {} : { details }) });

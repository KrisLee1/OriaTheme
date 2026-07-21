# Migrations and compatibility

[中文](../migrations.md) · [Guide index](README.md)

v1 has independent npm package, Theme `schemaVersion`, Token Contract, and persisted-state versions.

- Theme `schemaVersion: 1` accepts only the v1 serialized shape; unknown versions fall back safely.
- A theme's contract name/version must match the registered runtime contract. Pass an explicit `migrate` function to the import API when migration is required; never silently drop tokens.
- Corrupt LocalStorage, an invalid active theme, unverifiable custom themes, and write failures do not prevent in-memory operation.
- The active snapshot is a first-paint optimization only. The full runtime revalidates the primary state and contract after startup.

To migrate an early unversioned implementation, convert the raw data into `ThemeDefinition`, call `validateTheme()`, then persist it through `importTheme()` or `createCustomTheme()`. Persist `appearance`, never `resolvedMode`.

## 0.1.0 → next release: Document Canvas rename

- `oria-document-canvas` is renamed to `oria-manuscript` (Manuscript), and the named export `oriaDocumentCanvasTheme` becomes `oriaManuscriptTheme`; token data is unchanged (ADR-0016).
- Update imports and any ID-based references (`defaultThemeId`, `setTheme`, etc.) to the new names; no other code changes are required.
- End users do not need to act: a persisted Document Canvas selection falls back to the default theme under the runtime's existing semantics, and Manuscript can be selected again.

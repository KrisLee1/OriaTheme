# Migrations and compatibility

[中文](../migrations.md) · [Guide index](README.md)

OriaTheme evolves four versions independently: the npm package version, the Theme `schemaVersion`, the Token Contract version, and the persisted-state `schemaVersion`. Do not infer storage compatibility from an npm version.

- Theme `schemaVersion: 1` accepts only the v1 serialized shape; unknown versions fall back safely.
- A theme's contract name/version must match the contract in use by the runtime. The only way to accept a theme from another contract is an explicitly registered migration (`migrations` in the runtime config, or `migrate` in the import API); tokens are never silently dropped.
- Corrupt LocalStorage, an invalid active theme, unverifiable custom themes, and write failures do not prevent in-memory operation.
- The active snapshot is a first-paint optimization only. The full runtime revalidates the primary state and contract after startup.

To migrate an early unversioned implementation, convert the raw data into `ThemeDefinition`, call `validateTheme()`, then persist it through `importTheme()` or `createCustomTheme()`. Persist `appearance`, never `resolvedMode`.

## 0.1.x → `oria-standard@2`: the default contract switches (breaking change)

This release moves the default standard contract from `oria-standard@1` to `oria-standard@2` (ADR-0019). v2 is the default and only standard design; v1 remains as legacy exports that exist solely as migration input. The breaking changes are:

- Core/Runtime APIs called without a contract (`resolveTheme()`, `createOriaThemeRuntime()`, the React/Vue adapters, `createThemeFromSeed()`, etc.) now resolve v2. `oriaStandardContract` and `oriaDefaultTheme` point at v2; v1 is exported as `oriaStandardContractV1` and `oriaDefaultThemeV1`.
- Every `@oriatheme/presets` export (`oriaPresetThemes`, the named exports, `oriaPresetCatalog`) is now a native v2 theme; v1 no longer ships official presets. Preset IDs are unchanged.
- Runtime CSS variables switch to all-lowercase kebab-case, with new derived variables (see the mapping below).
- The registry `theme-editor` component moves to `0.2.0`, renders the v2 contract, and requires `@oriatheme/core@^0.3.0`.
- A new public package, `@oriatheme/tailwind`, provides an optional static Tailwind v4 bridge.

### Upgrade steps

1. Upgrade all `@oriatheme/*` dependencies of an application together to the same release batch; do not mix 0.1.x with the new versions.
2. Point code that explicitly references the v1 contract or default theme at `oriaStandardContractV1` / `oriaDefaultThemeV1`. Calls that omit the contract need no change — v2 is the default.
3. If your users may hold v1 custom themes (persisted state in Storage or exported `.oria-theme.json` files), register the migrator explicitly in the runtime config:

   ```ts
   import { migrateOriaStandardV1ToV2 } from "@oriatheme/core";
   import { oriaPresetThemes } from "@oriatheme/presets";

   createOriaThemeRuntime({
     presets: oriaPresetThemes,
     defaultThemeId: "oria-default",
     migrations: [migrateOriaStandardV1ToV2],
   });
   ```

   The React/Vue adapters forward the same field to the runtime (`OriaThemeProvider config` / `createOriaTheme()`).
4. Declare the v2 contract ref for Bootstrap so v1 snapshots are rejected safely (see "Bootstrap and first paint"):

   ```ts
   bootstrapTheme({ contract: { name: "oria-standard", version: 2 } });
   ```

5. Rename the v1 CSS variables in your own stylesheets (see "v1 → v2 name mapping").
6. If you installed the editor components through the CLI, reinstall or diff the `theme-editor@0.2.0` template.
7. Optional: Tailwind v4 projects can adopt the static bridge from `@oriatheme/tailwind`.

### How persisted v1 custom themes are restored

- With `migrations` registered, the runtime's first `start()` migrates every persisted v1 custom theme, validates the result fully against v2, applies it atomically, and immediately writes the migrated state and a new active snapshot back to Storage. Later launches read v2 data directly and do not migrate again.
- Without `migrations`, persisted state containing v1 custom themes is rejected as a whole: the runtime falls back to the default theme with an empty custom list, reports through `snapshot.error` / `onError`, and does not overwrite the original Storage data during that launch. Register the migrator and restart to recover. Note that any new state write in the rejected configuration (for example, the user switching themes) overwrites the old data with the current in-memory state.
- A persisted preference pointing at an official preset (`activeThemeId` is a preset ID) needs no migration: preset IDs are stable and the runtime resolves them against the new v2 presets.
- The persistence container keys and `schemaVersion` are unchanged (`{storageKey}:state:v1`, `:active:v1`); the compatibility boundary is expressed by `contract.version`.

### The `requiresReview` review flow

`migrateOriaStandardV1ToV2(input)` returns `{ theme, warnings, requiresReview }`: the input must be a complete, valid v1 standard theme, and the returned theme has passed full v2 validation. Any failure throws; migration never applies partially.

v2 persists only two geometry sources, `space` and `radius`: the radius scale is fixed at 0.5/1/1.5/2/3/4/6/8 multiples, and control heights and horizontal padding are integer multiples of `space` from 1 to 24. A v1 value that cannot be represented exactly snaps to the nearest legal value and emits a per-field warning — for example a radius scale that misses the fixed multiples, control lengths that are not integer multiples of `space`, or units that cannot be compared (which fall back to the default multiplier). `requiresReview` is `true` whenever any warning exists.

- Core's `importTheme(json, { contract, migrate })` returns `warnings` / `requiresReview` alongside the result when a migration ran. Present the migrated theme for preview and ask the user to confirm before saving; never persist silently when warnings exist.
- The runtime's `importTheme(json, options)` uses the registered migrations automatically (override with `options.migrate`), but returns only the migrated theme without warnings. Use Core's `importTheme()` when you need the review flow.
- Persisted-state restore is an unattended path: geometry rounding takes effect on first launch and is written back. If every theme must be reviewed individually, keep user data out of rehydrate and use the explicit import path instead.

### Bootstrap and first paint

- A v1 active snapshot (camelCase variables, `contract.version: 1`) cannot provide first-paint variables for a v2 page. Once you pass `contract: { name: "oria-standard", version: 2 }` to `bootstrapTheme()` / `createBootstrapStorageScript()`, a v1 snapshot is rejected on contract mismatch and the page silently keeps the application's static default CSS. Do not present that normal fallback as an error.
- After the runtime applies a v2 theme successfully for the first time, it removes the bootstrap style and writes a fresh v2 snapshot; first-paint restore works again from the second visit.
- A Bootstrap call without the contract declaration performs no such rejection and may paint a v1 snapshot's stale variables until the runtime starts; the declaration is required when upgrading to v2.

### Official presets are rebuilt, not migrated

Official presets are defined natively in v2 source and run no migration at load time. v2's normalized geometry (fixed radius multiples, integer control multipliers, no `spacing.density`) means individual presets can differ visually from their v1 rendering; that is contract semantics accepted by this release (ADR-0019). A custom theme a user once copied from a v1 preset is user data and follows the migration path above.

### v1 → v2 name mapping

Token paths in theme JSON (`$ref` references are rewritten the same way):

| v1 | v2 |
|---|---|
| `color.background` / `color.foreground` | `color.bg` / `color.fg` |
| `color.surfaceForeground` / `color.surfaceRaisedForeground` / `color.overlayForeground` | `color.surface.fg` / `color.surface.raised.fg` / `color.overlay.fg` |
| `color.primaryForeground` / `primaryHover` / `primaryActive` (same for `secondary`) | `color.primary.fg` / `.hover` / `.active` |
| `color.mutedForeground` / `color.accentForeground` | `color.muted.fg` / `color.accent.fg` |
| `color.destructive` / `color.destructiveForeground` | `color.danger` / `color.danger.fg` |
| `color.successForeground` / `warningForeground` / `infoForeground` | `color.success.fg` / `warning.fg` / `info.fg` |
| `color.borderStrong` / `color.selectionForeground` | `color.border.strong` / `color.selection.fg` |
| `color.chart1` … `color.chart8` | `color.chart.1` … `color.chart.8` |
| `typography.font.*` | `font.*` |
| `typography.weight.*` (`extraLight` / `extraBold`) | `font.weight.*` (`extralight` / `extrabold`) |
| `typography.size.*` | `text.*` |
| `typography.lineHeight.*` / `typography.letterSpacing.*` | `leading.*` / `tracking.*` |
| `spacing.unit`, `spacing.density`, `spacing.{1,2,3,4,5,6,8,10,12,16}` | Removed; collapses to the single source `space` (the v1 `spacing.1` value) |
| `shape.radius.{none,xs,sm,md,lg,xl,2xl,3xl,4xl,full}` | Removed; collapses to the single source `radius` (the v1 `shape.radius.sm` value); the scale is derived by Core |
| `shape.borderWidth.*` | `border.width.*` |
| `shape.focusRingWidth` / `shape.focusRingOffset` | `ring.width` / `ring.offset` |
| `control.height.{sm,md,lg}` (dimension) | `control.height.{sm,md,lg}` (integer multiple of `space`, 1–24) |
| `control.paddingInline.{sm,md,lg}` | `control.padding.x.{sm,md,lg}` (integer multiple of `space`, 1–24) |
| `elevation.shadow.*` | `shadow.*` |
| `effect.opacity.*` | `opacity.*` |
| `effect.blur.*` | `blur.*` |
| `effect.backdropBlur.*` / `effect.backdropSaturation` | `backdrop.blur.*` / `backdrop.saturate` |
| `gradient.background` / `gradient.surface` / `gradient.accent` | `gradient.bg` / `gradient.surface` / `gradient.accent` |
| `pattern.background` / `pattern.surface` | `pattern.bg` / `pattern.surface` |
| `motion.duration.*` | `duration.*` |
| `motion.easing.*` (`entrance`) | `ease.*` (`enter`) |

CSS variables (`--oria-` prefix): v1 keeps camelCase segments; v2 is all-lowercase and compiles `.` to `-`.

| v1 | v2 |
|---|---|
| `--oria-color-background` | `--oria-color-bg` |
| `--oria-color-primaryForeground` | `--oria-color-primary-fg` |
| `--oria-color-destructive` | `--oria-color-danger` |
| `--oria-color-chart1` | `--oria-color-chart-1` |
| `--oria-typography-font-sans` / `--oria-typography-weight-semibold` | `--oria-font-sans` / `--oria-font-weight-semibold` |
| `--oria-typography-size-md` / `--oria-typography-lineHeight-relaxed` / `--oria-typography-letterSpacing-wide` | `--oria-text-md` / `--oria-leading-relaxed` / `--oria-tracking-wide` |
| `--oria-spacing-4` | `calc(var(--oria-space) * 4)` |
| `--oria-shape-radius-lg` | `--oria-radius-lg` (derived variable, no longer persisted) |
| `--oria-shape-radius-full` | CSS constant `9999px` (`none` is `0`), no longer a token |
| `--oria-shape-borderWidth-default` / `--oria-shape-focusRingWidth` | `--oria-border-width-default` / `--oria-ring-width` |
| `--oria-control-height-md` / `--oria-control-paddingInline-md` | `--oria-control-height-md` / `--oria-control-padding-x-md` (both derived from `space` × an integer) |
| `--oria-elevation-shadow-md` | `--oria-shadow-md` |
| `--oria-effect-opacity-muted` | `--oria-opacity-muted` |
| `--oria-effect-blur-lg` / `--oria-effect-backdropBlur-lg` / `--oria-effect-backdropSaturation` | `--oria-blur-lg` / `--oria-backdrop-blur-lg` / `--oria-backdrop-saturate` |
| `--oria-gradient-background` / `--oria-pattern-background` | `--oria-gradient-bg` / `--oria-pattern-bg` |
| `--oria-motion-duration-normal` / `--oria-motion-easing-standard` | `--oria-duration-normal` / `--oria-ease-standard` |

The new source variables `--oria-space` and `--oria-radius` (`radius` is itself a source) plus the derived variables `--oria-radius-{xs,sm,md,lg,xl,2xl,3xl,4xl}` and `--oria-control-{height,padding-x}-{sm,md,lg}` complete the set; derived variables never enter theme JSON and are not editable.

### Preset rename in the same release: Document Canvas → Manuscript

- `oria-document-canvas` is renamed to `oria-manuscript` (Manuscript), and the named export `oriaDocumentCanvasTheme` becomes `oriaManuscriptTheme`; token data is unchanged (ADR-0016).
- Update imports and any ID-based references (`defaultThemeId`, `setTheme`, etc.) to the new names; no other code changes are required.
- End users do not need to act: a persisted Document Canvas selection falls back to the default theme under the runtime's existing semantics, and Manuscript can be selected again.

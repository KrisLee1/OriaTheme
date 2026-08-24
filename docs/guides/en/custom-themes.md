# Custom-theme workflow

[中文](../custom-themes.md) · [Guide index](README.md)

Keep editor drafts in application state and call the runtime only after complete validation. Never interpolate unvalidated user strings into CSS.

For the complete official catalog, install `@oriatheme/presets` and pass its collection:

```ts
import { oriaPresetThemes } from "@oriatheme/presets";

const runtime = createOriaThemeRuntime({
  presets: oriaPresetThemes,
  defaultThemeId: "oria-default",
});
```

Presets are immutable. Duplicate one into a custom theme before editing:

If the application bundles only selected official presets, compose its collection from per-theme entry points in a Presets release that includes them:

```ts
import { oriaOceanTheme } from "@oriatheme/presets/ocean";
import { oriaForestTheme } from "@oriatheme/presets/forest";

const appPresets = [oriaOceanTheme, oriaForestTheme];
```

Duplicate and update a custom theme:

```ts
const copied = runtime.duplicateTheme("oria-default", {
  id: "brand-2026",
  name: "Brand 2026",
});

runtime.updateCustomTheme(copied.id, {
  name: "Brand 2026 (refined)",
  modes: { light: draftLightTokens, dark: draftDarkTokens },
});
runtime.setTheme(copied.id);
```

`previewTheme()` does not change preference or Storage. Disposing its handle restores the latest official state, not a stale copy from preview start.

Use `runtime.importTheme(json)` for external JSON. Imports are forced to custom themes and cannot overwrite presets. Present `OriaThemeError.code` or validation issues rather than relying on error-message text. Importing JSON from a v1 (`oria-standard@1`) theme requires an explicit migration: register `migrations: [migrateOriaStandardV1ToV2]` in the runtime config, or use Core `importTheme()` with the `migrate` option to receive `warnings` / `requiresReview` for review; without a registered migration, v1 data is rejected safely. See the [migration guide](migrations.md).

Removing the active custom theme automatically falls back to the configured default theme. A preset cannot be modified or deleted; duplicate it first.

Official v2 and seed-generated themes use complete OKLCH colors. To combine a theme color with a separate opacity variable, keep the Runtime variable as a complete color and use `oklch(from var(--oria-color-primary) l c h / var(--component-opacity))` in CSS. Existing HEX, RGB, and HSL custom themes remain importable and persistable.

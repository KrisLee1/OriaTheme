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

Use `runtime.importTheme(json)` for external JSON. Imports are forced to custom themes and cannot overwrite presets. Present `OriaThemeError.code` or validation issues rather than relying on error-message text.

Removing the active custom theme automatically falls back to the configured default theme. A preset cannot be modified or deleted; duplicate it first.

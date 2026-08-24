# @oriatheme/core

Framework-independent contracts, validation, resolution, import/export, and diagnostics for OriaTheme themes. This package never accesses the DOM and has no React or Vue dependency.

## Install

```bash
npm install @oriatheme/core
```

## Use

Validate a complete theme before resolving it for a mode:

```ts
import { oriaDefaultTheme, oriaStandardContract, resolveTheme, validateTheme } from "@oriatheme/core";

const validation = validateTheme(oriaDefaultTheme, oriaStandardContract);
if (validation.ok) {
  const lightTheme = resolveTheme(validation.value, "light");
  console.log(lightTheme.tokens["color.primary"]);
}
```

`createThemeFromSeed()`, `cloneTheme()`, `importTheme()`, `exportTheme()`, `analyzeTheme()`, and the Token Contract helpers are also exported from the package root.

The default `oria-standard@2` theme and seed-generated colors use complete `oklch(...)` CSS values. Validation remains compatible with existing static HEX, RGB, HSL, and supported named-color inputs.

## Documentation

- [Theme model](https://github.com/KrisLee1/OriaTheme/blob/main/docs/specifications/theme-model.md)
- [Core API](https://github.com/KrisLee1/OriaTheme/blob/main/docs/specifications/core-api.md)
- [Quick start](https://github.com/KrisLee1/OriaTheme/blob/main/docs/guides/quick-start.md)

## License

[Apache-2.0](https://github.com/KrisLee1/OriaTheme/blob/main/LICENSE)

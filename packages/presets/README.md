# @oriatheme/presets

Forty-four complete, curated OriaTheme presets with stable IDs, OKLCH colors, granular public entry points, named exports, and a compact discovery catalog.

## Install

```bash
npm install @oriatheme/presets
```

## Use

```ts
import { oriaOceanTheme } from "@oriatheme/presets/ocean";
import { oriaForestTheme } from "@oriatheme/presets/forest";

console.log(oriaOceanTheme.id); // "oria-ocean"

const appPresets = [oriaOceanTheme, oriaForestTheme];
```

Each theme is available from `@oriatheme/presets/<theme-slug>`, so an application can import only the presets it ships. Use the package root's `oriaPresetThemes` or `oriaPresetCatalog` when the complete directory is required. Existing root named exports remain compatible, and `oriaDefaultTheme` remains available from `@oriatheme/presets/default`, the package root, and `@oriatheme/core`.

## Documentation

- [Preset catalog](https://github.com/KrisLee1/OriaTheme/blob/main/docs/specifications/preset-catalog.md)
- [Package map](https://github.com/KrisLee1/OriaTheme/blob/main/docs/guides/packages.md)

## License

[Apache-2.0](https://github.com/KrisLee1/OriaTheme/blob/main/LICENSE)

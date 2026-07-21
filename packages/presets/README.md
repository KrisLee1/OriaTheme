# @oriatheme/presets

Forty-one complete, curated OriaTheme presets with stable IDs, named exports, and a compact discovery catalog.

## Install

```bash
npm install @oriatheme/presets
```

## Use

```ts
import { oriaOceanTheme, oriaPresetThemes } from "@oriatheme/presets";

console.log(oriaOceanTheme.id); // "oria-ocean"
console.log(oriaPresetThemes.length); // 41
```

Use `oriaPresetThemes` with `@oriatheme/runtime-dom`, or import one named preset to compose a smaller collection. `oriaDefaultTheme` remains available from both this package and `@oriatheme/core`.

## Documentation

- [Preset catalog](https://github.com/KrisLee1/OriaTheme/blob/main/docs/specifications/preset-catalog.md)
- [Package map](https://github.com/KrisLee1/OriaTheme/blob/main/docs/guides/packages.md)

## License

[Apache-2.0](https://github.com/KrisLee1/OriaTheme/blob/main/LICENSE)

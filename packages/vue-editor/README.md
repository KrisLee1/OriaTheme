# @oriatheme/vue-editor

Headless Vue bridge for an `@oriatheme/editor-core` session. It provides session access, immutable snapshots, and latest-valid preview coordination; it does not ship visible editor UI or CSS.

## Install

```bash
npm install @oriatheme/vue-editor
```

Vue `3.5` is a peer dependency.

## Use

```ts
import { provideThemeEditor, useThemeEditor } from "@oriatheme/vue-editor";
import { oriaOceanTheme } from "@oriatheme/presets";

provideThemeEditor({
  source: oriaOceanTheme,
  identity: { id: "my-ocean", name: "My Ocean" },
});

const { snapshot } = useThemeEditor();
```

Call these composables within a Vue component setup context. Install the visible Vue editor components into your own source tree through `@oriatheme/cli`.

## Documentation

- [Theme editor guide](https://github.com/KrisLee1/OriaTheme/blob/main/docs/guides/theme-editors.md)
- [Editor component registry](https://github.com/KrisLee1/OriaTheme/blob/main/docs/specifications/editor-component-registry.md)

## License

[Apache-2.0](https://github.com/KrisLee1/OriaTheme/blob/main/LICENSE)

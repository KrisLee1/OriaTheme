# @oriatheme/editor-core

Framework- and DOM-independent theme-editor session logic: drafts, validation, diagnostics, import/export, previews, save coordination, and token field descriptions.

## Install

```bash
npm install @oriatheme/editor-core
```

## Use

```ts
import { createThemeEditorSession } from "@oriatheme/editor-core";
import { oriaOceanTheme } from "@oriatheme/presets";

const session = createThemeEditorSession({
  source: oriaOceanTheme,
  identity: { id: "my-ocean", name: "My Ocean" },
});

session.setName("My Ocean");
```

Preset sources require a new custom `identity`. Attach the resulting session to a runtime only for preview or save; this package itself does not access the DOM, Storage, React, or Vue.

## Documentation

- [Theme editor specification](https://github.com/KrisLee1/OriaTheme/blob/main/docs/specifications/theme-editor.md)
- [Editor UI guidance](https://github.com/KrisLee1/OriaTheme/blob/main/docs/design/editor-ui.md)

## License

[Apache-2.0](https://github.com/KrisLee1/OriaTheme/blob/main/LICENSE)

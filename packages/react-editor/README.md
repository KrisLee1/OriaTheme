# @oriatheme/react-editor

Headless React bridge for an `@oriatheme/editor-core` session. It provides the editor session, exposes immutable snapshots, and coordinates the latest valid preview; it does not ship a black-box visual editor or CSS.

## Install

```bash
npm install @oriatheme/react-editor
```

`react` and `react-dom` `18.2` or `19` are peer dependencies.

## Use

```tsx
import { ThemeEditorProvider, useThemeEditor } from "@oriatheme/react-editor";
import { oriaOceanTheme } from "@oriatheme/presets";

function EditorState() {
  const { snapshot } = useThemeEditor();
  return <p>{snapshot.draft.name}</p>;
}

export function Editor() {
  return <ThemeEditorProvider options={{ source: oriaOceanTheme, identity: { id: "my-ocean", name: "My Ocean" } }}><EditorState /></ThemeEditorProvider>;
}
```

Install the visible React editor components into your own source tree with `@oriatheme/cli`; keep page routes as composition layers rather than recreating the editor state machine.

## Documentation

- [Theme editor guide](https://github.com/KrisLee1/OriaTheme/blob/main/docs/guides/theme-editors.md)
- [Editor component registry](https://github.com/KrisLee1/OriaTheme/blob/main/docs/specifications/editor-component-registry.md)

## License

[Apache-2.0](https://github.com/KrisLee1/OriaTheme/blob/main/LICENSE)

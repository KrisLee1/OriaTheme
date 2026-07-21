# @oriatheme/react

React bindings for the OriaTheme runtime. The provider owns one runtime instance and hooks subscribe to the same external store without duplicating runtime state.

## Install

```bash
npm install @oriatheme/react @oriatheme/presets @oriatheme/runtime-dom
```

`react` and `react-dom` `18.2` or `19` are peer dependencies.

## Use

```tsx
import { OriaThemeProvider, useOriaTheme } from "@oriatheme/react";
import { oriaPresetThemes } from "@oriatheme/presets";

const themeConfig = { presets: oriaPresetThemes, defaultThemeId: "oria-default" };

function ThemeControls() {
  const { setAppearance, setTheme, snapshot } = useOriaTheme();
  return <button onClick={() => setTheme("oria-ocean")}>{snapshot.preference.activeThemeId}</button>;
}

export function App() {
  return <OriaThemeProvider config={themeConfig}><ThemeControls /></OriaThemeProvider>;
}
```

## Documentation

- [React adapter specification](https://github.com/KrisLee1/OriaTheme/blob/main/docs/specifications/react-adapter.md)
- [Quick start](https://github.com/KrisLee1/OriaTheme/blob/main/docs/guides/quick-start.md)

## License

[Apache-2.0](https://github.com/KrisLee1/OriaTheme/blob/main/LICENSE)

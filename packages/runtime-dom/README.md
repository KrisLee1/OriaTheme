# @oriatheme/runtime-dom

The client-side OriaTheme runtime: atomic CSS-variable application, theme persistence, Bootstrap helpers, system-mode resolution, custom themes, and optional View Transitions.

## Install

```bash
npm install @oriatheme/runtime-dom @oriatheme/presets
```

## Use

```ts
import { oriaPresetThemes } from "@oriatheme/presets";
import { bootstrapTheme, createOriaThemeRuntime } from "@oriatheme/runtime-dom";

bootstrapTheme();

const runtime = createOriaThemeRuntime({
  presets: oriaPresetThemes,
  defaultThemeId: "oria-default",
});

runtime.start();
runtime.setTheme("oria-ocean");
runtime.setAppearance("dark");
```

Browser APIs are accessed only after `start()`. Call `destroy()` when the owned runtime is no longer needed.

## Documentation

- [Runtime specification](https://github.com/KrisLee1/OriaTheme/blob/main/docs/specifications/runtime-dom.md)
- [Bootstrap guide](https://github.com/KrisLee1/OriaTheme/blob/main/docs/guides/bootstrap.md)
- [Circular theme reveal](https://github.com/KrisLee1/OriaTheme/blob/main/docs/guides/circular-theme-transition.md)

## License

[Apache-2.0](https://github.com/KrisLee1/OriaTheme/blob/main/LICENSE)

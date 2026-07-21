# @oriatheme/vue

Vue 3 bindings for the OriaTheme runtime. The plugin and composables use the shared runtime rather than maintaining a Vue-specific theme state machine.

## Install

```bash
npm install @oriatheme/vue @oriatheme/presets @oriatheme/runtime-dom
```

Vue `3.5` is a peer dependency.

## Use

```ts
import { createApp } from "vue";
import { oriaPresetThemes } from "@oriatheme/presets";
import { createOriaTheme } from "@oriatheme/vue";
import App from "./App.vue";

createApp(App)
  .use(createOriaTheme({ presets: oriaPresetThemes, defaultThemeId: "oria-default" }))
  .mount("#app");
```

Use `useOriaTheme()` inside the installed app to read the snapshot and call `setTheme()` or `setAppearance()`.

## Documentation

- [Vue adapter specification](https://github.com/KrisLee1/OriaTheme/blob/main/docs/specifications/vue-adapter.md)
- [Quick start](https://github.com/KrisLee1/OriaTheme/blob/main/docs/guides/quick-start.md)

## License

[Apache-2.0](https://github.com/KrisLee1/OriaTheme/blob/main/LICENSE)

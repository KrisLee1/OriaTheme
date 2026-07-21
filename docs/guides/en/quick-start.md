# Quick start

[中文](../quick-start.md) · [Guide index](README.md)

This guide initializes OriaTheme in an existing React, Vue, or framework-free web app, restores the first paint, switches themes, and consumes CSS Variables. It uses package-root exports only.

> `@oriatheme/*@0.1.0` is published. The installation commands below are for consumer projects; for work inside this repository, start with the [developer guide](development.md).

## 1. Install the relevant packages

Run one line from each group, using the package manager already selected by the project; do not mix lockfiles. See [package-manager compatibility](package-managers.md) for CLI runners and post-install lockfile behavior.

React:

```bash
pnpm add @oriatheme/presets @oriatheme/runtime-dom @oriatheme/react
npm install @oriatheme/presets @oriatheme/runtime-dom @oriatheme/react
yarn add @oriatheme/presets @oriatheme/runtime-dom @oriatheme/react
bun add @oriatheme/presets @oriatheme/runtime-dom @oriatheme/react
```

Vue 3:

```bash
pnpm add @oriatheme/presets @oriatheme/runtime-dom @oriatheme/vue
npm install @oriatheme/presets @oriatheme/runtime-dom @oriatheme/vue
yarn add @oriatheme/presets @oriatheme/runtime-dom @oriatheme/vue
bun add @oriatheme/presets @oriatheme/runtime-dom @oriatheme/vue
```

Framework-free:

```bash
pnpm add @oriatheme/presets @oriatheme/runtime-dom
npm install @oriatheme/presets @oriatheme/runtime-dom
yarn add @oriatheme/presets @oriatheme/runtime-dom
bun add @oriatheme/presets @oriatheme/runtime-dom
```

`@oriatheme/presets` contains 36 complete themes. The default `oriaDefaultTheme` can also be imported directly from `@oriatheme/core`. See [packages and public entry points](packages.md) for the complete package map.

## 2. Restore the theme before framework mount

The default runtime persists preferences and custom themes in LocalStorage. Restore a returning user's last successfully persisted active snapshot before mounting the framework:

```ts
import { bootstrapTheme } from "@oriatheme/runtime-dom";

bootstrapTheme();
```

Bootstrap silently falls back on a first visit or invalid snapshot. The full runtime then validates all state again and takes ownership. SSR, SSG, and Next.js also require a static default theme; see the [Bootstrap guide](bootstrap.md).

## 3. Start the runtime

### React

```tsx
import { createRoot } from "react-dom/client";
import { OriaThemeProvider, useOriaTheme } from "@oriatheme/react";
import { oriaPresetThemes } from "@oriatheme/presets";
import { bootstrapTheme } from "@oriatheme/runtime-dom";

bootstrapTheme();

function ThemeControls() {
  const { snapshot, setAppearance, setTheme } = useOriaTheme();

  return (
    <div>
      <p>{snapshot.preference.activeThemeId} / {snapshot.resolvedMode}</p>
      <button onClick={() => setTheme("oria-ocean")}>Ocean</button>
      <button onClick={() => setAppearance("dark")}>Dark</button>
      <button onClick={() => setAppearance("system")}>System</button>
    </div>
  );
}

createRoot(document.querySelector("#root")!).render(
  <OriaThemeProvider config={{
    presets: oriaPresetThemes,
    defaultThemeId: "oria-default",
  }}>
    <ThemeControls />
  </OriaThemeProvider>,
);
```

### Vue

```ts
// main.ts
import { createApp } from "vue";
import { createOriaTheme } from "@oriatheme/vue";
import { oriaPresetThemes } from "@oriatheme/presets";
import { bootstrapTheme } from "@oriatheme/runtime-dom";
import App from "./App.vue";

bootstrapTheme();

createApp(App)
  .use(createOriaTheme({
    presets: oriaPresetThemes,
    defaultThemeId: "oria-default",
  }))
  .mount("#app");
```

```vue
<script setup lang="ts">
import { useOriaTheme } from "@oriatheme/vue";

const { snapshot, setAppearance, setTheme } = useOriaTheme();
</script>

<template>
  <p v-text="`${snapshot.preference.activeThemeId} / ${snapshot.resolvedMode}`" />
  <button @click="setTheme('oria-ocean')">Ocean</button>
  <button @click="setAppearance('dark')">Dark</button>
  <button @click="setAppearance('system')">System</button>
</template>
```

### Framework-free DOM runtime

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
runtime.setAppearance("system");

// Call this when the single-page application is unmounted.
runtime.destroy();
```

## 4. Consume the theme in components

The runtime atomically writes `--oria-*` variables to the target root and maintains `data-oria-theme`, `data-oria-mode`, and `color-scheme`:

```css
:root {
  color: var(--oria-color-foreground);
  background: var(--oria-color-background);
}

.card {
  color: var(--oria-color-surfaceForeground);
  background: var(--oria-color-surface);
  border: var(--oria-shape-borderWidth-default) solid var(--oria-color-border);
  border-radius: var(--oria-shape-radius-lg);
  box-shadow: var(--oria-elevation-shadow-md);
}
```

No CSS rebuild is needed after a theme switch. For Tailwind v4 or the stable color library, continue with [component styling](component-styling.md).

## 5. Verify the result

After opening the page, confirm that:

- `<html>` has `data-oria-theme="oria-default"` (or the current theme) and `data-oria-mode`.
- Switching to Ocean updates color, radius, shadow, and the other variables together.
- `system` persists the user preference; `resolvedMode` is not persisted as a preference.
- A refresh restores the last successfully saved theme when default storage is enabled.

For missing variables, first-paint flashes, or installation errors, see [troubleshooting](troubleshooting.md). Custom themes, animation, and the visible editor are covered by [custom themes](custom-themes.md), [circular theme reveal](circular-theme-transition.md), and [theme editors](theme-editors.md).

## Next: make the project visible immediately

After the initialization above, continue with the guide that matches the result you want:

| Do this next | Guide |
| --- | --- |
| Use one of the 36 official preset themes, or confirm the required package | [Packages and public entry points: common combinations](packages.md#common-combinations) |
| Apply themed color, radius, shadow, and other variables to existing components | [Component styling](component-styling.md) |
| Install the visible React/Vue theme-editor UI into project source | [Theme editors](theme-editors.md) |
| Create, preview, save, import, or export a custom theme | [Custom themes](custom-themes.md) |
| Prevent a first-paint theme flash in SSR, SSG, or Next.js | [Bootstrap](bootstrap.md) |

## 6. Run a complete example, or start development from one

The repository provides three private, runnable single-page examples. All use public package-root imports and demonstrate preset switching, `light` / `dark` / `system`, product components driven by theme variables, the complete token showcase, and a local theme editor that is closed and code-split by default. First [bootstrap the workspace](development.md#bootstrap-the-workspace), then choose one root-level command:

| Example | Stack and best starting point | Start command |
| --- | --- | --- |
| `apps/examples/react` | React + Vite; a React client application | `pnpm dev:example:react` |
| `apps/examples/vue` | Vue 3 + Vite; a Vue 3 application | `pnpm dev:example:vue` |
| `apps/examples/next` | Next.js; SSR/SSG, static default-theme, and Bootstrap integration | `pnpm dev:example:next` |

Continue development by changing the page, components, and local `components/oria-theme-editor/` in the selected example. These examples use workspace dependencies and cannot be copied outside the repository as standalone projects. To integrate into your own project, follow this guide's published-package installation steps. See the [apps/examples README](../../../apps/examples/README.md) and the [developer guide](development.md#run-examples) for the full feature list and production-build commands.

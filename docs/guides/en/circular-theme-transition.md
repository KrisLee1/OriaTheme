# Circular theme reveal

[中文](../circular-theme-transition.md) · [Guide index](README.md)

OriaTheme can use the browser View Transition API to reveal a new theme outward from the triggering control. The runtime manages the `::view-transition-*` styles, origin, radius, duration, and cleanup.

Animation is disabled by default. Each animated user action requires both a runtime `transition` configuration and `animate: true` on the change call.

## Shared rules

Using the control center as `origin` gives pointer, touch, and keyboard users a consistent result. The runtime uses the viewport center when `origin` is omitted.

```ts
function originFor(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}
```

`duration` is measured in milliseconds and defaults to 420:

```ts
transition: { type: "view-transition", duration: 500 }
```

## Framework-free runtime

```ts
import { createOriaThemeRuntime } from "@oriatheme/runtime-dom";
import { oriaPresetThemes } from "@oriatheme/presets";

const runtime = createOriaThemeRuntime({
  presets: oriaPresetThemes,
  defaultThemeId: "oria-default",
  transition: { type: "view-transition", duration: 500 },
});

runtime.start();

document.querySelector<HTMLButtonElement>("#dark-mode")?.addEventListener("click", (event) => {
  runtime.setAppearance("dark", {
    animate: true,
    origin: { x: event.clientX, y: event.clientY },
  });
});
```

For `change`, keyboard, or controls without reliable pointer coordinates, use `originFor(control)`.

## React and Next.js

```tsx
import { OriaThemeProvider, useOriaTheme } from "@oriatheme/react";
import { oriaPresetThemes } from "@oriatheme/presets";

function ThemeButton() {
  const { setTheme } = useOriaTheme();

  return (
    <button onClick={(event) => setTheme("oria-aurora", {
      animate: true,
      origin: originFor(event.currentTarget),
    })}>
      Use Aurora
    </button>
  );
}

export function App() {
  return (
    <OriaThemeProvider config={{
      presets: oriaPresetThemes,
      defaultThemeId: "oria-default",
      transition: { type: "view-transition", duration: 500 },
    }}>
      <ThemeButton />
    </OriaThemeProvider>
  );
}
```

In Next App Router, the Provider and switch control are Client Components; the root layout may remain a Server Component.

## Vue

Enable transition when creating the plugin, then call the composable from the user event:

```vue
<script setup lang="ts">
import { useOriaTheme } from "@oriatheme/vue";

const { setAppearance } = useOriaTheme();

function enableDark(event: MouseEvent) {
  if (!(event.currentTarget instanceof HTMLElement)) return;
  setAppearance("dark", {
    animate: true,
    origin: originFor(event.currentTarget),
  });
}
</script>

<template>
  <button type="button" @click="enableDark">Dark mode</button>
</template>
```

The plugin configuration must include:

```ts
createOriaTheme({
  presets: oriaPresetThemes,
  defaultThemeId: "oria-default",
  transition: { type: "view-transition", duration: 500 },
})
```

## Editing a custom theme

When the custom theme being updated is active, pass the same change options to `updateCustomTheme()`:

```ts
runtime.updateCustomTheme("brand-2026", {
  modes: { light: updatedLightTokens, dark: updatedDarkTokens },
}, {
  animate: true,
  origin: originFor(colorInput),
});
```

If it is not active, update it without animation and then animate `setTheme(customId, options)`.

## Fallback behavior

- Without `document.startViewTransition`, the theme still changes immediately and atomically.
- With `prefers-reduced-motion: reduce`, the default behavior is an immediate change. Do not override the preference merely to force motion.
- Bootstrap, persistence restore, system changes, and cross-tab synchronization do not animate.
- If nothing changes, confirm that runtime/Provider is mounted, `transition` is configured, and the event passes `animate: true`.

# Bootstrap: restore a theme before framework mount

[中文](../bootstrap.md) · [Guide index](README.md)

`bootstrapTheme()` applies a previously persisted and validated active snapshot as `--oria-*` CSS Variables during page startup. Its only purpose is to reduce the flash from a default theme to a returning user's preference. It is not the full runtime: it does not load presets, restore custom themes, or animate.

The full runtime must still start afterward. It revalidates complete persisted state, watches system mode and cross-tab updates, and becomes the single state source.

## When to enable it

For applications using default LocalStorage persistence, call Bootstrap before framework mount:

```ts
import { bootstrapTheme } from "@oriatheme/runtime-dom";

bootstrapTheme();
```

The default key is `oria-theme:active:v1`. A first visit, missing/corrupt snapshot, contract mismatch, or invalid variable silently falls back to the application's static default CSS. Do not present that normal fallback as an error.

## React / Vite

```tsx
import { createRoot } from "react-dom/client";
import { bootstrapTheme } from "@oriatheme/runtime-dom";
import { OriaThemeProvider } from "@oriatheme/react";
import { oriaPresetThemes } from "@oriatheme/presets";
import { App } from "./App";

bootstrapTheme();

createRoot(document.querySelector("#root")!).render(
  <OriaThemeProvider config={{
    presets: oriaPresetThemes,
    defaultThemeId: "oria-default",
  }}>
    <App />
  </OriaThemeProvider>,
);
```

## Vue / Vite

```ts
import { createApp } from "vue";
import { bootstrapTheme } from "@oriatheme/runtime-dom";
import { createOriaTheme } from "@oriatheme/vue";
import { oriaPresetThemes } from "@oriatheme/presets";
import App from "./App.vue";

bootstrapTheme();

createApp(App)
  .use(createOriaTheme({
    presets: oriaPresetThemes,
    defaultThemeId: "oria-default",
  }))
  .mount("#app");
```

## Next.js App Router

Calling `bootstrapTheme()` only in a client Provider waits for the client bundle. App Router should inline `createBootstrapStorageScript()` in the Server Component `<head>` so the browser restores variables while parsing HTML:

```tsx
// app/layout.tsx
import type { ReactNode } from "react";
import { createBootstrapStorageScript } from "@oriatheme/runtime-dom";
import { Providers } from "./providers";

const bootstrapScript = createBootstrapStorageScript();
const bootstrapScriptProps = {
  dangerouslySetInnerHTML: { __html: bootstrapScript },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="oria-theme-bootstrap"
          {...bootstrapScriptProps}
        />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
```

On a first visit the script has no snapshot and returns silently. SSR/SSG must therefore output a complete static default theme before this script:

```tsx
const bootstrapScriptProps = {
  dangerouslySetInnerHTML: { __html: bootstrapScript },
};

<head>
  <style id="oria-default-theme">{defaultThemeCss}</style>
  <script
    id="oria-theme-bootstrap"
    {...bootstrapScriptProps}
  />
</head>
```

Generate `defaultThemeCss` only from a trusted theme completely validated and resolved by `resolveTheme()`. Never interpolate request parameters, cookies, Storage text, or other unvalidated input into `<style>`. The precedence is static fallback, saved-theme Bootstrap, then the full runtime stylesheet.

Bootstrap writes `data-oria-theme`, `data-oria-mode`, and `colorScheme` to `<html>` before hydration. Put `suppressHydrationWarning` on that controlled node only; do not use it to hide unrelated mismatches.

## Keep configuration consistent

When runtime uses custom `storageKey`, `variablePrefix`, `contract`, or `target`, pass matching values to Bootstrap:

```ts
import { bootstrapTheme, createOriaThemeRuntime } from "@oriatheme/runtime-dom";

const themeConfig = {
  presets,
  defaultThemeId: "oria-default",
  storageKey: "acme-theme",
  variablePrefix: "acme",
};

bootstrapTheme({
  storageKey: themeConfig.storageKey,
  variablePrefix: themeConfig.variablePrefix,
});

const runtime = createOriaThemeRuntime(themeConfig);
runtime.start();
```

With `storage: false` or custom `ThemeStorage`, no default LocalStorage active snapshot exists. Provide a validated snapshot yourself or skip the default Bootstrap path.

## Server-provided snapshots

`createBootstrapScript({ snapshot })` accepts an already validated active snapshot and returns a self-contained inline script; invalid input returns an empty string. It does not read LocalStorage.

`createBootstrapStorageScript()` generates the browser-Storage reader and supports a document target. For ShadowRoot or custom Storage, use a caller-validated snapshot with `createBootstrapScript()`, or normal client `bootstrapTheme()`.

Use server-provided snapshots only when the server is authorized to access them. Never place unvalidated cookies, request data, or user strings into a stylesheet or inline script.

## Animation and persistence

- Bootstrap never runs View Transition. Pass `animate: true` only for explicit user actions.
- A successfully persisted runtime change writes the active snapshot used on the next startup.
- Runtime startup may replace the first-paint variables after full validation; that is expected ownership transfer.

For editor code splitting, SSR/SSG decisions, and verification, see [performance integration](performance.md).

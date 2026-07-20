# Performance integration: first paint and on-demand editor loading

[中文](../performance.md) · [Guide index](README.md)

This guide prevents theme initialization from shifting the first paint and keeps a closed ThemeEditor out of the normal page's initial bundle. Core, Runtime, and Editor Core still own validation, resolution, atomic stylesheet replacement, and persistence; the host application owns first-paint markup and code-splitting boundaries.

## Classify the first-paint path

| Page type | Static default variables | Preference restore | Editor loading |
| --- | --- | --- | --- |
| React/Vue Vite SPA with an empty mount node | Usually unnecessary | `bootstrapTheme()` before mount | Dynamic import after user opens it |
| SSR, SSG, or prerendered page | Required | `createBootstrapStorageScript()` in `<head>` | Client-only dynamic import |
| SPA whose static HTML shell uses `--oria-*` | Required | `bootstrapTheme()` before mount | Dynamic import after user opens it |

A standard Vite SPA renders content only after Bootstrap/runtime initialization, so copying the Next SSR fallback adds HTML without a first-paint benefit. SSR/SSG and a themed static shell already display variable-dependent content before JavaScript and therefore require complete default variables.

## Three ownership layers

1. **Static default theme:** supplies complete variables on a first SSR/SSG visit with no valid snapshot.
2. **Storage Bootstrap:** overwrites those defaults before framework mount for a returning user.
3. **Runtime:** revalidates full state, watches system/cross-tab changes, and becomes the only state source.

Generate static CSS only from a trusted theme completely resolved by `resolveTheme()`. Never interpolate URL parameters, cookies, raw Storage, import JSON, or other user strings into a stylesheet. Persist `appearance`, not `resolvedMode`.

## React / Vite: lazy-load the editor

Bootstrap before mount, then dynamically import the local CLI-installed source component:

```tsx
import { lazy, Suspense, useState } from "react";

const ThemeEditor = lazy(() =>
  import("./components/oria-theme-editor/index.js")
    .then((module) => ({ default: module.ThemeEditor })),
);

export function ThemeControls() {
  const [editorShown, setEditorShown] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setEditorShown(true)}>
        Open theme editor
      </button>
      {editorShown ? (
        <aside id="theme-editor-panel">
          <Suspense fallback={<div role="status">Loading theme editor…</div>}>
            <ThemeEditor options={editorOptions} runtime={runtime} />
          </Suspense>
        </aside>
      ) : null}
    </>
  );
}
```

- The dynamic editor entry should import its own `theme-editor.css`.
- Do not statically import editor CSS from `main.tsx`, global CSS, or a normal page.
- Render nothing while closed instead of mounting a hidden editor session.
- Give the loading state `role="status"` and reserve stable panel space.

## Vue / Vite: use an async component

```ts
import { defineAsyncComponent, defineComponent, h, ref } from "vue";

const ThemeEditor = defineAsyncComponent({
  loader: () => import("./components/oria-theme-editor/index.js")
    .then((module) => module.ThemeEditor),
  loadingComponent: defineComponent({
    setup: () => () => h("div", { role: "status" }, "Loading theme editor…"),
  }),
  delay: 0,
});

export default defineComponent({
  setup() {
    const editorShown = ref(false);
    return () => h("div", [
      h("button", {
        type: "button",
        onClick: () => { editorShown.value = true; },
      }, "Open theme editor"),
      editorShown.value
        ? h("aside", { id: "theme-editor-panel" }, [
            h(ThemeEditor, { options: editorOptions, runtime }),
          ])
        : null,
    ]);
  },
});
```

The same boundary applies to SFC templates: render the async component only when open, and let the editor component import its CSS.

## Next.js App Router

Next must solve two separate problems: SSR/SSG requires complete variables before first paint, and a closed editor must stay out of the homepage client bundle.

### Generate a trusted static fallback

```ts
// app/default-theme-style.ts
import { oriaDefaultTheme, resolveTheme } from "@oriatheme/core";

type CssVariables = Readonly<Record<`--${string}`, string>>;

function declarations(variables: CssVariables): string {
  return Object.entries(variables)
    .map(([name, value]) => `${name}:${value}`)
    .join(";");
}

const light = resolveTheme(oriaDefaultTheme, "light");
const dark = resolveTheme(oriaDefaultTheme, "dark");

export const defaultThemeCss =
  `:root{${declarations(light.variables)};color-scheme:light}` +
  `@media(prefers-color-scheme:dark){:root{${declarations(dark.variables)};color-scheme:dark}}`;
```

If the application has another trusted default theme, use it here and keep it aligned with the runtime `defaultThemeId`.

### Establish override order in the root layout

```tsx
import type { ReactNode } from "react";
import { createBootstrapStorageScript } from "@oriatheme/runtime-dom";
import { defaultThemeCss } from "./default-theme-style";
import { Providers } from "./providers";

const bootstrapScript = createBootstrapStorageScript();
const bootstrapScriptProps = {
  dangerouslySetInnerHTML: { __html: bootstrapScript },
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style id="oria-default-theme">{defaultThemeCss}</style>
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

Keep the same default theme, `storageKey`, `variablePrefix`, and contract across static fallback, Bootstrap, and Provider/runtime. Scope `suppressHydrationWarning` to the `<html>` element Bootstrap modifies.

### Make the local editor a client-only chunk

```tsx
"use client";

import dynamic from "next/dynamic";

const ThemeEditor = dynamic(
  () => import("./components/oria-theme-editor")
    .then((module) => module.ThemeEditor),
  { ssr: false },
);
```

Render it only while open. Keep `theme-editor.css` inside the dynamic entry, use the locally installed registry component, and do not duplicate editor-core/runtime logic in the route.

## Regression checks

For SSR fallback, test that both light and dark variable sets are present, the variable count matches the resolved themes, and generated CSS contains neither `<`/`>` nor external CSS functions such as `url()`.

Run production builds from the repository root:

```bash
pnpm --filter @oriatheme/example-react build
pnpm --filter @oriatheme/example-vue build
pnpm --filter @oriatheme/example-next build
```

Then verify:

- normal page HTML does not reference editor CSS;
- editor JS and CSS exist as separate async chunks;
- the browser requests them only after opening the editor;
- loading, keyboard, focus, close, dirty protection, and automatic preview still work;
- a fresh SSR/SSG context with no active snapshot has no hydration error, theme flash, or layout shift.

## Repository measurements

The Chinese guide records the current reproducible local bundle and Lighthouse measurements. They demonstrate that code splitting worked in this repository; they are not performance guarantees for other applications, devices, or networks. The example also renders a complete 26×11 color library and therefore has a DOM cost that most product pages should not copy.

## Common mistakes

- Adding Storage Bootstrap to SSR without complete first-visit default CSS.
- Copying SSR fallback into an empty-shell Vite SPA without need.
- Dynamically importing the component while statically importing editor CSS globally.
- Mounting a hidden editor session in the initial render.
- Hiding the entire page until JavaScript starts.
- Writing unvalidated user input into `<style>`.

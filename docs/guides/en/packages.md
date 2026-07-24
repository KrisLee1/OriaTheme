# Packages and public entry points

[中文](../packages.md) · [Guide index](README.md)

OriaTheme is an ESM-only multi-package project. Its source repository uses pnpm workspaces, while published packages target pnpm, npm, Yarn, and Bun consumers. Applications should import only the package roots and explicit CSS subpaths listed below. `src/`, `dist/`, and workspace-internal paths are not public APIs. See [package-manager compatibility](package-managers.md) for commands.

> Ten public packages are published on npm (versions evolve independently; see npm latest). `@oriatheme/tailwind` is an implemented eleventh public package that ships for the first time with the current v2 release batch. Use workspace or local-tarball paths only for repository development and future-release verification.

| Package | Install it when | Public capability |
| --- | --- | --- |
| `@oriatheme/core` | Defining, validating, resolving, importing, or exporting themes; generating trusted default CSS on a server | Pure TypeScript contract, theme model, diagnostics, and `oriaDefaultTheme`; no DOM, Storage, React, or Vue access |
| `@oriatheme/presets` | Using the 41 official themes | `oriaPresetThemes`, `oriaPresetCatalog`, and named theme exports; depends on Core |
| `@oriatheme/runtime-dom` | Applying, persisting, and switching themes in a browser | `createOriaThemeRuntime()`, Bootstrap, external store, and View Transition; browser APIs are accessed only after `start()` |
| `@oriatheme/react` | Integrating React 18.2 or 19 | `OriaThemeProvider`, `useOriaTheme()`, and `useThemeSnapshot()`; React and React DOM are peers |
| `@oriatheme/vue` | Integrating Vue 3.5 | `createOriaTheme()`, `provideOriaTheme()`, and `useOriaTheme()`; Vue is a peer |
| `@oriatheme/colors` | Using stable, non-theme color scales or Tailwind v4 color names | JavaScript scales, `@oriatheme/colors/styles.css`, and `@oriatheme/colors/tailwind.css` |
| `@oriatheme/tailwind` | Consuming runtime theme variables in a Tailwind CSS v4 project | Static `@theme inline` bridge (`@oriatheme/tailwind/oria.css`) and `generateOriaTailwindBridge({ prefix })`; Tailwind is a build/test-only dependency |
| `@oriatheme/editor-core` | Building a theme-editing experience | Draft, field, diagnostics, and commit state machine with no DOM, Storage, or framework dependency |
| `@oriatheme/react-editor` | Providing the headless session bridge for the React source editor | Provider/hooks and automatic-preview coordination; no visible editor UI or default CSS |
| `@oriatheme/vue-editor` | Providing the headless session bridge for the Vue source editor | provide/composables and automatic-preview coordination; no visible editor UI or default CSS |
| `@oriatheme/cli` | Copying visible React/Vue editor UI components into application source | `oria add`, `oria diff`, `oria theme tailwind-bridge`, bundled/local/HTTPS registry support, SHA-256 and path safety; development tool, not a runtime dependency |

## Common combinations

Default only:

```ts
import { oriaDefaultTheme } from "@oriatheme/core";
import { createOriaThemeRuntime } from "@oriatheme/runtime-dom";

const runtime = createOriaThemeRuntime({
  presets: [oriaDefaultTheme],
  defaultThemeId: "oria-default",
});
```

Complete official catalog:

```ts
import { oriaPresetThemes } from "@oriatheme/presets";
import { createOriaThemeRuntime } from "@oriatheme/runtime-dom";

const runtime = createOriaThemeRuntime({
  presets: oriaPresetThemes,
  defaultThemeId: "oria-default",
});
```

Framework packages do not duplicate the runtime state machine. Install `@oriatheme/react` for React or `@oriatheme/vue` for Vue; do not add the other framework adapter unnecessarily.

## CSS entry points

Public CSS subpaths come from two packages, `@oriatheme/colors` and `@oriatheme/tailwind`:

```css
@import "@oriatheme/colors/styles.css";
```

For Tailwind CSS v4, also add the base-color mapping and the runtime-variable bridge:

```css
@import "tailwindcss";
@import "@oriatheme/colors/tailwind.css";
@import "@oriatheme/tailwind/oria.css";
```

`@oriatheme/tailwind/oria.css` is the static `@theme inline` bridge for the default `oria` prefix. A custom prefix must be prebuilt with the CLI (`oria theme tailwind-bridge --prefix <name> --out <file>`); variable names are never concatenated at runtime.

Runtime theme variables do not require a static OriaTheme stylesheet; the runtime writes them atomically. Editor CSS lives in the local source component installed by the CLI and is imported by that local editor entry point.

## SSR and browser boundaries

Except for the executable-only `@oriatheme/cli`, all runtime-library package roots are safe to import during SSR or Node module evaluation. The following operations remain client-only:

- `runtime.start()`;
- mounting the React Provider;
- installing the Vue plugin/provide layer;
- reading browser Storage through `bootstrapTheme()`.

Next.js should generate static default CSS and a Bootstrap script in a Server Component, then mount the Provider in a Client Component. See [Bootstrap](bootstrap.md) and [performance integration](performance.md).

## Visible theme editor

The visible UI is not exported by `@oriatheme/react-editor` or `@oriatheme/vue-editor`. After publication, install it with the CLI:

The example below uses pnpm to show the arguments. See [package-manager compatibility](package-managers.md) for equivalent npm, Yarn, and Bun runners.

```bash
pnpm dlx @oriatheme/cli@latest add theme-editor --framework react --dry-run
pnpm dlx @oriatheme/cli@latest add theme-editor --framework react --yes
```

Use `vue` instead of `react` for Vue. The default target is `components/oria-theme-editor`. The CLI prints a plan before writing; without `--yes`, it exits with code 2 and writes nothing. See the [theme editor guide](theme-editors.md).

## Version boundaries

The npm package version, Theme `schemaVersion`, Token Contract version, and persisted-state `schemaVersion` evolve independently. Do not infer storage compatibility from an npm version. See [migrations](migrations.md).

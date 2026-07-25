# OriaTheme

[中文](README.md)

OriaTheme is a framework-agnostic client-side theming runtime with a typed Token Contract, light/dark/system modes, persistence, atomic CSS-variable application, a static Tailwind CSS v4 bridge, and thin React/Vue adapters.

> Release status: eleven public `@oriatheme/*` packages are published on npm (each package versions independently; check npm for the latest). The current release line switches the default standard Token Contract to `oria-standard@2` — a breaking change, with v1 kept as legacy exports plus a migration helper — and the public registry is available for CLI source-component installation. Upgrading from `0.1.x`? See [migrations and compatibility](docs/guides/en/migrations.md).

## Packages

- `@oriatheme/core`: environment-independent contracts, validation, resolution, import/export, and diagnostics; resolves `oria-standard@2` by default and keeps v1 legacy exports plus `migrateOriaStandardV1ToV2()`.
- `@oriatheme/presets`: an optional set of 41 complete official themes (native v2) with discoverable catalog metadata.
- `@oriatheme/colors`: a theme-independent base color library (26 families, 50–950 eleven-step scales, and five special colors) with JS scales, CSS variables, and Tailwind v4 standard color names.
- `@oriatheme/tailwind`: a static Tailwind CSS v4 `@theme inline` bridge for `oria-standard@2` runtime variables, with a default-prefix CSS entry and a custom-prefix generator.
- `@oriatheme/runtime-dom`: client-only runtime, storage, bootstrap, and optional View Transitions.
- `@oriatheme/react`: React Provider, snapshot hooks, and selectors.
- `@oriatheme/vue`: Vue plugin, provide API, and composables.
- `@oriatheme/editor-core`: framework-independent theme drafts, field descriptions, smart scales, diagnostics, preview, and save coordination.
- `@oriatheme/react-editor` / `@oriatheme/vue-editor`: headless bridges for providers/hooks or provide/composables, subscriptions, and latest-valid-revision preview. They do not distribute a black-box visual editor or default CSS.
- `@oriatheme/cli`: a source-component installer with bundled, local, and HTTPS registries; it supports dry runs, explicit writes, diffs, conflict refusal, SHA-256 verification, and path safety. Visible editor components are never delivered as a `node_modules` black box.

All runtime libraries are safe to import during SSR module evaluation. The Node CLI is only for installing source components during development. Browser APIs are accessed only after runtime `start()` or framework Provider/Plugin mounting. OriaTheme writes theme variables and `data-oria-*` attributes only; it does not change an application's component structure or layout.

Start with the [quick start](docs/guides/en/quick-start.md), or see the [bilingual guide index](docs/guides/README.md), [packages and public entry points](docs/guides/en/packages.md), [pnpm/npm/Yarn/Bun compatibility](docs/guides/en/package-managers.md), [migrations and compatibility](docs/guides/en/migrations.md), [developer guide](docs/guides/en/development.md), [architecture overview](docs/architecture/overview.md), and [public specifications](docs/specifications/core-api.md).

## Examples

Single-page React, Vue, and Next.js component workbenches are in [`apps/examples`](apps/examples/README.md). Run one from the repository root:

```bash
pnpm dev:example:react
pnpm dev:example:vue
pnpm dev:example:next
```

## Use official preset themes

The following commands install the current published versions (each package versions independently; check npm for the latest). Repository workspace examples remain for repository development and verification only.

```bash
# Choose the package manager used by your project.
pnpm add @oriatheme/presets
npm install @oriatheme/presets
yarn add @oriatheme/presets
bun add @oriatheme/presets
```

```ts
import { oriaPresetCatalog, oriaPresetThemes } from "@oriatheme/presets";
import { createOriaThemeRuntime } from "@oriatheme/runtime-dom";

const runtime = createOriaThemeRuntime({
  presets: oriaPresetThemes,
  defaultThemeId: "oria-ocean"
});
```

You can also import individual named themes such as `oriaOceanTheme`, `oriaForestTheme`, `oriaAuroraTheme`, or `oriaWarmReadingTheme` and compose your own `presets` array. `oriaPresetCatalog` contains only theme references and categories; its order is the stable preview order. Theme descriptions and design rationale remain in documentation rather than the published bundle or persisted theme format. `oriaDefaultTheme` remains available from `@oriatheme/core` and now points to the v2 default theme; applications holding v1 custom themes or referencing v1 CSS variable names should upgrade via the [migration guide](docs/guides/en/migrations.md).

## License

OriaTheme, its public npm packages, and editor source components installed by the CLI are licensed under the [Apache License 2.0](LICENSE). This license does not grant rights to the OriaTheme name, trademarks, or logos.

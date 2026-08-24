# OriaTheme principles and architecture

[中文](../architecture.md) · [Guides](README.md) · [Packages and public entry points](packages.md)

This guide explains the OriaTheme package boundaries, why the system is layered this way, and the flows for theme changes, first paint, and editing. Package-root exports and TypeScript declarations remain the source of truth for public APIs.

## Mental model

OriaTheme is not a component library and does not change an application's DOM structure. It validates a `ThemeDefinition`, resolves it to CSS custom properties, and atomically applies those values to a document or Shadow Root. Application CSS consumes the variables for color, typography, shape, spacing, elevation, and motion.

```text
Preset / imported theme / editor draft
                  │
                  ▼
          Core: validate and resolve
                  │  immutable ResolvedTheme
                  ▼
 Runtime DOM: state, persistence, atomic DOM commit
                  │
      ┌───────────┼────────────┬────────────┐
      ▼           ▼            ▼            ▼
 CSS variables  React adapter  Vue adapter  native web
                  │
                  ▼
       application's own components and CSS
```

`ThemeDefinition` is portable, editable data. `ResolvedTheme` is the CSS-variable snapshot produced only after Contract validation, reference resolution, and CSS compilation for a concrete light or dark mode.

## Principles

1. **Core owns theme semantics.** Contracts, schema, validation, resolution, CSS-variable compilation, and diagnostics live in `@oriatheme/core`, with no DOM, React, or Vue dependency.
2. **Runtime owns committed state.** `@oriatheme/runtime-dom` coordinates the active theme, appearance preference, custom themes, preview, storage, and DOM stylesheet.
3. **Preference differs from its result.** `appearance` is `light`, `dark`, or `system`; `resolvedMode` is the derived `light`/`dark` result and is never persisted as preference.
4. **Invalid themes never partially apply.** Runtime fully resolves a theme before one stylesheet replacement; a failure retains the previous valid stylesheet.
5. **Framework packages are bridges.** React and Vue bind lifecycle and subscription only; neither recreates Runtime state.
6. **Drafts differ from committed themes.** A draft may be invalid while edited; only a valid draft can preview or save.
7. **Visible editor UI is source-owned.** Editor npm packages are headless; the CLI copies React/Vue UI templates into application source.
8. **Runtime libraries are SSR-safe to import.** Browser globals are used only by startup, framework mount, or bootstrap.

## Package map

| Package | Responsibility | Boundary |
| --- | --- | --- |
| `@oriatheme/core` | Token Contract, theme model, validation, resolution, import/export, migrations, diagnostics, default theme | Pure TypeScript; no DOM, Storage, React, or Vue |
| `@oriatheme/presets` | Official preset catalog and named exports | Depends only on Core; presets are immutable |
| `@oriatheme/runtime-dom` | External store, DOM attributes/stylesheets, Storage, system mode, Bootstrap, preview, View Transition | Depends on Core; no framework |
| `@oriatheme/react` / `@oriatheme/vue` | Framework lifecycle and subscription bindings | Depend on Runtime; their framework is a peer dependency |
| `@oriatheme/editor-core` | Draft session, field descriptions, smart scales, diagnostics, preview/save coordination | Uses public Core/Runtime APIs; no DOM, Storage, or framework |
| `@oriatheme/react-editor` / `@oriatheme/vue-editor` | Framework-specific editor session and automatic-preview bridges | No visible editor UI |
| `@oriatheme/cli` | Verifies manifests, hashes, and paths; safely copies editor source files | Development tool, not runtime; never overwrites by default or runs registry scripts |
| `@oriatheme/colors` | Static base color scales, CSS variables, Tailwind v4 color names | Standalone; no Runtime or framework |
| `@oriatheme/tailwind` | Static `@theme inline` bridge for `oria-standard@2` variables and custom-prefix generator | Standalone; Tailwind is build/test-only |

| Path | Responsibility |
| --- | --- |
| `apps/website` | Private website, docs, and online editor; consumes published package-root exports only and is never published |
| `apps/examples/*` | React, Vue, Next, and editor integration references for workspace verification |
| `packages/cli/registry` | Editor templates, manifests, and hashes copied into consumer source |
| `docs` | Architecture, specifications, ADRs, phase plans, engineering rules, and guides |

The following graph reads “dependency → dependent” and keeps framework or visible UI code from flowing back into theme semantics:

```text
colors ────────────────────────────────────────────────┐
tailwind ──────────────────────────────────────────────┤  standalone static capabilities
core ─────► presets                                     │
  └──────► runtime-dom ─────► react ─────► react-editor │
                      └─────► vue ───────► vue-editor   │
                      └─────► editor-core ──────────────┘

cli ──reads/copies──► registry UI ──imports──► editor bridge + public APIs
website ──composes──► source-installed registry UI + public APIs
```

## Browser theme flow

Creating a Runtime is SSR-safe; `start()` is where it may read Storage, observe system color scheme, and write the DOM.

```ts
import { oriaDefaultTheme } from "@oriatheme/core";
import { createOriaThemeRuntime } from "@oriatheme/runtime-dom";

const runtime = createOriaThemeRuntime({
  presets: [oriaDefaultTheme],
  defaultThemeId: "oria-default",
});

runtime.start();
```

On startup and every commit:

1. Runtime chooses `activeThemeId` and `appearance`; `system` derives `resolvedMode` from the platform.
2. Core fully validates the Contract, resolves references, aliases, and derived variables, and returns `ResolvedTheme`.
3. Runtime compiles all variables into one stylesheet, using an exclusive `CSSStyleSheet` when possible or one `style[data-oria-theme-runtime]` otherwise.
4. Only after a successful write does it update `data-oria-theme`, `data-oria-mode`, `color-scheme`, the external snapshot, and persisted state.
5. React hooks, Vue composables, and native subscribers read that one snapshot.

Do not concatenate unvalidated input into stylesheets or bypass Runtime by writing its attributes or Storage. `setTheme()` and `setAppearance()` are formal commits; rapid changes settle on the latest state. User actions may use a circular View Transition, whereas system changes, rehydration, cross-tab sync, and bootstrap never animate.

For SSR/SSG, use Core to emit trusted default CSS and a Bootstrap script before hydration. The client Runtime must use matching contract, prefix, storage key, default theme, and migrations. Bootstrap restores validated persistence; it is not another resolver. See [Bootstrap](bootstrap.md) and [Performance integration](performance.md).

## Custom-theme and editor flow

Presets cannot be edited in place. Editing a preset creates a `kind: "custom"` draft; imported themes are also custom.

```text
Preset / custom / JSON
           │ clone, load, or import
           ▼
editor-core draft session
           │ fields, issues, diagnostics, revision
           ├── valid draft ──► runtime.previewTheme() ──► temporary atomic preview
           │                                         │ dispose
           │                                         ▼
           │                                   committed snapshot restored
           └── save ──► create/updateCustomTheme() ──► persisted committed state
```

editor-core owns field scope, smart scales, import/export, conflict detection, validation, and save intent. Framework bridges expose its session; source-installed UI renders controls and accessibility behavior. Pages must not recreate the draft state machine or persist every keystroke.

```bash
pnpm dlx @oriatheme/cli@latest add theme-editor --framework react
```

Replace `react` with `vue` for Vue. See [Theme editors](theme-editors.md).

## CSS, base colors, and Tailwind

Runtime variables are dynamic and atomically written for the active valid theme; component CSS reads `var(--oria-...)`. `@oriatheme/colors` is a static base-color library. In Tailwind CSS v4, `@oriatheme/tailwind/oria.css` maps default-prefix runtime variables into static `@theme inline` names; generate a bridge with the CLI for a custom prefix. The bridge neither reads themes nor participates in the Core/Runtime dependency graph.

```css
@import "tailwindcss";
@import "@oriatheme/colors/tailwind.css";
@import "@oriatheme/tailwind/oria.css";
```

See [Component styling](component-styling.md).

## Where to begin a change

| Change | Boundary to start with |
| --- | --- |
| Tokens, contract, resolution, or migrations | `core`; read Token Contract, Core API, and relevant ADR first |
| Browser application, Storage, system mode, Bootstrap, or transition | `runtime-dom`; read Runtime, persistence, and transition specifications |
| React/Vue lifecycle or subscription | The matching adapter; do not recreate Runtime state |
| Official presets | `presets`; themes must fully validate, resolve, and meet diagnostics requirements |
| Editor field, draft, or save behavior | `editor-core`; UI is not the source of rules |
| Editor bridge or visible components | `react-editor`/`vue-editor` or CLI registry; UI changes live in source-owned copies |
| Static palette or Tailwind naming | `colors` or `tailwind`; neither may depend on Runtime |
| Website | `apps/website`; public exports only, always private |

Start from the [documentation index](../../INDEX.md), then follow its routing for the current Phase, specifications, and ADRs. Commands and validation gates are in the [Developer guide](development.md).

## Boundary checks

- Never persist `resolvedMode` as a preference.
- Never recreate Core, Runtime, or editor-core state machines in framework code or pages.
- Never import `packages/*/src`, `dist/`, or other deep paths from consumers or the website.
- Never give Core, editor-core, or static bridges browser work.
- Never partly apply an invalid theme; keep the last valid theme on failure.
- Never add the website, examples, or registry UI to npm publish lists.

Update the matching specification before changing public behavior, APIs, or persisted formats. Capture material architecture decisions in an ADR, not only in this guide.

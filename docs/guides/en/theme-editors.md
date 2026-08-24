# React and Vue theme editors

[中文](../theme-editors.md) · [Guide index](README.md)

> Status: the public HTTPS registry still serves item `0.2.0`. This repository prepares `0.3.0` with the OKLCH color-control bridge and TypeScript copy/download actions, requiring the next compatible package batch. This task does not deploy the registry, so `@latest` continues to install `0.2.0` until that deployment.

OriaTheme distributes its visible editor as source-owned components. The editor component templates live in `packages/cli/registry/templates/`; React, Vue, and shared layout files are split by responsibility and recorded with SHA-256 hashes. After installation, the toolbar, tabs, search, token fields, scales, shadows, overlays, preview, and CSS live in the consumer's `components/oria-theme-editor/` directory and can be edited and committed.

`@oriatheme/editor-core` owns drafts, validation, diagnostics, import/export, preview handles, and save conflicts. The React/Vue headless bridge only injects the session, subscribes, and coordinates automatic previews. Customizing local UI must not duplicate the editor-core or runtime state machine.

When the editor is closed by default, dynamically load both the local UI and `theme-editor.css`. Verified React, Vue, and Next boundaries are in the [performance guide](performance.md).

Run the CLI through `pnpm dlx`, `npm exec`, `yarn dlx`, or `bunx`. Exact equivalents and lockfile rules are in [package-manager compatibility](package-managers.md). The examples below use pnpm only to present editor-specific arguments.

## React

```bash
pnpm dlx @oriatheme/cli@latest add theme-editor --framework react --dry-run
pnpm dlx @oriatheme/cli@latest add theme-editor --framework react --yes
```

The default target is `components/oria-theme-editor/`. Use `--path <relative-path>` for another in-project location. After confirmation, the CLI adds required OriaTheme dependencies to `package.json`; run your package manager afterward to update the lockfile. A page composes only the local root component:

```tsx
"use client";

import { ThemeEditor } from "@/components/oria-theme-editor";
import { oriaOceanTheme } from "@oriatheme/presets";
import type { OriaThemeRuntime } from "@oriatheme/runtime-dom";

export function Customizer({ runtime }: { runtime: OriaThemeRuntime }) {
  return (
    <ThemeEditor
      runtime={runtime}
      options={{
        source: oriaOceanTheme,
        identity: { id: "my-ocean", name: "My Ocean" },
      }}
    />
  );
}
```

Do not reimplement token maps, field renderers, import/export dialogs, or editor CSS in the route file.

## Vue

```bash
pnpm dlx @oriatheme/cli@latest add theme-editor --framework vue --dry-run
pnpm dlx @oriatheme/cli@latest add theme-editor --framework vue --yes
```

```vue
<script setup lang="ts">
import { ThemeEditor } from "@/components/oria-theme-editor";
import { oriaOceanTheme } from "@oriatheme/presets";
import type { OriaThemeRuntime } from "@oriatheme/runtime-dom";

defineProps<{ runtime: OriaThemeRuntime }>();
</script>

<template>
  <ThemeEditor
    :runtime="runtime"
    :options="{
      source: oriaOceanTheme,
      identity: { id: 'my-ocean', name: 'My Ocean' },
    }"
  />
</template>
```

## Customize and update

- Edit components and `theme-editor.css` inside `components/oria-theme-editor/`; never patch `node_modules`.
- Replace buttons, dialogs, popovers, tabs, or sheets with your design system while preserving accessible names, focus restoration, and keyboard behavior.
- `pnpm dlx @oriatheme/cli@latest diff theme-editor --framework react` (or `vue`) reports local/registry differences without writing.
- Re-running `add` refuses to overwrite existing components by default. Merge differences manually; use `--overwrite` only when deliberately discarding local changes.
- `add` without `--yes` prints a plan and exits with code 2. `--dry-run` explicitly verifies zero writes and exits with code 0.

## Draft, automatic preview, and save

- A preset first becomes a custom draft with the requested identity; presets are immutable.
- When a runtime is provided, the latest complete valid revision is previewed automatically. The default UI has no Preview/Stop Preview buttons.
- Invalid intermediate input preserves the last valid view and never partially applies a theme.
- Automatic preview does not write preference or Storage. Save fully validates and then creates or updates a custom theme.
- Export → Copy TypeScript or Download TypeScript generates a paste-ready complete constant using `satisfies ThemeDefinition` and writes legacy HEX colors as OKLCH; downloads use `<theme-id>.oria-theme.ts`. Copy JSON and Download JSON retain the `.oria-theme.json` workflow. Export neither saves nor mutates the draft; Import atomically replaces only the in-memory draft.

## Security

Before writing, the CLI prints the file/dependency plan, rejects overwrites by default, and validates the manifest and SHA-256 hashes. It accepts only the bundled registry, a local path, or HTTPS, and rejects path escape, symbolic-link targets, non-HTTPS URLs, and manifests containing scripts. Registry lifecycle scripts are never executed. At runtime, user input must still pass Core validation and Runtime's atomic stylesheet replacement.

For pre-release CLI verification from this repository, see the [developer guide](development.md#cli-and-registry-development).

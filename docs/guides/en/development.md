# Developer guide

[中文](../development.md) · [Guide index](README.md)

This guide is for contributors modifying the OriaTheme monorepo. The public implementation boundaries are defined by the [architecture overview](../../architecture/overview.md), [package boundaries](../../architecture/package-boundaries.md), relevant specifications, and this guide.

## Prerequisites

- Node.js: the repository needs Node.js for pnpm, TypeScript, Vitest, tsup, Vite, and Next.js. It currently has no `engines`, `.nvmrc`, or `.node-version`, so no supported Node range has been declared.
- pnpm: the root `packageManager` pins `pnpm@10.10.0`.
- Git: Changesets baseline comparison and a real release require accessible `main` history. This delivery directory has no `.git`, so those steps cannot be verified here.

Do not turn a developer's local Node version into a compatibility promise.

Published packages target pnpm, npm, Yarn, and Bun consumers, but this repository maintains only its pnpm workspace and `pnpm-lock.yaml`. Do not create a second lockfile at the repository root; verify other tools in isolated consumer projects as described in [package-manager compatibility](package-managers.md).

## Bootstrap the workspace

Run from the repository root:

```bash
corepack enable
corepack prepare pnpm@10.10.0 --activate
pnpm install --frozen-lockfile
```

Skip the first two lines when Corepack already provides the pinned pnpm. `pnpm-lock.yaml` is the workspace installation source. Do not edit `node_modules` or build output by hand.

## Repository structure

| Path | Responsibility |
| --- | --- |
| `packages/core` | Environment-independent contract, theme model, validation, resolution, and diagnostics |
| `packages/runtime-dom` | Atomic DOM application, Storage, Bootstrap, system mode, and View Transition |
| `packages/react` / `packages/vue` | Thin runtime framework adapters |
| `packages/colors` / `packages/presets` | Stable base colors and complete official themes |
| `packages/editor-core` | Environment-independent editor state machine |
| `packages/react-editor` / `packages/vue-editor` | Headless editor bridges |
| `packages/cli` | Source-editor registry, manifests, and installer CLI |
| `apps/examples` | React, Vue, Next, and minimal editor consumer verification; never published to npm |
| `docs` | Public architecture, design, specifications, engineering rules, user guides, and ADRs |

See [package boundaries](../../architecture/package-boundaries.md) for dependency direction. Do not bypass the environment restrictions of Core and Editor Core, Runtime's atomic-application requirement, or the rule against framework adapters duplicating state machines.

## Normal development loop

Read the affected architecture and specification documents, make the smallest scoped change, and run the affected package checks:

```bash
pnpm --filter @oriatheme/core typecheck
pnpm --filter @oriatheme/core lint
pnpm --filter @oriatheme/core test
pnpm --filter @oriatheme/core build
```

Replace the filter with the affected package. Cross-package and phase acceptance requires the root gates:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

`pnpm build` recursively builds every workspace with a build script, including public packages and example applications. It generates `packages/*/dist` and production example output; do not edit those files as source.

## Run examples

`apps/examples/react`, `apps/examples/vue`, and `apps/examples/next` are complete workbenches that can be edited directly. They correspond to React + Vite, Vue 3 + Vite, and Next.js, and each demonstrates preset switching, `light/dark/system`, themed components, token samples, and a local editor that loads on demand. Next is also the reference implementation for SSR/SSG static default themes and Bootstrap. All are private workspaces with `workspace:*` dependencies: use them as starting points inside this repository, not as directories to copy unchanged outside it.

```bash
pnpm dev:example:react
pnpm dev:example:vue
pnpm dev:example:next
```

Run all three commands from the repository root. The root script passes `--port 5173` to the Next example; avoid port conflicts when running multiple examples. Targeted production builds are:

```bash
pnpm --filter @oriatheme/example-react build
pnpm --filter @oriatheme/example-vue build
pnpm --filter @oriatheme/example-next build
```

See the [apps/examples README](../../../apps/examples/README.md) for the full feature description and the minimal editor-consumer validation projects.

## CLI and registry development

The CLI package contains its bundled registry. After changing templates, update manifest hashes, then build and test the CLI:

```bash
node registry/update-manifests.mjs
pnpm --filter @oriatheme/cli typecheck
pnpm --filter @oriatheme/cli lint
pnpm --filter @oriatheme/cli test
```

Before publication, verify the local artifact from the repository root without implying npm availability:

```bash
pnpm --filter @oriatheme/cli build
node packages/cli/dist/index.js add theme-editor --framework react --dry-run
```

To write into an independent test project, run the built CLI from that project's directory and add `--yes`. The default target is `components/oria-theme-editor`; existing files are rejected by default.

## Test layers

- Package unit tests: `pnpm --filter <package> test`.
- Repository static and unit gates: `pnpm typecheck`, `pnpm lint`, and `pnpm test`.
- Production build: `pnpm build` or targeted example builds.
- Release smoke test: install tarballs produced by `pnpm pack` into independent React, Vue, and Next projects; workspace source is not a substitute.
- Post-publication smoke test: install from the registry in a clean project with no workspace link; tarballs are not a substitute for this step.

See the [testing strategy](../../engineering/testing.md) for the complete matrix. Browser E2E, pack, and release checks must not be reported as passing merely because their source exists.

## Documentation and change records

Public-repository changes must update the affected specifications or user guides, and public package behavior changes require a Changeset. Maintainers keep project status, phase plans, and detailed execution logs separately; they are not part of the public repository or user changelog.

After documentation changes, check local Markdown links, heading anchors, and unresolved template markers. The repository does not yet provide its own documentation-validator script; external maintainer tooling is not a consumer dependency.

## Subsequent releases

The `0.1.0` first release is complete. Every subsequent release must still satisfy the [packaging specification](../../engineering/packaging.md):

```bash
pnpm exec changeset status
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

`changeset status` requires a Git `main` baseline. `changeset version`, `pnpm pack`, independent consumption, registry installation, and `npm publish` are maintainer release steps; never publish merely to validate documentation. Source templates are licensed under Apache-2.0; the public registry is `https://theme.oria.org.cn/registry/v1`, and `0.1.0` completed remote verification. Verify it again for every registry change or release.

After a push to `main`, `.github/workflows/publish.yml` uses Changesets to create a version PR. Only after that PR merges does the `npm-publish` GitHub Environment approve an npm Trusted Publishing release. The job never uses `NPM_TOKEN`; npm Trusted Publisher settings must match `KrisLee1/OriaTheme`, `publish.yml`, and `npm-publish`.

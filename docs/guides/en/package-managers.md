# Package-manager compatibility

[中文](../package-managers.md) · [Guide index](README.md)

OriaTheme public packages and `@oriatheme/cli` target pnpm, npm, Yarn, and Bun consumer projects. Packages use standard ESM, `exports`, `peerDependencies`, and normal semver. The CLI's `add`/`diff` commands only edit standard `package.json` data and copy source, while `theme tailwind-bridge` only writes the generated CSS to the `--out` file; the CLI never invokes a package manager or creates/updates a lockfile.

> Ten public `@oriatheme/*` packages are published on npm (versions evolve independently; see npm latest). The commands below are the supported consumer-project forms; workspace, local-tarball, and local-registry paths are only for repository development or future-release verification.

## Install public packages

For the three packages used by the React quick start, choose the one tool already used by the consumer project:

```bash
# pnpm
pnpm add @oriatheme/presets @oriatheme/runtime-dom @oriatheme/react

# npm
npm install @oriatheme/presets @oriatheme/runtime-dom @oriatheme/react

# Yarn
yarn add @oriatheme/presets @oriatheme/runtime-dom @oriatheme/react

# Bun
bun add @oriatheme/presets @oriatheme/runtime-dom @oriatheme/react
```

For Vue, replace `@oriatheme/react` with `@oriatheme/vue`. A framework-free DOM runtime needs only presets and runtime. See the [quick start](quick-start.md) and [package map](packages.md).

## Run the source-component CLI

Each temporary runner invokes the package's declared `oria` binary:

```bash
# pnpm
pnpm dlx @oriatheme/cli@latest add theme-editor --framework react --dry-run

# npm (explicitly select the oria binary)
npm exec --yes --package=@oriatheme/cli@latest -- oria add theme-editor --framework react --dry-run

# Yarn
yarn dlx @oriatheme/cli@latest add theme-editor --framework react --dry-run

# Bun
bunx @oriatheme/cli@latest add theme-editor --framework react --dry-run
```

After reviewing the plan, replace `--dry-run` with `--yes` to write. Use `--framework vue` for Vue. For differences, use the corresponding complete command:

```bash
pnpm dlx @oriatheme/cli@latest diff theme-editor --framework react
npm exec --yes --package=@oriatheme/cli@latest -- oria diff theme-editor --framework react
yarn dlx @oriatheme/cli@latest diff theme-editor --framework react
bunx @oriatheme/cli@latest diff theme-editor --framework react
```

The CLI writes components, `.oria/components.json`, and `package.json`, but does not install dependencies. Continue with the consumer project's tool:

```bash
pnpm install
# or npm install
# or yarn install
# or bun install
```

## Lockfiles and project metadata

- Choose one package manager per consumer project and commit its lockfile. Do not mix `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `bun.lock`, or legacy `bun.lockb` in one change.
- The CLI preserves the existing `packageManager`, scripts, dependencies, and devDependencies, merging only runtime/framework dependencies declared by the registry manifest.
- The CLI does not generate a lockfile and therefore does not choose pnpm, npm, Yarn, or Bun for the consumer.
- Yarn Plug'n'Play projects still resolve OriaTheme through public package-root exports. Source templates must not read absolute `node_modules` paths. Both PnP and the node-modules linker are release smoke-test targets.

## Repository-development exception

Supporting four consumer tools does not mean maintaining four lockfiles in the OriaTheme monorepo. The root declares `packageManager: pnpm@10.10.0`, and scripts use pnpm workspaces/filters. Contributors must use pnpm and `pnpm-lock.yaml`. npm, Yarn, and Bun are used only in clean consumer projects for release compatibility checks.

## Release verification requirements

Before every public release, isolated clean projects must verify that:

1. pnpm, npm, Yarn, and Bun can install package-root exports from tarballs; repeat from the registry after publication.
2. Every tool can run `oria add --dry-run`, `oria add --yes`, `oria diff`, and the dry-run and write paths of `oria theme tailwind-bridge`.
3. The CLI preserves `packageManager` and existing scripts without creating another tool's lockfile.
4. React, Vue, and Next production builds cover all four tools; Yarn covers both its default node-modules linker and Plug'n'Play.
5. Any tool that was not actually executed is reported as unverified rather than inferred from command syntax.

The `0.1.0` first release completed public-registry and clean-consumer verification. Repeat this matrix for every future public version, and never mark a tool as passed merely from command syntax.

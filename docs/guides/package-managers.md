# 包管理器兼容性

[English](en/package-managers.md) · [指南首页](README.md)

OriaTheme 的公开包和 `@oriatheme/cli` 面向 pnpm、npm、Yarn 与 Bun 使用方项目。公开包使用标准 ESM、`exports`、`peerDependencies` 和普通 semver；CLI 只修改标准 `package.json` 并复制源码，不调用包管理器，也不创建或改写 lockfile。

> 十个公开 `@oriatheme/*` 包已发布 `0.1.0`，下面是使用方项目的正式命令。workspace、本地 tarball 和本地 registry 路径只用于仓库开发或后续版本发布验证。

## 安装公开包

以 React 快速开始所需的三个包为例，选择项目正在使用的一个工具：

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

Vue 将 `@oriatheme/react` 替换为 `@oriatheme/vue`；原生 Runtime DOM 只需要 presets 与 runtime。其他组合见[快速开始](quick-start.md)和[包与公开入口](packages.md)。

## 运行源码组件 CLI

四种工具的临时执行命令如下；它们最终都调用 package 中声明的 `oria` binary：

```bash
# pnpm
pnpm dlx @oriatheme/cli@latest add theme-editor --framework react --dry-run

# npm（显式指定 oria binary）
npm exec --yes --package=@oriatheme/cli@latest -- oria add theme-editor --framework react --dry-run

# Yarn
yarn dlx @oriatheme/cli@latest add theme-editor --framework react --dry-run

# Bun
bunx @oriatheme/cli@latest add theme-editor --framework react --dry-run
```

检查计划后，把 `--dry-run` 替换为 `--yes` 才会写入。Vue 将 framework 改为 `vue`。查看差异时使用对应的完整命令：

```bash
pnpm dlx @oriatheme/cli@latest diff theme-editor --framework react
npm exec --yes --package=@oriatheme/cli@latest -- oria diff theme-editor --framework react
yarn dlx @oriatheme/cli@latest diff theme-editor --framework react
bunx @oriatheme/cli@latest diff theme-editor --framework react
```

CLI 写入组件、`.oria/components.json` 和 `package.json` 后不会安装依赖。继续运行项目自己的工具：

```bash
pnpm install
# 或 npm install
# 或 yarn install
# 或 bun install
```

## Lockfile 与项目元数据

- 一个使用方项目只选择一种包管理器，并提交对应 lockfile；不要在同一变更中混用 `pnpm-lock.yaml`、`package-lock.json`、`yarn.lock`、`bun.lock` 或旧版 `bun.lockb`。
- CLI 保留已有 `packageManager`、scripts、dependencies 和 devDependencies，只合并 registry manifest 声明的 runtime/framework dependencies。
- CLI 不生成 lockfile，因此不会替用户决定 pnpm、npm、Yarn 或 Bun。
- Yarn Plug'n'Play 项目仍只通过公开 package root exports 解析 OriaTheme；源码模板不得读取 `node_modules` 绝对路径。PnP 与 node-modules linker 都属于发布 smoke test。

## 仓库开发例外

“使用方兼容四种工具”不表示 OriaTheme monorepo 同时维护四套 lockfile。仓库根目录明确声明 `packageManager: pnpm@10.10.0`，脚本使用 pnpm workspace/filter，贡献者必须使用 pnpm 和 `pnpm-lock.yaml`。npm、Yarn、Bun 只用于干净使用方项目的发布兼容性验证。

## 发布验证要求

每个公开版本发布前必须在互相隔离的干净项目验证：

1. pnpm、npm、Yarn 与 Bun 都能从 tarball 安装 package-root exports；实际发布后再分别从 registry 复验。
2. 每种工具都能运行 `oria add --dry-run`、`oria add --yes` 和 `oria diff`。
3. CLI 保留项目 `packageManager` 与既有 scripts，不创建其他工具的 lockfile。
4. React、Vue 与 Next 的 production build 至少覆盖四种工具；Yarn 同时覆盖默认 node-modules linker 与 Plug'n'Play。
5. 任一工具未实际执行时必须标记“未验证”，不能仅凭命令语法宣称通过。

`0.1.0` 首发已完成公开 registry 与干净使用方验证。后续每个公开版本仍须重新执行本节矩阵；未实际执行的工具不得仅凭命令语法标记为通过。

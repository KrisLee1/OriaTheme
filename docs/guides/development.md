# 开发者指南

[English](en/development.md) · [指南首页](README.md)

本指南面向修改 OriaTheme monorepo 的开发者。公开的架构与实现边界以[总体架构](../architecture/overview.md)、[包边界](../architecture/package-boundaries.md)、相关规范和本指南为准。

## 前置条件

- Node.js：仓库需要 Node.js 运行 pnpm、TypeScript、Vitest、tsup、Vite 和 Next.js，但当前没有 `engines`、`.nvmrc` 或 `.node-version`，因此尚未声明正式 Node 版本范围。
- pnpm：根 `packageManager` 固定为 `pnpm@10.10.0`。
- Git：Changesets 基线比较和正式发布需要可访问的 `main` 历史；当前交付目录没有 `.git`，这些步骤不能在此环境验证。

不要在发布文档中把未固化的本机 Node 版本写成兼容承诺。

公开包支持 pnpm、npm、Yarn 和 Bun 使用方项目，但本仓库只维护 pnpm workspace 与 `pnpm-lock.yaml`。不要在仓库根目录运行其他工具生成第二份 lockfile；四工具验证应在隔离使用方项目中进行，详见[包管理器兼容性](package-managers.md)。

## 初始化工作区

在仓库根目录执行：

```bash
corepack enable
corepack prepare pnpm@10.10.0 --activate
pnpm install --frozen-lockfile
```

若 Corepack 已提供正确 pnpm，可跳过前两行。`pnpm-lock.yaml` 是 workspace 安装来源；不要手工编辑 `node_modules` 或构建产物。

## 仓库结构

| 路径 | 责任 |
| --- | --- |
| `packages/core` | 环境无关的 contract、主题模型、校验、解析和诊断 |
| `packages/runtime-dom` | DOM 原子应用、Storage、Bootstrap、系统模式和 View Transition |
| `packages/react` / `packages/vue` | Runtime 的薄框架适配层 |
| `packages/colors` / `packages/presets` | 稳定基础色和官方完整主题 |
| `packages/editor-core` | 环境无关的编辑状态机 |
| `packages/react-editor` / `packages/vue-editor` | Headless editor bridge |
| `packages/cli` | 源码编辑器 registry、manifest 与安装 CLI |
| `apps/examples` | React、Vue、Next 及最小编辑器使用验证，不发布到 npm |
| `docs` | 公开架构、设计、规范、工程规则、用户指南和 ADR |

依赖方向见[包边界](../architecture/package-boundaries.md)。Core 和 Editor Core 的环境限制、Runtime 原子应用规则以及框架层禁止复制状态机的要求不可绕过。

## 日常开发循环

先阅读受影响的架构和规范文档，然后修改最小范围并运行对应 package 检查：

```bash
pnpm --filter @oriatheme/core typecheck
pnpm --filter @oriatheme/core lint
pnpm --filter @oriatheme/core test
pnpm --filter @oriatheme/core build
```

把 filter 改为受影响的 package。跨包或 Phase 验收必须执行根级门禁：

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

`pnpm build` 递归构建有 build script 的 workspace，包括公开包和示例应用。构建生成 `packages/*/dist` 与各示例的 production 输出；这些文件不得作为源码手工修改。

## 运行示例

`apps/examples/react`、`apps/examples/vue` 与 `apps/examples/next` 是可直接修改的完整工作台，分别对应 React + Vite、Vue 3 + Vite 和 Next.js。三者都展示预设切换、`light/dark/system`、主题化组件、Token 标本与按需加载的本地编辑器；Next 还作为 SSR/SSG 静态默认主题与 Bootstrap 的参考实现。它们均为私有 workspace，使用 `workspace:*` 依赖，适合在本仓库内作为开发起点，不能原样复制到仓库外。

```bash
pnpm dev:example:react
pnpm dev:example:vue
pnpm dev:example:next
```

三个命令都从仓库根目录运行。Next 示例固定由根脚本传入 `--port 5173`；同一时间启动多个示例时需避免端口冲突。Production build 可定向执行：

```bash
pnpm --filter @oriatheme/example-react build
pnpm --filter @oriatheme/example-vue build
pnpm --filter @oriatheme/example-next build
```

完整功能说明和最小编辑器使用方验证项目见 [apps/examples README](../../apps/examples/README.md)。

## CLI 与 registry 开发

CLI 包内含 bundled registry。修改模板后必须同步 manifest hash，再构建和测试 CLI：

```bash
node registry/update-manifests.mjs
pnpm --filter @oriatheme/cli typecheck
pnpm --filter @oriatheme/cli lint
pnpm --filter @oriatheme/cli test
```

发布前可从仓库根目录验证本地产物，而不声称 npm 已可用：

```bash
pnpm --filter @oriatheme/cli build
node packages/cli/dist/index.js add theme-editor --framework react --dry-run
```

实际写入一个独立测试项目时需要在该项目目录运行并增加 `--yes`。默认目标是 `components/oria-theme-editor`；已有文件默认拒绝覆盖。

## 测试层级

- package 单元测试：`pnpm --filter <package> test`。
- 全仓静态与单元门禁：`pnpm typecheck`、`pnpm lint`、`pnpm test`。
- Production build：`pnpm build` 或示例定向 build。
- 发布 smoke test：必须从 `pnpm pack` 产出的 tarball 安装到独立 React、Vue、Next 项目，不能用 workspace source 代替。
- 实际发布后 smoke test：必须在无 workspace link 的干净项目从 registry 安装；tarball 不能代替这一步。

完整矩阵见[测试策略](../engineering/testing.md)。浏览器 E2E、pack 和发布验证不能仅因源码存在就写为“通过”。

## 文档与变更记录

公开仓库的变更应更新受影响的规范或用户指南，并在公开包行为变化时添加 Changeset。项目维护者另行维护的状态、Phase 计划和详细执行日志不属于公开仓库或用户 Changelog。

文档修改后必须检查 Markdown 本地链接、标题锚点和残留模板标记。当前仓库尚未提供自己的文档校验 script；维护者使用的外部校验工具不能写成使用方项目依赖。

## 后续版本发布

`0.1.0` 首发已完成。后续版本仍须满足[构建与发布规范](../engineering/packaging.md)：

```bash
pnpm exec changeset status
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

`changeset status` 需要 Git `main` 基线。`changeset version`、`pnpm pack`、独立使用、registry 安装和 `npm publish` 属于维护者发布流程；不得仅为验证文档执行 publish。源码模板采用 Apache-2.0；公开 registry 位于 `https://theme.oria.org.cn/registry/v1`，`0.1.0` 已完成远程验证；后续 registry 变更或发布仍须重新验证。

推送到 `main` 后，`.github/workflows/publish.yml` 会通过 Changesets 创建版本 PR；合并该 PR 后才会进入 GitHub Environment `npm-publish` 并以 npm Trusted Publishing 发布。该 job 不使用 `NPM_TOKEN`，其 npm Trusted Publisher 配置必须匹配 `KrisLee1/OriaTheme`、`publish.yml` 与 `npm-publish`。

# 包与公开入口

[English](en/packages.md) · [指南首页](README.md)

OriaTheme 是 ESM-only 的多包项目；源码仓库使用 pnpm workspace，但发布包可由 pnpm、npm、Yarn 或 Bun 安装。使用方应用只应从下表的 package root 或明确的 CSS subpath 导入；`src/`、`dist/` 和 workspace 内部路径都不是公开 API。四种工具的命令见[包管理器兼容性](package-managers.md)。

> 十一个公开包均已发布到 npm（各包版本独立演进，以 npm latest 为准），当前默认标准为 `oria-standard@2`。workspace 或本地 tarball 只用于本仓库开发与后续版本发布验证。

| 包 | 何时安装 | 公开能力 |
| --- | --- | --- |
| `@oriatheme/core` | 定义、校验、解析、导入导出主题，或在服务端生成可信默认 CSS | 纯 TypeScript contract、主题模型、诊断、`oriaDefaultTheme`；不访问 DOM、Storage、React 或 Vue |
| `@oriatheme/presets` | 需要一款或多款官方主题 | 每主题 subpath、`oriaPresetThemes`、`oriaPresetCatalog` 与 root 具名导出；依赖 Core |
| `@oriatheme/runtime-dom` | 浏览器中应用、持久化和切换主题 | `createOriaThemeRuntime()`、Bootstrap、外部 store、View Transition；只有 `start()` 后访问浏览器 API |
| `@oriatheme/react` | React 18.2 或 19 应用 | `OriaThemeProvider`、`useOriaTheme()`、`useThemeSnapshot()`；React/React DOM 是 peer dependency |
| `@oriatheme/vue` | Vue 3.5 应用 | `createOriaTheme()`、`provideOriaTheme()`、`useOriaTheme()`；Vue 是 peer dependency |
| `@oriatheme/colors` | 需要不随主题变化的 OKLCH 基础色或 Tailwind v4 标准颜色名 | JS 色阶、`@oriatheme/colors/styles.css`、`@oriatheme/colors/tailwind.css` |
| `@oriatheme/tailwind` | 在 Tailwind CSS v4 项目中消费 runtime 主题变量 | 静态 `@theme inline` bridge（`@oriatheme/tailwind/oria.css`）与 `generateOriaTailwindBridge({ prefix })`；Tailwind 仅为构建/测试依赖 |
| `@oriatheme/editor-core` | 构建主题编辑体验 | 无 DOM/Storage/框架依赖的草稿、字段、诊断和提交状态机 |
| `@oriatheme/react-editor` | React 源码编辑器需要 headless session bridge | Provider/hooks 与自动预览协调；不包含可见编辑器 UI 或默认 CSS |
| `@oriatheme/vue-editor` | Vue 源码编辑器需要 headless session bridge | provide/composables 与自动预览协调；不包含可见编辑器 UI 或默认 CSS |
| `@oriatheme/cli` | 把可见 React/Vue 编辑器 UI 组件复制到应用源码 | `oria add`、`oria diff`、`oria theme tailwind-bridge`、bundled/local/HTTPS registry、SHA-256 与路径安全；开发时工具，不是 runtime 依赖 |

## 常见组合

仅使用 Default：

```ts
import { oriaDefaultTheme } from "@oriatheme/core";
import { createOriaThemeRuntime } from "@oriatheme/runtime-dom";

const runtime = createOriaThemeRuntime({
  presets: [oriaDefaultTheme],
  defaultThemeId: "oria-default",
});
```

使用完整官方目录：

```ts
import { oriaPresetThemes } from "@oriatheme/presets";
import { createOriaThemeRuntime } from "@oriatheme/runtime-dom";

const runtime = createOriaThemeRuntime({
  presets: oriaPresetThemes,
  defaultThemeId: "oria-default",
});
```

只内置选定主题时，使用每主题公开入口；下面的入口要求安装包含本次 Changeset 的 Presets 版本，旧版 npm 包应继续使用 root 具名导出：

```ts
import { oriaOceanTheme } from "@oriatheme/presets/ocean";
import { oriaForestTheme } from "@oriatheme/presets/forest";
import { createOriaThemeRuntime } from "@oriatheme/runtime-dom";

const runtime = createOriaThemeRuntime({
  presets: [oriaOceanTheme, oriaForestTheme],
  defaultThemeId: "oria-ocean",
});
```

框架包不会复制 runtime 状态机。应用需要 React 时安装 `@oriatheme/react`，需要 Vue 时安装 `@oriatheme/vue`；不应同时安装另一框架的适配层。

## CSS 入口

公开 CSS subpath 来自 `@oriatheme/colors` 与 `@oriatheme/tailwind` 两个包：

```css
@import "@oriatheme/colors/styles.css";
```

若使用 Tailwind CSS v4，再加入基础色映射与 runtime 变量 bridge：

```css
@import "tailwindcss";
@import "@oriatheme/colors/tailwind.css";
@import "@oriatheme/tailwind/oria.css";
```

`@oriatheme/tailwind/oria.css` 是默认 `oria` 前缀的静态 `@theme inline` bridge；custom prefix 必须用 CLI 预构建（`oria theme tailwind-bridge --prefix <name> --out <file>`），运行时不拼接变量名。

Runtime 主题变量不需要导入一份静态 OriaTheme stylesheet；它们由 runtime 原子写入。编辑器 CSS 位于 CLI 安装到应用源码的本地组件目录中，由本地编辑器入口导入。

## SSR 与浏览器边界

除仅供命令行执行的 `@oriatheme/cli` 外，所有运行时库 package root 都可在 SSR/Node 模块解析阶段安全导入。以下动作仍是 client-only：

- `runtime.start()`；
- React Provider 实际挂载；
- Vue plugin/provide 实际安装；
- `bootstrapTheme()` 读取浏览器 Storage。

Next.js 应在 Server Component 中生成静态默认 CSS 和 Bootstrap script，在 Client Component 中挂载 Provider。详见 [Bootstrap](bootstrap.md) 与[性能集成](performance.md)。

## 可见主题编辑器

可见 UI 不从 `@oriatheme/react-editor` 或 `@oriatheme/vue-editor` 导出。发布后由 CLI 安装：

下面以 pnpm 展示参数；npm、Yarn、Bun 的等价 runner 见[包管理器兼容性](package-managers.md)。

```bash
pnpm dlx @oriatheme/cli@latest add theme-editor --framework react --dry-run
pnpm dlx @oriatheme/cli@latest add theme-editor --framework react --yes
```

Vue 将 `react` 改为 `vue`。CLI 默认目标是 `components/oria-theme-editor`，写入前展示计划；无 `--yes` 时退出码为 2 且不写文件。完整流程见[主题编辑器指南](theme-editors.md)。

## 版本边界

npm package version、Theme `schemaVersion`、Token Contract version 和 persisted-state `schemaVersion` 相互独立。不要根据 npm 版本猜测持久化格式；迁移规则见[迁移指南](migrations.md)。

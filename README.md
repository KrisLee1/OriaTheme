<h1 align="center">
  <img src="apps/website/public/icons/oria-theme-logo.svg" alt="OriaTheme" width="440">
</h1>

[English](README.en.md)

OriaTheme 是 framework-agnostic 的客户端主题 runtime，提供类型化 Token Contract、light/dark/system 模式、持久化、原子 CSS Variables 应用、Tailwind CSS v4 静态 bridge 以及 React/Vue 薄适配层。

> 发布状态：十一个公开 `@oriatheme/*` 包已发布到 npm（各包版本独立演进，最新版本以 npm 为准）；当前发布批次把默认标准 Token Contract 切换为 `oria-standard@2`（breaking change，v1 以 legacy 导出保留并附带迁移器），公开 registry 已可用于安装 CLI 源码组件。从 `0.1.x` 升级见[迁移与兼容性](docs/guides/migrations.md)。

## Packages

- `@oriatheme/core`：无环境依赖的 contract、校验、解析、导入导出与诊断；默认解析 `oria-standard@2`，保留 v1 legacy 导出与 `migrateOriaStandardV1ToV2()`。
- `@oriatheme/presets`：可选安装的 41 款官方完整主题集合（原生 v2），并提供可发现的目录元数据。
- `@oriatheme/colors`：不随主题变化的独立基础色库（26 个家族、50–950 十一阶与五个特殊色），提供 JS 色阶、CSS variables 与 Tailwind v4 标准颜色名。
- `@oriatheme/tailwind`：`oria-standard@2` runtime 变量的 Tailwind CSS v4 静态 `@theme inline` bridge，含默认前缀 CSS 入口与 custom prefix 生成器。
- `@oriatheme/runtime-dom`：client-only runtime、storage、bootstrap 和可选 View Transition。
- `@oriatheme/react`：React Provider、snapshot hooks 和 selector。
- `@oriatheme/vue`：Vue Plugin、provide 和 composable。
- `@oriatheme/editor-core`：无框架的主题草稿、字段描述、智能阶梯、诊断、预览和保存协调。
- `@oriatheme/react-editor` / `@oriatheme/vue-editor`：Provider/hooks 或 provide/composables 的 headless bridge，负责订阅与最新有效 revision 自动预览，不发布黑盒 UI 或默认 CSS。
- `@oriatheme/cli`：带 bundled/local/HTTPS registry 的源码组件安装工具，支持 dry-run、确认写入、diff、冲突拒绝、SHA-256 与路径安全；可见编辑器组件不作为 `node_modules` 黑盒分发。

所有运行时库都支持 SSR-safe import；Node CLI 仅用于开发期安装源码组件。只有 runtime 的 `start()` 和 framework Provider/Plugin 挂载后才访问浏览器 API。OriaTheme 只写主题变量与 `data-oria-*` 属性，不改变使用方应用的组件结构或布局。

从[快速开始](docs/guides/quick-start.md)进入，或查看[双语使用指南](docs/guides/README.md)、[包与公开入口](docs/guides/packages.md)、[pnpm/npm/Yarn/Bun 兼容性](docs/guides/package-managers.md)、[迁移与兼容性](docs/guides/migrations.md)、[开发者指南](docs/guides/development.md)、[总体架构](docs/architecture/overview.md)与[公开规范](docs/specifications/core-api.md)。

## 运行示例

React、Vue 和 Next.js 的单页组件展示位于 [`apps/examples`](apps/examples/README.md)，可分别运行：`pnpm dev:example:react`、`pnpm dev:example:vue` 或 `pnpm dev:example:next`。

## 使用官方预设主题

以下是当前发布版本的正式安装方式（各包版本独立演进，以 npm latest 为准）；仓库 workspace 示例仍仅用于本仓库开发与验证。

```bash
# 选择项目正在使用的一种工具
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

也可以按需导入任意具名主题（例如 `oriaOceanTheme`、`oriaForestTheme`、`oriaAuroraTheme` 或 `oriaWarmReadingTheme`），自行组成 `presets` 数组。`oriaPresetCatalog` 仅提供主题引用与分类，数组顺序即稳定预览顺序；主题描述和设计依据保留在文档中，不进入发布 bundle 或主题持久化格式。`oriaDefaultTheme` 仍由 `@oriatheme/core` 导出，当前指向 v2 默认主题；持有 v1 custom theme 或引用 v1 CSS 变量名的应用请按[迁移指南](docs/guides/migrations.md)升级。

## License

OriaTheme、公开 npm 包和由 CLI 安装的编辑器源码组件均采用 [Apache License 2.0](LICENSE)。该许可证不授予 OriaTheme 名称、商标或 logo 的使用权。

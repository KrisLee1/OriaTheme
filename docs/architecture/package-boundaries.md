# 包边界与依赖方向

## Monorepo

```text
OriaTheme/
├── apps/
│   ├── docs/
│   ├── examples/
│   │   ├── next/
│   │   ├── react/
│   │   └── vue/
│   └── website/              # Phase 8 私有应用，不发布
├── packages/
│   ├── core/
│   ├── colors/
│   ├── editor-core/
│   ├── presets/
│   ├── react-editor/
│   ├── runtime-dom/
│   ├── react/
│   ├── vue/
│   ├── vue-editor/
│   └── cli/
├── registry/                 # 用户持有的 React/Vue 编辑器 UI 源码模板
└── docs/
```

目标首发公开包：

- `@oriatheme/core`
- `@oriatheme/colors`
- `@oriatheme/presets`
- `@oriatheme/runtime-dom`
- `@oriatheme/react`
- `@oriatheme/vue`
- `@oriatheme/editor-core`
- `@oriatheme/react-editor`
- `@oriatheme/vue-editor`
- `@oriatheme/cli`（一次性源码组件安装工具，不是应用 runtime 依赖）

`apps/website` 始终为 private workspace application，不属于发布包。

## 依赖方向

```text
colors       ──standalone static library──> no Oria runtime dependency
presets      ──depends on──> core
runtime-dom  ──depends on──> core
react        ──depends on──> runtime-dom
vue          ──depends on──> runtime-dom
editor-core  ──depends on──> core + runtime-dom
react-editor ──depends on──> editor-core + react       # headless bridge
vue-editor   ──depends on──> editor-core + vue         # headless bridge
cli          ──reads/copies──> registry manifests + source templates
registry UI  ──imports──> editor bridge + public runtime/core exports
```

- Colors：稳定的完整基础色库、普通 CSS variables 与 Tailwind v4 颜色命名桥接；不依赖 Core、Runtime 或框架。
- Core：类型、contract、schema、纯解析、颜色与对比度算法、错误模型。
- Presets：可选安装的完整官方主题集合；只依赖 Core，不访问 DOM 或 runtime。
- Runtime DOM：外部 store、DOM stylesheet、Storage、系统模式、bootstrap、transition。
- React：Provider、Hooks、selector；React 为 peer dependency。
- Vue：Plugin、provide/inject、composables；Vue 为 peer dependency。
- Editor Core：无框架草稿模型、字段描述、编辑命令与 runtime 提交协调；复用 Core/Runtime 公开 API，不直接访问 DOM 或 Storage。
- React Editor / Vue Editor：无完整可视 UI 的框架桥接，负责 session 注入、订阅、所有权和自动预览协调；不复制 editor-core/runtime 状态机。
- CLI：校验 registry manifest、路径和 hash，将多文件可见 UI 复制到用户源码；不执行 registry scripts。
- Registry UI：官方 React/Vue 可见组件模板；用户安装后自行持有和修改，但仍经公开 editor/core/runtime API 执行领域命令。
- Website：私有 Next.js 消费应用，页面导入由 registry 安装到官网源码的本地组件；这些组件只从公开 package exports 导入领域/runtime 能力。

## 禁止依赖

- Core 不得依赖 DOM、React、Vue 或浏览器 API。
- Colors 不得依赖 runtime 或框架，也不得把 Tailwind 作为消费端 runtime dependency。
- Runtime DOM 不得依赖 React/Vue。
- React/Vue 不得互相依赖。
- Editor Core 不得依赖 DOM、Storage、React 或 Vue。
- React Editor/React registry item 不得依赖 Vue，Vue Editor/Vue registry item 不得依赖 React；二者不得复制 editor-core 或 runtime 状态机。
- `node_modules` 中的框架 editor 包不得作为完整可视 UI 的默认交付位置；可见 UI 必须通过 registry 复制到用户源码。
- CLI 不得默认覆盖用户文件、越出目标项目或执行 registry 声明的任意命令。
- Website 不得通过 `packages/*/src` 深层路径导入，也不得进入 npm 发布清单。
- 不引入 Zustand、Redux、Pinia、Vuex 等状态框架。
- 示例应用不得通过内部源码路径绕过 package exports。

## 消费方式

```bash
pnpm add @oriatheme/react
# 或
pnpm add @oriatheme/vue
# 多款官方预设（可选）
pnpm add @oriatheme/presets
# 完整稳定基础色库（可选）
pnpm add @oriatheme/colors
# 将 React 主题编辑器可见组件添加到当前项目
pnpm dlx @oriatheme/cli@latest add theme-editor --framework react
# 或 Vue
pnpm dlx @oriatheme/cli@latest add theme-editor --framework vue
```

编辑器 CLI 会将对应框架的可见组件写入用户源码，并在确认后添加所需的 editor-core、headless bridge 和 runtime 依赖。用户不在 `node_modules` 中修改 UI。高级原生 DOM 消费者可以直接安装 runtime-dom。

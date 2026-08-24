# OriaTheme 原理与架构

[English](en/architecture.md) · [指南首页](README.md) · [包与公开入口](packages.md)

本指南面向需要接入、扩展或维护 OriaTheme 的开发者。它解释系统的分层理由、每个包解决的问题，以及主题切换、首屏恢复和主题编辑实际经过的流程。公开 API 仍以各 package root export 与 TypeScript 声明为准。

## 整体心智模型

OriaTheme 不是组件库，也不改变应用的 DOM 结构。它将经过校验的 `ThemeDefinition` 解析为 CSS custom properties，并把这些视觉参数原子应用到页面或 Shadow Root；应用自己的组件 CSS 消费变量来决定颜色、排版、圆角、间距、阴影和动效。

```text
预设 / 导入主题 / 编辑器草稿
              │
              ▼
        Core：校验与解析
              │  ResolvedTheme（不可变 CSS 变量快照）
              ▼
 Runtime DOM：状态、持久化与原子 DOM 提交
              │
     ┌────────┼───────────┬───────────┐
     ▼        ▼           ▼           ▼
 CSS 变量  React 适配层  Vue 适配层  原生 Web
              │
              ▼
        应用自己的组件与样式
```

`ThemeDefinition` 是可导入、导出和编辑的主题数据；`ResolvedTheme` 是在指定 light/dark 模式下，经过 Token Contract 校验、引用解析和 CSS 编译后的结果。只有后者允许写入 DOM。

## 架构原则

1. **Core 是主题语义的唯一实现。** Contract、schema、校验、引用解析、CSS 变量编译和诊断都在 `@oriatheme/core`；它不访问 DOM，也不依赖 React 或 Vue。
2. **Runtime 是已提交主题的唯一状态源。** 当前主题、`light/dark/system` 偏好、自定义主题、预览、Storage 和 DOM stylesheet 均由 `@oriatheme/runtime-dom` 协调。
3. **偏好与派生结果分开。** `appearance` 可以是 `light`、`dark` 或 `system`；`resolvedMode` 只能是 `light` 或 `dark`，由偏好和系统设置推导，绝不能作为用户偏好持久化。
4. **无效主题绝不半应用。** Runtime 先取得完整有效的 `ResolvedTheme`，再一次替换自己的 stylesheet；失败时保留上一份有效样式。
5. **框架层只做桥接。** React/Vue 包负责 Provider、Plugin、订阅与生命周期，不复制 Runtime 状态机。
6. **编辑器草稿与已提交主题分离。** 草稿可以暂时无效；只有有效草稿才可预览或保存到 Runtime。
7. **可见编辑器 UI 归应用所有。** npm editor 包只提供 headless bridge；CLI 将 React/Vue 组件模板复制到应用源码，产品可以修改 UI 而不分叉领域逻辑。
8. **运行时库均 SSR-safe import。** 模块导入时不读取 `window`、`document`、Storage 或 `matchMedia`；浏览器 API 仅由启动、框架挂载或 bootstrap 使用。

## 包与模块地图

### 公开包

| 包 | 负责什么 | 依赖与边界 |
| --- | --- | --- |
| `@oriatheme/core` | Token Contract、主题模型、校验/规范化/解析、导入导出、迁移、对比度诊断、默认主题 | 纯 TypeScript；不访问 DOM、Storage、React、Vue |
| `@oriatheme/presets` | 完整官方预设目录、分类和具名预设导出 | 只依赖 Core；预设不可原地修改 |
| `@oriatheme/runtime-dom` | 外部 store、DOM 属性与 stylesheet、Storage、系统模式、Bootstrap、预览、View Transition | 依赖 Core；不依赖框架 |
| `@oriatheme/react` | React Provider、Hooks、selector 和 Runtime 生命周期桥接 | 依赖 Runtime；React/React DOM 是 peer dependency |
| `@oriatheme/vue` | Vue plugin、provide/inject、composables 和 Runtime 生命周期桥接 | 依赖 Runtime；Vue 是 peer dependency |
| `@oriatheme/editor-core` | 草稿 session、字段描述、智能阶梯、诊断、预览/保存协调 | 复用 Core/Runtime 公开 API；不访问 DOM、Storage 或框架 |
| `@oriatheme/react-editor` | React editor session 注入、订阅与自动预览协调 | 依赖 editor-core 与 React；不包含可见 UI |
| `@oriatheme/vue-editor` | Vue editor session 注入、订阅与自动预览协调 | 依赖 editor-core 与 Vue；不包含可见 UI |
| `@oriatheme/cli` | 校验 registry manifest、hash 和路径，将编辑器多文件源码安全复制进应用 | 开发工具，不是 runtime 依赖；不默认覆盖文件或执行 registry 脚本 |
| `@oriatheme/colors` | 不随主题切换的基础色阶、普通 CSS 变量和 Tailwind v4 色名映射 | 独立静态库；不依赖 Runtime 或框架 |
| `@oriatheme/tailwind` | `oria-standard@2` 变量的静态 Tailwind CSS v4 `@theme inline` bridge 与 custom-prefix 生成器 | 独立静态 bridge；Tailwind 只用于该包构建/测试 |

### 私有应用与支持目录

| 路径 | 作用 |
| --- | --- |
| `apps/website` | 官网、文档和在线编辑器；始终 `private`，只通过已发布 package root exports 消费 OriaTheme，不进入 npm/Changesets 发布清单 |
| `apps/examples/react`、`vue`、`next` | React、Vue、Next 的完整接入参考；用于 workspace 开发验证，不是消费者深层导入模板 |
| `apps/examples/editor-next`、`editor-vue` | 本地源码组件编辑器的专门验证示例 |
| `packages/cli/registry` | 与 CLI 一起发布的 React/Vue 编辑器模板、manifest 和 hash；安装后的副本归消费者项目维护 |
| `docs` | 架构、有效规范、ADR、阶段计划、工程规则和用户/开发者指南的事实来源 |

下图按“被依赖者 → 依赖者”展示单向关系，避免框架或可见 UI 反向侵入主题语义：

```text
colors ────────────────────────────────────────────────┐
tailwind ──────────────────────────────────────────────┤  独立静态能力
core ─────► presets                                     │
  └──────► runtime-dom ─────► react ─────► react-editor │
                      └─────► vue ───────► vue-editor   │
                      └─────► editor-core ──────────────┘

cli ──读取/复制──► registry UI ──导入──► editor bridge + 公开 API
website ──组合──► 已安装到其源码的 registry UI + 公开 API
```

## 浏览器中的主题工作流程

### 创建与启动

创建 Runtime 时保持 SSR-safe，`start()` 才在浏览器读取 Storage、监听系统颜色模式并写入 DOM。

```ts
import { oriaDefaultTheme } from "@oriatheme/core";
import { createOriaThemeRuntime } from "@oriatheme/runtime-dom";

const runtime = createOriaThemeRuntime({
  presets: [oriaDefaultTheme],
  defaultThemeId: "oria-default",
});

runtime.start();
```

启动或每次切换时，实际链路为：

1. Runtime 选择 `activeThemeId` 与 `appearance`；若为 `system`，从系统设置推导 `resolvedMode`。
2. Core 用对应 Contract 完整校验主题，解析 token 引用、别名和派生变量，生成 `ResolvedTheme`。
3. Runtime 将完整变量集合编译为 stylesheet，优先使用独占 `CSSStyleSheet`，否则更新唯一的 `<style data-oria-theme-runtime>`。
4. 只有 stylesheet 写入成功后，才同步 `data-oria-theme`、`data-oria-mode`、`color-scheme`、外部 store snapshot 和持久化状态。
5. React Hooks、Vue composables 或原生订阅者读取同一份 snapshot；未订阅 snapshot 的组件不会仅因主题变化重渲染。

不要自行把未经验证的用户字符串拼接到 stylesheet，也不要绕开 Runtime 直接修改 `data-oria-*` 或 Storage。

### 切换与首屏恢复

`runtime.setTheme(id)` 与 `runtime.setAppearance(mode)` 是正式提交。相同的已解析变量不会重复写 DOM；快速连续操作以最后一次状态为准。用户主动操作可使用圆形 View Transition；系统变化、rehydrate、跨标签同步和 bootstrap 永不播放动画。

Runtime 是 client-only，但模块可在服务端安全导入。SSR/SSG 应在首屏 HTML 中使用 Core 生成可信默认样式，并放入 Bootstrap script；客户端 Runtime 必须使用相同的 contract、prefix、storage key、默认主题和迁移配置接管。Bootstrap 只能恢复已验证的持久化信息，不能成为第二套解析器。详见[首屏主题 Bootstrap](bootstrap.md)和[性能集成](performance.md)。

## 自定义主题与编辑器流程

预设不可原地修改。从预设开始编辑时，editor-core 先复制出 `kind: "custom"` 的草稿；导入主题同样是 custom。编辑过程与 Runtime 正式状态分开：

```text
Preset / Custom / JSON
         │ clone、load 或 import
         ▼
editor-core draft session
         │ 字段编辑、issues、diagnostics、revision
         ├── 有效草稿 ──► runtime.previewTheme() ──► 临时原子预览
         │                                      │ dispose
         │                                      ▼
         │                                  恢复正式快照
         └── save ──► create/updateCustomTheme() ──► 持久化正式状态
```

editor-core 是草稿规则的唯一实现：它管理字段作用域、智能阶梯、导入导出、冲突检测、验证和保存意图。React/Vue editor bridge 只将 session 暴露给框架；安装到项目源码的 UI 只渲染表单、处理焦点/可访问性并调用 bridge。页面不应复制草稿状态机，也不应在每次输入时自行写 Storage。

可见编辑器由 CLI 安装到源码，而不是从 `node_modules` 导入黑盒组件：

```bash
pnpm dlx @oriatheme/cli@latest add theme-editor --framework react
```

Vue 将 `react` 改为 `vue`。完整安装、更新和冲突处理见[主题编辑器指南](theme-editors.md)。

## CSS、基础色与 Tailwind 的位置

Runtime 主题变量是动态的：当前有效主题会将变量一次性写入 DOM，组件样式通过 `var(--oria-...)` 消费。`@oriatheme/colors` 是静态基础色库，不会因主题切换被重写。

在 Tailwind CSS v4 项目中，`@oriatheme/tailwind/oria.css` 将默认 `oria` 前缀的动态变量映射为静态 `@theme inline` 名称；custom prefix 必须通过 CLI 预生成 bridge 文件。Tailwind bridge 不读取主题，也不参与 Runtime 依赖图，因此不能取代 Core 校验或 DOM Runtime。

```css
@import "tailwindcss";
@import "@oriatheme/colors/tailwind.css";
@import "@oriatheme/tailwind/oria.css";
```

具体变量与样式策略见[组件样式使用方式](component-styling.md)。

## 贡献时如何选入口

| 你要改什么 | 首先阅读 / 修改的边界 |
| --- | --- |
| 新 token、contract、主题解析或迁移 | `core`；先阅读 Token Contract、Core API 和相关 ADR |
| 浏览器应用、Storage、系统模式、Bootstrap、动画 | `runtime-dom`；先阅读 DOM Runtime、持久化和 Transition 规范 |
| React 或 Vue 生命周期/订阅体验 | 对应 framework adapter；不得复制 Runtime 状态机 |
| 新官方主题或预设目录 | `presets`；主题必须完整校验、解析且通过诊断要求 |
| 编辑字段、草稿或保存语义 | `editor-core`；UI 不应成为规则来源 |
| 编辑器框架接入或可见组件 | `react-editor`/`vue-editor` 或 CLI registry；可见 UI 修改在消费者持有的源码副本 |
| 静态色阶或 Tailwind 名称映射 | `colors` 或 `tailwind`；二者不得反向依赖 Runtime |
| 官网 | `apps/website`；只使用公开 exports，保持 private |

开始工作前从[文档索引](../INDEX.md)进入，并按任务路由读取当前 Phase、规范与 ADR。日常开发、过滤命令和完整验证门禁见[开发者指南](development.md)。

## 常见边界错误

- 不要把 `resolvedMode` 写入偏好或当作第三种持久化状态。
- 不要在 React/Vue/网站页面重新实现 Runtime、Core 或 editor-core 状态机。
- 不要从 `packages/*/src`、`dist/` 或其它深层路径导入；消费者和官网只使用公开入口。
- 不要让 Core、editor-core 或静态 bridge 接触浏览器环境。
- 不要部分应用非法主题；失败时保留上一份有效主题。
- 不要将 `apps/website`、examples 或 registry UI 误加入 npm 发布清单。

若行为、公共 API 或持久化格式需要改变，先更新对应 specification；涉及重要架构取舍时新增 ADR，而不是仅修改本指南。

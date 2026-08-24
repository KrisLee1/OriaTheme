# 官网文档页面信息架构与维护规则

本文定义 Phase 9 官网文档的当前内容边界、稳定 URL、页面职责与维护顺序。`apps/website` 必须保持与此信息架构一致；仓库内的 specifications、公开 package root exports 和 TypeScript 声明仍是技术事实的权威来源。

## 目标与读者

官网文档服务两条明确路径：

1. **应用使用者**：了解主题能改变什么，通过在线编辑器从预设创建、预览、保存、导入和导出本地主题。
2. **应用开发者**：在 React、Vue 或原生 Web 应用中安装 OriaTheme，接入 runtime、框架适配层、基础色库、预设和用户持有的主题编辑器源码组件。

文档必须先帮助读者完成一个可观察的任务，再提供深入 API。它不把在线编辑器描述为页面结构生成器，也不承诺账号、云端保存、主题市场、远程同步或访问分析。

## 内容模型与路由

文档以稳定的英文 slug 提供中英文页面，避免语言切换改变深链接。实现可以使用 Next catch-all route 或等价的内容路由，但必须保留以下 URL。

| 路由 | 页面 | 读者 | 主要目标 |
| --- | --- | --- | --- |
| `/[locale]/docs` | 文档首页 | 全部 | 选择“使用主题”或“开发集成”路径，并快速跳转到框架和 API。 |
| `/[locale]/docs/getting-started` | 快速开始 | 全部 | 先按“使用和调整主题”与“在应用中接入主题”分流；前者直接进入在线编辑器，后者进入 React、Vue 或原生 Runtime 的开发快速开始，并说明两条路线共享的主题、预设、Runtime 与外观模式。 |
| `/[locale]/docs/use/editor` | 在线主题编辑器 | 应用使用者 | 从预设创建我的主题、自动预览、校验、保存、重置、导入、导出和本地数据边界。 |
| `/[locale]/docs/use/editable-styles` | 可编辑样式 | 应用使用者 | 说明每一组可编辑 Token、Light/Dark 作用域及编辑器不会改变的内容。 |
| `/[locale]/docs/use/colors` | 基础色库 | 应用使用者、开发者 | 说明稳定基础色与随主题变化的语义色差异，展示完整 26×11 色库与 5 个特殊色，以及颜色选择器的使用方式。 |
| `/[locale]/docs/use/appearance` | 外观模式 | 应用使用者、开发者 | 解释 light、dark、system、resolved mode 与偏好持久化的边界。 |
| `/[locale]/docs/use/presets` | 官方预设 | 应用使用者 | 按目录分类浏览官方预设、切换预设并复制为可编辑 custom theme。 |
| `/[locale]/docs/develop/quick-start` | 开发快速开始 | 开发者 | 按框架安装、初始化 runtime、切换主题并让组件消费 CSS variables。 |
| `/[locale]/docs/develop/packages` | 包选择与安装 | 开发者 | 提供十一个公开包的场景矩阵、依赖关系、CSS subpath 与 CLI 的开发时边界。 |
| `/[locale]/docs/develop/styling` | 组件样式 | 开发者 | 使用语义 CSS variables、`@oriatheme/colors` 与 Tailwind v4 桥接。 |
| `/[locale]/docs/develop/runtime` | Runtime、Bootstrap 与动画 | 开发者 | DOM runtime、Storage、首屏恢复、View Transition 和原子主题应用。 |
| `/[locale]/docs/develop/react` | React 与 Next.js | 开发者 | Provider、Hook、SSR/Bootstrap 和 client-only 编辑器加载。 |
| `/[locale]/docs/develop/vue` | Vue | 开发者 | Plugin、provide/composable、首屏恢复和编辑器按需加载。 |
| `/[locale]/docs/develop/custom-themes` | 自定义主题 | 开发者 | 创建、校验、解析、导入、导出、诊断和迁移。 |
| `/[locale]/docs/develop/custom-presets` | 应用自定义预设 | 开发者 | 在应用中定义有效 `ThemeDefinition`、注册到 runtime 与官方预设目录的边界。 |
| `/[locale]/docs/develop/theme-editor` | 主题编辑器组件 | 开发者 | 用 CLI 安装 React/Vue 源码组件、组合本地 `ThemeEditor`、升级与冲突处理。 |
| `/[locale]/docs/develop/quality` | 性能、可访问性与排障 | 开发者 | SSR、性能、reduced motion、键盘访问、迁移和常见故障。 |
| `/[locale]/docs/api/[package]` | API 参考 | 开发者 | 逐包呈现公开 exports、类型、参数、返回值、错误、运行环境和最小示例。 |

`locale` 仅允许已有的 `zh` 与 `en`。导航显示中文或英文标题；路径、Token path、CSS variable、包名、代码标识符和主题 ID 保持原样。

## 文档首页与导航

文档首页按以下顺序组织：

1. 标题、简短定位和两个读者入口卡片：**使用主题**、**开发集成**。`getting-started` 也必须重复该分流，不得在通用快速开始中直接以安装命令和框架代码取代应用使用者的第一步。
2. 三个框架快捷入口：React、Vue、原生 Runtime。
3. 常用任务：编辑主题、选择预设、接入外观模式、安装主题编辑器、查看 API。
4. API 包索引：按 Core、Runtime、框架、主题资产与编辑器/CLI 分组。
5. 版本与边界提示：示例只使用已发布 public exports；在线编辑器默认只在浏览器本地处理主题。

桌面端提供左侧分组导航、正文锚点目录和“上一页 / 下一页”；窄屏将分组导航置入可键盘操作的抽屉或折叠区域，正文目录仍可访问。页面必须有单一 `h1`、层级连续的标题、可见焦点、可复制代码块和直接锚点链接。

## 应用使用者内容

### 在线主题编辑器工作流

页面按用户操作顺序说明：选择官方预设 → 复制并编辑为 custom theme → 选择 Light 或 Dark → 自动预览与校验 → 显式保存 → 导出或导入主题文件。必须明确：

- 自动预览不会自动保存；非法草稿不会部分应用。
- preset 不能被直接改写；保存后的主题属于“我的主题”。
- 导入/导出使用 `.oria-theme.json`；导入仍经过完整 Contract 校验。
- 未保存草稿在关闭、切换主题或刷新前会受保护；默认不上传主题内容。

### 可编辑样式清单

页面用“效果、代表性字段、作用域、用户预期”表解释编辑器，而不是只展示 Token 名称。

| 分类 | 可编辑内容 | 作用域 |
| --- | --- | --- |
| 颜色 | 背景、前景、表面、主/次/强调色、交互态、反馈色、选择态、焦点环、图表色 | 多数语义色按 Light/Dark 独立编辑。 |
| 排版 | 字体族、九级字重、字号、行高、字距 | 标准 shared 字段会同步两个模式。 |
| 布局与形状 | 间距、密度、控件高度与横向内边距、圆角、边框 | 标准 shared 字段会同步两个模式。 |
| 层次与材质 | 阴影、前景/背景模糊、背景饱和度、结构化渐变、背景与表面图案 | 阴影、渐变等可按模式变化；输入始终是受约束的结构化值。 |
| 动效 | 时长与缓动曲线 | 标准 shared 字段会同步两个模式。 |

同一页必须说明边界：编辑器只改变 OriaTheme Token 和由这些变量驱动的视觉呈现；不会修改应用信息架构、页面内容、组件结构或任意 CSS。

### 基础色、外观与预设

- 基础色库页说明 `@oriatheme/colors` 是稳定的 26 个色系、每系 11 个色阶及 5 个特殊色；它不随主题切换。语义 Token 才会随主题变化。该页直接展示完整色库（由编辑器页底部迁入），编辑器页只保留指向此页的链接。
- 外观模式页区分用户偏好 `light` / `dark` / `system` 与运行时解析结果 `resolvedMode`；后者不应作为偏好存储或显示为独立选择项。
- 预设页按官方 catalog 分类展示主题；单个主题页只陈述已实现的名称、ID、分类与设计描述，不虚构适用行业或未发布能力。

## 开发者内容

开发者路径将仓库现有使用指南重组为面向发布消费者的站点内容，不复制内部日志或实现状态。每个框架示例应给出前置条件、安装命令、运行位置、可观察结果与下一页链接。

### 包与职责矩阵

| 分组 | 包 | 文档重点 |
| --- | --- | --- |
| 核心主题 | `@oriatheme/core` | Contract、主题定义、校验、解析、导入导出、诊断。 |
| 浏览器运行时 | `@oriatheme/runtime-dom` | runtime、DOM variables、Storage、Bootstrap、预览与切换。 |
| 框架适配 | `@oriatheme/react`、`@oriatheme/vue` | Provider/Plugin 与 Hook/Composable；不复制 runtime 状态。 |
| 主题资产 | `@oriatheme/colors`、`@oriatheme/presets` | 稳定色库、CSS subpath、官方主题目录。 |
| 构建桥接 | `@oriatheme/tailwind` | `oria-standard@2` 的 Tailwind CSS v4 静态 bridge 与 custom-prefix 生成器。 |
| 编辑领域与桥接 | `@oriatheme/editor-core`、`@oriatheme/react-editor`、`@oriatheme/vue-editor` | 草稿、字段描述、会话和无可视 UI 的框架桥接。 |
| 源码组件安装 | `@oriatheme/cli` | registry 安装、dry-run、diff、显式 overwrite 与本地源码所有权。 |

### 自定义主题与应用预设

“自定义主题”说明运行时产生的 custom theme 生命周期；“应用自定义预设”说明开发者在应用代码中创建完整、已校验的 `ThemeDefinition` 并作为 runtime `presets` 注册。两页必须区分：官方 `@oriatheme/presets` catalog 的维护属于 OriaTheme 发布流程，应用预设不应冒充或覆盖官方 preset，也不能绕过 Core 的校验和解析。

### 主题编辑器组件

该页使用 CLI 的 React/Vue 安装路径，说明可见 UI 会复制到使用方项目的 `components/oria-theme-editor/`，而 `@oriatheme/*-editor` 仅提供 headless bridge。页面示例只组合本地 `ThemeEditor`、runtime 与 session/options；不得把 Toolbar、Tabs、Token renderer、导入导出或编辑器 CSS 重写进路由文件。

## API 参考规范

每个 `/api/[package]` 页面使用同一结构：

1. 包职责、安装命令、运行环境和依赖边界。
2. 公开导出目录，按函数、组件/Composable、类型和常量分组。
3. 每个可调用 API 的 TypeScript 签名、参数、返回值、副作用、错误/失败结果与最小示例。
4. 相关类型字段表；大型联合类型和 Token Contract 只列稳定入口并链接到相应专题页。
5. SSR、DOM、Storage、框架或 CLI 边界，以及常见误用。
6. 关联指南和版本核对信息。

API 条目必须逐项核对该版本 package root 的 `.d.ts` / exports；不从 `src/`、`dist/` 深层路径或 registry template 生成消费代码。当前覆盖所有十一个公开包，顺序为：`core` → `runtime-dom` → `react` / `vue` → `colors` / `presets` → `tailwind` → `editor-core` → `react-editor` / `vue-editor` → `cli`。

## 内容来源与维护边界

| 网站内容 | 事实来源 |
| --- | --- |
| 主题、模式、Token 与验证 | `specifications/theme-model.md`、`token-contract-v2.md`、`core-api.md`；`token-contract.md` 只作为 v1 legacy 迁移来源。 |
| Runtime、Bootstrap、持久化与动画 | `runtime-dom.md`、`persistence-bootstrap.md`、`transitions.md`。 |
| React / Vue API | `react-adapter.md`、`vue-adapter.md` 与对应 package root declaration。 |
| 基础色与官方预设 | `@oriatheme/colors` public exports、`preset-catalog.md`。 |
| 编辑器与 CLI | `theme-editor.md`、`editor-component-registry.md` 与公开 exports。 |
| 面向用户的现有流程 | `docs/guides/` 的中英文发布指南。 |

网站文档是面向使用者的发布内容，不替代上述规范。公开 API、持久化格式、Token Contract 或分发方式变更时，必须先更新相应规范，再在同一变更中同步网站内容与 API 参考。

## 维护顺序

1. **内容基础与壳层**：先维护文档内容模型、`/[locale]/docs` 及稳定 slug 路由、双语导航、桌面/窄屏目录、锚点和元数据。
2. **应用使用者主路径**：同步编辑器、可编辑样式、基础色、外观模式和预设页面，并保持编辑器路由互相链接。
3. **开发接入主路径**：同步快速开始、包选择、CSS 样式、Runtime、React、Vue、自定义主题和应用预设页面。
4. **编辑器、质量与 API**：同步 CLI/源码组件、性能/可访问性/排障，以及十一个包的 API 参考。
5. **内容验收**：逐页核对 package root exports、运行示例、双语链接、窄屏导航、键盘访问和静态/SSR 输出；没有证据的版本、兼容性或性能承诺不得写入。

## 完成标准

- 两类读者都能从文档首页在两次导航内到达各自的第一条可执行路径。
- “可编辑样式”完整覆盖颜色、排版、布局与形状、层次与材质、动效，并清楚标注 Light/Dark 或 shared 作用域。
- 每个公开包都有独立 API URL，所有代码只引用已发布 package root exports。
- 中英文页面有相同信息架构；语言切换、页内锚点、上一页/下一页和窄屏导航均可用。
- 静态/SSR 文档页不依赖浏览器全局对象；编辑器只通过其既有 client-only 入口加载。
- 文档链接、代码标识符和公开 API 均经过实现或声明核对；未验证内容明确标注或不发布。

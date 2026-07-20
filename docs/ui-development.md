# UI Development

本文件是 UI 开发的必读入口。先通过下方路由定位已有能力，再打开对应源码；在本文有效时不要重复扫描整个仓库。

## 技术栈

| 范围 | 选择 | 证据 |
|---|---|---|
| 框架 | React 19 + Vite、React 19 + Next 15、Vue 3 + Vite | `apps/examples/*/package.json` |
| 语言 | TypeScript / TSX / Vue SFC | 示例与 `registry/templates/` |
| 样式与主题 | 普通 CSS、`--oria-*` runtime token、`--oria-editor-*` chrome token | `theme-editor.css`、`docs/design/editor-ui.md` |
| 组件分发 | React/Vue 可见编辑器以 registry 源码组件分发；框架包保持 headless | `docs/specifications/editor-component-registry.md` |
| 图标 | 组件内统一的 24×24 轮廓 SVG | React/Vue registry toolbar、fields 与 overlays |
| 动效 | CSS transition/keyframes；直接操作由 Pointer Events / Pointer Capture 驱动 | `theme-editor.css`、React/Vue `LinearSlider` |
| 包管理 | pnpm 10 workspace | 根 `package.json`、`pnpm-workspace.yaml` |

## 全局约束

- `registry/templates/` 是官方可见 UI 源码真相；React/Vite 与 Next 示例内的已安装副本必须与 React 模板逐字同步，Vue 示例直接消费 Vue registry SFC 源码；两个 manifest 的 SHA-256 均必须刷新。
- React/Vue 编辑器 chrome 共用相同的 `data-oria-editor-*` hooks 和 framework-neutral `theme-editor.css`；两份模板样式必须逐字一致，并由 registry 回归防止漂移。
- 组件不得复制 editor-core 或 runtime 状态机；主题草稿、校验、原子预览、持久化和自定义主题生命周期只经公开 package exports。
- React 与 Vue 可见 UI 保持同等能力：Themes、类型化字段、Overlay、dirty 保护、受控模式与 appearance-following preview 的变化必须在两个框架同步评估。
- 使用语义 HTML、清晰焦点、44px 触控目标，并保留 reduced-motion、reduced-transparency 和 increased-contrast 降级。
- 不引入新的 UI、图标或 motion 依赖，除非现有原生/CSS 组件确有无法覆盖的能力缺口且先记录理由。
- SSR/静态页面必须在首次绘制前提供完整、经 Core 解析的默认主题变量；Storage bootstrap 只负责覆盖已保存偏好，runtime 在 client mount 后接管。默认关闭的源码编辑器及其 CSS 应按用户打开动作动态加载，避免进入首页初始 chunk。

## UI 架构

| 层 | 位置 | 规则 |
|---|---|---|
| 编辑器布局配置 | `registry/templates/shared/theme-editor/editor-layout.ts`、React/Vue 框架桥接文件 | shared 统一维护 Themes 与五个 token 分类；框架文件只桥接共享配置，不含领域规则 |
| React registry 组件 | `registry/templates/react/theme-editor/` | 官方 React 可见 UI 唯一模板真相 |
| Vue registry 组件 | `registry/templates/vue/theme-editor/` | 官方 Vue 可见 UI 模板真相，与 React 维护能力一致性 |
| 示例消费入口 | `apps/examples/react/src/components/oria-theme-editor/`、`apps/examples/next/app/components/oria-theme-editor/`、`apps/examples/vue/src/components/oria-theme-editor/theme-editor.ts` | React/Next 验证已安装副本；Vue 示例直接导出 registry SFC 以持续编译模板源码；均不成为新的模板真相 |
| Headless 桥接 | `packages/react-editor/`、`packages/vue-editor/` | Provider/hooks 或 provide/composables 与自动预览；无完整可见 UI |
| 领域与 runtime | `packages/editor-core/`、`packages/runtime-dom/` | 草稿、校验、预览、主题列表与持久化的唯一实现 |
| Host 页面 | `apps/examples/*` | 只组合 runtime、主题工作台和本地 `ThemeEditor`，不实现 token 字段 |
| 示例 Token gallery | `apps/examples/react/src/token-showcase.tsx`、`apps/examples/next/app/token-showcase.tsx`、`apps/examples/vue/src/token-showcase.ts`、`apps/examples/styles.css` | 框架私有展示组件；三端保持同一信息架构，所有随主题变化的视觉值只消费 `--oria-*`，静态基础色库只展示 `@oriatheme/colors` 的稳定值 |

示例页与编辑器中，颜色、字体、字重、字号、行高、字距、控件尺寸、圆角、阴影、模糊、渐变与动效均必须消费主题变量；仅布局结构尺寸和静态 `@oriatheme/colors` 色值展示可以保持非主题常量。页面选区必须通过 `::selection` 消费 `color.selection` / `color.selectionForeground`，可见状态样例不得只写 token 名而不实际应用变量。

## 文档路由

| 需要 | 阅读 |
|---|---|
| 查找现有可复用组件 | [UI 组件目录](ui/components/index.md) |
| 编辑器交互、响应式、动效和可访问性 | [主题编辑器 UI 设计](design/editor-ui.md) |
| 源码组件职责、安装与同步边界 | [编辑器源码组件注册表](specifications/editor-component-registry.md) |
| 草稿、保存、冲突和自动预览语义 | [主题编辑器规范](specifications/theme-editor.md) |
| Host 主题切换与自定义主题生命周期 | [主题模型](specifications/theme-model.md) 与 [DOM Runtime](specifications/runtime-dom.md) |

名称不确定时先按能力搜索：

```bash
rg -i "<component|capability|interaction>" docs/ui
```

## 组件选择顺序

1. 复用目录中已有组件。
2. 组合已有 primitive/pattern。
3. 仅在确有通用缺口时扩展现有组件。
4. 简单行为优先使用语义 HTML、框架原生能力与普通 CSS。

## 验证

| 检查 | 命令或流程 |
|---|---|
| 定向 registry 回归 | `pnpm --filter @oriatheme/editor-core test -- registry.test.ts` |
| React 示例类型/构建 | `pnpm --filter @oriatheme/example-react typecheck`、`pnpm --filter @oriatheme/example-react build` |
| Next 示例类型/构建 | `pnpm --filter @oriatheme/example-next typecheck`、`pnpm --filter @oriatheme/example-next build` |
| Vue 示例类型/构建 | `pnpm --filter @oriatheme/example-vue typecheck`、`pnpm --filter @oriatheme/example-vue build` |
| 全仓 | `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build` |
| 源码同步 | 比较 React registry 与 React/Next 已安装副本，编译 Vue registry SFC，并运行双 manifest hash 回归 |
| 视觉/交互 | React/Next/Vue 示例按变更范围检查宽屏、窄屏、键盘、焦点、折叠、模态、模式同步及 console |

## 维护约定

可复用 UI 能力、持久约束、依赖、规范路径或验证命令变化时，在同一任务更新本文或所属组件目录。页面私有片段、临时例外和完整 props 列表不进入目录。

# UI 组件目录

按语义能力搜索，而不是只按组件名搜索：

```bash
rg -i "<component|capability|interaction>" docs/ui
```

## 可复用组件

除表内特别标注外，每项同时包含 `registry/templates/react/theme-editor/` 下的 React 实现和 `registry/templates/vue/theme-editor/` 下同职责的 Vue SFC；表中的短路径以 React 文件名代表能力入口，Vue 使用对应 PascalCase 文件名。

| 组件 | 模板源码 | 用途与边界 | 状态 |
|---|---|---|---|
| `ThemeEditor` / `EditorShell` | `registry/templates/react/theme-editor/theme-editor.tsx`、`registry/templates/vue/theme-editor/ThemeEditor.vue` | 组合框架桥接、工具栏、导航、控制栏、工作区与确认流程；不实现字段或 runtime 状态机 | React/Vue 稳定 |
| `EditorToolbar` | `registry/templates/react/theme-editor/editor-toolbar.tsx` | 两层身份/草稿工具/提交操作，含名称、状态、关闭、重置、导入、导出和保存 | 稳定 |
| `EditorTabs` | `registry/templates/react/theme-editor/editor-tabs.tsx` | WAI-ARIA Tab 导航、键盘循环、问题计数 | 稳定 |
| `EditorSearch` | `registry/templates/react/theme-editor/editor-search.tsx` | 全局 token 搜索连续表面 | 稳定 |
| `EditorModeSwitch` | `registry/templates/react/theme-editor/editor-mode-switch.tsx` | 切换草稿 Light/Dark；可由 host 受控并与 runtime appearance 共用单一切换/过渡入口 | 稳定 |
| `EditorWorkspace` / `TokenAccordion` | `registry/templates/react/theme-editor/editor-workspace.tsx`、`token-accordion.tsx` | Contract 分组、搜索过滤、默认展开且可独立折叠的 token 面板 | 稳定 |
| `ThemesWorkspace` / `ThemeAccordion` / `ThemeListItem` | React `themes-workspace.tsx` / Vue `ThemesWorkspace.vue` 及相邻组件 | Runtime 主题列表与 custom/preset 生命周期操作；复制后载入 session 并进入 Colors，不复制持久化状态机 | React/Vue 稳定 |
| `TokenField` 与 `fields/*` | `registry/templates/react/theme-editor/token-field.tsx`、`fields/` | 按 editor-core 字段类型路由到颜色、尺寸、数值、字体、时长、曲线、阴影、渐变和图案控件；Pattern 为 background/surface 提供安全的有序 dot/stripe/grid/noise 图层、受控 Paper/Film/Frosted 颗粒参数、添加/删除/排序和 Create / Unset，并按容器宽度重排控件 | 稳定 |
| `BaseColorPalette` | `registry/templates/react/theme-editor/fields/base-color-palette.tsx` | 锚定、无遮罩、可搜索的基础色 popover；只返回安全色值 | 稳定 |
| `LinearSlider` | `registry/templates/react/theme-editor/fields/linear-slider.tsx` | Pointer Capture、逐帧提交和键盘步进的统一滑块 | 稳定 |
| `EditorSelect` | React `fields/editor-select.tsx` / Vue `fields/EditorSelect.vue` | 带原生键盘语义的统一下拉框 chrome | 稳定高度、主题化边框、无障碍焦点、指示箭头；供 Gradient 与 Pattern 的 Type、Style 和 Add layer 选择使用 |
| `ConfirmationDialog` | `registry/templates/react/theme-editor/overlays/confirmation-dialog.tsx` | 重置、dirty 离开和破坏性操作的可访问确认模态 | 稳定 |
| `ResetMenu` / `ImportDialog` / `ExportMenu` / `IssuesPopover` | `registry/templates/react/theme-editor/overlays/` | 锚定菜单、文件卡片与粘贴式原子导入、`.oria-theme.json` 下载、Save 左侧三态校验反馈与问题导航；浮层消费 Overlay / Overlay foreground + background blur，不得绕过 session/Core | 稳定 |
| `ShadowLayerEditor` / `ShadowPreview` | `registry/templates/react/theme-editor/shadows/` | 多层阴影的结构化编辑与预览 | 稳定 |

## 共享规则

- 新能力先组合上述组件；领域专用列表应留在编辑器 feature 内，不膨胀为跨项目 primitive。
- React 模板变更后同步 React/Vite 与 Next 副本；跨框架能力变化同时检查 Vue 对应组件，并刷新 React/Vue 两个 manifest。
- 每个可复用组件只在本目录记录一次；完整 props 以源码类型为准。

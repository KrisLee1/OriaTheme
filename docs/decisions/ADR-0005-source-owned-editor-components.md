# ADR-0005：编辑器 UI 以用户持有的源码组件分发

- 状态：Accepted
- 日期：2026-07-18
- 替代范围：取代 ADR-0003 中“React/Vue 完整可视 UI 通过 npm 包分发”的部分；共享 `editor-core` 与独立框架桥接的决定仍有效。

## 背景

编辑器新 UI 包含顶部工具栏、分类 Tab、搜索、Accordion、九类 token 字段、智能阶梯、导入/导出浮层和响应式预览。这些可见组件与消费应用的布局、文案、图标、原子组件和品牌样式高度相关。

如果只把完整 UI 藏在 `node_modules` 的单一黑盒组件中，用户只能通过 props 和 CSS override 间接修改，也容易让仓库实现演变为一个巨大的页面或组件文件。用户要求使用与 shadcn/ui 类似的源码所有权模式：安装后的可见组件位于用户项目源码目录，而不是 `node_modules` 中。

## 决定

1. `@oriatheme/editor-core` 继续作为可发布的无框架领域包，拥有草稿、验证、诊断、导入导出、重置和保存冲突规则。
2. `@oriatheme/react-editor` 与 `@oriatheme/vue-editor` 收敛为无业务样式的框架桥接包，只导出 Provider/provide、hooks/composables、自动预览协调和类型。目标发布面不包含完整可视 `OriaThemeEditor` 或默认 UI CSS。
3. React 和 Vue 的可见 UI 作为 OriaTheme 源码组件注册表项维护。用户通过一次性 `@oriatheme/cli` 命令将组件、hooks/composables、辅助函数和样式复制到自己的 `components/oria-theme-editor/` 目录。
4. 注册表组件必须按职责拆分；路由/页面文件只创建 runtime/session 配置并组合 `<ThemeEditor />`，不实现工具栏、token 列表、字段控件或导入导出流程。
5. 官方 React/Vue 注册表模板共享 `editor-core` 的字段描述和纯函数，不复制领域状态机。用户复制后可自由修改可见 UI，但验证、安全 CSS 编译和 runtime 原子提交仍只能经过公开包 API。
6. 现有 React/Vue 完整 UI 实现尚未实际发布到 npm；在首次对外发布前迁移为上述模式，因此不保留默认黑盒 UI 作为长期公开 API。

## 替代方案

- 继续发布完整 React/Vue UI 包：安装简单，但用户无法直接拥有或重组源码，不符合本次要求。
- 把领域逻辑也全部复制到用户项目：用户所有权最强，但会分叉安全验证、持久化和冲突规则。
- 只提供一个巨型组件源文件：表面上也属于用户，但无法独立替换字段、工具栏或浮层，维护性不达标。
- 只提供手工复制粘贴文档：不需要 CLI，但缺少文件完整性、依赖、冲突和更新检查。

## 影响

- 用户可在自己的 Git 中查看、修改、评审和版本化编辑器 UI。
- 公开分发面新增 `@oriatheme/cli` 和静态组件注册表；CLI 只是开发时工具，不成为消费应用的 runtime 依赖。
- 可见 UI 的升级不能自动覆盖用户修改；CLI 必须先给出 diff，只有显式 `--overwrite` 才能替换文件。
- 需要新增注册表 manifest、路径安全、无隐式脚本、React/Vue 独立消费构建和“页面不包含编辑器实现”的验收。
- 源码模板的对外许可证已确定为 Apache-2.0，并由 CLI 安装到组件目录的完整 `LICENSE` 交付；官方 registry URL 仍须在公开发布前确定。本地注册表、CLI 和消费验证不被该部署决定阻塞。

## 迁移

1. 把框架包内的 session 所有权、订阅和自动预览能力收敛为 headless exports。
2. 建立 React/Vue 注册表模板和共享 manifest，将现有可见 UI 拆分为可复用组件。
3. 实现 `@oriatheme/cli add theme-editor`、dry-run、diff、冲突和路径安全规则。
4. 示例与官网从注册表安装并提交组件源码，只通过公开包 exports 消费领域/runtime 能力。
5. 在首次 npm/registry 发布前更新 Changesets、用户指南、独立消费 smoke test 和源码许可说明。

# 测试策略

## Core

- Contract：非法 path、重复 token、类型覆盖、默认值和扩展合并。
- 每种 token type 的有效/无效值与 CSS 编译。
- 结构化 pattern：只接受已注册的类型、静态/引用颜色和正 dimension；编译为完整可叠加背景 layer，未设置时不输出变量。
- 引用：直接、链式、缺失、类型不匹配、直接/间接循环。
- Theme schema、normalize、clone、import/export、contract mismatch。
- Seed 生成确定性和对比度诊断。
- 所有官方 preset 完整性、唯一 ID 与正文 WCAG AA。
- 预设目录元数据完整、分类/描述可发现、具名导出与集合一致；品牌工作名称完成发布复核。

## Colors

- 26 个颜色家族 × 11 个阶梯与 inherit/current/transparent/black/white 完整、命名稳定、值可被 CSS 使用。
- `styles.css` 与 `tailwind.css` exports、变量数量和映射完整。
- 使用官方 Tailwind v4 CLI 真实编译 `bg-red-500`、`text-sky-300`、border、gradient、fill 等标准颜色类名。
- Core、Runtime 和 ThemeDefinition 不包含或注入静态基础色库。
- 结构化 Pattern 覆盖 1–8 个有序 dot、stripe、grid、noise 图层、0–360° angle、安全颜色/引用、正尺寸、受控 Paper/Film/Frosted variant、0–1 intensity 及 browser-valid CSS layer；Paper 回归应断言确定性纤维、杂点和低强度底纹标记，Film/Frosted 继续断言各自 `feTurbulence` profile；非法值不得产生部分 stylesheet。

## Runtime DOM

- start/destroy 幂等和资源清理。
- LocalStorage rehydrate、损坏数据回退、写入失败。
- system 监听、跨标签页同步、preview/dispose。
- Constructable Stylesheet 与 style fallback。
- 原子回滚、相同状态去重、快速连续切换最终一致。
- Document 与 ShadowRoot target。
- reduced motion 与 View Transition fallback。

## React

- Provider 生命周期和 runtime 所有权。
- `useSyncExternalStore` 更新与 selector 重渲染。
- Provider 外错误。
- SSR-safe import 和 Next.js production build。

## Vue

- Plugin/provide 注入和 shallowRef 更新。
- app 卸载清理、未注入错误、tree-shaking。
- SSR-safe import。

## Editor Core

- 草稿初始化、light/dark token 编辑、重置/放弃、dirty 状态与字段级问题映射。
- preset 必须先复制为 custom；非法或不完整草稿不得提交。
- 外部 runtime 版本冲突不得静默覆盖。
- Node 环境 import 不访问 DOM、Storage、React 或 Vue。

## Editor Bridges 与源码组件

- React/Vue headless bridge 对相同 editor-core 命令产生等价主题结果，不复制领域状态机。
- 自动预览启动/dispose、最新 revision 去过期、显式保存、导入导出、错误与焦点恢复。
- 键盘、标签/错误关联、可见焦点、非色彩状态提示和 reduced motion。
- React selector/render 与 Vue shallow reactive 更新满足 Phase 7 固化的性能基线。
- 框架桥接 tarball 不包含完整可视 UI 或默认 UI CSS；package-root import、types 和 tree-shaking 通过。
- React/Vue registry item 的每个 token field、Toolbar、Tabs、Accordion、Shadow、Overlay 和 Preview 保持多文件可替换边界，不回退为单页面实现。

## Editor Registry 与 CLI

- Manifest schema、framework、兼容版本、文件数量/大小限制和 SHA-256 校验。
- 绝对路径、`..` 路径穿越、项目根越界和 registry script 全部拒绝。
- `--dry-run` 不写入；已有文件默认拒绝；`diff` 区分本地/上游/双方修改；只有 `--overwrite` 可覆盖。
- 独立 React、Vue 和 Next 项目通过 CLI 安装，可见 UI 文件位于项目源码且 production build 通过。
- React item 不引入 Vue，Vue item 不引入 React。
- CLI 对带 `packageManager: pnpm|npm|yarn|bun` 的项目保留原字段、scripts 与既有依赖，只合并 manifest 依赖，不生成 `pnpm-lock.yaml`、`package-lock.json`、`yarn.lock`、`bun.lock` 或 `bun.lockb`。

## Website

- 首页与文档 SSR/静态生成，编辑器 client-only hydration。
- 首页、文档、在线编辑器关键路由 production build 与 HTTP 验证。
- 从 preset 创建 custom 草稿、编辑、诊断、预览、导入和导出浏览器 E2E。
- 官网只用公开 package exports，且 private app 不进入 pack/publish。
- 官网在线编辑器从已提交的本地 registry 组件导入；路由文件不包含字段 renderer、token map 或编辑器 CSS。
- 关键页面键盘、语义、焦点、对比度和 reduced-motion 验收。

## 发布 Smoke Test

测试必须从 pack 产生的 tarball 安装，不能直接引用 workspace source。产物可由仓库规定的 pnpm 命令生成，但消费安装必须分别覆盖 pnpm、npm、Yarn 与 Bun：

1. 最小 React 应用安装并构建。
2. 最小 Vue 应用安装并构建。
3. 最小 Next.js 应用 production build。
4. 验证类型、package exports、切换、持久化和 bootstrap。
5. 四种工具分别验证 package install、CLI dry-run/add/diff 与自己的 lockfile；Yarn 同时验证 node-modules linker 和 Plug'n'Play。

Phase 8 起必须分别安装 React/Vue headless bridge tarball，并用 CLI 将对应 registry item 写入独立消费项目；同时验证不会拉入另一框架。pnpm/npm/Yarn/Bun 的结果必须分开记录，未安装在当前环境的工具不得通过静态推断记为成功。官网是私有应用，只执行 workspace production build 和浏览器验证，不执行 npm pack。

## 记录规则

- 日志记录实际命令、pass/fail、测试数量和失败摘要。
- “未执行”不能写为通过。
- 修复缺陷必须先添加或同步添加回归测试。
- Phase 验收执行完整命令；开发中可运行过滤测试。

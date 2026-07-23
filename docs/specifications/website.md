# OriaTheme 官网规范

## 产品边界

官网位于 `apps/website`，是 workspace 中的私有应用，`package.json` 必须设置 `private: true`，不得加入 Changesets 发布清单或 npm pack 流程。现有 `apps/docs` 的内容在 Phase 9 迁入官网后移除重复入口。

官网使用 React/Next.js，并且只能在首个公开 OriaTheme 发行版已实际发布后开始实现。`apps/website` 的 OriaTheme 依赖必须解析为该发行版的普通 semver 版本；不得使用 `workspace:*`、链接 workspace 包或 `packages/*/src`。在线编辑器的可见 UI 必须通过已发布 CLI 指向的官方 registry 安装并提交到本地组件目录；这些组件只通过已发布公开 package root exports 消费 OriaTheme，不得从 `registry/templates/*` 直接深层导入。这样同时验证发布包、CLI/registry 安装和用户所有的组件消费路径。

## 信息架构

### 首页

- 清楚说明 OriaTheme 的定位、核心能力、支持框架和安装入口；
- 展示官方预设主题及 light/dark/system 切换；
- 链接文档和在线编辑器；
- 不声称尚未发布、尚未验证或不在路线中的能力。

### 文档

- 提供快速开始、Core、Runtime DOM、React、Vue、预设主题、主题编辑器、自定义主题、迁移和可访问性内容；
- API 示例必须来自公开 exports，并与仓库规范和实际版本一致；
- 文档页面可被直接链接、具备基础搜索或清晰导航，并在窄屏可用。
- 用户/开发者分流、稳定 URL、可编辑样式范围、API 参考模板与实施顺序见[官网文档页面计划](../design/website-documentation.md)。

### 在线主题编辑器

- 使用 `@oriatheme/cli` 安装 React `theme-editor` registry item，页面只组合本地 `ThemeEditor`；不得在路由文件中实现全部编辑器，也不得另写官网专用编辑状态机；
- 官网内的 Toolbar、Tabs、Search、Field、Scale、Shadow、Overlay 和 Preview 保持可复用组件文件，不合并回页面文件；
- 可从官方预设创建 custom 草稿，编辑 light/dark token，实时预览、校验、导入和导出；
- 默认仅在浏览器本地运行，不上传主题内容；若未来增加服务端存储，必须另立安全与隐私规范；
- 预览模板可以展示文档、表单、卡片和数据密集场景，但不得让用户误以为主题会改变应用结构。

## 质量要求

- 首页和文档内容支持服务端渲染或静态生成；编辑器作为 client-only 区域加载。
- 模块顶层 SSR 导入安全，生产构建无浏览器全局错误。
- 关键页面满足键盘导航、可见焦点、语义标题、颜色对比和 reduced-motion 要求。
- 预设缩略图和编辑器等重内容延迟加载；具体性能预算在 Phase 9 实现开始时基于选定部署环境固化。
- 官网 production build 必须使用已复制的本地组件源码，不依赖运行时远程 registry；其 lockfile 必须将 OriaTheme 解析到已发布发行版，另以仓库外干净项目验证该解析不回退到 workspace link。
- 提供页面元数据、站点地图和稳定 URL；自定义域名、托管平台、分析与错误监控方案标记为部署配置，不进入 npm 包。

## 非目标

- 官网不作为 npm 包发布。
- 首版不包含账号系统、云端保存、主题市场、付费功能或用户内容托管。
- 官网不成为规范唯一来源；仓库 `docs/` 仍是实现规范的权威来源，官网文档是面向用户的发布内容。

## 部署状态与待定项

- `TBD-WEB-01`：正式产品域名已确定为 `https://theme.oria.org.cn`，托管平台确定为 Cloudflare Pages，与官方 registry 复用同一 Pages 项目的 git 自动部署：Pages 构建命令为 `pnpm build:site`，输出目录为 `dist/site`（官网 Next.js 静态导出位于根路径，registry 位于 `/registry/v1`，两者同源保持 registry 基地址稳定）。
- `TBD-WEB-02`：是否启用隐私友好的访问分析。默认不启用；启用前必须补充隐私披露和数据边界。
- 官方组件 registry 基地址为 `https://theme.oria.org.cn/registry/v1`；它已完成 HTTPS 静态部署，并在 Phase 8 的仓库外干净项目完成 `add` / `diff` 验证。后续 registry 变更仍必须由 `pnpm build:registry` 生成部署产物，并重新执行远程验证。

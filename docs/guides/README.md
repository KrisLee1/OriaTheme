# OriaTheme 使用指南

[English](en/README.md)

这里是面向 OriaTheme 使用者和贡献者的公开发布文档入口。中文是主要维护语言；每篇发布指南都提供对应英文版本。

> 发布状态：十个公开 `@oriatheme/*` 包已发布 `0.1.0`，公开 HTTPS registry 已完成验证。文档中的 pnpm/npm/Yarn/Bun 安装与临时执行命令可用于使用方项目。

## 从这里开始

| 目标 | 中文 | English |
| --- | --- | --- |
| 在 React、Vue 或原生 Web 应用中完成第一次主题切换 | [快速开始](quick-start.md) | [Quick start](en/quick-start.md) |
| 选择正确的包和公开入口 | [包与公开入口](packages.md) | [Packages and public entry points](en/packages.md) |
| 使用 pnpm、npm、Yarn 或 Bun 安装和运行 CLI | [包管理器兼容性](package-managers.md) | [Package-manager compatibility](en/package-managers.md) |
| 在本仓库开发、测试和构建 | [开发者指南](development.md) | [Developer guide](en/development.md) |
| 定位安装、首屏、样式和 CLI 问题 | [故障排查](troubleshooting.md) | [Troubleshooting](en/troubleshooting.md) |

## 集成专题

| 主题 | 中文 | English |
| --- | --- | --- |
| 首屏恢复与 Next.js | [Bootstrap](bootstrap.md) | [Bootstrap](en/bootstrap.md) |
| CSS Variables 与 Tailwind | [组件样式](component-styling.md) | [Component styling](en/component-styling.md) |
| 圆形主题扩散 | [View Transition](circular-theme-transition.md) | [View Transition](en/circular-theme-transition.md) |
| 自定义主题生命周期 | [自定义主题](custom-themes.md) | [Custom themes](en/custom-themes.md) |
| React/Vue 源码编辑器 | [主题编辑器](theme-editors.md) | [Theme editors](en/theme-editors.md) |
| SSR 与编辑器拆包 | [性能集成](performance.md) | [Performance integration](en/performance.md) |
| 版本与持久化兼容 | [迁移](migrations.md) | [Migrations](en/migrations.md) |

## 信息来源

- 用户 API 以各 package root export 和 TypeScript 声明为准，禁止依赖 `dist/` 或源码深层路径。
- Token、Runtime、框架适配器和编辑器规范分别见[主题模型](../specifications/theme-model.md)、[Core API](../specifications/core-api.md)、[DOM Runtime](../specifications/runtime-dom.md)和[编辑器组件注册表](../specifications/editor-component-registry.md)。
- 构建、测试与发布门禁见[开发者指南](development.md)和[构建与发布规范](../engineering/packaging.md)。
- 使用方请从 npm 安装 `0.1.0` 公开包；workspace 和本地 tarball 仅用于仓库开发或后续版本发布验证。

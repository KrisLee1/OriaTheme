# OriaTheme guides

[中文](../README.md)

This is the public release-documentation entry point for OriaTheme users and contributors. Chinese is the primary maintenance language, and every release guide has a corresponding English document.

> Release status: all eleven public `@oriatheme/*` packages are published on npm (versions evolve independently; see npm for the latest), and the public HTTPS registry is verified. The current default standard is `oria-standard@2`. The documented pnpm/npm/Yarn/Bun installation and temporary-runner commands are available to consumer projects.

## Start here

| Goal | English | 中文 |
| --- | --- | --- |
| Complete the first theme switch in React, Vue, or a framework-free web app | [Quick start](quick-start.md) | [快速开始](../quick-start.md) |
| Choose the correct package and public entry point | [Packages and public entry points](packages.md) | [包与公开入口](../packages.md) |
| Install and run the CLI with pnpm, npm, Yarn, or Bun | [Package-manager compatibility](package-managers.md) | [包管理器兼容性](../package-managers.md) |
| Develop, test, and build this repository | [Developer guide](development.md) | [开发者指南](../development.md) |
| Understand the architecture, package boundaries, and runtime flows | [Principles and architecture](architecture.md) | [原理与架构](../architecture.md) |
| Diagnose installation, first-paint, styling, and CLI problems | [Troubleshooting](troubleshooting.md) | [故障排查](../troubleshooting.md) |

## Integration topics

| Topic | English | 中文 |
| --- | --- | --- |
| First-paint restoration and Next.js | [Bootstrap](bootstrap.md) | [Bootstrap](../bootstrap.md) |
| CSS Variables and Tailwind | [Component styling](component-styling.md) | [组件样式](../component-styling.md) |
| Circular theme reveal | [View Transition](circular-theme-transition.md) | [View Transition](../circular-theme-transition.md) |
| Custom-theme lifecycle | [Custom themes](custom-themes.md) | [自定义主题](../custom-themes.md) |
| React/Vue source-owned editor | [Theme editors](theme-editors.md) | [主题编辑器](../theme-editors.md) |
| SSR and editor code splitting | [Performance integration](performance.md) | [性能集成](../performance.md) |
| Version and persistence compatibility | [Migrations](migrations.md) | [迁移](../migrations.md) |

## Sources of truth

- User APIs are defined by package-root exports and TypeScript declarations. Do not import `dist/` or deep source paths.
- Token, runtime, adapter, and editor specifications are covered by the [theme model](../../specifications/theme-model.md), [Core API](../../specifications/core-api.md), [DOM runtime](../../specifications/runtime-dom.md), and [editor component registry](../../specifications/editor-component-registry.md).
- Build, test, and release gates are covered by the [developer guide](development.md) and [packaging specification](../../engineering/packaging.md).
- Consumers should install the published packages from npm (see npm for the latest versions); workspace and local-tarball paths are for repository development or future-release verification only.

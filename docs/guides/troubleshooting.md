# 故障排查

[English](en/troubleshooting.md) · [指南首页](README.md)

先确认应用只使用公开 package root exports，并且 `defaultThemeId` 确实存在于传给 runtime 的 `presets` 中。OriaTheme 对非法主题采用完整拒绝和原子回退，不会部分应用。

## registry 找不到 `@oriatheme/*`

确认包名与已发布的最新 `@oriatheme/*` 版本，并检查使用方项目配置的 npm registry、网络和 lockfile。公开 package root exports 必须从 npm 安装；本地 workspace link 不能代表实际 registry 消费。

## 页面没有 `--oria-*` variables

检查以下条件：

1. `presets` 中包含 `defaultThemeId`。
2. 原生 runtime 已调用 `runtime.start()`；React Provider 或 Vue plugin 已实际挂载。
3. `target` 是当前页面的 `Document` 或正确的 `ShadowRoot`。
4. `onError` / `snapshot.error` 没有报告 `DOM_APPLY_FAILED` 或 `INVALID_THEME`。
5. CSS 使用的是已注册变量名，而不是手写的猜测路径。

运行时正常启动后，目标根节点应出现 `data-oria-theme`、`data-oria-mode` 和 `color-scheme`。

## 刷新后短暂显示错误主题

- Vite SPA：在 `createRoot()` / `createApp()` 前调用 `bootstrapTheme()`。
- SSR/SSG/Next：先输出由可信默认主题经 Core 解析得到的完整静态变量，再在 `<head>` 执行 `createBootstrapStorageScript()`。
- `storageKey`、`variablePrefix`、contract 与目标节点必须在静态 fallback、Bootstrap 和 runtime 之间一致。
- `storage: false` 或自定义 `ThemeStorage` 不会自动产生默认 LocalStorage active snapshot。

完整流程见 [Bootstrap](bootstrap.md) 和[性能集成](performance.md)。

## Next.js 报 hydration mismatch

Bootstrap 会在 hydration 前修改 `<html>` 的主题属性。只在该 `<html>` 节点使用 `suppressHydrationWarning`；不要扩大到 `<body>` 或页面子树。若页面内容仍不匹配，应按普通 hydration 错误排查，而不是继续增加 suppression。

## 主题切换了，但组件样式不变

- 确认组件引用 `var(--oria-...)`，而不是把旧值复制成静态颜色。
- Tailwind 语义类需要通过 `@theme inline` 映射到 OriaTheme variables；可直接使用 `@oriatheme/tailwind` 的预构建 bridge 或 `oria theme tailwind-bridge` 生成的映射。
- `@oriatheme/colors/styles.css` 是静态基础色，不会随主题切换；这是预期行为。
- 不要用运行时主题值拼接 Tailwind class name，构建器无法可靠扫描动态类。

见[组件样式指南](component-styling.md)。

## `setTheme()` 没有效果或进入 error 状态

`setTheme(id)` 只接受 preset 或已保存 custom theme 的 ID。不存在的 ID 会报告 `THEME_NOT_FOUND`。编辑中的草稿应通过 `previewTheme()` 或 editor-core 预览；验证成功后再创建/更新 custom theme。

显示错误时优先使用 `OriaThemeError.code` 和 validation issues，不依赖英文错误文案。

## `system` 模式刷新后像被保存成 light/dark

持久化值应是 `appearance: "system"`；`resolvedMode` 只是当前系统偏好的解析结果，不应作为用户偏好保存。若自定义 Storage 记录了 `resolvedMode`，请调整为 Runtime 的 `PersistedThemeStateV1` 结构。

## CLI 只显示计划，没有写文件

这是默认安全行为。`add` 无 `--yes` 时退出码为 2，并显示：

```text
No changes written. Re-run with --yes to confirm this plan.
```

先用 `--dry-run` 检查计划，再显式确认：

下面以 pnpm 为例；npm、Yarn、Bun runner 见[包管理器兼容性](package-managers.md)。

```bash
pnpm dlx @oriatheme/cli@latest add theme-editor --framework react --dry-run
pnpm dlx @oriatheme/cli@latest add theme-editor --framework react --yes
```

这些临时 runner 命令可用于已发布的 `@oriatheme/cli`（`@latest` 标签）。仓库内调试 CLI 的本地路径见[开发者指南](development.md#cli-与-registry-开发)。

## CLI 拒绝覆盖文件

已有目标文件默认是冲突。先查看差异：

```bash
pnpm dlx @oriatheme/cli@latest diff theme-editor --framework react
```

手工合并是首选。只有确认放弃本地修改时才在 `add` 中加入 `--overwrite --yes`。CLI 还会拒绝绝对路径、`..`、反斜杠路径、项目根越界、符号链接目标、HTTP registry、hash 不匹配和包含 scripts 的 manifest；不要绕过这些检查。

## `diff` 提示找不到安装记录

`diff` 依赖第一次成功安装生成的 `.oria/components.json`。确认：

- 命令在含 `package.json` 的使用方项目内运行；
- `--framework react|vue` 与最初安装一致；
- `.oria/components.json` 已提交或仍存在且 JSON 有效；
- 自定义 `--path` / `--registry` 与安装来源一致。

## View Transition 没有动画

必须同时在 runtime 配置中启用 `transition`，并在明确的用户操作中传入 `animate: true`。不支持 `document.startViewTransition`、用户偏好 reduced motion、Bootstrap、Storage 恢复、system 变化和跨标签页同步都会直接原子切换。见[圆形主题扩散](circular-theme-transition.md)。

## 仍无法定位

在最小复现中记录：package 版本、框架版本、runtime config（移除敏感信息）、`snapshot.status`、`snapshot.error.code`、复现命令和浏览器/Node 输出。当前仓库未建立公开支持 SLA 或安全联系地址，不要在发布材料中承诺响应时间。

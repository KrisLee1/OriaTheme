# 迁移与兼容性

[English](en/migrations.md) · [指南首页](README.md)

v1 使用三个独立版本：npm package version、theme `schemaVersion` 和 Token Contract version。持久化 state 的 `schemaVersion` 也独立演进。

- theme `schemaVersion: 1` 只接受 v1 序列化格式；未知版本安全回退。
- 主题的 contract name/version 必须与运行时已注册 contract 一致。需要迁移时，将显式 `migrate` 函数传给 import API；禁止静默丢弃 token。
- LocalStorage 损坏、无效 active theme、不可验证 custom theme 和写入失败均不会阻止内存状态继续工作。
- active snapshot 仅用于首屏变量；正式 runtime 启动后以主状态和 contract 重新验证。

从早期未版本化实现迁移时，先将原始数据转换为 `ThemeDefinition`，调用 `validateTheme()`，再通过 `importTheme()` 或 `createCustomTheme()` 保存。不要持久化 `resolvedMode`：只持久化 `appearance`。

## 0.1.0 → 下一版本：Document Canvas 更名

- `oria-document-canvas` 更名为 `oria-manuscript`（Manuscript），具名导出 `oriaDocumentCanvasTheme` 同步改为 `oriaManuscriptTheme`；token 数据不变（ADR-0016）。
- 使用方需把 import 与按 ID 的引用（`defaultThemeId`、`setTheme` 等）改为新名称；没有其他代码变化。
- 最终用户无需操作：曾选择 Document Canvas 的持久化偏好在升级后按 runtime 既有语义回退默认主题，重新选择 Manuscript 即可。

# ADR-0016：Manuscript 预设 ID 与具名导出更名

- 状态：Accepted
- 日期：2026-07-21

## 背景

`oria-document-canvas` 在石墨化重设计后，冷灰纸页、石墨控制、等宽标题的气质更接近"文稿"而非"文档画布"，维护者先将显示名改为 Manuscript，随后要求稳定 ID 同步。既有规范（主题模型：官方显示名称更正不得改变主题 ID、具名导出或 token 数据）把 ID 稳定性视为默认规则，因此 ID 更名需要一个显式例外决策。

主题 ID 同时是运行时持久化选择（`activeThemeId`）、首屏 bootstrap 快照与编辑器草稿身份（`<preset-id>-editor`）的一部分；具名导出 `oriaDocumentCanvasTheme` 是公开 API。更名会使引用旧 ID 的持久化偏好失效，并让导入旧具名导出的使用方代码编译失败。

## 决定

1. 预设 ID 由 `oria-document-canvas` 更名为 `oria-manuscript`，具名导出同步为 `oriaManuscriptTheme`；显示名 Manuscript、category（brand-product）与全部 token 数据不变。
2. 不提供兼容别名或 ID 迁移映射：引用旧 ID 的持久化 `activeThemeId` 与 bootstrap 快照按 runtime 既有"未知主题回退默认主题"语义处理；使用方需在升级时改用新具名导出。这与 ADR-0011 确立的 pre-1.0 干净断裂、不维护兼容层的惯例一致。
3. 该更名随 `@oriatheme/presets` 的下一个 minor 版本发布，Changeset 与迁移指南明确标注破坏性；主题模型规范的 ID 稳定性规则改写为"更名是需 ADR 批准的例外事件"，本 ADR 是当前唯一实例。
4. 预设更名不触发 schemaVersion、`oria-standard@1` contract version 或持久化 state schema 变化。

## 替代方案

- 只改显示名、保留 `oria-document-canvas`：长期让名称与 ID 脱节，违背本次更名的初衷；维护者已明确要求同步。
- 在 runtime/storage 增加旧 ID → 新 ID 的迁移映射：为单个预设引入持久化迁移机制，复杂度和先例成本远超收益；回退默认主题的行为已安全。
- 保留 `oriaDocumentCanvasTheme` 作为废弃别名：与 ADR-0011 的干净断裂惯例冲突，且 0.x 阶段整理 API 表面的成本最低。

## 影响

- 破坏性（`@oriatheme/presets` minor）：`oriaDocumentCanvasTheme` 导出移除；`oria-manuscript` 取代 `oria-document-canvas` 成为唯一有效 ID；引用旧 ID 的持久化选择静默回退到默认主题，不产生运行时错误。
- 编辑器从 Manuscript 创建的草稿身份自动使用 `oria-manuscript-editor[-n]`；既有 `oria-document-canvas-editor*` custom theme 是独立 custom，不受影响。
- 预设目录规范、主题模型规范与迁移指南已同步；预设总数与预览顺序（Default、Manuscript、Mono～Memphis 组、其余原序）不变。

## 迁移

- 使用方把 `oriaDocumentCanvasTheme` 的 import 改为 `oriaManuscriptTheme`；按 ID 引用该主题的地方（如 `defaultThemeId`、`setTheme`）改用 `oria-manuscript`。
- 最终用户无需操作：曾在 0.1.0 选择 Document Canvas 的用户升级后回到默认主题，可重新选择 Manuscript。

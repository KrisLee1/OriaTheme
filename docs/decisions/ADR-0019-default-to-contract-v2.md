# ADR-0019：以 Contract v2 为默认且唯一的标准设计

- 状态：Accepted
- 日期：2026-07-24

## 背景

ADR-0017 引入 `oria-standard@2` 时决定 v2 以独立 contract version、独立导出（`oriaStandardContractV2`、`oriaDefaultThemeV2`、`oriaPresetThemesV2`）与显式 migration 并存，默认切换留待后续决策。Phase 10 实施期间出现了两个必须解决的事实：

1. 由 v1 主题经运行时迁移派生 v2 预设让每次页面加载都为 41 款预设支付迁移成本（优化前 546ms 模块求值）。
2. v1/v2 双轨导出让 Core、Presets、Editor Core、模板与示例长期携带两套命名，维护与使用成本持续存在。

维护者决定：代码中不再区分 v2 变体，全面使用新版本设计。

## 决定

1. `oria-standard@2` 成为默认且唯一的标准 Contract：`oriaStandardContract` 即 v2（134 个 source token、kebab-case CSS 输出、声明式派生变量）；Runtime、Editor Core、`resolveTheme()` 与 `createThemeFromSeed()` 的默认 contract 均为 v2。
2. 官方预设与默认主题直接以 v2 定义：`@oriatheme/presets` 的全部导出（`oriaPresetThemes`、具名导出、`oriaPresetCatalog`）与 Core 的 `oriaDefaultTheme` 都是 v2 主题；不再提供 v1 官方预设，移除 `oriaPresetThemesV2` 导出与全部 v1→v2 派生路径。预设从 spec 数据纯对象组装，模块求值不执行迁移或解析（presets 模块求值 546.1ms → 21.5ms，Core 默认主题为纯数据派生）。
3. v1 仅以 legacy 形式保留为迁移输入：`oriaStandardContractV1` 与 `oriaDefaultThemeV1` 继续导出，`migrateOriaStandardV1ToV2()` 仍是接受 v1 custom theme（持久化恢复、JSON 导入）的唯一路径，且必须显式注册；v1 Bootstrap snapshot 仍被 v2 拒绝。
4. registry React/Vue 编辑器模板（item `0.2.0`）按 v2 渲染，使用 `describeTokenContract()` 默认 contract，不再引用版本化导出。

## 替代方案

- 保持双轨导出、由使用方显式选择：沿用至今的方案，但双套命名长期存在，且预设迁移成本无法从使用方启动路径中移除。
- 构建期内联全部 v2 预设 JSON：消除求值成本但把约 90KB 的 spec 驱动紧凑产物变成约 1MB 静态数据，包体回退不可接受。
- 同时下线 v1 contract 与迁移器：已发布的 v1 主题格式仍在用户 Storage 与导出文件中存在，静默丢弃不可接受。

## 影响

- Core 公开导出更名：`oriaStandardContractV2` → `oriaStandardContract`、`oriaDefaultThemeV2` → `oriaDefaultTheme`；新增 legacy 导出 `oriaStandardContractV1`、`oriaDefaultThemeV1`；`migrateOriaStandardV1ToV2` 名称不变。
- Presets 公开导出更名：`oriaPresetThemesV2` 移除；`oriaPresetThemes`/具名导出/`oriaPresetCatalog` 变为 v2 主题；包再导出由 `oriaDefaultTheme` 改为 `oriaDefaultThemeV2`（经 core 转名为 `oriaDefaultTheme`）。
- 默认行为变化：不传 contract 的 Runtime/`resolveTheme()` 现在解析 v2；v1 主题（含 v1 官方预设）在默认配置下被拒绝，必须显式迁移。
- 这是明确的 breaking change：发布必须包含 Changesets breaking 说明与 v1→v2 migration guide（显式注册 migration、`requiresReview` 复核、Bootstrap 拒绝/回退、官方预设直接重建）。
- 规范同步：`token-contract-v2.md` 转为当前标准；`token-contract.md` 转为 legacy 参考；Phase 10 的「不把 v2 切换为默认 Contract」非范围项随本决定更新。

## 迁移

- 使用方升级后无需指定 contract 即为 v2；持有 v1 custom theme 的使用方在 Runtime config 注册 `migrations: [migrateOriaStandardV1ToV2]`，导入流程同样显式传入 migrate。
- v1 Bootstrap snapshot 不能被 v2 读取，Bootstrap 回退静态默认样式，Runtime 成功应用后写入 v2 active snapshot。
- 官方预设不需迁移，直接以 v2 使用；视觉上 v2 几何归一（radius 固定倍数、control 整数倍、无 density）与 v1 预设存在既有差异，属本决定接受的合约语义。

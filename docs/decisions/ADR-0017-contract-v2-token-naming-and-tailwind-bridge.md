# ADR-0017：Contract v2 的简洁 Token 命名与 Tailwind Bridge

- 状态：Accepted
- 日期：2026-07-24

## 背景

已发布的 `oria-standard@1` 使用 `typography.*`、`shape.*`、`elevation.shadow.*` 等描述性 path，并在 CSS 中保留 camelCase segment。它表达能力完整，但对 Web/Tailwind 使用者不够直观，也使 CSS variables 偏离常见 kebab-case 风格。

v1 同时持久化 spacing unit、density、多个 spacing 长度和整套 radius 长度；它们可以彼此漂移。Contract 已发布，改名、删除 token、改变 CSS 编译规则和修改主题 JSON 都必须有显式兼容方案。

## 决定

以 `docs/design/contract-v2.md` 和新增的 `docs/specifications/token-contract-v2.md` 作为 v2 设计基线：

1. 保持 non-empty runtime CSS prefix，默认 `oria`；Oria 不直接输出 Tailwind 的无前缀 theme variables。
2. v2 使用 `color`、`font`、`text`、`leading`、`tracking`、`space`、`radius`、`shadow`、`blur`、`backdrop`、`duration`、`ease` 等短 path，CSS output 使用 kebab-case。
3. `space` 和 `radius` 是唯一几何 source；radius scale 与 control CSS lengths 由受控 Core 派生规则生成，不重复序列化。
4. 新增独立、可选的 `@oriatheme/tailwind` 构建期 bridge；它通过 `@theme inline` 映射 runtime Oria variables，且不让 Core/Runtime 依赖 Tailwind。
5. `oria-standard` 升为 version 2；v1 custom theme 只通过显式迁移器导入或 rehydrate，无法保持几何视觉语义时必须要求用户复核。

本 ADR 不改变 v1 当前规范、运行时输出或发布 API。v2 以独立 contract version、独立导出和显式 migration 并存，直到后续发布计划明确切换默认值。

## 替代方案

- 直接将 runtime 变量改为 `--color-*`、`--spacing`：会与 Tailwind theme namespace 冲突，并使非 Tailwind 用户承担耦合。
- 仅重命名现有 token：不能解决 spacing/density/radius 的多个权威来源。
- 保持每级 radius 和 spacing 为可编辑长度：迁移最容易，但继续允许内外 geometry 漂移。
- 在 `@oriatheme/colors` 增加动态 semantic bridge：Colors 必须保持 runtime 无关，会破坏包边界。
- 静默规范化所有 v1 custom theme：会不可见地改变已保存主题的视觉结果。

## 影响

- Core、Presets、Runtime、Bootstrap、Editor Core、registry、示例、官网、文档和全部公开 CSS variables 都需迁移。
- `@oriatheme/tailwind` 成为新的可选公开包；Tailwind 仅用于其 build/test integration，不是 runtime dependency。
- v2 减少主题 JSON 的重复 geometry 数据，但需要 source/derived variable 元数据和 migration API。
- 因 v1 已发布，后续发布必须包含 Changeset、migration guide、tarball/clean consumer 测试和明确的 breaking-change 说明。

## 迁移

按 `docs/design/contract-v2.md` 的算法实施。官方 preset 重建；custom theme 必须经过 opt-in migration 和可视复核。v1 Bootstrap snapshot 不能用于 v2，正式 Runtime 成功后才写入新的 active snapshot。

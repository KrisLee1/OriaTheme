# ADR-0015：背景图案 Token

- 状态：Accepted
- 日期：2026-07-21

## 背景

`pattern.surface` 能表达卡片、纸张等组件表面的纹理，但页面画布需要独立的纹理层。复用 surface token 会让页面背景与组件表面被迫共享图案，无法分别控制对比度、密度和视觉层次。

## 决定

1. 在 `oria-standard@1` 增加可选、mode-scoped 的 `pattern.background`，并继续保留 `pattern.surface`。两者都输出同一安全的 `PatternLayers` 结构与 CSS 绘制顺序。
2. `pattern.background` 编译为 `--oria-pattern-background`；缺失时不输出变量。消费者应以 `var(--oria-pattern-background, none)` 覆盖在背景渐变和基础背景色之上。
3. React/Vue 编辑器复用同一个 PatternField，并通过 contract 字段标签区分 Background 与 Surface；不复制校验、解析或 runtime 状态机。
4. 该 token 是 pre-release 的可选能力扩展，`schemaVersion` 与 `oria-standard@1` contract version 保持不变。既有主题不含该字段时维持无背景纹理。

## 替代方案

- 将背景图案放入 `gradient.background`：渐变不能安全表达图案的尺寸、方向和 noise profile。
- 用 `pattern.surface` 同时驱动画布与卡片：会耦合本应独立的材料层。
- 允许自由 background CSS：会绕过 Core 的原子校验与 stylesheet 安全边界。

## 影响

- 标准 contract 字段数由 153 增至 154。
- Core 的既有 PatternLayers 校验与 CSS 编译直接复用；无需迁移或新增依赖。
- 官方示例页面画布实际消费背景 token，组件表面继续消费 `pattern.surface`。

## 迁移

现有主题无需修改。要启用背景纹理时，在对应 mode 添加 `pattern.background: [layer]`；将同一图层保留在 `pattern.surface` 可继续只影响组件表面。

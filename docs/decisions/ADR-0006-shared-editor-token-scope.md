# ADR-0006：编辑器共享 Token 作用域

- 状态：Accepted
- 日期：2026-07-18

> `palette.*` 相关决定已由 [ADR-0007](ADR-0007-static-color-library-tailwind-bridge.md) 取代；其余 shared/mode 作用域规则继续有效。

## 背景

`ThemeDefinition` schema v1 要求 light/dark 各自保存一套完整 token，以便每个模式都能独立完成校验和原子解析。编辑器此前因此把全部字段都当作模式字段：用户在 Light 中修改圆角、间距、行高或字重后，还需要在 Dark 中重复修改。

现有 36 款官方预设并不采用这种设计。它们的 Foundation Palette、Typography、Shape、Spacing、Control、Effects 与 Motion 在 light/dark 中保持一致；真正按模式变化的是 Semantic Color、Gradient 和 Elevation Shadow。让编辑器继续提供两份几何、排版和动效值会制造无意差异，也与用户的设计心智模型不符。

## 决定

1. editor-core 为标准 contract 字段公开 `modeScope: "shared" | "mode"` 元数据，并成为 React/Vue 编辑行为的唯一作用域来源。
2. 标准 contract 中仅 `color.*`、`gradient.*` 与 `elevation.shadow.*` 是 `mode`；`palette.*`、`typography.*`、`shape.*`、`spacing.*`、`control.*`、`effect.*` 与 `motion.*` 是 `shared`。
3. `setToken()`、`setTokens()`、`removeToken()` 和 `resetToken()` 遇到 shared 字段时，必须在一次 revision 中原子更新或删除 light/dark；不得由 React/Vue 字段组件分别调用两次。`removeToken()` 表示从草稿中真正移除可选值，`resetToken()` 表示恢复会话基线值。
4. `resetMode(mode)` 只重置该模式的 mode 字段，保留当前 shared 编辑；`resetAll()` 仍恢复完整草稿。
5. ThemeDefinition、contract version、schemaVersion 和 Storage 格式保持不变。共享 token 在序列化时仍物化到两个完整 mode token set，使既有 Core、Runtime、主题文件和 36 款预设保持兼容。
6. 非标准扩展 token 默认视为 `mode`，避免 editor-core 在 contract 没有明确声明的情况下擅自同步消费应用的扩展语义。
7. 载入、重载或导入旧主题时，若 shared 字段的两套物化值不同，editor session 以 Light 为规范值；只有 Light 缺失的可选字段才取 Dark。归一化发生在草稿边界，不修改外部 source 对象或持久化内容，直到用户显式保存。

## 替代方案

- 修改 ThemeDefinition 为顶层 `shared` 加 light/dark overrides：数据表达更直接，但会引入 schema、导入导出、Storage、预设和迁移的破坏性变化，不适合当前未完成的 Phase 8。
- 所有非 color token 都共享：规则简单，但会错误合并 light/dark 下通常需要独立设计的阴影和渐变。
- 只在 React/Vue UI 各自同步两次：无需 editor-core 变化，但会复制领域规则、产生两个 revision，并可能让自动预览观察到中间状态。

## 影响

- 共享字段从 Light 或 Dark 编辑都会得到同一结果；智能阶梯仍只产生一次 revision 和一次订阅通知。
- Light/Dark 控件继续选择预览模式，并用于编辑颜色、渐变和阴影；切换模式不会为共享属性展示第二份可编辑值。
- v1 主题文件仍有意重复 shared 值。这是兼容性物化，不表示编辑器允许它们独立变化。
- 若未来 contract 本身需要声明作用域，应通过新的 contract/schema 版本演进，并提供显式迁移；在此之前扩展 token 保持 mode-safe 默认值。

## 迁移

1. 更新 editor-core 规范、字段描述类型和 session 命令语义。
2. 为共享单值、原子阶梯、单字段重置和模式重置添加回归测试。
3. 更新 React/Vue 源码组件文案与字段呈现时，只消费 `TokenFieldDescriptor.modeScope`，不复制 path 分类表。
4. ThemeDefinition v1、官方预设与持久化数据无需迁移。

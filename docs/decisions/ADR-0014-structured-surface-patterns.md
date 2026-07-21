# ADR-0014：结构化表面图案

- 状态：Accepted
- 日期：2026-07-21

## 背景

Punchcard 需要在白色浮起卡片上呈现低对比度、规则重复的小圆点。其它设计也需要条纹、网格、可调纹理方向、纸张/胶片/磨砂颗粒，以及像多层阴影那样组合多种纹理。现有 `gradient.*` 只能表达渐变，既不能清晰表示这些图案的几何参数，也不应把未经约束的 CSS background 字符串写入主题。

## 决定

1. 在 `oria-standard@1` 新增一个可选、mode-scoped 的 `pattern.surface`。值为按 CSS background 绘制顺序排列的 `PatternLayers`：第一个图层在最上方，最少 1 层、最多 8 层。每层为 dot、stripe、grid 或 noise；noise 仅允许 paper、film、frosted 三个枚举 variant，并使用 color/tileSize/intensity。
2. Core 只接受枚举 type/variant、静态安全颜色或 `color.*` 引用、正的安全 dimension、0–360 的有限 angle 与 0–1 intensity；不接受原始 CSS、URL 或外部纹理资源。所有层都通过后，主题才可原子应用。
3. Core 将 dot 编译为重复 radial-gradient（非零角度使用受控 SVG data URI 旋转），stripe 编译为 repeating-linear-gradient，grid 编译为两层正交 repeating-linear-gradient。Paper noise 编译为低强度固定 `feTurbulence` 底纹加确定性稀疏短纤维与细小杂点；Film/Frosted 继续使用各自固定的 `feTurbulence` profile。随后依数组顺序把这些透明 SVG data URI 结果组成一个 CSS background 列表。
4. 缺失 pattern 不输出 CSS custom property。消费者以 `var(--oria-pattern-surface, none), <surface-color>` 叠加，因此既有无纹理主题保持纯表面。
5. ThemeDefinition schema 和 contract version 保持不变；PatternField 仅调用 editor-core session，不复制校验或应用逻辑。编辑器按图层显示类型、颜色、几何参数、添加、删除、上移和下移。

## 替代方案

- 每种纹理使用一个独立 token：不能表达同类型的多层重复，也让用户误以为纹理类型与 token path 固定绑定。
- 为 Punchcard 写静态页面 CSS：不能让主题或用户编辑器复用。
- 用 `gradient.*` 模拟：无法表达图案专有参数，语义不准确，也不能安全地统一旋转点阵。
- 允许自由背景字符串：会绕过 Core 的结构化验证和 stylesheet 安全边界。

## 影响

- `@oriatheme/core` 的新增可选公开 token、`PatternLayers` 与 `NoisePatternDefinition` 是 minor 级能力扩展。
- Punchcard 在 light/dark 两个模式提供一个 dot 图层；其它预设不增加变量。
- React/Vue registry 都提供多层 dot/stripe/grid/noise、颜色、尺寸、间距、角度、受控颗粒 variant/size/intensity、Create/Unset 与有序增删/移动控件，并保持源码模板同步。

## 迁移

该能力尚未随公开版本发布，故不引入 schemaVersion 或持久化迁移。`pattern.dot`、`pattern.stripe` 和 `pattern.grid` 的开发期数据统一改写为 `pattern.surface: [layer]`；缺失 `pattern.surface` 时自动保持无纹理。

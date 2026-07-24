# Token Contract 与完整设计语言（Legacy v1）

> 状态：Legacy。自 [ADR-0019](../decisions/ADR-0019-default-to-contract-v2.md) 起，`oria-standard@2`（见 [Token Contract v2](token-contract-v2.md)）是默认且唯一的标准 Contract；本文件仅作为 v1 主题格式与迁移输入（`oriaStandardContractV1`、`oriaDefaultThemeV1`、`migrateOriaStandardV1ToV2()`）的参考保留。

## 目标

Token Contract 定义主题“允许提供哪些视觉能力、每项是什么类型、是否必需、如何输出 CSS”。它替代固定的 `ThemeModeTokens` 接口和无类型的 `extensions` 字段。

标准 contract 必须足以表达以下视觉语言：

- 色彩明暗与品牌主题；
- Minimal、Flat、Glass、Brutalist、Neumorphic、Editorial、Retro 等风格；
- 紧凑、默认、宽松密度；
- 不同圆角、边框、阴影、表面层级和动效风格。

它不改变组件 DOM、布局结构或交互语义。

## Contract 类型

```ts
export type TokenType =
  | "color"
  | "dimension"
  | "number"
  | "fontFamily"
  | "fontWeight"
  | "duration"
  | "cubicBezier"
  | "shadow"
  | "gradient"
  | "pattern";

export type TokenPath = string & { readonly __tokenPath: unique symbol };

export interface TokenDefinition<T extends TokenType = TokenType> {
  type: T;
  required: boolean;
  description: string;
  default?: TokenValueFor<T>;
  minimum?: number;
  maximum?: number;
}

export interface TokenContract {
  name: string;
  version: number;
  tokens: Readonly<Record<TokenPath, TokenDefinition>>;
}
```

Token path 使用点分层级；首段和普通字段段以小写字母开头，色阶等叶子段允许纯数字：

```text
^[a-z][a-zA-Z0-9]*(\.(?:[a-z][a-zA-Z0-9]*|[0-9]+(?:[a-z][a-zA-Z0-9]*)?))+$
```

例如 `color.background`、`typography.font.display`、`typography.size.2xl`、`elevation.shadow.md`。Contract 注册时必须拒绝重复 path、未知 type、非法默认值和不兼容的覆盖。

## Token 值

```ts
export type ThemeTokenInput = TokenValue | TokenReference;

export interface TokenReference {
  $ref: TokenPath;
}

export type TokenValue =
  | string
  | number
  | readonly string[]
  | readonly [number, number, number, number]
  | readonly ShadowLayer[]
  | GradientDefinition
  | PatternLayers;

export interface ShadowLayer {
  x: string;
  y: string;
  blur: string;
  spread: string;
  color: string;
  inset?: boolean;
}

export interface GradientStop {
  color: string | TokenReference;
  position?: number;
}

export type GradientPosition =
  | "top left"
  | "top"
  | "top right"
  | "left"
  | "center"
  | "right"
  | "bottom left"
  | "bottom"
  | "bottom right"
  | { x: number; y: number };

export type GradientDefinition =
  | { type: "linear"; angle: number; stops: readonly GradientStop[] }
  | { type: "repeating-linear"; angle: number; stops: readonly GradientStop[] }
  | {
      type: "radial";
      position?: GradientPosition;
      stops: readonly GradientStop[];
    }
  | {
      type: "repeating-radial";
      position?: GradientPosition;
      stops: readonly GradientStop[];
    }
  | {
      type: "conic";
      angle: number;
      position?: GradientPosition;
      stops: readonly GradientStop[];
    };

export interface DotPatternDefinition {
  type: "dot";
  color: string | TokenReference;
  radius: string;
  spacing: string;
  angle?: number;
}

export interface StripePatternDefinition {
  type: "stripe";
  color: string | TokenReference;
  stripeWidth: string;
  spacing: string;
  angle: number;
}

export interface GridPatternDefinition {
  type: "grid";
  color: string | TokenReference;
  lineWidth: string;
  spacing: string;
  angle: number;
}

export type NoisePatternVariant = "paper" | "film" | "frosted";

export interface NoisePatternDefinition {
  type: "noise";
  color: string | TokenReference;
  variant: NoisePatternVariant;
  tileSize: string;
  intensity: number;
}

export type PatternLayer = DotPatternDefinition | StripePatternDefinition | GridPatternDefinition | NoisePatternDefinition;
export type PatternLayers = readonly PatternLayer[];
```

值由对应 TokenDefinition.type 决定，不能只依赖 TypeScript union。运行时必须按 contract 校验。

### 引用

```json
{
  "color.primaryHover": { "$ref": "color.primary" },
  "color.ring": { "$ref": "color.primary" }
}
```

- 引用只能指向同一 mode token set 中存在且类型兼容的 token。
- 必须检测直接和间接循环，并返回引用路径。
- Required token 在完整解析后必须都有值。
- CSS 输出可以内联最终值；v1 不保留运行时 alias 链，降低浏览器级循环风险。

## 标准 Contract 分层

下表是 `oria-standard@1` 的标准分层索引。花括号内的每个后缀都是一个**独立注册的 token**。除 gradient 和 pattern 外，表中 token 均为必需项。稳定基础颜色不属于主题 contract，由独立的 `@oriatheme/colors` 提供。

| 层 | Token | CSS 变量名 | 值的类型 / 示例 | 作用 |
|---|---|---|---|---|
| Semantic Color | `color.background` | `--oria-color-background` | `color`；`#f1f3f4` | 页面根背景。 |
| Semantic Color | `color.foreground` | `--oria-color-foreground` | `color`；`#1d2023` | 页面根前景文字和图标。 |
| Semantic Color | `color.surface` | `--oria-color-surface` | `color`；`#f5f7f8` | 默认组件表面。 |
| Semantic Color | `color.surfaceForeground` | `--oria-color-surfaceForeground` | `color`；`#1d2023` | 默认表面上的内容前景。 |
| Semantic Color | `color.surfaceRaised` | `--oria-color-surfaceRaised` | `color`；`#fbfcfd` | 卡片等浮起层级的表面。 |
| Semantic Color | `color.surfaceRaisedForeground` | `--oria-color-surfaceRaisedForeground` | `color`；`#1d2023` | 浮起表面上的内容前景。 |
| Semantic Color | `color.overlay` | `--oria-color-overlay` | `color`；`#ffffff` | Popover、dialog 等覆盖层表面。 |
| Semantic Color | `color.overlayForeground` | `--oria-color-overlayForeground` | `color`；`#1d2023` | 覆盖层表面上的内容前景。 |
| Semantic Color | `color.primary` | `--oria-color-primary` | `color`；`#35bff0` | 主操作、品牌强调色。 |
| Semantic Color | `color.primaryForeground` | `--oria-color-primaryForeground` | `color`；`#07232d` | 主色表面上的内容前景。 |
| Semantic Color | `color.primaryHover` | `--oria-color-primaryHover` | `color`；`#22afe4` | 主操作 hover 状态。 |
| Semantic Color | `color.primaryActive` | `--oria-color-primaryActive` | `color`；`#0d94c9` | 主操作 pressed/active 状态。 |
| Semantic Color | `color.secondary` | `--oria-color-secondary` | `color`；`#f9fafb` | 次级操作表面。 |
| Semantic Color | `color.secondaryForeground` | `--oria-color-secondaryForeground` | `color`；`#22272b` | 次级操作内容前景。 |
| Semantic Color | `color.secondaryHover` | `--oria-color-secondaryHover` | `color`；`#eff2f4` | 次级操作 hover 状态。 |
| Semantic Color | `color.secondaryActive` | `--oria-color-secondaryActive` | `color`；`#e3e8eb` | 次级操作 pressed/active 状态。 |
| Semantic Color | `color.muted` | `--oria-color-muted` | `color`；`#e9edef` | 弱化背景或非重点表面。 |
| Semantic Color | `color.mutedForeground` | `--oria-color-mutedForeground` | `color`；`#656d73` | 弱化文字和图标。 |
| Semantic Color | `color.accent` | `--oria-color-accent` | `color`；`#d4f3fd` | 低强度强调、选中或提示表面。 |
| Semantic Color | `color.accentForeground` | `--oria-color-accentForeground` | `color`；`#0c5069` | 强调表面上的内容前景。 |
| Semantic Color | `color.destructive` | `--oria-color-destructive` | `color`；`#c83f3f` | 破坏性操作和错误状态。 |
| Semantic Color | `color.destructiveForeground` | `--oria-color-destructiveForeground` | `color`；`#ffffff` | 破坏性状态上的内容前景。 |
| Semantic Color | `color.success` | `--oria-color-success` | `color`；`#167b59` | 成功状态。 |
| Semantic Color | `color.successForeground` | `--oria-color-successForeground` | `color`；`#ffffff` | 成功状态上的内容前景。 |
| Semantic Color | `color.warning` | `--oria-color-warning` | `color`；`#926006` | 警告状态。 |
| Semantic Color | `color.warningForeground` | `--oria-color-warningForeground` | `color`；`#ffffff` | 警告状态上的内容前景。 |
| Semantic Color | `color.info` | `--oria-color-info` | `color`；`#0877a8` | 信息状态。 |
| Semantic Color | `color.infoForeground` | `--oria-color-infoForeground` | `color`；`#ffffff` | 信息状态上的内容前景。 |
| Semantic Color | `color.border` | `--oria-color-border` | `color`；`#ffffffa8` | 默认分隔线和边框。 |
| Semantic Color | `color.borderStrong` | `--oria-color-borderStrong` | `color`；`#cbd2d7` | 高强调分隔线和边框。 |
| Semantic Color | `color.input` | `--oria-color-input` | `color`；`#f7f9fa` | 输入控件背景。 |
| Semantic Color | `color.ring` | `--oria-color-ring` | `color`；`#35bff0` | 键盘焦点环颜色。 |
| Semantic Color | `color.selection` | `--oria-color-selection` | `color`；`#bdeefe` | 文本或项目选中背景。 |
| Semantic Color | `color.selectionForeground` | `--oria-color-selectionForeground` | `color`；`#10394a` | 选中背景上的内容前景。 |
| Semantic Color | `color.scrim` | `--oria-color-scrim` | `color`；`#17202766` | Modal、drawer 背后的遮罩。 |
| Semantic Color | `color.chart{1,2,3,4,5,6,7,8}` | `--oria-color-chart{1,2,3,4,5,6,7,8}` | `color`；`#149dcc` | 图表系列色；每个编号为独立数据序列。 |
| Typography | `typography.font.{sans,serif,mono,display}` | `--oria-typography-font-{sans,serif,mono,display}` | `fontFamily`；`["Inter", "sans-serif"]` | 正文、衬线、等宽和展示字体栈。 |
| Typography | `typography.weight.{thin,extraLight,light,normal,medium,semibold,bold,extraBold,black}` | `--oria-typography-weight-*` | `fontWeight`；`"400"` | 100–900 的完整字重层级。 |
| Typography | `typography.size.{xs,sm,md,lg,xl,2xl,3xl,4xl,5xl,6xl,7xl,8xl,9xl}` | `--oria-typography-size-*` | `dimension`；`1rem` | 正文至超大展示标题的字号阶梯。 |
| Typography | `typography.lineHeight.{tight,snug,normal,relaxed,loose}` | `--oria-typography-lineHeight-*` | `number`；`1.5` | 无单位行高，控制文本紧凑度。 |
| Typography | `typography.letterSpacing.{tighter,tight,normal,wide,wider,widest}` | `--oria-typography-letterSpacing-*` | `dimension`；`0.04em` | 字符间距，支持 editorial/compact 等风格。 |
| Shape 与 Border | `shape.radius.{none,xs,sm,md,lg,xl,2xl,3xl,4xl,full}` | `--oria-shape-radius-*` | `dimension`；`0.875rem` | 组件按语义选择的圆角层级。 |
| Shape 与 Border | `shape.borderWidth.{hairline,default,strong}` | `--oria-shape-borderWidth-{hairline,default,strong}` | `dimension`；`1px` | 边框粗细层级。 |
| Shape 与 Border | `shape.focusRingWidth` | `--oria-shape-focusRingWidth` | `dimension`；`2px` | 键盘焦点环本体宽度。 |
| Shape 与 Border | `shape.focusRingOffset` | `--oria-shape-focusRingOffset` | `dimension`；`3px` | 焦点环与组件边界的间隔。 |
| Spacing 与 Density | `spacing.unit` | `--oria-spacing-unit` | `dimension`；`0.25rem` | 间距比例的基础单位。 |
| Spacing 与 Density | `spacing.density` | `--oria-spacing-density` | `number`（`0.75…1.25`）；`1.04` | 间距密度系数；不直接强制改变布局。 |
| Spacing 与 Density | `spacing.{1,2,3,4,5,6,8,10,12,16}` | `--oria-spacing-{1,2,3,4,5,6,8,10,12,16}` | `dimension`；`1rem` | 组件的标准间距阶梯。 |
| Spacing 与 Density | `control.height.{sm,md,lg}` | `--oria-control-height-{sm,md,lg}` | `dimension`；`2.75rem` | 小、中、大控件高度。 |
| Spacing 与 Density | `control.paddingInline.{sm,md,lg}` | `--oria-control-paddingInline-{sm,md,lg}` | `dimension`；`1rem` | 小、中、大控件的水平内边距。 |
| Elevation | `elevation.shadow.{none,2xs,xs,sm,md,lg,xl,2xl}` | `--oria-elevation-shadow-*` | `shadow`；`[{ x: "0", y: "4px", blur: "6px", spread: "-1px", color: "#0000001f" }]` | 无阴影、极轻分离到强浮起阴影的层级。 |
| Elevation | `elevation.shadow.inner` | `--oria-elevation-shadow-inner` | `shadow`；`[{ x: "0", y: "2px", blur: "4px", spread: "0", color: "#0000000f", inset: true }]` | 凹陷或内阴影材质。 |
| Elevation | `elevation.shadow.highlight` | `--oria-elevation-shadow-highlight` | `shadow`；`[{ x: "0", y: "1px", blur: "0", spread: "0", color: "#ffffff80", inset: true }]` | Glass、neumorphic 等材质的内侧高光。 |
| Effects | `effect.opacity.{disabled,muted,overlay}` | `--oria-effect-opacity-{disabled,muted,overlay}` | `number`（`0…1`）；`0.5` | 禁用、弱化和覆盖内容的透明度。 |
| Effects | `effect.blur.{xs,sm,md,lg,xl,2xl,3xl}` | `--oria-effect-blur-*` | `dimension`；`8px` | 前景模糊半径。 |
| Effects | `effect.backdropBlur.{xs,sm,md,lg,xl,2xl,3xl}` | `--oria-effect-backdropBlur-*` | `dimension`；`20px` | 轻薄提示至强材质 backdrop blur 阶梯。 |
| Effects | `effect.backdropSaturation` | `--oria-effect-backdropSaturation` | `number`（`0…3`）；`1.18` | 玻璃材质 backdrop 的饱和度。 |
| Effects | `gradient.{background,surface,accent}` | `--oria-gradient-{background,surface,accent}` | 可选 `gradient`；`{ type: "linear", angle: 135, stops: [...] }` | 背景、表面和强调区域的结构化渐变。 |
| Effects | `pattern.{background,surface}` | `--oria-pattern-{background,surface}` | 可选 `pattern`；`[{ type: "noise", variant: "paper", color: "#2a25201f", tileSize: "48px", intensity: 0.12 }]` | 有序的可叠加背景或表面图层；支持几何纹理与受控纸张、胶片、磨砂颗粒；第一个图层绘制在最上方，最多 8 层。 |
| Motion | `motion.duration.{instant,fast,normal,slow}` | `--oria-motion-duration-{instant,fast,normal,slow}` | `duration`；`220ms` | 立即、快速、默认和慢速动画时长。 |
| Motion | `motion.easing.{standard,entrance,exit,emphasized}` | `--oria-motion-easing-{standard,entrance,exit,emphasized}` | `cubicBezier`；`[0.2, 0, 0, 1]` | 通用、进入、退出和强调动画缓动。 |

表中的 CSS 变量按默认 `variablePrefix: "oria"` 展示；编译时仅将 path 中的 `.` 替换为 `-`，字段段的 camelCase 保持原样。消费者可配置其他前缀或空前缀，但该转换规则保持不变。`gradient.*` 与 `pattern.*` 是可选标准 token；所有其他表项必须在完整解析后存在。

### 静态基础色库（Contract 外）

`@oriatheme/colors` 提供与仓库锁定的 Tailwind CSS 4.3.3 默认命名拓扑兼容、但颜色值独立设计的 26 个颜色家族，每族包含 50–950 十一个阶梯，以及 inherit、current、transparent、black、white。它们通过 `--oria-palette-*` 静态变量供应用和编辑器取色，但不进入 ThemeDefinition、不随 light/dark 重复保存，也不由 runtime 注入或切换。完整边界见 [ADR-0007](../decisions/ADR-0007-static-color-library-tailwind-bridge.md) 与 [ADR-0011](../decisions/ADR-0011-tailwind-scale-and-color-topology.md)。

### 1. Semantic Color

必须包含：

```text
color.background
color.foreground
color.surface
color.surfaceForeground
color.surfaceRaised
color.surfaceRaisedForeground
color.overlay
color.overlayForeground

color.primary
color.primaryForeground
color.primaryHover
color.primaryActive
color.secondary
color.secondaryForeground
color.secondaryHover
color.secondaryActive
color.muted
color.mutedForeground
color.accent
color.accentForeground

color.destructive
color.destructiveForeground
color.success
color.successForeground
color.warning
color.warningForeground
color.info
color.infoForeground

color.border
color.borderStrong
color.input
color.ring
color.selection
color.selectionForeground
color.scrim

color.chart1 ... color.chart8
```

`surfaceRaised` 支持浮起卡片和层级表面；`overlay` 用于 popover/dialog；`scrim` 用于遮罩。状态色必须有对应 foreground。

### 2. Typography

```text
typography.font.sans
typography.font.serif
typography.font.mono
typography.font.display

typography.weight.thin
typography.weight.extraLight
typography.weight.light
typography.weight.normal
typography.weight.medium
typography.weight.semibold
typography.weight.bold
typography.weight.extraBold
typography.weight.black

typography.size.xs / sm / md / lg / xl / 2xl / 3xl / 4xl / 5xl / 6xl / 7xl / 8xl / 9xl
typography.lineHeight.tight / snug / normal / relaxed / loose
typography.letterSpacing.tighter / tight / normal / wide / wider / widest
```

- font token 编译为安全的 font-family 列表；OriaTheme 不下载字体。
- size、line height、letter spacing 允许表达 Editorial、Retro 和 Compact 等风格。

### 3. Shape 与 Border

```text
shape.radius.none / xs / sm / md / lg / xl / 2xl / 3xl / 4xl / full
shape.borderWidth.hairline / default / strong
shape.focusRingWidth
shape.focusRingOffset
```

不得只使用一个全局 radius；组件可以选择语义层级。Brutalist 风格可以使用 `radius.none`、strong border 和 offset shadow。

### 4. Spacing 与 Density

```text
spacing.unit
spacing.density
spacing.1 / 2 / 3 / 4 / 5 / 6 / 8 / 10 / 12 / 16
control.height.sm / md / lg
control.paddingInline.sm / md / lg
```

- `density` 是有限范围 number，建议 `0.75...1.25`。
- Resolver 可以从 unit × density 推导 spacing scale，但最终输出必须是合法 CSS 值。
- 消费组件选择 token，runtime 不强制改变布局。

### 5. Elevation

```text
elevation.shadow.none
elevation.shadow.2xs / xs / sm / md / lg / xl / 2xl
elevation.shadow.inner
elevation.shadow.highlight
```

shadow 使用 `ShadowLayer[]`，支持多层、inset 和偏移阴影。这样可以表达 Glass 高光、Brutalist 硬阴影和 Neumorphic 内外双阴影，不使用单一 `shadowColor + shadowStrength` 代替完整能力。

### 6. Effects

```text
effect.opacity.disabled
effect.opacity.muted
effect.opacity.overlay
effect.blur.xs / sm / md / lg / xl / 2xl / 3xl
effect.backdropBlur.xs / sm / md / lg / xl / 2xl / 3xl
effect.backdropSaturation
gradient.background
gradient.surface
gradient.accent
pattern.background
pattern.surface
```

透明度为 `0...1` number；前景 blur 与 backdrop blur 都是七级 dimension 阶梯；saturation 为受限 number。默认前景 blur 为 2px / 4px / 8px / 16px / 24px / 40px / 64px，默认 backdrop blur 为 4px / 8px / 14px / 20px / 28px / 40px / 64px，组件按表面层级选择而不是写死像素值。三个 gradient token 与 `pattern.background`、`pattern.surface` 都是可选结构化材质 token。Pattern 是 1–8 个按绘制顺序排列的图层：第一个图层在最上方。每层只接受安全静态颜色或同模式 `color.*` 引用；`dot` 使用 radius、spacing 和可选 0–360° angle，`stripe` 使用 stripeWidth、spacing 和 angle，`grid` 使用 lineWidth、spacing 和 angle。`noise` 使用受限的 `paper` / `film` / `frosted` variant、正 tileSize 与 0–1 intensity。Paper 由低强度的固定 `feTurbulence` 底纹与确定性稀疏短纤维、细小杂点组成；Film 与 Frosted 保持各自固定的 `feTurbulence` profile。Core 只生成这些受控 SVG data URI，而不接受噪点图片或自由 CSS。消费者分别以 `background: var(--oria-pattern-background, none), <background layers>` 与 `background: var(--oria-pattern-surface, none), var(--oria-color-surfaceRaised)` 叠加背景或表面颜色。Glass 风格依赖 backdrop tokens，但组件必须实际引用它们。

### 7. Motion

```text
motion.duration.instant / fast / normal / slow
motion.easing.standard / entrance / exit / emphasized
```

duration 和 cubicBezier 采用结构化类型。`prefers-reduced-motion` 的处理属于 runtime/组件行为，不通过主题绕过用户偏好。

## 标准类型映射

| Token 路径类别 | TokenType |
|---|---|
| `color.*` | `color` |
| `typography.font.*` | `fontFamily` |
| `typography.weight.*` | `fontWeight` |
| `typography.size.*`、`typography.letterSpacing.*` | `dimension` |
| `typography.lineHeight.*` | `number` |
| `shape.*`、`spacing.unit`、`spacing.*`、`control.*` | `dimension`，但 `spacing.density` 为 `number` |
| `elevation.shadow.*` | `shadow` |
| `effect.opacity.*`、`effect.backdropSaturation` | `number` |
| `effect.blur.*`、`effect.backdropBlur.*` | `dimension` |
| `gradient.*` | `gradient` |
| `pattern.background` / `pattern.surface` | `pattern` |
| `motion.duration.*` | `duration` |
| `motion.easing.*` | `cubicBezier` |

`spacing.*` 的派生 token 可以由 resolver 生成，但进入 ResolvedTheme 前必须全部成为 dimension 值。

## Contract 扩展

消费者扩展必须显式注册：

```ts
const appContract = defineTokenContract({
  name: "acme-app",
  version: 1,
  extends: [oriaStandardContract],
  tokens: {
    "navigation.background": colorToken({ required: true }),
    "brand.logoBackground": colorToken({ required: true }),
  },
});
```

规则：

- 扩展不得改变已有 token 的 type。
- 修改 required/default 属于 contract 版本变化。
- ThemeDefinition 必须声明它适用的 contract name/version。
- 导入不匹配 contract 的主题时，必须迁移、显式映射或拒绝，不能静默丢 token。
- v1 不保留无类型 `extensions: Record<string,string>`。

## CSS 变量编译

默认命名：

```text
color.background        → --oria-color-background
shape.radius.md         → --oria-shape-radius-md
elevation.shadow.md     → --oria-elevation-shadow-md
```

`variablePrefix` 默认 `oria`，可配置为空。编译规则必须稳定；改变规则属于破坏性变更。

结构化值编译：

- fontFamily array → 经过转义的逗号分隔 font-family。
- cubicBezier tuple → `cubic-bezier(a,b,c,d)`。
- ShadowLayer[] → 合法的多层 box-shadow。
- GradientDefinition → 只支持 schema 中声明的 gradient 类型和 stops：`linear` / `repeating-linear` 分别编译为 `linear-gradient` / `repeating-linear-gradient` 并使用 angle；`radial` / `repeating-radial` 分别编译为 `radial-gradient` / `repeating-radial-gradient`，固定使用 `circle at <position>`；`conic` 编译为 `conic-gradient(from <angle>deg at <position>, <stops>)`。position 接受九宫格关键字或 `{ x, y }` 百分比坐标；x/y 必须为 0–100 的有限数值并编译为 `x% y%`，缺省使用 `center`。
- PatternLayers → 每个 PatternLayer 按数组顺序编译并以逗号连接到 CSS background；第一个图层在最上方。点阵在未设置/设置 `0deg` 时编译为 `radial-gradient(circle at center, <color> 0 <radius>, transparent <radius>) 0 0 / <spacing> <spacing> repeat`；非零角度点阵以受控 SVG data URI 旋转。条纹编译为 `repeating-linear-gradient(<angle>deg, <color> 0 <stripeWidth>, transparent <stripeWidth> <spacing>)`；网格为该 layer 与角度加 90° 的第二 layer。Paper noise 编译为低对比底纹加固定位置的短纤维与细小杂点；Film 与 Frosted 继续按各自固定的 `feTurbulence` profile 编译。三种 noise 都以 color、tileSize 和 intensity 生成透明 SVG data URI 图层。
- number → 不隐式附加单位。

## 安全与验证

- string 值包含 `;`、`{`、`}`、`<`、`>` 时拒绝。
- color 应通过静态解析器；浏览器 runtime 可以再用 `CSS.supports` 校验。
- dimension 只接受允许的单位和零值，禁止 `url()`、`var()` 与任意函数；token 引用使用 `$ref` 表达。
- font family 必须逐项转义。
- gradient、pattern、shadow 不接受原始 CSS 字符串；pattern 的颜色引用必须解析为同一模式内的 color token。
- 先解析完整 token graph，再生成 CSS；任何错误都不得产生部分 stylesheet。

## 自定义主题与编辑器元数据

Contract 是 Headless 编辑器的字段来源。TokenDefinition 应提供稳定的 description、type、范围和是否必需。UI 标签和多语言不属于 core；消费应用自行映射 token path。

主题编辑器应优先暴露语义 token，高级模式再开放 foundation、typography、elevation 等类别。保存前执行完整 contract 校验和对比度诊断。

## 可访问性诊断

Core 至少检查以下组合：

- background / foreground
- surface / surfaceForeground
- surfaceRaised / surfaceRaisedForeground
- overlay / overlayForeground
- primary / primaryForeground
- secondary / secondaryForeground
- destructive/success/warning/info 与对应 foreground
- selection / selectionForeground

低对比度默认返回 warning，由消费应用决定是否阻止保存；内置 preset 必须满足正文 WCAG AA。

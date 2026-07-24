# Contract v2 设计提案：简洁命名、派生尺度与 Tailwind Bridge

> 状态：Accepted（Phase 10 实现中；`oria-standard@1` 仍是当前默认 Contract）
>
> 日期：2026-07-24
> 关联：[ADR-0017](../decisions/ADR-0017-contract-v2-token-naming-and-tailwind-bridge.md)、[ADR-0018](../decisions/ADR-0018-contract-v2-in-phase-10.md)、[Phase 10](../phases/phase-10-contract-v2.md)、[Token Contract](../specifications/token-contract.md)、[迁移指南](../guides/migrations.md)

## 目标与边界

`oria-standard@2` 将公开 vocabulary 收敛为 Web 与 Tailwind CSS 使用者熟悉的 `text`、`font`、`leading`、`tracking`、`space`、`radius`、`shadow`、`blur`、`duration`、`ease`。运行时变量仍使用默认 `--oria-*` 前缀。

v2 解决 v1 的重复几何来源：`spacing.unit`、`spacing.density`、多个 spacing 值和整套 radius 长度不再同时持久化。主题 JSON 只保存真正可编辑的 source token；Core 以固定、安全的规则派生 CSS variables。

不在范围内：让 Core/Runtime 依赖 Tailwind、把 breakpoint/container/grid/z-index/animation keyframes 放进 runtime 主题、复制 Tailwind 色值、接受任意 CSS 公式，或静默改变 v1 custom theme 的视觉结果。

## 规则

1. Oria 是 canonical source：runtime 不输出 Tailwind 的 `--color-*`、`--spacing` 等无前缀命名空间。
2. v2 path 使用小写点分层级；`.` 编译为 `-`。`font.weight.semibold` → `--oria-font-weight-semibold`。
3. `space` 与 `radius` 是唯一基础几何 source；control 长度是 `space` 的受控倍数。
4. 派生变量不进入 `ThemeTokenSet`、编辑器输入字段或 `$ref` 的目标集合。
5. Tailwind 只通过可选的构建期 bridge 使用 Oria variables。
6. v1/v2 contract mismatch 必须完整拒绝或经过显式 migration，绝不部分应用。

## Contract 身份、路径与 CSS 输出

```ts
export const oriaStandardContractV2 = defineTokenContract({
  name: "oria-standard",
  version: 2,
  cssNameStyle: "kebab",
  tokens: { /* source token */ },
  derivedVariables: [ /* 安全派生输出 */ ],
});
```

- `ThemeDefinition.schemaVersion` 仍为 `1`，但 `contract` 变为 `{ name: "oria-standard", version: 2 }`。
- 每个 v2 非数字 path segment 必须匹配 `[a-z][a-z0-9]*`；禁止 camelCase。v1 继续使用 legacy path 规则。
- `variablePrefix` 默认 `oria`，v2 必须非空，且只允许字母、数字和 `-`、首字符为字母。
- CSS 输出为 `--${prefix}-${path.replaceAll(".", "-")}`。示例：`color.primary.fg` → `--oria-color-primary-fg`、`backdrop.blur.lg` → `--oria-backdrop-blur-lg`。

Core 的 contract 数据模型新增：

```ts
type CssNameStyle = "legacy" | "kebab";

interface DerivedVariableDefinition {
  readonly name: string; // 小写 kebab case，不含 -- 或 prefix
  readonly type: "dimension";
  readonly derive:
    | { readonly kind: "scale"; readonly source: TokenPath; readonly factor: number }
    | { readonly kind: "product"; readonly dimension: TokenPath; readonly factor: TokenPath };
}

interface TokenDefinition<T extends TokenType = TokenType> {
  readonly type: T;
  readonly required: boolean;
  readonly description: string;
  readonly output?: boolean; // 默认 true；control multiplier 使用 false
}
```

Core 只允许上述两类派生；先完整校验 source，再计算派生 CSS value，最后原子返回 `ResolvedTheme.variables`。不接受用户 `calc()` 或 `var()`。

## 完整 source token 清单

v2 共 **134 个 source token**，其中 Gradient/Pattern 的 5 项为 optional。静态 palette 仍在 Contract 外。

### Color（43）

```text
color.bg / color.fg
color.surface / color.surface.fg / color.surface.raised / color.surface.raised.fg
color.overlay / color.overlay.fg
color.primary / color.primary.fg / color.primary.hover / color.primary.active
color.secondary / color.secondary.fg / color.secondary.hover / color.secondary.active
color.muted / color.muted.fg / color.accent / color.accent.fg
color.danger / color.danger.fg / color.success / color.success.fg
color.warning / color.warning.fg / color.info / color.info.fg
color.border / color.border.strong / color.input / color.ring
color.selection / color.selection.fg / color.scrim
color.chart.1 ... color.chart.8
```

`bg`/`fg` 表示页面画布及默认内容；`danger` 替代冗长的 `destructive`，语义不变；每个可读状态表面都必须有 `.fg`。

### Text 与 Font（37）

```text
font.sans / font.serif / font.mono / font.display
font.weight.thin / extralight / light / normal / medium / semibold / bold / extrabold / black
text.xs / sm / md / lg / xl / 2xl / 3xl / 4xl / 5xl / 6xl / 7xl / 8xl / 9xl
leading.tight / snug / normal / relaxed / loose
tracking.tighter / tight / normal / wide / wider / widest
```

`text.md` 是 Oria 正文尺寸，Tailwind bridge 映射为 `--text-base`。v2 默认 text scale 保持 xs–9xl 的 0.75–8rem 阶梯；leading 默认 1.25/1.375/1.5/1.625/2，tracking 默认 -0.05/-0.025/0/0.025/0.05/0.1em。

### Geometry（13）

```text
space                                  // dimension；默认 0.25rem
radius                                 // dimension；默认 0.25rem
control.height.sm / md / lg            // number；默认 9 / 11 / 13
control.padding.x.sm / md / lg         // number；默认 3 / 4 / 5
border.width.hairline / default / strong
ring.width / ring.offset
```

删除 `spacing.density`、全部 `spacing.{n}` 和所有持久化 `shape.radius.*`。`control.*` 存储倍数，长度由 Core 计算；边框和 focus ring 保留 dimension，不强行折算到 4px 网格。

### Shadow、Effects 与 Material（33）

```text
shadow.none / 2xs / xs / sm / md / lg / xl / 2xl / inner / highlight
opacity.disabled / muted / overlay
blur.xs / sm / md / lg / xl / 2xl / 3xl
backdrop.blur.xs / sm / md / lg / xl / 2xl / 3xl
backdrop.saturate
gradient.bg / surface / accent          // optional structured gradient
pattern.bg / surface                    // optional PatternLayers
```

`shadow` 继续使用 `ShadowLayer[]`，不降级为一个未经校验的 CSS 字符串。前景 blur 默认采用 4/8/12/16/24/40/64px；`backdrop.blur` 独立保存，即使默认同值。

### Motion（8）

```text
duration.instant / fast / normal / slow
ease.standard / enter / exit / emphasized
```

`ease` 替代 `motion.easing`，`enter`/`exit` 替代 `entrance`/`exit`；theme 不保存 animation 名称或 keyframes。

## 受控派生输出

```text
--oria-space = value(space)

--oria-radius-xs   = radius × 0.5
--oria-radius-sm   = radius × 1
--oria-radius-md   = radius × 1.5
--oria-radius-lg   = radius × 2
--oria-radius-xl   = radius × 3
--oria-radius-2xl  = radius × 4
--oria-radius-3xl  = radius × 6
--oria-radius-4xl  = radius × 8

--oria-control-height-{sm,md,lg} = space × control.height.{sm,md,lg}
--oria-control-padding-x-{sm,md,lg} = space × control.padding.x.{sm,md,lg}
```

默认 `space` 与 `radius` 都为 4px，因此 radius 为 2/4/6/8/12/16/24/32px。`rounded-none` 和 `rounded-full` 是 CSS 常量，不是主题 token。`radius: 0` 合法，适用于直角风格。control multiplier 范围固定为 1–24、步长为 1。

嵌套表面不得持久化第二套 radius，而应局部计算：

```css
.card__inner {
  border-radius: max(0px, calc(var(--oria-radius-lg) - var(--oria-border-width-default) - var(--oria-space)));
}
```

Pattern 的 dimension 字段可 `$ref: "space"`；不能引用派生 radius/control 输出。

## Tailwind v4 bridge

新增可选包 `@oriatheme/tailwind`，只交付 CSS bridge、CLI 生成器和测试 fixture；Core/Runtime 不依赖 Tailwind。

```css
@import "tailwindcss";
@import "@oriatheme/colors/styles.css";
@import "@oriatheme/colors/tailwind.css";
@import "@oriatheme/tailwind/oria.css";
```

默认 `oria.css` 是静态 `@theme inline` bridge。custom prefix 必须显式生成静态 bridge：

```bash
pnpm dlx @oriatheme/cli theme tailwind-bridge --prefix acme --out src/oria-tailwind.css
```

CSS 不能在 runtime 拼接 custom property 名，因此预构建 bridge 不会猜测未知 prefix。

| Oria output | Tailwind theme variable | Utility |
|---|---|---|
| `--oria-color-bg` | `--color-background` | `bg-background` |
| `--oria-color-fg` | `--color-foreground` | `text-foreground` |
| `--oria-color-primary-fg` | `--color-primary-foreground` | `text-primary-foreground` |
| `--oria-font-sans` | `--font-sans` | `font-sans` |
| `--oria-font-weight-semibold` | `--font-weight-semibold` | `font-semibold` |
| `--oria-text-md` | `--text-base` | `text-base` |
| `--oria-leading-relaxed` | `--leading-relaxed` | `leading-relaxed` |
| `--oria-tracking-wide` | `--tracking-wide` | `tracking-wide` |
| `--oria-space` | `--spacing` | `p-4`, `gap-6`, `w-12` |
| `--oria-radius-lg` | `--radius-lg` | `rounded-lg` |
| `--oria-shadow-md` | `--shadow-md` | `shadow-md` |
| `--oria-blur-lg` | `--blur-lg` | `blur-lg` |
| `--oria-ease-standard` | `--ease-oria-standard` | `ease-oria-standard` |

Bridge 为 text scale 添加 `--text-*--line-height`：xs/sm → snug，md/lg → normal，xl/2xl → snug，3xl–9xl → tight；`leading-*` 仍可覆盖。

没有安全一对一 namespace 的特性使用显式 custom utilities：`backdrop-oria-{xs..3xl}`（blur + theme saturation）、`duration-oria-{fast,normal,slow}`、`bg-oria-canvas`（pattern.bg + gradient.bg + color.bg）与 `bg-oria-surface`。`shadow.inner` 为 `inset-shadow-oria`，`shadow.highlight` 为 `shadow-highlight`。静态 palette 继续由 `@oriatheme/colors/tailwind.css` 提供。

## Scope、迁移与 API

| Scope | Token prefixes |
|---|---|
| mode | `color.*`、`shadow.*`、`gradient.*`、`pattern.*` |
| shared | `font.*`、`text.*`、`leading.*`、`tracking.*`、`space`、`radius`、`control.*`、`border.*`、`ring.*`、`opacity.*`、`blur.*`、`backdrop.*`、`duration.*`、`ease.*` |

`resolveTheme()`、Runtime 原子写入和 Bootstrap 的处理顺序不变。v2 Bootstrap 必须拒绝 v1 active snapshot（contract ref 不匹配），安全回退静态默认样式，直到 Runtime 成功迁移并写入 v2 snapshot。

```ts
export interface ThemeMigrationResult {
  readonly theme: ThemeDefinition;
  readonly warnings: readonly MigrationWarning[];
  readonly requiresReview: boolean;
}

export function migrateOriaStandardV1ToV2(input: unknown): ThemeMigrationResult;
```

`importTheme()` 与 Runtime rehydrate 只在调用方显式注册 migration 时接受 v1 custom theme；否则返回 `UNSUPPORTED_CONTRACT`。

迁移步骤：

1. 重命名 path，例如 `typography.size.md → text.md`、`elevation.shadow.md → shadow.md`、`color.primaryForeground → color.primary.fg`。
2. 使用 v1 `spacing.1` 作为 `space` 候选，验证旧 scale 是否为该值的倍数。
3. 使用 v1 `shape.radius.sm` 作为 `radius` 候选，验证旧 radius 是否接近固定 v2 倍数。
4. control 长度除以 `space`，只有近似整数才写入 multiplier。
5. 任一几何值不一致、单位不可统一或无法保持视觉等价时，返回 `requiresReview: true` 与字段 warning；编辑器先 preview/确认，不自动写回 Storage。

官方 preset 必须在源码中重建为 v2，不经运行时迁移。Theme schema 与持久化容器 schema 可维持 `1`，因为外壳未变；兼容分界由 contract version 表示。

## 实施顺序与验收

1. 接受 ADR-0017，建立未来的 v2 规范，不覆盖 v1 当前规范。
2. Core 实现 Contract CSS naming、声明式派生变量、v2 contract、migration 和 unit tests。
3. 重建 Presets，更新 Editor Core smart scale 与字段分组，删除派生字段编辑。
4. Runtime/Bootstrap/Storage 接入 opt-in migration。
5. 后续发布 `@oriatheme/tailwind`，使用真实 Tailwind 4.3.3 CLI 验证默认和 custom-prefix bridge。
6. 更新 registry、示例、官网、双语指南和 migration guide，完成 pack/独立消费者 gate 后发布。

最低验收：v2 JSON 只存 134 个 source token；派生 geometry 单调且 control 均为整数倍；无效定义不产生部分 variables/stylesheet；Tailwind 真实生成 `bg-background`、`text-primary-foreground`、`text-base`、`font-semibold`、`p-4`、`rounded-lg`、`shadow-md`、`blur-lg` 与 `backdrop-oria-lg`；未注册 migration 的 v1 数据安全拒绝；全仓和发布 gate 全部通过。

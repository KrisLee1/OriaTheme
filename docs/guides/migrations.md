# 迁移与兼容性

[English](en/migrations.md) · [指南首页](README.md)

OriaTheme 使用四个相互独立的版本：npm package version、theme `schemaVersion`、Token Contract version 和持久化 state 的 `schemaVersion`。不要根据 npm 版本猜测持久化格式。

- theme `schemaVersion: 1` 只接受 v1 序列化格式；未知版本安全回退。
- 主题的 contract name/version 必须与运行时使用中的 contract 一致。接受其他 contract 的主题只有一条路径：调用方显式注册 migration（Runtime config 的 `migrations` 或 import API 的 `migrate`）；禁止静默丢弃 token。
- LocalStorage 损坏、无效 active theme、不可验证 custom theme 和写入失败均不会阻止内存状态继续工作。
- active snapshot 仅用于首屏变量；正式 runtime 启动后以主状态和 contract 重新验证。

从早期未版本化实现迁移时，先将原始数据转换为 `ThemeDefinition`，调用 `validateTheme()`，再通过 `importTheme()` 或 `createCustomTheme()` 保存。不要持久化 `resolvedMode`：只持久化 `appearance`。

## 0.1.x → `oria-standard@2`：默认 Contract 切换（breaking change）

本次发布把默认标准 Contract 从 `oria-standard@1` 切换为 `oria-standard@2`（ADR-0019）。v2 是默认且唯一的标准设计；v1 仅以 legacy 导出保留为迁移输入。Breaking changes 包括：

- 不传 contract 的 Core/Runtime API（`resolveTheme()`、`createOriaThemeRuntime()`、React/Vue 适配层、`createThemeFromSeed()` 等）现在解析 v2。`oriaStandardContract` 与 `oriaDefaultTheme` 指向 v2；v1 改由 `oriaStandardContractV1`、`oriaDefaultThemeV1` 导出。
- `@oriatheme/presets` 的全部导出（`oriaPresetThemes`、具名导出、`oriaPresetCatalog`）变为原生 v2 主题；v1 不再提供官方预设。预设 ID 不变。
- Runtime 输出的 CSS variables 改为全小写 kebab-case，并新增派生变量（见下文对照）。
- registry 的 `theme-editor` 组件升至 `0.2.0`，按 v2 contract 渲染，要求 `@oriatheme/core@^0.3.0`。
- 新增公开包 `@oriatheme/tailwind`（可选的 Tailwind v4 静态 bridge）。

### 升级步骤

1. 同一应用的全部 `@oriatheme/*` 依赖一起升级到同一发布批次；不要混用 0.1.x 与新版本。
2. 代码中显式引用 v1 contract 或默认主题的地方改用 `oriaStandardContractV1` / `oriaDefaultThemeV1`；不传 contract 的调用无需改动，默认即 v2。
3. 用户可能持有 v1 custom theme（Storage 中的持久化状态或导出的 `.oria-theme.json`）时，在 runtime config 显式注册迁移器：

   ```ts
   import { migrateOriaStandardV1ToV2 } from "@oriatheme/core";
   import { oriaPresetThemes } from "@oriatheme/presets";

   createOriaThemeRuntime({
     presets: oriaPresetThemes,
     defaultThemeId: "oria-default",
     migrations: [migrateOriaStandardV1ToV2],
   });
   ```

   React/Vue 适配层把同一字段透传给 runtime（`OriaThemeProvider config` / `createOriaTheme()`）。
4. 为 Bootstrap 声明 v2 contract ref，使 v1 snapshot 被安全拒绝（见「Bootstrap 与首屏」）：

   ```ts
   bootstrapTheme({ contract: { name: "oria-standard", version: 2 } });
   ```

5. 把应用自有样式中的 v1 CSS 变量名改为 v2 命名（见「v1 → v2 命名对照」）。
6. 使用 CLI 安装的编辑器组件时，重新安装或 diff `theme-editor@0.2.0` 模板。
7. 可选：Tailwind v4 项目接入 `@oriatheme/tailwind` 的静态 bridge。

### 持久化 v1 custom theme 的恢复语义

- 注册 `migrations` 后，runtime 首次 `start()` 会把 Storage 中的 v1 custom theme 逐个迁移、完整通过 v2 校验后原子应用，并立即把迁移结果写回主状态与 active snapshot；之后的启动直接读取 v2 数据，不重复迁移。
- 未注册 `migrations` 时，含 v1 custom theme 的持久化状态被整体安全拒绝：runtime 回退默认主题与空 custom 列表，经 `snapshot.error` / `onError` 报告，且不会在该次启动中覆盖原 Storage 数据。注册迁移器后重启即可恢复；注意拒绝状态下任何新的状态写回（例如用户切换主题）会以当前内存状态覆盖原数据。
- 指向官方预设的持久化偏好（`activeThemeId` 为预设 ID）不需要迁移：预设 ID 稳定，runtime 直接按新的 v2 预设解析。
- 持久化容器的 key 与 `schemaVersion` 不变（`{storageKey}:state:v1`、`:active:v1`）；兼容分界由 `contract.version` 表达。

### `requiresReview` 复核流程

`migrateOriaStandardV1ToV2(input)` 返回 `{ theme, warnings, requiresReview }`：input 必须是完整合法的 v1 标准主题，返回的 theme 已通过 v2 全量校验；任一环节失败都抛出错误，绝不部分迁移。

v2 的几何模型只持久化 `space` 与 `radius` 两个长度来源：radius scale 固定为 0.5/1/1.5/2/3/4/6/8 倍，control 高度与水平 padding 是 `space` 的 1–24 整数倍。无法精确落入该模型的 v1 值会取最近合法值并逐字段发出 warning——例如半径阶梯偏离固定倍数、control 长度不是 `space` 的整数倍、单位无法比较时回退为默认倍数。存在任何 warning 时 `requiresReview` 为 `true`。

- Core 的 `importTheme(json, { contract, migrate })` 在发生迁移时把 `warnings` / `requiresReview` 一并返回。应用应让用户预览迁移结果并显式确认后再保存；存在 warning 时不要静默写回。
- Runtime 的 `importTheme(json, options)` 自动使用已注册的迁移器（可用 `options.migrate` 覆盖），但只返回迁移后的主题、不携带 warnings。需要复核流程时改用 Core 的 `importTheme()`。
- 持久化恢复是无人值守路径：几何取整在首次启动时直接生效并写回。需要对每个主题逐一复核时，不要让用户数据走 rehydrate，改用显式导入路径。

### Bootstrap 与首屏

- v1 active snapshot（camelCase 变量、`contract.version: 1`）不能为 v2 页面提供首屏变量。为 `bootstrapTheme()` / `createBootstrapStorageScript()` 传入 `contract: { name: "oria-standard", version: 2 }` 后，v1 snapshot 因 contract 不匹配被安全拒绝，页面静默继续使用应用的静态默认 CSS；不要为这种正常回退显示错误提示。
- Runtime 首次成功应用 v2 主题后移除 bootstrap 样式并写入新的 v2 snapshot；第二次访问起首屏恢复生效。
- 未声明 contract 的 Bootstrap 调用不做这项拒绝检查，v1 snapshot 的旧变量可能被写入首屏直到 runtime 启动；升级到 v2 时必须补上声明。

### 官方预设直接重建

官方预设以 v2 源码原生定义，加载时不执行任何迁移。v2 几何归一（固定半径倍数、整数 control 倍数、移除 `spacing.density`）意味着个别预设的视觉与 v1 版本存在既有差异，这是本次发布接受的合约语义（ADR-0019）。曾从 v1 预设复制出的 custom theme 属于用户数据，按上文迁移路径处理。

### v1 → v2 命名对照

主题 JSON 的 token path（`$ref` 引用同样按下表改写）：

| v1 | v2 |
|---|---|
| `color.background` / `color.foreground` | `color.bg` / `color.fg` |
| `color.surfaceForeground` / `color.surfaceRaisedForeground` / `color.overlayForeground` | `color.surface.fg` / `color.surface.raised.fg` / `color.overlay.fg` |
| `color.primaryForeground` / `primaryHover` / `primaryActive`（secondary 同构） | `color.primary.fg` / `.hover` / `.active` |
| `color.mutedForeground` / `color.accentForeground` | `color.muted.fg` / `color.accent.fg` |
| `color.destructive` / `color.destructiveForeground` | `color.danger` / `color.danger.fg` |
| `color.successForeground` / `warningForeground` / `infoForeground` | `color.success.fg` / `warning.fg` / `info.fg` |
| `color.borderStrong` / `color.selectionForeground` | `color.border.strong` / `color.selection.fg` |
| `color.chart1` … `color.chart8` | `color.chart.1` … `color.chart.8` |
| `typography.font.*` | `font.*` |
| `typography.weight.*`（`extraLight` / `extraBold`） | `font.weight.*`（`extralight` / `extrabold`） |
| `typography.size.*` | `text.*` |
| `typography.lineHeight.*` / `typography.letterSpacing.*` | `leading.*` / `tracking.*` |
| `spacing.unit`、`spacing.density`、`spacing.{1,2,3,4,5,6,8,10,12,16}` | 移除，收敛为唯一 source `space`（取 v1 `spacing.1` 的值） |
| `shape.radius.{none,xs,sm,md,lg,xl,2xl,3xl,4xl,full}` | 移除，收敛为唯一 source `radius`（取 v1 `shape.radius.sm` 的值）；scale 由 Core 派生 |
| `shape.borderWidth.*` | `border.width.*` |
| `shape.focusRingWidth` / `shape.focusRingOffset` | `ring.width` / `ring.offset` |
| `control.height.{sm,md,lg}`（dimension） | `control.height.{sm,md,lg}`（`space` 的整数倍，1–24） |
| `control.paddingInline.{sm,md,lg}` | `control.padding.x.{sm,md,lg}`（`space` 的整数倍，1–24） |
| `elevation.shadow.*` | `shadow.*` |
| `effect.opacity.*` | `opacity.*` |
| `effect.blur.*` | `blur.*` |
| `effect.backdropBlur.*` / `effect.backdropSaturation` | `backdrop.blur.*` / `backdrop.saturate` |
| `gradient.background` / `gradient.surface` / `gradient.accent` | `gradient.bg` / `gradient.surface` / `gradient.accent` |
| `pattern.background` / `pattern.surface` | `pattern.bg` / `pattern.surface` |
| `motion.duration.*` | `duration.*` |
| `motion.easing.*`（`entrance`） | `ease.*`（`enter`） |

CSS variables（`--oria-` 前缀）：v1 保留 camelCase 分段，v2 全小写且 `.` 编译为 `-`。

| v1 | v2 |
|---|---|
| `--oria-color-background` | `--oria-color-bg` |
| `--oria-color-primaryForeground` | `--oria-color-primary-fg` |
| `--oria-color-destructive` | `--oria-color-danger` |
| `--oria-color-chart1` | `--oria-color-chart-1` |
| `--oria-typography-font-sans` / `--oria-typography-weight-semibold` | `--oria-font-sans` / `--oria-font-weight-semibold` |
| `--oria-typography-size-md` / `--oria-typography-lineHeight-relaxed` / `--oria-typography-letterSpacing-wide` | `--oria-text-md` / `--oria-leading-relaxed` / `--oria-tracking-wide` |
| `--oria-spacing-4` | `calc(var(--oria-space) * 4)` |
| `--oria-shape-radius-lg` | `--oria-radius-lg`（派生变量，不再持久化） |
| `--oria-shape-radius-full` | CSS 常量 `9999px`（`none` 为 `0`），不再是 token |
| `--oria-shape-borderWidth-default` / `--oria-shape-focusRingWidth` | `--oria-border-width-default` / `--oria-ring-width` |
| `--oria-control-height-md` / `--oria-control-paddingInline-md` | `--oria-control-height-md` / `--oria-control-padding-x-md`（均由 `space` × 整数倍派生） |
| `--oria-elevation-shadow-md` | `--oria-shadow-md` |
| `--oria-effect-opacity-muted` | `--oria-opacity-muted` |
| `--oria-effect-blur-lg` / `--oria-effect-backdropBlur-lg` / `--oria-effect-backdropSaturation` | `--oria-blur-lg` / `--oria-backdrop-blur-lg` / `--oria-backdrop-saturate` |
| `--oria-gradient-background` / `--oria-pattern-background` | `--oria-gradient-bg` / `--oria-pattern-bg` |
| `--oria-motion-duration-normal` / `--oria-motion-easing-standard` | `--oria-duration-normal` / `--oria-ease-standard` |

新增 source 变量 `--oria-space`、`--oria-radius`（`radius` 本身也是 source），派生变量 `--oria-radius-{xs,sm,md,lg,xl,2xl,3xl,4xl}` 与 `--oria-control-{height,padding-x}-{sm,md,lg}` 不进入主题 JSON、不可编辑。

### 同一发布中的预设更名：Document Canvas → Manuscript

- `oria-document-canvas` 更名为 `oria-manuscript`（Manuscript），具名导出 `oriaDocumentCanvasTheme` 同步改为 `oriaManuscriptTheme`；token 数据不变（ADR-0016）。
- 使用方需把 import 与按 ID 的引用（`defaultThemeId`、`setTheme` 等）改为新名称；没有其他代码变化。
- 最终用户无需操作：曾选择 Document Canvas 的持久化偏好在升级后按 runtime 既有语义回退默认主题，重新选择 Manuscript 即可。

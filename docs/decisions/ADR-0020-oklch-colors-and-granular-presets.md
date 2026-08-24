# ADR-0020：完整 OKLCH 颜色与单主题预设入口

- 状态：Accepted
- 日期：2026-08-24

## 背景

OriaTheme 的官方主题与基础色库此前物化为 HEX。它能直接作为 CSS color 使用，但应用在把主题色与独立透明度变量组合时，需要额外解析或转写颜色。与此同时，`@oriatheme/presets` 虽有具名导出，package 只有 root 入口且 root 会聚合完整目录；仅使用一两款官方主题的应用没有稳定的物理模块边界。

主题编辑器原先只复制或下载 JSON。开发者若要把编辑结果作为应用内置预设，仍需手工把 JSON 改成 TypeScript。

## 决定

1. `oria-standard@2` 默认主题、全部官方预设与 `@oriatheme/colors` 的公开颜色值使用完整的 `oklch(...)` CSS color；alpha 写在 OKLCH 的 `/ alpha` 段中。Runtime 仍把每个颜色变量输出为可直接用于 `color: var(--oria-color-*)` 的完整颜色，而不是只能嵌入函数的裸通道。
2. Core 接受并解析受限的静态 OKLCH，同时继续接受已发布的 HEX、RGB、HSL 与少量 named colors。现有 v2 自定义主题不被强制改写；v1 legacy 数据保持原表示，显式 v1→v2 migration 输出 OKLCH。
3. `@oriatheme/presets` 为 Default 和其余 40 款主题提供稳定子路径，例如 `@oriatheme/presets/ocean`。每个子路径只导出对应主题；package root 继续兼容全部具名导出、`oriaPresetThemes` 与 `oriaPresetCatalog`。
4. React/Vue registry item 提供共享的 TypeScript formatter。Export 菜单可复制可直接粘贴的 `ThemeDefinition` 代码，同时保留 Copy JSON 与 Download JSON；formatter 会把旧草稿中残留的 HEX 颜色写成 OKLCH。

## 替代方案

- 把 CSS variables 改为裸 OKLCH 通道：透明度组合较短，但会破坏把变量当作完整 CSS color 使用的既有样式。
- 只建议从 package root 具名导入：bundler 可能 tree-shake，但这不是稳定的单主题模块边界。
- 每款主题独立发布 npm 包：能获得最细粒度分发，但显著增加版本和依赖维护成本。
- 只保留编辑器 JSON 导出：不能直接满足源码内置主题的工作流。

## 影响

- 依赖 HEX 正则、字符串相等或 HEX 专用颜色解析器的 `@oriatheme/colors`、默认主题或官方预设使用方必须改为 CSS Color 4 / OKLCH-aware 处理；这是随 Changeset 发布的公开数据表示变化。
- 支持 OKLCH 的浏览器可直接消费 Runtime 输出。需要叠加透明度时优先使用 relative color syntax；兼容路径可使用 `color-mix(..., transparent)`。
- 子路径一经发布即是公开 API；不得无迁移删除或更名。root 入口仍是需要完整目录和 catalog 的推荐入口。
- Theme `schemaVersion`、Token Contract version 与 persisted-state version 均不变化，用户现有 HEX/RGB/HSL 主题仍有效。

## 迁移

- 若代码只把颜色值传给 CSS，无需修改。
- 若代码假设 `^#[0-9a-f]+$`，改为浏览器 CSS color 能力或 OKLCH-aware parser；不要把公开颜色值转换回 HEX 后再持久化。
- 只需要个别预设时，改从对应子路径导入并自行组成 runtime 的 `presets` 数组；需要完整目录时继续使用 package root。
- 应用内置编辑器产物时，使用 Export → Copy TypeScript，将生成的常量放入应用源码并传给 runtime。

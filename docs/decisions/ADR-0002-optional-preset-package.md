# ADR-0002：可选预设主题包

- 状态：Accepted
- 日期：2026-07-18

## 背景

`@oriatheme/core` 必须保持环境无关，且既有消费者已经使用其中的 `oriaDefaultTheme`。随着更多完整预设加入，将它们全部置入 core 会增加所有安装者的包体与维护范围。

## 决定

新增 `@oriatheme/presets`。该包仅依赖 `@oriatheme/core`，导出 `oriaPresetThemes` 及每个具名 preset；消费者按需安装并将集合传给 runtime 的 `presets` 配置。`oriaDefaultTheme` 保留在 core，以维持既有 API 兼容；新包将其重新导出并和新增主题一起组成集合。

每个预设必须是完整、不可变的 `ThemeDefinition`，使用标准 contract，并在两个颜色模式下通过 `validateTheme`、`resolveTheme` 和无诊断警告检查。

## 替代方案

- 将所有预设继续放入 core：无需新增依赖，但每位 core 使用者均下载全部主题。
- 每个预设独立一个 npm 包：最细粒度，但用户发现、版本管理与组合成本过高。

## 影响与迁移

- 新用户需要多款官方主题时安装 `@oriatheme/presets`。
- 既有仅使用 `oriaDefaultTheme` 的代码无需变更。
- 新包不包含 runtime、DOM 或框架适配代码，保持依赖方向为单向指向 core。

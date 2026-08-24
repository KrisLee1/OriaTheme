# 主题模型规范

## 基础类型

```ts
export type AppearanceMode = "light" | "dark" | "system";
export type ResolvedMode = "light" | "dark";
export type ThemeKind = "preset" | "custom";

export interface ThemeContractRef {
  name: string;
  version: number;
}

export interface ThemeDefinition {
  schemaVersion: 1;
  contract: ThemeContractRef;
  id: string;
  name: string;
  kind: ThemeKind;
  modes: {
    light: ThemeTokenSet;
    dark: ThemeTokenSet;
  };
  metadata?: ThemeMetadata;
  createdAt?: number;
  updatedAt?: number;
}

export type ThemeTokenSet = Readonly<Record<TokenPath, ThemeTokenInput>>;
```

ThemeDefinition v1 为了让每个模式可独立完整校验，仍在 `modes.light` 与 `modes.dark` 中物化全部 required token。编辑器层可以把稳定的设计属性声明为跨模式共享，并在写入时原子同步两套 token；这不新增顶层 `shared` 字段，也不改变 schemaVersion 1 的导入、导出或持久化格式。标准编辑器作用域见 [ADR-0006](../decisions/ADR-0006-shared-editor-token-scope.md)。

标准 contract 可以新增可选 token 而不改变 schemaVersion；缺失的可选 token 不输出 CSS 变量。`pattern.background` 与 `pattern.surface` 因而可按主题、按 mode 独立提供，其有序图层数组可表达多种叠加纹理。

## 身份规则

- `id` 匹配 `/^[a-z][a-z0-9-]{1,63}$/`。
- `schemaVersion` 描述序列化结构，contract version 描述 token 契约，两者独立演进。
- Preset 不可原地修改或删除；编辑 preset 必须复制为 custom。
- 外部导入主题一律变为 custom，不信任输入的 `kind: "preset"`。
- 时间为 Unix milliseconds；core 接受可注入 clock 以保证测试确定性。

## 官方预设分发

- `@oriatheme/core` 保留 `oriaDefaultTheme`，保证基础使用场景与已有 API 的兼容性。
- `@oriatheme/presets` 是可选安装包，重新导出默认主题，并提供 `oriaPresetThemes`、catalog、全部具名官方 preset 和每主题公开子路径。
- 只需要少量主题时从稳定子路径导入，例如 `import { oriaOceanTheme } from "@oriatheme/presets/ocean"`，再自行组成 runtime 的 `presets`；子路径只求值对应主题模块。需要完整目录或发现元数据时使用 package root 的 `oriaPresetThemes` / `oriaPresetCatalog`。root 具名导出继续兼容。
- 主题 ID 是稳定选择标识。官方显示名称可以在发布版本间更正；此类更正不得改变主题 ID、具名导出、公开子路径或 token 数据。主题 ID、具名导出与子路径的更名是例外事件，必须经 ADR 批准、随 minor 及以上版本发布并在迁移指南中记录持久化选择回退行为；当前唯一 ID/具名导出更名实例是 ADR-0016 的 `oria-document-canvas` → `oria-manuscript`。
- 所有官方 preset 必须使用标准 contract、`kind: "preset"`，且在 light/dark 下完整校验、解析并无关键对比度警告。
- 官方名称、分类、描述、灵感和计划状态以 [官方预设主题目录](preset-catalog.md) 为准；发布包中的目录项只保留主题引用与分类，不把文档和流程元数据写入 `ThemeDefinition` v1 或额外复制到运行时 bundle。

## 偏好与快照

```ts
export interface ThemePreference {
  activeThemeId: string;
  appearance: AppearanceMode;
}

export interface ThemeSnapshot {
  status: "idle" | "ready" | "error";
  preference: ThemePreference;
  resolvedMode: ResolvedMode;
  resolvedTheme: ResolvedTheme;
  presets: readonly ThemeDefinition[];
  customThemes: readonly ThemeDefinition[];
  error: OriaThemeError | null;
}
```

`appearance` 是用户选择；`resolvedMode` 根据 appearance 和系统偏好派生。后者不得覆盖前者或单独持久化。

## 模式解析

```text
appearance = light  → light
appearance = dark   → dark
appearance = system → matchMedia(prefers-color-scheme: dark)
```

只有 system 模式监听系统变化。系统变化不播放切换动画。

## 自定义主题生命周期

```text
Preset/Custom
  → duplicateTheme
  → Custom Draft
  → previewTheme
  → validateTheme
  → updateCustomTheme
  → persist + update active snapshot
```

- 编辑器 draft 属于消费应用，不应在每次输入时持久化。
- 官方编辑器的草稿与冲突语义见 [主题编辑器规范](theme-editor.md)；编辑规则不得在 React/Vue UI 中各自复制。
- `previewTheme()` 不改变持久化偏好，dispose 后恢复预览前主题。
- 删除当前 custom theme 后回退 default theme。
- 找不到当前 theme ID 时回退 default theme，同时记录可观察错误。

## Resolved Theme

```ts
export interface ResolvedTheme {
  themeId: string;
  contract: ThemeContractRef;
  mode: ResolvedMode;
  variables: Readonly<Record<`--${string}`, string>>;
  colorScheme: ResolvedMode;
}
```

ResolvedTheme 必须只包含经过 contract 验证、引用解析和 CSS 编译后的值，并且不可变。

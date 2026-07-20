# 自定义主题工作流

[English](en/custom-themes.md) · [指南首页](README.md)

主题编辑器应把 draft 保留在应用自身状态中，只有通过完整校验后才调用 runtime 保存。不要把未校验的用户字符串拼接为 CSS。

如果需要官方的多款完整主题，安装 `@oriatheme/presets` 并传入其集合：

```ts
import { oriaPresetThemes } from "@oriatheme/presets";

const runtime = createOriaThemeRuntime({
  presets: oriaPresetThemes,
  defaultThemeId: "oria-default"
});
```

Preset 仍不可编辑或删除；先复制为 custom，再进行业务侧修改。

```ts
const copied = runtime.duplicateTheme("oria-default", {
  id: "brand-2026",
  name: "Brand 2026"
});

runtime.updateCustomTheme(copied.id, {
  name: "Brand 2026 (refined)",
  modes: { light: draftLightTokens, dark: draftDarkTokens }
});
runtime.setTheme(copied.id);
```

使用 `previewTheme()` 展示草稿不会修改 preference 或 storage。调用 `dispose()` 后，它恢复最新正式状态，而不是预览开始时的旧状态。

外部主题导入使用 `runtime.importTheme(json)`。导入内容会强制转为 custom；不能覆盖 preset。应用应展示 `OriaThemeError.code` 或 validation issues，而不要依赖错误文案。

删除当前 custom 主题时，runtime 自动回退到配置的 default theme。Preset 不可修改或删除；先复制再编辑。

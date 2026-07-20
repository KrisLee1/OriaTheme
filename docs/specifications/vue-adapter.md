# Vue 适配层规范

## API

```ts
export function createOriaTheme(config: OriaThemeConfig): Plugin;
export function provideOriaTheme(config: OriaThemeConfig | OriaThemeRuntime): OriaThemeRuntime;

export function useOriaTheme(): {
  snapshot: DeepReadonly<ShallowRef<ThemeSnapshot>>;
  runtime: OriaThemeRuntime;
  setTheme: OriaThemeRuntime["setTheme"];
  setAppearance: OriaThemeRuntime["setAppearance"];
};
```

## 约束

- Adapter 不实现第二套状态机。
- 使用 `shallowRef` 保存 runtime snapshot，订阅回调替换引用。
- Vue 是 peer dependency，不进入 bundle。
- Plugin 与 provide/composable 共享相同行为。
- 应用卸载时清理自行创建的 runtime；外部 runtime 所有权归调用者。
- 未注入时抛出明确错误。
- 模块顶层不访问浏览器全局。

## 示例

```ts
import { createApp } from "vue";
import { createOriaTheme } from "@oriatheme/vue";

createApp(App)
  .use(createOriaTheme({ presets, defaultThemeId: "oria-default" }))
  .mount("#app");
```


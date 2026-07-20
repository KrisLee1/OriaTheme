# React 适配层规范

## API

```tsx
export function OriaThemeProvider(props: {
  config: OriaThemeConfig;
  runtime?: OriaThemeRuntime;
  children: React.ReactNode;
}): React.ReactElement;

export function useOriaTheme(): {
  snapshot: ThemeSnapshot;
  runtime: OriaThemeRuntime;
  setTheme: OriaThemeRuntime["setTheme"];
  setAppearance: OriaThemeRuntime["setAppearance"];
};

export function useThemeSnapshot<T>(
  selector: (snapshot: ThemeSnapshot) => T,
  isEqual?: (a: T, b: T) => boolean,
): T;
```

## 约束

- Provider 默认仅创建一个 runtime。
- 使用 `useSyncExternalStore`，不复制到 React state manager。
- 自行创建的 runtime 在卸载时 destroy；外部 runtime 所有权归调用者。
- Hooks 在 Provider 外抛出明确错误。
- Client-only 入口包含 `"use client"`，core/runtime 的纯入口不包含。
- React/React DOM 是 peer dependency，不进入 bundle。
- Selector 必须避免无关 snapshot 字段变化造成重渲染。
- Server snapshot 是稳定默认值；浏览器挂载后接管，不声称提供服务端用户主题解析。

## 示例

```tsx
"use client";

import { OriaThemeProvider } from "@oriatheme/react";

export function Providers({ children }: { children: React.ReactNode }) {
  const config = { presets, defaultThemeId: "oria-default" };

  return (
    <OriaThemeProvider config={config}>
      {children}
    </OriaThemeProvider>
  );
}
```

# 圆形主题扩散动画

[English](en/circular-theme-transition.md) · [指南首页](README.md)

OriaTheme 使用浏览器原生 View Transition 显示主题变化：新主题从触发控件的位置以圆形向外扩散。无需自行编写 `::view-transition-*` CSS；runtime 会管理动画样式、圆心、半径和清理。

动画默认关闭。每次需要动画的用户操作都必须同时满足：在 runtime 配置中启用 `transition`，并在主题变更调用中传入 `animate: true`。

## 通用规则

将控件中心作为 `origin`，可以让键盘、鼠标和触屏操作得到一致的圆心。`origin` 省略时 runtime 使用 viewport 中心。

```ts
function originFor(element: HTMLElement) {
  const rect = element.getBoundingClientRect();

  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}
```

`duration` 单位为毫秒，缺省为 360。runtime 将最终半径精确算至最远 viewport 角，再额外保留 2 CSS px 安全余量；这样既不会在结束帧留缝，也不会在中心触发时过早扩满视口。对 Chromium，root 快照会显式固定为 viewport 尺寸，使圆心始终对应触发控件的位置；同一时长的无视觉变化动画会替代浏览器默认根动画，确保扩散完整结束。下面的 500 可按产品节奏调整：

```ts
transition: { type: "view-transition", duration: 500 }
```

## 原生 Runtime DOM

```ts
import { createOriaThemeRuntime } from "@oriatheme/runtime-dom";
import { oriaPresetThemes } from "@oriatheme/presets";

const runtime = createOriaThemeRuntime({
  presets: oriaPresetThemes,
  defaultThemeId: "oria-default",
  transition: { type: "view-transition", duration: 500 },
});

runtime.start();

document.querySelector<HTMLButtonElement>("#dark-mode")?.addEventListener("click", (event) => {
  runtime.setAppearance("dark", {
    animate: true,
    origin: { x: event.clientX, y: event.clientY },
  });
});
```

若操作来自 `change`、键盘或没有可靠指针坐标的原生控件，改用其元素中心：

```ts
runtime.setTheme("oria-aurora", {
  animate: true,
  origin: originFor(themeSelect),
});
```

## React

在 Provider 配置中启用 transition。主题按钮通过 `useOriaTheme()` 请求动画：

```tsx
import { OriaThemeProvider, useOriaTheme } from "@oriatheme/react";
import { oriaPresetThemes } from "@oriatheme/presets";

function originFor(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function ThemeButton() {
  const { setTheme } = useOriaTheme();

  return <button onClick={(event) => setTheme("oria-aurora", {
    animate: true,
    origin: originFor(event.currentTarget),
  })}>Use Aurora</button>;
}

export function App() {
  return <OriaThemeProvider config={{
    presets: oriaPresetThemes,
    defaultThemeId: "oria-default",
    transition: { type: "view-transition", duration: 500 },
  }}><ThemeButton /></OriaThemeProvider>;
}
```

`select` 的 `onChange` 同样应取 `event.currentTarget` 的中心，而不是依赖缺失或不一致的指针坐标。

## Next.js App Router

Provider 和实际触发主题切换的组件都需要是 Client Component；`app/layout.tsx` 仍可保持 Server Component。

```tsx
// app/providers.tsx
"use client";

import { OriaThemeProvider } from "@oriatheme/react";
import { oriaPresetThemes } from "@oriatheme/presets";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <OriaThemeProvider config={{
    presets: oriaPresetThemes,
    defaultThemeId: "oria-default",
    transition: { type: "view-transition", duration: 500 },
  }}>{children}</OriaThemeProvider>;
}
```

```tsx
// app/theme-switch.tsx
"use client";

import { useOriaTheme } from "@oriatheme/react";

export function ThemeSwitch() {
  const { setAppearance } = useOriaTheme();

  return <button onClick={(event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setAppearance("dark", {
      animate: true,
      origin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    });
  }}>Dark mode</button>;
}
```

将 `Providers` 包在 `app/layout.tsx` 的 `<body>` 内容中即可。若刚修改了 workspace 中的 runtime 包，请重启 `pnpm dev:example:next` 或自己的 Next 开发服务器，以避免其继续使用旧的依赖构建产物。

## Vue

先在安装插件时启用 transition，再在组件事件中调用 composable 暴露的函数：

```ts
// main.ts
import { createApp } from "vue";
import { createOriaTheme } from "@oriatheme/vue";
import { oriaPresetThemes } from "@oriatheme/presets";
import App from "./App.vue";

createApp(App)
  .use(createOriaTheme({
    presets: oriaPresetThemes,
    defaultThemeId: "oria-default",
    transition: { type: "view-transition", duration: 500 },
  }))
  .mount("#app");
```

```vue
<script setup lang="ts">
import { useOriaTheme } from "@oriatheme/vue";

const { setAppearance } = useOriaTheme();

function enableDark(event: MouseEvent) {
  if (!(event.currentTarget instanceof HTMLElement)) return;
  const rect = event.currentTarget.getBoundingClientRect();

  setAppearance("dark", {
    animate: true,
    origin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
  });
}
</script>

<template>
  <button type="button" @click="enableDark">Dark mode</button>
</template>
```

## 自定义主题编辑

当正在编辑的 custom theme 已经是当前主题时，将同一组选项传给 `updateCustomTheme`，颜色变化也会圆形扩散：

```ts
runtime.updateCustomTheme("brand-2026", {
  modes: { light: updatedLightTokens, dark: updatedDarkTokens },
}, {
  animate: true,
  origin: originFor(colorInput),
});
```

如果 custom theme 还不是当前主题，先无动画更新其数据，再通过 `setTheme(customId, { animate: true, origin })` 切换过去，避免对不可见主题创建无意义的动画。

## 回退与排查

- 浏览器不支持 `document.startViewTransition` 时，主题仍会立即、原子地切换。
- 用户开启 `prefers-reduced-motion: reduce` 时，默认直接切换。不要为了强制动效而忽略此偏好。
- bootstrap、持久化恢复、系统模式变化和跨标签页同步不会动画；只应为明确的用户操作传入 `animate: true`。
- 若主题没有任何变化，检查 Provider/runtime 是否已挂载、`transition` 是否已配置，以及事件调用是否实际传入 `animate: true`。在 Next 中还应重启开发服务器后再测试。

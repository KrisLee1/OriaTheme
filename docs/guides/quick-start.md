# 快速开始

[English](en/quick-start.md) · [指南首页](README.md)

本指南让一个现有 React、Vue 或原生 Web 应用完成 OriaTheme 初始化、首屏恢复、主题切换和 CSS Variables 使用。只使用公开 package root exports。

> 公开 `@oriatheme/*` 包已发布到 npm（各包版本独立演进，以 npm latest 为准）。下面的安装命令适用于使用方项目；在本仓库开发请先阅读[开发者指南](development.md)。

## 1. 选择并安装

以下每组只执行一行，使用项目现有的包管理器；不要混用 lockfile。CLI runner 与安装后的 lockfile 流程见[包管理器兼容性](package-managers.md)。

React：

```bash
pnpm add @oriatheme/presets @oriatheme/runtime-dom @oriatheme/react
npm install @oriatheme/presets @oriatheme/runtime-dom @oriatheme/react
yarn add @oriatheme/presets @oriatheme/runtime-dom @oriatheme/react
bun add @oriatheme/presets @oriatheme/runtime-dom @oriatheme/react
```

Vue 3：

```bash
pnpm add @oriatheme/presets @oriatheme/runtime-dom @oriatheme/vue
npm install @oriatheme/presets @oriatheme/runtime-dom @oriatheme/vue
yarn add @oriatheme/presets @oriatheme/runtime-dom @oriatheme/vue
bun add @oriatheme/presets @oriatheme/runtime-dom @oriatheme/vue
```

不使用框架：

```bash
pnpm add @oriatheme/presets @oriatheme/runtime-dom
npm install @oriatheme/presets @oriatheme/runtime-dom
yarn add @oriatheme/presets @oriatheme/runtime-dom
bun add @oriatheme/presets @oriatheme/runtime-dom
```

`@oriatheme/presets` 提供 41 款完整主题；默认主题 `oriaDefaultTheme` 也可从 `@oriatheme/core` 单独导入。完整包选择见[包与公开入口](packages.md)。

## 2. 在框架挂载前恢复主题

默认 runtime 会把偏好和 custom themes 写入 LocalStorage。已访问用户可在框架挂载前恢复上次成功持久化的 active snapshot：

```ts
import { bootstrapTheme } from "@oriatheme/runtime-dom";

bootstrapTheme();
```

首次访问或 snapshot 无效时，Bootstrap 会静默回退；正式 runtime 随后重新校验完整状态并接管页面。SSR/SSG 和 Next.js 还需要静态默认主题，见 [Bootstrap 指南](bootstrap.md)。

## 3. 启动 Runtime

### React

```tsx
import { createRoot } from "react-dom/client";
import { OriaThemeProvider, useOriaTheme } from "@oriatheme/react";
import { oriaPresetThemes } from "@oriatheme/presets";
import { bootstrapTheme } from "@oriatheme/runtime-dom";

bootstrapTheme();

function ThemeControls() {
  const { snapshot, setAppearance, setTheme } = useOriaTheme();

  return (
    <div>
      <p>{snapshot.preference.activeThemeId} / {snapshot.resolvedMode}</p>
      <button onClick={() => setTheme("oria-ocean")}>Ocean</button>
      <button onClick={() => setAppearance("dark")}>Dark</button>
      <button onClick={() => setAppearance("system")}>System</button>
    </div>
  );
}

createRoot(document.querySelector("#root")!).render(
  <OriaThemeProvider config={{
    presets: oriaPresetThemes,
    defaultThemeId: "oria-default",
  }}>
    <ThemeControls />
  </OriaThemeProvider>,
);
```

### Vue

```ts
// main.ts
import { createApp } from "vue";
import { createOriaTheme } from "@oriatheme/vue";
import { oriaPresetThemes } from "@oriatheme/presets";
import { bootstrapTheme } from "@oriatheme/runtime-dom";
import App from "./App.vue";

bootstrapTheme();

createApp(App)
  .use(createOriaTheme({
    presets: oriaPresetThemes,
    defaultThemeId: "oria-default",
  }))
  .mount("#app");
```

```vue
<script setup lang="ts">
import { useOriaTheme } from "@oriatheme/vue";

const { snapshot, setAppearance, setTheme } = useOriaTheme();
</script>

<template>
  <p v-text="`${snapshot.preference.activeThemeId} / ${snapshot.resolvedMode}`" />
  <button @click="setTheme('oria-ocean')">Ocean</button>
  <button @click="setAppearance('dark')">Dark</button>
  <button @click="setAppearance('system')">System</button>
</template>
```

### 原生 Runtime DOM

```ts
import { oriaPresetThemes } from "@oriatheme/presets";
import { bootstrapTheme, createOriaThemeRuntime } from "@oriatheme/runtime-dom";

bootstrapTheme();

const runtime = createOriaThemeRuntime({
  presets: oriaPresetThemes,
  defaultThemeId: "oria-default",
});

runtime.start();
runtime.setTheme("oria-ocean");
runtime.setAppearance("system");

// 单页应用卸载时调用。
runtime.destroy();
```

## 4. 让组件使用主题

Runtime 在目标根节点原子写入 `--oria-*` variables，并维护 `data-oria-theme`、`data-oria-mode` 与 `color-scheme`：

```css
:root {
  color: var(--oria-color-fg);
  background: var(--oria-color-bg);
}

.card {
  color: var(--oria-color-surface-fg);
  background: var(--oria-color-surface);
  border: var(--oria-border-width-default) solid var(--oria-color-border);
  border-radius: var(--oria-radius-lg);
  box-shadow: var(--oria-shadow-md);
}
```

切换主题后不需要重建 CSS。使用 Tailwind v4 或稳定基础色库时，继续阅读[组件样式指南](component-styling.md)。

## 5. 验证结果

打开页面后确认：

- `<html>` 有 `data-oria-theme="oria-default"`（或当前主题）和 `data-oria-mode`。
- 切换到 Ocean 后卡片颜色、圆角、阴影等变量一起更新。
- `system` 只持久化用户偏好；`resolvedMode` 不会作为偏好保存。
- 刷新后，默认 Storage 配置会恢复上次成功保存的主题。

若变量未出现、刷新闪烁或包无法安装，见[故障排查](troubleshooting.md)。自定义主题、动画和可见编辑器分别见[自定义主题](custom-themes.md)、[圆形主题扩散](circular-theme-transition.md)和[主题编辑器](theme-editors.md)。

## 接下来：让项目立即见效

完成上述初始化后，按下面的目标继续集成：

| 想立刻完成的事 | 对应指南 |
| --- | --- |
| 使用 41 款官方预设主题，或确认所需 package | [包与公开入口：常见组合](packages.md#常见组合) |
| 让现有组件使用颜色、圆角、阴影等主题 variables | [组件样式](component-styling.md) |
| 将可见 React/Vue 主题编辑器 UI 安装到项目源码 | [主题编辑器](theme-editors.md) |
| 新建、预览、保存、导入或导出自定义主题 | [自定义主题](custom-themes.md) |
| 为 SSR、SSG 或 Next.js 消除首屏主题闪烁 | [Bootstrap](bootstrap.md) |

## 6. 运行完整示例，或以它为起点开发

仓库提供五个私有、可运行的示例，均使用公开 package root imports。React、Vue、Next 三个单页工作台展示预设主题切换、`light` / `dark` / `system`、主题 variables 驱动的产品组件、完整 Token 标本，以及默认关闭并按需加载的本地主题编辑器；`editor-next` 与 `editor-vue` 两个最小项目只挂载本地编辑器源码副本，用于验证编辑器的独立消费。先按[开发者指南](development.md#初始化工作区)初始化本仓库，再从根目录选择一个命令：

| 示例 | 技术栈与适合的起点 | 启动命令 |
| --- | --- | --- |
| `apps/examples/react` | React + Vite；用于 React 客户端应用 | `pnpm dev:example:react` |
| `apps/examples/vue` | Vue 3 + Vite；用于 Vue 3 应用 | `pnpm dev:example:vue` |
| `apps/examples/next` | Next.js；用于 SSR/SSG、静态默认主题和 Bootstrap 集成 | `pnpm dev:example:next` |

两个最小编辑器示例没有根级快捷命令，分别用 `pnpm --filter @oriatheme/example-editor-next dev` 与 `pnpm --filter @oriatheme/example-editor-vue dev` 启动。

可以在对应示例目录中修改页面、组件和本地 `components/oria-theme-editor/` 后继续开发；这些示例使用 workspace 依赖，不能直接复制到仓库外作为独立项目。若要在自己的项目中接入，请按本指南的安装步骤使用已发布包。示例功能与生产构建命令见 [apps/examples README](../../apps/examples/README.md) 和[开发者指南](development.md#运行示例)。

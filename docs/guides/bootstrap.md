# Bootstrap：在框架挂载前恢复主题

[English](en/bootstrap.md) · [指南首页](README.md)

`bootstrapTheme()` 用已持久化且已校验的 active snapshot 在页面启动时先写入一次 `--oria-*` CSS variables。它的目的只是减少已访问用户在首屏看到默认主题再切换到偏好主题的闪烁；它不是完整 runtime，也不会加载预设目录、恢复 custom themes 或运行动画。

正式 runtime 随后仍须启动。它会读取并重新校验完整持久化状态，订阅 system mode 与跨标签页更新，并成为唯一状态来源。

## 何时启用

当应用使用默认 LocalStorage 持久化且希望改善已访问用户的首屏主题一致性时，在框架挂载前调用：

```ts
import { bootstrapTheme } from "@oriatheme/runtime-dom";

bootstrapTheme({ contract: { name: "oria-standard", version: 2 } });
```

默认读取 `localStorage` 的 `oria-theme:active:v1`。首次访问、快照不存在、快照损坏、contract 或变量格式不匹配时会静默返回，应用继续使用自己的静态默认 CSS；不要为这种正常回退显示错误提示。

建议始终像上面一样显式声明 contract ref：声明后 Bootstrap 只恢复与该 contract 完全匹配的 snapshot。从 0.1.x 升级的应用尤其需要它——v1 运行期写入的旧 snapshot（camelCase 变量、`contract.version: 1`）会被安全拒绝，页面保持静态默认 CSS，直到 runtime 首次成功应用 v2 主题并写入新 snapshot；第二次访问起首屏恢复生效。未声明 contract 时不执行这项检查，v1 旧变量可能被写入首屏。完整升级步骤见[迁移指南](migrations.md)。

## React / Vite

在创建 React root 前调用 Bootstrap。Provider 仍然负责创建与启动完整 runtime：

```tsx
import { createRoot } from "react-dom/client";
import { bootstrapTheme } from "@oriatheme/runtime-dom";
import { OriaThemeProvider } from "@oriatheme/react";
import { oriaPresetThemes } from "@oriatheme/presets";
import { App } from "./App";

bootstrapTheme({ contract: { name: "oria-standard", version: 2 } });

createRoot(document.querySelector("#root")!).render(
  <OriaThemeProvider config={{
    presets: oriaPresetThemes,
    defaultThemeId: "oria-default",
  }}>
    <App />
  </OriaThemeProvider>,
);
```

## Vue / Vite

同样在 `createApp()` 与插件安装前运行：

```ts
import { createApp } from "vue";
import { bootstrapTheme } from "@oriatheme/runtime-dom";
import { createOriaTheme } from "@oriatheme/vue";
import { oriaPresetThemes } from "@oriatheme/presets";
import App from "./App.vue";

bootstrapTheme({ contract: { name: "oria-standard", version: 2 } });

createApp(App)
  .use(createOriaTheme({
    presets: oriaPresetThemes,
    defaultThemeId: "oria-default",
  }))
  .mount("#app");
```

## Next.js App Router

若只在 client-side Provider 模块顶层调用 `bootstrapTheme()`，脚本仍要等待 Next client bundle 下载和执行，首屏可能出现闪烁。App Router 应在 Server Component 的 `<head>` 中内联 `createBootstrapStorageScript()`；它在浏览器解析 HTML 时读取 LocalStorage 并恢复变量，不加载预设或完整 runtime。

```tsx
// app/layout.tsx
import { createBootstrapStorageScript } from "@oriatheme/runtime-dom";
import { Providers } from "./providers";

import type { ReactNode } from "react";

const bootstrapScript = createBootstrapStorageScript({ contract: { name: "oria-standard", version: 2 } });
const bootstrapScriptProps = {
  dangerouslySetInnerHTML: { __html: bootstrapScript },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script id="oria-theme-bootstrap" {...bootstrapScriptProps} /></head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
```

`createBootstrapStorageScript()` 只在已有 active snapshot 时写入变量；首次访问没有快照时会静默返回。因此 SSR 应在它之前提供使用方应用自己的完整默认主题 CSS，不能先绘制一份缺少 `--oria-*` 的页面再等待 Provider 启动。Next 示例通过服务端模块调用 Core `resolveTheme()` 解析 Default 的 light/dark 变量，并按系统模式输出静态 fallback：

```tsx
// app/layout.tsx
import { defaultThemeCss } from "./default-theme-style";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style id="oria-default-theme">{defaultThemeCss}</style>
        <script id="oria-theme-bootstrap" {...bootstrapScriptProps} />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
```

`defaultThemeCss` 只能由可信主题经 `resolveTheme()` 完整验证和解析后的变量生成；不得把请求参数、cookie 或其他未经校验的字符串拼接进 `<style>`。静态 fallback 在前，已保存主题 bootstrap 在后，runtime stylesheet 最后接管，三者按优先级覆盖而不发生部分应用。

Bootstrap 会在 hydration 前为 `<html>` 写入 `data-oria-theme`、`data-oria-mode` 和 `style.colorScheme`，而服务器无法读取用户的 LocalStorage。为该受控节点添加 `suppressHydrationWarning`，避免 Next 将这组预期差异报告为 hydration mismatch；不要把它添加到更大的子树，或用它掩盖其他不匹配。

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body><Providers>{children}</Providers></body></html>;
}
```

## 保持配置一致

若 runtime 改用 `storageKey`、`variablePrefix`、`contract` 或 `target`，Bootstrap 必须传入相同的值。否则 Bootstrap 会拒绝不匹配的快照，或写入与 runtime 不同的目标。

```ts
import { bootstrapTheme, createOriaThemeRuntime } from "@oriatheme/runtime-dom";

const themeConfig = {
  presets,
  defaultThemeId: "oria-default",
  storageKey: "acme-theme",
  variablePrefix: "acme",
};

bootstrapTheme({
  storageKey: themeConfig.storageKey,
  variablePrefix: themeConfig.variablePrefix,
});

const runtime = createOriaThemeRuntime(themeConfig);
runtime.start();
```

使用 `storage: false` 或自定义 `ThemeStorage` 时，没有默认 LocalStorage active snapshot 可供 Bootstrap 读取。除非应用自行提供已校验的 snapshot，否则不要调用它来假装恢复用户偏好。

## 服务端提供已校验快照（可选）

`createBootstrapScript({ snapshot })` 只接受已经通过校验的 active snapshot，并返回可嵌入 HTML 的自包含脚本；无效输入返回空字符串。它不会从浏览器 LocalStorage 自动读取数据。

`createBootstrapStorageScript()` 则生成浏览器读取默认 LocalStorage snapshot 的早期脚本，适合 Next `<head>`。它只支持 document target；改用 ShadowRoot 或自定义 `ThemeStorage` 时，应使用调用方已校验 snapshot 的 `createBootstrapScript()`，或维持常规 `bootstrapTheme()`。

仅在服务端确实拥有、并获准使用该用户主题 snapshot 时才考虑 `createBootstrapScript({ snapshot })` 路径。不要把未经校验的请求参数、cookie 或用户字符串拼接到 stylesheet 或 inline script。

## 与动画和持久化的关系

- Bootstrap 从不运行 View Transition；只对明确的用户操作传入 `animate: true`。
- runtime 成功持久化主题后才会写入下一次 Bootstrap 使用的 active snapshot。
- Bootstrap 不替代 runtime 的完整状态校验；runtime 启动后可以覆盖 Bootstrap 的首屏变量，这属于正常接管。

三个可运行示例可作为参考：React 与 Vue 在 `main` 入口调用，Next.js 在 `app/layout.tsx` 的 `<head>` 输出早期脚本。

编辑器拆包、SSR/SSG 判断与三框架性能验证见[性能集成指南](performance.md)。

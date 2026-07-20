# 性能集成：首屏主题与编辑器按需加载

[English](en/performance.md) · [指南首页](README.md)

本指南说明 Host 应用如何避免主题初始化造成的首屏重排，并让默认关闭的 ThemeEditor 不进入普通页面初始 bundle。主题校验、解析、原子 stylesheet 替换和持久化仍由 OriaTheme 的 Core、Runtime 与 Editor Core 负责；本页只处理应用集成与代码拆分。

## 先判断页面如何产生首屏 HTML

| 页面类型 | 是否需要静态默认主题变量 | 首屏偏好恢复 | 编辑器加载 |
|---|---|---|---|
| React/Vue Vite SPA，HTML 只有空挂载节点 | 通常不需要 | 在框架挂载前调用 `bootstrapTheme()` | 用户打开时动态加载 |
| SSR、SSG 或预渲染页面 | 必须 | 在 `<head>` 执行 `createBootstrapStorageScript()` | client-only 动态加载 |
| SPA 的静态 HTML shell 已使用 `--oria-*` | 必须 | 在框架挂载前调用 `bootstrapTheme()` | 用户打开时动态加载 |

SSR 默认主题修复只在浏览器执行 JavaScript 之前，页面已经输出并展示依赖 `--oria-*` 的内容时必需。典型场景包括 SSR、SSG、预渲染页面，以及自行在 `index.html` 中编写主题化静态 shell 的 SPA。

标准 Vite SPA 的 HTML 只有 `<div id="root">` 或 `<div id="app">`，页面内容在 Bootstrap 和 runtime 准备后才挂载，因此不需要照搬 Next 的 SSR fallback。但仍应在 `createRoot()` / `createApp()` 前调用 `bootstrapTheme()`，恢复已访问用户的 active snapshot。

## 三层首屏职责

首屏主题按以下顺序接管：

1. **静态默认主题**：只为首次访问或无有效 snapshot 的 SSR/SSG/预渲染页面提供完整默认变量。
2. **Storage bootstrap**：在已有 active snapshot 时，于框架挂载前覆盖静态默认值。
3. **Runtime**：客户端启动后重新校验完整状态、订阅系统模式与跨标签页更新，并成为唯一状态来源。

静态默认 CSS 只能由可信主题经 `resolveTheme()` 完整验证和解析后的变量生成。不要将 URL 参数、cookie、Storage 原文、导入 JSON 或其他用户字符串直接拼接进 stylesheet；不要持久化 `resolvedMode`。

Bootstrap 的持久化语义与其他框架入口见[首屏主题 Bootstrap](bootstrap.md#nextjs-app-router)；完整 Next 性能实现见本文后续章节。

## React / Vite：延迟加载编辑器

入口仍需在 React 挂载前恢复已保存主题：

```tsx
import { createRoot } from "react-dom/client";
import { bootstrapTheme } from "@oriatheme/runtime-dom";

bootstrapTheme();

createRoot(document.querySelector("#root")!).render(/* Provider + App */);
```

Host 页面使用 `lazy()`，将本地 registry 安装副本转换为异步 chunk。以下片段只展示加载边界，假设页面已经从 `useOriaTheme()` 获得 `runtime`，并按当前主题准备好 `editorOptions`：

```tsx
import { lazy, Suspense, useState } from "react";

const ThemeEditor = lazy(() =>
  import("./components/oria-theme-editor/index.js")
    .then(module => ({ default: module.ThemeEditor })),
);

export function ThemeControls() {
  const [editorShown, setEditorShown] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setEditorShown(true)}>
        Open theme editor
      </button>
      {editorShown ? (
        <aside id="theme-editor-panel">
          <Suspense fallback={<div role="status">Loading theme editor…</div>}>
            <ThemeEditor options={editorOptions} runtime={runtime} />
          </Suspense>
        </aside>
      ) : null}
    </>
  );
}
```

- `theme-editor.css` 必须继续由动态加载的 `ThemeEditor` 入口内部 import。
- 不要从 `main.tsx`、全局 CSS 或普通页面再次静态 import 编辑器样式。
- 只有 `editorShown` 为真时才挂载编辑器，避免提前创建 editor session。
- Loading 状态使用 `role="status"`，并维持侧栏稳定尺寸，避免异步加载造成新的布局跳动。

## Vue / Vite：延迟加载编辑器

Vue 同样在 `createApp()` 前 Bootstrap：

```ts
import { createApp } from "vue";
import { bootstrapTheme } from "@oriatheme/runtime-dom";

bootstrapTheme();
createApp(App).use(oriaThemePlugin).mount("#app");
```

Host 使用 `defineAsyncComponent()`。以下片段同样假设现有 Host 已提供 `runtime` 与 `editorOptions`，只展示异步组件和条件挂载：

```ts
import { defineAsyncComponent, defineComponent, h, ref } from "vue";

const EditorLoading = defineComponent({
  setup: () => () => h(
    "div",
    { role: "status" },
    "Loading theme editor…",
  ),
});

const ThemeEditor = defineAsyncComponent({
  loader: () => import("./components/oria-theme-editor/index.js")
    .then(module => module.ThemeEditor),
  loadingComponent: EditorLoading,
  delay: 0,
});

export default defineComponent({
  setup() {
    const editorShown = ref(false);

    return () => h("div", [
      h("button", { type: "button", onClick: () => { editorShown.value = true; } }, "Open theme editor"),
      editorShown.value
        ? h("aside", { id: "theme-editor-panel" }, [
            h(ThemeEditor, { options: editorOptions, runtime }),
          ])
        : null,
    ]);
  },
});
```

若应用使用 SFC template，也应保持相同边界：异步组件只在打开状态下渲染，编辑器 SFC 自己引入 `theme-editor.css`，普通页面不引入它。

## Next.js App Router：静态 fallback + client-only 编辑器

Next 页面同时需要解决两个独立问题：

1. SSR/SSG 输出的页面在首次绘制前必须已有完整默认主题变量。
2. 默认关闭的编辑器不应加入首页 client bundle。

### 1. 从可信默认主题生成静态 fallback

在只运行于服务端或构建期的模块中，通过公开 Core API 完整解析默认主题的 light/dark 变量。以下实现对应 `app/default-theme-style.ts`：

```ts
import { oriaDefaultTheme, resolveTheme } from "@oriatheme/core";

type CssVariables = Readonly<Record<`--${string}`, string>>;

function declarations(variables: CssVariables): string {
  return Object.entries(variables)
    .map(([name, value]) => `${name}:${value}`)
    .join(";");
}

const light = resolveTheme(oriaDefaultTheme, "light");
const dark = resolveTheme(oriaDefaultTheme, "dark");

export const defaultThemeCss =
  `:root{${declarations(light.variables)};color-scheme:light}` +
  `@media(prefers-color-scheme:dark){:root{${declarations(dark.variables)};color-scheme:dark}}`;
```

这里序列化的是 `resolveTheme()` 的验证和解析结果，而不是主题文件原文。不要读取 URL 参数、cookie、Storage 原文或导入 JSON 后直接生成 CSS。静态 fallback 也不保存 `resolvedMode`：系统模式只通过 `prefers-color-scheme` 选择首次默认样式，正式 preference 仍归 runtime 管理。

如果默认主题不是 `oriaDefaultTheme`，替换为应用自己的可信默认主题，并确保它与 runtime 的 `defaultThemeId` 指向同一视觉基线。

### 2. 在根 layout 中建立覆盖顺序

根 layout 按“静态默认变量 → 已保存主题 bootstrap → Provider/runtime”输出：

```tsx
import type { ReactNode } from "react";
import { createBootstrapStorageScript } from "@oriatheme/runtime-dom";
import { defaultThemeCss } from "./default-theme-style";
import { Providers } from "./providers";

const bootstrapScript = createBootstrapStorageScript();
const bootstrapScriptProps = {
  dangerouslySetInnerHTML: { __html: bootstrapScript },
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style id="oria-default-theme">{defaultThemeCss}</style>
        <script
          id="oria-theme-bootstrap"
          {...bootstrapScriptProps}
        />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
```

覆盖行为如下：

- 首次访问没有 active snapshot：Storage bootstrap 静默返回，页面继续使用静态默认变量。
- 已保存有效 snapshot：Storage bootstrap 在 hydration 前覆盖静态默认变量。
- Client runtime 启动：重新校验完整状态并原子接管 stylesheet、DOM 属性、系统模式和跨标签页更新。

`suppressHydrationWarning` 只放在 bootstrap 会受控修改属性的 `<html>`，不得扩大到 `<body>` 或页面内容子树，以免掩盖真实 hydration 错误。

### 3. 保持四项配置一致

| 配置 | 静态 fallback | Storage bootstrap | Provider/runtime |
|---|---|---|---|
| 默认主题 | 解析同一可信默认主题 | active snapshot 中记录当前主题 | `defaultThemeId` 指向同一默认主题 |
| `storageKey` | 不读取 Storage | 传给 `createBootstrapStorageScript()` | 传给 runtime config |
| `variablePrefix` | 传给 `resolveTheme()` | 传给 `createBootstrapStorageScript()` | 传给 runtime config |
| contract | 传给 `resolveTheme()` | 传入相同 contract ref | 传给 runtime config |

任一项不一致都可能使 Bootstrap 拒绝 snapshot，或者让静态 CSS 与 runtime 使用不同变量名。不要把 preset 全集或完整 runtime 打包进 `<head>`；静态 fallback 只需要当前默认主题解析后的变量。

### 4. 将编辑器改为 client-only 动态 chunk

Client Component 使用 `next/dynamic`：

```tsx
"use client";

import dynamic from "next/dynamic";

const ThemeEditor = dynamic(
  () => import("./components/oria-theme-editor")
    .then(module => module.ThemeEditor),
  { ssr: false },
);
```

仍然只在打开状态下挂载组件：

```tsx
{editorShown ? (
  <aside id="theme-editor-panel">
    <ThemeEditor options={editorOptions} runtime={runtime} />
  </aside>
) : null}
```

- `theme-editor.css` 继续由动态入口内部 import，不从根 layout、全局 stylesheet 或普通首页入口静态 import。
- 关闭状态不挂载隐藏编辑器，不提前创建 editor session，也不请求编辑器 JS/CSS。
- 页面必须导入自己的本地 registry 组件，不得改为从 `node_modules` 加载完整黑盒 UI，也不得复制 editor-core/runtime 状态机。
- 如动态加载可被用户明显感知，应为 `next/dynamic` 增加使用 `role="status"` 的 Loading UI，并维持侧栏尺寸稳定。

### 5. 添加回归测试

静态 fallback 至少覆盖以下单元测试：

```ts
import { describe, expect, it } from "vitest";
import { oriaDefaultTheme, resolveTheme } from "@oriatheme/core";
import { defaultThemeCss } from "./default-theme-style";

describe("Next default theme SSR style", () => {
  it("contains complete light and dark fallbacks", () => {
    const light = resolveTheme(oriaDefaultTheme, "light").variables;
    const dark = resolveTheme(oriaDefaultTheme, "dark").variables;

    expect(defaultThemeCss).toContain(`--oria-color-background:${light["--oria-color-background"]}`);
    expect(defaultThemeCss).toContain("@media(prefers-color-scheme:dark)");
    expect(defaultThemeCss).toContain(`--oria-color-background:${dark["--oria-color-background"]}`);
    expect(defaultThemeCss.match(/--oria-[a-zA-Z0-9-]+:/g))
      .toHaveLength(Object.keys(light).length + Object.keys(dark).length);
  });

  it("cannot terminate its style element or introduce external CSS", () => {
    expect(defaultThemeCss).not.toMatch(/[<>]/);
    expect(defaultThemeCss).not.toMatch(/\b(?:url|expression)\s*\(/i);
  });
});
```

Production build 后还需确认：

- 静态 HTML 中 `oria-default-theme` 位于 `oria-theme-bootstrap` 之前。
- HTML 同时包含 light/dark 默认变量，但不直接引用编辑器 CSS。
- 编辑器实现和 `theme-editor.css` 位于独立异步 chunk。
- 新浏览器上下文没有 LocalStorage active snapshot 时，首次访问无 hydration error、主题闪烁或布局位移。
- 实际打开编辑器后，动态资源、焦点、关闭、dirty 保护和自动预览仍正常。

## 验证是否真正拆包

从项目根目录执行对应 production build：

```bash
pnpm --filter @oriatheme/example-react build
pnpm --filter @oriatheme/example-vue build
pnpm --filter @oriatheme/example-next build
```

检查结果：

- 普通首页 HTML 只引用页面 JS/CSS，不引用编辑器 CSS。
- 构建目录存在独立的编辑器 JS 和 CSS chunk。
- 首次打开编辑器后才请求这些资源。
- 编辑器打开期间 Loading 状态可读；加载完成后键盘、焦点、关闭、dirty 保护和自动预览仍正常。
- SSR/SSG 使用无 LocalStorage active snapshot 的新浏览器上下文验证，确认没有 hydration error、主题闪烁或布局位移。

## 当前仓库的可复现结果

以下数据只用于验证本仓库拆包是否生效，不是对所有设备和应用的性能承诺。

| 示例 | 优化前 | 优化后 | 按需编辑器资源 |
|---|---|---|---|
| React/Vite JS（gzip） | 117.27 kB | 100.43 kB | 18.37 kB |
| Vue/Vite JS（gzip） | 87.41 kB | 67.96 kB | 21.93 kB |
| React/Vue CSS（gzip） | 约 20 kB | 10.98 kB | 10.00 kB |
| Next 首页 JS | 25.2 kB | 8.98 kB | 独立动态 chunk |
| Next First Load JS | 158 kB | 142 kB | 独立动态 chunk |

Next 在同一套单次移动端 Lighthouse 配置中由 Performance 75 / CLS 0.685 改善为 Performance 99 / CLS 0。正式发布前应使用多轮中位数、真实部署网络和目标设备复验。

React/Vite 优化后的单次移动端 Lighthouse 12.8.2 production 复测为 Performance 100、FCP 1.357s、LCP 1.543s、Speed Index 1.357s、TBT 14ms、CLS 0。首屏只请求页面 HTML、一个 100.9 kB 传输 JS 和一个 11.3 kB 传输 CSS，没有请求 62.37 kB 的编辑器 JS 或 77.89 kB 的编辑器 CSS 原始资源，说明动态加载边界生效。

该 React 示例仍一次渲染完整 26×11 色库，Lighthouse 记录 2,019 个 DOM 元素、约 421ms Style & Layout 和约 661ms Rendering。这是示例内容本身的主要剩余性能余量；本次报告没有布局偏移、强制回流、50ms 以上长任务或编辑器首屏执行证据。若真实产品不需要在首页展示整套色库，不应照搬该 DOM 规模；若确实需要，可考虑折叠后渲染、分段挂载或虚拟化。单次 100 分同样不是普遍性能承诺。

## 常见失误

- 在 SSR 页面只加入 Storage bootstrap，却没有首次访问可用的静态默认主题 CSS。
- 在 Vite SPA 中无条件复制 SSR fallback，增加首屏 HTML 体积但没有实际收益。
- 使用动态组件，却从全局入口静态 import `theme-editor.css`，导致 CSS 仍在首屏下载。
- 组件已动态加载，但页面初始状态仍挂载隐藏的编辑器，提前创建 session 并执行渲染。
- 为消除闪烁而隐藏整个页面直到 JavaScript 启动；这会牺牲 FCP，也不能替代稳定的 SSR 默认样式。
- 将未经 Core 验证的用户输入直接写进 `<style>`。

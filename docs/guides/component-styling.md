# 组件样式使用方式

[English](en/component-styling.md) · [指南首页](README.md)

OriaTheme runtime 负责校验、解析和写入动态 `--oria-*` 语义 CSS variables；`@oriatheme/colors` 另行提供稳定完整的基础色。组件可以直接引用变量，也可以使用 Tailwind CSS utility。语义 utility 会响应主题切换，基础颜色 utility 保持稳定。

不要为每个 preset 建立一套静态样式或 Tailwind 配置，也不要把运行时主题值拼接为 class name。主题 ID、颜色模式、持久化和 View Transition 始终由 OriaTheme runtime 管理。

## 方式一：直接使用 OriaTheme CSS variables

这是官方示例当前采用的方式，适合不使用原子化 CSS 的项目。只需在应用 CSS 中引用 semantic token：

```css
:root {
  background: var(--oria-color-background);
  color: var(--oria-color-foreground);
}

.card {
  padding: 1.5rem;
  background: var(--oria-color-surfaceRaised);
  border: var(--oria-shape-borderWidth-default) solid var(--oria-color-border);
  border-radius: var(--oria-shape-radius-lg);
  box-shadow: var(--oria-elevation-shadow-md);
}

.primary-button {
  color: var(--oria-color-primaryForeground);
  background: var(--oria-color-primary);
}

.textured-page {
  /* Background pattern 位于可选背景渐变和基础背景色上方。 */
  background:
    var(--oria-pattern-background, none),
    var(--oria-gradient-background, var(--oria-color-background));
}

.patterned-card {
  /* 可选 pattern 缺失时保持普通表面。 */
  background:
    var(--oria-pattern-surface, none),
    var(--oria-color-surfaceRaised);
}
```

主题切换后无需重建 CSS 或重新渲染：变量的新值会立即被所有已匹配的规则使用。

## 方式二：完整稳定基础色库与 Tailwind 标准类名

安装并在全局 CSS 导入一次：

```bash
# 选择一种
pnpm add @oriatheme/colors
npm install @oriatheme/colors
yarn add @oriatheme/colors
bun add @oriatheme/colors
```

四种工具的 lockfile 与 CLI 规则见[包管理器兼容性](package-managers.md)。

```css
@import "tailwindcss";
@import "@oriatheme/colors/styles.css";
@import "@oriatheme/colors/tailwind.css";
```

`styles.css` 提供与 Tailwind CSS 4.3.3 默认主题一致的 26 个家族名（red、orange、amber、yellow、lime、green、emerald、teal、cyan、sky、blue、indigo、violet、purple、fuchsia、pink、rose、slate、gray、zinc、neutral、stone、mauve、olive、mist、taupe）的 50–950 阶梯，以及 inherit、current、transparent、black、white。`tailwind.css` 将它们映射到 Tailwind v4 的标准 `--color-*` 命名，因此可直接使用：

```tsx
<div className="border border-slate-200 bg-blue-500 text-white">
  <span className="text-sky-300">Oria colors</span>
</div>
```

兼容的是 Tailwind 的颜色家族、阶梯和由此生成的标准类名；具体颜色值由 OriaTheme 独立设计，不复制 Tailwind 默认值。Tailwind 仍只为扫描到的类名生成 utility。基础色 variables 由静态 CSS 一次加载，不进入 ThemeDefinition、Storage 或 runtime stylesheet，也不会在主题切换时重写。

## 方式三：Tailwind CSS 使用 OriaTheme 语义 variables

Tailwind 适合应用层的布局、间距和组件组合。以 Tailwind CSS v4 为例，在全局 CSS 中将 OriaTheme 的语义变量注册为 Tailwind theme variables：

```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--oria-color-background);
  --color-foreground: var(--oria-color-foreground);
  --color-surface: var(--oria-color-surface);
  --color-surface-raised: var(--oria-color-surfaceRaised);
  --color-primary: var(--oria-color-primary);
  --color-primary-foreground: var(--oria-color-primaryForeground);
  --color-border: var(--oria-color-border);
  --color-muted: var(--oria-color-mutedForeground);

  --radius-sm: var(--oria-shape-radius-sm);
  --radius-lg: var(--oria-shape-radius-lg);
  --shadow-md: var(--oria-elevation-shadow-md);
}
```

之后在 React、Next 或 Vue 模板中使用语义 utility：

```tsx
<main className="min-h-screen bg-background text-foreground">
  <section className="rounded-lg border border-border bg-surface p-4">
    <button className="rounded-sm bg-primary px-4 py-2 text-primary-foreground">
      Save changes
    </button>
  </section>

  <article className="rounded-lg border border-border bg-surface-raised p-6 shadow-md">
    Theme-aware content
  </article>
</main>
```

`bg-primary`、`text-foreground` 和 `shadow-md` 在构建时由 Tailwind 生成一次，但最终值仍是 CSS variable。OriaTheme 更新变量时，Tailwind 样式会立即反映新主题，也会参与已启用的[圆形主题扩散动画](circular-theme-transition.md)。

只有采用 Tailwind 的应用才需要 Tailwind 构建依赖。`@oriatheme/colors`、`@oriatheme/core`、`@oriatheme/runtime-dom`、React/Vue 适配包都不把 Tailwind 作为使用方 runtime dependency。

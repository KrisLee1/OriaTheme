# OriaTheme examples

每个示例都是一个独立、可运行的页面，展示预设切换、`light/dark/system`、自定义主题强调色编辑，以及完整的静态 Oria Color Library（26 个家族 × 11 阶 + 5 个特殊色）、Semantic Color、Feedback Color、Chart Color、Typography、Shape、Elevation、Motion 和常见产品组件如何跟随 token 更新。

React、Vue 与 Next 共用 `apps/examples/styles.css`，页面的字体、字重、字距、行高、语义颜色、圆角、边框、间距、控件尺寸、层级、材质和动效均消费 runtime 的 `--oria-*` 变量；稳定基础色由 `@oriatheme/colors/styles.css` 一次性导入，不随主题切换重写，也不由主题编辑器修改。

页面先通过产品卡片、表单和数据视图展示主题切换效果，再展开随主题变化的设计变量标本，最后展示不随主题变化的完整 Static color foundations。主视觉使用由当前 primary、accent、info 与 warning variables 驱动的弥散渐变；四层光团采用错相闭环轨迹形成持续流动，`prefers-reduced-motion` 下停止动画。

在仓库根目录安装依赖后，选择一个开发服务器启动：

```bash
pnpm dev:example:react
pnpm dev:example:vue
pnpm dev:example:next
```

也可分别执行生产构建：

```bash
pnpm --filter @oriatheme/example-react build
pnpm --filter @oriatheme/example-vue build
pnpm --filter @oriatheme/example-next build
```

三个应用只从公开 package root imports 使用 OriaTheme；它们不会被 npm 发布。

## 最小编辑器复用验证

`editor-next` 与 `editor-vue` 是独立的最小消费项目。每个页面只挂载本地
`components/oria-theme-editor/` 中的 `ThemeEditor`；运行时、预设和框架桥接均从
公开 package root imports 获取。它们用于验证编辑器源码组件可复制到新的 Next.js
或 Vue 应用，而不依赖现有的主题工作台页面。

```bash
pnpm --filter @oriatheme/example-editor-next dev
pnpm --filter @oriatheme/example-editor-vue dev

pnpm --filter @oriatheme/example-editor-next build
pnpm --filter @oriatheme/example-editor-vue build
```

完整的启动顺序、React/Vue/Next.js 接入方式、回退语义与配置一致性要求请见[首屏主题 Bootstrap 指南](../../docs/guides/bootstrap.md)。

## 主题启动顺序与 Bootstrap

React 与 Vue 在各自的 `main` 入口中调用 `@oriatheme/runtime-dom` 的 `bootstrapTheme()`；Next.js 则将 `createBootstrapStorageScript()` 生成的早期脚本内联到 `<head>`，使浏览器在下载 React client bundle 前读取 `localStorage` 中 `oria-theme:active:v1` 的已校验快照并写入一次 CSS variables。随后各框架 runtime 启动，重新校验完整持久化状态并接管主题。

首次访问或快照无效时，Bootstrap 不会抛错，也不会加载预设全集或运行切换动画；页面继续使用静态默认样式。主题发生一次成功的持久化更新后，下一次启动即可使用 Bootstrap 降低首屏主题闪烁。

如需更改存储 key、变量前缀或目标节点，必须让 Bootstrap 与 runtime 使用同一组配置：

```ts
bootstrapTheme({ storageKey: "my-app", variablePrefix: "my-theme" });

// Provider / createOriaTheme 也传入相同的值。
const config = { storageKey: "my-app", variablePrefix: "my-theme", presets, defaultThemeId: "oria-default" };
```

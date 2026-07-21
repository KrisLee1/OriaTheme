# DOM Runtime 规范

## 配置

```ts
export interface OriaThemeConfig {
  contract?: TokenContract;
  presets: readonly ThemeDefinition[];
  defaultThemeId: string;
  defaultAppearance?: AppearanceMode;
  variablePrefix?: string;
  storage?: ThemeStorage | false;
  storageKey?: string;
  target?: Document | ShadowRoot;
  transition?: TransitionConfig | false;
  attributeAdapter?: AttributeAdapter;
  onError?: (error: OriaThemeError) => void;
}
```

默认值：标准 contract、`system`、`oria` 前缀、`oria-theme` storage key、当前 document、关闭动画。Document 只能在 `start()` 中惰性解析。

## Runtime API

```ts
createOriaThemeRuntime(config: OriaThemeConfig): OriaThemeRuntime;

export interface OriaThemeRuntime {
  start(): void;
  destroy(): void;
  getSnapshot(): ThemeSnapshot;
  subscribe(listener: () => void): () => void;

  setTheme(themeId: string, options?: ThemeChangeOptions): void;
  setAppearance(mode: AppearanceMode, options?: ThemeChangeOptions): void;

  createCustomTheme(input: NewCustomTheme): ThemeDefinition;
  updateCustomTheme(id: string, patch: CustomThemePatch, options?: ThemeChangeOptions): ThemeDefinition;
  duplicateTheme(id: string, identity: ThemeIdentity): ThemeDefinition;
  removeCustomTheme(id: string): void;

  previewTheme(theme: ThemeDefinition, mode?: ResolvedMode): PreviewHandle;
  exportTheme(id: string): string;
  importTheme(json: string, options?: ImportOptions): ThemeDefinition;
  reset(): void;
}
```

## 生命周期

- `start()`、`destroy()` 幂等。
- start 前可读取默认 idle snapshot，不访问浏览器 API。
- destroy 释放 media、storage、transition、subscriber 和 stylesheet 资源。
- Runtime 自行创建的 stylesheet 必须只移除自己的资源。
- 外部 store 每次逻辑变更最多通知每个 subscriber 一次。

## DOM 属性

默认设置：

```html
<html data-oria-theme="oria-default" data-oria-mode="dark">
```

并同步 `root.style.colorScheme`。不默认维护 `.dark` class；需要额外 class 或 attribute 时使用：

```ts
type AttributeAdapter = (context: {
  root: HTMLElement;
  themeId: string;
  resolvedMode: ResolvedMode;
}) => void | (() => void);
```

Adapter cleanup 必须在下一次调用和 destroy 时执行。

## Stylesheet 原子应用

1. Core 完整验证和 resolve。
2. Runtime 生成完整 CSS 文本。
3. 优先使用独占 `CSSStyleSheet.replaceSync()` 和 adoptedStyleSheets。
4. 不支持时回退唯一 `<style data-oria-theme-runtime>`，仅更新一次 textContent。
5. 更新属性和 snapshot。
6. 持久化主状态与 active snapshot。

失败时保留上一份有效 stylesheet，不得清空或部分应用。

## 并发与去重

- 相同 theme ID、mode 和 resolved variable hash 不重复写 DOM。
- 快速连续变更以最后状态为准。
- Transition 不能充当状态锁；动画进行中仍必须接受最新状态。
- 可以 coalesce 同一 event loop 的多次变更，但 subscriber 最终必须观察到正确状态。

## Phase 2 变更选项

```ts
interface ThemeChangeOptions {
  // 保留当前 preview；默认正式切换会结束 preview。
  preservePreview?: boolean;
  // 仅在 transition 配置启用时请求 View Transition。
  animate?: boolean;
  origin?: { x: number; y: number };
}
```

仅 `animate: true` 的用户主动 `setTheme`、`setAppearance` 或当前自定义主题编辑可请求动画；系统模式、rehydrate、跨标签页同步和 bootstrap 永远不动画。动画将新主题快照以圆形 `clip-path` 从 `origin` 扩散，半径取到最远 viewport 角的距离并额外留出 2 CSS px，避免取整残留且不会让中心触发过早扩满视口；根分组与新快照固定为 viewport 尺寸，使 Chromium 的裁切参考框与调用方 client 坐标一致。为规避 Chromium 对 View Transition 伪元素内 custom property 解析的回归，runtime 只将已规范化的有限数字写成该次动画专属的字面 CSS 值；根分组不保留浏览器默认动画，但以同一时长的无视觉变化动画保持伪元素树存活，避免 Chromium 在圆形结束前清理快照，并在完成或取消时清理 runtime 自有的临时 DOM 状态。

## Preview

- Preview 使用同一 contract 和原子应用流程。
- Preview 不修改 preference 或 storage。
- 同一 runtime 同时只允许一个 active preview；新 preview 自动 dispose 旧 preview。
- 正式 setTheme/setAppearance 默认结束 preview。
- `dispose()` 幂等并恢复当前正式 snapshot，而不是过期的历史 CSS。

## 系统模式

使用 `matchMedia("(prefers-color-scheme: dark)")`。仅 system preference 注册/响应 change，或者始终注册但只在 system 下提交；实现需保证 destroy 清理。系统变化不动画、不改写 appearance。

## 性能目标

- 单次主题提交最多一次 stylesheet 内容替换。
- 未订阅 snapshot 的应用组件不因主题切换发生 React/Vue 重渲染。
- 无轮询、无 MutationObserver。
- 50 个自定义主题下，切换成本只与当前 contract token 数相关。

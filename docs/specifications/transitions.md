# 切换动画规范

动画属于 runtime-dom，可选且默认关闭。通过 `OriaThemeConfig.transition` 启用后，用户可在 `setTheme`、`setAppearance` 或更新当前自定义主题的选项中显式请求动画。

```ts
export interface TransitionConfig {
  type: "view-transition";
  duration?: number;
  respectReducedMotion?: boolean;
}

export interface ThemeChangeOptions {
  animate?: boolean;
  origin?: { x: number; y: number };
}
```

## 行为

- 仅用户主动操作且 `animate: true` 时播放。
- bootstrap、rehydrate、系统模式变化和跨标签页同步不动画。
- `prefers-reduced-motion: reduce` 时直接提交。
- 不支持 View Transition 时直接提交。
- origin 缺省时使用触发元素中心（由 UI 计算传入）或 viewport 中心。
- runtime 将 origin 规范化为 viewport 内坐标，并计算覆盖最远 viewport 角的圆形半径；`duration` 使用毫秒，缺省为 420ms。
- 动画 CSS 使用 runtime 自有 `data-oria-transition` attribute 和 `--oria-transition-*` variables：旧快照保持静止，新快照以 `clip-path: circle()` 从 origin 扩散。不要求框架组件管理状态或注入 stylesheet。
- transition 完成、取消、销毁或被下一次动画取代后，runtime 必须清除上述 attribute 与 variables。

## 快速切换

动画不能阻止状态提交。新变更到达时可选择：

1. `skipTransition()` 结束旧动画并立即提交最新状态；或
2. 将视觉动画合并，但在旧动画完成后校验并补交最新状态。

v1 推荐方案 1，语义简单。新动画开始前 runtime 调用旧 transition 的 `skipTransition()`；无论实现选择，最终 DOM、runtime snapshot 和 storage 必须一致，且测试覆盖三次快速切换。

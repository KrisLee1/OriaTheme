# ADR-0011：补齐 Tailwind 4.3.3 尺度与颜色命名拓扑

- 状态：Accepted
- 日期：2026-07-19

## 背景

`oria-standard@1` 已覆盖常用排版、圆角、阴影与模糊能力，但与仓库锁定的 Tailwind CSS 4.3.3 默认主题相比仍缺少展示字号、完整行高/字距、超大圆角、极轻阴影，以及 blur 阶梯的低端和高端档位。Tailwind 4.3.3 还新增 mauve、olive、mist、taupe 四个默认颜色家族，而 `@oriatheme/colors` 仍停留在原先 22 个家族，因此其“Tailwind 默认颜色命名拓扑兼容”承诺已不完整。

项目尚未发布，可以在不制造历史迁移分支的前提下补齐当前 v1 Contract 和静态色库。

## 决定

1. `typography.size` 在 xs–4xl 之后增加 5xl、6xl、7xl、8xl、9xl；默认值为 3rem、3.75rem、4.5rem、6rem、8rem。
2. `typography.lineHeight` 增加 snug、loose，形成 tight、snug、normal、relaxed、loose；`typography.letterSpacing` 增加 tighter、wider、widest，形成 tighter、tight、normal、wide、wider、widest。
3. `shape.radius` 增加 3xl、4xl；`elevation.shadow` 增加位于 none 与 xs 之间的 2xs。
4. `effect.blur` 与 `effect.backdropBlur` 都采用 xs、sm、md、lg、xl、2xl、3xl 七档后缀。两套 token 保持独立值：前景 blur 默认 2/4/8/16/24/40/64px，backdrop blur 默认 4/8/14/20/28/40/64px。
5. `@oriatheme/colors` 增加 mauve、olive、mist、taupe，每族仍为 50–950 十一阶。家族名与 Tailwind 4.3.3 默认主题对齐，具体 HEX 继续由 OriaTheme 的独立 OKLCH 色阶生成器产生，不复制 Tailwind 色值。
6. React/Vue 编辑器继续由 Contract 动态描述字段；Blur 与 Backdrop 保持独立面板。编辑器数值范围必须容纳 9xl 字号、4xl 圆角与 3xl blur。
7. 由于尚未发布，`oria-standard` 名称/version、ThemeDefinition schema 和 Storage schema 均保持不变，不增加对 133-token 草稿或 22-family 色库的兼容层。预发布本地数据应按最新 Contract 重新创建。

## 替代方案

- 仅添加用户当前会直接使用的单个档位：会继续留下不完整、非对称的 scale，并使编辑器分组与 Tailwind 命名反复漂移。
- 只扩展前景 blur：Tailwind 的 blur theme 同时用于 `blur-*` 与 `backdrop-blur-*`，两套 Oria 面板后缀不一致会增加组件选择和主题迁移成本。
- 直接复制 Tailwind 四个新增家族的色值：能做到像素级一致，但会破坏 ADR-0007 确立的“命名兼容、颜色资产独立”边界。
- 在发布后新增 Contract v2：目前没有已发布消费者，提前制造版本和迁移路径没有收益。

## 影响

- `oria-standard@1` 从 133 个注册 token 增至 152 个；默认主题、36 款预设、editor-core 字段与 registry 映射随之同步。
- `@oriatheme/colors` 从 22×11+5（247）增至 26×11+5（291）个 TypeScript/CSS/Tailwind 颜色入口。
- 主题 JSON 会增加必需字段；这是首次发布前的直接修正，不提供旧草稿迁移。
- 三套示例和基础色选择器会自动展示四个新增家族；静态色库仍不进入 ThemeDefinition、runtime stylesheet 或 light/dark 持久化。

## 预发布处理

1. 清除按旧 Contract 保存的本地 custom theme 后重新创建。
2. 使用最新 `@oriatheme/colors/styles.css`；Tailwind v4 消费者同时使用最新 `tailwind.css` bridge。
3. CLI/registry 独立消费验收以 152 个字段和 291 个静态颜色入口为准。

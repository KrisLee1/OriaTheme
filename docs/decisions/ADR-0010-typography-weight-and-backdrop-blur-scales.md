# ADR-0010：细分字重与背景模糊阶梯

## 状态

Accepted

## 日期

2026-07-19

## 背景

`oria-standard@1` 原先只有 normal、medium、semibold、bold 四个字重，以及单一 `effect.backdropBlur`。组件因此需要在主题变量之外写入 620、650、680、22px、24px、28px 等局部常量；同一主题无法分别控制弱提示文字、标题、菜单、Popover 和厚对话框的层级。单一 backdrop blur 也无法让小菜单与大模态选择不同但协调的模糊强度。

## 决定

- 字重扩展为九级：`thin`、`extraLight`、`light`、`normal`、`medium`、`semibold`、`bold`、`extraBold`、`black`，默认对应 100–900。
- 将单一 `effect.backdropBlur` 替换为 `effect.backdropBlur.{sm,md,lg,xl}` 四级阶梯；默认分别为 8px、14px、20px、28px。
- 编辑器与示例组件按语义消费这些变量：小型局部效果使用 sm/md，工具栏与锚定菜单使用 lg，厚对话框使用 xl；字重不再写入介于标准级别之间的局部常量。
- editor-core 的 fontWeight 智能阶梯输出九级，blur 智能阶梯同时输出前景 blur 与 backdrop blur 两组四级值。
- 当前 contract 与包尚未发布，因此直接修正 `oria-standard@1`，不保留单一 backdrop token 的兼容别名，也不增加运行时迁移分支。标准 contract 从 125 个 token 增至 133 个。

## 替代方案

- 保留单一 backdrop token，并在 CSS 中用 `calc()` 推导：无法让主题作者独立校准各层级，且派生比例会成为隐藏 API。
- 只在编辑器声明局部变量：不能被页面组件复用，也无法通过主题 JSON 编辑和持久化。
- 保留旧 token 作为别名：尚未发布时会永久引入两个权威来源，不采用。

## 影响

- Core contract、默认主题、36 个预设、编辑器字段数量、CSS 输出与 registry 测试同步更新。
- 现有源码中的 `--oria-effect-backdropBlur` 改为带级别后缀的变量。
- 主题作者获得完整的 100–900 字重与四级背景模糊控制；组件仍负责选择语义级别。

## 迁移

项目尚未发布，无外部持久化迁移。仓库内预设把原有 backdrop blur 作为 lg 级并生成协调的 sm/md/xl；旧测试 fixture 与文档同步更新，不接受包含已移除单一 token 的新主题。

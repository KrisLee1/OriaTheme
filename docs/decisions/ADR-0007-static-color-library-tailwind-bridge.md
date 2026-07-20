# ADR-0007：静态基础色库与 Tailwind 类名桥接

- 状态：Accepted
- 日期：2026-07-19

## 背景

预发布实现曾把 neutral、brand、danger、success、warning、info 六族基础色阶作为可选 `palette.*` token 放入每个主题。它们因此会被主题编辑器当作可编辑数据、随 light/dark 重复序列化，并在存在时由 runtime 注入 CSS variables。这混合了两种生命周期不同的颜色：稳定、可复用的基础色库，以及会随主题和模式变化的语义颜色。

项目需要一套覆盖 Tailwind CSS 默认颜色命名拓扑的完整基础色库，同时保留 OriaTheme 自己的颜色值，并让 `bg-red-500`、`text-sky-300`、`border-slate-200` 等标准 Tailwind 类名直接工作。

## 决定

1. 新增独立发布包 `@oriatheme/colors`。它提供 red、orange、amber、yellow、lime、green、emerald、teal、cyan、sky、blue、indigo、violet、purple、fuchsia、pink、rose、slate、gray、zinc、neutral、stone 共 22 个家族，每族提供 50、100、200、300、400、500、600、700、800、900、950 十一个阶梯，并提供 inherit、current、transparent、black、white。
2. 颜色命名与阶梯拓扑兼容 Tailwind CSS，颜色值由 OriaTheme 独立设计和维护，不复制 Tailwind 默认色值。
3. `@oriatheme/colors/styles.css` 只注册稳定的 `--oria-palette-<family>-<step>` 变量；`@oriatheme/colors/tailwind.css` 使用 Tailwind v4 `@theme inline` 将标准 `--color-*` theme variables 映射到这些 Oria 变量。Tailwind 在消费项目构建时仅生成实际被扫描到的 utility；颜色包本身不是 runtime 的 Tailwind 依赖。
4. 在首次发布前直接从 `oria-standard@1` 移除全部 `palette.*` token，不制造尚无消费者的 contract version。ThemeDefinition 只保存动态语义颜色、排版、形状、间距、材质和动效；runtime 不再随每个主题重复注入基础色库。
5. 主题编辑器不把稳定基础色阶作为主题字段编辑。编辑器和消费应用可以使用 `@oriatheme/colors` 作为取色来源，最终写入的仍是 `color.*` 语义 token。
6. 官方预设不再保存或生成基础 palette；每款主题继续独立定义其 light/dark 语义颜色。

## 替代方案

- 将完整 247 色加入 ThemeDefinition：会扩大每个主题、持久化快照和运行时 stylesheet，也会让编辑器继续暴露不该按主题修改的基础数据。
- 直接依赖 Tailwind 默认颜色对象：减少维护，但会让 OriaTheme 色彩资产受第三方值和发布节奏约束，违背“兼容命名但独立设计”的目标。
- 只提供 Tailwind config 映射：无法覆盖 Tailwind v4 CSS-first 使用方式，也不能为非 Tailwind 消费者提供稳定 CSS variables。
- 运行时按需注入基础色：需要 DOM 使用扫描或额外配置，增加 runtime 状态和首屏一致性复杂度；静态 CSS 由浏览器和构建工具处理更合适。

## 影响

- 标准 contract 从 197 个注册 token 收敛为 125 个；默认主题解析时不再产生 `--oria-palette-*`。
- 完整基础色 CSS 只需在应用入口导入一次。247 个短声明对解析和内存的影响很小，也不随主题切换重写；Tailwind utility 仍按实际类名生成。
- `@oriatheme/colors/tailwind.css` 的兼容范围是 Tailwind 默认颜色家族、阶梯和由其生成的颜色 utility 类名，不承诺复制 Tailwind 的具体色值。
- 项目尚未发布，不提供 `palette.*` 兼容层、迁移 API 或持久化数据自动迁移；预发布本地数据应直接丢弃并按当前 contract 重新创建。

## 预发布处理

1. 在全局 CSS 中导入 `@oriatheme/colors/styles.css`；使用 Tailwind v4 时再导入 `@oriatheme/colors/tailwind.css`。
2. 应用组件优先消费语义变量；确需固定色时使用新的稳定色库变量或 Tailwind 标准颜色类名。
3. 编辑器不展示 Foundation Palette 面板和 palette 智能阶梯；语义颜色编辑与预览流程保持不变。

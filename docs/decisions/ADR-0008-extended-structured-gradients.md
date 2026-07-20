# ADR-0008：扩展结构化渐变类型

- 状态：Accepted
- 日期：2026-07-19

## 背景

GradientDefinition 目前只表达 linear 与 radial。主题编辑器已经具备结构化实时预览、停止点和安全颜色输入，但无法表达 CSS 中常用的重复线性、重复径向和锥形渐变。直接保存原始 CSS 字符串会绕过 Core 校验，并违反用户字符串不得直接进入 stylesheet 的安全边界。

## 决定

1. GradientDefinition 在现有判别联合中新增 `repeating-linear`、`repeating-radial` 与 `conic`，保留既有 `linear`、`radial` 数据不变。
2. `repeating-linear` 与 linear 共用 `angle + stops`；`repeating-radial` 与 radial 共用 `position + stops`；`conic` 使用 `angle + position + stops`，其中 angle 表示 `from` 起始角度。
3. position 首版限制为 center/top/right/bottom/left，所有带 position 的类型缺省为 center；GradientStop.position 对全部类型继续使用 0–100 百分比。该 position 限制后由 [ADR-0009](ADR-0009-structured-gradient-origins.md) 扩展为九宫格关键字与结构化百分比坐标。
4. Core 是五种类型的唯一校验与 CSS 编译实现；编辑器只构造结构化数据并通过 session 提交，不接受原始 gradient CSS。
5. ThemeDefinition schemaVersion、`oria-standard` contract version 与 Storage 格式保持不变。此次扩展只扩大 gradient token 的合法值集合，旧主题无需迁移；项目仍处于首次公开发布前。

## 替代方案

- 将 GradientDefinition 改为任意 CSS 字符串：表达能力最大，但无法静态保证安全，也会破坏结构化编辑。
- 为每种渐变新增独立 TokenType：会扩大 contract 类型表并复制停止点规则，收益不足。
- conic 只保存 angle、不保存 position：实现更少，但无法表达常用的偏心锥形渐变，且与 radial 的中心控制不一致。
- 同时加入 repeating-conic：CSS 没有对应的标准渐变函数，不应制造非标准类型。

## 影响

- Core 的公开 GradientDefinition 类型、校验器和 CSS 编译器扩展；既有调用方只处理 linear/radial 的穷尽 switch 时会在升级后的 TypeScript 检查中得到提示。
- React registry 的类型控件需要容纳五个选项，并按类型显示 angle、position 或二者；Vue 当前 JSON 源码字段可提交新结构，但可视化迁移仍按既定计划后续进行。
- repeating 类型是否出现可见重复取决于停止点周期；编辑器保留用户停止点，不在类型切换时静默重写位置。

## 迁移

现有主题无需数据迁移。消费方若对 GradientDefinition 做穷尽分支，应补充三个新判别值；新主题仍通过现有导入、导出、预览与持久化管线处理。

# ADR-0009：结构化渐变九宫格与坐标原点

- 状态：Accepted
- 日期：2026-07-19

## 背景

ADR-0008 首版将 radial、repeating-radial 与 conic 的 position 限制为 center/top/right/bottom/left。该集合缺少四个常用角落，也无法表达 CSS 渐变支持的百分比原点。直接开放任意 position 字符串会削弱 Core 的静态校验边界，继续只用下拉框则不能直观表达二维空间映射。

## 决定

1. 新增公开 `GradientPosition` 类型：包含九宫格关键字 `top left`、`top`、`top right`、`left`、`center`、`right`、`bottom left`、`bottom`、`bottom right`，以及 `{ x: number; y: number }` 百分比坐标。
2. 既有五个关键字保持原值和语义；四个角落使用浏览器原生 CSS position 文本，不新增需要编译映射的私有枚举。
3. 坐标 x/y 必须是 0–100 的有限数值，Core 编译为 `x% y%`；缺省 position 仍为 center。不得接受任意 position CSS 字符串、calc、长度或第三轴语法。
4. React 可视编辑器使用 3×3 九宫格按钮直接映射常用位置，并提供相邻的 Custom 模式。进入 Custom 时将当前预设转换为等价坐标，避免实时预览跳变；X/Y 使用统一 LinearSlider 与精确数值输入。
5. ThemeDefinition schemaVersion、`oria-standard` contract version 与 Storage 格式保持不变。本项目仍处于首次公开发布前，此次只扩大 gradient position 的合法结构。

## 替代方案

- 只增加九个下拉选项：实现简单，但二维空间关系不直观，常用定位需要逐项阅读。
- 接受任意 CSS position 字符串：表达能力最大，但会重新引入字符串安全、解析和跨浏览器兼容问题。
- 始终保存 x/y 坐标：结构统一，但会无必要地改写既有主题数据，也降低导出 JSON 的可读性。
- 为 x/y 接受长度或 calc：超出当前百分比停止点模型，也增加校验和响应式语义复杂度。

## 影响

- Core 的公开类型、验证和 CSS 编译扩展；既有五位置主题无需修改。
- 自定义坐标保持结构化，可继续经过导入、导出、editor session 和 runtime 的完整原子校验。
- 九宫格按钮提供可访问名称和明确选中状态；Custom 控件只在需要精确位置时出现，避免永久增加普通路径的视觉密度。

## 迁移

现有主题无需迁移。消费方若把 GradientDefinition.position 假定为字符串，应增加对象坐标分支；导出数据中的九宫格预设保持可读字符串，自定义位置为 `{ "x": 25, "y": 70 }`。

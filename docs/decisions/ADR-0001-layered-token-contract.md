# ADR-0001：使用分层 Token Contract

> 状态：Accepted  
> 日期：2026-07-17

## 背景

固定颜色接口加单一 radius、shadow 参数只能可靠表达配色变化。无类型 extension 虽灵活，却失去验证、编辑器元数据、互操作和迁移能力，难以覆盖排版、Glass、Brutalist、Neumorphic、Editorial 等完整设计语言。

## 决定

采用版本化 Token Contract：

- token path + token type + required/default/range 元数据；
- 标准 contract 分为 palette、semantic color、typography、shape、spacing、control、elevation、effects、motion；
- 主题值支持类型化结构和 `$ref` 引用；
- 消费者通过扩展 contract 注册领域 token；
- 取消无类型 `extensions: Record<string,string>`；
- Runtime 只接受完整验证和解析后的 variables。

## 影响

- Core 初期实现量增加，需要引用图、类型校验和编译器。
- 主题编辑器可以按 contract 自动生成字段和验证提示。
- 标准主题能表达更丰富视觉风格，同时不允许任意 CSS 注入。
- Contract version 成为独立兼容维度，导入主题时必须匹配或迁移。

## 未选择方案

- 固定大接口：难以扩展且领域 token 会持续膨胀。
- 任意 `Record<string,string>`：安全、类型和迁移不可控。
- 注入整段 CSS：破坏 Headless 边界并扩大安全面。


# ADR-0003：共享编辑内核与独立框架编辑器

- 状态：Accepted
- 日期：2026-07-18

## 背景

React 与 Vue 用户都需要可嵌入的主题编辑器，并且应能只安装所用框架。如果两套 UI 分别实现草稿、校验、提交和冲突规则，会产生行为漂移，并违反框架适配层不复制领域状态机的既有原则。

## 决定

新增无框架且不直接访问 DOM 的 `@oriatheme/editor-core`，集中实现草稿模型、字段描述、编辑命令和提交冲突规则；它委托 `@oriatheme/core` 完成校验、解析和诊断，并只通过注入的 `@oriatheme/runtime-dom` 公开 API 执行预览与保存。

新增 `@oriatheme/react-editor` 与 `@oriatheme/vue-editor` 作为独立发布的 UI 包。两者依赖 editor-core 和对应的现有框架 adapter/runtime；React 与 Vue 继续作为各自 peer dependency，任一编辑器包不得依赖另一框架。

Runtime 仍拥有已应用主题、预览与持久化状态。Editor core 只拥有未提交草稿，不将每次输入写入 runtime 或 Storage。

## 替代方案

- 在 React/Vue 包内各自实现完整编辑器：包数较少，但会复制领域规则并提高长期一致性成本。
- 发布单一包含 React/Vue 的编辑器包：发现简单，但迫使用户安装不需要的框架依赖。
- 只发布 headless editor：最轻，但不能满足开箱可嵌入的 React/Vue 编辑功能。

## 影响

- 发布包增加三个，需要独立 exports、types、pack 和消费验证。
- 两个框架 UI 可以独立演进，但所有编辑语义变化必须先更新 editor-core 规范和测试。
- 未来其他框架可复用 editor-core，不需要复制主题编辑规则。

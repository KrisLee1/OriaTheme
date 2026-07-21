# ADR-0013：将官网建设拆分至 Phase 9

- 状态：Accepted
- 日期：2026-07-20

## 背景

首发公开包、公开 registry 的 HTTPS 部署与真实 registry 消费验证仍是独立的外部发布门禁。将官网建设保留在同一 Phase 会把已完成的 CLI/registry 工作、尚未完成的首发发布和后续官网交付混在一个验收范围内，无法清晰判断发布阶段是否完成。

## 决定

1. Phase 8 仅交付首发公开发布与 registry 消费验证，包括 CLI/registry、Changesets、pack、实际 npm 发布及仓库外干净使用方验证。
2. 首页、用户文档、预设展示、在线主题编辑器、官网响应式/可访问性/E2E/production build 与部署检查表移至 Phase 9。
3. Phase 9 只能在 Phase 8 实际发布并验证完成后启动；其官网仍为 private application，只锁定已发布的普通 semver 依赖，并只通过公开 package root exports 使用 OriaTheme。
4. ADR-0012 的“先发布，再建设官网”发布前提继续有效；其中将两项工作置于同一 Phase 的排期由本决策取代。

## 替代方案

- 保持官网与发布在 Phase 8：依赖顺序正确，但无法以独立验收项关闭发布阶段。
- 在发布前建设官网并在发布后替换依赖：会失去真实发布消费者验证，违反 ADR-0012。

## 影响

- `apps/website` 不得在 Phase 8 创建或实现。
- Phase 8 完成后，状态文档切换到 Phase 9，官网验收和部署工作才成为当前任务。
- 不改变任何公开 API、主题数据格式或发布包边界。

## 迁移

1. 将 Phase 8 的官网范围和未完成官网验收项移入独立的 Phase 9 计划。
2. 更新状态、任务索引和官网相关规划引用。
3. 保留现有发布门禁及其外部阻塞，作为 Phase 9 的启动依赖。

# ADR-0018：将 Contract v2 实现拆分至 Phase 10

- 状态：Accepted
- 日期：2026-07-24

## 背景

Phase 9（官网、文档与在线主题编辑器）的主体功能已建成并部署，但验收清单尚未关闭。其间 ADR-0017 被接受，`oria-standard@2` 规范建立，Core、Presets、Editor Core 与 Runtime/Bootstrap/Storage 的 v2 接入已在 Phase 9 范围内完成。

Contract v2 的剩余工作——新增公开包 `@oriatheme/tailwind`、registry/示例/双语指南迁移、含 breaking-change 说明的发布，以及官网升级迁移——是一个独立的可验收目标。继续并入 Phase 9 会把“官网验收”和“breaking-change 发布”混在同一验收范围内；同时 v2 发布会改变官网消费的公开包与公开 CSS variables，官网必须在发布后才能完成迁移。

## 决定

1. Contract v2 的全部工作（含已完成的 v2 核心接入记录）自 Phase 9 拆分为新建的 Phase 10：Contract v2 实现与发布。
2. Phase 9 暂缓：官网保持当前已构建/已部署状态，其验收清单在 Phase 10 发布并完成官网 v2 迁移后恢复；暂缓期间官网仅做 Phase 10 范围内的 v2 迁移改动。
3. Phase 10 以 [Token Contract v2 规范](../specifications/token-contract-v2.md) 与 [Contract v2 设计](../design/contract-v2.md) 为实现基线，包含 `@oriatheme/tailwind`、CLI custom-prefix bridge 生成器、registry/示例/指南迁移、发布门禁与官网升级迁移。
4. `oria-standard@1` 仍为默认 Contract；v2 成为默认值的切换不在本阶段内，由后续发布计划另行决策。

## 替代方案

- 继续把 Contract v2 并入 Phase 9：官网验收与 breaking-change 发布混为一个验收范围，无法清晰判定任一目标是否完成。
- 先关闭 Phase 9 再启动 v2：官网验收完成后会立即因 v2 发布而大面积返工迁移，浪费已完成的验证。
- 只保留 v2 代码而不发布：registry、示例与官网长期停留在 v1，opt-in migration 路径无法通过真实发布消费者验证。

## 影响

- 项目状态切换到 Phase 10；Phase 9 验收项顺延，不视为取消。
- `@oriatheme/tailwind` 成为新的公开包，加入 Changesets 与发布清单；Tailwind 仅作为其 build/test 依赖。
- 本次发布必须包含 breaking-change 说明、migration guide、tarball/干净消费者验证。
- 不改变 v1 公开 API、主题数据格式或既有发布包的行为。

## 迁移

1. 新增 Phase 10 计划与阶段日志；Phase 9 期间完成的 v2 核心实现记录迁入 Phase 10 日志。
2. 更新项目状态、文档索引、任务路由、项目总日志、ADR 索引与 v2 设计/规范引用。
3. Phase 10 发布完成且官网迁移 v2 后，恢复 Phase 9 验收。

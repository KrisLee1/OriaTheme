# ADR-0012：先发布公开库，再以发布版本建设官网

- 状态：Superseded（阶段拆分由 ADR-0013 取代；发布后才建设官网的前提保持有效）
- 日期：2026-07-20

## 背景

官网既是产品入口，也是 OriaTheme 的真实消费应用。若在 monorepo 内直接以 `workspace:*` 或 `packages/*/src` 完成官网，官网即使通过构建，也无法证明 npm 消费者能够安装、解析并使用实际发布的 exports。当前公开库尚未实际发布，`@oriatheme/cli` 也尚未实现，因此 Phase 8 原有“先建官网、同时完成 CLI”的顺序不能提供这个证据。

## 决定

1. Phase 8 按顺序执行：完成并验证 `@oriatheme/cli` 与 registry 发布准备；完成公开包的 Changesets/version/pack/独立消费门禁并实际发布；随后才创建 `apps/website`。
2. 首个公开发行版包含已确认的库包以及 `@oriatheme/cli`。最终 semver 版本只能在包含 `main` 的发布基线中运行 `changeset status` 和 `changeset version` 后确定，不在规划文档中预填未经生成的版本号。
3. 发布后，官网的 OriaTheme 依赖必须解析为该发行版的普通 semver 版本。官网与其已提交的本地 registry 组件只能从公开 package root exports 导入；不得改回 `workspace:*`、`packages/*/src` 或 registry 模板的深层源码导入。
4. 官网开始前必须以仓库外的干净消费项目确认 registry 中可获得该发行版及其 exports；官网随后作为私有应用继续完成构建、E2E 与部署验证，但不加入 npm 发布物。

## 替代方案

- 先用 workspace 包实现官网，再在发布前替换依赖：开发更快，但容易遗漏打包、exports、版本范围和发布产物问题。
- 先发布不含 CLI 的库，再为官网手工复制编辑器模板：会绕过 ADR-0005 确立的安装、hash、冲突和路径安全验证。
- 将官网一起发布：官网不是可复用库，会扩大 npm 发布面并违反 ADR-0004。

## 影响

- `@oriatheme/cli` 与公开 registry 是首发门禁；registry 基地址确定为 `https://theme.oria.org.cn/registry/v1`，但在其 HTTPS 静态部署完成前门禁不解除。模板许可证已确定为 Apache-2.0 并随 CLI 安装交付，官网实现仍须等待其余门禁完成。
- 需要发布权限、有效 Git `main` 基线和 npm registry 可访问性；这些是外部阻塞，不能由本地文档或构建替代。
- 官网开发从真实的发布消费者视角开始，能持续验证公开 API、SSR 边界和用户持有的源码组件；它仍保持 `private: true`，不进入 pack、Changesets 或 publish。

## 迁移

1. 先实现 CLI，并完成本地 registry 的 dry-run、diff、冲突、hash、路径安全与 React/Vue/Next 独立消费验证。
2. 部署并验证指定的公开 registry 基地址，完成 Changesets、完整发布门禁、version、pack 与 npm publish。
3. 在干净项目中从 registry 安装已发布版本，确认真实 exports 和本地源码组件可构建。
4. 创建 `apps/website`，锁定发布版本依赖并完成官网验收。

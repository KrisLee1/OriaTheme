# ADR-0004：官网作为私有消费应用

- 状态：Accepted
- 日期：2026-07-18

## 背景

OriaTheme 需要官网首页、用户文档和在线主题编辑器，但官网本身不是可复用库，也不应进入 npm 包或影响库消费者的依赖体积。

## 决定

在 `apps/website` 建设私有 React/Next.js 应用，并在 Phase 8 迁入现有 `apps/docs` 内容。官网通过公开 package exports 使用预设、runtime、React adapter 和 React editor，作为真实消费与 SSR 边界的持续集成样本。

官网 `package.json` 必须为 private，不进入 Changesets、npm pack 或 publish。首页和文档优先 SSR/静态输出，在线编辑器保持 client-only。首版主题数据只在浏览器本地处理。

## 替代方案

- 将官网组件发布为 npm 包：增加无关发布面与消费者困惑。
- 在静态 HTML docs 上另写编辑器：无法复用 React 编辑器，也会形成第二套实现。
- 将官网放到独立仓库：隔离更强，但当前阶段会削弱公开包与真实应用同步验证。

## 影响

- workspace build 会包含官网 production build，但发布清单不包含官网。
- 官网可以尽早暴露 package exports、SSR import 和文档示例偏差。
- 域名、托管与分析属于独立部署决定，不改变 npm 包架构。

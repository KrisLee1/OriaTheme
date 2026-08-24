# 总体架构

## 项目定位与成熟度

OriaTheme 是框架核心无关、客户端优先的 Web 主题系统。它以类型化 Token Contract 表达设计语言，通过环境无关 Core 完整校验和解析，再由 DOM Runtime 原子应用 CSS Variables，并为 React、Vue、Tailwind CSS v4、主题编辑器和首屏 Bootstrap 提供各自边界清晰的入口。

项目已公开发布 11 个独立演进的 npm 包和源码组件 registry。当前默认且唯一的标准设计是 `oria-standard@2`；v1 只作为 legacy 输入和显式迁移来源保留。私有官网是已发布包的真实消费应用，不属于 npm 发布面。

长期用户、非目标和兼容策略由项目蓝图维护；公开的具体包依赖见[包边界](package-boundaries.md)。

## 所有权与依赖方向

- Core：Contract、ThemeDefinition、校验、解析、迁移、导入导出、颜色与诊断；无 DOM、Storage 或框架依赖。
- Presets / Colors / Tailwind：分别拥有完整官方主题、稳定静态基础色和 v2→Tailwind 静态映射；不进入 Runtime 状态机。
- Runtime DOM：主题、外观偏好、自定义主题、Storage/Bootstrap、DOM stylesheet 与 transition 的唯一运行时状态源。
- React / Vue：只拥有生命周期、依赖注入和响应式订阅。
- Editor Core：拥有草稿、字段描述、编辑命令、诊断、冲突与提交协调；不拥有 DOM、Storage 或框架 UI。
- React/Vue Editor：只拥有 editor session 的框架注入、订阅和自动预览协调。
- CLI / Registry UI：CLI 安全复制并核验多文件可见组件；安装后的 UI 由用户持有，但领域行为仍调用公开 editor/core/runtime API。
- Website / Examples：消费和验证上述公开边界，不成为第二套 Runtime 或 Editor Core。

依赖只从消费层指向领域层；Core/Runtime 不反向依赖框架、编辑器 UI、官网或 Tailwind bridge。

## 不可破坏的原则

1. Runtime 是主题 ID、外观偏好和自定义主题的唯一状态源；`resolvedMode` 是派生值。
2. Core 与 Editor Core 必须保持环境无关、确定且可测试。
3. 主题先按目标 Contract 完整校验和解析，再以单次 stylesheet 原子提交；失败时保持前一有效状态。
4. React/Vue 只桥接生命周期与订阅，不复制 Runtime 或 Editor Core 状态机。
5. 用户输入不能作为任意 stylesheet 拼接；复杂渐变、图案、阴影等必须使用受限结构并由 Core 编译。
6. 编辑草稿与已提交 Runtime 状态分离；只有完整有效主题才能预览或保存。
7. SSR 只输出安全静态默认主题或 Bootstrap 快照；所有公开库模块顶层保持 SSR-safe import。
8. 发布兼容性必须围绕真实 package API、Contract/持久化、registry 格式和文档承诺处理，不制造无消费者的并行路径。
9. 动画、预览和并发切换不能让最后一次有效状态变更丢失或被旧请求覆盖。

## 边界与非目标

- Runtime 只写主题变量与 `data-oria-*` 属性，不注入任意组件 CSS，不改变组件结构、信息架构或布局行为。
- ThemeDefinition 不直接兼容第三方导出格式；Tailwind 通过独立静态桥接消费，不进入主题数据模型。
- 当前不提供服务端用户偏好解析、Cookie 同步或完整 SSR 状态同步。
- 公开 runtime 包不分发绑定具体组件库的黑盒 UI；可见编辑器由 registry 复制到用户源码。
- 私有官网不属于 npm package API；账号、云同步、远程主题市场和多人协作不在当前已承诺范围。

## 主题应用主流程

```text
Preset / Imported Theme / Persisted Custom Theme
                         │
                         ▼
             Contract + Schema Validation
                         │
                         ▼
            Reference and Alias Resolution
                         │
                         ▼
              Complete Resolved Variables
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       Runtime Snapshot      Storage/Bootstrap Snapshot
              │
              ▼
       Atomic DOM Stylesheet
              │
              ▼
 Native DOM / React hooks / Vue composables
```

无论来源是 preset、导入、持久化还是迁移，非法或不完整主题都在进入活动状态前整体拒绝。Bootstrap 样式只负责首屏，Runtime 完成首次有效原子写入后接管。

## 编辑器主流程

```text
Runtime Theme ──copy/import──> Editor Core Draft
                                  │
                     typed commands + validation
                                  │
                         latest valid preview
                                  │
                                  ▼
                         Runtime preview/CRUD
                                  │
                       save or discard atomically
```

React/Vue registry 组件只呈现和派发这些命令。页面、框架 bridge 和可见组件不得各自维护另一套主题或编辑状态机。

## 静态桥接与消费面

`@oriatheme/colors` 提供不随主题变化的稳定色库；`@oriatheme/tailwind` 把 v2 runtime 变量映射到 Tailwind v4 theme namespace。二者是构建/样式消费桥接，不参与 Runtime 状态。官网和示例可组合这些入口，但只能通过 package root exports 或公开 CSS subpath 消费。

## 已承诺与可演进边界

- 已承诺：已发布 package exports/API、`oria-standard@2` 当前规范、显式 v1 迁移语义、registry v1 URL/manifest/hash 安全、持久化与 Bootstrap 拒绝规则。
- 可在兼容规则内演进：新增 optional token、官方 preset、诊断、编辑器展示和私有官网内容。
- 需要 Controlled 处理：模块所有权、公开契约/协议、不可替代持久化数据、主要平台/依赖、安全与破坏性行为。

## 当前风险

- 私有官网仍在完成响应式、可访问性、E2E 与部署检查表，不能把 production build 单独等同于 Phase 9 关闭。
- Next 常驻 dev/start 与 build 共用 `.next` 会造成环境性缓存竞争；验证应隔离构建目录或停止并发服务器。
- 后续公开契约变化必须同时考虑 v1 legacy 输入、真实持久化数据和已发布消费者，不能按预发布项目处理。

当前实现行为以公开规范和源码为准；本文件只维护稳定所有权、数据流与架构风险，不记录逐任务进度。

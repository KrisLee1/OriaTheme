# 总体架构

## 项目定位

OriaTheme 是框架核心无关、客户端优先的主题运行时，提供主题预设、用户自定义主题、`light/dark/system` 颜色模式、持久化、CSS Variables 应用，以及 React/Vue 适配层。

## 已完成的 v1 范围

- 完整设计语言 Token Contract。
- 主题校验、解析、复制、导入和导出。
- 浏览器 runtime 与订阅式状态容器。
- 系统颜色模式监听、持久化和异常回退。
- React Provider/Hooks 与 Vue Plugin/Composables。
- 可选首屏 bootstrap 与 View Transition。
- React、Vue 和 Next.js 客户端集成示例。
- 可选安装的官方预设主题集合。

## v1 后续范围

- 扩展并分类官方预设主题目录，补充描述、发现元数据与预览素材。
- 共享无框架编辑内核、React/Vue headless bridge，以及作为用户源码安装的可见编辑器组件。
- 私有官网应用：产品首页、面向用户的文档和在线主题编辑器。

## 非目标

- 不依赖或兼容任何第三方主题导出格式；可以通过独立桥接入口兼容 Tailwind 的颜色类名命名，而不把 Tailwind 数据格式引入 ThemeDefinition。
- 不复制第三方主题数据。
- 不提供服务端主题解析、Cookie 同步或完整 SSR 状态同步。
- v1 runtime 发布包不包含绑定具体组件库的 UI；编辑器可见 UI 通过注册表复制到用户源码，不作为 `node_modules` 中的默认黑盒组件交付。
- 不改变消费者的 DOM 结构、布局架构或组件行为。
- 官网不是 npm 包；账号、云同步、远程主题市场和多人协作不在当前路线范围。

## SSR 边界

OriaTheme 是 client-only runtime，但所有公开包必须支持 SSR-safe import：模块顶层不得访问 `window`、`document`、`localStorage` 或 `matchMedia`。服务端只可获得稳定默认快照，不解析用户偏好。浏览器 `start()` 后接管。

## 核心原则

1. Runtime 是主题 ID、颜色模式偏好和自定义主题的唯一状态源。
2. `resolvedMode` 是派生状态，不是用户偏好。
3. Core 无环境副作用，解析函数必须确定且可测试。
4. DOM 应用必须先完整校验，再单次原子提交。
5. React/Vue 只桥接生命周期和响应式订阅。
6. 设计语言由 Token Contract 表达；消费者扩展也必须注册类型。
7. Runtime 只改变视觉参数，不注入任意组件 CSS，不改变组件结构。
8. 最后一次状态变更永远不能因动画或并发切换而丢失。
9. 编辑器草稿与 runtime 已提交状态分离；只有完整有效的主题才能原子预览或保存。
10. 官网必须通过公开包入口消费 OriaTheme，不得成为第二套主题或编辑器实现。
11. 编辑器可见 UI 必须以多文件源码组件安装到消费项目；页面只组合本地组件，领域规则仍由公开 editor/core/runtime 包所有。

## 数据流

```text
Preset package / Imported Theme / Editor Draft
                 │
                 ▼
       Token Contract Validation
                 │
                 ▼
      Reference + Alias Resolution
                 │
                 ▼
        Resolved Theme Variables
                 │
        ┌────────┴────────┐
        ▼                 ▼
 Runtime Snapshot    Active Snapshot
        │                 │
        ▼                 ▼
 Atomic Stylesheet   LocalStorage/Bootstrap
        │
        ▼
 React Hooks / Vue Composables / Native DOM
```

编辑器使用相同的 Core 校验和 Runtime preview/CRUD 流程；官网在线编辑器使用安装到官网源码的 React registry 组件，而这些组件只通过公开包 exports 调用领域和 runtime 能力。编辑器 UI 和官网预览模板可以表现结构语境，但不改变 runtime 的 token-only 边界。

## 设计风格边界

标准 contract 覆盖颜色、排版、形状、间距、密度、边框、阴影、模糊、透明度和动效，因此可表达 Glass、Brutalist、Neumorphic、Editorial、Minimal 等视觉语言。主题不能把导航栏变成侧边栏，也不能改变组件语义；结构性差异由消费应用实现。Runtime 提供 `data-oria-theme`、`data-oria-mode` 和 token 变量供组件 CSS 使用。

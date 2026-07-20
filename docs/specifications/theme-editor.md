# 主题编辑器规范

## 目标与分发

提供可嵌入消费应用的主题自定义编辑能力。React 与 Vue 用户必须只获得所用框架的依赖和源码组件；编辑器不是 runtime 的必需依赖。

领域与框架桥接通过 npm 包分发，可见 UI 通过源码组件注册表分发：

- `@oriatheme/editor-core`：无框架且不直接访问 DOM 的草稿模型、字段描述、智能阶梯纯函数、验证、编辑命令与 runtime 提交协调；
- `@oriatheme/react-editor`：React Provider、hooks、订阅和自动预览协调，React/React DOM 为 peer dependency；
- `@oriatheme/vue-editor`：Vue provide/composables、订阅和自动预览协调，Vue 为 peer dependency；
- 编辑器 registry：被 CLI 复制到用户项目的 React/Vue 可见组件、样式、局部 hooks/composables 和组合配置。

安装 React registry item 不得安装 Vue，安装 Vue registry item 不得安装 React。可见 UI 必须位于用户项目源码而不是 `node_modules` 的默认黑盒组件中。完整分发契约见[编辑器源码组件注册表](editor-component-registry.md)和 [ADR-0005](../decisions/ADR-0005-source-owned-editor-components.md)。

## 职责边界

```text
ThemeDefinition / Preset
          │ clone or load
          ▼
 @oriatheme/editor-core ── validate/analyze ──> @oriatheme/core
          │ draft events
    ┌─────┴─────┐
    ▼           ▼
React source UI  Vue source UI
    │           │
    └─────┬─────┘
          ▼ automatic preview / explicit save and import
 @oriatheme/runtime-dom
```

- `editor-core` 只管理未提交草稿、字段级问题和编辑命令，不直接访问 DOM、Storage、React 或 Vue；预览和保存只调用注入的 runtime 公开 API。
- Core 继续是 schema、contract、解析和诊断的唯一实现；编辑器不得自行放宽校验。
- Runtime 继续是已应用主题、预览和持久化的唯一状态源；编辑器不得复制其状态机。
- 框架桥接包负责 session 注入、订阅和自动预览协调；被复制到用户项目的组件负责渲染、表单事件、焦点和可访问性。两者均不持有第二套领域规则。

## Editor Core 最小公开契约

```ts
export interface ThemeEditorOptions {
  source: ThemeDefinition;
  // source 为 preset 时必需，用于生成 custom 身份。
  identity?: CloneIdentity;
  contract?: TokenContract;
}

export interface ThemeEditorSnapshot {
  draft: ThemeDefinition;
  dirty: boolean;
  revision: number;
  issues: readonly ValidationIssue[];
  diagnostics: ThemeDiagnostics;
}

export type ThemeEditorSaveResult =
  | { ok: true; theme: ThemeDefinition }
  | { ok: false; reason: "validation"; issues: readonly ValidationIssue[] }
  | { ok: false; reason: "conflict"; currentTheme: ThemeDefinition };

export type ThemeEditorPreviewResult =
  | { ok: true; handle: PreviewHandle }
  | { ok: false; issues: readonly ValidationIssue[] };

export interface ThemeEditorSession {
  getSnapshot(): ThemeEditorSnapshot;
  subscribe(listener: () => void): () => void;
  setName(name: string): void;
  setToken(mode: ResolvedMode, path: TokenPath, value: ThemeTokenInput): void;
  setTokens(
    mode: ResolvedMode,
    values: Readonly<Record<TokenPath, ThemeTokenInput>> |
      readonly { path: TokenPath; value: ThemeTokenInput }[],
  ): void;
  removeToken(mode: ResolvedMode, path: TokenPath): void;
  resetToken(mode: ResolvedMode, path: TokenPath): void;
  resetMode(mode: ResolvedMode): void;
  resetAll(): void;
  replaceFromJson(json: string): ImportResult;
  exportJson(): string;
  preview(runtime: OriaThemeRuntime, mode?: ResolvedMode): ThemeEditorPreviewResult;
  save(runtime: OriaThemeRuntime): ThemeEditorSaveResult;
  reload(theme: ThemeDefinition): void;
  destroy(): void;
}

export function createThemeEditorSession(
  options: ThemeEditorOptions,
): ThemeEditorSession;

export function createThemeEditorIdentity(
  source: Pick<ThemeDefinition, "id" | "name">,
  existingThemes: readonly Pick<ThemeDefinition, "id">[],
): CloneIdentity;
```

- `revision` 每次有效草稿命令递增，用于框架 selector 和异步 UI 去除过期结果，不进入主题持久化格式。
- `createThemeEditorIdentity()` 为从 preset 新建的编辑会话生成可用 custom 身份：优先使用 `<preset-id>-editor`，发生既有 preset/custom ID 冲突时依次使用 `-editor-2`、`-editor-3`。Host 必须根据当前 runtime 快照传入全部 preset 与 custom ID，避免预览正常但保存时因重复 ID 冲突。
- `save()` 更新既有 custom theme 或创建由 preset 复制出的 custom theme；若 runtime 中同 ID 主题的 `updatedAt` 已偏离会话基线，返回 `conflict`。
- 冲突后调用方可以 `reload(currentTheme)`，或以新 identity 创建另一个 session 后另存；首版不提供强制覆盖开关。
- `destroy()` 必须结束活动预览并清理订阅；重复调用安全。
- `setTokens()` 是智能阶梯等多 token 操作的原子草稿命令；一次调用只增加一次 `revision`、只通知一次订阅者，不暴露中间阶梯。
- `setToken()`、`setTokens()`、`removeToken()` 与 `resetToken()` 根据字段的 `modeScope` 执行：`shared` 字段在同一次 revision 中写入或删除 light/dark，`mode` 字段只影响指定模式。`removeToken()` 仅接受 contract 中的可选 token，将其从草稿中真正移除并回到未设置状态；必需 token 的移除请求不修改草稿或 revision。`resetToken()` 则恢复会话基线值。框架 UI 不得复制 path 分类或分别提交两次。
- `resetMode(mode)` 只重置该模式的 `mode` 字段，不丢弃仍适用于两个模式的 shared 编辑；`resetAll()` 才恢复完整草稿。

### Contract 字段描述与智能阶梯

- `describeTokenContract(contract?)` 返回稳定顺序、只读的 `TokenFieldDescriptor[]`，包含 path、type、required、description、minimum/maximum、segments、用户可读 label 与 `modeScope: "shared" | "mode"`；React/Vue 不得各自复制 contract 类型或作用域判断。
- 标准 Control Size 字段的 label 必须包含尺寸用途：`control.height.{sm,md,lg}` 使用 `Height Sm/Md/Lg`，`control.paddingInline.{sm,md,lg}` 使用 `Horizontal padding Sm/Md/Lg`，不得只显示无法区分宽向留白与高度的末级尺寸名。
- `oria-standard@1` 的 `color.*`、`gradient.*` 与 `elevation.shadow.*` 为 `mode`；`typography.*`、`shape.*`、`spacing.*`、`control.*`、`effect.*` 与 `motion.*` 为 `shared`。非标准扩展 token 默认是 `mode`。
- 载入、重载或导入的合法旧主题若含有不一致的 shared 物化值，session 以 Light 值归一；仅当 Light 缺失可选值时使用 Dark。该步骤只建立内存草稿，不修改传入对象或持久化内容，显式保存后才提交归一结果。
- `deriveSmartScale(input)` 是确定性纯函数，输入覆盖 typeScale、fontWeight、spacing、controlSize、radius、elevation、blur 与 duration，输出物化到具体 Token Path 的 `DerivedTokenValue[]`。
- `preserveScaleOverrides(derived, current, customized)` 在重新派生主值时保留调用方传入的已标记单项覆写叶子；覆写集合只属于 UI 会话交互状态，不进入 `ThemeDefinition`。
- 官方 registry UI 将 contract 中的全部字段逐项直接编辑，不显示基础色阶主值、派生预览或单项覆写操作。稳定色库由 `@oriatheme/colors` 提供给取色界面使用，但不是可编辑主题字段。
- React/Vue registry 的颜色字段在原生颜色选择与颜色值输入之后提供独立基础色卡选择器；触发控件使用浅色中性底与多个独立彩色样卡，不使用深色连续渐变。选择器以该按钮为锚点打开受视口约束的非模态 popover，不得退化为带遮罩的全页/全高面板。popover 必须在圆形色块视图与“每个颜色家族一行、无可见家族/阶梯文字”的紧凑圆角色阶视图间切换；紧凑视图仍保留每个颜色按钮的可访问名称。选择器可按颜色家族、阶梯、组合名称或 HEX 搜索 `@oriatheme/colors`，选择结果必须回到既有字段缓冲与 `setToken()` 管线，不得直接修改 stylesheet 或保存色库副本。
- React/Vue registry 的普通字段使用左侧名称、右侧控件的紧凑两列布局，颜色编辑控件组在右列贴右对齐。`shadow`、`gradient` 与 `cubicBezier` 必须改用“名称独立一行、编辑器下一行全宽”的复杂字段布局；Shadow Layer 展开控件使用指针光标且禁止文本选择，层编辑器按卡片标题、颜色、两列参数与 Inset 操作分区；缓动曲线必须提供随当前控制点更新且可手动重播的真实运动效果预览，并尊重 reduced-motion。
- React/Vue registry 的颜色字段使用“弹性名称列 + 内容宽度控件列”，控件外层不得占据多余列宽，长名称不得因右侧空白而截断。每个 Tab 的 Accordion 默认全部展开且必须可独立折叠，隐藏内容不参与布局；搜索控件由统一外层承担材质、边框与 focus-within 状态，内部输入透明且无第二层输入边框/阴影。
- React/Vue registry 的全局搜索与 Light/Dark 控件之间保留稳定间距；基础色库搜索复用同一连续表面和轮廓图标语言。渐变字段使用实时安全预览和结构化控件编辑 `linear`、`radial`、`repeating-linear`、`repeating-radial` 与 `conic`；线性类显示角度，径向类显示中心，conic 同时显示起始角度和中心。Origin 必须提供可直接映射空间位置的九宫格预设，并提供 Custom 模式的 X/Y 百分比滑块与精确输入；输入至少保留 0.1% 精度，切换到 Custom 时从当前预设生成等价坐标，不让预览跳变。每个停止点同时提供原生颜色选择、颜色值输入和复用既有 `BaseColorPalette` 的基础色库入口，不以 JSON textarea 作为默认界面。已设置的可选渐变必须提供 `removeToken()` 驱动的“取消设置”操作并立即回到可重新创建的空状态；其余修改继续经 `setToken()` 的完整校验与原子预览管线。
- 所有阶梯函数必须有固定输入/输出测试。

## 框架桥接包最小公开契约

- React package root 导出 `ThemeEditorProvider`、`useThemeEditor()`、自动预览 hook 和 editor-core 类型。
- Vue package root 导出 `provideThemeEditor()`、`useThemeEditor()`、自动预览 composable 和 editor-core 类型。
- Provider/provide 接受外部 session 或创建 session 所需 options；外部 session 的所有权仍归调用者。
- 自动预览协调在提供 runtime 时根据最新有效 revision 预览，并在卸载/session 切换时清理 handle。
- 目标 package root 不导出完整可视 `OriaThemeEditor`，不提供默认黑盒 UI CSS；全部可见组件由 registry 复制到用户项目。

## 源码组件契约

- React/Vue registry item 必须按[编辑器源码组件注册表](editor-component-registry.md)拆分为多文件组件树；单一页面或单一 `ThemeEditor` 文件不得包含全部 UI。
- 页面/路由只组合用户项目内的 `ThemeEditor`、runtime 和 options，不直接枚举 token 或实现字段控件。
- 组件样式作为用户源码文件一同复制，使用稳定 `data-oria-editor-*` hooks 与 `--oria-editor-*` variables，不由桥接包自动注入。
- 官方 registry UI 的分类、字段、智能阶梯、响应式和交互规则必须符合[主题编辑器 UI 设计](../design/editor-ui.md)。

## 最小功能范围

- 从 preset 的 custom 副本、现有 custom theme 或合法导入内容创建草稿。
- 编辑主题名称、light/dark 模式 token 与跨模式共享 token；支持按 token 分组浏览与搜索。ThemeDefinition v1 仍把 shared 值物化到两个完整 mode token set，不改变持久化格式。
- 对输入执行类型、引用、完整性和对比度诊断，并将字段级错误定位到 token path。
- 有 runtime 时自动实时预览最新有效草稿；预览使用 runtime `previewTheme()`，不改变持久化偏好。非法或不完整的中间输入保留最后一份有效预览，不部分应用。
- 框架桥接必须把最新有效草稿的预览排入可取消的单帧任务；正式 `activeThemeId` 改变时，必须同步取消尚未执行的旧草稿预览，防止快速主题切换后旧的可选渐变、阴影或其他 token 重新覆盖正式主题。仅 appearance 改变且 host 显式保留 preview 时不取消。
- 显式保存时才调用 runtime create/update；非法或未完整解析的草稿不得部分应用或持久化。
- 支持导入、导出、重置当前字段、重置当前模式和放弃全部草稿。
- React/Vue registry 下载草稿时使用 `<theme-id>.oria-theme.json`；导入文件入口接受 `.oria-theme.json` 和普通 `.json`，并继续把文件内容交给 `replaceFromJson()` 完整校验。扩展名只用于识别和文件选择，不降低 Contract 校验要求。
- 导入的合法主题在保存时始终创建新的 custom theme，而不是沿用打开编辑器前 custom theme 的更新基线；导入 ID 未占用时保持原 ID，若与当前 preset 或 custom ID 冲突，则生成可用的 editor identity，绝不覆盖既有主题或因 preset 不可写而抛出异常。
- 注册表提供可直接运行且可修改的默认源码组件，使消费应用可替换布局、原子控件和样式；无需修改 `node_modules`。

## 草稿与提交语义

- 初始化 preset 时先复制为 `kind: "custom"`，不得编辑原 preset。
- 每次输入仅更新编辑器内存草稿。自动保存、远程同步和跨设备同步不属于本阶段。
- 自动预览不等于自动保存；只有用户显式执行保存才能写入 custom theme 和持久化状态。
- 保存是单次事务：先规范化并完整校验两个模式，再调用 runtime；失败保留草稿并返回结构化问题。
- 保存成功只提交主题并将当前 session 变为 clean，不得隐式关闭编辑器；关闭必须由用户单独触发。
- 切换 token、标签页或颜色模式不得隐式丢弃未保存值。
- Light/Dark 分段控件默认只改变当前草稿的编辑与预览 mode，不自行调用 `setAppearance()` 写入用户偏好；从 Light 切到 Dark 再返回时，必须重新预览同一 session 中刚才编辑过的 Light 草稿，反向同理。Host 若显式提供受控 `mode` 与模式回调，可让编辑器预览跟随 runtime appearance：此时页面 Appearance 与编辑器 Light/Dark 必须经同一 `setAppearance()` 入口，编辑器显示 `resolvedMode`，System 选择仍只存在于 host。`preservePreview` 使草稿主题在偏好切换中保持活动，而未指定显式 preview mode 使草稿与 runtime 在同一原子提交和同一过渡中解析到新模式。
- 可见源码组件必须在 `dirty` 草稿将被丢弃时保护关闭编辑器和切换正式主题：使用明确对象与后果的模态确认，不使用浏览器 `confirm()`；取消后保持当前 session、预览和正式主题不变。
- 浏览器刷新或关闭页面时，dirty session 必须注册 `beforeunload` 保护；保存、重置全部草稿或卸载后立即移除保护，不对 clean session 反复提示。
- Host 主题列表与编辑器 Themes Tab 必须把 runtime `customThemes` 作为“我的主题”置于 preset 之前，最近保存/更新的主题在前，并允许用户直接切换和使用；该排序只属于可见列表，不改变 runtime 持久化格式。
- Themes Tab 使用可独立折叠的 `My themes` / `Presets` 面板。custom theme 支持改名、应用、编辑、复制并编辑、删除；preset 支持应用、复制并编辑。复制必须经 `runtime.duplicateTheme()` 生成 custom theme、载入当前 session 并打开 Colors；不得把“复制”实现为剪贴板操作或直接编辑 preset。删除必须确认；应用、编辑或复制会丢弃 dirty 草稿时也必须确认。
- 外部 runtime 在编辑期间变更时，编辑器必须返回 `conflict`，不得静默覆盖新版本。UI 提供“重新加载外部版本”或“保留当前草稿后另存”的明确选择。

## 安全与可访问性

- 不接受任意 CSS、选择器、HTML 或脚本；所有输入必须经 Token Contract 编译。
- 字符串不得直接拼接到 stylesheet；预览和保存只能使用 core/runtime 的安全输出。
- 所有字段有可访问名称、错误关联和键盘操作；颜色输入不能只用色相传达状态。
- 诊断与预览必须支持 light/dark，编辑器本身应兼容 reduced motion。
- 大型 token 表单应避免每个按键触发整棵框架树重渲染；性能基线在 Phase 7 测试中固化。

## 非目标

- 不提供账号、云同步、远程主题市场或多人实时协作。
- 运行时编辑器不改写消费应用的其他布局、组件源码或任意 CSS；只有用户主动运行的 CLI 会在确认后安装 registry 声明的编辑器组件文件。
- 不承诺与第三方主题文件格式互转。
- 不把官网专用导航、营销页面或预览模板发布进编辑器包。

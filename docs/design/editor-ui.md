# OriaTheme 主题编辑器 UI 设计

> 状态：Implementation Ready  
> 适用范围：React/Vue 源码组件注册表、`@oriatheme/*-editor` headless bridge 与 `apps/website` 在线编辑器  
> 交互原则：直接响应、空间一致、可预期、可恢复、先常用后高级

## 1. 目标

编辑器应让用户以“颜色、排版、形状、材质和动效”的设计心智模型编辑主题，而不要求用户先理解 133 个 Token Path。默认界面保持简洁；完整 token、引用和多层阴影都必须能在一层展开后精确编辑。

用户的核心感受应为：

- 调整后立即看到结果，不存在手动“开始预览”步骤。
- 非法的中间输入不会破坏当前画面，也不会被部分应用。
- 常见的语义颜色、字号、间距、圆角和动效可直接编辑；专业用户可展开任意层级。
- 导入、重置和离开页面时都能明确知道会发生什么。
- 编辑器控制界面的可读性不受正在编辑的主题影响。

## 2. 非目标与边界

- 本设计不增加自动保存；自动预览与持久化必须保持分离。
- 不实现第二套主题、runtime 或 editor-core 状态机；host 可通过公开 API 创建指向 ShadowRoot 的专用预览 runtime 实例。
- 不接受任意 CSS、HTML、选择器或脚本。
- 适用 contract 为 `oria-standard@1`；ThemeDefinition schema v1 与持久化 state schema v1 保持不变。
- 不把官网预览模板发布到 React/Vue 编辑器包。

### 2.1 源码所有权与组件化

本文档中的可见 UI 不以 `node_modules` 中的完整黑盒组件交付。官方将 React/Vue 组件作为注册表源码，通过 `@oriatheme/cli add theme-editor` 复制到用户项目的 `components/oria-theme-editor/` 目录。用户可直接替换工具栏、字段、浮层、预览和样式。

实现必须遵守[编辑器源码组件注册表规范](../specifications/editor-component-registry.md)：

- 页面/路由文件只组合用户项目内的 `ThemeEditor` 并传入 runtime/options，不实现工具栏、Tab、token map、字段 renderer 或编辑器 CSS。
- `ThemeEditor` 只是组合根；Toolbar、Tabs、Search、Mode Switch、Workspace、Preview、Accordion、九类字段、Shadow Layer 和 overlays 必须拆成可独立替换的组件。
- 框架包只提供 headless Provider/hooks 或 provide/composables；可见样式和组件源码属于用户项目。
- 被复制的 UI 可修改，但不得复制 editor-core 或 runtime 状态机，不得绕过 Core 完整验证和原子预览/保存。

## 3. 整体信息架构

顶部保留 1 个主题管理 Tab 与 5 个用户可理解的 token 分类 Tab。Contract 层级继续是数据真相，但不直接成为主导航。

| 顶部 Tab | Contract 范围 | 可折叠面板 |
|---|---|---|
| 主题 Themes | Runtime presets / custom themes | My themes、Presets |
| 颜色 Colors | Semantic Color | Canvas & Surfaces、Primary、Secondary、Muted & Accent、Feedback、Borders & Selection、Charts |
| 排版 Typography | Typography | Font Families、Font Weights、Type Scale、Line Height、Letter Spacing |
| 布局与形状 Layout & Shape | Spacing & Density、Control、Shape & Border | Spacing & Density、Control Size、Radius Scale、Borders & Focus Ring |
| 层次与材质 Depth & Material | Elevation、Effects、Gradient、Pattern | Elevation Scale、Inner Shadows & Highlights、Opacity、Blur、Backdrop、Gradients、Patterns |
| 动效 Motion | Motion | Duration Scale、Easing Curves |

中文界面使用中文标题，Token Path 作为次级技术信息保留。公开稳定的 `data-oria-editor-*` hook 和文档中的分组 ID 使用英文，不依赖可见文案。

### 3.1 主题分组

- Themes 位于首个 Tab，使用两个默认展开且可独立折叠的面板：`My themes` 在前，`Presets` 在后；空的自定义主题面板保留并说明保存或复制的主题会出现于此。
- 每个主题项显示当前 Light/Dark 编辑模式下的紧凑颜色签名、名称、类型与 active 状态。自定义主题提供改名、应用、编辑、复制并编辑、删除；preset 只提供应用与复制并编辑。
- 改名在条目内完成，不使用浏览器 prompt。当前 editor session 正在编辑的 custom theme 通过 session 名称草稿进入现有保存流程；其他 custom theme 通过 runtime 更新。
- 应用只通过 `runtime.setTheme()` 改变正式主题。编辑 custom theme 通过同一 editor session `reload()` 后进入 Colors；preset 不可直接编辑。
- 复制通过 `runtime.duplicateTheme()` 创建无 ID 冲突的 custom theme，立即载入 editor session 并打开 Colors Tab。复制不是只写入剪贴板，也不生成不可编辑的 preset 副本。
- 删除始终使用明确主题名称的可访问确认模态；删除当前 active custom theme 后沿 runtime 规则回退默认主题。任何会丢弃 dirty 草稿的应用、编辑或复制操作也必须先确认。
- Themes Tab 不显示只服务 token 字段的全局搜索和 Light/Dark 控制栏；主题色签名仍跟随当前 editor mode。主题数据和操作只来自 runtime snapshot / 公开 API，不复制持久化列表。
- Themes 因省略控制栏，滚动区顶部必须补足与其他 Tab 控制区一致的稳定留白；`My themes` 面板不得紧贴顶部导航。

### 3.2 颜色分组

- 稳定基础色由 `@oriatheme/colors` 作为取色来源，不属于 contract 分组，也不在主题编辑器中直接修改。
- Canvas & Surfaces：background/foreground、surface、surfaceRaised、overlay 及其 foreground。
- Primary：primary、primaryForeground、primaryHover、primaryActive。
- Secondary：secondary、secondaryForeground、secondaryHover、secondaryActive。
- Muted & Accent：muted、mutedForeground、accent、accentForeground。
- Feedback：destructive、success、warning、info 及其 foreground。
- Borders & Selection：border、borderStrong、input、ring、selection、selectionForeground、scrim。
- Charts：chart1–chart8，同时显示在相邻色块上的可区分性。

Colors Tab 的所有分组标题只显示分组名称、必要的问题数量和展开箭头，不显示描述或 token 数量。每个颜色字段必须按“左侧可读名称、右侧原生颜色选择、颜色值输入、基础色卡选择器”的顺序在单行显示；名称保持左对齐并获得剩余弹性宽度，整组编辑控件只占自身内容宽度，不得用大尺寸外层占满右列并制造空白。长名称可自然换行，不能以省略号隐藏关键语义；名称与控件之间使用紧凑固定间距。不得显示 token path、字段说明、共享提示或单项重置按钮。校验错误可占据该行下方的全宽区域。颜色、渐变 stop 与阴影颜色样本必须在棋盘底上叠加实际颜色，完整显示 4/8 位 HEX、RGBA 或 HSLA 的 alpha；原生 `input[type=color]` 只接收从当前值提取的非透明 RGB，不得因浏览器不支持 alpha 而把样本错误回退为黑色。基础色卡选择器从 `@oriatheme/colors` 读取稳定颜色，可按家族、阶梯、`family-step` 或 HEX 即时搜索；它以触发按钮为原点打开受视口约束的非模态浮层，不使用全页遮罩或全高面板，空间不足时在按钮上下方自动翻转。浮层提供带家族/阶梯文字的圆形色块视图，以及每个家族一行、只显示 11 个圆角色块的紧凑视图。选择后关闭面板、恢复字段操作焦点，并通过既有字段缓冲提交对应语义颜色。

所有 Tab 的分组标题遵循同一精简规则。颜色、尺寸、数值、字体、字重与时长字段将可读名称固定在左列、实际编辑控件固定在右列。阴影、渐变和动画曲线是高信息密度例外：字段名称单独占据第一行，完整编辑器与实时预览占据下一行全宽，避免把复杂控件压缩进狭窄右列。相邻字段使用独立紧凑卡片并保留清晰间距，不以连续分割线黏连。不得显示 token path、字段说明、共享提示、单项重置、字体样张、字重示例、时长装饰动画或非颜色阶梯的派生预览。

## 4. 桌面布局

编辑器由四个稳定区域组成：

```text
┌─ 顶部工具栏：主题名称 · 预览/草稿状态                         关闭 ─┐
│               重置 · 导入 · 导出             问题状态 · 保存 ─┤
├─ 导航栏：Themes · Colors · Typography · Layout & Shape · Depth & Material · Motion ─┤
├─ 控制栏：全局搜索                                      Light / Dark ─┤
├─────────────────────────────────────────────┤
│ 编辑区：可折叠面板，可独立滚动     │ 实时预览：粘性定位 │
│ 建议宽度 30–42rem                      │ 剩余宽度          │
└─────────────────────────────────────────────┘
```

- 顶部工具栏和分类 Tab 保持在视口顶部；内容从其下方滚动。
- 工具栏可使用一层半透明材质，内容与工具栏交叠时使用渐隐的滚动边缘，不再叠加第二层亮色玻璃。
- 预览区不设置“开始/停止预览”按钮。只要提供 runtime，编辑器打开后即自动预览当前草稿。
- 编辑器 chrome 使用稳定的 `--oria-editor-*` 变量；正在编辑的 `--oria-*` 只影响预览模板或 host 明确指定的 preview target。
- 官方示例中的编辑器由 host 作为右侧固定的圆角悬浮面板打开；桌面端为面板完整宽度及其视口边距预留 grid 空间，使底层页面平滑收窄且不被面板遮挡，同时不形成无圆角全高侧栏；窄屏不挤压内容。面板保留独立滚动和从右侧进入/退出的、可中断 opacity / transform 过渡（不得用结束时会回放默认帧的关键帧卸载）；Tab 横向和内容纵向滚动条与 Theme 选择器一致，均为主题 token 驱动的细圆角滑块，并限制在视口安全宽度内。

## 5. 顶部工具栏

### 5.1 第一层：身份、状态与关闭

- 主题名称是单行可编辑文本，失焦或 Enter 提交名称，Escape 恢复本次编辑前文本。
- 名称后显示一个文字状态：`Saved`、`Unsaved`、`Previewing`、`Preview paused · 2 issues` 或 `Saving…`。
- 状态不只依靠颜色；用 `aria-live="polite"` 播报保存、导入和预览暂停结果。连续拖动时不重复播报每帧变化。
- 关闭编辑器是第一层最右侧的独立图标按钮，不与草稿操作混排；它具有明确的可访问名称和 tooltip。
- clean 草稿直接关闭；dirty 草稿打开模态确认，说明未保存编辑会丢失，并提供“取消”和“放弃并关闭”。浏览器刷新/关闭页面由仅在 dirty 期间存在的 `beforeunload` 保护。

### 5.2 第二层：草稿工具与提交

操作顺序固定为：`重置`、`导入`、`导出`、`保存`。`保存` 是唯一主按钮；其余为次级或图标+文字按钮。

- 第二层左侧把重置、导入、导出组织为一个轻量工具组，右侧把问题状态与保存组织为提交组；不把六个不同层级的操作平均铺满或任意换行。
- 校验状态按钮固定在 Save 左侧，并以“图标 + 文案 + 语义色”同时表达状态：通过使用 success、只有对比度警告使用 warning、存在阻断保存的校验错误使用 destructive；不得只靠颜色区分。
- 重置、导入、导出、问题状态、保存和关闭的交互目标统一为 44px 高；图标使用统一的 16–18px 轮廓语言，文字基线、内边距和圆角一致。
- Reset、Export 与问题状态的锚定菜单在点击菜单外部或按 Escape 时关闭；点击菜单自身内容不得被外部关闭逻辑误判。
- 当编辑器自身容器窄于 38rem 时，重置、导入、导出和问题状态隐藏可见文字，只保留 44×44 图标按钮、可访问名称和原生 tooltip；保存继续保留文字并保持唯一主按钮。该规则按编辑器容器而不是页面 viewport 判断，适配桌面侧栏与窄屏抽屉。

#### 重置

重置按钮打开以按钮为原点的菜单：

1. 重置当前分类；
2. 重置当前 Light/Dark 模式；
3. 重置整个草稿。

单字段重置放在字段行末端，只在 hover、focus-within 或已修改时出现。重置分类只有在能提供短暂 Undo 入口时才直接执行；当实现尚无 Undo 能力时，重置分类、整个模式或草稿都必须使用编辑器内的模态弹窗二次确认，不得调用浏览器 `confirm()`。确认文案要写明对象，不使用模糊的“Are you sure?”。

#### 导入

- 桌面端从导入按钮原点展开居中对话面板；窄屏从底部进入 sheet。关闭时沿原路径返回触发点。
- 文件入口使用独立的主题文件卡片和 44px 高 `Choose file` 按钮，打开时默认把键盘焦点放在该入口，并锁定文档根与 body 的背景滚动；Cancel、关闭按钮、Escape 或组件卸载后恢复原有滚动样式。明确接受 `.oria-theme.json` 与普通 `.json`，选择后在按钮下方显示完整文件名。粘贴 JSON 保持为分隔后的第二入口，不与文件按钮争夺主层级；窄屏模态内容仍可独立纵向滚动。
- 只有完整验证通过后才启用“导入到草稿”。导入是一次原子替换，不部分合并。
- 导入后仍为未保存草稿，立即进入自动预览，不自动写入 runtime 持久化偏好。

#### 导出

- 导出按钮打开轻量菜单：`下载 JSON` 与 `复制 JSON`；下载文件名固定为 `<theme-id>.oria-theme.json`，让系统和用户可以直接识别 OriaTheme 主题文件。
- 导出内容是当前完整草稿，不会触发保存。存在验证错误时打开问题摘要，不产生看似可用的非法主题文件。
- 复制成功在按钮原位显示 `Copied`，不使用阻断式 alert。

#### 保存

- 只有保存会创建或更新 custom theme。草稿未修改时按钮禁用。
- 保存成功后编辑器保持打开，更新为已保存状态并继续允许编辑；关闭只能由明确的关闭操作触发，不把 Save 隐式实现为 Save & Close。
- 存在错误时，按钮保持可理解的禁用状态，旁边显示可进入问题摘要的文字。
- 发生外部冲突时打开明确的选择：重新加载外部版本，或保留当前草稿后另存。不提供静默强制覆盖。

## 6. Tab、搜索与 Light/Dark

### 6.1 分类 Tab

- 使用 WAI-ARIA tabs 语义；左/右方向键移动焦点，Home/End 跳到首尾，Enter/Space 激活。
- 切换 Tab 不清空搜索、不重置展开状态、不丢弃未保存值。
- 每个 Tab 可显示问题数量 badge；不使用红点作为唯一表达。
- 活动指示条从当前位置连续移向新 Tab，中途可被新操作改变目标；它不锁定输入。

### 6.2 全局搜索

- 搜索同时匹配可见名称、描述、Token Path 和预定义别名，例如“按钮主色”能找到 `color.primary`。
- 输入后立即显示结果，不增加人为延迟。token 搜索按五个 token 分类分组，并显示 `颜色 / Primary / Primary hover` 面包屑；Themes 使用自身列表，不混入 token 搜索。
- 选中结果后切换到所属 Tab、展开面板、滚动到字段并移入焦点。
- Escape 第一次清空搜索，第二次才把焦点返回主内容。
- 搜索图标、输入和焦点反馈必须属于同一个连续表面：外层统一承担背景、边框、圆角、hover 与 focus-within 光晕，内部 `input` 保持透明、无独立边框和阴影，避免出现“输入框嵌在另一个输入框里”的割裂感。
- 搜索表面与 Light/Dark 分段控件之间必须保留明确间距，搜索可以弹性收缩但不得挤压模式控件；基础色库内的搜索使用同一套轮廓图标、连续表面与 focus-within 反馈。

### 6.3 Light/Dark 分段控件

- 分段控件在独立嵌入时只切换当前编辑和预览模式，不自行改写用户持久化的 appearance 偏好。官方 React、Next 与 Vue 主题工作台由 host 显式启用 appearance-following preview：页面 Appearance 和编辑器 Light/Dark 共用一个 runtime `setAppearance()` 入口，编辑器以 `resolvedMode` 显示 Light/Dark，System 仍只在页面控件中选择。
- Semantic Color、Gradient、Pattern 与 Elevation Shadow 按当前模式编辑；Typography、Layout & Shape、Effects 与 Motion 是共享字段，从任一模式修改都会原子同步到 Light/Dark。共享字段不得伪装成两份独立值。
- UI 必须读取 editor-core 的 `modeScope`，不得自行维护 token path 白名单；当前紧凑编辑界面不额外显示 `Shared` 辅助文字。
- 滑动指示背板从当前屏幕位置开始，使用无过冲的弹簧转移。
- 示例页的 Theme 与 Appearance 控件置于顶栏：Theme 使用与编辑器一致的五扇色卡触发器和带背景模糊的可滚动列表；Appearance 使用显示器、太阳和月亮图标。基础色库的圆形色块/紧凑色阶二段控件复用编辑器 Appearance 的分段背板规格。全部切换使用主题 motion token 驱动的连续滑动背板；新操作在动画完成前可直接重定向。`prefers-reduced-motion` 下保留状态与颜色反馈，但不移动背板。
- 切换后自动预览对应 mode。独立嵌入使用短促颜色过渡或交叉淡化；当 host 已为页面 Appearance 启用 runtime View Transition 时，编辑器同步切换必须复用同一 runtime 调用、持续时间和触发原点，不在 preview 效果中再播放第二段动画。
- Light 与 Dark 共用同一个 editor-core session；切到另一模式不会提交、重置或克隆草稿，返回时必须恢复该模式最新的未保存值和原子预览。

### 6.4 正式主题列表

- Host 的主题切换列表先显示按 `updatedAt` / `createdAt` 由新到旧排列的“我的主题”，再显示官方 Presets；新保存的 custom theme 立即位于列表最前并成为可选的正式主题。
- dirty 编辑器请求切换正式主题时，列表先回到当前正式选择，并由编辑器内模态说明将放弃哪个草稿、切换到哪个主题；取消不改变草稿、预览或 preference，确认后才执行 `setTheme()` 并创建新 session。
- 编辑器内 Themes Tab 复用同一 runtime 列表与排序，并补充 custom 改名、编辑、复制、删除及 preset 复制操作。复制后总是打开 Colors，删除总是二次确认。

## 7. 可折叠面板

- Accordion 标题仅包含名称、必要的问题数和展开箭头。整行均可激活，最小触控高度 44px。
- 默认每个 Tab 的全部面板均展开；用户可独立折叠任意面板，也可同时展开多个面板对照。折叠后内容必须从布局和可访问树中隐藏，不能只改变箭头或视觉状态。
- 展开/收起从当前呈现高度开始，可在动画中反向操作。不因动画屏蔽按钮。
- 面板内字段使用较实的底色；半透明材质只用于顶部 chrome 和浮层，避免多层透明表面叠加。
- 每个字段必须保留可访问名称和错误关联，但不显示 Token Path 或职责描述。

## 8. 字段编辑器

| Token 类型 | 默认控件 | 高级能力 |
|---|---|---|
| `color` | 名称 + 颜色样本按钮 + HEX/RGBA 输入 + 可搜索基础色卡 | 颜色 popover；直接值 / token reference 切换；对比度提示 |
| `dimension` | 名称 + 滑块 + 数字输入 + 单位 | 约束范围、步长、单位切换；超出滑块建议范围时仍可精确输入并接受 Contract 验证 |
| `number` | 名称 + 滑块 + 数字输入 | 精度、最小/最大值和单位化说明 |
| `fontFamily` | 名称 + 紧凑字体栈输入 | 添加、删除、键盘排序、通用 fallback 建议 |
| `fontWeight` | 名称 + 100–900 滑块 + 精确输入 | `normal` / `bold` 与 100 级合法 CSS 字重映射 |
| `duration` | 名称 + 0–1000ms 滑块 + 精确输入 | 超出建议范围时保留文本精确输入 |
| `cubicBezier` | 独立名称行 + 四个数值 + 曲线图 + 可重播运动效果预览 | 可拖动控制点和同步运动对照；键盘可调 |
| `shadow` | 阴影缩略图 + 层数 + 展开按钮 | 多层阴影编辑、添加/删除/排序、inset |
| `gradient` | 五类渐变预览 + 类型对应的角度/中心 | 停止点颜色/引用、位置、排序与删除 |
| `pattern` | 表面上的重复图层预览 | 有序 dot/stripe/grid/noise 图层、颜色、受控颗粒变体、添加/删除/排序、Create / Unset |

### 8.1 颜色

- 颜色样本是按钮，打开与其空间关联的 popover；不用无标签的纯色方块。
- 基础色卡是颜色值输入后的独立按钮；按钮使用浅色中性表面和扇形排列的独立彩色样卡，不使用深色或连续渐变背景。它以按钮为原点打开非模态 popover，显示 Tailwind CSS 4.3.3 默认拓扑的 26 个家族、50–950 阶梯以及黑白色。popover 保持紧凑并限制在当前视口内，随滚动/缩放重新定位，空间不足时从按钮下方翻转到上方；它不显示模态遮罩，也不占满页面高度。顶部不提供冗余关闭按钮，而提供“圆形色块”和“紧凑色阶”两个图标视图开关；切换背板以无过冲的主题化滑动动效在两个图标下连续移动，仍可通过触发按钮、点击外部或 Escape 关闭。圆形视图显示家族与阶梯文字，选中对勾必须位于颜色圆内部，并使用轻薄的半透明玻璃底、亮边与克制阴影，不使用深色实心圆；紧凑视图每个颜色家族占一行，以 11 个无可见名称/阶梯文字的圆角矩形表示完整色阶，但每个按钮仍保留颜色名称与 HEX 的可访问名称。搜索无人工延迟，选中语义和可见焦点不得只依赖色块本身。
- 色值输入允许 HEX 与带 alpha 的表示。popover 至少提供色彩区、色相、透明度和文本值，全部可用键盘调整。
- 前景/背景成对 token 在同一卡片中显示实时对比度。诊断是文字 + 数值 + 图标，不只是红/绿。
- 引用模式使用可搜索 token picker，只显示同模式下类型兼容且不会构成循环的候选。
- 渐变不得以 JSON 文本作为默认编辑方式。字段必须提供实时渐变预览、停止点位置标记，以及 linear、radial、repeating-linear、repeating-radial、conic 五种类型的紧凑选择；线性类提供角度，径向类提供中心，conic 同时提供起始角度和中心。类型增加后不得把五个长标签挤进不可读的单行按钮组，应使用明确标注的紧凑 Type 选择控件并把几何参数放在下一行。Origin 以 3×3 空间映射按钮呈现九个常用位置，选中状态同时依赖边框、背景和中心标记而非仅靠颜色；Custom 是相邻的明确模式切换，展开至少保留 0.1% 精度的 X/Y 百分比滑块与数值输入，并从当前预设无跳变地继承等价坐标。逐个停止点继续提供颜色、位置、添加和删除操作；每个停止点的颜色同时提供原生颜色选择、颜色值输入和可搜索基础色库三种入口，并映射到同一个安全提交函数。可选渐变缺失时显示明确的创建空态。预览只能消费已通过安全颜色约束的数据，所有修改继续通过 editor session 原子提交。
- Pattern 不得暴露自由 CSS textarea。`pattern.background` 与 `pattern.surface` 各自最多 8 个按背景绘制顺序排列的图层；每层通过明确 Type 控件选择 `dot`、`stripe`、`grid` 或 `noise`，颜色使用原生色选、色值输入和基础色库。几何图层继续编辑尺寸、间距和角度；noise 仅可选择 Paper、Film、Frosted 三种固定 profile，并编辑 Grain size 与 0–1 Intensity。Paper 预览使用与 Core 相同的低对比底纹、稀疏短纤维和细小杂点，不得回退为均匀高频颗粒；Film/Frosted 保持各自颗粒 profile。只有 Core-safe 的颜色、dimension、angle、variant 与 intensity 才能提交。缺失时显示 Create，已设置时提供 Unset；每个图层有类型、上移、下移和删除按钮，第一层明确标记为最上方，预览显示实际叠加结果。颜色控件独占第一行，三项参数固定为第二行三列；仅在容器小于 21rem 时收为单列，避免侧栏和窄屏重叠。

### 8.2 数值、尺寸与滑块

- 指针按下即显示 active 状态；滑块拖动与指针 1:1 跟随，用 Pointer Capture 保持跨越控件边界后的连续性。
- 拖动更新最多每个 animation frame 提交一次，不使用使跟手感消失的长 debounce。
- 拖动开始后最小值、最大值和步长保持固定，不得根据当前值动态翻倍或重算范围；标准字段使用按语义预设的稳定范围，Contract 明确提供 `minimum` / `maximum` 时优先使用 Contract 边界。
- 字重只提交 Core 接受的 100 级步长；`shape.radius.full` 等离群语义值不强塞进低精度滑块，继续使用精确输入。
- 滑块和文本输入是同一个值的两种映射；任一处更改都立即同步另一处。
- 箭头键按步长调整，Shift+箭头使用大步长，Home/End 移到最小/最大建议值。

### 8.3 内外阴影

每个 Shadow Layer 显示：

- 层级编号、内/外阴影状态与颜色样本组成的紧凑卡片标题；
- 单独一行的颜色文本输入；
- 两列排列的 X Offset、Y Offset、Blur、Spread 精确输入；
- 明确的 `Inset` 开关与图标删除操作；
- 后续增强的复制、上移、下移操作。

多层阴影卡片默认只展示组合预览和层数；展开控件必须使用指针光标且不可选中文字，展开后按 CSS 绘制顺序列出。拖动排序只是增强能力，必须同时提供键盘可操作的上移/下移。`elevation.shadow.inner` 和 `highlight` 位于独立面板，不与外阴影阶梯混合。

## 9. 派生能力与逐项编辑

稳定基础色库不属于主题 contract。编辑器可以用 `@oriatheme/colors` 渲染取色建议，但用户选择颜色后只修改对应的 `color.*` 语义字段，不修改基础色库本身，也不保存色库副本。

| editor-core 派生能力 | 默认主值 | 默认派生规则 |
|---|---|---|
| Type Scale | `md` 基准字号 | 默认比率 1.2；xs/sm 反向递减，lg–4xl 递增，结果按 0.001rem 规范化 |
| Font Weight | `normal` | 默认生成 normal/medium/semibold/bold，每项限制在 1–1000 并保持单调 |
| Spacing | `spacing.unit` | `spacing.N = unit × N`；density 是独立系数，不暗中改写阶梯 token |
| Control Size | `control.height.md` / `paddingInline.md` | 字段必须分别标记为 `Height Sm/Md/Lg` 与 `Horizontal padding Sm/Md/Lg`，避免两个尺度只显示相同尺寸名；sm/md/lg 按稳定相对步长生成，不小于编辑器定义的可用下限 |
| Radius | `shape.radius.md` | none=0，xs=.25×，sm=.5×，md=1×，lg=1.5×，xl=2×，2xl=3×；full 使用稳定胶囊值，不参与比例 |
| Elevation | 层级强度 | 以统一光向、色调和强度生成 none–2xl，y/blur 单调增加，alpha 保持克制 |
| Blur | `effect.blur.md` | sm=.5×、md=1×、lg=1.5×、xl=2.5×，结果非负 |
| Duration | `motion.duration.normal` | instant=0，fast=.55×，normal=1×，slow=1.65×，结果规范化为整毫秒 |

派生规则必须是确定性纯函数，在 React/Vue 共享层只实现一次并有固定输入/输出测试。派生后仍将每个值写入实际 Token Path；导出的主题不依赖编辑器算法。官方 UI 将 Type Scale、Font Weight、Spacing、Control Size、Radius、Elevation、Blur 和 Duration 作为逐项字段直接显示，不显示“色阶”、主值或派生预览。`deriveSmartScale()` 保留为 headless/editor-core 能力。

## 10. 自动预览

### 10.1 用户语义

- 当 `runtime` 存在时，默认 UI 挂载后自动预览当前草稿和当前 Light/Dark 模式。
- 没有手动 Preview 或 Stop Preview 按钮；离开、卸载、重载 session 或正式保存时由现有 preview handle 规则清理。
- 自动预览不更改 preference、Storage、`resolvedMode` 持久化或主题身份。
- 没有 runtime 时，编辑功能仍可用，状态明确显示 `Preview unavailable`，不显示无效操作按钮。

### 10.2 提交管线

```text
指针/键盘输入
       │ 立即更新控件反馈
       ▼
可解析的字段值 ────否────> 保留字段缓冲和上一个有效预览
       │ 是
       ▼
editor-core revision + Core 完整验证
       │ 有错误────────> 字段/摘要显示问题，预览暂停
       │ 通过
       ▼
同一 animation frame 合并为最新 revision
       ▼
runtime.previewTheme() 原子替换完整 stylesheet
```

- 本地字段缓冲只服务于“正在输入的不完整文本”，不是第二份 ThemeDefinition。字段一旦可解析就提交给 editor-core。
- 同一事件循环或 animation frame 中的连续 revision 只预览最新版本。不为文本输入增加人为的 300ms 等待。
- 完整验证失败时保留最后一份有效 stylesheet，不清空预览，不部分应用其他“仍然合法”的 token。
- 智能阶梯在同步操作中更新多个 token，预览协调器在帧末只提交最终 snapshot，避免中间阶梯闪烁。

## 11. 响应式与窄屏

| 宽度 | 布局 |
|---|---|
| `≥ 1180px` | 编辑区 + 粘性预览双栏；顶部工具栏保持“身份 / 操作”两层，Tab 全部可见 |
| `720–1179px` | 双栏保留但预览可缩小到 40%；工具栏保持两层，容器空间足够时显示完整操作文字，Tab 可水平滚动 |
| `< 720px` | 编辑区单列；工具栏保持两层，主题名与状态不和草稿工具混排；次级操作收敛为 44×44 图标，保存保留文字；Tab 水平滚动；预览为底部 sheet |

窄屏的“查看预览”只打开已在自动更新的预览 sheet，不是开始预览。Sheet 从底部进入并沿同一路径退出，支持 45% 与 90% 高度的吸附点。拖动期间 1:1 跟手，释放时使用速度投影选择落点，并把手势速度交接给弹簧。必须同时提供关闭按钮和 Escape，不要求用户必须使用拖动。

## 12. 视觉语言

### 12.1 稳定的编辑器 chrome

编辑器外观通过 `--oria-editor-*` 变量允许 host 定制，默认值不从草稿 token 派生。至少包括：

```text
--oria-editor-canvas
--oria-editor-surface
--oria-editor-surface-raised
--oria-editor-chrome
--oria-editor-foreground
--oria-editor-muted
--oria-editor-border
--oria-editor-accent
--oria-editor-accent-foreground
--oria-editor-danger
--oria-editor-focus
--oria-editor-radius-sm / md / lg
--oria-editor-shadow-sm / md
--oria-editor-motion-fast / normal
```

- 平台系统字体优先，启用 `font-optical-sizing: auto`。正文控件使用接近 1rem 的字号和 1.4–1.5 行高；大标题可使用轻微负字距，小标签使用 0 或轻微正字距。
- 以 4px 为最小栅格，常用间距为 8/12/16/24/32px。不用过小字号和大量紧密分割线营造“专业感”。
- 按钮、分段控件和字段默认使用克制的 8–12px 圆角。大浮层可使用 16–20px，但层级必须有清晰差异。
- 指针按下时立即反馈：按钮可缩放到 0.97–0.98，同时保持可见焦点不被 transform 裁剪。

### 12.2 材质与层级

- 粘性工具栏使用半透明背景 + 约 20–24px blur + 克制饱和度，并提供上沿高光和浅阴影。
- 导入对话面板和移动预览 sheet 是较厚的材质；小菜单较轻。大表面比小表面有更强分离阴影。Reset、Export、Issues、Import、确认对话框与基础色库等弹出层都使用当前主题 `color.overlay` / `color.overlayForeground`，背景 alpha 必须消费 `effect.opacity.overlay`，并按层级消费 `effect.backdropBlur.{sm,md,lg,xl}` 与 `effect.backdropSaturation`，不得在组件 CSS 中写死透明度或模糊像素值。透明度只作用于 Overlay 背景材质，不降低前景文字、图标或整个弹层的 opacity；弹层继续通过 `backdrop-filter` 与 `-webkit-backdrop-filter` 保持清晰背景模糊。不得错误复用 Surface，也不得回退为无模糊的透明色块。工具栏内菜单打开时，工具栏必须退出自己的 backdrop root，避免浏览器仅报告 computed blur 而视觉上无法模糊背景。reduced-transparency 下改为实色表面并移除模糊。
- 模态导入任务使用 scrim；非阻断的预览 sheet 在中等高度不使用 scrim，只在进入近全屏状态后逐渐加深背景。
- 不在半透明 toolbar 上再放第二层半透明卡片。文本和图标使用较高对比，并按语义消费 `typography.weight.{thin,extraLight,light,normal,medium,semibold,bold,extraBold,black}`，不得用 620、650、680 等局部中间值替代主题变量。

## 13. 动效与直接操作

| 交互 | 规则 |
|---|---|
| 按压 | pointer-down 即时变化，约 100ms ease-out，不等待 click |
| Tab / segmented indicator | 从当前呈现位置开始，无过冲弹簧，damping 1.0，response 0.3–0.4s |
| Accordion | 可中断、可反转，无 bounce；只动画必要的尺寸/透明度 |
| Popover | 从触发按钮为 transform origin 材质化出现，关闭沿相同路径 |
| 底部 sheet | 拖动 1:1；释放时投影动量并交接速度，damping 约 0.8，response 约 0.3s |
| 自动预览 | 直接替换有效变量；不对每个 slider tick 播放入场动画，不重复启动 View Transition |
| 保存/复制完成 | 原控件内的文字/图标状态转换，不使用庆祝性大动画 |

所有可互动动画必须在进行中接受新输入。动画不充当状态锁，不等待上一次转移结束后才响应。手势驱动的移动只动画 `transform` 和必要的 `opacity`。

## 14. 错误、警告与状态反馈

- 字段错误与控件就近显示，使用 `aria-describedby` 关联。用户离开字段或输入已可理解时显示文字错误，不在每个不完整按键上刷屏播报。
- 顶部问题按钮显示 errors/warnings 数量，打开后按 mode 和分类分组。选中问题可导航到准确字段。
- 错误会暂停新的预览提交；警告不一定阻止预览，具体以 Core diagnostics 严重级别为准。
- 对比度、引用循环、缺失 token 和格式错误使用具体路径和修复方向，不只显示“Invalid value”。
- 离开页面时只在 `dirty` 且草稿将丢失的情况下提示；已保存或可恢复的导航不反复打断用户。

## 15. 可访问性与媒体偏好

- 全部功能必须只用键盘完成，包括打开面板、编辑滑块、调整缓动点、排序阴影/渐变层、导入、导出和保存。
- 焦点环在浅色和深色 chrome 上均清晰可见，不因 `overflow` 裁剪。焦点顺序与可见布局一致。
- 颜色样本、问题、修改状态和 Light/Dark 选中状态均不只依赖颜色。
- 触控目标至少 44×44 CSS px；小图标使用更大的透明点击区域。
- 200% 文本缩放下不丢失操作或产生水平页面滚动。尺寸、间距和行高优先使用 rem/em。
- `prefers-reduced-motion: reduce`：去除弹性、滑动、视差和大面积位移，使用 120–200ms 交叉淡化或直接替换；保留必要的按压和状态反馈。
- `prefers-reduced-transparency: reduce`：chrome 改为近不透明背景，移除 backdrop blur。
- `prefers-contrast: more`：使用近实色背景、明确边框和更强焦点环。

## 16. React/Vue、源码组件与预览边界

- Contract 字段描述、类型约束和阶梯派生规则应收敛到 editor-core 的无框架公开元数据/纯函数层。Tab/Accordion 分类顺序、搜索别名和可见文案位于被复制的 `editor-layout` 配置，使用户可修改信息架构；React/Vue 组件负责框架渲染、焦点和可定制组合。
- 组件局部状态只允许查询、当前 Tab/mode、Accordion 展开、浮层、未完成文本输入和预览呈现状态；不持有第二份主题草稿。
- editor-core 继续是草稿 revision、诊断、导入、重置和保存规则的唯一来源；Core 继续是验证/解析唯一来源；Runtime 继续是 DOM 预览和持久化唯一来源。
- 官网应优先将预览模板放在独立 ShadowRoot runtime target，或确保编辑器 chrome 完整覆盖 `--oria-editor-*` 而不消费草稿 `--oria-*`。可创建使用公开 runtime 实现的专用 preview instance，但不得为隔离预览而重写 runtime。
- 模块顶层不访问 `window`、`document`、Storage 或 matchMedia；自动预览协调只在 client mount 后启动。

## 17. 验收标准

### 功能

- React/Vue 可见 UI 通过 CLI 复制为用户项目内的多文件组件树，不由 `node_modules` 中的单一黑盒组件提供。
- 路由/页面文件只导入并组合本地 `ThemeEditor`，类型字段、阴影、阶梯、浮层和预览均有独立源码组件。
- 顶部同时提供重置、导入、导出和保存，不存在手动 Preview/Stop Preview。
- Themes Tab 管理 runtime 主题；其余五个 token Tab 覆盖全部标准 Contract token，搜索能跨 token Tab 导航到任意 token。
- color、dimension、number、fontFamily、fontWeight、duration、cubicBezier、shadow、gradient、pattern 都有类型化控件，不再使用通用 JSON textarea 作为主编辑方式。
- 色阶、字号、间距、控件尺寸、圆角、阴影、模糊和时长阶梯均支持主值派生和单项覆写。
- 每个有效 revision 自动预览；快速连续更改以最新 revision 为准；非法草稿保留最后有效画面。
- 重置、导入、导出、保存冲突和离开 dirty 页面均按本文档语义处理。
- 从任一模式修改圆角、间距、排版、效果或动效后，Light/Dark 显示同一值且只产生一次 revision；重置当前模式不撤销这些共享编辑。

### 响应式与可访问性

- 390×844、768×1024与宽屏布局无水平页面溢出，关键操作始终可达。
- 只用键盘可完成一次颜色编辑、阶梯展开/覆写、导入、导出和保存。
- 读屏能读出字段名、Token Path、当前值、错误和保存/预览状态。
- reduced-motion、reduced-transparency 和 increased-contrast 均有不丢失功能的降级。
- 编辑器 chrome 在草稿主题设置极端颜色、透明度、字体和动效时仍可读、可聚焦、可操作。

### 性能与安全

- slider 持续拖动时控件跟手，预览最多每帧提交一次，无全树无关重渲染。
- 预览、导入和保存始终经过 Core 完整验证和 Runtime 原子 stylesheet 替换。
- 任何用户字符串都不直接拼接进 stylesheet，引用循环与非法类型不能进入预览。
- React/Vue/Next 的 SSR-safe import、类型检查、生产构建和浏览器 E2E 均通过。

## 18. 实现顺序

1. 建立 editor-core 共享 Contract 字段描述/阶梯纯函数，以及 registry shared `editor-layout` 分类/搜索展示配置；用测试确认官方布局对全部 Contract token 且只覆盖一次。
2. 将 React/Vue 包收敛为 headless bridge，实现自动预览协调和最新 revision 去过期。
3. 建立 registry manifest 与 React/Vue 多文件组件骨架，实现基础 chrome、工具栏、Tab、搜索、mode 切换与 Accordion。
4. 按 token type 实现独立字段组件，再实现智能阶梯、多层阴影和渐变组件。
5. 完成重置、导入、导出、保存冲突和 dirty navigation 流程。
6. 实现 CLI 安装/dry-run/diff/冲突安全，在独立 React、Vue 和 Next 项目验证源码组件安装与构建。
7. 示例和官网安装并提交自己的组件源码，页面只做组合，最后接入 ShadowRoot 预览。

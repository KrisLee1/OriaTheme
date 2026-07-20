# 编辑器源码组件注册表规范

## 目标

OriaTheme 编辑器的可见 UI 必须以用户持有的源码组件分发。安装后，工具栏、Tab、搜索、字段控件、浮层、预览和样式均位于消费应用的源码目录，可被查看、修改、删除和版本化。

这是与 shadcn/ui 类似的源码所有权模式，但不强制用户采用 Tailwind 或特定原子组件库。默认模板使用普通 CSS 与 `--oria-editor-*` 变量，用户可在拥有源码后替换为自己的 Button、Dialog、Popover、Tabs 或 Sheet。

## 分发边界

| 交付物 | 所在位置 | 职责 |
|---|---|---|
| `@oriatheme/editor-core` | `node_modules` | 草稿、Contract 字段描述、验证、诊断、智能阶梯纯函数、导入导出、重置与保存冲突 |
| `@oriatheme/react-editor` | `node_modules` | React session Provider、hooks、订阅与自动预览协调；无完整可视 UI |
| `@oriatheme/vue-editor` | `node_modules` | Vue provide/composables、订阅与自动预览协调；无完整可视 UI |
| `@oriatheme/cli` | `pnpm dlx` / `npm exec` / `yarn dlx` / `bunx` 一次性工具 | 解析 registry manifest、展示计划、安全复制文件、补充依赖和生成本地记录 |
| React/Vue 可见组件 | 用户项目 `components/oria-theme-editor/` | 布局、字段渲染、交互、可访问性、品牌定制与局部呈现状态 |
| 官方 registry | 官网静态资源 | 提供经版本化、带 hash 的 manifest 和源文件；不接收用户主题内容 |

`node_modules` 中的包可包含类型、领域逻辑和框架桥接，但不得将整个可视编辑器实现作为默认黑盒组件分发。

## 仓库结构

```text
OriaTheme/
├── packages/
│   ├── editor-core/          # 共享领域与 UI 描述纯函数
│   ├── react-editor/         # React headless bridge
│   ├── vue-editor/           # Vue headless bridge
│   └── cli/                  # 源码组件安装器
│       └── registry/
│           ├── manifest/     # 经验证的 registry item JSON
│           └── templates/
│               ├── shared/theme-editor/  # 可复制的分类/面板/搜索展示配置
│               ├── react/theme-editor/
│               └── vue/theme-editor/
└── apps/website/                 # 展示、验证并静态托管 registry 产物
```

`packages/cli/registry/templates` 是官方可见 UI 源码的唯一仓库真相。React 和 Vue 模板可以有框架语法差异，但 Themes、五个 token 分类、面板和搜索展示配置必须保持一致，并共同消费 shared `editor-layout.ts`。Contract 字段描述、校验和阶梯派生纯函数来自 editor-core；用户可修改已复制的分类顺序、面板组合、搜索别名和可见文案，但不复制领域规则。

## 安装契约

默认命令：

```bash
# 以下四行选择一行；Vue 将 react 改为 vue
pnpm dlx @oriatheme/cli@latest add theme-editor --framework react
npm exec --yes --package=@oriatheme/cli@latest -- oria add theme-editor --framework react
yarn dlx @oriatheme/cli@latest add theme-editor --framework react
bunx @oriatheme/cli@latest add theme-editor --framework react
```

可选指定目标目录：

```bash
pnpm dlx @oriatheme/cli@latest add theme-editor \
  --framework react \
  --path src/components/oria-theme-editor
```

CLI 必须：

1. 读取 `package.json`、TypeScript 配置和用户指定的目标路径；
2. 拉取或读取与 CLI 兼容的 registry manifest；
3. 在写入前打印文件、目标位置和将添加的依赖计划；
4. 默认拒绝覆盖任何已存在文件；
5. 在用户确认后写入组件并将精确的框架/runtime 依赖写入 `package.json`，不添加另一框架；保留已有 `packageManager`、scripts、dependencies 与 devDependencies；CLI 不运行包管理器、不创建或改写 pnpm/npm/Yarn/Bun lockfile，用户随后用项目自己的工具更新 lockfile；
6. 生成 `.oria/components.json`，记录 registry item、源版本、framework、目标路径和安装时文件 hash；
7. 不运行 registry 提供的脚本、postinstall 或任意 shell 命令。

必须提供：

- `--dry-run`：只显示计划与冲突；
- `--yes`：非交互式确认写入；未提供时 CLI 只显示计划并拒绝修改项目；
- `diff theme-editor`：对比用户文件、安装基线和最新 registry，不写入；
- `--overwrite`：用户显式选择时才可覆盖，覆盖前再列出已修改文件；
- `--registry <url-or-path>`：支持官方 HTTPS registry 与本地开发 registry。

`diff theme-editor` 必须带 `--framework react|vue`；没有 `--path` 时，它使用 `.oria/components.json` 中对应安装记录的目标目录。

本地组件记录只是开发工具元数据，不进入 ThemeDefinition、LocalStorage 或 runtime snapshot。

## Registry Manifest

```ts
interface EditorRegistryItemV1 {
  schemaVersion: 1;
  name: "theme-editor";
  framework: "react" | "vue";
  version: string;
  compatiblePackages: Readonly<Record<string, string>>;
  dependencies: readonly string[];
  files: readonly {
    source: string;
    target: string;
    sha256: string;
  }[];
}
```

- `source` 和 `target` 必须是无绝对路径、无 `..` 的规范化相对路径。
- CLI 必须校验 schema、framework、版本兼容、文件数量/大小上限和每个 SHA-256，任一失败时不写入。
- Manifest 不支持 lifecycle scripts、任意命令、可执行二进制或超出注册表基目录的路径。
- Registry item 版本表示源码模板版本，不替代 npm semver、Theme schema version 或 Token Contract version。
- 每个 registry item 必须将 `templates/LICENSE` 映射为安装目录的 `LICENSE`，与所有模板文件一样接受 SHA-256 校验和安装基线记录。首发模板许可证为 Apache-2.0；使用方在再分发该源码时须遵守其保留声明与提供许可证副本的要求。

## React 源码组件结构

```text
components/oria-theme-editor/
├── index.ts
├── theme-editor.tsx               # 组合根，不包含类型字段实现
├── editor-shell.tsx
├── editor-toolbar.tsx
├── editor-tabs.tsx
├── editor-search.tsx
├── editor-mode-switch.tsx
├── editor-workspace.tsx
├── themes-workspace.tsx
├── theme-accordion.tsx
├── theme-list-item.tsx
├── editor-preview.tsx
├── editor-layout.ts               # 用户可修改的 Tab/Accordion/搜索展示配置
├── token-accordion.tsx
├── token-field.tsx                 # 只做 type -> field component 路由
├── fields/
│   ├── color-field.tsx
│   ├── base-color-palette.tsx
│   ├── dimension-field.tsx
│   ├── number-field.tsx
│   ├── font-family-field.tsx
│   ├── font-weight-field.tsx
│   ├── duration-field.tsx
│   ├── linear-slider.tsx
│   ├── slider-ranges.ts
│   ├── easing-field.tsx
│   ├── shadow-field.tsx
│   └── gradient-field.tsx
├── scales/
│   ├── token-scale-editor.tsx
│   └── scale-value-row.tsx
├── shadows/
│   ├── shadow-layer-editor.tsx
│   └── shadow-preview.tsx
├── overlays/
│   ├── reset-menu.tsx
│   ├── confirmation-dialog.tsx
│   ├── import-dialog.tsx
│   ├── export-menu.tsx
│   └── issues-popover.tsx
├── hooks/
│   ├── use-field-buffer.ts
│   ├── use-token-search.ts
│   └── use-editor-layout.ts
└── theme-editor.css
```

## Vue 源码组件结构

Vue registry item 必须提供与 React 相同的职责边界，使用 `ThemeEditor.vue`、`EditorToolbar.vue`、`fields/ColorField.vue`、`composables/useFieldBuffer.ts` 等对应文件。文件名可符合 Vue 惯例，但不得把所有 template、script 和 style 集中在一个 `ThemeEditor.vue` 中。

## 组件职责规则

- `theme-editor` 只组合 Provider、Shell、Toolbar、Tabs、Workspace 和 Preview，不直接枚举 token 或实现颜色/阴影控件。
- React/Vue `theme-editor` 可接受 host 提供的受控 `mode` / 模式变更回调；当 host 显式启用 `previewFollowsAppearance` 时，自动预览不锁定独立 mode，而是让活动草稿跟随 runtime appearance。官方 React、Next 与 Vue 示例必须将页面 Appearance 与编辑器 Light/Dark 都路由到同一 `setAppearance(..., { animate, origin, preservePreview })` 入口，不维护第二份模式状态。
- `themes-workspace` 只通过 runtime snapshot 与公开主题生命周期 API 组合 My themes / Presets；主题条目和折叠面板保持独立组件。custom 的改名/应用/编辑/复制/删除与 preset 的应用/复制不得复制 runtime 持久化状态机。
- Toolbar、Tabs、Search、Mode Switch、Accordion、Preview、每种 token field、Scale、Shadow Layer 和每个 overlay 都是可独立替换的组件。
- React/Vue Toolbar 将主题名称/预览状态/关闭与重置/导入/导出/问题状态/保存分为两层；草稿工具和提交操作分别分组，全部操作目标保持 44px 高。窄容器通过 container query 把次级操作收敛为仍有可访问名称的图标，不由宿主页面 CSS 覆盖组件内部尺寸或换行规则。
- React/Vue `ImportDialog` 使用文件卡片、44px `Choose file` 控件、已选文件名反馈和独立粘贴区；文件入口接受 `.oria-theme.json` / `.json`，打开后聚焦文件选择并锁定文档根与 body 的背景滚动，任意关闭路径和卸载时恢复原值，模态内部保持可滚动。`ExportMenu` 下载文件名必须以 `.oria-theme.json` 结尾。两者继续只调用 editor session，不自行解析或放宽 JSON。
- React/Vue `IssuesPopover` 固定在 Save 左侧；`ready`、`warning`、`error` 分别消费 success、warning、destructive 主题色，同时使用不同图标、可见数量文案和可访问名称。warning 不得伪装为阻断错误，存在 validation issue 时 error 优先。
- React/Vue Reset / Export / Issues 的锚定菜单共享外部点击与 Escape dismiss 行为；事件监听必须随组件卸载清理，菜单内部交互不得触发关闭。
- React/Vue Reset / Export / Issues 菜单、Import / confirmation dialog 与 `BaseColorPalette` 浮层统一以 `color.overlay` 为背景、`color.overlayForeground` 为内容色，并同时声明标准/WebKit backdrop blur；Overlay 背景 alpha 必须消费 `effect.opacity.overlay`，模糊强度必须消费 `effect.backdropBlur.{sm,md,lg,xl}` 与 `effect.backdropSaturation`，字体层级必须消费九级 `typography.weight.*`，不在模板中写死透明度、中间字重或模糊像素。背景 alpha 必须通过派生背景色实现，不得给整个弹层设置 opacity 并降低前景可读性。浮层通过 Portal/Teleport 渲染到 `document.body` 时，浮层根节点必须重新映射它消费的 editor 主题别名，不能假设继承编辑器根节点的局部变量。菜单打开时取消祖先 toolbar 的 backdrop filter，避免嵌套 backdrop root 使视觉模糊失效。颜色、渐变 stop 与阴影色样在棋盘底上呈现实际 alpha，原生 color input 使用去除 alpha 后的 RGB，不能让 4/8 位 HEX 错误显示为黑色。`prefers-reduced-transparency` 继续优先使用实色降级。
- React/Vue `confirmation-dialog` 是重置、dirty 关闭和 host 正式主题切换共用的模态确认表面；必须使用可访问标题/说明、Cancel 与明确动作标签，支持 Escape 和焦点约束，不调用 `window.confirm()`。`editor-shell` 只在 dirty session 上注册 `beforeunload`，并通过 dirty change / discard request 让 host 的主题列表复用同一保护逻辑。
- 字段组件通过 props/emits 接收值、问题和提交回调，不直接创建 runtime 或 session。
- React/Vue 字段统一使用“左侧名称、右侧控件”的紧凑卡片行，卡片之间保留明确间距；颜色样本、色值输入和基础色卡按钮使用约 32–34px 的视觉尺寸。滑块由独立 LinearSlider 组件统一轨道、拇指、Pointer Capture、逐帧提交和键盘语义，并由 slider ranges 提供固定的语义范围；不得让宿主页面通用 input/card 样式覆盖这些内部尺寸，也不得随当前值动态改变范围。
- React/Vue 颜色字段的名称列获取剩余宽度，控件列按实际内容宽度收敛，长名称可换行且不得在仍有空白时被截断。Accordion 默认全部展开，按钮状态、内容 `hidden` 与真实布局显示必须同步；Search 的图标和输入共享单一外层材质与 focus-within 反馈，内部 input 不绘制第二套边框、背景或阴影。
- 基础色卡选择器是颜色字段后的独立源码组件，从 `@oriatheme/colors` 读取稳定色值并支持搜索；它以浅色中性底、独立彩色样卡组成的按钮为触发点，用 portal 渲染受视口约束且随按钮定位的非模态 popover，不使用全页模态遮罩。组件提供带文字圆形色块与无可见文字的逐家族紧凑圆角色阶两种视图，后者仍保留完整可访问名称。它只把选中值交还颜色字段提交，不把色库复制进草稿，也不绕过 editor-core。
- 全局搜索与 Light/Dark 控件通过弹性宽度和稳定 gap 分组；基础色卡搜索复用同一轮廓图标、连续表面及 focus-within 反馈。React/Vue 渐变字段必须为 linear、radial、repeating-linear、repeating-radial、conic 提供安全实时预览与结构化类型、角度/中心、颜色停止点编辑；Origin 使用九宫格预设和可选 X/Y 百分比坐标，不把受限结构退化为任意 CSS 文本。每个停止点复用 `BaseColorPalette` 并提供原生颜色选择和颜色值输入，不复制色库逻辑、不以 JSON textarea 作为默认 UI，也不绕过 editor session 的原子提交。
- Contract 字段描述、类型约束和阶梯算法必须来自 editor-core 公开元数据/纯函数；Tab/Accordion 编排、搜索别名和可见文案来自被复制的 `editor-layout` 配置，因而可由用户修改。
- 路由或页面文件中只允许导入用户项目内的 `ThemeEditor`、创建/传入 runtime 与 options、并在保存后同步正式主题选择但保持编辑器打开。不得在页面中实现工具栏、Tab、token map、字段 renderer、导入/导出对话框或编辑器 CSS。
- 用户可修改已复制组件；官方升级不假设本地源码仍与 registry 一致。

## 消费示例

```tsx
"use client";

import { ThemeEditor } from "@/components/oria-theme-editor";
import type { OriaThemeRuntime } from "@oriatheme/runtime-dom";

export function EditorRoute({ runtime }: { runtime: OriaThemeRuntime }) {
  return (
    <ThemeEditor
      runtime={runtime}
      options={{
        source: /* selected preset or custom theme */,
        identity: /* required for a preset copy */
      }}
    />
  );
}
```

页面不从 `@oriatheme/react-editor` 导入可视 `OriaThemeEditor`；可见根组件始终来自用户项目内的组件目录。

## 更新和冲突

- 官方发布新 registry item 时不自动改写用户项目。
- `oria diff theme-editor` 使用安装时 hash 区分本地修改、上游修改和双方修改。
- 默认更新流程是查看 diff 后手动合并。`--overwrite` 是显式破坏性选择，CLI 不隐藏或删除用户修改。
- npm 包与 registry item 分别版本化。Manifest 的 `compatiblePackages` 防止把新 UI 源码与不兼容的 editor-core/runtime 组合。

## 安全与隐私

- 官方 registry 只提供静态源文件和 manifest，不上传项目文件、主题、安装路径或使用数据。
- CLI 默认不启用 telemetry，不执行 registry scripts，不越出已确认的项目根和目标目录。
- 所有远程文件必须通过 HTTPS 获取并与 manifest SHA-256 匹配。
- 复制到用户项目的组件不得绕过 Core 验证，不得将用户字符串直接拼接为 stylesheet。

## 兼容性与未决项

- `TBD-REG-01`：官方 registry 基地址已确定为 `https://theme.oria.org.cn/registry/v1`。该地址必须以 HTTPS 静态提供 `manifest/theme-editor.{react,vue}.json` 与 manifest 引用的所有模板文件；DNS、TLS、托管平台和真实远程安装验证尚未完成，仍阻塞公开 CLI/registry、首发与官网启动，但不阻塞本地 `--registry <path>` 实现和消费测试。
- 官方静态部署只允许使用 `pnpm build:registry` 生成的 `dist/` 输出。该构建在写入产物前校验 manifest SHA-256，且仅复制 manifest 与其引用的文件；不得直接部署整个仓库或 `registry/` 目录。
- 源码组件模板许可证已确定为 Apache-2.0。CLI 在每次安装中将完整 `LICENSE` 写入组件目录；该决定不再阻塞公开 registry 或首发。
- 官方首版同时交付 React 和 Vue item；任一 item 不能把另一框架加入消费项目。
- 公开包与 CLI 必须兼容 pnpm、npm、Yarn 和 Bun 消费项目；OriaTheme 源码仓库自身仍只维护 pnpm workspace 与 `pnpm-lock.yaml`。

## 验收标准

- React/Vue 各自的 registry item 包含多文件、可独立替换的工具栏、导航、字段、阶梯、阴影、浮层和预览组件。
- 独立 React、Vue 和 Next 消费项目使用 CLI 安装后，可见组件存在于项目源码且生产构建通过。
- `@oriatheme/react-editor` / `@oriatheme/vue-editor` tarball 不包含完整默认 UI 样式或默认黑盒 `OriaThemeEditor`。
- 页面/路由文件只组合本地 `ThemeEditor`，不包含 token map、类型字段 renderer 或编辑器 CSS。
- `--dry-run`、diff、已有文件拒绝覆盖、显式 `--overwrite`、路径穿越拒绝和 hash 失配都有测试。
- 安装 React item 不引入 Vue，安装 Vue item 不引入 React。
- pnpm、npm、Yarn、Bun 的隔离消费项目均能运行 add/dry-run/diff，CLI 保留消费项目 package-manager 元数据且不生成其他 lockfile；Yarn 同时验证 node-modules linker 与 Plug'n'Play。
- 注册表组件继续满足[主题编辑器 UI 设计](../design/editor-ui.md)的功能、响应式、可访问性、性能和安全验收。

# React 与 Vue 主题编辑器

[English](en/theme-editors.md) · [指南首页](README.md)

> 状态：公开 HTTPS registry 当前仍提供 `0.2.0`。仓库已准备 `0.3.0`（OKLCH 色库桥接与 TypeScript 复制/下载），要求下一批兼容包版本；本任务未部署 registry，因此部署前通过 `@latest` 安装仍得到 `0.2.0`。

OriaTheme 的可见编辑器 UI 使用源码组件模式。组件模板位于 `packages/cli/registry/templates/`；React、Vue 与 shared layout 已拆成多文件模板并由 manifest 记录 SHA-256。安装后，Toolbar、Tabs、搜索、token 字段、阶梯、阴影、浮层、预览和 CSS 都位于用户项目的 `components/oria-theme-editor/` 目录，可直接修改和提交到 Git。

`@oriatheme/editor-core` 仍管理未保存草稿、校验、诊断、导入导出、预览句柄和保存冲突；React/Vue headless bridge 只负责 session 注入、订阅和自动预览协调。修改本地 UI 不需要修改 `node_modules`，也不应复制 editor-core/runtime 状态机。

如果编辑器默认关闭，应通过框架动态组件能力同时延迟加载本地 UI 与 `theme-editor.css`；React、Vue 和 Next 的已验证写法见[性能集成指南](performance.md)。

CLI 可通过 `pnpm dlx`、`npm exec`、`yarn dlx` 或 `bunx` 执行，完整等价命令和 lockfile 规则见[包管理器兼容性](package-managers.md)。下文只用 pnpm 展示与编辑器相关的参数。

## React

```bash
pnpm dlx @oriatheme/cli@latest add theme-editor --framework react --dry-run
pnpm dlx @oriatheme/cli@latest add theme-editor --framework react --yes
```

CLI 默认将组件安装到 `components/oria-theme-editor/`；可用 `--path <relative-path>` 指定项目内的其他目录。它会在确认后添加所需 OriaTheme 依赖到 `package.json`，然后提示用户运行自己的 package manager 更新 lockfile。页面只组合本地根组件：

```tsx
"use client";

import { ThemeEditor } from "@/components/oria-theme-editor";
import { oriaOceanTheme } from "@oriatheme/presets";
import type { OriaThemeRuntime } from "@oriatheme/runtime-dom";

export function Customizer({ runtime }: { runtime: OriaThemeRuntime }) {
  return (
    <ThemeEditor
      runtime={runtime}
      options={{
        source: oriaOceanTheme,
        identity: { id: "my-ocean", name: "My Ocean" }
      }}
    />
  );
}
```

路由文件不应再实现 token map、字段 renderer、导入/导出对话框或编辑器 CSS。这些内容位于已安装的可复用组件文件中。

## Vue

```bash
pnpm dlx @oriatheme/cli@latest add theme-editor --framework vue --dry-run
pnpm dlx @oriatheme/cli@latest add theme-editor --framework vue --yes
```

```vue
<script setup lang="ts">
import { ThemeEditor } from "@/components/oria-theme-editor";
import { oriaOceanTheme } from "@oriatheme/presets";
import type { OriaThemeRuntime } from "@oriatheme/runtime-dom";

defineProps<{ runtime: OriaThemeRuntime }>();
</script>

<template>
  <ThemeEditor
    :runtime="runtime"
    :options="{
      source: oriaOceanTheme,
      identity: { id: 'my-ocean', name: 'My Ocean' }
    }"
  />
</template>
```

## 自定义与更新

- 直接编辑 `components/oria-theme-editor/` 中的组件和 `theme-editor.css`；不修改 `node_modules`。
- 可用自己的 Button、Dialog、Popover、Tabs 或 Sheet 替换对应组件，但必须保留可访问名称、焦点恢复和键盘交互。
- `pnpm dlx @oriatheme/cli@latest diff theme-editor --framework react`（或 `vue`）只显示本地与 registry 的差异，不改写文件。
- 重新执行 `add` 不会默认覆盖已有组件。优先手工合并 diff；只有确定放弃本地修改时才使用 `--overwrite`。
- `add` 无 `--yes` 时只显示计划并以退出码 2 结束；`--dry-run` 以退出码 0 明确验证零写入。

## 草稿、自动预览与保存

- 预设会先变成带指定 identity 的 custom 草稿；不能编辑原 preset。
- 提供 runtime 后，最新完整有效 revision 会自动预览；默认 UI 没有 Preview/Stop Preview 按钮。
- 非法的中间输入保留最后有效画面，不部分应用主题。
- 自动预览不写入 preference 或 Storage。Save 才会完整校验并创建/更新 custom theme。
- Export → Copy TypeScript 或 Download TypeScript 生成可直接放入应用源码、`satisfies ThemeDefinition` 的完整常量，并把旧草稿中的 HEX 颜色写成 OKLCH；下载文件名为 `<theme-id>.oria-theme.ts`。Copy JSON / Download JSON 保持 `.oria-theme.json` 文件工作流。导出不保存或修改草稿；Import JSON 只原子替换内存草稿。

## 安全

CLI 在写入前展示文件和依赖计划，默认拒绝覆盖，并校验 registry manifest 与 SHA-256。它只接受 bundled registry、本地路径或 HTTPS registry，拒绝路径越界、符号链接目标、非 HTTPS URL 和包含 scripts 的 manifest。Registry 不提供或执行 lifecycle scripts。组件运行时的用户输入仍必须经 Core 校验和 Runtime 原子 stylesheet 替换。

发布前从仓库验证 CLI 的方式见[开发者指南](development.md#cli-与-registry-开发)。

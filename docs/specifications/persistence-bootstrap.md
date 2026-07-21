# 持久化与 Bootstrap 规范

## Storage 抽象

```ts
export interface ThemeStorage {
  // 外部输入不可信，runtime 在完整校验后才使用。
  read(): unknown | null;
  write(state: PersistedThemeState): void;
  clear(): void;
  subscribe?(listener: () => void): () => void;
}
```

默认 LocalStorage；可替换。Storage 失败不能导致内存主题切换失败，runtime 通过 error snapshot/onError 报告。

## 主状态

Key：`{storageKey}:state:v1`

```ts
export interface PersistedThemeStateV1 {
  schemaVersion: 1;
  preference: ThemePreference;
  customThemes: ThemeDefinition[];
}
```

- 默认最多 50 个 custom theme。
- 读取必须按 schema 和 contract 校验。
- JSON 损坏、版本不支持或 active theme 不存在时回退默认状态。
- 自定义主题 immutable 更新。

## Active Snapshot

Key：`{storageKey}:active:v1`

```ts
export interface ActiveThemeSnapshotV1 {
  schemaVersion: 1;
  contract: ThemeContractRef;
  themeId: string;
  appearance: AppearanceMode;
  variablePrefix: string;
  lightVariables: Record<string, string>;
  darkVariables: Record<string, string>;
}
```

它只服务首屏，保存当前主题已解析变量，不是状态真相。正式 runtime 启动后以主状态和当前 contract 重验。

## Bootstrap

可提供：

```ts
export interface BootstrapOptions {
  // 未提供时从 `{storageKey}:active:v1` 读取。
  snapshot?: unknown;
  storageKey?: string;
  contract?: ThemeContractRef;
  variablePrefix?: string;
  target?: Document | ShadowRoot;
}

createBootstrapScript(options: BootstrapOptions): string;
createBootstrapStorageScript(options?: Pick<BootstrapOptions, "storageKey" | "contract" | "variablePrefix">): string;
bootstrapTheme(options?: BootstrapOptions): void;
```

- 在框架挂载前读取 active snapshot。
- 按 appearance + matchMedia 选择变量。
- 校验 schema、contract、prefix、变量 key/value 后单次写入 style。
- 变量 value 拒绝 `;{}<>`、任意 `var(` / `expression(` / `url(`；唯一例外是 Core pattern 编译器生成的 `url("data:image/svg+xml,...")` 内联 SVG data URI（必须带引号且前缀完全匹配），其余 `url(` 形式一律拒绝。
- 失败时静默使用消费应用的静态默认 CSS，不抛出阻塞启动的错误。
- 不加载 preset 全集，不运行动画。
- Bootstrap 与 runtime 使用相同变量命名和安全规则；可通过共享的精简模块避免规则漂移。
- `createBootstrapScript()` 只序列化已通过校验的调用方 snapshot；无效输入返回空脚本。
- `createBootstrapStorageScript()` 生成可内联到 HTML `<head>` 的自包含脚本。它在浏览器中读取 `{storageKey}:active:v1`、以与 `bootstrapTheme()` 等价的规则校验并单次写入 document；不支持自定义 `target`，失败时静默返回。
- 早期脚本不得嵌入预设全集或完整 runtime；其配置序列化必须避免形成可注入的 stylesheet 或 inline script。

## 迁移

```ts
type Migration = (input: unknown) => unknown;

const migrations: Record<number, Migration> = {
  1: migrateToV1,
};
```

持久化 schema version 与 package major、theme schema、contract version 互相独立。每条迁移必须有 fixture 和失败回退测试。

## 跨标签页

- 默认 LocalStorage adapter 可以监听 `storage` 事件。
- 外部状态必须完整校验后应用。
- 与当前状态相同则忽略，避免回声。
- Preview 期间收到外部正式状态：更新正式 snapshot 基线，但保留 preview；dispose 后恢复最新正式状态。
- 冲突采用 last successfully validated write wins，v1 不实现分布式合并。

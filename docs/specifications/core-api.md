# Core API 规范

`@oriatheme/core` 是纯 TypeScript 包，不访问环境 API。

## Contract API

```ts
defineTokenContract(input: TokenContractInput): TokenContract;
extendTokenContract(base: TokenContract, extension: TokenContractInput): TokenContract;
getTokenDefinition(contract: TokenContract, path: TokenPath): TokenDefinition | undefined;
```

Contract 创建时立即校验；无效 contract 抛出结构化 `OriaThemeError`。

## Theme API

```ts
validateTheme(input: unknown, contract: TokenContract): ValidationResult<ThemeDefinition>;
normalizeTheme(theme: ThemeDefinition, contract: TokenContract): ThemeDefinition;
resolveTheme(theme: ThemeDefinition, mode: ResolvedMode, options?: ResolveOptions): ResolvedTheme;
cloneTheme(theme: ThemeDefinition, identity: { id: string; name: string }, clock?: Clock): ThemeDefinition;
createThemeFromSeed(seed: ThemeSeed, options: CreateThemeOptions): ThemeDefinition;
```

要求：

- `validateTheme` 不抛普通异常，返回完整问题列表和路径。
- `resolveTheme` 是纯函数，解析引用、默认值、结构化 token 和 CSS 变量名。
- 标准 contract 主题可直接解析；扩展 contract 主题必须通过 `ResolveOptions.contract` 提供其已注册的 contract。
- `normalizeTheme` 只做确定性规范化，不改变主题视觉语义。
- `cloneTheme` 输出 `kind: "custom"` 并更新时间。
- Seed 算法优先使用 OKLCH，同时生成 light/dark；若算法质量未达标，不阻塞完整 token 模式。

## 导入与导出

建议扩展名 `.oria-theme.json`，MIME 为 `application/json`。

```ts
exportTheme(theme: ThemeDefinition): string;
importTheme(json: string, options: ImportThemeOptions): ImportResult;
```

```json
{
  "$schema": "https://oriatheme.dev/schema/theme-v1.json",
  "schemaVersion": 1,
  "contract": { "name": "oria-standard", "version": 1 },
  "id": "my-theme",
  "name": "My Theme",
  "kind": "custom",
  "modes": { "light": {}, "dark": {} }
}
```

- 先检查默认 128 KiB 大小限制，再 parse 和 schema 校验。
- ID 冲突默认生成新 ID；只有显式 `conflict: "replace"` 才覆盖 custom。
- 永远不能覆盖 preset。
- 外部输入一律转换为 custom。
- Contract 不匹配时返回错误或使用显式迁移器。

## 错误模型

```ts
export class OriaThemeError extends Error {
  readonly code: OriaThemeErrorCode;
  readonly path?: string;
  readonly details?: Readonly<Record<string, unknown>>;
}
```

稳定错误码至少包括：

```text
INVALID_JSON
UNSUPPORTED_SCHEMA_VERSION
UNSUPPORTED_CONTRACT
INVALID_CONTRACT
INVALID_THEME
INVALID_TOKEN_PATH
INVALID_TOKEN_VALUE
TOKEN_REFERENCE_NOT_FOUND
TOKEN_REFERENCE_TYPE_MISMATCH
TOKEN_REFERENCE_CYCLE
THEME_NOT_FOUND
THEME_ID_CONFLICT
PRESET_IMMUTABLE
STORAGE_READ_FAILED
STORAGE_WRITE_FAILED
DOM_APPLY_FAILED
```

生产代码不得要求消费者解析错误 message；message 可改进，code 需保持兼容。

## 对比度与诊断

```ts
analyzeTheme(theme: ThemeDefinition, contract: TokenContract): ThemeDiagnostics;
contrastRatio(foreground: string, background: string): number;
```

Diagnostics 区分 error 和 warning。Schema/引用错误阻止解析；对比度警告默认不阻止用户保存，但内置 preset 构建时必须无关键对比度警告。

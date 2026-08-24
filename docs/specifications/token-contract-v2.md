# Token Contract v2（当前标准）

> 状态：Accepted；[Phase 10](../phases/phase-10-contract-v2.md) 实现中。关联 [ADR-0017](../decisions/ADR-0017-contract-v2-token-naming-and-tailwind-bridge.md)、[ADR-0018](../decisions/ADR-0018-contract-v2-in-phase-10.md)、[ADR-0019](../decisions/ADR-0019-default-to-contract-v2.md) 与 [v2 设计](../design/contract-v2.md)。

`oria-standard@2` 是当前的简洁命名 Contract，也是默认且唯一的标准 Contract（ADR-0019）。未传 contract 的 Core/Runtime API 均使用 v2。`oria-standard@1` 仅以 legacy 形式保留为迁移输入（`oriaStandardContractV1`、`oriaDefaultThemeV1` 与 `migrateOriaStandardV1ToV2()`），两者由 `{ name, version }` 严格区分。

## 命名与 CSS Contract

- token path 使用小写 dot notation：`color.primary.fg`、`font.weight.semibold`、`text.md`、`shadow.md`。
- Runtime CSS 保留 Oria 前缀，默认输出 `--oria-*`；v2 prefix 必须非空。path 的 `.` 编译为 `-`，例如 `font.weight.semibold` 为 `--oria-font-weight-semibold`。
- 不直接占用 Tailwind 的无前缀 theme namespace。Tailwind 兼容通过后续可选构建期 bridge 完成，不进入 Core 或 Runtime 依赖图。

## Source token 与派生变量

主题 JSON 只保存 source token。`space` 和 `radius` 是唯一几何长度来源；`control.height.*` 与 `control.padding.x.*` 保存整数倍数（Core 校验强制 1–24 整数）且不输出为 CSS variables。

Core 只允许经 Contract 声明的安全维度派生：固定倍数 scale，或一个 dimension source 与一个 number factor 的 product。派生变量不是 token，不能编辑、持久化或作为 `$ref` 目标。

| Source | Derived CSS variables |
| --- | --- |
| `space` | `--oria-space`；`--oria-control-height-{sm,md,lg}`；`--oria-control-padding-x-{sm,md,lg}` |
| `radius` | `--oria-radius-{xs,sm,md,lg,xl,2xl,3xl,4xl}` |

默认 `space` 与 `radius` 都是 `0.25rem`。radius scale 为 0.5/1/1.5/2/3/4/6/8 倍，故在默认 root font size 下为 2/4/6/8/12/16/24/32px；`radius: 0` 有效。

## Scope

mode-local：`color.*`、`shadow.*`、`gradient.*`、`pattern.*`。其余 v2 source token shared。Editor Core 必须只展示 source tokens，并将派生变量归入只读预览而非字段。

## 颜色表示与透明度

- `oriaDefaultTheme`、`@oriatheme/presets` 的全部 v2 主题和 `@oriatheme/colors` 对外物化完整的 `oklch(L% C H[/ A])` CSS color；shadow、gradient stop 与 pattern layer 中的嵌套颜色遵循同一规则。
- Runtime CSS variables 仍保存完整颜色，例如 `--oria-color-primary: oklch(62% 0.2 255)`，因此既有 `color: var(--oria-color-primary)` 不变。不得把标准变量改为裸 `L C H` 通道。
- 自定义主题继续接受受限静态 OKLCH，以及既有 HEX、RGB、HSL 和 named color。Core 不强制重写合法的现有 v2 自定义主题；`oria-standard@1` legacy 数据保留原表示，显式 v1→v2 migration 的结果规范化为 OKLCH。
- 需要用独立变量覆盖 alpha 时，可以使用 relative color syntax；需要兼容降级时使用 `color-mix`，不要给整个组件设置 `opacity`：

  ```css
  .badge {
    --badge-opacity: 0.72;
    background: oklch(from var(--oria-color-primary) l c h / var(--badge-opacity));
  }

  @supports not (color: oklch(from red l c h)) {
    .badge {
      background: color-mix(in oklch, var(--oria-color-primary) calc(var(--badge-opacity) * 100%), transparent);
    }
  }
  ```

## Migration

`migrateOriaStandardV1ToV2(input)` 返回完整的 `ThemeMigrationResult`，其中包含 v2 theme、warnings 和 `requiresReview`。它映射语义 token，并从 v1 spacing/radius/control 数据推导 v2 source；任何不能精确落到 v2 geometry 规则的情况必须发出 warning、标记复核。

导入、Runtime rehydrate 和 Storage 恢复默认拒绝 contract mismatch。调用方只有显式注册 migration 才能接受 v1 custom theme；成功迁移后必须经过 v2 完整验证才可原子应用。v1 Bootstrap snapshot 不能被 v2 读取，Runtime 成功应用后才写入 v2 active snapshot。

官方 preset 直接在源码中以 v2 定义（`@oriatheme/presets` 的全部导出均为 `oria-standard@2` 主题），不经过 v1 主题或运行时迁移；v1 不再提供官方预设。

## Tailwind Bridge 边界

`@oriatheme/tailwind` 静态映射已知 prefix 的 v2 variables 至 Tailwind v4 `@theme inline` namespace，例如 `--oria-space` → `--spacing`、`--oria-radius-lg` → `--radius-lg`、`--oria-color-bg` → `--color-background`。custom prefix 必须预构建 bridge；运行时不拼接 CSS variable 名称。

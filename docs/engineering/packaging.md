# 构建与发布

建议：pnpm workspace、TypeScript strict、tsup 或等价工具、Vitest、Playwright、ESLint、Prettier、Changesets。

## 包要求

- ESM 为必需；如提供 CJS，必须有等价 smoke test。
- 每个包生成 `.d.ts` 和 source map。
- package exports 明确列出公开入口，禁止依赖深层内部路径。
- `sideEffects` 精确声明 bootstrap/CSS 入口。
- React/Vue 是各自 adapter 的 peer dependency。
- React Editor/Vue Editor 是可选 headless 框架桥接包，分别以 React/React DOM 与 Vue 为 peer dependency；不得交叉引入另一框架，不将完整可视编辑器或默认 UI CSS 作为默认交付面。
- Editor Core 生成 ESM、`.d.ts` 和 source map；可以依赖 SSR-safe 的 runtime-dom 公开 API，但不得包含直接 DOM/Storage 访问或框架代码。
- `@oriatheme/colors` 生成 ESM、`.d.ts`、`styles.css` 与 `tailwind.css`；两个 CSS 子路径必须通过 exports 公开并在 `sideEffects` 中精确保留。Tailwind 只用于开发期编译兼容测试。
- `@oriatheme/cli` 是开发时命令行工具，必须限制写入目标、校验 registry schema/hash，不执行 registry scripts，不作为消费应用 runtime 依赖。
- 公开包和 CLI 必须使用 pnpm、npm、Yarn、Bun 都能消费的标准 ESM exports、semver dependencies/peerDependencies 与 `bin`；发布产物不得泄漏 `workspace:*`。CLI 只修改标准 `package.json`，不得执行包管理器或创建 lockfile。
- 首发 scoped npm 包和 Changesets 配置均必须显式使用 `access: public`；十个公开包的 `homepage` 统一为 `https://theme.oria.org.cn`。`repository` 和 `bugs` 只能在 GitHub 组织/仓库 URL 确定后填写，不得猜测。
- `registry/templates` 不打入 editor 框架包；它通过带 SHA-256 的静态 manifest 分发，复制到用户项目后由用户持有。
- npm 包不包含 apps、测试快照和开发垃圾文件。
- `apps/website` 必须为 private，不进入 Changesets、pack、publish 或 npm 包 files。
- 所有公开包、CLI 与 registry 源码模板使用 Apache-2.0。每个包在 `prepack` 时从根 `LICENSE` 生成包内许可证，并通过 `files` 白名单随 tarball 交付；公开 registry 基地址固定为 `https://theme.oria.org.cn/registry/v1`，在 DNS、TLS 与静态文件部署验证前仍只做 private/tarball 验证。

## 静态 Registry 部署产物

在仓库根运行 `pnpm build:registry`。该命令先校验两份 manifest 中所有模板的 SHA-256，再生成唯一可部署目录 `dist/registry/v1/`；它只包含 manifest 和被 manifest 引用的文件，不包含更新脚本、源码仓库元数据或本机文件。

Cloudflare Pages 的构建命令应为 `pnpm build:registry`，输出目录为 `dist`。将 Pages 项目绑定到 `theme.oria.org.cn` 后，产物会对应 `https://theme.oria.org.cn/registry/v1/`。部署完成前必须从仓库外干净项目运行 HTTPS `oria add ... --registry https://theme.oria.org.cn/registry/v1 --dry-run` 与实际 `add` / `diff` 验证。

## 忽略策略

- 仓库根的 `.gitignore` 必须排除本机依赖与 store、构建产物、框架缓存、测试报告、TypeScript 增量信息、环境文件、日志、临时文件和本地 `*.tgz`；源码、测试、`pnpm-lock.yaml`、`.changeset/`、根 `registry/` 与文档应提交至 Git。`packages/cli/registry/` 是由根 registry 复制的构建输入副本，不提交 Git。
- 已发布的包以各自 `package.json` 的 `files` 白名单控制 npm 内容，而不是复制维护 `.npmignore`。常规库只允许 `dist/`；`@oriatheme/cli` 额外允许运行所需的 bundled `registry/`。构建产物可以不提交 Git，但必须在 `pack`/`publish` 前由干净构建生成。
- source map 是既有发行产物的一部分；若未来决定不对外提供，应先修改构建与调试策略，再从 `files` 白名单中排除，不能靠根 `.npmignore` 间接控制子包。

## 版本

- npm semver、theme schema version、contract version、persisted state version 独立。
- 删除或重命名公开 token、改变 CSS 变量编译规则、改变持久化兼容性属于破坏性变更。
- 新增 optional token 通常为 minor；修复解析错误且不改变有效输入语义为 patch。

## 发布门禁

- lint、typecheck、unit、browser integration 全部通过。
- 所有发布包成功 build/pack。
- Colors tarball 包含 291 个基础色变量与 Tailwind v4 映射，真实 CLI 编译标准颜色 utility 通过。
- React、Vue、Next tarball smoke test 通过。
- Editor Core 与 React/Vue headless bridge 均成功 pack，产物不包含默认黑盒 UI。
- CLI 从本地与 HTTPS registry 的 dry-run、安装、diff、冲突、hash 和路径安全测试通过。
- React/Vue registry item 分别安装到独立 React、Vue 与 Next 消费项目，类型和 production build 通过，且未引入另一框架。
- pnpm、npm、Yarn、Bun 四种消费工具分别从 tarball 安装公开 package-root exports 并运行 CLI add/dry-run/diff；React、Vue、Next production build 覆盖四种工具，Yarn 额外覆盖 node-modules linker 与 Plug'n'Play。任一工具未实际执行时不得标记通过。
- 首发公开包实际发布后，使用不链接 workspace 的干净消费项目从 npm registry 安装，验证 package-root exports、CLI/registry 和 React/Vue/Next production build；tarball 验证不能代替此步骤。
- 只有上述发行版消费验证成功后才开始 `apps/website`；官网只作为 workspace 私有应用完成 production build 与浏览器验证，不生成发布 tarball，且必须锁定已发布的普通 semver 依赖。
- 公开 API 文档与实际 exports 一致。
- Changeset 和 changelog 准备完成。

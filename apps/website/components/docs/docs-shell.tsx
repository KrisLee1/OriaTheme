import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

export const docsPages = [
  { slug: "getting-started", group: "start", en: "Getting started", zh: "快速开始" },
  { slug: "use/editor", group: "use", en: "Theme editor", zh: "在线主题编辑器" },
  { slug: "use/editable-styles", group: "use", en: "Editable styles", zh: "可编辑样式" },
  { slug: "use/colors", group: "use", en: "Base colors", zh: "基础色库" },
  { slug: "use/appearance", group: "use", en: "Appearance", zh: "外观模式" },
  { slug: "use/presets", group: "use", en: "Official presets", zh: "官方预设" },
  { slug: "develop/quick-start", group: "develop", en: "Developer quick start", zh: "开发快速开始" },
  { slug: "develop/packages", group: "develop", en: "Packages and installation", zh: "包选择与安装" },
  { slug: "develop/styling", group: "develop", en: "Styling components", zh: "组件样式" },
  { slug: "develop/runtime", group: "develop", en: "Runtime and Bootstrap", zh: "Runtime 与 Bootstrap" },
  { slug: "develop/react", group: "develop", en: "React and Next.js", zh: "React 与 Next.js" },
  { slug: "develop/vue", group: "develop", en: "Vue integration", zh: "Vue 集成" },
  { slug: "develop/custom-themes", group: "develop", en: "Custom themes", zh: "自定义主题" },
  { slug: "develop/custom-presets", group: "develop", en: "Application presets", zh: "应用自定义预设" },
  { slug: "develop/migrate", group: "develop", en: "Migrate from v1", zh: "从 v1 迁移" },
  { slug: "api/core", group: "api", en: "Core", zh: "Core" },
  { slug: "api/runtime-dom", group: "api", en: "Runtime DOM", zh: "Runtime DOM" },
  { slug: "api/react", group: "api", en: "React", zh: "React" },
  { slug: "api/vue", group: "api", en: "Vue", zh: "Vue" },
  { slug: "api/colors", group: "api", en: "Colors", zh: "Colors" },
  { slug: "api/tailwind", group: "api", en: "Tailwind", zh: "Tailwind" },
  { slug: "api/presets", group: "api", en: "Presets", zh: "Presets" },
  { slug: "api/editor-core", group: "api", en: "Editor Core", zh: "Editor Core" },
  { slug: "api/react-editor", group: "api", en: "React Editor", zh: "React Editor" },
  { slug: "api/vue-editor", group: "api", en: "Vue Editor", zh: "Vue Editor" },
  { slug: "api/cli", group: "api", en: "CLI", zh: "CLI" },
] as const;

function Sidebar({ locale, current }: { readonly locale: Locale; readonly current: string | undefined }) {
  const label = (page: (typeof docsPages)[number]) => page[locale];
  const nav = <nav className="docs-nav" aria-label={locale === "zh" ? "文档导航" : "Documentation navigation"}>
    <p>{locale === "zh" ? "开始使用" : "Start here"}</p>
    {docsPages.filter(page => page.group === "start").map(page => <Link key={page.slug} className={current === page.slug ? "is-active" : ""} href={`/${locale}/docs/${page.slug}`}>{label(page)}</Link>)}
    <p>{locale === "zh" ? "使用主题" : "Use themes"}</p>
    {docsPages.filter(page => page.group === "use").map(page => <Link key={page.slug} className={current === page.slug ? "is-active" : ""} href={`/${locale}/docs/${page.slug}`}>{label(page)}</Link>)}
    <p>{locale === "zh" ? "开发集成" : "Developer integration"}</p>
    {docsPages.filter(page => page.group === "develop").map(page => <Link key={page.slug} className={current === page.slug ? "is-active" : ""} href={`/${locale}/docs/${page.slug}`}>{label(page)}</Link>)}
    <p>{locale === "zh" ? "API 参考" : "API reference"}</p>
    {docsPages.filter(page => page.group === "api").map(page => <Link key={page.slug} className={current === page.slug ? "is-active" : ""} href={`/${locale}/docs/${page.slug}`}>{label(page)}</Link>)}
  </nav>;
  return <aside className="docs-sidebar"><div className="docs-sidebar-desktop">{nav}</div><details className="docs-sidebar-mobile"><summary>{locale === "zh" ? "浏览文档" : "Browse documentation"}</summary>{nav}</details></aside>;
}

export function DocsShell({ locale, current, children, toc }: { readonly locale: Locale; readonly current?: string; readonly children: ReactNode; readonly toc?: readonly { id: string; label: string }[] }) {
  return <main className="docs-main"><div className="docs-grid"><Sidebar locale={locale} current={current} /><article className="docs-article">{children}</article>{toc?.length ? <aside className="docs-toc" aria-label={locale === "zh" ? "本页目录" : "On this page"}><p>{locale === "zh" ? "本页目录" : "On this page"}</p>{toc.map(item => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}</aside> : null}</div></main>;
}

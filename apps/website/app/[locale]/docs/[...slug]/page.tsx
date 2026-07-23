import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsShell, docsPages } from "@/components/docs/docs-shell";
import { getDocsPage, type DocsPageSlug } from "@/components/docs/docs-pages";
import { isLocale, locales } from "@/lib/i18n";

const slugs = docsPages.map(page => page.slug);
function validSlug(value: string): value is DocsPageSlug { return (slugs as readonly string[]).includes(value); }

export function generateStaticParams() { return locales.flatMap(locale => docsPages.map(page => ({ locale, slug: page.slug.split("/") }))); }
export async function generateMetadata({ params }: { readonly params: Promise<{ locale: string; slug: string[] }> }): Promise<Metadata> { const { locale, slug } = await params; const key = slug.join("/"); if (!isLocale(locale) || !validSlug(key)) return {}; const page = getDocsPage(locale, key); return { title: page.title, description: page.description }; }

export default async function DocumentationArticle({ params }: { readonly params: Promise<{ locale: string; slug: string[] }> }) {
  const { locale, slug } = await params;
  const key = slug.join("/");
  if (!isLocale(locale) || !validSlug(key)) notFound();
  const page = getDocsPage(locale, key);
  return <DocsShell locale={locale} current={key} toc={page.toc}><header className="docs-article-header"><p>{page.eyebrow}</p><h1>{page.title}</h1><span>{page.description}</span></header>{page.body}</DocsShell>;
}

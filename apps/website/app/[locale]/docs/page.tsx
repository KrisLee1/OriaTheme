import { notFound } from "next/navigation";
import { DocsHome } from "@/components/docs/docs-home";
import { DocsShell } from "@/components/docs/docs-shell";
import { isLocale } from "@/lib/i18n";

export default async function DocsPage({ params }: { readonly params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <DocsShell locale={locale}><DocsHome locale={locale} /></DocsShell>;
}

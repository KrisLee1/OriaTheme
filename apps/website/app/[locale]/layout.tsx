import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { EditorPanelProvider } from "@/components/editor-panel-provider";
import { isLocale, locales } from "@/lib/i18n";

export function generateStaticParams() { return locales.map(locale => ({ locale })); }

export default async function LocaleLayout({ children, params }: { readonly children: ReactNode; readonly params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <EditorPanelProvider locale={locale}><SiteHeader locale={locale} />{children}<SiteFooter locale={locale} /></EditorPanelProvider>;
}

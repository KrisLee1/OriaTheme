import { notFound } from "next/navigation";
import { EditorPanel } from "@/components/editor-page/editor-panel";
import { EditorI18nProvider } from "@/components/editor-page/editor-i18n";
import { EditorStage } from "@/components/editor-page/editor-stage";
import { EditorWorkspace } from "@/components/editor-page/editor-workspace";
import { isLocale } from "@/lib/i18n";

export default async function EditorPage({ params }: { readonly params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <EditorI18nProvider locale={locale}><EditorStage><EditorWorkspace locale={locale} /><EditorPanel /></EditorStage></EditorI18nProvider>;
}

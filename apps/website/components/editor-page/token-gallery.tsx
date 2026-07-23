"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeTokenShowcase } from "@/components/editor-page/token-showcase";
import { useEditorCopy } from "@/components/editor-page/editor-i18n";
import type { Locale } from "@/lib/i18n";

export function TokenGallery({ locale }: { readonly locale: Locale }) {
  const copy = useEditorCopy().gallery;
  return <section className="token-gallery" aria-labelledby="token-gallery-title">
    <header className="token-heading"><div><p className="section-kicker">{copy.kicker}</p><h2 id="token-gallery-title">{copy.title}</h2></div><p>{copy.body}</p><Link className="docs-next-link" href={`/${locale}/docs/use/colors`}>{copy.colorLibraryLink}<ArrowRight size={16} /></Link></header>
    <ThemeTokenShowcase />
  </section>;
}

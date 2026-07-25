"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { getCopy } from "@/lib/i18n";
import { githubRepoUrl } from "@/lib/site";

export function SiteFooter({ locale }: { readonly locale: Locale }) {
  const pathname = usePathname();
  const copy = getCopy(locale);
  if (pathname.endsWith("/editor")) return null;
  return <footer className="border-t border-[var(--oria-color-border)]"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-[var(--oria-color-muted-fg)] sm:flex-row sm:items-center sm:justify-between lg:px-8"><p>© {new Date().getFullYear()} OriaTheme. {copy.footer}</p><div className="flex gap-4"><Link href={`/${locale}/docs`} className="hover:text-[var(--oria-color-fg)]">{copy.nav.docs}</Link><Link href={`/${locale}/editor`} className="hover:text-[var(--oria-color-fg)]">{copy.nav.editor}</Link><a href={githubRepoUrl} target="_blank" rel="noreferrer" className="hover:text-[var(--oria-color-fg)]">GitHub</a></div></div></footer>;
}

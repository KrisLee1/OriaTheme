import { notFound } from "next/navigation";
import { HomeFeatures } from "@/components/home/home-features";
import { HomeHero } from "@/components/home/home-hero";
import { HomePresets } from "@/components/home/home-presets";
import { HomeStart } from "@/components/home/home-start";
import { getCopy, isLocale } from "@/lib/i18n";

export default async function HomePage({ params }: { readonly params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main className="demo-shell" aria-label={getCopy(locale).nav.home}>
    <HomeHero locale={locale} />
    <HomePresets locale={locale} />
    <HomeFeatures locale={locale} />
    <HomeStart locale={locale} />
  </main>;
}

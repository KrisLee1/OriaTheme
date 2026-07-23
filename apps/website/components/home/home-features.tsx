import Link from "next/link";
import { ArrowRight, Blocks, Palette, SlidersHorizontal } from "lucide-react";
import { getCopy, type Locale } from "@/lib/i18n";
import { Reveal } from "./reveal";

const cardIcons = [Palette, Blocks, SlidersHorizontal] as const;

export function HomeFeatures({ locale }: { readonly locale: Locale }) {
  const copy = getCopy(locale).home.features;
  return <section className="home-section" aria-labelledby="home-features-title">
    <Reveal>
      <p className="section-kicker">{copy.kicker}</p>
      <h2 className="home-section-title" id="home-features-title">{copy.title}</h2>
      <p className="home-section-body">{copy.body}</p>
    </Reveal>
    <div className="home-feature-grid">{copy.cards.map((card, index) => {
      const Icon = cardIcons[index] ?? Palette;
      const href = index === 2 ? `/${locale}/editor` : `/${locale}/docs`;
      return <Reveal key={card.title} delay={0.08 * index}>
        <Link className="home-feature-card" href={href}>
          <span className="home-feature-icon" aria-hidden="true"><Icon /></span>
          <h3>{card.title}</h3>
          <p>{card.body}</p>
          <span className="home-feature-link">{card.link}<ArrowRight aria-hidden="true" /></span>
        </Link>
      </Reveal>;
    })}</div>
  </section>;
}

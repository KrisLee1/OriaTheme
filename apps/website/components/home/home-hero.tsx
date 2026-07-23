import Link from "next/link";
import { getCopy, type Locale } from "@/lib/i18n";
import { Reveal } from "./reveal";

export function HomeHero({ locale }: { readonly locale: Locale }) {
  const copy = getCopy(locale).home.hero;
  return <section className="hero home-hero" id="top">
    <div className="hero-copy">
      <Reveal immediate><p className="eyebrow">{copy.eyebrow}</p></Reveal>
      <Reveal immediate delay={0.08}>
        <h1>{copy.title.split("\n").map((line, index) => <span key={line}>{line}{index === 0 ? <br /> : null}</span>)}</h1>
      </Reveal>
      <Reveal immediate delay={0.16}><p>{copy.body}</p></Reveal>
      <Reveal immediate delay={0.24}>
        <div className="home-cta-row">
          <Link className="home-cta home-cta-primary" href={`/${locale}/editor`}>{copy.primaryCta}</Link>
          <Link className="home-cta home-cta-secondary" href={`/${locale}/docs`}>{copy.secondaryCta}</Link>
        </div>
      </Reveal>
    </div>
    <Reveal immediate delay={0.32}>
      <div className="diffusion-visual" aria-hidden="true"><span /><i /></div>
    </Reveal>
  </section>;
}

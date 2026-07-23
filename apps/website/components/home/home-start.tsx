import Link from "next/link";
import { getCopy, type Locale } from "@/lib/i18n";
import { InstallCommand } from "./install-command";
import { Reveal } from "./reveal";

const installCommand = "pnpm add @oriatheme/presets @oriatheme/runtime-dom @oriatheme/react";

export function HomeStart({ locale }: { readonly locale: Locale }) {
  const copy = getCopy(locale).home.start;
  return <section className="home-section home-start" aria-labelledby="home-start-title">
    <Reveal>
      <p className="section-kicker">{copy.kicker}</p>
      <h2 className="home-section-title" id="home-start-title">{copy.title}</h2>
      <p className="home-section-body">{copy.body}</p>
    </Reveal>
    <Reveal delay={0.08}>
      <InstallCommand command={installCommand} copyLabel={copy.copy} copiedLabel={copy.copied} />
      <div className="home-cta-row">
        <Link className="home-cta home-cta-primary" href={`/${locale}/docs`}>{copy.docsCta}</Link>
        <Link className="home-cta home-cta-secondary" href={`/${locale}/editor`}>{copy.editorCta}</Link>
      </div>
    </Reveal>
  </section>;
}

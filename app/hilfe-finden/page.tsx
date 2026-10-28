import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EinrichtungFilter } from "@/components/hilfe/einrichtung-filter";
import { GutZuWissen } from "@/components/hilfe/gut-zu-wissen";
import { HilfeQuelle } from "@/components/hilfe/hilfe-quelle";
import { JsonLd } from "@/components/json-ld";
import kraehe from "@/public/images/hilfe-finden.png";
import {
  BEREICHE,
  BEZIRKE,
  bereichPath,
  bezirkPath,
  findBereich,
  getEinrichtungen,
  HILFE_PATH,
  HILFE_TEXTS,
  hilfeUebersichtSchema,
  overviewDescription,
  toListEintrag,
} from "@/lib/hilfe";
import { FAQ } from "@/lib/hilfe-faq";
import { getSettings } from "@/lib/kls";
import { defaultMetadata, defaultSchema, pageTitle } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, items] = await Promise.all([getSettings(), getEinrichtungen()]);
  return defaultMetadata(settings, {
    title: pageTitle(HILFE_TEXTS.metaTitle, settings),
    description: overviewDescription(items),
    path: HILFE_PATH,
  });
}

const linkClass =
  "inline-flex min-h-11 items-center rounded-md border border-line px-4 font-bold text-green underline-offset-4 hover:border-green hover:underline";

/**
 * Übersicht: Einleitung, Filter nach Thema (Bereich) und Stadtteil (Auswahl in
 * der URL), alle passenden Einrichtungen als Kacheln, „Gut zu wissen“ und
 * Links auf die Bereichs- und Stadtbezirksseiten.
 */
export default async function HilfePage() {
  const [settings, items] = await Promise.all([getSettings(), getEinrichtungen()]);

  // Ohne veröffentlichte Einrichtungen gibt es die Seite nicht (auch nicht in der Navigation).
  if (items.length === 0) {
    notFound();
  }

  const bereiche = BEREICHE.map((bereich) => ({
    slug: bereich.slug,
    name: bereich.label,
    count: items.filter((item) => item.bereich.slug === bereich.slug).length,
  })).filter((bereich) => bereich.count > 0);
  const bezirke = BEZIRKE.map((bezirk) => ({
    ...bezirk,
    count: items.filter((item) => item.bezirk.slug === bezirk.slug).length,
  })).filter((bezirk) => bezirk.count > 0);
  // Thema auf der Kachel wie im Filter (Bezeichnung aus BEREICHE).
  const eintraege = items.map((item) => ({
    ...toListEintrag(item),
    bereich: { slug: item.bereich.slug, name: findBereich(item.bereich.slug)?.label ?? item.bereich.name },
  }));

  return (
    <>
      <JsonLd
        data={hilfeUebersichtSchema(
          defaultSchema(settings, {
            name: pageTitle(HILFE_TEXTS.metaTitle, settings),
            path: HILFE_PATH,
            type: "CollectionPage",
          }),
          { path: HILFE_PATH, siteName: settings.site.name, faq: FAQ.uebersicht },
        )}
      />
      <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,6fr)_minmax(0,4fr)]">
          <div>
            <h1 className="text-4xl">{HILFE_TEXTS.heading}</h1>
            <p className="mt-5 max-w-prose text-lg leading-relaxed">{HILFE_TEXTS.intro}</p>
          </div>
          {/* Motiv wie die Krähe der Startseite auf weißem Hintergrund; mobil unter dem Text. */}
          <Image
            src={kraehe}
            alt="Gezeichnete Krähe vor einem ockerfarbenen Farbfleck"
            priority
            sizes="(min-width: 768px) 22rem, 60vw"
            className="mx-auto h-auto w-3/5 max-w-sm md:w-full md:max-w-[22rem]"
          />
        </div>

        <section aria-labelledby="einrichtungen" className="mt-10">
          <h2 id="einrichtungen" className="mb-4 text-2xl">
            {HILFE_TEXTS.einrichtungenHeading}
          </h2>
          <EinrichtungFilter
            eintraege={eintraege}
            bereiche={bereiche}
            bezirke={bezirke}
            kategorien={[]}
            variante="verzeichnis"
          />
        </section>

        <GutZuWissen eintraege={FAQ.uebersicht} veroeffentlicht={new Set(items.map((item) => item.path))} />

        <section aria-labelledby="nach-thema" className="mt-12">
          <h2 id="nach-thema" className="mb-4 text-2xl">
            {HILFE_TEXTS.bereicheHeading}
          </h2>
          <ul className="flex flex-wrap gap-3">
            {bereiche.map((bereich) => (
              <li key={bereich.slug}>
                <Link href={bereichPath(bereich.slug)} className={linkClass}>
                  {bereich.name}
                  <span className="ml-2 font-normal text-muted">({bereich.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="nach-bezirk" className="mt-12">
          <h2 id="nach-bezirk" className="mb-4 text-2xl">
            {HILFE_TEXTS.bezirkeHeading}
          </h2>
          <ul className="flex flex-wrap gap-3">
            {bezirke.map((bezirk) => (
              <li key={bezirk.slug}>
                <Link href={bezirkPath(bezirk.slug)} className={linkClass}>
                  Krefeld-{bezirk.name}
                  <span className="ml-2 font-normal text-muted">({bezirk.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <HilfeQuelle />
    </>
  );
}

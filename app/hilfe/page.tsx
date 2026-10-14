import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GutZuWissen } from "@/components/hilfe/gut-zu-wissen";
import { HilfeQuelle } from "@/components/hilfe/hilfe-quelle";
import { JsonLd } from "@/components/json-ld";
import {
  BEREICHE,
  BEZIRKE,
  bereichPath,
  bezirkPath,
  einrichtungenLabel,
  getEinrichtungen,
  HILFE_PATH,
  HILFE_TEXTS,
  overviewDescription,
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

/** Übersicht: Einleitung, Bereiche als Kacheln mit Anzahl, Stadtbezirke als Links. */
export default async function HilfePage() {
  const [settings, items] = await Promise.all([getSettings(), getEinrichtungen()]);

  // Ohne veröffentlichte Einrichtungen gibt es die Seite nicht (auch nicht in der Navigation).
  if (items.length === 0) {
    notFound();
  }

  const bereiche = BEREICHE.map((bereich) => ({
    ...bereich,
    count: items.filter((item) => item.bereich.slug === bereich.slug).length,
  })).filter((bereich) => bereich.count > 0);
  const bezirke = BEZIRKE.map((bezirk) => ({
    ...bezirk,
    count: items.filter((item) => item.bezirk.slug === bezirk.slug).length,
  })).filter((bezirk) => bezirk.count > 0);

  return (
    <>
      <JsonLd
        data={defaultSchema(settings, {
          name: pageTitle(HILFE_TEXTS.metaTitle, settings),
          path: HILFE_PATH,
          type: "CollectionPage",
        })}
      />
      <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
        <h1 className="text-4xl">{HILFE_TEXTS.title}</h1>
        <p className="mt-5 max-w-prose text-lg leading-relaxed">{HILFE_TEXTS.intro}</p>

        <GutZuWissen eintraege={FAQ.uebersicht} veroeffentlicht={new Set(items.map((item) => item.path))} />

        <section aria-labelledby="nach-thema" className="mt-12">
          <h2 id="nach-thema" className="mb-6 text-2xl">
            {HILFE_TEXTS.bereicheHeading}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {bereiche.map((bereich) => (
              <li key={bereich.slug}>
                <Link
                  href={bereichPath(bereich.slug)}
                  className="group flex min-h-32 flex-col justify-end rounded-lg bg-orange p-6 text-ink"
                >
                  <span className="font-heading text-2xl font-bold underline-offset-4 group-hover:underline">
                    {bereich.label}
                  </span>
                  <span className="mt-1">{einrichtungenLabel(bereich.count)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="nach-bezirk" className="mt-12">
          <h2 id="nach-bezirk" className="mb-6 text-2xl">
            {HILFE_TEXTS.bezirkeHeading}
          </h2>
          <ul className="flex flex-wrap gap-3">
            {bezirke.map((bezirk) => (
              <li key={bezirk.slug}>
                <Link
                  href={bezirkPath(bezirk.slug)}
                  className="inline-flex min-h-11 items-center rounded-md border border-line px-4 font-bold text-green underline-offset-4 hover:border-green hover:underline"
                >
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

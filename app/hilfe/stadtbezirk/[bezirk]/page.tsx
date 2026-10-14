import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EinrichtungListe } from "@/components/hilfe/einrichtung-liste";
import { HilfeBreadcrumb } from "@/components/hilfe/hilfe-breadcrumb";
import { HilfeQuelle } from "@/components/hilfe/hilfe-quelle";
import { NotrufHinweis } from "@/components/hilfe/notruf-hinweis";
import { JsonLd } from "@/components/json-ld";
import {
  BEREICHE,
  BEZIRKE,
  bereichPath,
  bezirkDescription,
  bezirkIntro,
  bezirkPath,
  einrichtungenLabel,
  findBezirk,
  getEinrichtungen,
  HILFE_PATH,
  HILFE_TEXTS,
  NOTRUF_BEREICH,
  toListEintrag,
  type Bezirk,
} from "@/lib/hilfe";
import { getSettings } from "@/lib/kls";
import { defaultMetadata, defaultSchema, pageTitle } from "@/lib/seo";

export const revalidate = 3600;
// true wie bei /ratgeber/seite/: mit false liefert Next 16.3.8 nach einer
// Revalidation 404 (NoFallbackError). Unbekannte Bezirke: notFound() in der Seite.
export const dynamicParams = true;

export function generateStaticParams() {
  return BEZIRKE.map((bezirk) => ({ bezirk: bezirk.slug }));
}

const metaTitle = (bezirk: Bezirk) => `Soziale Einrichtungen in Krefeld-${bezirk.name}`;

export async function generateMetadata({ params }: PageProps<"/hilfe/stadtbezirk/[bezirk]">): Promise<Metadata> {
  const bezirk = findBezirk((await params).bezirk);
  if (!bezirk) {
    return {};
  }
  const [settings, all] = await Promise.all([getSettings(), getEinrichtungen()]);
  return defaultMetadata(settings, {
    title: pageTitle(metaTitle(bezirk), settings),
    description: bezirkDescription(
      bezirk,
      all.filter((item) => item.bezirk.slug === bezirk.slug),
    ),
    path: bezirkPath(bezirk.slug),
  });
}

/** Einrichtungen eines Stadtbezirks, gruppiert nach Bereich. */
export default async function BezirkPage({ params }: PageProps<"/hilfe/stadtbezirk/[bezirk]">) {
  const bezirk = findBezirk((await params).bezirk);
  if (!bezirk) {
    notFound();
  }

  const [settings, all] = await Promise.all([getSettings(), getEinrichtungen()]);
  const items = all.filter((item) => item.bezirk.slug === bezirk.slug);

  if (items.length === 0) {
    notFound();
  }

  const gruppen = BEREICHE.map((bereich) => ({
    bereich,
    items: items.filter((item) => item.bereich.slug === bereich.slug),
  })).filter((gruppe) => gruppe.items.length > 0);

  return (
    <>
      <JsonLd
        data={defaultSchema(settings, {
          name: pageTitle(metaTitle(bezirk), settings),
          path: bezirkPath(bezirk.slug),
          type: "CollectionPage",
        })}
      />
      <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
        <HilfeBreadcrumb items={[{ path: HILFE_PATH, label: HILFE_TEXTS.title }]} />
        <h1 className="text-4xl">Stadtbezirk Krefeld-{bezirk.name}</h1>
        <p className="mt-5 max-w-prose text-lg leading-relaxed">{bezirkIntro(bezirk)}</p>

        {gruppen.map(({ bereich, items: gruppe }) => (
          <section key={bereich.slug} aria-labelledby={`bereich-${bereich.slug}`} className="mt-12">
            <h2 id={`bereich-${bereich.slug}`} className="text-2xl">
              {bereich.label}
            </h2>
            <p className="mb-6 mt-2 text-muted">
              {einrichtungenLabel(gruppe.length)} ·{" "}
              <Link href={bereichPath(bereich.slug)} className="text-green underline underline-offset-4 hover:text-green-dark">
                {bereich.label} in ganz Krefeld
              </Link>
            </p>
            {bereich.slug === NOTRUF_BEREICH ? <NotrufHinweis className="mb-6" /> : null}
            <EinrichtungListe eintraege={gruppe.map(toListEintrag)} headingLevel={3} />
          </section>
        ))}
      </div>
      <HilfeQuelle />
    </>
  );
}

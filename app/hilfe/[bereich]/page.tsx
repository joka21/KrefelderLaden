import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EinrichtungFilter } from "@/components/hilfe/einrichtung-filter";
import { HilfeBreadcrumb } from "@/components/hilfe/hilfe-breadcrumb";
import { HilfeQuelle } from "@/components/hilfe/hilfe-quelle";
import { NotrufHinweis } from "@/components/hilfe/notruf-hinweis";
import { JsonLd } from "@/components/json-ld";
import {
  BEREICHE,
  BEZIRKE,
  bereichDescription,
  bereichPath,
  countBy,
  findBereich,
  getEinrichtungen,
  HILFE_PATH,
  HILFE_TEXTS,
  NOTRUF_BEREICH,
  toListEintrag,
  type Bereich,
  type Einrichtung,
} from "@/lib/hilfe";
import { getSettings } from "@/lib/kls";
import { defaultMetadata, defaultSchema, pageTitle } from "@/lib/seo";

export const revalidate = 3600;
// Nur die vier Bereiche; „stadtbezirk“ und „einrichtung“ sind eigene Routen.
export const dynamicParams = false;

export function generateStaticParams() {
  return BEREICHE.map((bereich) => ({ bereich: bereich.slug }));
}

async function load(slug: string): Promise<{ bereich: Bereich; items: Einrichtung[] }> {
  const bereich = findBereich(slug);
  if (!bereich) {
    notFound();
  }
  const items = (await getEinrichtungen()).filter((item) => item.bereich.slug === bereich.slug);
  return { bereich, items };
}

const metaTitle = (bereich: Bereich) => `${bereich.label} in Krefeld`;

export async function generateMetadata({ params }: PageProps<"/hilfe/[bereich]">): Promise<Metadata> {
  const { bereich: slug } = await params;
  const bereich = findBereich(slug);
  if (!bereich) {
    return {};
  }
  const [settings, { items }] = await Promise.all([getSettings(), load(slug)]);
  return defaultMetadata(settings, {
    title: pageTitle(metaTitle(bereich), settings),
    description: bereichDescription(bereich, items),
    path: bereichPath(bereich.slug),
  });
}

/** Einrichtungen eines Bereichs, filterbar nach Stadtbezirk und Kategorie. */
export default async function BereichPage({ params }: PageProps<"/hilfe/[bereich]">) {
  const { bereich: slug } = await params;
  const [settings, { bereich, items }] = await Promise.all([getSettings(), load(slug)]);

  if (items.length === 0) {
    notFound();
  }

  const bezirke = BEZIRKE.map((bezirk) => ({
    ...bezirk,
    count: items.filter((item) => item.bezirk.slug === bezirk.slug).length,
  })).filter((bezirk) => bezirk.count > 0);

  return (
    <>
      <JsonLd
        data={defaultSchema(settings, {
          name: pageTitle(metaTitle(bereich), settings),
          path: bereichPath(bereich.slug),
          type: "CollectionPage",
        })}
      />
      <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
        {bereich.slug === NOTRUF_BEREICH ? <NotrufHinweis className="mb-8" /> : null}
        <HilfeBreadcrumb items={[{ path: HILFE_PATH, label: HILFE_TEXTS.title }]} />
        <h1 className="text-4xl">{bereich.label}</h1>
        <p className="mb-10 mt-5 max-w-prose text-lg leading-relaxed">{bereich.intro}</p>
        <EinrichtungFilter
          eintraege={items.map(toListEintrag)}
          bezirke={bezirke}
          kategorien={countBy(items, (item) => item.kategorie)}
        />
      </div>
      <HilfeQuelle />
    </>
  );
}

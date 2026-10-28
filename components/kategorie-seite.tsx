import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { pageHref, Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { decodeEntities } from "@/lib/entities";
import { getKategorieSeite, KATEGORIE_TEXTS, kategoriePath, type KategorieDaten } from "@/lib/kategorien";
import { getSettings, type WpCategory } from "@/lib/kls";
import { defaultMetadata, defaultSchema, pageTitle } from "@/lib/seo";

/** Name der Kategorie, mit „ – Seite n“ ab Seite 2. */
function heading(kategorie: WpCategory, page: number): string {
  const name = decodeEntities(kategorie.name);
  return page > 1 ? `${name} – Seite ${page}` : name;
}

/** Beschreibung aus WordPress als Text (ohne HTML). */
export function kategorieBeschreibung(kategorie: WpCategory): string {
  return decodeEntities(kategorie.description.replace(/<[^>]+>/g, "")).trim();
}

/** Kategorie und Beiträge einer Seite; 404, wenn Kategorie oder Seite fehlen. */
export async function loadKategorie(slug: string, page: number): Promise<KategorieDaten> {
  const daten = await getKategorieSeite(slug, page);
  if (!daten || (page > 1 && daten.posts.length === 0)) {
    notFound();
  }
  return daten;
}

/** Metadaten einer Kategorieseite; leere Kategorien bekommen noindex. */
export async function kategorieMetadata(slug: string, page: number): Promise<Metadata> {
  const [settings, daten] = await Promise.all([getSettings(), getKategorieSeite(slug, page)]);
  if (!daten) {
    return {};
  }
  const name = decodeEntities(daten.kategorie.name);
  return defaultMetadata(settings, {
    title: pageTitle(heading(daten.kategorie, page), settings),
    description: kategorieBeschreibung(daten.kategorie) || `${name}: Beiträge aus Krefeld von Krefelder Laden.`,
    path: pageHref(kategoriePath(slug), page),
    noindex: daten.total === 0,
  });
}

/** Beitragsliste mit Seitennavigation; ohne Beiträge der Hinweissatz. */
export function KategorieBeitraege({
  daten,
  headingLevel,
}: {
  daten: KategorieDaten;
  headingLevel: 2 | 3;
}) {
  if (daten.total === 0) {
    return <p className="text-lg">{KATEGORIE_TEXTS.empty}</p>;
  }
  return (
    <>
      <PostList posts={daten.posts} headingLevel={headingLevel} />
      <Pagination page={daten.page} totalPages={daten.totalPages} basePath={kategoriePath(daten.kategorie.slug)} />
    </>
  );
}

/** Kategorieseite /{slug}/ bzw. /{slug}/seite/{n}/: Titel, Beschreibung, Beiträge. */
export async function KategorieSeite({ slug, page }: { slug: string; page: number }) {
  const [settings, daten] = await Promise.all([getSettings(), loadKategorie(slug, page)]);
  const beschreibung = page === 1 ? kategorieBeschreibung(daten.kategorie) : "";

  return (
    <>
      <JsonLd
        data={defaultSchema(settings, {
          name: pageTitle(heading(daten.kategorie, page), settings),
          path: pageHref(kategoriePath(slug), page),
          type: "CollectionPage",
        })}
      />
      <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
        <h1 className="text-4xl">{heading(daten.kategorie, page)}</h1>
        {beschreibung ? <p className="mt-5 max-w-prose text-lg leading-relaxed">{beschreibung}</p> : null}
        <div className="mt-10">
          <KategorieBeitraege daten={daten} headingLevel={2} />
        </div>
      </div>
    </>
  );
}

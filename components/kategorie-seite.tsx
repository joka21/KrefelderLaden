import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { pageHref, Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { decodeEntities } from "@/lib/entities";
import { findKategorie, getKategorieSeite, KATEGORIE_TEXTS, kategoriePath, type KategorieDaten } from "@/lib/kategorien";
import { getSettings, type WpCategory } from "@/lib/kls";
import { defaultMetadata, defaultSchema, pageTitle } from "@/lib/seo";

const seite = (text: string, page: number) => (page > 1 ? `${text} – Seite ${page}` : text);

/** H1: heading aus lib/kategorien.ts oder der Kategoriename, mit „ – Seite n“ ab Seite 2. */
function heading(kategorie: WpCategory, page: number): string {
  return seite(findKategorie(kategorie.slug)?.heading ?? decodeEntities(kategorie.name), page);
}

/** Title ohne Site-Namen: metaTitle aus lib/kategorien.ts oder wie die H1. */
function metaTitle(kategorie: WpCategory, page: number): string {
  const titel = findKategorie(kategorie.slug)?.metaTitle;
  return titel ? seite(titel, page) : heading(kategorie, page);
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
    title: pageTitle(metaTitle(daten.kategorie, page), settings),
    description:
      findKategorie(slug)?.metaDescription ||
      kategorieBeschreibung(daten.kategorie) ||
      `${name}: Beiträge aus Krefeld von Krefelder Laden.`,
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
  const konfig = findKategorie(slug);
  const intro = page === 1 ? (konfig?.intro ?? []) : [];
  const image = page === 1 ? konfig?.image : undefined;

  return (
    <>
      <JsonLd
        data={defaultSchema(settings, {
          name: pageTitle(metaTitle(daten.kategorie, page), settings),
          path: pageHref(kategoriePath(slug), page),
          type: "CollectionPage",
        })}
      />
      <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
        <div className={image ? "grid items-center gap-8 md:grid-cols-[minmax(0,6fr)_minmax(0,4fr)]" : undefined}>
          <div>
            {konfig?.eyebrow ? (
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-green">{konfig.eyebrow}</p>
            ) : null}
            <h1 className="text-4xl">{heading(daten.kategorie, page)}</h1>
            {beschreibung ? (
              <p className={`mt-5 max-w-prose leading-relaxed ${intro.length > 0 ? "text-xl" : "text-lg"}`}>{beschreibung}</p>
            ) : null}
            {intro.map((absatz) => (
              <p key={absatz} className="mt-4 max-w-prose text-lg leading-relaxed">
                {absatz}
              </p>
            ))}
          </div>
          {/* Motiv auf weißem Hintergrund wie die Krähe der Startseite; mobil unter dem Text. */}
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              priority
              sizes="(min-width: 768px) 22rem, 60vw"
              className="mx-auto h-auto w-3/5 max-w-sm md:w-full md:max-w-[22rem]"
            />
          ) : null}
        </div>
        <div className="mt-10">
          <KategorieBeitraege daten={daten} headingLevel={2} />
        </div>
      </div>
    </>
  );
}

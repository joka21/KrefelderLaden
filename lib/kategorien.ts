import "server-only";

import { getCategory, getCategoryPostIds, getPosts, type KlsPostItem, type WpCategory } from "@/lib/kls";

/**
 * Blog-Kategorien: Hauptmenü und Kategorieseiten unter /{slug}/.
 *
 * Diese Liste ist die einzige Stelle für Menü und Reihenfolge (auch der
 * Kacheln auf der Startseite). imMenue: false nimmt eine Kategorie aus Menü
 * und Kacheln; ihre Seite bleibt erreichbar. Kategorien werden über den Slug
 * aus WordPress geholt, nicht über die ID.
 */
export const KATEGORIEN: readonly { slug: string; label: string; imMenue: boolean }[] = [
  // Nach dem 31.12. auf imMenue: false setzen.
  { slug: "weihnachten", label: "Weihnachten", imMenue: true },
  { slug: "second-hand", label: "Second Hand", imMenue: true },
  { slug: "niederrhein-tapas", label: "Niederrhein Tapas", imMenue: true },
  { slug: "mein-krefeld", label: "Mein Krefeld", imMenue: true },
  { slug: "hilfe-finden", label: "Hilfe finden", imMenue: true },
];

/** „Hilfe finden“ hat eine eigene Route (app/hilfe-finden) mit dem Einrichtungsverzeichnis. */
export const HILFE_KATEGORIE = "hilfe-finden";

/** Beiträge pro Seite einer Kategorie (wie im Ratgeber). */
export const KATEGORIE_PER_PAGE = 12;

export const KATEGORIE_TEXTS = {
  empty: "Hier erscheinen bald die ersten Beiträge.",
  postsHeading: "Beiträge",
} as const;

export const kategoriePath = (slug: string) => `/${slug}/`;

/** Menüpunkte in Listenreihenfolge. */
export function menueKategorien() {
  return KATEGORIEN.filter((kategorie) => kategorie.imMenue).map((kategorie) => ({
    ...kategorie,
    path: kategoriePath(kategorie.slug),
  }));
}

export function isKategorie(slug: string): boolean {
  return KATEGORIEN.some((kategorie) => kategorie.slug === slug);
}

export interface KategorieDaten {
  kategorie: WpCategory;
  posts: KlsPostItem[];
  /** Beiträge insgesamt; 0 = leere Kategorie (noindex, nicht in der Sitemap). */
  total: number;
  page: number;
  totalPages: number;
}

/** Alle Beiträge aus /posts (für die Zuordnung der Kategorie-IDs). */
async function allPosts(): Promise<KlsPostItem[]> {
  const first = await getPosts(100);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.total_pages - 1) }, (_, index) => getPosts(100, index + 2)),
  );
  return [first, ...rest].flatMap((result) => result.items);
}

/**
 * Kategorie und Beiträge einer Seite, neueste zuerst. null, wenn die Kategorie
 * in WordPress fehlt. Die Beiträge kommen aus /posts (gleiche Darstellung wie
 * im Ratgeber), die Zuordnung aus /wp/v2.
 */
export async function getKategorieSeite(slug: string, page: number): Promise<KategorieDaten | null> {
  const kategorie = await getCategory(slug);
  if (!kategorie) {
    return null;
  }

  const ids = kategorie.count > 0 ? await getCategoryPostIds(kategorie) : [];
  const byId = new Map((ids.length > 0 ? await allPosts() : []).map((post) => [post.id, post]));
  const posts = ids.map((id) => byId.get(id)).filter((post) => post !== undefined);

  return {
    kategorie,
    posts: posts.slice((page - 1) * KATEGORIE_PER_PAGE, page * KATEGORIE_PER_PAGE),
    total: posts.length,
    page,
    totalPages: Math.ceil(posts.length / KATEGORIE_PER_PAGE),
  };
}

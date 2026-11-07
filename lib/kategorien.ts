import "server-only";

import type { StaticImageData } from "next/image";

import krefeldKocht from "@/public/images/krefeld-kocht.webp";
import { getCategory, getCategoryPostIds, getPosts, type KlsPostItem, type WpCategory } from "@/lib/kls";
import { SECOND_HAND_PATH } from "@/lib/second-hand";
import { TROEDEL_PATH } from "@/lib/troedelmaerkte";
import { MAERKTE_PATH } from "@/lib/weihnachtsmaerkte";

/**
 * Blog-Kategorien: Hauptmenü und Kategorieseiten unter /{slug}/.
 *
 * Diese Liste ist die einzige Stelle für Menü und Reihenfolge (auch der
 * Kacheln auf der Startseite). imMenue: false nimmt eine Kategorie aus Menü
 * und Kacheln; ihre Seite bleibt erreichbar. Kategorien werden über den Slug
 * aus WordPress geholt, nicht über die ID.
 *
 * Optionale Texte der Kategorieseite (ohne Angabe gilt der Kategoriename bzw.
 * die Beschreibung aus WordPress): heading (H1), eyebrow (kleine Zeile über der
 * H1), metaTitle (ohne „ – Krefelder Laden“, das hängt pageTitle() an;
 * mit titelOhneMarke: true bleibt er genau so, z. B. wenn er sonst über 60
 * Zeichen käme),
 * metaDescription (höchstens 155 Zeichen), intro (Absätze unter der
 * Unterzeile aus WordPress), image (Motiv neben dem Text), link (deutlicher
 * Link unter dem Text).
 *
 * leerWeiterleitung: Solange die Kategorie keinen Beitrag hat, leitet /{slug}/
 * dauerhaft dorthin weiter (308); mit dem ersten Beitrag erscheint die Seite wieder.
 *
 * auchLeerIndexieren: Die Seite trägt sich selbst (Einleitung, Link) und bleibt
 * auch ohne Beitrag indexiert und in der Sitemap; der Hinweis „Hier erscheinen
 * bald …“ entfällt dann.
 */
export interface Kategorie {
  slug: string;
  /** Menüpunkt (und Kachel). */
  label: string;
  imMenue: boolean;
  heading?: string;
  eyebrow?: string;
  metaTitle?: string;
  titelOhneMarke?: boolean;
  metaDescription?: string;
  intro?: readonly string[];
  image?: { src: StaticImageData; alt: string };
  link?: { text: string; path: string };
  leerWeiterleitung?: string;
  auchLeerIndexieren?: boolean;
}

export const KATEGORIEN: readonly Kategorie[] = [
  // Nach dem 31.12. auf imMenue: false setzen.
  {
    slug: "weihnachten",
    label: "Weihnachten",
    imMenue: true,
    heading: "Weihnachten in Krefeld",
    metaTitle: "Weihnachten in Krefeld 2026: Märkte, Geschenke, Termine",
    titelOhneMarke: true,
    auchLeerIndexieren: true,
    metaDescription:
      "Weihnachten in Krefeld 2026: alle Weihnachtsmärkte von Bruckhausen bis Fischeln mit Terminen, dazu Beiträge zu Geschenken und Advent in der Stadt.",
    intro: [
      "Weihnachten in Krefeld beginnt in den Stadtteilen: Am 20. November öffnet der Wintermarkt An Bruckhausen in Traar, am 21. November folgen die Funkelnden Sterne in Oppum. In der Innenstadt starten am 26. November MIKS auf dem Dionysiusplatz und der Crefelder Weihnachtsmarkt an der Alten Kirche, beide laufen bis 23. Dezember. Dazwischen liegen viele kleine Märkte, die nur an einem Wochenende da sind: Traar, der Schinkenplatz, Uerdingen, Linn, der Besondere Weihnachtsmarkt am Rathaus, Hüls und zum Schluss Fischeln vom 18. bis 20. Dezember. Am Totensonntag, 22. November, ist auf den Märkten in der Regel Ruhe. Noch mehr Advent gefällig? Am 5. Dezember fährt der Schluff als Nikolausfahrt ab Nordbahnhof, und vom 17. Dezember bis 3. Januar 2027 gastiert der Krefelder Weihnachtscircus an der Uerdinger Straße. Alle Termine, Öffnungszeiten und Orte findest du auf unserer Seite zu den Weihnachtsmärkten in Krefeld.",
    ],
    link: { text: "Alle Weihnachtsmärkte in Krefeld 2026", path: MAERKTE_PATH },
  },
  {
    slug: "second-hand",
    label: "Second Hand",
    imMenue: true,
    link: { text: "Alle Trödelmärkte und Flohmärkte in Krefeld mit Terminen", path: TROEDEL_PATH },
    leerWeiterleitung: SECOND_HAND_PATH,
  },
  {
    slug: "niederrhein-tapas",
    label: "Niederrhein Tapas",
    imMenue: true,
    eyebrow: "Niederrhein Tapas",
    heading: "Gut essen in Krefeld",
    metaTitle: "Gut essen in Krefeld: Niederrhein Tapas",
    metaDescription:
      "Gut essen in Krefeld: Wir suchen die besten Adressen und bringen Rezepte mit Zutaten vom Niederrhein auf deinen Tisch.",
    intro: [
      "Wie und wo kann man in Krefeld gut essen? Wir zeigen es dir. Wir suchen, und wir werden finden. Dazu stellen wir dir Rezepte mit Zutaten vom Niederrhein vor.",
      "Ein guter Kaffee ist für uns das Wichtigste. Ein wenig Freundlichkeit und gute Qualität. Ohne erhobenen Zeigefinger, aber mit Anspruch.",
    ],
    image: {
      src: krefeldKocht,
      alt: "Gezeichnete Krähe mit Kochmütze, Halstuch, Schneebesen und Kochlöffel vor einem ockerfarbenen Farbfleck",
    },
  },
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

export function findKategorie(slug: string): Kategorie | undefined {
  return KATEGORIEN.find((kategorie) => kategorie.slug === slug);
}

export function isKategorie(slug: string): boolean {
  return findKategorie(slug) !== undefined;
}

export interface KategorieDaten {
  kategorie: WpCategory;
  posts: KlsPostItem[];
  /** Beiträge insgesamt; 0 = leere Kategorie (noindex, nicht in der Sitemap; außer auchLeerIndexieren). */
  total: number;
  page: number;
  totalPages: number;
}

/** Alle Beiträge aus /posts (für die Zuordnung der Kategorie-IDs). */
export async function allPosts(): Promise<KlsPostItem[]> {
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

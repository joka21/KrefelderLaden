import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/env";
import { BEREICHE, BEZIRKE, bereichPath, bezirkPath, getEinrichtungen, HILFE_PATH, type Einrichtung } from "@/lib/hilfe";
import { getKategorieSeite, HILFE_KATEGORIE, KATEGORIEN, kategoriePath } from "@/lib/kategorien";
import { getPaths, getPosts } from "@/lib/kls";

export const revalidate = 3600;

/** Neuestes Änderungsdatum einer Liste (ISO-Strings sind direkt vergleichbar). */
function newest(items: Einrichtung[]): string | undefined {
  return items.reduce<string | undefined>((latest, item) => (item.modified && (!latest || item.modified > latest) ? item.modified : latest), undefined);
}

/**
 * Sitemap aus /paths, ergänzt um /, /ratgeber/, die Kategorieseiten mit
 * mindestens einem Beitrag, die Übersichten und die Detailseiten von „Hilfe
 * finden“ (URLs immer auf SITE_URL). /hilfe-finden/ steht immer darin.
 *
 * Kommen keine Einrichtungen zurück, wirft die Funktion: Ein Build schlägt
 * dann fehl, eine Erneuerung zur Laufzeit behält den letzten guten Stand,
 * statt eine Sitemap ohne /hilfe-finden/ auszuliefern.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [paths, latest, hilfe, kategorien] = await Promise.all([
    getPaths(),
    getPosts(1),
    getEinrichtungen(),
    Promise.all(
      KATEGORIEN.filter((kategorie) => kategorie.slug !== HILFE_KATEGORIE).map((kategorie) =>
        getKategorieSeite(kategorie.slug, 1),
      ),
    ),
  ]);
  if (hilfe.length === 0) {
    throw new Error(`Sitemap: keine Einrichtungen von der API (/paths: ${paths.length} Pfade), letzter Stand bleibt.`);
  }

  const base = siteUrl();
  const newestPost = latest.items[0]?.modified ?? undefined;

  const entries = new Map<string, MetadataRoute.Sitemap[number]>();
  entries.set("/", { url: `${base}/` });
  if (latest.total > 0) {
    entries.set("/ratgeber/", { url: `${base}/ratgeber/`, lastModified: newestPost });
  }
  for (const daten of kategorien) {
    if (daten && daten.total > 0) {
      const path = kategoriePath(daten.kategorie.slug);
      entries.set(path, { url: base + path, lastModified: daten.posts[0]?.modified ?? undefined });
    }
  }
  entries.set(HILFE_PATH, { url: base + HILFE_PATH, lastModified: newest(hilfe) });
  for (const bereich of BEREICHE) {
    const items = hilfe.filter((item) => item.bereich.slug === bereich.slug);
    if (items.length > 0) {
      entries.set(bereichPath(bereich.slug), { url: base + bereichPath(bereich.slug), lastModified: newest(items) });
    }
  }
  for (const bezirk of BEZIRKE) {
    const items = hilfe.filter((item) => item.bezirk.slug === bezirk.slug);
    if (items.length > 0) {
      entries.set(bezirkPath(bezirk.slug), { url: base + bezirkPath(bezirk.slug), lastModified: newest(items) });
    }
  }
  // Detailseiten auch aus /posts, falls /paths sie einmal nicht enthält.
  for (const item of hilfe) {
    entries.set(item.path, { url: base + encodeURI(item.path), lastModified: item.modified ?? undefined });
  }
  for (const item of paths) {
    entries.set(item.path, { url: base + encodeURI(item.path), lastModified: item.lastmod });
  }

  return [...entries.values()];
}

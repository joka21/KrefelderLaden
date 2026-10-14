import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/env";
import { BEREICHE, BEZIRKE, bereichPath, bezirkPath, getEinrichtungen, HILFE_PATH, type Einrichtung } from "@/lib/hilfe";
import { getPaths, getPosts } from "@/lib/kls";

export const revalidate = 3600;

/** Neuestes Änderungsdatum einer Liste (ISO-Strings sind direkt vergleichbar). */
function newest(items: Einrichtung[]): string | undefined {
  return items.reduce<string | undefined>((latest, item) => (item.modified && (!latest || item.modified > latest) ? item.modified : latest), undefined);
}

/**
 * Sitemap aus /paths (darin auch die Detailseiten der Einrichtungen), ergänzt
 * um /, /ratgeber/ und die Übersichten von „Hilfe finden“ (URLs immer auf SITE_URL).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [paths, latest, hilfe] = await Promise.all([getPaths(), getPosts(1), getEinrichtungen()]);
  const base = siteUrl();
  const newestPost = latest.items[0]?.modified ?? undefined;

  const entries = new Map<string, MetadataRoute.Sitemap[number]>();
  entries.set("/", { url: `${base}/` });
  if (latest.total > 0) {
    entries.set("/ratgeber/", { url: `${base}/ratgeber/`, lastModified: newestPost });
  }
  if (hilfe.length > 0) {
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
  }
  for (const item of paths) {
    entries.set(item.path, { url: base + encodeURI(item.path), lastModified: item.lastmod });
  }

  return [...entries.values()];
}

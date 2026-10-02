import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/env";
import { getPaths, getPosts } from "@/lib/kls";

export const revalidate = 3600;

/** Sitemap aus /paths, ergänzt um / und /ratgeber/ (URLs immer auf SITE_URL). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [paths, latest] = await Promise.all([getPaths(), getPosts(1)]);
  const base = siteUrl();
  const newestPost = latest.items[0]?.modified ?? undefined;

  const entries = new Map<string, MetadataRoute.Sitemap[number]>();
  entries.set("/", { url: `${base}/` });
  if (latest.total > 0) {
    entries.set("/ratgeber/", { url: `${base}/ratgeber/`, lastModified: newestPost });
  }
  for (const item of paths) {
    entries.set(item.path, { url: base + encodeURI(item.path), lastModified: item.lastmod });
  }

  return [...entries.values()];
}

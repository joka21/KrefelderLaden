import type { MetadataRoute } from "next";

import { isIndexable, siteUrl } from "@/lib/env";

/**
 * robots.txt: Solange SITE_INDEXABLE nicht „true“ ist, sperrt sie alles
 * (Schutz der Testadresse vor doppelter Indexierung). Sonst alles erlaubt,
 * mit Verweis auf die Sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}

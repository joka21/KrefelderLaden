import type { MetadataRoute } from "next";

import { isIndexable, siteUrl } from "@/lib/env";

/**
 * Crawler von Suchmaschinen und KI-Suchen, die ausdrücklich erlaubt sind. „*“
 * erlaubt ohnehin alles; die eigenen Gruppen machen es eindeutig und verhindern,
 * dass eine spätere Regel für „*“ sie versehentlich mit sperrt.
 */
const ERLAUBTE_CRAWLER = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Googlebot",
  "Bingbot",
] as const;

/**
 * robots.txt: Solange SITE_INDEXABLE nicht „true“ ist, sperrt sie alles
 * (Schutz der Testadresse vor doppelter Indexierung). Sonst alles erlaubt,
 * für alle Crawler und ausdrücklich für ERLAUBTE_CRAWLER, mit Verweis auf die Sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [{ userAgent: "*", allow: "/" }, { userAgent: [...ERLAUBTE_CRAWLER], allow: "/" }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}

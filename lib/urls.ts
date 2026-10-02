import "server-only";

import { siteUrl, wpUrl } from "@/lib/env";

/**
 * Umschreiben von URLs, damit die WordPress-Domain im Frontend nicht sichtbar ist.
 *
 * Uploads werden über den Rewrite /wp-content/uploads/:path* (next.config.ts)
 * vom Frontend ausgeliefert.
 */

const UPLOADS = "/wp-content/uploads/";

function host(url: string): string {
  try {
    return new URL(url).host.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Absolute Upload-URL der WordPress-Domain → relativer Pfad „/wp-content/uploads/…“.
 * Alles andere bleibt unverändert.
 */
export function relativeUpload(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (host(url) !== host(wpUrl()) || !parsed.pathname.startsWith(UPLOADS)) {
    return url;
  }

  return parsed.pathname + parsed.search;
}

/** Upload-URL als absolute URL auf SITE_URL (für Open Graph, das absolute URLs verlangt). */
export function absoluteUpload(url: string): string {
  const relative = relativeUpload(url);
  return relative.startsWith("/") ? siteUrl() + relative : relative;
}

/** srcset-Liste („url 300w, url 600w“) mit umgeschriebenen Upload-URLs. */
export function relativeSrcset(srcset: string): string {
  return srcset
    .split(",")
    .map((candidate) => {
      const [url, ...descriptor] = candidate.trim().split(/\s+/);
      return [relativeUpload(url), ...descriptor].join(" ");
    })
    .join(", ");
}

/**
 * URL der in WordPress hinterlegten Frontend-Domain → gleiche URL auf SITE_URL.
 * Canonical und og:url zeigen damit immer auf die endgültige Domain, nie auf
 * eine Testadresse. Andere Domains (z. B. eigene Canonicals) bleiben unverändert.
 */
export function onSiteUrl(url: string, frontendUrl: string): string {
  try {
    const parsed = new URL(url);
    if (host(url) !== host(frontendUrl)) {
      return url;
    }
    return siteUrl() + parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return url;
  }
}

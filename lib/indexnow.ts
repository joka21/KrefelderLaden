/**
 * IndexNow (indexnow.org): meldet geänderte URLs an Bing und weitere
 * Suchmaschinen (Bing-Index = Grundlage der ChatGPT-Suche).
 *
 * Der Schlüssel ist laut Protokoll öffentlich: Er steht in INDEXNOW_KEY und
 * als Datei public/{INDEXNOW_KEY}.txt mit genau diesem Inhalt. Für einen neuen
 * Schlüssel beides zusammen ändern.
 *
 * Gemeldet wird nur aus dem Production-Deploy mit SITE_INDEXABLE=true
 * (siehe sollMelden), nie aus Vorschauen oder lokal.
 */

export const INDEXNOW_KEY = "5151048e47ffae5501295654cfd55d5c";
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/** Höchstzahl URLs je Meldung laut Protokoll. */
const MAX_URLS = 10_000;

export interface IndexNowMeldung {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

/** Nur Seitenpfade („/…/“), keine API-Routen und Dateien; ohne Doppelte. */
export function indexNowPfade(pfade: readonly string[]): string[] {
  return [...new Set(pfade)].filter(
    (pfad) => pfad.startsWith("/") && !pfad.startsWith("//") && !pfad.startsWith("/api/") && !/\.[a-z0-9]+$/i.test(pfad),
  );
}

/** Meldung für die Pfade; null, wenn keiner übrig bleibt. */
export function indexNowMeldung(siteUrl: string, pfade: readonly string[], key: string = INDEXNOW_KEY): IndexNowMeldung | null {
  const base = siteUrl.replace(/\/+$/, "");
  const urlList = indexNowPfade(pfade)
    .slice(0, MAX_URLS)
    .map((pfad) => base + encodeURI(pfad));
  if (urlList.length === 0) {
    return null;
  }
  return { host: new URL(base).host, key, keyLocation: `${base}/${key}.txt`, urlList };
}

/** Melden nur im Production-Deploy von Vercel und nur, wenn die Website indexierbar ist. */
export function sollMelden(env: Record<string, string | undefined> = process.env): boolean {
  return env.VERCEL_ENV === "production" && env.SITE_INDEXABLE?.trim().toLowerCase() === "true";
}

/** Sendet die Meldung; Fehler werden nur protokolliert (die Revalidierung hängt nicht davon ab). */
export async function meldeIndexNow(siteUrl: string, pfade: readonly string[]): Promise<void> {
  const meldung = indexNowMeldung(siteUrl, pfade);
  if (!meldung || !sollMelden()) {
    return;
  }
  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(meldung),
      cache: "no-store",
    });
    // 200 = angenommen, 202 = angenommen, Schlüssel wird noch geprüft.
    if (response.status !== 200 && response.status !== 202) {
      console.error(`IndexNow: Status ${response.status} für ${meldung.urlList.length} URLs`);
    }
  } catch (error) {
    console.error("IndexNow:", error);
  }
}

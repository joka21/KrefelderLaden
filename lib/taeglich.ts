import { TROEDEL_FEED, TROEDEL_PATH } from "@/lib/troedelmaerkte";
import { MAERKTE_FEED, MAERKTE_PATH } from "@/lib/weihnachtsmaerkte";

/**
 * Seiten, deren Inhalt vom heutigen Datum (Europe/Berlin) abhängt: „heute“,
 * „dieses Wochenende“, vergangene Termine ausblenden, Weihnachts-Startseite.
 * Der Vercel-Cron (vercel.json, 23:05 UTC = kurz nach Mitternacht deutscher
 * Zeit) erneuert sie über GET /api/revalidate. Neue datumsabhängige Seiten
 * oder Feeds hier eintragen.
 */
export const TAEGLICHE_PFADE: readonly string[] = ["/", TROEDEL_PATH, MAERKTE_PATH];

/** Termin-Feeds; erneuert wie die Seiten, aber nicht an IndexNow gemeldet (keine Seiten). */
export const TAEGLICHE_FEEDS: readonly string[] = [TROEDEL_FEED, MAERKTE_FEED].flatMap((feed) => [`${feed}.json`, `${feed}.ics`]);

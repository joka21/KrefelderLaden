import { TROEDEL_PATH } from "@/lib/troedelmaerkte";
import { MAERKTE_PATH } from "@/lib/weihnachtsmaerkte";

/**
 * Seiten, deren Inhalt vom heutigen Datum (Europe/Berlin) abhängt: „heute“,
 * „dieses Wochenende“, vergangene Termine ausblenden, Weihnachts-Startseite.
 * Der Vercel-Cron (vercel.json, 23:05 UTC = kurz nach Mitternacht deutscher
 * Zeit) erneuert sie über GET /api/revalidate. Neue datumsabhängige Seiten
 * oder Feeds hier eintragen.
 */
export const TAEGLICHE_PFADE: readonly string[] = ["/", TROEDEL_PATH, MAERKTE_PATH];

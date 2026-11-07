import "server-only";

import { siteUrl } from "@/lib/env";
import { terminIcs } from "@/lib/feeds/ics";
import { type FeedTermin, terminJson } from "@/lib/feeds/termine";
import { heuteInKrefeld } from "@/lib/weihnachten";

/**
 * Antworten der Routen unter app/daten/. „heute“ in Europe/Berlin; die Routen
 * erneuern stündlich und täglich nach Mitternacht über den Cron (lib/taeglich.ts).
 */
interface Quelle {
  titel: string;
  /** Pfad der Seite, z. B. /troedelmarkt-krefeld/ */
  seite: string;
  /** Pfad des Feeds ohne Endung, z. B. /daten/troedelmarkt-krefeld */
  feed: string;
  termine: (heute: string, pageUrl: string) => FeedTermin[];
}

const CACHE = { "Cache-Control": "public, max-age=0, must-revalidate", "Access-Control-Allow-Origin": "*" };

function daten(quelle: Quelle, endung: "json" | "ics") {
  const base = siteUrl();
  const kopf = { titel: quelle.titel, seite: base + quelle.seite, feed: `${base}${quelle.feed}.${endung}` };
  return { kopf, termine: quelle.termine(heuteInKrefeld(), base + quelle.seite) };
}

export function jsonAntwort(quelle: Quelle): Response {
  const { kopf, termine } = daten(quelle, "json");
  return Response.json(terminJson(kopf, termine, heuteInKrefeld()), {
    headers: { ...CACHE, "Content-Type": "application/json; charset=utf-8" },
  });
}

export function icsAntwort(quelle: Quelle): Response {
  const { kopf, termine } = daten(quelle, "ics");
  return new Response(terminIcs(kopf, termine), {
    headers: { ...CACHE, "Content-Type": "text/calendar; charset=utf-8" },
  });
}

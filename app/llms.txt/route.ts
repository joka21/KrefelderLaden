import { siteUrl } from "@/lib/env";
import { NUTZUNGSHINWEIS } from "@/lib/feeds/termine";
import { BEREICHE, bereichPath, HILFE_PATH, HILFE_TEXTS } from "@/lib/hilfe";
import { findKategorie, kategoriePath } from "@/lib/kategorien";
import { SECOND_HAND_BESCHREIBUNG, SECOND_HAND_PATH } from "@/lib/second-hand";
import { TEXTS } from "@/lib/texts";
import { TROEDEL_BESCHREIBUNG, TROEDEL_FEED, TROEDEL_PATH } from "@/lib/troedelmaerkte";
import { MAERKTE_BESCHREIBUNG, MAERKTE_FEED, MAERKTE_PATH } from "@/lib/weihnachtsmaerkte";

/**
 * /llms.txt (llmstxt.org): kurze Beschreibung der Website, die wichtigsten Seiten
 * mit je einer Zeile und die Termin-Feeds. Die Zeilen kommen aus den
 * Beschreibungen der Seiten (keine eigenen Texte hier). Statisch beim Build
 * erzeugt; die URLs zeigen wie in der Sitemap auf SITE_URL.
 */
export const dynamic = "force-static";

const TAPAS = "niederrhein-tapas";

export function GET() {
  const base = siteUrl();
  const link = (label: string, path: string, note?: string) => `- [${label}](${base}${path})${note ? `: ${note}` : ""}`;
  const tapas = findKategorie(TAPAS);

  const text = [
    "# Krefelder Laden",
    "",
    `> ${TEXTS.home.intro}`,
    "",
    "## Die wichtigsten Seiten",
    "",
    link("Trödelmarkt Krefeld", TROEDEL_PATH, TROEDEL_BESCHREIBUNG),
    link("Weihnachtsmärkte in Krefeld", MAERKTE_PATH, MAERKTE_BESCHREIBUNG),
    link("Second Hand in Krefeld", SECOND_HAND_PATH, SECOND_HAND_BESCHREIBUNG),
    link(tapas?.label ?? "Niederrhein Tapas", kategoriePath(TAPAS), tapas?.metaDescription),
    link(HILFE_TEXTS.title, HILFE_PATH, "Verzeichnis sozialer Einrichtungen in Krefeld, sortiert nach Thema und Stadtbezirk."),
    link("Ratgeber", "/ratgeber/", "Artikel über Krefeld"),
    "",
    "## Termine als Daten",
    "",
    "Alle kommenden Termine, täglich aktualisiert, aus denselben Daten wie die Seiten.",
    NUTZUNGSHINWEIS,
    "",
    link("Trödelmärkte (JSON)", `${TROEDEL_FEED}.json`),
    link("Trödelmärkte (iCal)", `${TROEDEL_FEED}.ics`),
    link("Weihnachtsmärkte (JSON)", `${MAERKTE_FEED}.json`),
    link("Weihnachtsmärkte (iCal)", `${MAERKTE_FEED}.ics`),
    "",
    "## Hilfe finden nach Thema",
    "",
    `Datenquelle: ${HILFE_TEXTS.quelle.replace(/^Quelle:\s*/, "")}.`,
    "",
    ...BEREICHE.map((bereich) => link(bereich.label, bereichPath(bereich.slug), bereich.metaTitle)),
    "",
  ].join("\n");

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

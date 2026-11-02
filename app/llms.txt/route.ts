import { siteUrl } from "@/lib/env";
import { BEREICHE, bereichPath, HILFE_PATH, HILFE_TEXTS } from "@/lib/hilfe";

/**
 * /llms.txt (llmstxt.org): kurze Beschreibung der Website mit den wichtigsten
 * Einstiegen für Sprachmodelle. Statisch beim Build erzeugt; die URLs zeigen
 * wie in der Sitemap auf SITE_URL.
 */
export const dynamic = "force-static";

export function GET() {
  const base = siteUrl();
  const link = (label: string, path: string, note?: string) => `- [${label}](${base}${path})${note ? `: ${note}` : ""}`;

  const text = [
    "# Krefelder Laden",
    "",
    "> Lokales Portal für Krefeld: Märkte, Läden, Termine und Anlaufstellen. Krefelder Laden zeigt, wo ihr in Krefeld einkauft, Hilfe findet und die Stadt entdeckt – vor Ort recherchiert.",
    "",
    "## Hilfe finden",
    "",
    "Verzeichnis sozialer Einrichtungen in Krefeld, sortiert nach Thema und Stadtbezirk.",
    `Datenquelle: ${HILFE_TEXTS.quelle.replace(/^Quelle:\s*/, "")}.`,
    "",
    link(HILFE_TEXTS.title, HILFE_PATH, "Übersicht aller Einrichtungen"),
    ...BEREICHE.map((bereich) => link(bereich.label, bereichPath(bereich.slug), bereich.metaTitle)),
    "",
    "## Ratgeber",
    "",
    link("Ratgeber", "/ratgeber/", "Artikel über Krefeld"),
    link("Weihnachtsmärkte in Krefeld", "/weihnachtsmaerkte-in-krefeld/", "Termine und Orte"),
    "",
  ].join("\n");

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

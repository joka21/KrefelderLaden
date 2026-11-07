/**
 * Ergänzt jedes JSON-LD der Website (aus der API oder aus dem Frontend) an einer
 * Stelle (components/json-ld.tsx):
 *
 * - Organization (@id {home}#organization): Logo und sameAs (Instagram aus
 *   lib/stadt.ts), sofern sie fehlen; vorhandene Werte bleiben.
 * - BreadcrumbList auf Unterseiten, die noch keine haben: Startseite → Seite.
 *   Name der Seite = Name des WebPage-Knotens ohne „ – {Site-Name}“.
 */

import { MARKE } from "../stadt.ts";

type Knoten = Record<string, unknown>;
type Schema = { "@graph"?: Knoten[] } & Knoten;

/** Fester Pfad in public/ (nicht die gehashte Build-URL). */
export const LOGO_PFAD = "/images/logo-krefelder-laden.webp";

const SEITEN_TYPEN = new Set(["WebPage", "CollectionPage", "AboutPage", "ContactPage", "ItemPage"]);

const typen = (knoten: Knoten): string[] => {
  const typ = knoten["@type"];
  return Array.isArray(typ) ? typ.map(String) : typ ? [String(typ)] : [];
};

/** „Trödelmarkt Krefeld – Krefelder Laden“ → „Trödelmarkt Krefeld“. */
function ohneMarke(name: string): string {
  return name.replace(new RegExp(`\\s+[–|-]\\s+${MARKE.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), "").trim();
}

function organisation(knoten: Knoten, base: string): Knoten {
  const sameAs = Array.isArray(knoten.sameAs) ? knoten.sameAs.map(String) : knoten.sameAs ? [String(knoten.sameAs)] : [];
  return {
    ...knoten,
    ...(knoten.logo ? {} : { logo: { "@type": "ImageObject", url: base + LOGO_PFAD } }),
    sameAs: sameAs.includes(MARKE.instagram) ? sameAs : [...sameAs, MARKE.instagram],
  };
}

export function mitMarke<T extends object>(data: T, siteUrl: string): T {
  const schema = data as Schema;
  const graph = schema["@graph"];
  if (!Array.isArray(graph)) {
    return data;
  }
  const base = siteUrl.replace(/\/+$/, "");
  const home = `${base}/`;
  const orgId = `${home}#organization`;

  let neu = graph.map((knoten) => (knoten["@id"] === orgId && typen(knoten).includes("Organization") ? organisation(knoten, base) : knoten));

  const seite = neu.find((knoten) => typen(knoten).some((typ) => SEITEN_TYPEN.has(typ)));
  const hatBreadcrumb = neu.some((knoten) => typen(knoten).includes("BreadcrumbList"));
  const url = typeof seite?.url === "string" ? seite.url : "";
  if (seite && !hatBreadcrumb && url && url !== home && typeof seite.name === "string") {
    const id = `${url}#breadcrumb`;
    neu = [
      ...neu.map((knoten) => (knoten === seite ? { ...knoten, breadcrumb: { "@id": id } } : knoten)),
      {
        "@type": "BreadcrumbList",
        "@id": id,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: MARKE.name, item: home },
          { "@type": "ListItem", position: 2, name: ohneMarke(seite.name), item: url },
        ],
      },
    ];
  }

  return { ...schema, "@graph": neu } as T;
}

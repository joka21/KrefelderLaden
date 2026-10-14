import "server-only";

import type { ListEintrag } from "@/components/hilfe/einrichtung-liste";
import { decodeEntities } from "@/lib/entities";
import { getPosts, type KlsAnbieter, type KlsContent, type KlsPostItem, type KlsTerm } from "@/lib/kls";

/**
 * „Hilfe finden“: soziale Einrichtungen aus Open Data der Stadt Krefeld
 * (Inhaltstyp „anbieter“, Plugin KL Core). Nur veröffentlichte Einträge –
 * /posts und /content liefern nichts anderes.
 *
 * Bereiche (oberste Ebene von „anbieter_typ“) und Stadtbezirke stehen hier
 * fest, weil Pfade und Einleitungstexte daran hängen.
 */

export const HILFE_PATH = "/hilfe/";

export const HILFE_TEXTS = {
  title: "Hilfe finden",
  metaTitle: "Hilfe finden in Krefeld",
  intro:
    "Hier findet ihr Pflegeheime, Beratungsstellen, Treffpunkte für Kinder und Jugendliche und soziale Dienste in Krefeld – sortiert nach Thema und Stadtbezirk. Die Angaben stammen von der Stadt Krefeld und werden regelmäßig abgeglichen.",
  bereicheHeading: "Nach Thema",
  bezirkeHeading: "Nach Stadtbezirk",
  quelle: "Quelle: Stadt Krefeld, Open Data (Datenlizenz Deutschland – Zero – 2.0), Stand 27.05.2026",
  empty: "Keine Einrichtungen gefunden.",
} as const;

export interface Bereich {
  slug: string;
  label: string;
  intro: string;
}

export const BEREICHE: readonly Bereich[] = [
  {
    slug: "pflege-senioren",
    label: "Pflege & Senioren",
    intro:
      "Pflegeheime, Tagespflege, Pflege-Wohngemeinschaften und das Hospiz in Krefeld. Freie Plätze und Kosten klärt ihr bitte direkt mit der Einrichtung.",
  },
  {
    slug: "kinder-jugend",
    label: "Kinder & Jugend",
    intro: "Jugendtreffs, Freizeiteinrichtungen und Wohneinrichtungen für Kinder und Jugendliche in Krefeld.",
  },
  {
    slug: "soziale-dienste-vereine",
    label: "Soziale Dienste & Vereine",
    intro: "Wohlfahrtsverbände, Vereine und soziale Dienste in Krefeld – von der Tafel bis zum Freiwilligenzentrum.",
  },
  {
    slug: "beratung",
    label: "Beratung",
    intro:
      "Beratungsstellen in Krefeld – von Familien- und Schuldnerberatung bis zur Krisenhilfe. Termine vereinbart ihr direkt mit der Stelle.",
  },
];

/** Auf den Seiten dieses Bereichs steht der Notruf-Kasten. */
export const NOTRUF_BEREICH = "beratung";

export interface Bezirk {
  slug: string;
  name: string;
}

/** Stadtbezirke ab November 2025. */
export const BEZIRKE: readonly Bezirk[] = [
  { slug: "mitte", name: "Mitte" },
  { slug: "nord", name: "Nord" },
  { slug: "ost", name: "Ost" },
  { slug: "sued", name: "Süd" },
  { slug: "west", name: "West" },
];

export function bezirkIntro(bezirk: Bezirk): string {
  return `Soziale Einrichtungen im Stadtbezirk Krefeld-${bezirk.name}. Hinweis: Seit November 2025 hat Krefeld 5 statt 9 Stadtbezirke. Manche Namen sind geblieben, umfassen aber andere Gebiete – bei jeder Einrichtung steht deshalb auch der frühere Bezirk.`;
}

export const bereichPath = (slug: string) => `${HILFE_PATH}${slug}/`;
export const bezirkPath = (slug: string) => `${HILFE_PATH}stadtbezirk/${slug}/`;
export const einrichtungPath = (slug: string) => `${HILFE_PATH}einrichtung/${slug}/`;

export function findBereich(slug: string): Bereich | undefined {
  return BEREICHE.find((bereich) => bereich.slug === slug);
}

export function findBezirk(slug: string): Bezirk | undefined {
  return BEZIRKE.find((bezirk) => bezirk.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Daten                                                               */
/* ------------------------------------------------------------------ */

export interface Begriff {
  slug: string;
  name: string;
}

/** Eine Einrichtung, wie sie Listen und Detailseite brauchen. */
export interface Einrichtung {
  id: number;
  path: string;
  name: string;
  kurztext: string;
  bereich: Begriff;
  kategorie: Begriff | null;
  bezirk: Begriff;
  adresse: string;
  plz: string;
  bezirkBis2025: string;
  website: string;
  lat: string;
  lon: string;
  notruf: boolean;
  modified: string | null;
}

function begriff(term: KlsTerm): Begriff {
  return { slug: term.slug, name: decodeEntities(term.name) };
}

/**
 * Baut eine Einrichtung aus Begriffen und Feldern; null, wenn Bereich oder
 * Stadtbezirk fehlen (dann gehört der Eintrag auf keine Seite).
 */
function toEinrichtung(
  base: { id: number; path: string; title: string; modified: string | null; excerpt: string },
  terms: Record<string, KlsTerm[]> | undefined,
  fields: KlsAnbieter | undefined,
): Einrichtung | null {
  const typen = terms?.anbieter_typ ?? [];
  const bereichTerm = typen.find((term) => findBereich(term.slug));
  const kategorieTerm = typen.find((term) => !findBereich(term.slug));
  const bezirkTerm = (terms?.stadtbezirk ?? []).find((term) => findBezirk(term.slug));

  if (!bereichTerm || !bezirkTerm || !fields) {
    return null;
  }

  return {
    id: base.id,
    path: base.path,
    name: base.title,
    // Ungekürzter Kurztext (KL Core ab 0.3.0); sonst der gekürzte Auszug der API.
    kurztext: fields.kurztext ?? base.excerpt,
    bereich: begriff(bereichTerm),
    kategorie: kategorieTerm ? begriff(kategorieTerm) : null,
    bezirk: begriff(bezirkTerm),
    adresse: fields.adresse,
    plz: fields.plz,
    bezirkBis2025: fields.bezirk_bis_2025,
    website: fields.website,
    lat: fields.lat,
    lon: fields.lon,
    notruf: fields.notruf_hinweis,
    modified: base.modified,
  };
}

const byName = (a: Einrichtung, b: Einrichtung) => a.name.localeCompare(b.name, "de");

/** Alle veröffentlichten Einrichtungen, nach Name sortiert (GET /posts?type=anbieter). */
export async function getEinrichtungen(): Promise<Einrichtung[]> {
  const items: KlsPostItem[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await getPosts(100, page, "anbieter");
    items.push(...result.items);
    totalPages = result.total_pages;
    page += 1;
  } while (page <= totalPages);

  return items
    .map((item) => toEinrichtung(item, item.terms, item.anbieter))
    .filter((item): item is Einrichtung => item !== null)
    .sort(byName);
}

/**
 * Gibt es mindestens eine veröffentlichte Einrichtung? (Navigation, Startseite)
 * Ein Fehler zählt als „nein“, damit Navigation und Startseite nicht daran hängen.
 */
export async function hasEinrichtungen(): Promise<boolean> {
  try {
    return (await getPosts(1, 1, "anbieter")).total > 0;
  } catch (error) {
    console.error("Hilfe finden:", error);
    return false;
  }
}

/** Einrichtung aus /content (Detailseite). */
export function einrichtungFromContent(content: KlsContent): Einrichtung | null {
  return toEinrichtung(content, content.terms, content.anbieter);
}

/** Nur die Angaben, die die Liste braucht (geht auch an den Filter im Browser). */
export function toListEintrag(item: Einrichtung): ListEintrag {
  return {
    id: item.id,
    path: item.path,
    name: item.name,
    kategorie: item.kategorie,
    bezirk: item.bezirk,
    bezirkBis2025: item.bezirkBis2025,
    adresse: item.adresse,
    plz: item.plz,
  };
}

/* ------------------------------------------------------------------ */
/* Zählen und Texte                                                    */
/* ------------------------------------------------------------------ */

export function einrichtungenLabel(count: number): string {
  return count === 1 ? "1 Einrichtung" : `${count} Einrichtungen`;
}

/** Begriffe mit Anzahl, häufigste zuerst, bei Gleichstand nach Name. */
export function countBy(items: Einrichtung[], pick: (item: Einrichtung) => Begriff | null): (Begriff & { count: number })[] {
  const counts = new Map<string, Begriff & { count: number }>();
  for (const item of items) {
    const value = pick(item);
    if (!value) continue;
    const entry = counts.get(value.slug) ?? { ...value, count: 0 };
    entry.count += 1;
    counts.set(value.slug, entry);
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "de"));
}

const list = (entries: { name: string; count: number }[]) =>
  entries.map((entry) => `${entry.name} (${entry.count})`).join(", ");

/** Meta-Beschreibung der Übersicht aus den Daten. */
export function overviewDescription(items: Einrichtung[]): string {
  const bereiche = BEREICHE.map((bereich) => ({
    name: bereich.label,
    count: items.filter((item) => item.bereich.slug === bereich.slug).length,
  })).filter((entry) => entry.count > 0);
  return `${einrichtungenLabel(items.length)} in Krefeld: ${list(bereiche)} – nach Thema und Stadtbezirk.`;
}

/**
 * Meta-Beschreibung eines Bereichs aus den Daten: Anzahl je Kategorie, bei nur
 * einer Kategorie stattdessen je Stadtbezirk.
 */
export function bereichDescription(bereich: Bereich, items: Einrichtung[]): string {
  const kategorien = countBy(items, (item) => item.kategorie);
  const teile =
    kategorien.length > 1
      ? kategorien
      : countBy(items, (item) => item.bezirk).map((entry) => ({ ...entry, name: `Krefeld-${entry.name}` }));
  return `${bereich.label} in Krefeld – ${einrichtungenLabel(items.length)}: ${list(teile)}.`;
}

/** Meta-Beschreibung eines Stadtbezirks aus den Daten. */
export function bezirkDescription(bezirk: Bezirk, items: Einrichtung[]): string {
  const bereiche = BEREICHE.map((bereich) => ({
    name: bereich.label,
    count: items.filter((item) => item.bereich.slug === bereich.slug).length,
  })).filter((entry) => entry.count > 0);
  return `${einrichtungenLabel(items.length)} im Stadtbezirk Krefeld-${bezirk.name}: ${list(bereiche)}.`;
}

/* ------------------------------------------------------------------ */
/* JSON-LD der Detailseite                                             */
/* ------------------------------------------------------------------ */

function coordinate(value: string): number | null {
  const number = Number(value);
  return value.trim() !== "" && Number.isFinite(number) ? number : null;
}

/**
 * Schema der Detailseite: Graph der API (Organization, WebSite, WebPage), die
 * BreadcrumbList passend zur sichtbaren Navigation und die Einrichtung als
 * LocalBusiness – der schema.org-Typ, der zugleich Organisation und Ort ist und
 * damit PostalAddress und GeoCoordinates trägt. url nur, wenn eine Website
 * hinterlegt ist.
 */
export function einrichtungSchema(content: KlsContent, einrichtung: Einrichtung, homeUrl: string, siteName: string) {
  const pageUrl = content.url;
  const bereich = findBereich(einrichtung.bereich.slug);
  const crumbs = [
    { name: siteName, url: homeUrl },
    { name: HILFE_TEXTS.title, url: new URL(HILFE_PATH, homeUrl).toString() },
    ...(bereich ? [{ name: bereich.label, url: new URL(bereichPath(bereich.slug), homeUrl).toString() }] : []),
    { name: einrichtung.name, url: pageUrl },
  ];

  const lat = coordinate(einrichtung.lat);
  const lon = coordinate(einrichtung.lon);

  const place = {
    "@type": "LocalBusiness",
    "@id": `${pageUrl}#einrichtung`,
    name: einrichtung.name,
    ...(einrichtung.kurztext ? { description: einrichtung.kurztext } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: einrichtung.adresse,
      postalCode: einrichtung.plz,
      addressLocality: "Krefeld",
      addressCountry: "DE",
    },
    ...(lat !== null && lon !== null ? { geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lon } } : {}),
    ...(einrichtung.website ? { url: einrichtung.website } : {}),
    mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
  };

  const graph = content.schema["@graph"]
    .filter((node) => node["@type"] !== "BreadcrumbList")
    .map((node) => (node["@type"] === "WebPage" ? { ...node, breadcrumb: { "@id": `${pageUrl}#breadcrumb` } } : node));

  return {
    "@context": "https://schema.org",
    "@graph": [
      ...graph,
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: crumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: crumb.url,
        })),
      },
      place,
    ],
  };
}

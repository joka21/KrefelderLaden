/**
 * Recipe-JSON-LD aus dem Inhalt eines Beitrags: Ein Rezept ist ein Beitrag mit
 * einer Überschrift „Zutaten“ und einer Überschrift „Zubereitung“, auf die je
 * eine Liste folgt (so sind die Rezepte in „Niederrhein Tapas“ aufgebaut).
 *
 * Übernommen wird nur, was im Text steht: Zutaten, Schritte, Titel, Bild,
 * Beschreibung, Datum und – aus einer eigenen Zeile im Beitrag, z. B.
 * „Zeit: 25 Minuten · Portionen: 2“ – Gesamtzeit und Portionen. Fehlt die
 * Zeile oder ein Teil, fehlt das Feld. Ohne Bild kein Recipe (Pflichtfeld bei Google).
 */

import { load } from "cheerio";

export interface RezeptTeile {
  zutaten: string[];
  schritte: string[];
  /** Gesamtzeit als ISO-8601-Dauer, z. B. PT25M. */
  zeit?: string;
  portionen?: number;
}

const text = (wert: string) => wert.replace(/\s+/g, " ").trim();

/** „25 Minuten“ → PT25M, „1 Stunde 30 Minuten“ → PT1H30M, „2 Std.“ → PT2H; sonst undefined. */
export function dauer(angabe: string): string | undefined {
  const stunden = angabe.match(/(\d+)\s*(?:Stunden?|Std\.?)/i)?.[1];
  const minuten = angabe.match(/(\d+)\s*(?:Minuten?|Min\.?)/i)?.[1];
  if (!stunden && !minuten) return undefined;
  return `PT${stunden ? `${Number(stunden)}H` : ""}${minuten ? `${Number(minuten)}M` : ""}`;
}

/** Zeile „Zeit: … · Portionen: …“ (Teile in beliebiger Reihenfolge, getrennt mit ·, | oder Komma). */
export function zeitUndPortionen(zeile: string): { zeit?: string; portionen?: number } {
  const teile = text(zeile).split(/\s*[·|,]\s*/);
  const wert = (name: "Zeit" | "Portionen") =>
    teile.find((teil) => teil.toLowerCase().startsWith(`${name.toLowerCase()}:`))?.slice(name.length + 1).trim();
  const zeit = dauer(wert("Zeit") ?? "");
  const portionen = Number(wert("Portionen")?.match(/^\d+/)?.[0]);
  return {
    ...(zeit ? { zeit } : {}),
    ...(Number.isInteger(portionen) && portionen > 0 ? { portionen } : {}),
  };
}

/** Zutaten und Schritte aus dem HTML; null, wenn es kein Rezept ist. */
export function rezeptAusHtml(html: string): RezeptTeile | null {
  if (!html.trim()) return null;
  const $ = load(html, null, false);
  const liste = (titel: RegExp): string[] => {
    const ueberschrift = $("h2, h3, h4")
      .filter((_, element) => titel.test(text($(element).text())))
      .first();
    if (ueberschrift.length === 0) return [];
    const folgende = ueberschrift.nextAll("ul, ol").first();
    // Nur die Liste direkt nach der Überschrift, nicht eine hinter der nächsten Überschrift.
    const zwischen = ueberschrift.nextUntil(folgende).filter("h2, h3, h4");
    if (folgende.length === 0 || zwischen.length > 0) return [];
    return folgende
      .children("li")
      .map((_, li) => text($(li).text()))
      .get()
      .filter(Boolean);
  };
  const zutaten = liste(/^Zutaten\b/i);
  const schritte = liste(/^Zubereitung\b/i);
  if (zutaten.length === 0 || schritte.length === 0) return null;
  const angabe = $("p")
    .map((_, element) => text($(element).text()))
    .get()
    .find((zeile) => /^(Zeit|Portionen)\s*:/i.test(zeile));
  return { zutaten, schritte, ...(angabe ? zeitUndPortionen(angabe) : {}) };
}

export interface RezeptDaten {
  pageUrl: string;
  home: string;
  name: string;
  html: string;
  bild?: string | null;
  beschreibung?: string | null;
  datum?: string | null;
  geaendert?: string | null;
}

/** Recipe-Knoten oder null (kein Rezept oder kein Bild). */
export function rezeptSchema(daten: RezeptDaten) {
  const teile = rezeptAusHtml(daten.html);
  if (!teile || !daten.bild) return null;
  return {
    "@type": "Recipe",
    "@id": `${daten.pageUrl}#rezept`,
    name: daten.name,
    image: [daten.bild],
    ...(daten.beschreibung ? { description: daten.beschreibung } : {}),
    ...(daten.datum ? { datePublished: daten.datum } : {}),
    ...(daten.geaendert ? { dateModified: daten.geaendert } : {}),
    author: { "@id": `${daten.home}#organization` },
    mainEntityOfPage: { "@id": `${daten.pageUrl}#webpage` },
    inLanguage: "de-DE",
    ...(teile.zeit ? { totalTime: teile.zeit } : {}),
    ...(teile.portionen ? { recipeYield: `${teile.portionen} Portionen` } : {}),
    recipeIngredient: teile.zutaten,
    recipeInstructions: teile.schritte.map((schritt, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: schritt,
    })),
  };
}

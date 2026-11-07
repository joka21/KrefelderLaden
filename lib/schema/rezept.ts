/**
 * Recipe-JSON-LD aus dem Inhalt eines Beitrags: Ein Rezept ist ein Beitrag mit
 * einer Überschrift „Zutaten“ und einer Überschrift „Zubereitung“, auf die je
 * eine Liste folgt (so sind die Rezepte in „Niederrhein Tapas“ aufgebaut).
 *
 * Übernommen wird nur, was im Text steht: Zutaten, Schritte, Titel, Bild,
 * Beschreibung, Datum. Zeiten und Portionen fehlen, bis die Redaktion sie
 * liefert. Ohne Bild kein Recipe (Pflichtfeld bei Google).
 */

import { load } from "cheerio";

export interface RezeptTeile {
  zutaten: string[];
  schritte: string[];
}

const text = (wert: string) => wert.replace(/\s+/g, " ").trim();

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
  return zutaten.length > 0 && schritte.length > 0 ? { zutaten, schritte } : null;
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
    recipeIngredient: teile.zutaten,
    recipeInstructions: teile.schritte.map((schritt, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: schritt,
    })),
  };
}

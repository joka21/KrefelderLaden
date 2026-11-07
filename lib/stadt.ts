/**
 * Stadt und Marke für Texte und strukturierte Daten. Für eine weitere
 * Städte-Seite nur diese Werte ändern; die Bausteine in lib/schema lesen sie
 * von hier.
 */
export const STADT = {
  name: "Krefeld",
  land: "DE",
  zeitzone: "Europe/Berlin",
} as const;

export const MARKE = {
  name: "Krefelder Laden",
  domain: "krefelder-laden.de",
  instagram: "https://www.instagram.com/krefelderladen/",
} as const;

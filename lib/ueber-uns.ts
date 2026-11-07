/**
 * Über-uns-Seite unter /ueber-uns/. Texte liefert die Redaktion: je Abschnitt
 * die Absätze in `absaetze` eintragen (ein String je Absatz). Abschnitte ohne
 * Absatz erscheinen nicht.
 *
 * Solange kein Abschnitt Text hat, ist die Seite nicht da (404), steht nicht
 * in der Sitemap und hat keinen Link im Footer (UEBER_UNS_BEREIT).
 */

export const UEBER_UNS_PATH = "/ueber-uns/";

export const UEBER_UNS = {
  /** H1. */
  heading: "Über uns",
  /** Title ohne „ – Krefelder Laden“; leer = wie die H1. */
  metaTitle: "",
  /** Description, höchstens 155 Zeichen; leer = Anfang des ersten Absatzes. */
  metaDescription: "",
  /** Linktext im Footer. */
  footerLink: "Über uns",
} as const;

export interface UeberUnsAbschnitt {
  id: string;
  heading: string;
  absaetze: readonly string[];
}

export const ABSCHNITTE: readonly UeberUnsAbschnitt[] = [
  { id: "wer", heading: "Wer hinter dem Krefelder Laden steht", absaetze: [] },
  { id: "warum", heading: "Warum es den Krefelder Laden gibt", absaetze: [] },
  { id: "otto", heading: "Otto und die Krähe: die Namensgeber Krefelds", absaetze: [] },
  { id: "kontakt", heading: "Kontakt und Impressum", absaetze: [] },
];

export const SICHTBARE_ABSCHNITTE = ABSCHNITTE.filter(({ absaetze }) => absaetze.some((absatz) => absatz.trim()));

export const UEBER_UNS_BEREIT = SICHTBARE_ABSCHNITTE.length > 0;

/** Description: eigener Wert oder der Anfang des ersten Absatzes (höchstens 155 Zeichen, an Wortgrenze). */
export function ueberUnsBeschreibung(): string {
  if (UEBER_UNS.metaDescription) return UEBER_UNS.metaDescription;
  const text = SICHTBARE_ABSCHNITTE[0]?.absaetze[0]?.trim() ?? "";
  if (text.length <= 155) return text;
  return `${text.slice(0, 154).replace(/\s+\S*$/, "")}…`;
}

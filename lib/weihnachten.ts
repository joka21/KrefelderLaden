/**
 * Weihnachts-Startseite bis WEIHNACHTEN_BIS. Danach zeigt app/page.tsx von selbst
 * wieder die bisherige Startseite. Märkte und Termine kommen aus lib/weihnachtsmaerkte.ts.
 */

/** Letzter Tag der Weihnachts-Startseite. */
export const WEIHNACHTEN_BIS = "2026-12-31";

export const WEIHNACHTEN_TEXTE = {
  title: "Weihnachten in Krefeld 2026: Märkte, Rezepte & Ideen",
  description:
    "Weihnachten in Krefeld: alle Weihnachtsmärkte 2026 mit Terminen und Orten, Rezepte vom Niederrhein und gute Ideen für die Feiertage.",
  eyebrow: "Weihnachten in Krefeld 2026",
  heading: "Wir wünschen dir einfach eine schöne Zeit. Lass uns freundlich sein.",
  intro: "Hier findest du vieles, was Krefeld zu bieten hat: Einkaufen für Weihnachten, Weihnachtsmärkte und gute Ideen.",
  button: "Zu den Weihnachtsmärkten",
  maerkteHeading: "Weihnachtsmärkte in Krefeld",
  alleMaerkte: "Alle Weihnachtsmärkte",
} as const;

/** Blöcke in Reihenfolge der Seite: Ein Beitrag erscheint hier, sobald er das Schlagwort (Slug) trägt. */
export const SCHLAGWORT_BLOECKE: readonly { schlagwort: string; heading: string }[] = [
  { schlagwort: "geschenkideen", heading: "Geschenkideen aus Krefelder Läden" },
  { schlagwort: "weihnachtsessen", heading: "Weihnachtsessen und Gans to go" },
  { schlagwort: "weihnachtsrezepte", heading: "Rezepte für die kalte Jahreszeit" },
  { schlagwort: "second-hand-geschenke", heading: "Second-Hand-Geschenke" },
];

/** Letzter Block: Beiträge der Kategorie, die in keinem anderen Block stehen. */
export const MEHR_ZU_WEIHNACHTEN = { kategorie: "weihnachten", heading: "Mehr zu Weihnachten" } as const;

export const BEITRAEGE_JE_BLOCK = 6;

/** Heutiges Datum in Krefeld (der Server läuft in UTC), z. B. 2026-12-31. */
export function heuteInKrefeld(jetzt: Date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(jetzt);
}

export const istWeihnachtszeit = (heute: string = heuteInKrefeld()) => heute <= WEIHNACHTEN_BIS;

/**
 * Blöcke der Seite: je höchstens BEITRAEGE_JE_BLOCK Beiträge in der Reihenfolge der
 * IDs (neueste zuerst); Blöcke ohne Beitrag fehlen. „Mehr zu Weihnachten“ lässt nur
 * Beiträge aus, die in einem anderen Block wirklich angezeigt werden.
 */
export function stelleBloeckeZusammen<T extends { id: number }>(
  schlagwortIds: readonly (readonly number[])[],
  weihnachtenIds: readonly number[],
  beitraege: readonly T[],
): { heading: string; posts: T[] }[] {
  const byId = new Map(beitraege.map((beitrag) => [beitrag.id, beitrag]));
  const auswahl = (ids: readonly number[]) =>
    ids
      .map((id) => byId.get(id))
      .filter((beitrag) => beitrag !== undefined)
      .slice(0, BEITRAEGE_JE_BLOCK);

  const bloecke = SCHLAGWORT_BLOECKE.map(({ heading }, index) => ({ heading, posts: auswahl(schlagwortIds[index] ?? []) }));
  const angezeigt = new Set(bloecke.flatMap(({ posts }) => posts.map((beitrag) => beitrag.id)));
  const mehr = {
    heading: MEHR_ZU_WEIHNACHTEN.heading,
    posts: auswahl(weihnachtenIds.filter((id) => !angezeigt.has(id))),
  };

  return [...bloecke, mehr].filter(({ posts }) => posts.length > 0);
}

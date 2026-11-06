/**
 * Second-Hand-Verzeichnis auf /second-hand-krefeld/, nach dem Muster von lib/troedelmaerkte.ts.
 *
 * Pflege: Quelle ist data/second_hand_krefeld_2026.csv. Nach jeder Änderung
 * `node scripts/build-second-hand.mjs` ausführen (erzeugt lib/second-hand-daten.json)
 * und danach `npm test`.
 *
 * - Angezeigt werden nur Einträge, deren Status mit „Vom Laden bestätigt“ beginnt.
 *   Nach telefonischer Prüfung den Status umstellen und `geprueft_am` (JJJJ-MM-TT) setzen.
 * - Die Spalte „hinweise“ enthält Notizen der Recherche; sie wird nirgends übernommen.
 * - „zugang“ gibt es nur bei Kleiderkammern.
 */

import zeilen from "./second-hand-daten.json" with { type: "json" };

/** Eine Zeile der CSV; leere Felder sind "". */
export interface SecondHandZeile {
  name: string;
  art: string;
  strasse: string;
  plz: string;
  stadtteil: string;
  oeffnungszeiten: string;
  sortiment: string;
  ankauf: string;
  traeger: string;
  website: string;
  quelle_url: string;
  status: string;
  hinweise: string;
  recherchiert_am: string;
  geprueft_am: string;
  zugang: string;
}

export const ZEILEN: readonly SecondHandZeile[] = zeilen;

export const SECOND_HAND_PATH = "/second-hand-krefeld/";
export const SECOND_HAND_H1 = "Second Hand in Krefeld: Läden, Vintage und Sozialkaufhäuser";
export const SECOND_HAND_TITEL = "Second Hand Krefeld: Läden, Vintage & Sozialkaufhäuser";
export const SECOND_HAND_BESCHREIBUNG =
  "Second Hand in Krefeld: Läden für Mode, Vintage und Kindersachen, Sozialkaufhäuser und Gebrauchtwaren – mit Adressen und Öffnungszeiten.";

/** „2026-11-06“ → „06.11.2026“. */
export const datumDeutsch = (iso: string) => iso.split("-").reverse().join(".");

const iso = ZEILEN.map((zeile) => zeile.recherchiert_am).sort().at(-1) ?? "";
/** Stand der Recherche (jüngstes recherchiert_am); steht im Hinweis, in dateModified und in der Sitemap. */
export const STAND = { iso, text: datumDeutsch(iso) } as const;

export const BESTAETIGT = "Vom Laden bestätigt";
export const OHNE_ZEITEN = "Zeiten bitte beim Laden erfragen";
export const NUR_ANNAHME = "nur Annahme, kein Verkauf";
const ANNAHMESTELLE = "Kleiderspende-Annahmestelle";

/** Abschnitte der Seite in Reihenfolge; `arten` sind Anfänge der Spalte „art“. */
export const ABSCHNITTE = [
  { id: "mode", heading: "Second-Hand-Mode", arten: ["Second-Hand-Laden"] },
  { id: "vintage", heading: "Vintage und Design", arten: ["Vintage"] },
  { id: "kinder", heading: "Kinder-Second-Hand", arten: ["Kinder-Second-Hand"] },
  {
    id: "sozial",
    heading: "Sozialkaufhäuser und Gebrauchtwaren in Krefeld",
    arten: ["Sozialkaufhaus", "Gebrauchtwarenhaus"],
  },
  { id: "ankauf", heading: "An- und Verkauf", arten: ["An- und Verkauf"] },
  { id: "buecher", heading: "Antiquariate und gebrauchte Bücher", arten: ["Antiquariat"] },
  { id: "kleider", heading: "Kleiderkammern und Kleiderspende", arten: ["Kleiderkammer", ANNAHMESTELLE] },
] as const;

export type AbschnittId = (typeof ABSCHNITTE)[number]["id"];

/** Was die Seite von einem Eintrag zeigt; „hinweise“ und „status“ fehlen absichtlich. */
export interface Eintrag {
  name: string;
  /** Anfang der Spalte „art“, z. B. „Sozialkaufhaus“. */
  art: string;
  abschnitt: AbschnittId;
  strasse: string;
  plz: string;
  stadtteil: string;
  oeffnungszeiten: string;
  sortiment: string;
  ankauf: boolean;
  traeger: string;
  website: string;
  /** „telefonisch geprüft am 06.11.2026“ oder "". */
  geprueft: string;
  zugang: string;
  nurAnnahme: boolean;
}

/** Abschnitt und Art zu einem Wert der Spalte „art“, z. B. „Kleiderkammer / Kleiderausgabe (…)“. */
export function zuordnung(art: string): { abschnitt: AbschnittId; art: string } | null {
  for (const abschnitt of ABSCHNITTE) {
    const treffer = abschnitt.arten.find((anfang) => art === anfang || art.startsWith(`${anfang} `));
    if (treffer) return { abschnitt: abschnitt.id, art: treffer };
  }
  return null;
}

/** Text für `geprueft_am`; leer, wenn nicht gesetzt. */
export const geprueftText = (geprueftAm: string) => (geprueftAm ? `telefonisch geprüft am ${datumDeutsch(geprueftAm)}` : "");

export function eintrag(zeile: SecondHandZeile): Eintrag | null {
  const passend = zuordnung(zeile.art);
  if (!zeile.status.startsWith(BESTAETIGT) || !passend) return null;
  return {
    name: zeile.name,
    art: passend.art,
    abschnitt: passend.abschnitt,
    strasse: zeile.strasse,
    plz: zeile.plz,
    stadtteil: zeile.stadtteil,
    oeffnungszeiten: zeile.oeffnungszeiten || OHNE_ZEITEN,
    sortiment: zeile.sortiment,
    ankauf: zeile.ankauf === "ja",
    traeger: zeile.traeger,
    website: zeile.website,
    geprueft: geprueftText(zeile.geprueft_am),
    zugang: passend.art === "Kleiderkammer" ? zeile.zugang : "",
    nurAnnahme: passend.art === ANNAHMESTELLE,
  };
}

/** Alle angezeigten Einträge in der Reihenfolge der CSV. */
export const EINTRAEGE: readonly Eintrag[] = ZEILEN.flatMap((zeile) => eintrag(zeile) ?? []);

/** Abschnitte mit mindestens einem Eintrag. */
export const SICHTBARE_ABSCHNITTE = ABSCHNITTE.map((abschnitt) => ({
  ...abschnitt,
  eintraege: EINTRAEGE.filter((item) => item.abschnitt === abschnitt.id),
})).filter(({ eintraege }) => eintraege.length > 0);

/** Adresse in einer Zeile, z. B. „Weyerhofstraße 28, 47803 Krefeld“. */
export function adresse({ strasse, plz }: Pick<Eintrag, "strasse" | "plz">): string {
  return [strasse, [plz, "Krefeld"].filter(Boolean).join(" ")].filter(Boolean).join(", ");
}

/* ------------------------------------------------------------------ */
/* Häufige Fragen (nur aus angezeigten Einträgen)                      */
/* ------------------------------------------------------------------ */

const aufzaehlung = (teile: readonly string[]) =>
  teile.length <= 1 ? (teile[0] ?? "") : `${teile.slice(0, -1).join(", ")} und ${teile.at(-1)}`;
const mitOrt = (item: Eintrag) => `${item.name} (${[item.strasse, item.stadtteil].filter(Boolean).join(", ")})`;

function wo(eintraege: readonly Eintrag[]): string {
  const abschnitte = ABSCHNITTE.map((abschnitt) => ({
    heading: abschnitt.heading,
    namen: eintraege.filter((item) => item.abschnitt === abschnitt.id && !item.nurAnnahme).map(({ name }) => name),
  })).filter(({ namen }) => namen.length > 0);
  if (abschnitte.length === 0) return "";
  const teile = abschnitte.map(
    ({ heading, namen }) =>
      `${heading}: ${aufzaehlung(namen.length > 4 ? [...namen.slice(0, 3), "weitere"] : namen)}.`,
  );
  return `Auf dieser Seite findest du ${eintraege.length} Adressen in Krefeld. ${teile.join(" ")}`;
}

function sozialkaufhaeuser(eintraege: readonly Eintrag[]): string {
  const kaufhaeuser = eintraege.filter(({ art }) => art === "Sozialkaufhaus");
  const gebraucht = eintraege.filter(({ art }) => art === "Gebrauchtwarenhaus");
  if (kaufhaeuser.length === 0) return "";
  const teile = [`Sozialkaufhäuser in Krefeld sind ${aufzaehlung(kaufhaeuser.map(mitOrt))}.`];
  if (gebraucht.length > 0) {
    teile.push(`Gebrauchtwaren gibt es außerdem bei ${aufzaehlung(gebraucht.map(mitOrt))}.`);
  }
  return teile.join(" ");
}

function verkaufen(eintraege: readonly Eintrag[]): string {
  const ankauf = eintraege.filter((item) => item.ankauf);
  if (ankauf.length === 0) return "Zurzeit haben wir keine Adresse mit Ankauf in der Liste.";
  return `Ankauf bieten nach unseren Daten ${aufzaehlung(ankauf.map((item) => `${item.name} (${item.sortiment})`))}. Frag am besten vorher, was gerade angekauft wird.`;
}

function spenden(eintraege: readonly Eintrag[]): string {
  const annahme = eintraege.filter((item) => item.nurAnnahme);
  if (annahme.length === 0) return "";
  const stellen = annahme.map((item) => `bei ${item.name}, ${adresse(item)} (${item.oeffnungszeiten})`);
  return `Kleidung spenden kannst du ${aufzaehlung(stellen)}. Ob eine Kleiderkammer gerade Spenden annimmt, erfährst du direkt beim Träger.`;
}

/** Häufige Fragen; Antworten nur aus den übergebenen (angezeigten) Einträgen. */
export function fragen(eintraege: readonly Eintrag[] = EINTRAEGE): { frage: string; antwort: string }[] {
  return [
    { frage: "Wo gibt es Second Hand in Krefeld?", antwort: wo(eintraege) },
    { frage: "Welche Sozialkaufhäuser gibt es in Krefeld?", antwort: sozialkaufhaeuser(eintraege) },
    { frage: "Wo kann ich in Krefeld gebrauchte Sachen verkaufen?", antwort: verkaufen(eintraege) },
    { frage: "Wo kann ich in Krefeld Kleidung spenden?", antwort: spenden(eintraege) },
  ].filter(({ antwort }) => antwort);
}

/* ------------------------------------------------------------------ */
/* JSON-LD                                                             */
/* ------------------------------------------------------------------ */

function storeSchema(item: Eintrag) {
  return {
    "@type": "Store",
    name: item.name,
    address: {
      "@type": "PostalAddress",
      ...(item.strasse ? { streetAddress: item.strasse } : {}),
      ...(item.plz ? { postalCode: item.plz } : {}),
      addressLocality: "Krefeld",
      addressCountry: "DE",
    },
    ...(item.website ? { url: item.website } : {}),
  };
}

/** Ergänzt das Schema der Seite um dateModified, eine ItemList mit je einem Store und die FAQPage. */
export function secondHandSchema<T extends { "@graph": object[] }>(schema: T, pageUrl: string): T {
  const graph = schema["@graph"].map((node) =>
    "@id" in node && node["@id"] === `${pageUrl}#webpage` ? { ...node, dateModified: STAND.iso } : node,
  );
  return {
    ...schema,
    "@graph": [
      ...graph,
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#liste`,
        name: SECOND_HAND_H1,
        numberOfItems: EINTRAEGE.length,
        itemListElement: EINTRAEGE.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: storeSchema(item),
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        isPartOf: { "@id": `${pageUrl}#webpage` },
        mainEntity: fragen().map(({ frage, antwort }) => ({
          "@type": "Question",
          name: frage,
          acceptedAnswer: { "@type": "Answer", text: antwort },
        })),
      },
    ],
  };
}

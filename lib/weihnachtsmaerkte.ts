/**
 * Weihnachtsmärkte 2026 auf /weihnachtsmaerkte-in-krefeld/: Texte der Redaktion unverändert.
 *
 * Pflege: Fehlende Uhrzeiten in `wann` ergänzen und, wenn bestätigt, in `start`
 * bzw. `ende` als Datum mit Uhrzeit eintragen (`…T15:00:00+01:00`). Bei jeder
 * Aktualisierung STAND anpassen; er steht im Hinweis, in dateModified und in der Sitemap.
 */

export const STAND = { iso: "2026-11-02", text: "2. November 2026" } as const;

/** Hauptseite der Märkte; ihr Inhalt kommt von hier, nicht aus WordPress. */
export const MAERKTE_PATH = "/weihnachtsmaerkte-in-krefeld/";
export const MAERKTE_H1 = "Weihnachtsmärkte in Krefeld 2026: alle Termine von Bruckhausen bis Fischeln";
export const MAERKTE_TITEL = "Weihnachtsmärkte Krefeld 2026: alle Termine & Orte";
export const MAERKTE_BESCHREIBUNG =
  "Alle Weihnachtsmärkte in Krefeld 2026: Termine, Uhrzeiten und Orte – von MIKS und Crefelder Weihnachtsmarkt bis Linn, Hüls und Fischeln.";

/** Geplante Adressen des Themas: 301 auf MAERKTE_PATH (proxy.ts). */
export const ALTE_PFADE: readonly string[] = ["/ratgeber/weihnachtsmaerkte-krefeld-2026/"];

export interface Markt {
  /** Überschrift und Name im Schema. */
  name: string;
  /** Name in der Übersichtstabelle, falls kürzer als `name`. */
  kurzname?: string;
  /** Datum und Stadtteil in der Übersichtstabelle. */
  datum: string;
  stadtteil: string;
  wann: string;
  /** Eigene Zeile nur, wenn die Uhrzeit nicht schon in `wann` steht. */
  uhrzeit?: string;
  wo: string;
  veranstalter?: string;
  /** Veranstalter sind Personen statt einer Organisation. */
  veranstalterPersonen?: boolean;
  eintritt?: string;
  text: string;
  /** Datum (Uhrzeit nur, wenn im Text bestätigt). */
  start: string;
  ende: string;
  ort: { name: string; strasse?: string; plz?: string };
  /** Nur, wo der Veranstalter freien Eintritt bestätigt hat. */
  eintrittFrei?: boolean;
}

export const MAERKTE: readonly Markt[] = [
  {
    name: "Wintermarkt An Bruckhausen",
    datum: "Fr 20. + Sa 21.11.",
    stadtteil: "Traar",
    wann: "Freitag, 20. November, 15 bis 19 Uhr, und Samstag, 21. November (Uhrzeit folgt)",
    wo: "An Bruckhausen 33, 47802 Krefeld-Traar",
    text: "Der früheste Markt der Saison: zwei Tage Winterstimmung in Bruckhausen, mit schönen Dingen zum Stöbern und Angeboten für die ganze Familie.",
    start: "2026-11-20T15:00:00+01:00",
    ende: "2026-11-21",
    ort: { name: "An Bruckhausen", strasse: "An Bruckhausen 33", plz: "47802" },
  },
  {
    name: "Funkelnde Sterne in Oppum",
    datum: "Sa 21.11.",
    stadtteil: "Oppum",
    wann: "Samstag, 21. November, ab 14 Uhr",
    wo: "rund um die Schutzengelkirche, Hauptstraße 18, 47809 Krefeld-Oppum",
    veranstalter: "Pfarrei St. Augustinus",
    eintritt: "frei",
    text: "Um 15 Uhr eröffnet der Gospelchor family of hope den Markt an der Schutzengelkirche. Dazu Buden mit Handgemachtem und heißen Getränken.",
    start: "2026-11-21T14:00:00+01:00",
    ende: "2026-11-21",
    ort: { name: "Schutzengelkirche", strasse: "Hauptstraße 18", plz: "47809" },
    eintrittFrei: true,
  },
  {
    name: "MIKS – Weihnachtsmarkt made in Krefeld",
    datum: "26.11. – 23.12.",
    stadtteil: "Innenstadt",
    wann: "26. November bis 23. Dezember",
    uhrzeit: "sonntags bis dienstags 13 bis 20 Uhr, mittwochs bis samstags 11:30 bis 21 Uhr",
    wo: "Dionysiusplatz, Krefeld-Innenstadt",
    text: "Auf dem Dioplatz entsteht ein weihnachtlicher Stadtgarten. Der Schwerpunkt: Gutes aus Krefeld, Geschenkideen, Essen und warme Getränke.",
    // 26.11. ist ein Donnerstag, 23.12. ein Mittwoch.
    start: "2026-11-26T11:30:00+01:00",
    ende: "2026-12-23T21:00:00+01:00",
    ort: { name: "Dionysiusplatz", strasse: "Dionysiusplatz" },
  },
  {
    name: "Crefelder Weihnachtsmarkt 2.0 – Hüttenzauber für Leib und Seele",
    kurzname: "Crefelder Weihnachtsmarkt 2.0",
    datum: "26.11. – 23.12.",
    stadtteil: "Innenstadt",
    wann: "26. November bis 23. Dezember",
    uhrzeit: "wird vom Veranstalter noch veröffentlicht",
    wo: "An der Alten Kirche, Krefeld-Innenstadt",
    veranstalter: "Thommessen Christmas Event Management",
    text: "Die Familie Thommessen ist seit über 40 Jahren auf dem Krefelder Weihnachtsmarkt. Bekannt für die Reibekuchen und Lichterglanz mit LED-Beleuchtung.",
    start: "2026-11-26",
    ende: "2026-12-23",
    ort: { name: "An der Alten Kirche", strasse: "An der Alten Kirche" },
  },
  {
    name: "Familien-Weihnachtsmarkt Traar",
    datum: "Fr 27. – So 29.11.",
    stadtteil: "Traar",
    wann: "Freitag, 27. bis Sonntag, 29. November (Uhrzeit folgt)",
    wo: "Festplatz Traar, Moerser Landstraße 430, 47802 Krefeld",
    veranstalter: "Sydne und Marc-André Nimptsch",
    veranstalterPersonen: true,
    text: "Ein Markt, der sich an Familien richtet, mit Programm für Kinder und einer Tombola für einen guten Zweck.",
    start: "2026-11-27",
    ende: "2026-11-29",
    ort: { name: "Festplatz Traar", strasse: "Moerser Landstraße 430", plz: "47802" },
  },
  {
    name: "Weihnachtsmarkt auf dem Schinkenplatz",
    datum: "Sa 28.11.",
    stadtteil: "Innenstadt",
    wann: "Samstag, 28. November, 14 bis 19 Uhr",
    wo: "Schinkenplatz, Krefeld",
    veranstalter: "Bürgerverein am Schinkenplatz",
    text: "Das erste Fest auf dem frisch umgebauten Schinkenplatz. Um 16 Uhr wird der Platz offiziell eingeweiht, mit einem interkulturellen Friedensgebet. Mit dabei sind unter anderem gebrannte Mandeln für einen guten Zweck, türkische Spezialitäten, selbstgenähte Mode und die Pfarrbläser St. Stephan.",
    start: "2026-11-28T14:00:00+01:00",
    ende: "2026-11-28T19:00:00+01:00",
    ort: { name: "Schinkenplatz", strasse: "Schinkenplatz" },
  },
  {
    name: "Nikolausmarkt Uerdingen",
    datum: "Sa 28. + So 29.11.",
    stadtteil: "Uerdingen",
    wann: "Samstag, 28. und Sonntag, 29. November (Uhrzeit folgt)",
    wo: "Marktplatz Uerdingen, 47829 Krefeld",
    veranstalter: "Uerdinger Kaufmannsbund",
    text: "Traditionell am ersten Adventswochenende auf dem historischen Marktplatz, bekannt für die Ankunft von Sinter Klaas.",
    start: "2026-11-28",
    ende: "2026-11-29",
    ort: { name: "Marktplatz Uerdingen", plz: "47829" },
  },
  {
    name: "Linner Weihnachtsmarkt",
    datum: "Fr 4. – So 6.12.",
    stadtteil: "Linn",
    wann: "Freitag, 4. bis Sonntag, 6. Dezember (Uhrzeit folgt)",
    wo: "Krefeld-Linn, Infostand am Krippenplatz",
    text: "Weihnachtsmarkt in der historischen Kulisse von Linn. Fragen beantwortet das Team am Infostand.",
    start: "2026-12-04",
    ende: "2026-12-06",
    ort: { name: "Krefeld-Linn" },
  },
  {
    name: "Der besondere Weihnachtsmarkt",
    datum: "Sa 5.12.",
    stadtteil: "Innenstadt",
    wann: "Samstag, 5. Dezember, 10 bis 18 Uhr",
    wo: "Rathausvorplatz, Krefeld-Innenstadt",
    text: "Nur ein Tag, immer am Samstag vor dem zweiten Advent. Im Mittelpunkt stehen Begegnung und gemeinsames Erleben.",
    start: "2026-12-05T10:00:00+01:00",
    ende: "2026-12-05T18:00:00+01:00",
    ort: { name: "Rathausvorplatz" },
  },
  {
    name: "WeihnachtsBubbelmaat Hüls",
    datum: "Sa 12. + So 13.12.",
    stadtteil: "Hüls",
    wann: "Samstag, 12. Dezember (Uhrzeit folgt) und Sonntag, 13. Dezember, 13 bis 22 Uhr",
    wo: "Hülser Markt 1, 47839 Krefeld",
    veranstalter: "Bubbelmaat – Dein Feierabendmarkt in Krefeld",
    text: "Weihnachtsmarkt mit Liveprogramm, vielen Verkaufsständen, Glühwein und Foodtrucks auf dem Hülser Markt.",
    start: "2026-12-12",
    ende: "2026-12-13T22:00:00+01:00",
    ort: { name: "Hülser Markt", strasse: "Hülser Markt 1", plz: "47839" },
  },
  {
    name: "Weihnachtsmarkt in Fischeln",
    datum: "Fr 18. – So 20.12.",
    stadtteil: "Fischeln",
    wann: "Freitag, 18. bis Sonntag, 20. Dezember (Uhrzeit folgt)",
    wo: "Rathausgarten Fischeln",
    veranstalter: "Werbering Fischeln",
    text: "Drei Tage lang im Rathausgarten, der letzte Markt der Saison in den Stadtteilen.",
    start: "2026-12-18",
    ende: "2026-12-20",
    ort: { name: "Rathausgarten Fischeln" },
  },
];

export const FRAGEN: readonly { frage: string; antwort: string }[] = [
  {
    frage: "Wann beginnt der Weihnachtsmarkt in Krefeld 2026?",
    antwort:
      "In der Innenstadt öffnen MIKS und der Crefelder Weihnachtsmarkt am 26. November. In den Stadtteilen geht es schon früher los: Bruckhausen am 20. November, Oppum am 21. November.",
  },
  {
    frage: "Wie lange hat der Weihnachtsmarkt in der Innenstadt geöffnet?",
    antwort: "Beide Märkte an der Dionysiuskirche laufen bis 23. Dezember.",
  },
  {
    frage: "Wo ist der Weihnachtsmarkt in Krefeld?",
    antwort:
      "Die großen Märkte stehen rund um die Dionysiuskirche (Alte Kirche) in der Innenstadt. Dazu kommen Märkte in Traar, Oppum, Uerdingen, Linn, Hüls und Fischeln sowie am Rathaus und auf dem Schinkenplatz.",
  },
  {
    frage: "Welcher Weihnachtsmarkt in Krefeld ist für Familien geeignet?",
    antwort:
      "Der Familien-Weihnachtsmarkt in Traar richtet sich ausdrücklich an Familien. Auch der Schinkenplatz und Oppum sind klein und übersichtlich.",
  },
  {
    frage: "Kostet der Eintritt etwas?",
    antwort: "Die Krefelder Weihnachtsmärkte sind nach unserem Stand ohne Eintritt. Für Oppum ist das vom Veranstalter bestätigt.",
  },
];

function marktSchema(markt: Markt, index: number, pageUrl: string) {
  const { ort } = markt;
  return {
    "@type": "Event",
    "@id": `${pageUrl}#markt-${index + 1}`,
    name: markt.name,
    description: markt.text,
    startDate: markt.start,
    endDate: markt.ende,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: ort.name,
      address: {
        "@type": "PostalAddress",
        ...(ort.strasse ? { streetAddress: ort.strasse } : {}),
        ...(ort.plz ? { postalCode: ort.plz } : {}),
        addressLocality: "Krefeld",
        addressCountry: "DE",
      },
    },
    ...(markt.veranstalter
      ? { organizer: { "@type": markt.veranstalterPersonen ? "Person" : "Organization", name: markt.veranstalter } }
      : {}),
    ...(markt.eintrittFrei ? { isAccessibleForFree: true } : {}),
  };
}

/** Ergänzt das Schema der Seite um dateModified, je Markt ein Event und die FAQPage. */
export function weihnachtsmaerkteSchema<T extends { "@graph": object[] }>(schema: T, pageUrl: string): T {
  const graph = schema["@graph"].map((node) =>
    "@id" in node && node["@id"] === `${pageUrl}#webpage` ? { ...node, dateModified: STAND.iso } : node,
  );
  return {
    ...schema,
    "@graph": [
      ...graph,
      ...MAERKTE.map((markt, index) => marktSchema(markt, index, pageUrl)),
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        isPartOf: { "@id": `${pageUrl}#webpage` },
        mainEntity: FRAGEN.map(({ frage, antwort }) => ({
          "@type": "Question",
          name: frage,
          acceptedAnswer: { "@type": "Answer", text: antwort },
        })),
      },
    ],
  };
}

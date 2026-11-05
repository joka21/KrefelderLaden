/**
 * Weihnachtsmärkte 2026 auf /weihnachtsmaerkte-in-krefeld/: Texte der Redaktion unverändert.
 *
 * Pflege: Termine stehen nur in `start` und `ende` (Datum ohne Uhrzeit, `ende` nur bei
 * mehrtägigen Märkten). Tabelle, Terminzeile und Schema entstehen daraus. Ändert sich
 * ein Termin, meldet `npm test`, wenn Einleitung oder FAQ nicht mehr dazu passen.
 * Bestätigte Uhrzeiten kommen als Text in `zeitErsterTag`/`zeitLetzterTag` oder `uhrzeit`.
 * Bei jeder Aktualisierung STAND anpassen; er steht im Hinweis, in dateModified und in der Sitemap.
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
  /** Stadtteil in der Übersichtstabelle. */
  stadtteil: string;
  /** Erster Tag, z. B. 2026-11-26. */
  start: string;
  /** Letzter Tag, nur bei mehrtägigen Märkten. */
  ende?: string;
  /** Uhrzeit in der Terminzeile: am ersten Tag (auch bei Eintagesmärkten) … */
  zeitErsterTag?: string;
  /** … und am letzten Tag eines zweitägigen Markts. */
  zeitLetzterTag?: string;
  /** Eigene Zeile für Uhrzeiten, die nicht in die Terminzeile passen. */
  uhrzeit?: string;
  wo: string;
  veranstalter?: string;
  /** Veranstalter sind Personen statt einer Organisation. */
  veranstalterPersonen?: boolean;
  eintritt?: string;
  text: string;
  ort: { name: string; strasse?: string; plz?: string };
  /** Nur, wo der Veranstalter freien Eintritt bestätigt hat. */
  eintrittFrei?: boolean;
}

export const MAERKTE: readonly Markt[] = [
  {
    name: "Wintermarkt An Bruckhausen",
    stadtteil: "Traar",
    start: "2026-11-20",
    ende: "2026-11-21",
    zeitErsterTag: "15 bis 19 Uhr",
    wo: "An Bruckhausen 33, 47802 Krefeld-Traar",
    text: "Der früheste Markt der Saison: zwei Tage Winterstimmung in Bruckhausen, mit schönen Dingen zum Stöbern und Angeboten für die ganze Familie.",
    ort: { name: "An Bruckhausen", strasse: "An Bruckhausen 33", plz: "47802" },
  },
  {
    name: "Funkelnde Sterne in Oppum",
    stadtteil: "Oppum",
    start: "2026-11-21",
    zeitErsterTag: "ab 14 Uhr",
    wo: "rund um die Schutzengelkirche, Hauptstraße 18, 47809 Krefeld-Oppum",
    veranstalter: "Pfarrei St. Augustinus",
    eintritt: "frei",
    text: "Um 15 Uhr eröffnet der Gospelchor family of hope den Markt an der Schutzengelkirche. Dazu Buden mit Handgemachtem und heißen Getränken.",
    ort: { name: "Schutzengelkirche", strasse: "Hauptstraße 18", plz: "47809" },
    eintrittFrei: true,
  },
  {
    name: "MIKS – Weihnachtsmarkt made in Krefeld",
    stadtteil: "Innenstadt",
    start: "2026-11-26",
    ende: "2026-12-23",
    uhrzeit: "sonntags bis dienstags 13 bis 20 Uhr, mittwochs bis samstags 11:30 bis 21 Uhr",
    wo: "Dionysiusplatz, Krefeld-Innenstadt",
    text: "Auf dem Dioplatz entsteht ein weihnachtlicher Stadtgarten. Der Schwerpunkt: Gutes aus Krefeld, Geschenkideen, Essen und warme Getränke.",
    ort: { name: "Dionysiusplatz", strasse: "Dionysiusplatz" },
  },
  {
    name: "Crefelder Weihnachtsmarkt 2.0 – Hüttenzauber für Leib und Seele",
    kurzname: "Crefelder Weihnachtsmarkt 2.0",
    stadtteil: "Innenstadt",
    start: "2026-11-26",
    ende: "2026-12-23",
    uhrzeit: "wird vom Veranstalter noch veröffentlicht",
    wo: "An der Alten Kirche, Krefeld-Innenstadt",
    veranstalter: "Thommessen Christmas Event Management",
    text: "Die Familie Thommessen ist seit über 40 Jahren auf dem Krefelder Weihnachtsmarkt. Bekannt für die Reibekuchen und Lichterglanz mit LED-Beleuchtung.",
    ort: { name: "An der Alten Kirche", strasse: "An der Alten Kirche" },
  },
  {
    name: "Familien-Weihnachtsmarkt Traar",
    stadtteil: "Traar",
    start: "2026-11-27",
    ende: "2026-11-29",
    wo: "Festplatz Traar, Moerser Landstraße 430, 47802 Krefeld",
    veranstalter: "Sydne und Marc-André Nimptsch",
    veranstalterPersonen: true,
    text: "Ein Markt, der sich an Familien richtet, mit Programm für Kinder und einer Tombola für einen guten Zweck.",
    ort: { name: "Festplatz Traar", strasse: "Moerser Landstraße 430", plz: "47802" },
  },
  {
    name: "Weihnachtsmarkt auf dem Schinkenplatz",
    stadtteil: "Innenstadt",
    start: "2026-11-28",
    zeitErsterTag: "14 bis 19 Uhr",
    wo: "Schinkenplatz, Krefeld",
    veranstalter: "Bürgerverein am Schinkenplatz",
    text: "Das erste Fest auf dem frisch umgebauten Schinkenplatz. Um 16 Uhr wird der Platz offiziell eingeweiht, mit einem interkulturellen Friedensgebet. Mit dabei sind unter anderem gebrannte Mandeln für einen guten Zweck, türkische Spezialitäten, selbstgenähte Mode und die Pfarrbläser St. Stephan.",
    ort: { name: "Schinkenplatz", strasse: "Schinkenplatz" },
  },
  {
    name: "Nikolausmarkt Uerdingen",
    stadtteil: "Uerdingen",
    start: "2026-11-28",
    ende: "2026-11-29",
    wo: "Marktplatz Uerdingen, 47829 Krefeld",
    veranstalter: "Uerdinger Kaufmannsbund",
    text: "Traditionell am ersten Adventswochenende auf dem historischen Marktplatz, bekannt für die Ankunft von Sinter Klaas.",
    ort: { name: "Marktplatz Uerdingen", plz: "47829" },
  },
  {
    name: "Linner Weihnachtsmarkt",
    stadtteil: "Linn",
    start: "2026-12-04",
    ende: "2026-12-06",
    wo: "Krefeld-Linn, Infostand am Krippenplatz",
    text: "Weihnachtsmarkt in der historischen Kulisse von Linn. Fragen beantwortet das Team am Infostand.",
    ort: { name: "Krefeld-Linn" },
  },
  {
    name: "Der besondere Weihnachtsmarkt",
    stadtteil: "Innenstadt",
    start: "2026-12-05",
    zeitErsterTag: "10 bis 18 Uhr",
    wo: "Rathausvorplatz, Krefeld-Innenstadt",
    text: "Nur ein Tag, immer am Samstag vor dem zweiten Advent. Im Mittelpunkt stehen Begegnung und gemeinsames Erleben.",
    ort: { name: "Rathausvorplatz" },
  },
  {
    name: "WeihnachtsBubbelmaat Hüls",
    stadtteil: "Hüls",
    start: "2026-12-12",
    ende: "2026-12-13",
    zeitLetzterTag: "13 bis 22 Uhr",
    wo: "Hülser Markt 1, 47839 Krefeld",
    veranstalter: "Bubbelmaat – Dein Feierabendmarkt in Krefeld",
    text: "Weihnachtsmarkt mit Liveprogramm, vielen Verkaufsständen, Glühwein und Foodtrucks auf dem Hülser Markt.",
    ort: { name: "Hülser Markt", strasse: "Hülser Markt 1", plz: "47839" },
  },
  {
    name: "Weihnachtsmarkt in Fischeln",
    stadtteil: "Fischeln",
    start: "2026-12-18",
    ende: "2026-12-20",
    wo: "Rathausgarten Fischeln",
    veranstalter: "Werbering Fischeln",
    text: "Drei Tage lang im Rathausgarten, der letzte Markt der Saison in den Stadtteilen.",
    ort: { name: "Rathausgarten Fischeln" },
  },
];

/** Einleitung im Abschnitt „Auf einen Blick“. */
export const EINLEITUNG =
  "Die ersten Märkte starten am 20. November in den Stadtteilen, die Innenstadt folgt am 26. November und bleibt bis 23. Dezember.";

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

const WOCHENTAGE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const MONATE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];
const EIN_TAG = 86_400_000;

/** UTC, damit Wochentag und Tag nicht von der Zeitzone des Servers abhängen. */
const alsDatum = (iso: string) => new Date(`${iso}T00:00:00Z`);
const wochentag = (datum: Date) => WOCHENTAGE[datum.getUTCDay()];
const wochentagKurz = (datum: Date) => `${wochentag(datum).slice(0, 2)} ${datum.getUTCDate()}.`;
const monatZahl = (datum: Date) => `${datum.getUTCMonth() + 1}.`;
const tagMonatLang = (datum: Date) => `${datum.getUTCDate()}. ${MONATE[datum.getUTCMonth()]}`;
const tagLang = (datum: Date) => `${wochentag(datum)}, ${tagMonatLang(datum)}`;
const anderenMonat = (von: Date, bis: Date) => von.getUTCMonth() !== bis.getUTCMonth();
const zweiTage = (von: Date, bis: Date) => bis.getTime() - von.getTime() === EIN_TAG;

/** „26. November“ zu 2026-11-26. */
export const tagMonat = (iso: string) => tagMonatLang(alsDatum(iso));

/** Datum in der Übersichtstabelle, z. B. „Sa 21.11.“ oder „Fr 27. – So 29.11.“. */
export function datumKurz({ start, ende }: Pick<Markt, "start" | "ende">): string {
  const von = alsDatum(start);
  if (!ende) {
    return wochentagKurz(von) + monatZahl(von);
  }
  const bis = alsDatum(ende);
  if (anderenMonat(von, bis)) {
    return `${von.getUTCDate()}.${monatZahl(von)} – ${bis.getUTCDate()}.${monatZahl(bis)}`;
  }
  return `${wochentagKurz(von)} ${zweiTage(von, bis) ? "+" : "–"} ${wochentagKurz(bis)}${monatZahl(bis)}`;
}

/** Terminzeile („Wann“) eines Markts. */
export function wannText(markt: Markt): string {
  const { start, ende, zeitErsterTag, zeitLetzterTag } = markt;
  const folgt = " (Uhrzeit folgt)";
  const offen = markt.uhrzeit ? "" : folgt;
  const von = alsDatum(start);
  if (!ende) {
    return tagLang(von) + (zeitErsterTag ? `, ${zeitErsterTag}` : offen);
  }
  const bis = alsDatum(ende);
  if (anderenMonat(von, bis)) {
    return `${tagMonatLang(von)} bis ${tagMonatLang(bis)}${offen}`;
  }
  if (zeitErsterTag || zeitLetzterTag) {
    const erster = zeitErsterTag ? `, ${zeitErsterTag},` : folgt;
    const letzter = zeitLetzterTag ? `, ${zeitLetzterTag}` : folgt;
    return `${tagLang(von)}${erster} und ${tagLang(bis)}${letzter}`;
  }
  return `${wochentag(von)}, ${von.getUTCDate()}. ${zweiTage(von, bis) ? "und" : "bis"} ${tagLang(bis)}${offen}`;
}

/** Erster Satz des Seitentexts; keiner, wenn er eine Uhrzeit nennt (das Schema nennt keine). */
function beschreibung(text: string): string | null {
  const satz = text.split(/(?<=[.!?])\s/u)[0];
  return /\b\d{1,2}(:\d\d)? Uhr\b/u.test(satz) ? null : satz;
}

function marktSchema(markt: Markt, index: number, pageUrl: string) {
  const { ort } = markt;
  const description = beschreibung(markt.text);
  return {
    "@type": "Event",
    "@id": `${pageUrl}#markt-${index + 1}`,
    name: markt.name,
    ...(description ? { description } : {}),
    startDate: markt.start,
    ...(markt.ende ? { endDate: markt.ende } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: pageUrl,
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

/**
 * Trödel- und Flohmärkte auf /troedelmarkt-krefeld/, nach dem Muster von lib/weihnachtsmaerkte.ts.
 *
 * Pflege: Quelle ist data/troedelmaerkte_krefeld_2026_2027.csv. Nach jeder Änderung
 * `node scripts/build-troedelmaerkte.mjs` ausführen (erzeugt lib/troedelmaerkte-daten.json)
 * und danach `npm test`. Alle Funktionen bekommen das heutige Datum (Europe/Berlin) übergeben;
 * vergangene Termine fallen damit von selbst weg.
 *
 * Status-Spalte:
 * - ohne Datum → „Regelmäßige Märkte – nächster Termin folgt“, außer „Ort genannt – Veranstaltung prüfen“
 * - „Quellenkonflikt – bitte prüfen“ → nirgends
 * - „Regeltermin, einzeln prüfen“ → mit Hinweis, nicht im JSON-LD
 * - „Termin im Portal – Uhrzeit prüfen“ → „ab … Uhr, Ende noch offen“, nicht im JSON-LD
 * - sonst mit „gelistet“ oder „bestätigt“ → normal, im JSON-LD
 * Die Spalte „hinweise“ enthält Notizen der Recherche und wird nicht angezeigt.
 */

import zeilen from "./troedelmaerkte-daten.json" with { type: "json" };

/** Eine Zeile der CSV; leere Felder sind "". */
export interface TroedelZeile {
  titel: string;
  kategorie: string;
  datum: string;
  beginn: string;
  ende: string;
  veranstaltungsort: string;
  strasse: string;
  plz: string;
  ort: string;
  stadtteil: string;
  veranstalter: string;
  turnus: string;
  eintritt: string;
  status: string;
  hinweise: string;
  veranstaltungs_url: string;
  quelle_url: string;
  recherchiert_am: string;
}

export const ZEILEN: readonly TroedelZeile[] = zeilen;

export const TROEDEL_PATH = "/troedelmarkt-krefeld/";
export const TROEDEL_H1 = "Trödelmarkt Krefeld: alle Termine 2026/2027";
export const TROEDEL_TITEL = "Trödelmarkt Krefeld 2026/2027: alle Termine & Flohmärkte";
export const TROEDEL_BESCHREIBUNG =
  "Trödelmarkt und Flohmarkt in Krefeld: alle Termine 2026/2027 mit Uhrzeiten und Orten – Grotenburg, METRO, Globus (ehemals real), Kaufland und mehr.";

const iso = ZEILEN.map((zeile) => zeile.recherchiert_am).sort().at(-1) ?? "";
/** Stand der Recherche (jüngstes recherchiert_am); steht im Hinweis, in dateModified und in der Sitemap. */
export const STAND = { iso, text: iso.split("-").reverse().join(".") } as const;

export const STATUS = {
  regeltermin: "Regeltermin, einzeln prüfen",
  uhrzeitOffen: "Termin im Portal – Uhrzeit prüfen",
  konflikt: "Quellenkonflikt – bitte prüfen",
  ortGenannt: "Ort genannt – Veranstaltung prüfen",
} as const;

export const REGELTERMIN_HINWEIS = "Regeltermin – bitte vorher prüfen";

/** Ortsnamen, die auf der Seite einen Zusatz bekommen. */
const ORT_ANZEIGE: Record<string, string> = { "Globus Krefeld": "Globus Krefeld (ehemals real)" };

/** normal: gelistet oder bestätigt; regeltermin und uhrzeitOffen: angezeigt, aber nicht im JSON-LD. */
export type Art = "normal" | "regeltermin" | "uhrzeitOffen";

export interface Termin {
  /** Zeile in der CSV (ab 2, nach der Kopfzeile); stabil für die @id im Schema. */
  zeile: number;
  markt: string;
  kategorie: string;
  datum: string;
  beginn: string;
  ende: string;
  ort: string;
  strasse: string;
  plz: string;
  stadtteil: string;
  veranstalter: string;
  turnus: string;
  eintritt: string;
  url: string;
  art: Art;
}

export interface RegelMarkt {
  markt: string;
  ort: string;
  strasse: string;
  stadtteil: string;
  veranstalter: string;
  turnus: string;
  url: string;
}

function art(status: string): Art | null {
  if (status === STATUS.regeltermin) return "regeltermin";
  if (status === STATUS.uhrzeitOffen) return "uhrzeitOffen";
  if (status === STATUS.konflikt) return null;
  return /gelistet|bestätigt/u.test(status) ? "normal" : null;
}

const ortAnzeige = (ort: string) => ORT_ANZEIGE[ort] ?? ort;
const url = (zeile: TroedelZeile) => zeile.veranstaltungs_url || zeile.quelle_url;

/** Alle Termine mit Datum, die angezeigt werden dürfen, nach Datum und Beginn sortiert (auch vergangene). */
export const TERMINE: readonly Termin[] = ZEILEN.flatMap((zeile, index) => {
  const termin = zeile.datum ? art(zeile.status) : null;
  if (!termin) return [];
  return [
    {
      zeile: index + 2,
      markt: zeile.titel,
      kategorie: zeile.kategorie,
      datum: zeile.datum,
      beginn: zeile.beginn,
      ende: zeile.ende,
      ort: ortAnzeige(zeile.veranstaltungsort),
      strasse: zeile.strasse,
      plz: zeile.plz,
      stadtteil: zeile.stadtteil,
      veranstalter: zeile.veranstalter,
      turnus: zeile.turnus,
      eintritt: zeile.eintritt,
      url: url(zeile),
      art: termin,
    },
  ];
}).toSorted((a, b) => a.datum.localeCompare(b.datum) || a.beginn.localeCompare(b.beginn));

/** Märkte ohne Datum („nächster Termin folgt“). */
export const REGELMAESSIG: readonly RegelMarkt[] = ZEILEN.filter(
  (zeile) => !zeile.datum && zeile.status !== STATUS.ortGenannt,
).map((zeile) => ({
  markt: zeile.titel,
  ort: ortAnzeige(zeile.veranstaltungsort),
  strasse: zeile.strasse,
  stadtteil: zeile.stadtteil,
  veranstalter: zeile.veranstalter,
  turnus: zeile.turnus,
  url: url(zeile),
}));

/** Kategorien für „Bücher-, Kinder- und Vintage-Flohmärkte“ mit Zwischenüberschrift. */
export const BESONDERE: readonly { heading: string; kategorien: readonly string[] }[] = [
  { heading: "Bücherflohmärkte", kategorien: ["Bücherflohmarkt"] },
  { heading: "Kinder- und Babytrödel", kategorien: ["Kinder- / Babytrödel"] },
  { heading: "Vintage, Design und Mode", kategorien: ["Vintage-/Designflohmarkt", "Frauen- / Modeflohmarkt"] },
];

/* ------------------------------------------------------------------ */
/* Datum und Uhrzeit                                                   */
/* ------------------------------------------------------------------ */

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

/** „Samstag, 7. November 2026“. */
export function datumLang(iso: string): string {
  const datum = alsDatum(iso);
  return `${WOCHENTAGE[datum.getUTCDay()]}, ${datum.getUTCDate()}. ${MONATE[datum.getUTCMonth()]} ${datum.getUTCFullYear()}`;
}

/** „Sa 07.11.“ für Tabellen. */
export function datumKurz(iso: string): string {
  const datum = alsDatum(iso);
  const [, monat, tag] = iso.split("-");
  return `${WOCHENTAGE[datum.getUTCDay()].slice(0, 2)} ${tag}.${monat}.`;
}

/** „November 2026“. */
export const monatJahr = (iso: string) => `${MONATE[alsDatum(iso).getUTCMonth()]} ${iso.slice(0, 4)}`;

/** „07:00“ → „7“, „11:30“ → „11:30“. */
const zeit = (hhmm: string) => {
  const [stunde, minute] = hhmm.split(":");
  return minute === "00" ? String(Number(stunde)) : `${Number(stunde)}:${minute}`;
};

/** Uhrzeit eines Termins, z. B. „7 bis 14 Uhr“ oder „ab 13 Uhr, Ende noch offen“. */
export function uhrzeitText({ beginn, ende, art }: Pick<Termin, "beginn" | "ende" | "art">): string {
  if (!beginn) return "Uhrzeit folgt";
  if (art === "uhrzeitOffen" || !ende) return `ab ${zeit(beginn)} Uhr${art === "uhrzeitOffen" ? ", Ende noch offen" : ""}`;
  return `${zeit(beginn)} bis ${zeit(ende)} Uhr`;
}

/** Adresse in einer Zeile, z. B. „Hafelsstraße 200, 47809 Krefeld“. */
export function adresse({ strasse, plz }: Pick<Termin, "strasse" | "plz">): string {
  return [strasse, [plz, "Krefeld"].filter(Boolean).join(" ")].filter(Boolean).join(", ");
}

/* ------------------------------------------------------------------ */
/* Auswahl nach Datum                                                  */
/* ------------------------------------------------------------------ */

/** Termine ab heute. */
export const kommendeTermine = (heute: string) => TERMINE.filter(({ datum }) => datum >= heute);

/** Letzter Tag von „Heute und dieses Wochenende“: der kommende Sonntag (sonntags heute). */
export function sonntag(heute: string): string {
  const datum = alsDatum(heute);
  const tage = (7 - datum.getUTCDay()) % 7;
  return new Date(datum.getTime() + tage * EIN_TAG).toISOString().slice(0, 10);
}

/** Termine von heute bis Sonntag. */
export function wochenendTermine(heute: string): Termin[] {
  const bis = sonntag(heute);
  return kommendeTermine(heute).filter(({ datum }) => datum <= bis);
}

/** Termine nach Monaten, z. B. [{ monat: "November 2026", termine }]. */
export function nachMonat(termine: readonly Termin[]): { monat: string; termine: Termin[] }[] {
  const gruppen: { monat: string; termine: Termin[] }[] = [];
  for (const termin of termine) {
    const monat = monatJahr(termin.datum);
    const letzte = gruppen.at(-1);
    if (letzte?.monat === monat) {
      letzte.termine.push(termin);
    } else {
      gruppen.push({ monat, termine: [termin] });
    }
  }
  return gruppen;
}

export interface Markt {
  markt: string;
  /** Angaben aus dem nächsten Termin. */
  naechster: Termin;
  termine: Termin[];
}

/** Märkte mit mindestens einem kommenden Termin, alphabetisch. */
export function kommendeMaerkte(heute: string): Markt[] {
  const maerkte = new Map<string, Termin[]>();
  for (const termin of kommendeTermine(heute)) {
    maerkte.set(termin.markt, [...(maerkte.get(termin.markt) ?? []), termin]);
  }
  return [...maerkte.entries()]
    .map(([markt, termine]) => ({ markt, naechster: termine[0], termine }))
    .toSorted((a, b) => a.markt.localeCompare(b.markt, "de"));
}

/* ------------------------------------------------------------------ */
/* Antwort zuerst (ganz oben auf der Seite)                            */
/* ------------------------------------------------------------------ */

/** „von 7 bis 14 Uhr“, „ab 13 Uhr“ oder "" (ohne Uhrzeit). */
export function zeitraum({ beginn, ende, art }: Pick<Termin, "beginn" | "ende" | "art">): string {
  if (!beginn) return "";
  if (ende && art !== "uhrzeitOffen") return `von ${zeit(beginn)} bis ${zeit(ende)} Uhr`;
  return `ab ${zeit(beginn)} Uhr`;
}

/** „Markt, von 7 bis 14 Uhr“ für die Liste bei mehreren Märkten an einem Tag. */
export const antwortZeile = (termin: Termin) =>
  [termin.markt, zeitraum(termin)].filter(Boolean).join(", ") + (termin.art === "regeltermin" ? ` (${REGELTERMIN_HINWEIS})` : "");

/**
 * Satz ganz oben: Was ist heute, sonst wann ist der nächste Markt. Bei mehreren
 * Märkten heute steht der Satz mit Doppelpunkt da, die Märkte in `liste`.
 */
export function antwortZuerst(heute: string): { satz: string; liste: Termin[] } {
  const kommende = kommendeTermine(heute);
  const heutige = kommende.filter(({ datum }) => datum === heute);
  const tag = datumLang(heute);

  if (heutige.length === 1) {
    const [termin] = heutige;
    const zeiten = zeitraum(termin);
    const hinweis = termin.art === "regeltermin" ? ` ${REGELTERMIN_HINWEIS}.` : "";
    return { satz: `Heute, ${tag}, findet in Krefeld ${termin.markt} statt${zeiten ? `, ${zeiten}` : ""}.${hinweis}`, liste: [] };
  }
  if (heutige.length > 1) {
    return { satz: `Heute, ${tag}, finden in Krefeld ${heutige.length} Trödelmärkte statt:`, liste: heutige };
  }

  const naechster = kommende[0];
  if (!naechster) {
    return {
      satz: "Heute findet in Krefeld kein Trödelmarkt statt. Neue Termine tragen wir nach, sobald sie veröffentlicht sind.",
      liste: [],
    };
  }
  const amSelbenTag = kommende.filter(({ datum }) => datum === naechster.datum);
  return {
    satz: `Heute findet in Krefeld kein Trödelmarkt statt. Der nächste ist am ${datumLang(naechster.datum)}: ${aufzaehlung([...new Set(amSelbenTag.map(({ markt }) => markt))])}.`,
    liste: [],
  };
}

/* ------------------------------------------------------------------ */
/* Häufige Fragen (aus den Daten)                                      */
/* ------------------------------------------------------------------ */

const GROTENBURG = "Samstags-Trödelmarkt Grotenburg";
const AFTER_WORK = "AFTER-WORK Flohmarkt Grotenburg";
const GLOBUS = "Trödelmarkt Globus Krefeld";

const tagMonat = (iso: string) => {
  const datum = alsDatum(iso);
  return `${datum.getUTCDate()}. ${MONATE[datum.getUTCMonth()]}`;
};
const aufzaehlung = (teile: readonly string[]) =>
  teile.length <= 1 ? (teile[0] ?? "") : `${teile.slice(0, -1).join(", ")} und ${teile.at(-1)}`;
const terminKurz = (termin: Termin) =>
  `${termin.markt} (${termin.ort}, ${uhrzeitText(termin)}${termin.art === "regeltermin" ? `; ${REGELTERMIN_HINWEIS}` : ""})`;

function heuteAntwort(heute: string): string {
  const heutige = kommendeTermine(heute).filter(({ datum }) => datum === heute);
  if (heutige.length > 0) {
    return `Heute, am ${datumLang(heute)}, ist ${heutige.map(terminKurz).join("; ")}. Alle weiteren Termine findest du oben in der Liste.`;
  }
  const naechster = kommendeTermine(heute)[0];
  if (!naechster) {
    return "Heute ist nach unseren Daten kein Trödelmarkt in Krefeld, und neue Termine haben wir noch nicht. Wir tragen sie nach, sobald sie veröffentlicht sind.";
  }
  const amSelbenTag = kommendeTermine(heute).filter(({ datum }) => datum === naechster.datum);
  return `Heute ist nach unseren Daten kein Trödelmarkt in Krefeld. Der nächste Termin ist am ${datumLang(naechster.datum)}: ${amSelbenTag.map(terminKurz).join("; ")}.`;
}

function globusAntwort(heute: string): string {
  const termine = kommendeTermine(heute).filter(({ markt }) => markt === GLOBUS);
  const markt = TERMINE.find((termin) => termin.markt === GLOBUS);
  if (!markt) return "";
  const ort = `Der Trödelmarkt am ehemaligen real findet am ${markt.ort}, ${adresse(markt)}, statt. Veranstalter ist die ${markt.veranstalter}.`;
  if (termine.length === 0) {
    return `${ort} Neue Termine tragen wir nach, sobald der Veranstalter sie veröffentlicht.`;
  }
  const zeiten = [...new Set(termine.map(uhrzeitText))];
  return `${ort} Geöffnet ist von ${zeiten.join(" bzw. ")}, die nächsten Termine: ${aufzaehlung(termine.slice(0, 3).map(({ datum }) => `${tagMonat(datum)} ${datum.slice(0, 4)}`))}.`;
}

function grotenburgAntwort(heute: string): string {
  const samstage = kommendeTermine(heute).filter(({ markt }) => markt === GROTENBURG);
  const afterWork = kommendeTermine(heute).filter(({ markt }) => markt === AFTER_WORK);
  const teile: string[] = [];
  if (samstage.length > 0) {
    const [erster] = samstage;
    const zeiten = [...new Set(samstage.map(uhrzeitText))];
    const regel = samstage.filter(({ art }) => art === "regeltermin");
    teile.push(
      `Der ${GROTENBURG} ist ${erster.turnus || "an mehreren Tagen"} von ${zeiten.join(" bzw. ")}, auf dem ${erster.ort.replace(/^Grotenburg-Stadion, /u, "")} am Grotenburg-Stadion (${erster.strasse}). Der nächste Termin ist am ${datumLang(erster.datum)}.`,
    );
    if (regel.length > 0) {
      teile.push(
        `${regel.length} der kommenden Samstage sind nur Regeltermine ohne eigene Bestätigung, der erste am ${tagMonat(regel[0].datum)} ${regel[0].datum.slice(0, 4)}. Sie sind in der Liste mit „${REGELTERMIN_HINWEIS}“ markiert.`,
      );
    }
  }
  if (afterWork.length > 0) {
    teile.push(
      `Dazu kommt der ${AFTER_WORK} am ${aufzaehlung(afterWork.map(({ datum }) => datumLang(datum)))}, jeweils ${uhrzeitText(afterWork[0])}.`,
    );
  }
  return teile.length > 0
    ? teile.join(" ")
    : "Für die Grotenburg haben wir gerade keine weiteren Termine. Wir tragen sie nach, sobald der Veranstalter sie veröffentlicht.";
}

function eintrittAntwort(heute: string): string {
  const maerkte = kommendeMaerkte(heute);
  const frei = maerkte.filter(({ naechster }) => naechster.eintritt === "frei");
  const andere = maerkte.filter(({ naechster }) => naechster.eintritt && naechster.eintritt !== "frei");
  const ohne = maerkte.filter(({ naechster }) => !naechster.eintritt);
  const teile: string[] = [];
  if (frei.length > 0) {
    teile.push(`Bei ${frei.length} von ${maerkte.length} Märkten ist der Eintritt nach unseren Daten frei, zum Beispiel ${aufzaehlung(frei.slice(0, 4).map(({ markt }) => markt))}.`);
  }
  for (const { markt, naechster } of andere) {
    teile.push(`Für ${markt} steht in unseren Daten: ${naechster.eintritt}.`);
  }
  if (ohne.length > 0) {
    teile.push(`Keine Angabe haben wir für ${aufzaehlung(ohne.map(({ markt }) => markt))}. Frag im Zweifel beim Veranstalter nach.`);
  }
  return teile.join(" ");
}

/** Häufige Fragen; Antworten aus den Daten, abhängig vom heutigen Datum. */
export function fragen(heute: string): { frage: string; antwort: string }[] {
  return [
    { frage: "Welcher Trödelmarkt ist heute in Krefeld?", antwort: heuteAntwort(heute) },
    { frage: "Wo ist der Trödelmarkt am ehemaligen real in Krefeld?", antwort: globusAntwort(heute) },
    { frage: "Wann ist der Trödelmarkt an der Grotenburg?", antwort: grotenburgAntwort(heute) },
    { frage: "Kostet der Eintritt etwas?", antwort: eintrittAntwort(heute) },
  ].filter(({ antwort }) => antwort);
}

/* ------------------------------------------------------------------ */
/* JSON-LD                                                             */
/* ------------------------------------------------------------------ */

/** Zeitpunkt mit Offset von Europe/Berlin, z. B. 2026-11-07T07:00:00+01:00. */
export function berlinZeit(datum: string, hhmm: string): string {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Berlin", timeZoneName: "longOffset" })
    .formatToParts(new Date(`${datum}T${hhmm}:00Z`))
    .find(({ type }) => type === "timeZoneName")?.value;
  const offset = name?.replace("GMT", "") || "+00:00";
  return `${datum}T${hhmm}:00${offset}`;
}

function terminSchema(termin: Termin, pageUrl: string) {
  return {
    "@type": "Event",
    "@id": `${pageUrl}#termin-${termin.zeile}`,
    name: termin.markt,
    startDate: termin.beginn ? berlinZeit(termin.datum, termin.beginn) : termin.datum,
    ...(termin.beginn && termin.ende ? { endDate: berlinZeit(termin.datum, termin.ende) } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: pageUrl,
    location: {
      "@type": "Place",
      name: termin.ort,
      address: {
        "@type": "PostalAddress",
        ...(termin.strasse ? { streetAddress: termin.strasse } : {}),
        ...(termin.plz ? { postalCode: termin.plz } : {}),
        addressLocality: "Krefeld",
        addressCountry: "DE",
      },
    },
    ...(termin.veranstalter ? { organizer: { "@type": "Organization", name: termin.veranstalter } } : {}),
    ...(termin.eintritt === "frei" ? { isAccessibleForFree: true } : {}),
  };
}

/** Ergänzt das Schema der Seite um dateModified, je kommendem Termin (nur „normal“) ein Event und die FAQPage. */
export function troedelmaerkteSchema<T extends { "@graph": object[] }>(schema: T, pageUrl: string, heute: string): T {
  const graph = schema["@graph"].map((node) =>
    "@id" in node && node["@id"] === `${pageUrl}#webpage` ? { ...node, dateModified: STAND.iso } : node,
  );
  return {
    ...schema,
    "@graph": [
      ...graph,
      ...kommendeTermine(heute)
        .filter(({ art }) => art === "normal")
        .map((termin) => terminSchema(termin, pageUrl)),
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        isPartOf: { "@id": `${pageUrl}#webpage` },
        mainEntity: fragen(heute).map(({ frage, antwort }) => ({
          "@type": "Question",
          name: frage,
          acceptedAnswer: { "@type": "Answer", text: antwort },
        })),
      },
    ],
  };
}

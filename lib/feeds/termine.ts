/**
 * Gemeinsames Format der Termin-Feeds (JSON und iCal) unter /daten/. Seiten und
 * Feeds lesen dieselben Daten (lib/troedelmaerkte.ts, lib/weihnachtsmaerkte.ts);
 * hier wird nur umgeformt, nichts ergänzt.
 */

import { zeitMitOffset } from "../schema/event.ts";
import { MARKE, STADT } from "../stadt.ts";

export interface FeedTermin {
  /** Stabil über Datenänderungen hinweg: aus Datum und Name, nicht aus der Zeilennummer. */
  uid: string;
  name: string;
  /** Erster Tag, JJJJ-MM-TT. */
  datum: string;
  /** Beginn HH:MM; ohne Angabe ganztägig. */
  beginn?: string;
  /** Letzter Tag, nur bei mehrtägigen Terminen. */
  bisDatum?: string;
  /** Ende HH:MM am letzten (bzw. einzigen) Tag. */
  ende?: string;
  /** Uhrzeit als Text, wenn sie nicht in beginn/ende passt (z. B. je Wochentag). */
  uhrzeit?: string;
  ort: string;
  strasse?: string;
  plz?: string;
  veranstalter?: string;
  /** Quelle der Angaben (Veranstalter, Buchungskalender). */
  quelle?: string;
  /** Tag der letzten Prüfung, JJJJ-MM-TT. */
  geprueftAm?: string;
  /** Hinweis wie „Regeltermin – bitte vorher prüfen“. */
  hinweis?: string;
  /** bestätigt bzw. nur vorläufig (Regeltermin); abgesagt nur, wenn in den Daten vermerkt. */
  status: "bestätigt" | "vorläufig" | "abgesagt";
  /** Seite mit dem Termin. */
  url: string;
}

export interface FeedKopf {
  titel: string;
  /** Seite, aus der die Termine stammen. */
  seite: string;
  /** Vollständige URL des Feeds selbst. */
  feed: string;
}

/** Hinweis zur Nutzung in JSON und iCal. */
export const NUTZUNGSHINWEIS = `Einbinden auf anderen Seiten ist erlaubt, mit Quellenangabe „${MARKE.name}“ und Link auf die Seite.`;

/** Kleinbuchstaben, Umlaute umschrieben, sonst Bindestriche – für UIDs und Sprungmarken. */
export function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** UID eines Termins, stabil über Änderungen der Reihenfolge in den Daten. */
export const terminUid = (datum: string, name: string, beginn?: string) =>
  `${datum}${beginn ? `-${beginn.replace(":", "")}` : ""}-${slug(name)}@${MARKE.domain}`;

/** „2026-11-20“ + „15:00“ → „2026-11-20T15:00:00+01:00“; ohne Uhrzeit nur das Datum. */
const ortszeit = (datum: string, hhmm?: string) => (hhmm ? zeitMitOffset(datum, hhmm) : datum);

/** JSON-Feed: Kopf mit Quelle, Stand und Hinweis, dann die Termine. */
export function terminJson(kopf: FeedKopf, termine: readonly FeedTermin[], erzeugtAm: string) {
  return {
    titel: kopf.titel,
    quelle: kopf.seite,
    feed: kopf.feed,
    herausgeber: MARKE.name,
    hinweis: NUTZUNGSHINWEIS,
    zeitzone: STADT.zeitzone,
    erzeugt_am: erzeugtAm,
    anzahl: termine.length,
    termine: termine.map((termin) => ({
      name: termin.name,
      beginn: ortszeit(termin.datum, termin.beginn),
      ende: termin.bisDatum || termin.ende ? ortszeit(termin.bisDatum ?? termin.datum, termin.ende) : null,
      uhrzeit: termin.uhrzeit ?? null,
      ort: termin.ort,
      adresse: {
        strasse: termin.strasse || null,
        plz: termin.plz || null,
        ort: STADT.name,
      },
      veranstalter: termin.veranstalter || null,
      status: termin.status,
      hinweis: termin.hinweis ?? null,
      quelle: termin.quelle || null,
      geprueft_am: termin.geprueftAm || null,
      url: termin.url,
    })),
  };
}

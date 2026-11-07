/**
 * iCalendar (RFC 5545) aus FeedTermin: Zeilenende CRLF, Zeilen höchstens 75
 * Oktette (gefaltet), Texte maskiert, Zeitzone als VTIMEZONE. Ohne Abhängigkeit.
 */

import { MARKE, STADT } from "../stadt.ts";
import { type FeedKopf, type FeedTermin, NUTZUNGSHINWEIS } from "./termine.ts";

/** VTIMEZONE je unterstützter Zeitzone (Regeln der EU-Sommerzeit). */
const VTIMEZONE: Record<string, string[]> = {
  "Europe/Berlin": [
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Berlin",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "DTSTART:19700329T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
  ],
};

/** Text maskieren: Backslash, Semikolon, Komma, Zeilenumbruch. */
export function icsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Zeile auf höchstens 75 Oktette falten, ohne UTF-8-Zeichen zu teilen. */
export function falte(zeile: string): string {
  const teile: string[] = [];
  let aktuell = "";
  let laenge = 0;
  for (const zeichen of zeile) {
    const bytes = Buffer.byteLength(zeichen, "utf8");
    // Erste Zeile 75 Oktette, Folgezeilen 74 (plus führendes Leerzeichen).
    if (laenge + bytes > (teile.length === 0 ? 75 : 74)) {
      teile.push(aktuell);
      aktuell = "";
      laenge = 0;
    }
    aktuell += zeichen;
    laenge += bytes;
  }
  teile.push(aktuell);
  return teile.join("\r\n ");
}

const kompakt = (datum: string) => datum.replaceAll("-", "");
const uhr = (hhmm: string) => `${hhmm.replace(":", "")}00`;

/** Tag nach `datum` (DTEND ganztägiger Termine ist exklusiv). */
function folgetag(datum: string): string {
  const tag = new Date(`${datum}T00:00:00Z`);
  tag.setUTCDate(tag.getUTCDate() + 1);
  return tag.toISOString().slice(0, 10);
}

/** DTSTAMP in UTC, z. B. 20261107T230500Z. */
const utcStempel = (jetzt: Date) => `${jetzt.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;

/**
 * Mit Beginn und Ende ein Termin mit Uhrzeit, sonst ganztägig über alle Tage
 * (der bekannte Beginn steht dann in der Beschreibung). So wird kein Ende erfunden
 * und kein Tag eines mehrtägigen Markts verschluckt.
 */
function zeiten(termin: FeedTermin, tzid: string): string[] {
  const letzterTag = termin.bisDatum ?? termin.datum;
  if (!termin.beginn || !termin.ende) {
    return [`DTSTART;VALUE=DATE:${kompakt(termin.datum)}`, `DTEND;VALUE=DATE:${kompakt(folgetag(letzterTag))}`];
  }
  return [
    `DTSTART;TZID=${tzid}:${kompakt(termin.datum)}T${uhr(termin.beginn)}`,
    `DTEND;TZID=${tzid}:${kompakt(letzterTag)}T${uhr(termin.ende)}`,
  ];
}

/** „07:00“ → „7 Uhr“, „11:30“ → „11:30 Uhr“. */
const uhrText = (hhmm: string) => `${hhmm.endsWith(":00") ? String(Number(hhmm.slice(0, 2))) : hhmm.replace(/^0/, "")} Uhr`;

const STATUS = { bestätigt: "CONFIRMED", vorläufig: "TENTATIVE", abgesagt: "CANCELLED" } as const;

function vevent(termin: FeedTermin, tzid: string, stempel: string): string[] {
  const adresse = [termin.ort, termin.strasse, [termin.plz, STADT.name].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const beschreibung = [
    termin.hinweis,
    termin.beginn && !termin.ende ? `Beginn: ${uhrText(termin.beginn)}` : undefined,
    termin.uhrzeit ? `Uhrzeit: ${termin.uhrzeit}` : undefined,
    termin.veranstalter ? `Veranstalter: ${termin.veranstalter}` : undefined,
    termin.geprueftAm ? `Stand: geprüft am ${termin.geprueftAm.split("-").reverse().join(".")}` : undefined,
    termin.quelle ? `Quelle: ${termin.quelle}` : undefined,
    `Mehr auf ${MARKE.name}: ${termin.url}`,
  ].filter((zeile) => zeile !== undefined);
  return [
    "BEGIN:VEVENT",
    `UID:${termin.uid}`,
    `DTSTAMP:${stempel}`,
    ...zeiten(termin, tzid),
    `SUMMARY:${icsText(termin.name)}`,
    `LOCATION:${icsText(adresse)}`,
    `DESCRIPTION:${icsText(beschreibung.join("\n"))}`,
    `URL:${termin.url}`,
    `STATUS:${STATUS[termin.status]}`,
    "END:VEVENT",
  ];
}

/** Ganzer Kalender als Text mit CRLF. */
export function terminIcs(kopf: FeedKopf, termine: readonly FeedTermin[], jetzt: Date = new Date()): string {
  const tzid = STADT.zeitzone;
  const zone = VTIMEZONE[tzid];
  if (!zone) {
    throw new Error(`Keine VTIMEZONE für ${tzid} in lib/feeds/ics.ts`);
  }
  const stempel = utcStempel(jetzt);
  const zeilen = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${MARKE.name}//Termine ${STADT.name}//DE`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${icsText(kopf.titel)}`,
    `X-WR-CALDESC:${icsText(`${kopf.titel}. ${NUTZUNGSHINWEIS} Quelle: ${kopf.seite}`)}`,
    `X-WR-TIMEZONE:${tzid}`,
    "REFRESH-INTERVAL;VALUE=DURATION:P1D",
    "X-PUBLISHED-TTL:P1D",
    ...zone,
    ...termine.flatMap((termin) => vevent(termin, tzid, stempel)),
    "END:VCALENDAR",
  ];
  return `${zeilen.map(falte).join("\r\n")}\r\n`;
}

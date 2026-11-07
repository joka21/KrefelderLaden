// Aufruf: npm test – Termin-Feeds (JSON, iCal) unter /daten/.
import assert from "node:assert/strict";
import { test } from "node:test";

import { falte, icsText, terminIcs } from "../lib/feeds/ics.ts";
import { terminJson, terminUid } from "../lib/feeds/termine.ts";
import { kommendeTermine, troedelFeedTermine } from "../lib/troedelmaerkte.ts";
import { MAERKTE, maerkteFeedTermine } from "../lib/weihnachtsmaerkte.ts";

const HEUTE = "2026-11-07";
const SEITE = "https://example.org/troedelmarkt-krefeld/";
const KOPF = { titel: "Trödelmärkte", seite: SEITE, feed: "https://example.org/daten/troedelmarkt-krefeld.ics" };
const troedel = troedelFeedTermine(HEUTE, SEITE);
const maerkte = maerkteFeedTermine(HEUTE, "https://example.org/weihnachtsmaerkte-in-krefeld/");
const JETZT = new Date("2026-11-07T23:05:00Z");

test("Trödel-Feed: genau die kommenden Termine der Seite", () => {
  assert.equal(troedel.length, kommendeTermine(HEUTE).length);
  assert.ok(troedel.every(({ datum }) => datum >= HEUTE));
  assert.ok(troedel.some(({ status }) => status === "vorläufig"), "Regeltermine als vorläufig");
});

test("Weihnachts-Feed: laufende und kommende Märkte, vergangene fallen weg", () => {
  assert.equal(maerkte.length, MAERKTE.filter(({ start, ende }) => (ende ?? start) >= HEUTE).length);
  assert.equal(maerkteFeedTermine("2026-12-24", "x").length, 0);
  assert.ok(maerkteFeedTermine("2026-12-23", "x").every(({ bisDatum }) => bisDatum === "2026-12-23"));
});

test("UIDs eindeutig und stabil", () => {
  for (const termine of [troedel, maerkte]) {
    const uids = termine.map(({ uid }) => uid);
    assert.equal(new Set(uids).size, uids.length);
  }
  assert.equal(terminUid("2026-11-07", "Samstags-Trödelmarkt Grotenburg", "07:00"), "2026-11-07-0700-samstags-troedelmarkt-grotenburg@krefelder-laden.de");
});

test("iCal: CRLF, höchstens 75 Oktette je Zeile, VTIMEZONE, ein VEVENT je Termin", () => {
  const ics = terminIcs(KOPF, troedel, JETZT);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n"));
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
  assert.ok(!/[^\r]\n/.test(ics), "nur CRLF");
  for (const zeile of ics.split("\r\n")) {
    assert.ok(Buffer.byteLength(zeile, "utf8") <= 75, zeile);
  }
  assert.ok(ics.includes("BEGIN:VTIMEZONE\r\nTZID:Europe/Berlin"));
  assert.equal(ics.split("BEGIN:VEVENT").length - 1, troedel.length);
  assert.ok(ics.includes("DTSTART;TZID=Europe/Berlin:20261107T070000\r\nDTEND;TZID=Europe/Berlin:20261107T140000"));
  assert.ok(ics.includes("DTSTAMP:20261107T230500Z"));
});

test("iCal: ohne bekanntes Ende ganztägig über alle Tage, Beginn in der Beschreibung", () => {
  const ics = terminIcs(KOPF, maerkte, JETZT).replace(/\r\n /g, "");
  // Bruckhausen: 20.–21.11., nur Beginn am ersten Tag bekannt
  assert.ok(ics.includes("DTSTART;VALUE=DATE:20261120\r\nDTEND;VALUE=DATE:20261122"), "zwei Tage, DTEND exklusiv");
  assert.ok(ics.includes("Beginn: 15 Uhr"));
  // Schinkenplatz: Beginn und Ende bekannt
  assert.ok(ics.includes("DTSTART;TZID=Europe/Berlin:20261128T140000\r\nDTEND;TZID=Europe/Berlin:20261128T190000"));
});

test("iCal: Text maskiert und Faltung ohne geteilte Zeichen", () => {
  assert.equal(icsText("a,b;c\\d\ne"), "a\\,b\\;c\\\\d\\ne");
  const lang = `DESCRIPTION:${"ä".repeat(60)}`;
  const gefaltet = falte(lang);
  assert.equal(gefaltet.replace(/\r\n /g, ""), lang);
  for (const teil of gefaltet.split("\r\n")) assert.ok(Buffer.byteLength(teil, "utf8") <= 75);
});

test("JSON: Zeiten mit Offset, Adresse, Quelle, geprüft am", () => {
  const json = terminJson(KOPF, troedel, HEUTE);
  assert.equal(json.anzahl, troedel.length);
  const [erster] = json.termine;
  assert.equal(erster.beginn, "2026-11-07T07:00:00+01:00");
  assert.equal(erster.ende, "2026-11-07T14:00:00+01:00");
  assert.equal(erster.adresse.ort, "Krefeld");
  assert.ok(erster.quelle?.startsWith("https://"));
  assert.match(erster.geprueft_am, /^\d{4}-\d\d-\d\d$/);
  assert.match(json.hinweis, /Quellenangabe/);
  const sommer = terminJson(KOPF, [{ ...troedel[0], datum: "2027-07-03" }], HEUTE).termine[0];
  assert.equal(sommer.beginn, "2027-07-03T07:00:00+02:00");
});

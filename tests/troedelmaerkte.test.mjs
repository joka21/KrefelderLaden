// Aufruf: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  berlinZeit,
  fragen,
  kommendeMaerkte,
  kommendeTermine,
  nachMonat,
  REGELMAESSIG,
  REGELTERMIN_HINWEIS,
  sonntag,
  STATUS,
  TERMINE,
  TROEDEL_BESCHREIBUNG,
  TROEDEL_TITEL,
  troedelmaerkteSchema,
  uhrzeitText,
  wochenendTermine,
  ZEILEN,
} from "../lib/troedelmaerkte.ts";

const URL_SEITE = "https://example.org/troedelmarkt-krefeld/";
const HEUTE = "2026-11-06"; // Freitag, Tag der Recherche
const schema = (heute) => troedelmaerkteSchema({ "@graph": [{ "@id": `${URL_SEITE}#webpage` }] }, URL_SEITE, heute)["@graph"];
const events = (heute) => schema(heute).filter((node) => node["@type"] === "Event");
const antwort = (heute, anfang) => fragen(heute).find(({ frage }) => frage.startsWith(anfang)).antwort;
const zeileVon = (termin) => ZEILEN[termin.zeile - 2];

test("Länge von Title und Description", () => {
  assert.ok(TROEDEL_TITEL.length <= 60, TROEDEL_TITEL);
  assert.ok(TROEDEL_BESCHREIBUNG.length < 160, TROEDEL_BESCHREIBUNG);
});

test("jede Zeile mit Datum hat einen bekannten Status", () => {
  const bekannt = (status) =>
    Object.values(STATUS).includes(status) || /gelistet|bestätigt/u.test(status);
  for (const zeile of ZEILEN.filter(({ datum }) => datum)) {
    assert.ok(bekannt(zeile.status), `${zeile.titel} ${zeile.datum}: unbekannter Status „${zeile.status}“`);
  }
});

test("vergangene Termine werden ausgeblendet", () => {
  for (const heute of [HEUTE, "2026-12-01", "2027-03-06"]) {
    const kommende = kommendeTermine(heute);
    assert.ok(kommende.every(({ datum }) => datum >= heute), heute);
    assert.equal(kommende.length, TERMINE.filter(({ datum }) => datum >= heute).length, heute);
    assert.ok(events(heute).every(({ startDate }) => startDate.slice(0, 10) >= heute), heute);
    assert.ok(kommendeMaerkte(heute).every(({ termine }) => termine.every(({ datum }) => datum >= heute)), heute);
  }
  // Der heutige Termin bleibt sichtbar, der von gestern nicht.
  assert.ok(kommendeTermine("2026-11-07").some(({ datum }) => datum === "2026-11-07"));
  assert.ok(!kommendeTermine("2026-11-08").some(({ datum }) => datum === "2026-11-07"));
  assert.equal(kommendeTermine("2028-01-01").length, 0);
});

test("Quellenkonflikt und „Ort genannt“ erscheinen nirgends", () => {
  const konflikte = ZEILEN.filter(({ status }) => status === STATUS.konflikt);
  assert.ok(konflikte.length > 0, "Testdaten ohne Quellenkonflikt");
  for (const zeile of konflikte) {
    assert.ok(!TERMINE.some((termin) => zeileVon(termin) === zeile), `${zeile.titel} ${zeile.datum}`);
  }
  const ortGenannt = ZEILEN.filter(({ status }) => status === STATUS.ortGenannt).map(({ titel }) => titel);
  assert.ok(ortGenannt.length > 0);
  for (const titel of ortGenannt) {
    assert.ok(!REGELMAESSIG.some(({ markt }) => markt === titel), titel);
    assert.ok(!TERMINE.some(({ markt }) => markt === titel), titel);
  }
  // Kein Event und keine FAQ-Antwort am Tag eines Konflikts nennt den Markt.
  for (const zeile of konflikte) {
    const tag = events(zeile.datum).filter(({ startDate }) => startDate.startsWith(zeile.datum));
    assert.ok(!tag.some(({ name }) => name === zeile.titel), zeile.titel);
    assert.ok(!antwort(zeile.datum, "Welcher").includes(zeile.titel), zeile.titel);
  }
});

test("ohne Datum nur unter „Regelmäßige Märkte“, auch mit „bestätigt“ im Status", () => {
  const ohneDatum = ZEILEN.filter(({ datum, status }) => !datum && status !== STATUS.ortGenannt);
  assert.deepEqual(
    REGELMAESSIG.map(({ markt }) => markt),
    ohneDatum.map(({ titel }) => titel),
  );
  assert.ok(TERMINE.every(({ datum }) => /^\d{4}-\d\d-\d\d$/.test(datum)));
});

test("Regeltermine sind gekennzeichnet und nicht im JSON-LD", () => {
  const regel = TERMINE.filter(({ art }) => art === "regeltermin");
  assert.ok(regel.length > 0);
  assert.ok(regel.every((termin) => zeileVon(termin).status === STATUS.regeltermin));
  assert.equal(REGELTERMIN_HINWEIS, "Regeltermin – bitte vorher prüfen");
  // Ein Regeltermin am heutigen Tag trägt den Hinweis auch in der FAQ.
  assert.ok(antwort(regel[0].datum, "Welcher").includes(REGELTERMIN_HINWEIS));

  const ids = new Set(events(HEUTE).map((event) => event["@id"]));
  for (const termin of TERMINE.filter(({ art }) => art !== "normal")) {
    assert.ok(!ids.has(`${URL_SEITE}#termin-${termin.zeile}`), `${termin.markt} ${termin.datum}`);
  }
  assert.equal(ids.size, kommendeTermine(HEUTE).filter(({ art }) => art === "normal").length);
});

test("„Uhrzeit prüfen“: Beginn, Ende noch offen, nicht im JSON-LD", () => {
  const offen = TERMINE.filter(({ art }) => art === "uhrzeitOffen");
  assert.ok(offen.length > 0);
  for (const termin of offen) {
    assert.equal(uhrzeitText(termin), `ab ${Number(termin.beginn.split(":")[0])} Uhr, Ende noch offen`);
  }
  assert.equal(uhrzeitText({ beginn: "07:00", ende: "14:00", art: "normal" }), "7 bis 14 Uhr");
  assert.equal(uhrzeitText({ beginn: "11:30", ende: "", art: "normal" }), "ab 11:30 Uhr");
});

test("Heute und dieses Wochenende: bis Sonntag in Europe/Berlin", () => {
  assert.equal(sonntag("2026-11-06"), "2026-11-08");
  assert.equal(sonntag("2026-11-08"), "2026-11-08");
  assert.equal(sonntag("2026-11-09"), "2026-11-15");
  assert.deepEqual(
    wochenendTermine(HEUTE).map(({ datum, markt }) => `${datum} ${markt}`),
    [
      "2026-11-07 Samstags-Trödelmarkt Grotenburg",
      "2026-11-07 Bücherbasar Freunde der Linner Museen",
      "2026-11-08 Bücherbasar Freunde der Linner Museen",
      "2026-11-08 Trödelmarkt Kaufland Mevissenstraße",
    ],
  );
  assert.deepEqual(wochenendTermine("2027-12-01"), []);
});

test("Alle Termine: chronologisch und nach Monaten", () => {
  const kommende = kommendeTermine(HEUTE);
  assert.deepEqual(
    kommende.map(({ datum }) => datum),
    kommende.map(({ datum }) => datum).toSorted(),
  );
  const monate = nachMonat(kommende);
  assert.equal(monate[0].monat, "November 2026");
  assert.equal(monate.flatMap(({ termine }) => termine).length, kommende.length);
  assert.equal(new Set(monate.map(({ monat }) => monat)).size, monate.length);
});

test("Globus mit Zusatz „ehemals real“", () => {
  const globus = TERMINE.filter(({ markt }) => markt === "Trödelmarkt Globus Krefeld");
  assert.ok(globus.length > 0 && globus.every(({ ort }) => ort === "Globus Krefeld (ehemals real)"));
  assert.ok(antwort(HEUTE, "Wo ist").includes("Globus Krefeld (ehemals real), Hafelsstraße 200"));
});

test("Zeiten in den FAQ-Antworten passen zu den Daten", () => {
  for (const heute of [HEUTE, "2026-11-07", "2026-12-13", "2027-03-05"]) {
    const heutige = kommendeTermine(heute).filter(({ datum }) => datum === heute);
    const naechsterTag = kommendeTermine(heute)[0]?.datum;
    const genannt = heutige.length > 0 ? heutige : kommendeTermine(heute).filter(({ datum }) => datum === naechsterTag);
    const text = antwort(heute, "Welcher");
    for (const termin of genannt) {
      assert.ok(text.includes(`${termin.markt} (${termin.ort}, ${uhrzeitText(termin)}`), `${heute}: ${termin.markt}`);
    }

    const globus = kommendeTermine(heute).filter(({ markt }) => markt === "Trödelmarkt Globus Krefeld");
    const textGlobus = antwort(heute, "Wo ist");
    for (const termin of globus) {
      assert.equal(`${termin.beginn}-${termin.ende}`, "11:00-18:00");
    }
    if (globus.length > 0) assert.ok(textGlobus.includes("von 11 bis 18 Uhr"), textGlobus);

    const samstage = kommendeTermine(heute).filter(({ markt }) => markt === "Samstags-Trödelmarkt Grotenburg");
    const textGrotenburg = antwort(heute, "Wann ist");
    assert.ok(samstage.every(({ beginn, ende }) => beginn === "07:00" && ende === "14:00"));
    if (samstage.length > 0) assert.ok(textGrotenburg.includes("samstags von 7 bis 14 Uhr"), textGrotenburg);
    const afterWork = kommendeTermine(heute).filter(({ markt }) => markt === "AFTER-WORK Flohmarkt Grotenburg");
    if (afterWork.length > 0) assert.ok(textGrotenburg.includes(`jeweils ${uhrzeitText(afterWork[0])}`), textGrotenburg);

    // Keine Uhrzeit in den Antworten, die nicht in den Daten vorkommt.
    const bekannt = new Set(TERMINE.map(uhrzeitText));
    for (const { antwort: text } of fragen(heute)) {
      for (const treffer of text.match(/(ab )?\d{1,2}(:\d\d)?( bis \d{1,2}(:\d\d)?)? Uhr(, Ende noch offen)?/gu) ?? []) {
        assert.ok([...bekannt].some((zeit) => zeit.includes(treffer)), `${heute}: „${treffer}“ nicht in den Daten`);
      }
    }
  }
});

test("Eintritt in der FAQ nur aus den Daten", () => {
  const text = antwort(HEUTE, "Kostet");
  const maerkte = kommendeMaerkte(HEUTE);
  const frei = maerkte.filter(({ naechster }) => naechster.eintritt === "frei").length;
  assert.ok(text.includes(`Bei ${frei} von ${maerkte.length} Märkten`), text);
  for (const { markt, naechster } of maerkte.filter(({ naechster }) => naechster.eintritt && naechster.eintritt !== "frei")) {
    assert.ok(text.includes(`${markt} steht in unseren Daten: ${naechster.eintritt}`), markt);
  }
});

test("JSON-LD: Pflichtfelder, Zeitzone und FAQPage", () => {
  const graph = schema(HEUTE);
  for (const event of graph.filter((node) => node["@type"] === "Event")) {
    assert.ok(event.name);
    assert.match(event.startDate, /^20\d\d-\d\d-\d\dT\d\d:\d\d:00\+0[12]:00$/, event.name);
    assert.equal(event.location["@type"], "Place");
    assert.equal(event.location.address.addressLocality, "Krefeld");
    assert.equal(event.url, URL_SEITE);
  }
  assert.equal(berlinZeit("2026-11-07", "07:00"), "2026-11-07T07:00:00+01:00");
  assert.equal(berlinZeit("2027-04-10", "07:00"), "2027-04-10T07:00:00+02:00");
  const faq = graph.find((node) => node["@type"] === "FAQPage");
  assert.equal(faq.mainEntity.length, 4);
  assert.equal(new Set(graph.map((node) => node["@id"]).filter(Boolean)).size, graph.filter((node) => node["@id"]).length);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(graph)));
});

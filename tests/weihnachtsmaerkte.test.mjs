// Aufruf: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ALTE_PFADE,
  datumKurz,
  EINLEITUNG,
  FRAGEN,
  MAERKTE,
  MAERKTE_PATH,
  STAND,
  tagMonat,
  wannText,
  weihnachtsmaerkteSchema,
} from "../lib/weihnachtsmaerkte.ts";

test("keine Weiterleitungskette: Hauptseite ist keine alte Adresse", () => {
  assert.ok(!ALTE_PFADE.includes(MAERKTE_PATH));
});

const URL_SEITE = "https://example.org/weihnachtsmaerkte-in-krefeld/";
const { "@graph": graph } = weihnachtsmaerkteSchema({ "@graph": [{ "@id": `${URL_SEITE}#webpage` }] }, URL_SEITE);
const events = graph.filter((node) => node["@type"] === "Event");

test("je Markt ein Event: Datum ohne Uhrzeit, Enddatum nur bei mehrtägigen Märkten", () => {
  assert.equal(events.length, 11);
  assert.equal(events.length, MAERKTE.length);
  for (const event of events) {
    assert.match(event.startDate, /^2026-\d\d-\d\d$/, event.name);
    if ("endDate" in event) {
      assert.match(event.endDate, /^2026-\d\d-\d\d$/, event.name);
      assert.ok(event.startDate < event.endDate, event.name);
    }
  }
});

test("Pflichtfelder und Status je Event", () => {
  for (const event of events) {
    assert.ok(event.name, "name");
    assert.equal(event.location["@type"], "Place", event.name);
    assert.ok(event.location.name, event.name);
    assert.equal(event.location.address["@type"], "PostalAddress", event.name);
    assert.equal(event.location.address.addressLocality, "Krefeld", event.name);
    assert.equal(event.location.address.addressCountry, "DE", event.name);
    assert.equal(event.eventStatus, "https://schema.org/EventScheduled", event.name);
    assert.equal(event.eventAttendanceMode, "https://schema.org/OfflineEventAttendanceMode", event.name);
    assert.equal(event.url, URL_SEITE, event.name);
  }
});

test("Beschreibung: ein Satz aus dem Seitentext, ohne Uhrzeit", () => {
  MAERKTE.forEach((markt, index) => {
    const { description } = events[index];
    if (description === undefined) {
      assert.match(markt.text.split(". ")[0], /\d Uhr/, `${markt.name}: nur wegen einer Uhrzeit ohne Beschreibung`);
      return;
    }
    assert.ok(markt.text.startsWith(description), markt.name);
    assert.ok(!/[.!?]\s/.test(description), `${markt.name}: mehr als ein Satz`);
    assert.ok(!/\d Uhr/.test(description), `${markt.name}: Uhrzeit`);
  });
});

test("freier Eintritt nur, wo bestätigt; Veranstalter nur, wo sichtbar", () => {
  assert.deepEqual(
    events.filter((event) => "isAccessibleForFree" in event).map((event) => event.name),
    ["Funkelnde Sterne in Oppum"],
  );
  assert.equal(events.filter((event) => "organizer" in event).length, MAERKTE.filter((markt) => markt.veranstalter).length);
});

test("dateModified und FAQPage im Graph", () => {
  assert.equal(graph[0].dateModified, STAND.iso);
  const faq = graph.find((node) => node["@type"] === "FAQPage");
  assert.equal(faq.mainEntity.length, FRAGEN.length);
});

test("Tabelle: Datum aus start und ende", () => {
  assert.equal(datumKurz({ start: "2026-11-21" }), "Sa 21.11.");
  assert.equal(datumKurz({ start: "2026-11-20", ende: "2026-11-21" }), "Fr 20. + Sa 21.11.");
  assert.equal(datumKurz({ start: "2026-12-04", ende: "2026-12-06" }), "Fr 4. – So 6.12.");
  assert.equal(datumKurz({ start: "2026-11-26", ende: "2026-12-23" }), "26.11. – 23.12.");
});

test("Terminzeile: aus start, ende und den Uhrzeiten", () => {
  assert.equal(wannText({ start: "2026-11-21", zeitErsterTag: "ab 14 Uhr" }), "Samstag, 21. November, ab 14 Uhr");
  assert.equal(wannText({ start: "2026-11-21" }), "Samstag, 21. November (Uhrzeit folgt)");
  assert.equal(
    wannText({ start: "2026-11-20", ende: "2026-11-21", zeitErsterTag: "15 bis 19 Uhr" }),
    "Freitag, 20. November, 15 bis 19 Uhr, und Samstag, 21. November (Uhrzeit folgt)",
  );
  assert.equal(
    wannText({ start: "2026-12-12", ende: "2026-12-13", zeitLetzterTag: "13 bis 22 Uhr" }),
    "Samstag, 12. Dezember (Uhrzeit folgt) und Sonntag, 13. Dezember, 13 bis 22 Uhr",
  );
  assert.equal(wannText({ start: "2026-11-28", ende: "2026-11-29" }), "Samstag, 28. und Sonntag, 29. November (Uhrzeit folgt)");
  assert.equal(wannText({ start: "2026-12-04", ende: "2026-12-06" }), "Freitag, 4. bis Sonntag, 6. Dezember (Uhrzeit folgt)");
  assert.equal(wannText({ start: "2026-11-26", ende: "2026-12-23", uhrzeit: "13 bis 20 Uhr" }), "26. November bis 23. Dezember");
});

/** Märkte in der Innenstadt und der Markt mit diesem Namensanfang, für die Texte von Hand. */
const innenstadt = MAERKTE.filter((markt) => markt.stadtteil === "Innenstadt");
const markt = (anfang) => {
  const gefunden = MAERKTE.find(({ name }) => name.startsWith(anfang));
  assert.ok(gefunden, anfang);
  return gefunden;
};
const antwort = (anfang) => FRAGEN.find(({ frage }) => frage.startsWith(anfang)).antwort;

test("Einleitung passt zu den Terminen", () => {
  const erster = MAERKTE.map(({ start }) => start).sort()[0];
  const ersterInnenstadt = innenstadt.map(({ start }) => start).sort()[0];
  const letzterInnenstadt = innenstadt.map(({ start, ende }) => ende ?? start).sort().at(-1);

  assert.ok(EINLEITUNG.includes(`starten am ${tagMonat(erster)} in den Stadtteilen`), EINLEITUNG);
  assert.ok(EINLEITUNG.includes(`Innenstadt folgt am ${tagMonat(ersterInnenstadt)}`), EINLEITUNG);
  assert.ok(EINLEITUNG.includes(`bis ${tagMonat(letzterInnenstadt)}`), EINLEITUNG);
});

test("FAQ passt zu den Terminen", () => {
  const beginn = antwort("Wann beginnt");
  assert.equal(markt("MIKS").start, markt("Crefelder").start);
  assert.ok(beginn.includes(`MIKS und der Crefelder Weihnachtsmarkt am ${tagMonat(markt("MIKS").start)}`), beginn);
  assert.ok(beginn.includes(`Bruckhausen am ${tagMonat(markt("Wintermarkt").start)}`), beginn);
  assert.ok(beginn.includes(`Oppum am ${tagMonat(markt("Funkelnde").start)}`), beginn);

  const dauer = antwort("Wie lange");
  assert.equal(markt("MIKS").ende, markt("Crefelder").ende);
  assert.ok(dauer.includes(`bis ${tagMonat(markt("MIKS").ende)}`), dauer);
});

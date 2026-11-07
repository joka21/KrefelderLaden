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
  marktAnker,
  STAND,
  tagMonat,
  wannText,
  weihnachtsmaerkteSchema,
  zeitspanne,
} from "../lib/weihnachtsmaerkte.ts";

test("keine Weiterleitungskette: Hauptseite ist keine alte Adresse", () => {
  assert.ok(!ALTE_PFADE.includes(MAERKTE_PATH));
});

const URL_SEITE = "https://example.org/weihnachtsmaerkte-in-krefeld/";
const BILD = "https://example.org/otto.webp";
const { "@graph": graph } = weihnachtsmaerkteSchema({ "@graph": [{ "@id": `${URL_SEITE}#webpage` }] }, URL_SEITE, BILD);
const events = graph.filter((node) => node["@type"] === "Event");

const DATUM_ODER_ZEIT = /^2026-\d\d-\d\d(T\d\d:\d\d:00\+01:00)?$/;

test("je Markt ein Event: Datum, Uhrzeit mit Offset nur aus den Zeitangaben", () => {
  assert.equal(events.length, 11);
  assert.equal(events.length, MAERKTE.length);
  MAERKTE.forEach((markt, index) => {
    const event = events[index];
    assert.match(event.startDate, DATUM_ODER_ZEIT, event.name);
    assert.ok(event.startDate.startsWith(markt.start), event.name);
    if ("endDate" in event) {
      assert.match(event.endDate, DATUM_ODER_ZEIT, event.name);
      assert.ok(event.endDate.startsWith(markt.ende ?? markt.start), event.name);
      assert.ok(event.startDate < event.endDate, event.name);
    } else {
      assert.equal(markt.ende, undefined, event.name);
    }
  });
});

test("Uhrzeiten im Schema genau dort, wo die Daten sie nennen", () => {
  const zeiten = Object.fromEntries(events.map((event) => [event.name, [event.startDate, event.endDate]]));
  assert.deepEqual(zeiten["Wintermarkt An Bruckhausen"], ["2026-11-20T15:00:00+01:00", "2026-11-21"]);
  assert.deepEqual(zeiten["Funkelnde Sterne in Oppum"], ["2026-11-21T14:00:00+01:00", undefined]);
  assert.deepEqual(zeiten["Weihnachtsmarkt auf dem Schinkenplatz"], ["2026-11-28T14:00:00+01:00", "2026-11-28T19:00:00+01:00"]);
  assert.deepEqual(zeiten["Der besondere Weihnachtsmarkt"], ["2026-12-05T10:00:00+01:00", "2026-12-05T18:00:00+01:00"]);
  assert.deepEqual(zeiten["WeihnachtsBubbelmaat Hüls"], ["2026-12-12", "2026-12-13T22:00:00+01:00"]);
  assert.deepEqual(zeiten["Linner Weihnachtsmarkt"], ["2026-12-04", "2026-12-06"]);
});

test("zeitspanne: nur eindeutige Angaben", () => {
  assert.deepEqual(zeitspanne("15 bis 19 Uhr"), { von: "15:00", bis: "19:00" });
  assert.deepEqual(zeitspanne("11:30 bis 21 Uhr"), { von: "11:30", bis: "21:00" });
  assert.deepEqual(zeitspanne("ab 14 Uhr"), { von: "14:00" });
  assert.deepEqual(zeitspanne("wird vom Veranstalter noch veröffentlicht"), {});
  assert.deepEqual(zeitspanne("sonntags bis dienstags 13 bis 20 Uhr"), {});
  assert.deepEqual(zeitspanne(undefined), {});
});

test("Bild, Sprungmarke und Website", () => {
  MAERKTE.forEach((markt, index) => {
    assert.equal(events[index].image, BILD, markt.name);
    assert.equal(events[index].url, `${URL_SEITE}#${marktAnker(markt)}`, markt.name);
    assert.equal(events[index].sameAs, markt.website, markt.name);
  });
  const anker = MAERKTE.map(marktAnker);
  assert.equal(new Set(anker).size, anker.length, "Sprungmarken eindeutig");
  assert.equal(marktAnker({ name: "WeihnachtsBubbelmaat Hüls" }), "markt-weihnachtsbubbelmaat-huels");
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
    assert.ok(event.url.startsWith(`${URL_SEITE}#markt-`), event.name);
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

test("FAQ Öffnungszeiten passt zu den Marktdaten", () => {
  const zeiten = antwort("Wie sind die Öffnungszeiten");
  const zeitenVon = ({ zeitErsterTag, zeitLetzterTag, uhrzeit }) => [zeitErsterTag, zeitLetzterTag, uhrzeit].join(" ");
  const erwartet = [
    ["MIKS", ["13 bis 20 Uhr", "11:30 bis 21 Uhr"]],
    ["Der besondere", ["10 bis 18 Uhr"]],
    ["Weihnachtsmarkt auf dem Schinkenplatz", ["14 bis 19 Uhr"]],
  ];
  for (const [anfang, spannen] of erwartet) {
    for (const spanne of spannen) {
      assert.ok(zeitenVon(markt(anfang)).includes(spanne), `${anfang}: ${spanne} nicht in den Marktdaten`);
      assert.ok(zeiten.includes(spanne), `${anfang}: ${spanne} nicht in der Antwort`);
    }
  }
  // Keine Zeit in der Antwort, die oben nicht geprüft wird.
  const genannt = zeiten.match(/\d{1,2}(:\d\d)? bis \d{1,2}(:\d\d)? Uhr/g);
  assert.deepEqual(genannt.toSorted(), erwartet.flatMap(([, spannen]) => spannen).toSorted());
  // „stehen die Zeiten noch aus“: Der Crefelder Weihnachtsmarkt hat noch keine Uhrzeit.
  assert.ok(!/\d Uhr/.test(zeitenVon(markt("Crefelder"))), "Crefelder Weihnachtsmarkt hat inzwischen eine Uhrzeit");
});

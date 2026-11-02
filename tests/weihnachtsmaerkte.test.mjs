// Aufruf: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { FRAGEN, MAERKTE, STAND, weihnachtsmaerkteSchema } from "../lib/weihnachtsmaerkte.ts";

const URL_SEITE = "https://example.org/weihnachten/";
const { "@graph": graph } = weihnachtsmaerkteSchema({ "@graph": [{ "@id": `${URL_SEITE}#webpage` }] }, URL_SEITE);
const events = graph.filter((node) => node["@type"] === "Event");

test("je Markt ein Event mit Datum in richtiger Reihenfolge", () => {
  assert.equal(events.length, 11);
  assert.equal(events.length, MAERKTE.length);
  for (const event of events) {
    assert.match(event.startDate, /^2026-\d\d-\d\d(T\d\d:\d\d:00\+01:00)?$/, event.name);
    assert.match(event.endDate, /^2026-\d\d-\d\d(T\d\d:\d\d:00\+01:00)?$/, event.name);
    assert.ok(event.startDate.slice(0, 10) <= event.endDate.slice(0, 10), event.name);
  }
});

test("Uhrzeiten im Schema stehen auch im Text", () => {
  MAERKTE.forEach((markt) => {
    const sichtbar = `${markt.wann} ${markt.uhrzeit ?? ""}`;
    for (const datum of [markt.start, markt.ende]) {
      const zeit = datum.match(/T(\d\d):(\d\d)/);
      if (zeit) {
        const text = zeit[2] === "00" ? String(Number(zeit[1])) : `${zeit[1]}:${zeit[2]}`;
        assert.ok(sichtbar.includes(text), `${markt.name}: ${text}`);
      }
    }
  });
});

test("freier Eintritt nur, wo bestätigt; Veranstalter nur, wo bekannt", () => {
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

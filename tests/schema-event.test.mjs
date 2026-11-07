// Aufruf: npm test – Event-Baustein (lib/schema/event.ts).
import assert from "node:assert/strict";
import { test } from "node:test";

import { eventSchema } from "../lib/schema/event.ts";

const basis = { id: "x#1", name: "Markt", datum: "2026-11-07", url: "https://x/", ort: { name: "Platz" } };

test("Status: geplant, abgesagt, verschoben", () => {
  assert.equal(eventSchema(basis).eventStatus, "https://schema.org/EventScheduled");
  assert.equal(eventSchema({ ...basis, status: "abgesagt" }).eventStatus, "https://schema.org/EventCancelled");
  assert.equal(eventSchema({ ...basis, status: "verschoben" }).eventStatus, "https://schema.org/EventPostponed");
});

test("nur vorhandene Felder; geo nur mit beiden Koordinaten", () => {
  const event = eventSchema(basis);
  for (const feld of ["endDate", "organizer", "image", "sameAs", "description", "isAccessibleForFree"]) {
    assert.ok(!(feld in event), feld);
  }
  assert.ok(!("geo" in eventSchema({ ...basis, ort: { name: "P", lat: "51.3" } }).location));
  assert.deepEqual(eventSchema({ ...basis, ort: { name: "P", lat: "51.3", lon: "6.5" } }).location.geo, {
    "@type": "GeoCoordinates",
    latitude: 51.3,
    longitude: 6.5,
  });
});

test("Zeiten: Offset, Ende am letzten Tag, Veranstalter mit URL", () => {
  const event = eventSchema({
    ...basis,
    beginn: "10:00",
    bisDatum: "2026-11-08",
    ende: "18:00",
    veranstalter: { name: "Verein", url: "https://verein.de" },
  });
  assert.equal(event.startDate, "2026-11-07T10:00:00+01:00");
  assert.equal(event.endDate, "2026-11-08T18:00:00+01:00");
  assert.deepEqual(event.organizer, { "@type": "Organization", name: "Verein", url: "https://verein.de" });
});

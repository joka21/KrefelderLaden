// Aufruf: npm test (Node 22, --experimental-strip-types für den TypeScript-Import)
import assert from "node:assert/strict";
import { test } from "node:test";

import { fitTitle } from "../lib/titles.ts";

const site = (name) => `${name} – Krefelder Laden`;

test("Kurzer Titel bleibt mit Zusatz", () => {
  assert.equal(fitTitle(site("Kagawa"), "Kagawa"), "Kagawa – Krefelder Laden");
});

test("Zu langer Titel: Zusatz fällt weg, wenn der Name passt", () => {
  const name = "Freiwilligenzentrum Krefeld (Caritasverband Krefeld)";
  assert.equal(fitTitle(site(name), name), name);
});

test("Zu langer Name: am Wortende gekürzt, offene Klammer fällt weg", () => {
  const name = "Bahnhofsmission am Krefelder Hauptbahnhof (Diakonisches Werk Krefeld-Viersen)";
  assert.equal(fitTitle(site(name), name), "Bahnhofsmission am Krefelder Hauptbahnhof");
});

test("Zu langer Name ohne Klammer: am Wortende ohne Satzzeichen am Ende", () => {
  const name = "Arbeiter-Samariter-Bund Region Düsseldorf e. V., Dienststelle Krefeld und Umgebung";
  const short = fitTitle(site(name), name);
  assert.equal(short, "Arbeiter-Samariter-Bund Region Düsseldorf e. V.");
  assert.ok(short.length <= 60);
});

test("Genau 60 Zeichen bleiben unverändert", () => {
  const full = "x".repeat(60);
  assert.equal(fitTitle(full, "x"), full);
});

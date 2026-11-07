// Aufruf: npm test – Alt-Texte für Bilder aus WordPress (lib/alt.ts).
import assert from "node:assert/strict";
import { test } from "node:test";

import { altText } from "../lib/alt.ts";

test("Alt-Text aus der Mediathek bleibt", () => {
  assert.equal(altText("Blumenkohl im Ofen", "Ganzer Blumenkohl"), "Blumenkohl im Ofen");
});

test("ohne Alt-Text: Titel – Krefelder Laden", () => {
  assert.equal(altText("", "Rheinische Bratkartoffeln"), "Rheinische Bratkartoffeln – Krefelder Laden");
  assert.equal(altText("   ", "A"), "A – Krefelder Laden");
  assert.equal(altText(null, "Kaffee &amp; Kuchen"), "Kaffee & Kuchen – Krefelder Laden");
});

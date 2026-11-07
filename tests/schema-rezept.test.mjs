// Aufruf: npm test – Recipe aus dem Beitragsinhalt (lib/schema/rezept.ts).
import assert from "node:assert/strict";
import { test } from "node:test";

import { dauer, rezeptAusHtml, rezeptSchema, zeitUndPortionen } from "../lib/schema/rezept.ts";

/** Aufbau wie die Rezepte in „Niederrhein Tapas“, ohne die Zeile mit Zeit und Portionen. */
const OHNE_ANGABE = `
<p>Blumenkohl mit heller Sauce kennt jeder von früher.</p>
<h2 class="wp-block-heading">Zutaten</h2>
<ul class="wp-block-list"><li>1 Blumenkohl</li></ul>
<h2 class="wp-block-heading">Zubereitung</h2>
<ol class="wp-block-list"><li>Garen.</li></ol>`;

/** Mit der festen Zeile oben im Beitrag. */
const REZEPT = `
<p>Zeit: 25 Minuten · Portionen: 2</p>
<p>Blumenkohl mit heller Sauce kennt jeder von früher.</p>
<h2 class="wp-block-heading">Zutaten</h2>
<ul class="wp-block-list"><li>1 kleiner Blumenkohl (etwa 600 g)</li><li>20 g   Butter</li></ul>
<h2 class="wp-block-heading">Zubereitung</h2>
<ol class="wp-block-list"><li>Ofen auf 200 °C vorheizen.</li><li>Alles <strong>überbacken</strong>.</li></ol>
<p>Unser Tipp: Statt Förmchen geht auch eine Auflaufform.</p>`;

const DATEN = {
  pageUrl: "https://krefelder-laden.de/ratgeber/blumenkohlgratin-mit-senf/",
  home: "https://krefelder-laden.de/",
  name: "Blumenkohlgratin mit Senf",
  html: REZEPT,
  bild: "https://krefelder-laden.de/wp-content/uploads/gratin.webp",
  beschreibung: "Blumenkohl, frecher als früher.",
  datum: "2026-10-20T10:00:00+00:00",
};

test("Zutaten und Schritte aus den Listen nach den Überschriften", () => {
  assert.deepEqual(rezeptAusHtml(REZEPT), {
    zutaten: ["1 kleiner Blumenkohl (etwa 600 g)", "20 g Butter"],
    schritte: ["Ofen auf 200 °C vorheizen.", "Alles überbacken."],
    zeit: "PT25M",
    portionen: 2,
  });
});

test("Zeit und Portionen aus der Zeile „Zeit: … · Portionen: …“", () => {
  assert.deepEqual(zeitUndPortionen("Zeit: 25 Minuten · Portionen: 2"), { zeit: "PT25M", portionen: 2 });
  assert.deepEqual(zeitUndPortionen("Portionen: 4 · Zeit: 1 Stunde 30 Minuten"), { zeit: "PT1H30M", portionen: 4 });
  assert.deepEqual(zeitUndPortionen("Zeit: 2 Stunden"), { zeit: "PT2H" });
  assert.deepEqual(zeitUndPortionen("Zeit: etwa eine halbe Stunde · Portionen: zwei"), {});
  assert.equal(dauer("45 Min."), "PT45M");
  assert.equal(dauer("bald"), undefined);
});

test("ohne die Zeile keine Zeit und keine Portionen", () => {
  const teile = rezeptAusHtml(OHNE_ANGABE);
  assert.ok(teile);
  assert.ok(!("zeit" in teile) && !("portionen" in teile));
});

test("kein Rezept ohne beide Abschnitte oder mit fremder Liste dazwischen", () => {
  assert.equal(rezeptAusHtml("<h2>Zutaten</h2><ul><li>Mehl</li></ul>"), null);
  assert.equal(rezeptAusHtml("<p>Nur Text.</p>"), null);
  assert.equal(rezeptAusHtml(""), null);
  // Liste gehört zur nächsten Überschrift, nicht zu „Zutaten“.
  assert.equal(rezeptAusHtml("<h2>Zutaten</h2><p>siehe unten</p><h2>Anderes</h2><ul><li>x</li></ul><h2>Zubereitung</h2><ol><li>y</li></ol>"), null);
});

test("Recipe nur mit Bild; Zeit und Portionen aus der Zeile", () => {
  assert.equal(rezeptSchema({ ...DATEN, bild: null }), null);
  const rezept = rezeptSchema(DATEN);
  assert.equal(rezept["@type"], "Recipe");
  assert.deepEqual(rezept.image, [DATEN.bild]);
  assert.equal(rezept.recipeIngredient.length, 2);
  assert.deepEqual(rezept.recipeInstructions[1], { "@type": "HowToStep", position: 2, text: "Alles überbacken." });
  assert.deepEqual(rezept.author, { "@id": "https://krefelder-laden.de/#organization" });
  assert.equal(rezept.totalTime, "PT25M");
  assert.equal(rezept.recipeYield, "2 Portionen");
  for (const feld of ["prepTime", "cookTime"]) {
    assert.ok(!(feld in rezept), feld);
  }
  const ohne = rezeptSchema({ ...DATEN, html: OHNE_ANGABE });
  assert.ok(!("totalTime" in ohne) && !("recipeYield" in ohne));
});

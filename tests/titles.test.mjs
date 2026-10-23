// Aufruf: npm test (Node 22, --experimental-strip-types für den TypeScript-Import)
import assert from "node:assert/strict";
import { test } from "node:test";

import { fitTitle, titleVariants } from "../lib/titles.ts";

const fit = (name) => fitTitle(name, "Krefelder Laden");

/** Für alle Fälle: höchstens 60 Zeichen, nie gleich dem Namen (H1). */
function assertValid(name, title) {
  assert.ok(title.length <= 60, `${title} (${title.length})`);
  assert.notEqual(title, name);
}

test("Stufe 1: kurzer Name bleibt mit Zusatz", () => {
  assert.equal(fit("Altenheim St. Josef"), "Altenheim St. Josef – Krefelder Laden");
});

test("Stufe 1: genau 60 Zeichen bleiben unverändert", () => {
  const name = "Medimobil-Wohngemeinschaft Vom-Bruck-Platz";
  assert.equal(fit(name), `${name} – Krefelder Laden`);
  assert.equal(fit(name).length, 60);
});

test("Stufe 2: Klammerzusatz am Ende fällt weg", () => {
  const name = "Caritas-Service (Caritasverband für die Region Krefeld e.V.)";
  assert.equal(fit(name), "Caritas-Service – Krefelder Laden");
  assertValid(name, fit(name));
});

test("Stufe 2: Zusatz nach Komma fällt weg", () => {
  const name = "Altenheim am Tiergarten, Günter-Böhringer-Haus";
  assert.equal(fit(name), "Altenheim am Tiergarten – Krefelder Laden");
});

test("Stufe 2: Zusatz nach „ - “ fällt weg", () => {
  const name = "Deutsches Rotes Kreuz (DRK) - Kreisverband Krefeld e.V.";
  assert.equal(fit(name), "Deutsches Rotes Kreuz (DRK) – Krefelder Laden");
});

test("Stufe 2: Rechtsform am Ende fällt weg", () => {
  const name = "Evangelische Jugend- und Familienhilfe gGmbH";
  assert.equal(fit(name), "Evangelische Jugend- und Familienhilfe – Krefelder Laden");
});

test("Stufe 2: Rechtsform mitten im Namen fällt weg, ohne doppelte Leerzeichen", () => {
  const name = "Sozialdienst katholischer Frauen e.V. Krefeld (SkF)";
  assert.equal(fit(name), "Sozialdienst katholischer Frauen Krefeld – Krefelder Laden");
});

test("Stufe 2: Rechtsform mitten im Namen und Zusatz nach „/“ fallen weg", () => {
  const name = "Solidaritätshaus e.V. Krefeld/Krefeld Dayanışma Derneği";
  assert.equal(fit(name), "Solidaritätshaus Krefeld – Krefelder Laden");
});

test("Stufe 2: Rechtsform vor Klammer und Komma, kein Leerzeichen vor dem Komma", () => {
  assert.deepEqual(titleVariants("Johanniter-Unfall-Hilfe e.V. (JUH), Dienststelle Krefeld"), [
    "Johanniter-Unfall-Hilfe (JUH), Dienststelle Krefeld",
    "Johanniter-Unfall-Hilfe (JUH)",
    "Johanniter-Unfall-Hilfe",
  ]);
});

test("Stufe 2: „Krefeld“ am Ende fällt weg", () => {
  const name = "Förderverein zugunsten krebskranker Kinder Krefeld e.V.";
  assert.equal(fit(name), "Förderverein zugunsten krebskranker Kinder – Krefelder Laden");
});

test("Stufe 2: Zusatz nach Doppelpunkt fällt weg (Ratgeber)", () => {
  const name = "Krefeld und seine Geschichte: Von den Römern zur Samt- und Seidenstadt";
  assert.equal(fit(name), "Krefeld und seine Geschichte – Krefelder Laden");
});

test("Stufe 2: zu kurze Formen werden übersprungen", () => {
  assert.ok(!titleVariants("SKM - Katholischer Verein für soziale Dienste in Krefeld").includes("SKM"));
});

test("Stufe 3: ohne kürzere Form „ – Krefeld“ statt des Site-Namens", () => {
  const name = "Belia Hausgemeinschaften Alte Seidenweberei";
  assert.equal(fit(name), "Belia Hausgemeinschaften Alte Seidenweberei – Krefeld");
});

test("Stufe 3: gekürzte Form mit „ – Krefeld“", () => {
  const name = "SKM - Katholischer Verein für soziale Dienste in Krefeld";
  assert.equal(fit(name), "SKM - Katholischer Verein für soziale Dienste – Krefeld");
});

test("Stufe 4: am Wortende gekürzt, offene Klammer und Satzzeichen fallen weg", () => {
  const name = "Arbeitsgemeinschaft der Wohlfahrtsverbände und Beratungsstellen Krefeld (Netzwerk)";
  const title = fit(name);
  assert.equal(title, "Arbeitsgemeinschaft der Wohlfahrtsverbände – Krefelder Laden");
  assertValid(name, title);
});

test("Eigener Trenner aus den Einstellungen", () => {
  assert.equal(fitTitle("Together Krefeld", "Krefelder Laden", { separator: "|" }), "Together Krefeld | Krefelder Laden");
});
